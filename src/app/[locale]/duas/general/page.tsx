import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Breadcrumbs,
  Container,
  ContentCard,
  PageHeader,
} from "@/components/ui";
import { generalDuas, generalDuaText } from "@/lib/general-duas";
import { isLocale, t } from "@/lib/i18n";
import { canonicalPath, localeAlternates } from "@/lib/seo";

function pageCopy(locale: "ar" | "en") {
  return locale === "ar"
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
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = pageCopy(locale);
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: canonicalPath(locale, "/duas/general"),
      languages: localeAlternates("/duas/general"),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = pageCopy(locale);

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
