import { notFound } from "next/navigation";
import { TasbeehCounter } from "@/components/client-controls";
import { Container, FixtureNotice, PageHeader, Section } from "@/components/ui";
import { isLocale, t } from "@/lib/i18n";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = t(locale);
  return (
    <Section>
      <Container reading>
        <PageHeader
          eyebrow={c.daily}
          title={c.tasbeeh}
          description={
            locale === "ar"
              ? "عداد محلي هادئ؛ لا نقاط ولا تصنيفات."
              : "A calm local-only counter with no points or rankings."
          }
        />
        <FixtureNotice locale={locale} />
        <TasbeehCounter locale={locale} />
      </Container>
    </Section>
  );
}
