"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { MenuIcon, MoonIcon, SunIcon } from "./icons";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function ThemeSwitcher({ locale }: { locale: Locale }) {
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
      className="button"
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
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const c = t(locale);
  return (
    <div className="mobile-menu">
      <button
        className="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
      >
        <MenuIcon />
        <span className="sr-only">{c.menu}</span>
      </button>
      {open && (
        <div id="mobile-navigation" className="mobile-panel">
          <button className="mobile-close" onClick={() => setOpen(false)}>
            {c.close} ×
          </button>
          {children}
        </div>
      )}
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

export function DhikrReader({
  locale,
  type,
}: {
  locale: Locale;
  type: "morning" | "evening";
}) {
  const c = t(locale);
  const [index, setIndex] = useState(0);
  const [list, setList] = useState(false);
  const [reps, setReps] = useState(0);
  const total = 3;
  if (list)
    return (
      <div>
        <div className="reader-toolbar">
          <button className="button" onClick={() => setList(false)}>
            {c.focus}
          </button>
        </div>
        <div className="reader-list">
          {Array.from({ length: total }, (_, i) => (
            <ReligiousPlaceholder key={i} locale={locale} number={i + 1} />
          ))}
        </div>
      </div>
    );
  return (
    <div>
      <div className="reader-toolbar">
        <span>
          {index + 1} / {total}
        </span>
        <div className="progress-track">
          <span style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <button className="button" onClick={() => setList(true)}>
          {c.list}
        </button>
      </div>
      <ReligiousPlaceholder locale={locale} number={index + 1} />
      <div className="counter-row">
        <button
          className="button"
          disabled={index === 0}
          onClick={() => {
            setIndex(index - 1);
            setReps(0);
          }}
        >
          {c.previous}
        </button>
        <button className="rep-button" onClick={() => setReps(reps + 1)}>
          <strong>{reps}</strong>
          <span>{c.count}</span>
        </button>
        <button
          className="button button-primary"
          onClick={() => {
            setIndex(Math.min(total - 1, index + 1));
            setReps(0);
          }}
        >
          {index === total - 1 ? c.complete : c.next}
        </button>
      </div>
      <p className="muted" style={{ textAlign: "center" }}>
        {type === "morning" ? c.morning : c.evening} · {c.fixture}
      </p>
    </div>
  );
}

function ReligiousPlaceholder({
  locale,
  number,
}: {
  locale: Locale;
  number: number;
}) {
  const c = t(locale);
  return (
    <article className="religious-card surface">
      <div className="item-number">{number}</div>
      <p className="arabic-reading">{c.noContent}</p>
      <p className="muted">{c.placeholderBody}</p>
      <hr />
      <div className="source-row">
        <span className="chip">✓ {c.verifiedStructure}</span>
        <span>{c.sourcePending}</span>
      </div>
    </article>
  );
}
