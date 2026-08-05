"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { BookIcon, HomeIcon, MoreIcon, SearchIcon, SparkleIcon } from "./icons";
import { MobileMenu } from "./client-controls";

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const c = t(locale);
  const base = `/${locale}`;
  const items = [
    { href: base, label: c.today, Icon: HomeIcon, active: pathname === base },
    {
      href: `${base}/quran`,
      label: c.quran,
      Icon: BookIcon,
      active: pathname.startsWith(`${base}/quran`),
    },
    {
      href: `${base}/search`,
      label: c.search,
      Icon: SearchIcon,
      active: pathname.startsWith(`${base}/search`),
    },
    {
      href: `${base}/adhkar`,
      label: c.adhkar,
      Icon: SparkleIcon,
      active: pathname.startsWith(`${base}/adhkar`),
    },
  ] as const;

  return (
    <nav className="bottom-nav" aria-label={c.menu}>
      {items.map(({ href, label, Icon, active }) => (
        <Link
          key={href}
          href={href}
          className="bottom-nav-item"
          aria-current={active ? "page" : undefined}
        >
          <Icon size={22} />
          <span>{label}</span>
        </Link>
      ))}
      <MobileMenu
        locale={locale}
        panelId="more-navigation"
        wrapperClassName="bottom-nav-more"
        triggerClassName="bottom-nav-item"
        trigger={
          <>
            <MoreIcon size={22} />
            <span>{c.more}</span>
          </>
        }
      >
        <nav className="mobile-nav" aria-label={c.more}>
          <Link href={`${base}/duas`}>{c.duas}</Link>
          <Link href={`${base}/prayer-times`}>{c.prayer}</Link>
          <Link href={`${base}/calendar`}>{c.calendar}</Link>
          <Link href={`${base}/tasbeeh`}>{c.tasbeeh}</Link>
        </nav>
      </MobileMenu>
    </nav>
  );
}
