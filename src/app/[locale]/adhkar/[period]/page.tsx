import { notFound } from "next/navigation";
import { DhikrReader } from "@/components/client-controls";
import { Breadcrumbs, Container, PageHeader, Section } from "@/components/ui";
import { isLocale, t } from "@/lib/i18n";
export function generateStaticParams() {
  return [{ period: "morning" }, { period: "evening" }];
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; period: string }>;
}) {
  const { locale, period } = await params;
  if (!isLocale(locale) || !["morning", "evening"].includes(period)) notFound();
  const c = t(locale);
  const title = period === "morning" ? c.morning : c.evening;
  return (
    <Section>
      <Container reading>
        <Breadcrumbs
          locale={locale}
          items={[
            { label: c.adhkar, href: `/${locale}/adhkar` },
            { label: title },
          ]}
        />
        <PageHeader eyebrow={c.focus} title={title} description={c.fixture} />
        <DhikrReader locale={locale} type={period as "morning" | "evening"} />
      </Container>
    </Section>
  );
}
