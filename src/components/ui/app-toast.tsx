"use client";

import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type AppToastType = "success" | "error" | "info";

type AppToastPayload = {
  title?: string;
  message: string;
  type?: AppToastType;
};

type AppToastItem = AppToastPayload & {
  id: number;
  type: AppToastType;
};

export const APP_TOAST_EVENT = "srpoly:toast";

export function showAppToast(payload: AppToastPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<AppToastPayload>(APP_TOAST_EVENT, { detail: payload }));
}

function ToastIcon({ type }: { type: AppToastType }) {
  if (type === "error") {
    return <CircleAlert className="size-5 text-red-600" />;
  }

  if (type === "info") {
    return <Info className="size-5 text-blue-600" />;
  }

  return <CheckCircle2 className="size-5 text-emerald-600" />;
}

export function AppToastProvider() {
  const [items, setItems] = useState<AppToastItem[]>([]);

  useEffect(() => {
    function handleToast(event: Event) {
      const payload = (event as CustomEvent<AppToastPayload>).detail;

      if (!payload?.message) {
        return;
      }

      const id = Date.now() + Math.round(Math.random() * 1000);
      const item: AppToastItem = {
        ...payload,
        id,
        type: payload.type ?? "success",
      };

      setItems((current) => [...current.slice(-2), item]);
      window.setTimeout(() => {
        setItems((current) => current.filter((toast) => toast.id !== id));
      }, 3600);
    }

    window.addEventListener(APP_TOAST_EVENT, handleToast);
    return () => window.removeEventListener(APP_TOAST_EVENT, handleToast);
  }, []);

  if (!items.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          role="status"
          className="rounded-lg border border-blue-100 bg-white p-4 shadow-xl shadow-blue-950/15 ring-1 ring-black/5"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-50">
              <ToastIcon type={item.type} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-950">{item.title ?? (item.type === "error" ? "ไม่สำเร็จ" : "สำเร็จ")}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="-mr-1 -mt-1"
              onClick={() => setItems((current) => current.filter((toast) => toast.id !== item.id))}
            >
              <X className="size-4" />
              <span className="sr-only">ปิดการแจ้งเตือน</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
