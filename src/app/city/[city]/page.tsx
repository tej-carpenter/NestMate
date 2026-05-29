import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return siteConfig.cityPages.map((city) => ({ city }));
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const resolvedParams = await params;

  if (!siteConfig.cityPages.includes(resolvedParams.city as (typeof siteConfig.cityPages)[number])) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">SEO city page</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-slate-950">Accommodation in {resolvedParams.city}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">Use this page for SSR city landing content, inventory summaries, and locality-specific search capture.</p>
      </Card>
    </main>
  );
}