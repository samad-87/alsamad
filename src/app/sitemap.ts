import type { MetadataRoute } from "next";
import { locales, type Locale } from "@/lib/i18n";
import { generalDuas } from "@/lib/general-duas";
import { implementedCategories } from "@/lib/adhkar/content/structure";
import { surahStructures } from "@/lib/quran/content/structure";
import { absoluteUrl, localeAlternates, localePath } from "@/lib/seo";

const staticPaths = [
  "",
  "/quran",
  "/adhkar",
  "/duas/general",
  "/tasbeeh",
] as const;

function entriesFor(path: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    Object.entries(localeAlternates(path)).map(([locale, relativePath]) => [
      locale,
      absoluteUrl(relativePath),
    ]),
  ) as Record<Locale, string>;
  return locales.map((locale: Locale) => ({
    url: absoluteUrl(localePath(locale, path)),
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    entries.push(...entriesFor(path));
  }

  for (const surah of surahStructures) {
    entries.push(...entriesFor(`/quran/${surah.slug}`));
  }

  for (const category of implementedCategories()) {
    entries.push(...entriesFor(`/adhkar/${category.routeSlug}`));
  }

  for (const dua of generalDuas) {
    entries.push(...entriesFor(`/duas/general/${dua.slug}`));
  }

  return entries;
}
