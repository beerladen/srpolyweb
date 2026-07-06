"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Search, Star } from "lucide-react";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminUser } from "@/lib/admin-auth";
import type { AdminCrudModuleConfig, AdminCrudRow } from "@/lib/admin-crud-config";
import { withBasePath } from "@/lib/base-path";
import type { ContentItem, NewsCategory } from "@/lib/site-data";

type HomeNewsShowcaseProps = {
  news: ContentItem[];
  categories: NewsCategory[];
  user?: AdminUser | null;
  newsConfig?: AdminCrudModuleConfig | null;
  newsRows?: AdminCrudRow[] | null;
  categoryConfig?: AdminCrudModuleConfig | null;
};

const homepageCategorySlugs = ["general", "activities", "procurement-news", "announcements-news"];
const maxHomepageCategoryTabs = 8;

function displayDate(value?: string | Date): string {
  if (!value) {
    return "เผยแพร่แล้ว";
  }

  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function imageStyle(item: ContentItem) {
  return { backgroundImage: `url("${withBasePath(item.image ?? "/assets/images/hero-campus.png")}")` };
}

function matchesCategory(item: ContentItem, category: NewsCategory | null): boolean {
  if (!category || category.slug === "all") {
    return true;
  }

  return item.categorySlug === category.slug || item.categoryId === category.id;
}

export function HomeNewsShowcase({
  news,
  categories,
  user,
  newsConfig,
  newsRows,
  categoryConfig,
}: HomeNewsShowcaseProps) {
  const [activeCategorySlug, setActiveCategorySlug] = useState("all");
  const [query, setQuery] = useState("");
  const newsRowsById = useMemo(() => new Map((newsRows ?? []).map((row) => [row.id, row])), [newsRows]);
  const tabs = useMemo(() => {
    const preferredCategories = homepageCategorySlugs
      .map((slug) => categories.find((category) => category.slug === slug))
      .filter((category): category is NewsCategory => Boolean(category));
    const preferredIds = new Set(preferredCategories.map((category) => category.id));
    const extraCategories = categories.filter((category) => !preferredIds.has(category.id));
    const visibleCategories = [...preferredCategories, ...extraCategories].slice(0, maxHomepageCategoryTabs);

    return [{ id: 0, name: "ทั้งหมด", slug: "all" }, ...visibleCategories];
  }, [categories]);
  const activeCategory = tabs.find((category) => category.slug === activeCategorySlug) ?? tabs[0] ?? null;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredNews = news.filter((item) => {
    const isCategoryMatch = matchesCategory(item, activeCategory);

    if (!normalizedQuery) {
      return isCategoryMatch;
    }

    const haystack = `${item.title} ${item.description ?? ""} ${item.category ?? ""}`.toLowerCase();
    return isCategoryMatch && haystack.includes(normalizedQuery);
  });
  const featuredCandidates = filteredNews.filter((item) => item.isFeatured);
  const leadItem = featuredCandidates[0] ?? filteredNews[0];
  const sideItems = filteredNews.filter((item) => item.id !== leadItem?.id).slice(0, 5);

  return (
    <section className="border-y border-blue-100 bg-gradient-to-b from-white via-sky-50/70 to-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold tracking-normal text-slate-950 md:text-4xl">ข่าวประชาสัมพันธ์</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ข่าวเด่น ข่าวกิจกรรม ประกาศ และข้อมูลสำคัญของวิทยาลัย แสดงผลตามหมวดและค้นหาได้ทันที
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาข่าว"
                className="h-10 border-blue-100 bg-white pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryConfig ? (
                <AdminCrudCreateButton
                  user={user}
                  permission={categoryConfig.permission}
                  moduleKey={categoryConfig.key}
                  moduleLabel={categoryConfig.label}
                  fields={categoryConfig.fields}
                  afterCreateHref="/"
                  label="เพิ่มหมวด"
                />
              ) : null}
              {newsConfig ? (
                <AdminCrudCreateButton
                  user={user}
                  permission={newsConfig.permission}
                  moduleKey={newsConfig.key}
                  moduleLabel={newsConfig.label}
                  fields={newsConfig.fields}
                  afterCreateHref="/"
                  label="เพิ่มข่าว"
                />
              ) : null}
              <Button asChild variant="outline" className="border-blue-200 bg-white">
                <Link href="/news">
                  ดูข่าวทั้งหมด
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div data-home-news-tabs className="flex flex-wrap gap-2">
          {tabs.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActiveCategorySlug(category.slug)}
              className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
                activeCategorySlug === category.slug
                  ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                  : "border-blue-100 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {leadItem ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
            <article className="relative min-h-[440px] overflow-hidden rounded-lg border border-blue-100 bg-slate-900 shadow-xl shadow-blue-950/10">
              <div className="absolute inset-0 bg-cover bg-center" style={imageStyle(leadItem)} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
              <div className="relative flex min-h-[440px] flex-col justify-end gap-4 p-5 text-white md:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-sky-400 text-blue-950 hover:bg-sky-400">
                    <Star className="mr-1 size-3.5" />
                    ข่าวเด่น
                  </Badge>
                  {leadItem.category ? <Badge variant="secondary">{leadItem.category}</Badge> : null}
                </div>
                <div className="max-w-3xl">
                  <h3 className="text-2xl font-extrabold leading-9 md:text-3xl">{leadItem.title}</h3>
                  {leadItem.description ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-200 md:text-base">
                      {leadItem.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-sm text-slate-200">
                    <CalendarDays className="size-4" />
                    {displayDate(leadItem.date)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {newsConfig && newsRowsById.get(leadItem.id) ? (
                      <AdminCrudTools
                        user={user}
                        permission={newsConfig.permission}
                        moduleKey={newsConfig.key}
                        moduleLabel={newsConfig.label}
                        fields={newsConfig.fields}
                        row={newsRowsById.get(leadItem.id)}
                        label="จัดการข่าว"
                        triggerSize="sm"
                        className="bg-white text-blue-950 hover:bg-sky-50"
                      />
                    ) : null}
                    <Button asChild className="bg-white text-blue-950 hover:bg-sky-50">
                      <Link href={leadItem.href}>
                        อ่านข่าว
                        <ArrowRight data-icon="inline-end" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </article>

            <div data-home-news-side-list className="flex flex-col gap-2.5">
              {sideItems.map((item) => (
                <article
                  key={item.id}
                  className="grid h-20 grid-cols-[104px_1fr] overflow-hidden rounded-md border border-blue-100 bg-white shadow-sm shadow-blue-950/5 transition-colors hover:border-blue-200 hover:bg-sky-50/40 sm:grid-cols-[128px_1fr]"
                >
                  <Link href={item.href} className="h-20 bg-cover bg-center" style={imageStyle(item)} aria-label={item.title} />
                  <div className="flex min-w-0 flex-col justify-center gap-1 overflow-hidden p-2.5">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2 text-xs">
                        <span className="min-w-0 truncate font-semibold text-blue-700">
                          {item.category ?? "ข่าวประชาสัมพันธ์"}
                        </span>
                        <span className="shrink-0 font-medium text-slate-500">{displayDate(item.date)}</span>
                      </span>
                      {newsConfig && newsRowsById.get(item.id) ? (
                        <AdminCrudTools
                          user={user}
                          permission={newsConfig.permission}
                          moduleKey={newsConfig.key}
                          moduleLabel={newsConfig.label}
                          fields={newsConfig.fields}
                          row={newsRowsById.get(item.id)}
                          label="จัดการ"
                          triggerSize="sm"
                          className="h-8 px-2 text-xs"
                        />
                      ) : null}
                    </div>
                    <Link href={item.href} className="line-clamp-1 text-sm font-bold leading-5 text-slate-950 hover:text-blue-700">
                      {item.title}
                    </Link>
                  </div>
                </article>
              ))}
              {!sideItems.length ? (
                <div className="flex min-h-[440px] items-center justify-center rounded-lg border border-dashed border-blue-200 bg-white text-sm text-slate-500">
                  เลือกข่าวเป็นข่าวเด่นเพิ่มเติมได้จากหลังบ้าน
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-blue-200 bg-white p-8 text-center text-sm text-slate-500">
            ไม่พบข่าวในเงื่อนไขนี้
          </div>
        )}
      </div>
    </section>
  );
}
