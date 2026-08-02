import { notFound } from "next/navigation";
import {
  ContentCard,
  Container,
  FixtureNotice,
  PageHeader,
  Section,
} from "@/components/ui";
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
      <Container>
        <PageHeader
          eyebrow={c.daily}
          title={c.adhkar}
          description={c.placeholderBody}
        />
        <FixtureNotice locale={locale} />
        <div className="grid-2">
          <ContentCard
            eyebrow="☼"
            title={c.morning}
            body={c.sourcePending}
            href={`/${locale}/adhkar/morning`}
            action={c.view}
          />
          <ContentCard
            eyebrow="☾"
            title={c.evening}
            body={c.sourcePending}
            href={`/${locale}/adhkar/evening`}
            action={c.view}
          />
        </div>
      </Container>
    </Section>
  );
}
