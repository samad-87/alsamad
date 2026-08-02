import type { Locale } from "./i18n";

export const prayerFixtures = [
  { ar: "الفجر", en: "Fajr", time: "04:18" },
  { ar: "الشروق", en: "Sunrise", time: "05:42" },
  { ar: "الظهر", en: "Dhuhr", time: "13:41" },
  { ar: "العصر", en: "Asr", time: "17:52" },
  { ar: "المغرب", en: "Maghrib", time: "21:34" },
  { ar: "العشاء", en: "Isha", time: "23:01" },
] as const;

export const duaFixtures = [
  {
    slug: "daily-guidance",
    category: { ar: "الحياة اليومية", en: "Daily life" },
    title: { ar: "نموذج دعاء للهداية", en: "Guidance dua prototype" },
    context: {
      ar: "نموذج لبنية صفحة دعاء، وليس محتوى دينياً منشوراً.",
      en: "A prototype for the dua detail structure, not published religious content.",
    },
  },
  {
    slug: "travel-placeholder",
    category: { ar: "السفر", en: "Travel" },
    title: { ar: "نموذج دعاء السفر", en: "Travel dua prototype" },
    context: {
      ar: "مساحة مؤقتة حتى اعتماد النص والمصدر.",
      en: "Reserved until text and provenance are approved.",
    },
  },
  {
    slug: "forgiveness-placeholder",
    category: { ar: "الاستغفار", en: "Forgiveness" },
    title: { ar: "نموذج دعاء الاستغفار", en: "Forgiveness dua prototype" },
    context: { ar: "مثال واجهة فقط.", en: "Interface example only." },
  },
] as const;

export const surahFixtures = [
  { slug: "1", number: 1, ar: "الفاتحة", en: "Al-Fatihah", verses: 7 },
  { slug: "2", number: 2, ar: "البقرة", en: "Al-Baqarah", verses: 286 },
  { slug: "36", number: 36, ar: "يس", en: "Ya-Sin", verses: 83 },
  { slug: "67", number: 67, ar: "الملك", en: "Al-Mulk", verses: 30 },
] as const;

export const loc = (locale: Locale, value: { ar: string; en: string }) =>
  value[locale];
