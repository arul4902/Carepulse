import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes conditionally
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Deep clone any value
export const parseStringify = (value: unknown): unknown =>
  JSON.parse(JSON.stringify(value));

// Convert a file to a blob URL
export const convertFileToUrl = (file: File): string =>
  URL.createObjectURL(file);

// Format date/time with multiple variants
export const formatDateTime = (
  dateString: Date | string,
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
) => {
  const baseDate = new Date(dateString);

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone,
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
    day: "numeric",
    timeZone,
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone,
  };

  return {
    dateTime: baseDate.toLocaleString("en-US", dateTimeOptions),
    dateDay: baseDate.toLocaleString("en-US", dateDayOptions),
    dateOnly: baseDate.toLocaleString("en-US", dateOptions),
    timeOnly: baseDate.toLocaleString("en-US", timeOptions),
  };
};

// Base64 encode a passkey
export function encryptKey(passkey: string): string {
  return btoa(passkey);
}

// Base64 decode a passkey
export function decryptKey(passkey: string): string {
  return atob(passkey);
}
