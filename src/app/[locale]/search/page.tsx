import { notFound } from "next/navigation";
import { Container, PageHeader, Section } from "@/components/ui";
import { isLocale, t } from "@/lib/i18n";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = t(locale);
  const unavailable =
    locale === "ar"
      ? {
          heading: "البحث قيد الإعداد",
          description: "ميزة البحث الموحّد قيد الإعداد.",
          message:
            "البحث الموحّد غير متاح بعد. هذه الميزة ما زالت قيد الإعداد.",
        }
      : {
          heading: "Search is being prepared",
          description: "The unified search feature is being prepared.",
          message:
            "Unified search is not available yet. This feature is still being prepared.",
        };

  return (
    <Section>
      <Container>
        <PageHeader
          eyebrow={c.verifiedStructure}
          title={c.search}
          description={unavailable.description}
        />
        <section className="notice" aria-labelledby="search-unavailable-title">
          <span aria-hidden="true">ⓘ</span>
          <div>
            <h2 id="search-unavailable-title">{unavailable.heading}</h2>
            <p>{unavailable.message}</p>
          </div>
        </section>
      </Container>
    </Section>
  );
}
