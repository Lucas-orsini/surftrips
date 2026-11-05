import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getThemePage } from "@/lib/editorial/theme-data";
import { pageMetadata } from "@/lib/seo";
import { ThemePage } from "@/components/editorial/ThemePage";

export const dynamic = "force-dynamic";
async function load() {
  const data = await getThemePage("ericeira-vs-peniche");
  if (!data) notFound();
  return data;
}
export async function generateMetadata(): Promise<Metadata> {
  const { theme } = await load();
  return pageMetadata(theme.title, theme.description, theme.path);
}
export default async function ComparisonPage() {
  return <ThemePage {...await load()} />;
}
