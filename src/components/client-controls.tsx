"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { MenuIcon, MoonIcon, SunIcon } from "./icons";
import { AccessibleOverlay } from "./accessible-overlay";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function ThemeSwitcher({
  locale,
  className = "",
}: {
  locale: Locale;
  className?: string;
}) {
  const c = t(locale);
  const dark = useSyncExternalStore(
    (notify) => {
      window.addEventListener("storage", notify);
      window.addEventListener("alsamad-theme-change", notify);
      return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener("alsamad-theme-change", notify);
      };
    },
    () => {
      const saved = localStorage.getItem("alsamad-theme");
      return saved
        ? saved === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
    },
    () => false,
  );
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  function toggle() {
    const next = !dark;
    localStorage.setItem("alsamad-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("alsamad-theme-change"));
  }
  return (
    <button
      className={`button ${className}`.trim()}
      onClick={toggle}
      aria-label={dark ? c.light : c.dark}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export function MobileMenu({
  locale,
  children,
  trigger,
  triggerClassName = "button",
  panelId = "mobile-navigation",
  wrapperClassName = "mobile-menu",
}: {
  locale: Locale;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  triggerClassName?: string;
  panelId?: string;
  wrapperClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const c = t(locale);
  return (
    <div className={wrapperClassName}>
      <button
        ref={triggerRef}
        className={triggerClassName}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {trigger ?? (
          <>
            <MenuIcon />
            <span className="sr-only">{c.menu}</span>
          </>
        )}
      </button>
      <AccessibleOverlay
        open={open}
        id={panelId}
        label={c.more}
        className="mobile-panel"
        returnFocusRef={triggerRef}
        onClose={close}
      >
        <button className="mobile-close" onClick={close} aria-label={c.close}>
          {c.close} ×
        </button>
        {children}
      </AccessibleOverlay>
    </div>
  );
}

export function TasbeehCounter({ locale }: { locale: Locale }) {
  const c = t(locale);
  const count = useSyncExternalStore(
    (notify) => {
      window.addEventListener("storage", notify);
      window.addEventListener("alsamad-tasbeeh-change", notify);
      return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener("alsamad-tasbeeh-change", notify);
      };
    },
    () => Number(localStorage.getItem("alsamad-tasbeeh") || 0),
    () => 0,
  );
  function update(next: number) {
    localStorage.setItem("alsamad-tasbeeh", String(next));
    window.dispatchEvent(new Event("alsamad-tasbeeh-change"));
  }
  return (
    <div className="tasbeeh surface">
      <span className="eyebrow">{c.count}</span>
      <output aria-live="polite">
        {count.toLocaleString(locale === "ar" ? "ar" : "en")}
      </output>
      <button
        className="tasbeeh-main"
        onClick={() => update(count + 1)}
        aria-label={c.count}
      >
        +
      </button>
      <button className="button" onClick={() => update(0)}>
        {c.reset}
      </button>
    </div>
  );
}
