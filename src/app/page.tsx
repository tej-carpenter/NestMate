import Link from "next/link";
import { Button } from "@/components/ui/button";
import Stats from "@/components/home/stats";
import { MapShell } from "@/components/map/map-shell";
import { siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
      <section className="relative rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-[family-name:var(--font-display)]">A calmer way to find a stay that actually feels safe, verified, and worth moving into.</h1>
          <p className="mt-3 text-lg text-[color:var(--muted)]">{siteConfig.name} brings together verified listings, locality context, map discovery, and booking flows so the first screen feels like a real marketplace.</p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href="/search">Start searching</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/map">Explore map</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <Stats />
      </section>

      <section className="mt-10">
        <MapShell />
      </section>
    </main>
  );
}
