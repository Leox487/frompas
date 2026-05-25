import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "./components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frompas — Find real paths from your passion",
  description:
    "Type your passion. Get real people who turned it into a business, real models, and real first steps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="site-shell">
        <ClerkProvider>
          <Navbar />
          <div className="site-main">{children}</div>
        </ClerkProvider>
      </body>
    </html>
  );
}
