import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "The Sorting Hat | Join Your House",
  description:
    "Answer the call. Get sorted into your house and join an elite community of tech builders, innovators, and mavericks.",
  keywords: ["sorting hat", "tech event", "waitlist", "community"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>{children}</body>
    </html>
  );
}
