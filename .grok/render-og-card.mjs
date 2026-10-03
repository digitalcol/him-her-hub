import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const font = (file) =>
  readFileSync(`/workspace/node_modules/@fontsource/inter-tight/files/${file}`).toString("base64");

const SPECS = [
  { baseX: 0.46, amp: 0.055, freq: 2.2, phase: 0.3, weight: 2.4, alpha: 0.9 },
  { baseX: 0.58, amp: 0.08, freq: 1.55, phase: 1.1, weight: 1.55, alpha: 0.62 },
  { baseX: 0.34, amp: 0.045, freq: 3.4, phase: 2.2, weight: 1.15, alpha: 0.5 },
  { baseX: 0.68, amp: 0.07, freq: 2.8, phase: 0.6, weight: 1.05, alpha: 0.42 },
  { baseX: 0.5, amp: 0.02, freq: 5.5, phase: 1.4, weight: 0.9, alpha: 1, accent: true },
];

function pull(x, y, pointer, amount) {
  const dx = pointer.x - x;
  const dy = pointer.y - y;
  const influence = Math.exp(-(dx * dx + dy * dy) * 5.5) * amount;
  return { x: x + dx * influence, y: y + dy * influence * 0.45 };
}

function loopStroke(time, pointer, seed, cx, cy, radius, weight, alpha) {
  const points = [];
  const count = 48;
  const center = pull(cx, cy, pointer, 0.16);
  for (let i = 0; i <= count; i++) {
    const a = (i / count) * Math.PI * 2 + time * 0.2;
    const wobble = 1 + 0.22 * Math.sin(a * 3 + seed);
    const x = center.x + Math.cos(a) * radius * wobble * 0.72;
    const y = center.y + Math.sin(a) * radius * wobble;
    points.push(pull(x, y, pointer, 0.12));
  }
  return { points, weight, alpha };
}

function studioStrokes(time, pointer, seed = 1) {
  const strokes = SPECS.map((spec, index) => {
    const points = [];
    const count = 64;
    const shift = ((seed * 13 + index * 7) % 11) * 0.012;
    for (let i = 0; i < count; i++) {
      const u = i / (count - 1);
      const wave = Math.sin(u * spec.freq * Math.PI + spec.phase + time * 0.35 + seed) * spec.amp;
      const wave2 = Math.cos(u * spec.freq * 2.05 + seed * 0.7) * spec.amp * 0.38;
      points.push(pull(spec.baseX + shift + wave + wave2, 0.06 + u * 0.88, pointer, 0.28));
    }
    return {
      points,
      weight: spec.weight,
      alpha: spec.alpha,
      accent: Boolean(spec.accent),
    };
  });
  strokes.push(loopStroke(time, pointer, seed, 0.5, 0.28, 0.09, 0.95, 0.62));
  strokes.push(loopStroke(time, pointer, seed + 2, 0.42, 0.62, 0.055, 0.7, 0.42));
  return strokes;
}

function strokePath(points, width, height) {
  let d = `M ${points[0].x * width} ${points[0].y * height}`;
  for (let i = 1; i < points.length - 1; i++) {
    const xc = ((points[i].x + points[i + 1].x) / 2) * width;
    const yc = ((points[i].y + points[i + 1].y) / 2) * height;
    d += ` Q ${points[i].x * width} ${points[i].y * height} ${xc} ${yc}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x * width} ${last.y * height}`;
  return d;
}

const W = 520;
const H = 470;
const strokes = studioStrokes(0.4, { x: 0.58, y: 0.4 }, 1);
const paths = strokes
  .map((stroke) => {
    const color = stroke.accent ? "#1C4DFF" : "#121214";
    const width = stroke.weight * (W / 520);
    return `<path d="${strokePath(stroke.points, W, H)}" fill="none" stroke="${color}" stroke-width="${width.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" opacity="${stroke.alpha}"/>`;
  })
  .join("");

const w900 = font("inter-tight-latin-900-normal.woff2");
const w500 = font("inter-tight-latin-500-normal.woff2");
const w400 = font("inter-tight-latin-400-normal.woff2");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<style>
  @font-face { font-family: "Inter Tight"; src: url("data:font/woff2;base64,${w900}") format("woff2"); font-weight: 900; font-style: normal; }
  @font-face { font-family: "Inter Tight"; src: url("data:font/woff2;base64,${w500}") format("woff2"); font-weight: 500; font-style: normal; }
  @font-face { font-family: "Inter Tight"; src: url("data:font/woff2;base64,${w400}") format("woff2"); font-weight: 400; font-style: normal; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; background: #FFFFFF; }
  .card {
    width: 1200px;
    height: 630px;
    background: #FFFFFF;
    color: #121214;
    font-family: "Inter Tight", "Helvetica Neue", Arial, sans-serif;
    position: relative;
    overflow: hidden;
  }
  .frame {
    position: absolute;
    inset: 22px;
    border: 1px solid #121214;
    pointer-events: none;
  }
  .word {
    position: absolute;
    left: 68px;
    top: 62px;
    font-weight: 900;
    font-size: 292px;
    letter-spacing: -0.065em;
    line-height: 0.78;
    color: #121214;
  }
  .mark-reg {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 1.62em;
    height: 1.62em;
    margin-left: 0.14em;
    border: 0.07em solid currentColor;
    border-radius: 999px;
    font-size: 0.12em;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 1;
    position: relative;
    top: -0.42em;
  }
  .place {
    position: absolute;
    left: 72px;
    top: 352px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .city {
    font-size: 32px;
    font-weight: 500;
    letter-spacing: -0.03em;
  }
  .pill {
    background: #F2F2F4;
    color: #121214;
    border-radius: 999px;
    padding: 7px 14px;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  .rule {
    position: absolute;
    left: 64px;
    right: 64px;
    top: 500px;
    height: 1px;
    background: #121214;
  }
  .index {
    position: absolute;
    left: 64px;
    right: 64px;
    top: 524px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 28px;
  }
  .kicker {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #8D8D92;
  }
  .title {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 500;
    letter-spacing: -0.03em;
    color: #121214;
  }
  .ink {
    position: absolute;
    right: 40px;
    top: 52px;
    width: 500px;
    height: 410px;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="frame"></div>
    <svg class="ink" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${paths}</svg>
    <div class="word" id="word">HIM<span class="mark-reg">R</span></div>
    <div class="place">
      <p class="city">New York</p>
      <span class="pill">Resident</span>
    </div>
    <div class="rule"></div>
    <div class="index">
      <div>
        <p class="kicker">01 <span style="padding:0 6px">/</span> Work</p>
        <p class="title">Explore the work</p>
      </div>
      <div>
        <p class="kicker">02 <span style="padding:0 6px">/</span> Flash</p>
        <p class="title">Find your flash</p>
      </div>
      <div>
        <p class="kicker">03 <span style="padding:0 6px">/</span> Inquiry</p>
        <p class="title">Start an inquiry</p>
      </div>
    </div>
  </div>
</body>
</html>`;

writeFileSync("/workspace/.grok/og-card.html", html);

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto("file:///workspace/.grok/og-card.html", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const box = await page.locator("#word").boundingBox();
console.log("word-box", box);
await page.screenshot({ path: "/workspace/.grok/og-raw.png", type: "png" });
await browser.close();
console.log("wrote raw");
