import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Email Marketing Tool",
  description: "Cubic SOl Marketing",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
