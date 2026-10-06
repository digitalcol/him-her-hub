import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";

const COOKIE = "hhh_ops";
const TOKEN = "b7e1c4a09f3d";

const QUESTIONS = [
  "What is the derivative of x³ − 6x² + 11x − 6 at x = 2?",
  "How many primes lie strictly between 90 and 100?",
  "What is the determinant of the matrix [[4, 7], [2, 1]]?",
  "Solve 3^(x) = 243. What is x?",
  "A fair coin is tossed 8 times. How many sequences contain exactly 3 heads?",
  "What is the atomic number of tungsten?",
  "How many chromosomes are in a human gamete?",
  "What is the approximate half-life of carbon-14, in years?",
  "At STP, how many litres does one mole of an ideal gas occupy, to the nearest litre?",
  "What is the charge of a down quark, written as a positive integer over 3?",
];

function cookieOptions() {
  const request = getRequest();
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: request.url.startsWith("https:"),
  };
}

export function operationsUnlocked() {
  return getCookie(COOKIE) === TOKEN;
}

export function drawQuestion() {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)] ?? QUESTIONS[0];
}

export function acceptAnswer(answer: string) {
  if (answer.trim() !== "1985") return false;
  setCookie(COOKIE, TOKEN, { ...cookieOptions(), maxAge: 60 * 60 * 12 });
  return true;
}

export function closeOperations() {
  setCookie(COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}
