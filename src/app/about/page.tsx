import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Building2, ShieldCheck, CreditCard, HeartHandshake, Instagram, Linkedin, Twitter, Youtube, Target, Eye, Users } from "lucide-react";
import { siteConfig } from "@/lib/site";

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-32 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center">
        <Badge className="mb-6 bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300">About Nestmate</Badge>
        <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl md:text-6xl">
          Building trust in India's accommodation infrastructure.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Nestmate exists to solve the trust deficit in the rental and PG market. We provide a platform where tenants can book with confidence, knowing every listing and host is verified.
        </p>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-4xl text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-950 dark:text-slate-50">Our Story</h2>
        <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          We started Nestmate after facing our own struggles with finding reliable PGs and rental homes in new cities. The market was flooded with fake photos, hidden fees, and unreliable hosts. We realized that students and young professionals deserved a better, safer, and more transparent way to find accommodation. Nestmate was built to be the single source of truth for safe housing.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <Card className="flex flex-col gap-4 p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/50">
            <Target className="h-6 w-6 text-teal-700 dark:text-teal-400" />
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-950 dark:text-slate-50">Our Mission</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            To empower individuals to find secure, comfortable, and affordable living spaces across India by bridging the gap between honest hosts and responsible tenants through verified infrastructure.
          </p>
        </Card>
        <Card className="flex flex-col gap-4 p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/50">
            <Eye className="h-6 w-6 text-teal-700 dark:text-teal-400" />
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-950 dark:text-slate-50">Our Vision</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            To become the most trusted accommodation marketplace in the country, fostering communities where people feel at home from the moment they arrive in a new city.
          </p>
        </Card>
      </section>

      {/* Key Features */}
      <section className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Verified Listings",
            description: "Every property goes through a manual review process to ensure it exists and matches the photos.",
            icon: Building2,
          },
          {
            title: "Secure Payments",
            description: "Rent and deposits are handled securely through our platform, protecting both tenants and hosts.",
            icon: CreditCard,
          },
          {
            title: "Trust & Safety",
            description: "Verified profiles, reviews, and host background checks create a safe community for everyone.",
            icon: ShieldCheck,
          },
          {
            title: "Dedicated Support",
            description: "Our team is always here to help mediate disputes or assist with your move-in process.",
            icon: HeartHandshake,
          },
        ].map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="flex flex-col gap-4 p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800">
                <Icon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-950 dark:text-slate-50">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            </Card>
          );
        })}
      </section>

      {/* Socials */}
      <section className="mx-auto flex max-w-2xl flex-col items-center rounded-[2rem] bg-slate-50 p-10 text-center dark:bg-slate-900">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-950 dark:text-slate-50">Join our community</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400">Follow us for updates, new listings, and stories from our hosts and guests.</p>
        <div className="mt-8 flex gap-6">
          <a href={siteConfig.links?.instagram || "#"} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:scale-110 hover:text-teal-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-teal-400"><Instagram className="h-6 w-6" /></a>
          <a href="#" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:scale-110 hover:text-teal-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-teal-400"><Twitter className="h-6 w-6" /></a>
          <a href="#" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:scale-110 hover:text-teal-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-teal-400"><Linkedin className="h-6 w-6" /></a>
        </div>
      </section>
    </main>
  );
}
