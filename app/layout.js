import "./globals.css";

export const metadata = {
  title: "Ben Auto Garage — Rescue & Door-to-Door",
  description:
    "Stuck on the road or need a mechanic at home? Reach Ben Auto Garage in two taps.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Expanded:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
