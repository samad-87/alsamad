import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function Container({
  children,
  reading = false,
}: {
  children: React.ReactNode;
  reading?: boolean;
}) {
  return (
    <div className={reading ? "reading-container" : "container"}>
      {children}
    </div>
  );
}
export function Section({
  children,
  soft = false,
}: {
  children: React.ReactNode;
  soft?: boolean;
}) {
  return (
    <section className={`section${soft ? " section-soft" : ""}`}>
      {children}
    </section>
  );
}
export function FixtureNotice({ locale }: { locale: Locale }) {
  return (
    <div className="notice" role="note">
      <span aria-hidden="true">ⓘ</span>
      <span>{t(locale).fixture}</span>
    </div>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-header">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="title">{title}</h1>
      <p className="muted">{description}</p>
    </header>
  );
}
export function Breadcrumbs({
  locale,
  items,
}: {
  locale: Locale;
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <Link href={`/${locale}`}>{t(locale).today}</Link>
      {items.map((x, i) => (
        <span key={i}>
          {x.href ? <Link href={x.href}>{x.label}</Link> : x.label}
        </span>
      ))}
    </nav>
  );
}
export function ContentCard({
  eyebrow,
  title,
  body,
  href,
  action,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  href?: string;
  action?: string;
}) {
  const content = (
    <>
      <>{eyebrow && <span className="eyebrow">{eyebrow}</span>}</>
      <h3>{title}</h3>
      <p className="muted">{body}</p>
      {action && <span className="card-action">{action} →</span>}
    </>
  );
  return href ? (
    <Link href={href} className="content-card surface">
      {content}
    </Link>
  ) : (
    <article className="content-card surface">{content}</article>
  );
}
export function SourceReference({ locale }: { locale: Locale }) {
  const c = t(locale);
  return (
    <aside className="source-reference">
      <span className="eyebrow">{c.source}</span>
      <strong>{c.sourcePending}</strong>
      <p className="muted">{c.placeholderBody}</p>
    </aside>
  );
}
export function PrayerTimeCard({
  locale,
  name,
  time,
  active = false,
}: {
  locale: Locale;
  name: string;
  time: string;
  active?: boolean;
}) {
  return (
    <article className={`prayer-card${active ? " active" : ""}`}>
      <span>{name}</span>
      <strong>{time}</strong>
      <small>{t(locale).staticTimes}</small>
    </article>
  );
}
export function EmptyState({
  locale,
  kind = "empty",
}: {
  locale: Locale;
  kind?: "empty" | "error" | "loading";
}) {
  const labels = {
    ar: {
      empty: "لا توجد نتائج تجريبية",
      error: "تعذر عرض النموذج",
      loading: "جارٍ تجهيز النتائج…",
    },
    en: {
      empty: "No prototype results",
      error: "The prototype could not be shown",
      loading: "Preparing results…",
    },
  };
  return (
    <div className={`empty-state surface ${kind}`}>
      <span aria-hidden="true">
        {kind === "loading" ? "◌" : kind === "error" ? "!" : "◇"}
      </span>
      <strong>{labels[locale][kind]}</strong>
      <p className="muted">{t(locale).fixture}</p>
    </div>
  );
}
