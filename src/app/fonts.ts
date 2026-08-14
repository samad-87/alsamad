import localFont from "next/font/local";

export const arabicUiFont = localFont({
  src: "./fonts/NotoSansArabic[wdth,wght]-v2.013.woff2",
  display: "swap",
  preload: false,
  variable: "--font-arabic-ui",
  weight: "400 800",
});

export const arabicReadingFont = localFont({
  src: "./fonts/NotoNaskhArabic[wght]-v2.021.woff2",
  display: "swap",
  preload: false,
  variable: "--font-arabic-reading",
  weight: "400",
});
