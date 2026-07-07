"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import type { SitePopup } from "@/lib/site-popups";
import { publicAssetPath } from "@/lib/legacy-paths";
import { withBasePath } from "@/lib/base-path";
import { cn } from "@/lib/utils";

type SitePopupProps = {
  popup: SitePopup | null;
};

function normalizeHref(href?: string | null): string | null {
  const value = href?.trim();

  if (!value) {
    return null;
  }

  if (/^(https?:|mailto:|tel:|#)/.test(value)) {
    return value;
  }

  return withBasePath(value.startsWith("/") ? value : `/${value}`);
}

export function SpecialSitePopup({ popup }: SitePopupProps) {
  const [open, setOpen] = useState(false);
  const storageKey = popup ? `srpoly-site-popup-${popup.id}` : "";
  const imageSrc = useMemo(() => publicAssetPath(popup?.imagePath), [popup?.imagePath]);
  const primaryHref = normalizeHref(popup?.primaryHref);
  const paragraphs = useMemo(
    () =>
      (popup?.body ?? "")
        .split(/\n{2,}|\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    [popup?.body]
  );

  useEffect(() => {
    if (!popup) {
      return;
    }

    if (popup.showFrequency === "once_per_session" && sessionStorage.getItem(storageKey) === "closed") {
      return;
    }

    let mounted = true;
    queueMicrotask(() => {
      if (mounted) {
        setOpen(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [popup, storageKey]);

  if (!popup || !open) {
    return null;
  }

  const rememberAndClose = () => {
    if (popup.showFrequency === "once_per_session") {
      sessionStorage.setItem(storageKey, "closed");
    }

    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`site-popup-title-${popup.id}`}
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-md border border-white/70 bg-white text-slate-950 shadow-2xl shadow-slate-950/30 md:grid-cols-[1.05fr_0.95fr]"
      >
        <button
          type="button"
          onClick={rememberAndClose}
          aria-label="ปิดป๊อปอัป"
          className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-950"
        >
          <X className="size-4" />
        </button>

        <div className={cn("flex min-h-0 flex-col justify-center gap-5 p-6 md:p-8", !imageSrc && "md:col-span-2")}>
          {popup.eyebrow ? (
            <p className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
              {popup.eyebrow}
            </p>
          ) : null}

          <div className="space-y-3">
            <h2 id={`site-popup-title-${popup.id}`} className="text-2xl font-extrabold leading-tight text-slate-950 md:text-4xl">
              {popup.title}
            </h2>
            {paragraphs.length ? (
              <div className="space-y-2 text-sm leading-7 text-slate-600 md:text-base">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            {primaryHref ? (
              <a
                href={primaryHref}
                target={popup.primaryTarget === "blank" ? "_blank" : undefined}
                rel={popup.primaryTarget === "blank" ? "noreferrer" : undefined}
                onClick={rememberAndClose}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:opacity-90"
              >
                {popup.primaryLabel?.trim() || "ดูรายละเอียด"}
                <ArrowUpRight className="size-4" />
              </a>
            ) : null}
            <button
              type="button"
              onClick={rememberAndClose}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
            >
              {popup.secondaryLabel?.trim() || "เข้าสู่เว็บไซต์"}
            </button>
          </div>
        </div>

        {imageSrc ? (
          <div className="flex min-h-[260px] items-center justify-center bg-slate-100 p-4 md:min-h-[420px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={popup.imageAlt?.trim() || popup.title}
              className="max-h-[72vh] w-full rounded-md object-contain shadow-sm"
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
