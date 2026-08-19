import { locales, type Locale } from "./i18n";

export const SITE_ORIGIN = "https://al-samad.com";

export function localePath(locale: Locale, path: string): string {
  return `/${locale}${path}`;
}

export function canonicalPath(locale: Locale, path: string): string {
  return localePath(locale, path);
}

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}

export function localeAlternates(path: string): Record<Locale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, localePath(locale, path)]),
  ) as Record<Locale, string>;
}
