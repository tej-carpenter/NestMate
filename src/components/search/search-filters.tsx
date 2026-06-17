"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Select } from "@/components/ui/select";

const propertyTypes = ["pg", "room", "bed", "lodge", "apartment"] as const;
const genders = ["any", "male", "female"] as const;

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = useMemo(() => searchParams.toString(), [searchParams]);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") ?? "");
  const [gender, setGender] = useState(searchParams.get("gender") ?? "any");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function applyFilters() {
    const params = new URLSearchParams(initial);

    if (query) params.set("q", query);
    else params.delete("q");
    if (city) params.set("city", city);
    else params.delete("city");
    if (propertyType) params.set("propertyType", propertyType);
    else params.delete("propertyType");
    if (gender && gender !== "any") params.set("gender", gender);
    else params.delete("gender");
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    router.push(`/search?${params.toString()}`);
  }

  const quickChips = [
    { label: "Near metro", value: "metro" },
    { label: "Under 12k", value: "12000" },
    { label: "Female only", value: "female" },
    { label: "PGs", value: "pg" },
  ];

  const activeSummary = [
    query ? "Search text" : null,
    city ? "City" : null,
    propertyType ? "Type" : null,
    gender !== "any" ? "Gender" : null,
    minPrice ? "Min price" : null,
    maxPrice ? "Max price" : null,
  ].filter(Boolean);

  return (
    <section className="rounded-[24px] bg-[color:var(--surface)] p-6 shadow-sm border border-[color:var(--border)] sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[color:var(--foreground)]">Tell us what matters.</h2>
          <p className="mt-2 text-[15px] text-[color:var(--muted)]">Start with a city or keyword, then reveal the rest if you need tighter control.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[13px] font-medium text-[color:var(--muted)] sm:justify-end">
          {activeSummary.length > 0 ? (
            activeSummary.map((item) => (
              <Badge key={item} className="rounded-md border-0 bg-black/5 px-3 py-1.5 text-[color:var(--foreground)] dark:bg-white/10">{item}</Badge>
            ))
          ) : (
            <Badge className="rounded-md border-0 bg-black/5 px-3 py-1.5 text-[color:var(--foreground)] dark:bg-white/10">Smart defaults on</Badge>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {quickChips.map((chip) => {
          const active =
            (chip.value === "metro" && query.includes("metro")) ||
            (chip.value === "12000" && maxPrice === "12000") ||
            (chip.value === "female" && gender === "female") ||
            (chip.value === "pg" && propertyType === "pg");

          return (
            <button
              key={chip.label}
              type="button"
              className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
                active 
                  ? "bg-[color:var(--foreground)] text-[color:var(--background)]" 
                  : "bg-black/5 text-[color:var(--foreground)] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
              }`}
              onClick={() => {
                if (chip.value === "metro") setQuery("metro near metro station");
                if (chip.value === "12000") setMaxPrice("12000");
                if (chip.value === "female") setGender("female");
                if (chip.value === "pg") setPropertyType("pg");
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
        <label className="space-y-2">
          <span className="text-[14px] font-medium text-[color:var(--foreground)]">Search</span>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Locality, landmark, or title" className="bg-transparent" />
        </label>
        <label className="space-y-2">
          <span className="text-[14px] font-medium text-[color:var(--foreground)]">City</span>
          <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Indore" className="bg-transparent" />
        </label>
        <label className="space-y-2">
          <span className="text-[14px] font-medium text-[color:var(--foreground)]">Budget cap</span>
          <Input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} inputMode="numeric" placeholder="15000" className="bg-transparent" />
        </label>
      </div>

      <details className="group mt-6">
        <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-[14px] font-medium text-[color:var(--foreground)] hover:text-[color:var(--muted)]">
          <span>More filters</span>
          <span className="text-[10px] transition-transform group-open:rotate-180">▼</span>
        </summary>
        <div className="mt-6 grid gap-4 rounded-xl bg-black/5 p-6 dark:bg-white/5 sm:grid-cols-3">
          <label className="space-y-2">
            <span className="text-[14px] font-medium text-[color:var(--foreground)]">Property type</span>
            <Select value={propertyType} onChange={(event) => setPropertyType(event.target.value)} className="bg-[color:var(--surface)]">
              <option value="">Any</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-[14px] font-medium text-[color:var(--foreground)]">Gender</span>
            <Select value={gender} onChange={(event) => setGender(event.target.value)} className="bg-[color:var(--surface)]">
              {genders.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-[14px] font-medium text-[color:var(--foreground)]">Min price</span>
            <Input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} inputMode="numeric" placeholder="5000" className="bg-[color:var(--surface)]" />
          </label>
        </div>
      </details>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/search")}>Reset</Button>
        <Button type="button" onClick={applyFilters}>Apply filters</Button>
      </div>
    </section>
  );
}