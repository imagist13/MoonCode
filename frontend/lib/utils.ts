import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale = "zh-CN") {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function relativeTime(date: string | Date, locale = "zh-CN") {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (diff < minute) return rtf.format(-Math.round(diff / 1000), "second");
  if (diff < hour) return rtf.format(-Math.round(diff / minute), "minute");
  if (diff < day) return rtf.format(-Math.round(diff / hour), "hour");
  if (diff < 30 * day) return rtf.format(-Math.round(diff / day), "day");
  return formatDate(d, locale);
}

export function readingTime(text: string, cpm = 350) {
  const chars = text?.trim().length ?? 0;
  if (!chars) return 0;
  return Math.max(1, Math.ceil(chars / cpm));
}
