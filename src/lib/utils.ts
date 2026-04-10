import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export function generateSlug(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export function sanitizeRichHtml(value: string) {
  let html = value || ""

  html = html.replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, "")

  html = html.replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
  html = html.replace(/\sstyle=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")

  html = html.replace(/\s(href|src)=("|')\s*(javascript:|vbscript:|data:)[\s\S]*?\2/gi, "")

  html = html.replace(/<(?!\/?(p|br|strong|b|em|i|u|h2|h3|ul|ol|li|a|img)(\s|>|\/))/gi, "&lt;")

  return html.trim()
}
