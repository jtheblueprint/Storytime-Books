import "./globals.css";

export const metadata = {
  title: "Storytime Shelf",
  description: "Bedtime reading tracker for families",
  manifest: "/manifest.json",
  themeColor: "#4A7C3F",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Storytime",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' rx='90' fill='%23F7F3E3'/><text x='256' y='340' text-anchor='middle' font-size='280'>📚</text></svg>" />
      </head>
      <body className="safe-top">
        {children}
      </body>
    </html>
  );
}
