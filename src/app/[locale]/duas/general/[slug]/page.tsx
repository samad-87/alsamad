import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, Container } from "@/components/ui";
import { GeneralDuaActions } from "@/components/general-dua-actions";
import { generalDuas, generalDuaText } from "@/lib/general-duas";
import { isLocale, t } from "@/lib/i18n";
import { canonicalPath, localeAlternates } from "@/lib/seo";

export function generateStaticParams() {
  return generalDuas.map((dua) => ({ slug: dua.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const dua = generalDuas.find((item) => item.slug === slug);
  if (!dua) notFound();
  const path = `/duas/general/${slug}`;
  return {
    title: generalDuaText(locale, dua.title),
    description: generalDuaText(locale, dua.purpose),
    alternates: {
      canonical: canonicalPath(locale, path),
      languages: localeAlternates(path),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dua = generalDuas.find((item) => item.slug === slug);
  if (!dua) notFound();

  const copy =
    locale === "ar"
      ? {
          general: "أدعية عامة",
          notice:
            "هذا الدعاء تحريري كتبه فريق الصمد، وليس منقولاً من القرآن أو السنة.",
          purpose: "الغرض",
          tags: "الوسوم",
          note: "ملاحظة تحريرية",
        }
      : {
          general: "General Duas",
          notice:
            "This supplication is an editorial dua written by the Alsamad team. It is not quoted from the Quran or Sunnah.",
          purpose: "Purpose",
          tags: "Tags",
          note: "Editorial note",
        };

  return (
    <div className="section general-dua-reading-mode">
      <Container reading>
        <Breadcrumbs
          locale={locale}
          items={[
            { label: t(locale).duas, href: `/${locale}/duas` },
            { label: copy.general, href: `/${locale}/duas/general` },
            { label: generalDuaText(locale, dua.title) },
          ]}
        />
        <header className="dua-header general-dua-header">
          <span className="general-dua-badge">General Dua</span>
          <h1 className="title">{generalDuaText(locale, dua.title)}</h1>
        </header>
        <div className="general-dua-notice" role="note">
          <strong>General Dua</strong>
          <p>{copy.notice}</p>
        </div>
        <article className="general-dua-card surface">
          <p className="arabic-reading general-dua-arabic" lang="ar" dir="rtl">
            {dua.arabic}
          </p>
          <div className="general-dua-translation">
            <span className="eyebrow">{t(locale).translation}</span>
            <p lang="en" dir="ltr">
              {dua.translation}
            </p>
          </div>
          {dua.transliteration && (
            <div className="general-dua-transliteration">
              <span className="eyebrow">{t(locale).transliteration}</span>
              <p lang="en" dir="ltr">
                {dua.transliteration}
              </p>
            </div>
          )}
          <GeneralDuaActions
            locale={locale}
            text={`${dua.arabic}\n\n${dua.translation}`}
            title={generalDuaText(locale, dua.title)}
          />
        </article>
        <section className="general-dua-meta surface">
          <div>
            <span className="eyebrow">{copy.purpose}</span>
            <p>{generalDuaText(locale, dua.purpose)}</p>
          </div>
          <div>
            <span className="eyebrow">{copy.tags}</span>
            <div className="general-dua-tags">
              {dua.tags.map((tag) => (
                <span className="chip" key={tag.en}>
                  {generalDuaText(locale, tag)}
                </span>
              ))}
            </div>
          </div>
        </section>
        <aside className="editorial-note surface">
          <span className="eyebrow">{copy.note}</span>
          <p>{generalDuaText(locale, dua.editorialNote)}</p>
        </aside>
      </Container>
    </div>
  );
}
