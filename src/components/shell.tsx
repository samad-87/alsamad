import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { SearchIcon } from "./icons";
import { ThemeSwitcher } from "./client-controls";
import { BottomNav } from "./bottom-nav";
import { LocaleSwitcher } from "./locale-switcher";

export { LocaleSwitcher } from "./locale-switcher";

export function AppShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const c = t(locale);
  const nav = [
    ["", c.today],
    ["/quran", c.quran],
    ["/adhkar", c.adhkar],
    ["/duas", c.duas],
    ["/prayer-times", c.prayer],
  ];
  const links = nav.map(([href, label]) => (
    <Link key={href} href={`/${locale}${href}`}>
      {label}
    </Link>
  ));
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body>
        <a className="skip-link" href="#main">
          {c.skip}
        </a>
        <header className="site-header">
          <div className="container header-inner">
            <Link href={`/${locale}`} className="brand">
              <span className="brand-mark" aria-hidden="true">
                ص
              </span>
              <span className="brand-wordmark">{c.brand}</span>
            </Link>
            <nav aria-label={c.menu} className="desktop-nav">
              {links}
            </nav>
            <div className="header-actions">
              <Link
                className="button icon-button"
                href={`/${locale}/search`}
                aria-label={c.search}
              >
                <SearchIcon />
              </Link>
              <LocaleSwitcher locale={locale} />
              <ThemeSwitcher locale={locale} className="icon-button" />
            </div>
          </div>
        </header>
        <main id="main">{children}</main>
        <BottomNav locale={locale} />
        <Footer locale={locale} />
      </body>
    </html>
  );
}

function Footer({ locale }: { locale: Locale }) {
  const c = t(locale);
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            <span className="brand-mark">ص</span>
            <span>{c.brand}</span>
          </div>
          <p className="muted">{c.trustBody}</p>
        </div>
        <FooterGroup
          title={c.explore}
          links={[
            [c.quran, `/${locale}/quran`],
            [c.adhkar, `/${locale}/adhkar`],
            [c.duas, `/${locale}/duas`],
          ]}
        />
        <FooterGroup
          title={c.today}
          links={[
            [c.prayer, `/${locale}/prayer-times`],
            [c.calendar, `/${locale}/calendar`],
            [c.tasbeeh, `/${locale}/tasbeeh`],
          ]}
        />
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Alsamad</span>
        <span>{c.fixture}</span>
      </div>
    </footer>
  );
}
export function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <div>
      <h2 className="footer-heading">{title}</h2>
      <ul>
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
