import { redirect } from "next/navigation";

export default async function DemoEntry({ searchParams }: { searchParams: Promise<{ prompt?: string }> }) {
  const { prompt } = await searchParams;
  redirect(typeof prompt === "string" ? `/studio?prompt=${encodeURIComponent(prompt)}` : "/studio");
}
