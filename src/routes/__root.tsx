import { Link, createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteHeader } from "@/components/site-header";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Him·Her·Hub" },
      {
        name: "description",
        content: "A private social club for couples. Bangalore, India.",
      },
      { name: "theme-color", content: "#fcfcfa" },
      { property: "og:title", content: "Him·Her·Hub" },
      { property: "og:site_name", content: "Him·Her·Hub" },
      { property: "og:description", content: "A private social club for couples. Bangalore, India." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.himherhub.com/" },
      { property: "og:image", content: "https://www.himherhub.com/og.jpg" },
      { property: "og:image:secure_url", content: "https://www.himherhub.com/og.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Him·Her·Hub" },
      { name: "twitter:description", content: "A private social club for couples. Bangalore, India." },
      { name: "twitter:image", content: "https://www.himherhub.com/og.jpg" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <a className="skip" href="#content">
            Skip to content
          </a>
          <SiteHeader />
          <div id="content">
            <Outlet />
          </div>
          <footer className="px-6 pb-10 lg:px-12">
            <nav aria-label="Legal" className="flex gap-6 border-t border-line pt-6 text-sm text-muted">
              <Link to="/privacy" className="underline-offset-4 hover:text-fg hover:underline">
                Privacy
              </Link>
              <Link to="/terms" className="underline-offset-4 hover:text-fg hover:underline">
                Terms
              </Link>
              <Link to="/admin/applications" className="underline-offset-4 hover:text-fg hover:underline">
                Operations
              </Link>
            </nav>
          </footer>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
