import { Outfit, EB_Garamond, IM_Fell_English } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const imFell = IM_Fell_English({
  variable: "--font-im-fell",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "The Sorting Hat | Join Your House",
  description:
    "Answer the call. Get sorted into your house and join an elite community of tech builders, innovators, and mavericks.",
  keywords: ["sorting hat", "tech event", "waitlist", "community"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${garamond.variable} ${imFell.variable}`}>
      <body>{children}</body>
    </html>
  );
}
