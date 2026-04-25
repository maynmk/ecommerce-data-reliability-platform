import { API_URL } from "./config";

export async function apiGet<T>(path: string): Promise<T> {
  const url = new URL(path, API_URL);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Request failed: ${path} (${response.status})${text ? ` - ${text}` : ""}`,
    );
  }
  return (await response.json()) as T;
}

