import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { generateMetadata as homeMetadata } from "../src/app/[locale]/page.tsx";
import { generateMetadata as quranMetadata } from "../src/app/[locale]/quran/page.tsx";
import { generateMetadata as surahMetadata } from "../src/app/[locale]/quran/[surah]/page.tsx";
import { generateMetadata as adhkarMetadata } from "../src/app/[locale]/adhkar/page.tsx";
import { generateMetadata as periodMetadata } from "../src/app/[locale]/adhkar/[period]/page.tsx";
import { generateMetadata as generalDuasMetadata } from "../src/app/[locale]/duas/general/page.tsx";
import { generateMetadata as generalDuaMetadata } from "../src/app/[locale]/duas/general/[slug]/page.tsx";
import { generateMetadata as tasbeehMetadata } from "../src/app/[locale]/tasbeeh/page.tsx";
import { metadata as searchMetadata } from "../src/app/[locale]/search/page.tsx";
import { t } from "../src/lib/i18n.ts";
import { generalDuas } from "../src/lib/general-duas.ts";
import { SITE_ORIGIN } from "../src/lib/seo.ts";

// `showcase/page.tsx` transitively imports `src/components/shell.tsx`, which
// imports `next/font/local` — a Next.js build-time macro that throws when
// loaded outside a real Next.js compilation (a pre-existing runtime boundary,
// not introduced by this unit). Its noindex metadata is verified structurally
// (source inspection) instead of by direct behavioral import.
const root = process.cwd();
async function source(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

function params(extra) {
  return Promise.resolve({ locale: "ar", ...extra });
}

async function isNotFound(fn) {
  try {
    await fn();
    return false;
  } catch (error) {
    return error?.digest === "NEXT_HTTP_ERROR_FALLBACK;404";
  }
}

test("production host used for metadata resolution is al-samad.com", () => {
  assert.equal(SITE_ORIGIN, "https://al-samad.com");
});

const staticRoutes = [
  {
    name: "homepage",
    generate: homeMetadata,
    path: "",
    titleFor: (c) => c.heroTitle,
    descriptionFor: (c) => c.heroBody,
  },
  {
    name: "quran index",
    generate: quranMetadata,
    path: "/quran",
    titleFor: (c) => c.quran,
    descriptionFor: (c) => c.placeholderBody,
  },
  {
    name: "adhkar index",
    generate: adhkarMetadata,
    path: "/adhkar",
    titleFor: (c) => c.adhkar,
    descriptionFor: (c) => c.adhkarIndexBody,
  },
  {
    name: "tasbeeh",
    generate: tasbeehMetadata,
    path: "/tasbeeh",
    titleFor: (c) => c.tasbeeh,
    descriptionFor: (c) =>
      c === t("ar")
        ? "عداد محلي هادئ؛ لا نقاط ولا تصنيفات."
        : "A calm local-only counter with no points or rankings.",
  },
];

for (const route of staticRoutes) {
  for (const locale of ["ar", "en"]) {
    test(`${route.name} (${locale}): localized title/description and self-canonical/alternates`, async () => {
      const c = t(locale);
      const meta = await route.generate({ params: params({ locale }) });
      assert.equal(meta.title, route.titleFor(c));
      assert.equal(meta.description, route.descriptionFor(c));
      assert.equal(meta.alternates.canonical, `/${locale}${route.path}`);
      assert.deepEqual(meta.alternates.languages, {
        ar: `/ar${route.path}`,
        en: `/en${route.path}`,
      });
    });
  }
}

test("homepage metadata differs by locale (no universal English leak on Arabic route)", async () => {
  const ar = await homeMetadata({ params: params({ locale: "ar" }) });
  const en = await homeMetadata({ params: params({ locale: "en" }) });
  assert.notEqual(ar.title, en.title);
  assert.notEqual(ar.description, en.description);
});

test("duas/general index: localized title/description and self-canonical/alternates", async () => {
  for (const locale of ["ar", "en"]) {
    const meta = await generalDuasMetadata({ params: params({ locale }) });
    assert.equal(meta.title, locale === "ar" ? "أدعية عامة" : "General Duas");
    assert.ok(meta.description.length > 0);
    assert.equal(meta.alternates.canonical, `/${locale}/duas/general`);
    assert.deepEqual(meta.alternates.languages, {
      ar: "/ar/duas/general",
      en: "/en/duas/general",
    });
  }
});

test("duas/general/[slug]: metadata derives from committed dua data, not fabricated", async () => {
  const dua = generalDuas[0];
  for (const locale of ["ar", "en"]) {
    const meta = await generalDuaMetadata({
      params: params({ locale, slug: dua.slug }),
    });
    assert.equal(meta.title, dua.title[locale]);
    assert.equal(meta.description, dua.purpose[locale]);
    const path = `/duas/general/${dua.slug}`;
    assert.equal(meta.alternates.canonical, `/${locale}${path}`);
    assert.deepEqual(meta.alternates.languages, {
      ar: `/ar${path}`,
      en: `/en${path}`,
    });
  }
});

test("duas/general/[slug]: unknown slug fails safely (matches route's own notFound() truth)", async () => {
  assert.ok(
    await isNotFound(() =>
      generalDuaMetadata({
        params: params({ locale: "en", slug: "not-a-real-dua-slug" }),
      }),
    ),
  );
});

test("quran/[surah]: metadata reflects the honest status label, not fabricated surah names", async () => {
  for (const locale of ["ar", "en"]) {
    const meta = await surahMetadata({
      params: params({ locale, surah: "1" }),
    });
    assert.equal(meta.title, locale === "ar" ? "سورة 1" : "Surah 1");
    assert.ok(meta.description.length > 0);
    assert.ok(meta.description.includes(meta.title));
    const path = "/quran/1";
    assert.equal(meta.alternates.canonical, `/${locale}${path}`);
    assert.deepEqual(meta.alternates.languages, {
      ar: `/ar${path}`,
      en: `/en${path}`,
    });
  }
});

test("quran/[surah]: descriptions are route-specific, not byte-identical across surahs", async () => {
  for (const locale of ["ar", "en"]) {
    const surah1 = await surahMetadata({
      params: params({ locale, surah: "1" }),
    });
    const surah2 = await surahMetadata({
      params: params({ locale, surah: "2" }),
    });
    assert.notEqual(surah1.title, surah2.title);
    assert.notEqual(surah1.description, surah2.description);
  }
});

test("quran/[surah]: malformed/unknown surah fails safely, consistent with the page's own notFound()", async () => {
  assert.ok(
    await isNotFound(() =>
      surahMetadata({ params: params({ locale: "en", surah: "not-a-surah" }) }),
    ),
  );
});

test("quran/[surah]: invalid locale yields empty metadata", async () => {
  const meta = await surahMetadata({
    params: params({ locale: "fr", surah: "1" }),
  });
  assert.deepEqual(meta, {});
});

test("adhkar/[period]: morning and evening get honest, distinct localized metadata", async () => {
  for (const locale of ["ar", "en"]) {
    const c = t(locale);
    const morning = await periodMetadata({
      params: params({ locale, period: "morning" }),
    });
    const evening = await periodMetadata({
      params: params({ locale, period: "evening" }),
    });
    assert.equal(morning.title, c.morning);
    assert.equal(evening.title, c.evening);
    assert.notEqual(morning.title, evening.title);
    assert.notEqual(morning.description, evening.description);
    assert.ok(morning.description.includes(c.morning));
    assert.ok(evening.description.includes(c.evening));
    assert.equal(morning.alternates.canonical, `/${locale}/adhkar/morning`);
    assert.equal(evening.alternates.canonical, `/${locale}/adhkar/evening`);
  }
});

test("adhkar/[period]: an unimplemented/unknown period fails safely, consistent with the page's own notFound()", async () => {
  assert.ok(
    await isNotFound(() =>
      periodMetadata({ params: params({ locale: "en", period: "sleep" }) }),
    ),
  );
  assert.ok(
    await isNotFound(() =>
      periodMetadata({
        params: params({ locale: "en", period: "not-a-period" }),
      }),
    ),
  );
});

test("adhkar/[period]: invalid locale yields empty metadata", async () => {
  const meta = await periodMetadata({
    params: params({ locale: "fr", period: "morning" }),
  });
  assert.deepEqual(meta, {});
});

test("duas/general/[slug]: invalid locale yields empty metadata", async () => {
  const dua = generalDuas[0];
  const meta = await generalDuaMetadata({
    params: params({ locale: "fr", slug: dua.slug }),
  });
  assert.deepEqual(meta, {});
});

test("/search carries noindex (behavioral)", async () => {
  assert.deepEqual(searchMetadata.robots, { index: false, follow: true });
});

test("/showcase carries noindex (structural — see runtime-boundary note above)", async () => {
  const src = await source("src/app/[locale]/showcase/page.tsx");
  assert.match(
    src,
    /export const metadata:\s*Metadata\s*=\s*\{\s*robots:\s*\{\s*index:\s*false,\s*follow:\s*true,?\s*\},?\s*\};/,
  );
});

test("no other route this unit touches carries noindex", async () => {
  for (const meta of [
    await homeMetadata({ params: params({ locale: "en" }) }),
    await quranMetadata({ params: params({ locale: "en" }) }),
    await adhkarMetadata({ params: params({ locale: "en" }) }),
    await generalDuasMetadata({ params: params({ locale: "en" }) }),
    await tasbeehMetadata({ params: params({ locale: "en" }) }),
    await surahMetadata({ params: params({ locale: "en", surah: "1" }) }),
    await periodMetadata({
      params: params({ locale: "en", period: "morning" }),
    }),
  ]) {
    assert.equal(meta.robots, undefined);
  }
});

test("invalid locale param yields empty metadata rather than a fabricated fallback", async () => {
  const meta = await homeMetadata({ params: params({ locale: "fr" }) });
  assert.deepEqual(meta, {});
});
