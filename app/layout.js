import {
  Outfit,
  EB_Garamond,
  Cormorant_Infant,
  Cinzel_Decorative,
} from "next/font/google";
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

const cormorant = Cormorant_Infant({
  variable: "--font-im-fell",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const cinzel = Cinzel_Decorative({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "The Quest | ByTheFew",
  description:
    "Answer the call. Get sorted into your house and join an elite community of tech builders, innovators, and mavericks.",
  keywords: ["The Quest", "ByTheFew", "community"],
  manifest: "/images/favicon/site.webmanifest",
  icons: {
    icon: [
      {
        url: "/images/favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/images/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/images/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${garamond.variable} ${cormorant.variable} ${cinzel.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
