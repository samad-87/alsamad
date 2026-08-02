import type { Locale } from "./i18n";

type LocalizedText = { ar: string; en: string };

export type GeneralDua = {
  slug: string;
  title: LocalizedText;
  arabic: string;
  translation: string;
  transliteration?: string;
  purpose: LocalizedText;
  tags: LocalizedText[];
  editorialNote: LocalizedText;
};

export const generalDuas: GeneralDua[] = [
  {
    slug: "a-calm-heart",
    title: { ar: "دعاء لقلبٍ هادئ", en: "A dua for a calm heart" },
    arabic:
      "يا رب، أنزل على قلبي سكينتك، واهدِ فكري إلى ما يرضيك، واجعلني أستقبل يومي بثقةٍ بك وطمأنينةٍ في رحمتك.",
    translation:
      "My Lord, send Your tranquility upon my heart, guide my thoughts toward what pleases You, and let me meet this day with trust in You and peace in Your mercy.",
    transliteration:
      "Yā Rabb, anzil ʿalā qalbī sakīnatak, wahdi fikrī ilā mā yurḍīk, wajʿalnī astaqbilu yawmī bithiqatin bika wa-ṭumaʾnīnatin fī raḥmatik.",
    purpose: {
      ar: "للحظات القلق وبداية اليوم بهدوء وتوكّل.",
      en: "For anxious moments and beginning the day with calm trust in Allah.",
    },
    tags: [
      { ar: "السكينة", en: "Calmness" },
      { ar: "التوكّل", en: "Trust" },
      { ar: "بداية اليوم", en: "Morning" },
    ],
    editorialNote: {
      ar: "صيغ هذا الدعاء ليكون رفيقاً قصيراً في لحظات التوتر، من غير نسبته إلى نص ديني منقول.",
      en: "This dua was composed as a short companion in stressful moments and is not presented as a transmitted religious text.",
    },
  },
  {
    slug: "clarity-in-decisions",
    title: {
      ar: "دعاء للوضوح عند القرار",
      en: "A dua for clarity in decisions",
    },
    arabic:
      "اللَّهُمَّ ارْزُقْنِي بَصِيرَةً أَتَبَيَّنُ بِهَا الْخَيْرَ، وَحِكْمَةً أَخْتَارُ بِهَا مَا يَنْفَعُ، وَقَلْبًا رَاضِيًا بِمَا تُقَدِّرُهُ لِي وَإِنْ خَالَفَ مَا تَمَنَّيْتُ.",
    translation:
      "O Allah, grant me insight through which I recognize what is good, wisdom through which I choose what is beneficial, and a heart content with what You decree for me, even when it differs from what I hoped for.",
    purpose: {
      ar: "للتأمل قبل القرارات المهمة وطلب الحكمة والرضا.",
      en: "For reflection before important decisions and asking for wisdom and contentment.",
    },
    tags: [
      { ar: "القرارات", en: "Decisions" },
      { ar: "الحكمة", en: "Wisdom" },
      { ar: "الرضا", en: "Contentment" },
    ],
    editorialNote: {
      ar: "كتبه فريق الصمد كتعبير دعائي معاصر يساعد على جمع النية قبل اتخاذ القرار.",
      en: "The Alsamad team wrote this contemporary supplication to help gather one’s intention before making a decision.",
    },
  },
  {
    slug: "strength-for-kindness",
    title: {
      ar: "دعاء للقوة على الإحسان",
      en: "A dua for strength to be kind",
    },
    arabic:
      "يا كريم، وسّع صدري للناس، وأعنّي على الكلمة الطيبة والعمل النافع، واجعل أثري رحمةً لا أذى فيها.",
    translation:
      "O Most Generous, open my heart to people, help me offer kind words and beneficial deeds, and let my impact be mercy without harm.",
    purpose: {
      ar: "لتجديد نية الإحسان في التعامل والعمل اليومي.",
      en: "For renewing the intention to show kindness in daily interactions and work.",
    },
    tags: [
      { ar: "الإحسان", en: "Kindness" },
      { ar: "الرحمة", en: "Mercy" },
      { ar: "الأثر", en: "Impact" },
    ],
    editorialNote: {
      ar: "دعاء تحريري يربط العبادة بحسن الأثر، ولا يُقدَّم بوصفه حديثاً أو دعاءً مأثوراً.",
      en: "This editorial dua connects devotion with positive impact. It is not presented as a hadith or transmitted dua.",
    },
  },
];

export const generalDuaText = (locale: Locale, value: LocalizedText) =>
  value[locale];
