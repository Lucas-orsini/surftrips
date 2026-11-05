import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMonthTheme } from "@/lib/editorial/themes";
import { getThemePage } from "@/lib/editorial/theme-data";
import { pageMetadata } from "@/lib/seo";
import { ThemePage } from "@/components/editorial/ThemePage";

type Props = { params: Promise<{ mois: string }> };
export const dynamic = "force-dynamic";

async function load({ params }: Props) {
  const theme = getMonthTheme((await params).mois);
  if (!theme) notFound();
  const data = await getThemePage(theme.id);
  if (!data) notFound();
  return data;
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { theme } = await load(props);
  return pageMetadata(theme.title, theme.description, theme.path);
}
export default async function MonthPage(props: Props) {
  return <ThemePage {...await load(props)} />;
}
