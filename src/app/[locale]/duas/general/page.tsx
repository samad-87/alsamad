import { notFound } from "next/navigation";
import {
  Breadcrumbs,
  Container,
  ContentCard,
  PageHeader,
} from "@/components/ui";
import { generalDuas, generalDuaText } from "@/lib/general-duas";
import { isLocale, t } from "@/lib/i18n";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy =
    locale === "ar"
      ? {
          title: "أدعية عامة",
          description:
            "أدعية إسلامية معاصرة يكتبها فريق الصمد لترافق لحظات الحياة اليومية بهدوء ووضوح.",
          notice:
            "هذا الدعاء تحريري كتبه فريق الصمد، وليس منقولاً من القرآن أو السنة.",
        }
      : {
          title: "General Duas",
          description:
            "Modern Islamic supplications written by the Alsamad editorial team for calm, everyday reflection.",
          notice:
            "This supplication is an editorial dua written by the Alsamad team. It is not quoted from the Quran or Sunnah.",
        };

  return (
    <section className="section general-duas-section">
      <Container>
        <Breadcrumbs
          locale={locale}
          items={[
            { label: t(locale).duas, href: `/${locale}/duas` },
            { label: copy.title },
          ]}
        />
        <PageHeader
          eyebrow="General Dua"
          title={copy.title}
          description={copy.description}
        />
        <div className="general-dua-notice" role="note">
          <strong>General Dua</strong>
          <p>{copy.notice}</p>
        </div>
        <div className="grid-3">
          {generalDuas.map((dua) => (
            <ContentCard
              key={dua.slug}
              eyebrow="General Dua"
              title={generalDuaText(locale, dua.title)}
              body={generalDuaText(locale, dua.purpose)}
              href={`/${locale}/duas/general/${dua.slug}`}
              action={t(locale).view}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
