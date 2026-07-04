// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "Areeba·Flow — Automation Studio",
  description:
    "Live demo: an AI-powered lead qualifier built with n8n, Groq and Next.js.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
