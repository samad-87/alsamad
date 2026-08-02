import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell";
import { isLocale, locales } from "@/lib/i18n";
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AppShell locale={locale}>{children}</AppShell>;
}
