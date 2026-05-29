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
    <section className="glass-panel rounded-[2rem] border border-[color:var(--border)] p-4 shadow-sm shadow-slate-900/5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge className="bg-teal-50 text-teal-950 dark:bg-teal-500/15 dark:text-teal-100">Quick search</Badge>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-50">Tell us the first thing that matters.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Start with city or keyword, then reveal the rest only if you need tighter control.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 sm:justify-end">
          {activeSummary.length > 0 ? (
            activeSummary.map((item) => (
              <Chip key={item} className="!rounded-full px-3 py-1.5">{item}</Chip>
            ))
          ) : (
            <Chip className="!rounded-full px-3 py-1.5">Smart defaults on</Chip>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
              onClick={() => {
                if (chip.value === "metro") setQuery("metro near metro station");
                if (chip.value === "12000") setMaxPrice("12000");
                if (chip.value === "female") setGender("female");
                if (chip.value === "pg") setPropertyType("pg");
              }}
            >
              <Chip className={active ? "border-teal-500/40 bg-teal-50 text-teal-900" : ""}>{chip.label}</Chip>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Search</span>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Locality, landmark, or listing title" />
        </label>
        <label className="min-w-0 space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">City</span>
          <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Bengaluru" />
        </label>
        <label className="min-w-0 space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Budget cap</span>
          <Input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} inputMode="numeric" placeholder="15000" />
        </label>
      </div>

      <details className="mt-4 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950 dark:text-slate-50">More filters</summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Property type</span>
            <Select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
              <option value="">Any</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</span>
            <Select value={gender} onChange={(event) => setGender(event.target.value)}>
              {genders.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Min price</span>
            <Input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} inputMode="numeric" placeholder="5000" />
          </label>
          <div className="flex items-end">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">The page starts simple and expands only when you need tighter control.</p>
          </div>
        </div>
      </details>

      <div className="mt-5 hidden flex-col gap-3 sm:flex sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/search")}>Reset</Button>
        <Button type="button" onClick={applyFilters}>Apply filters</Button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-[color:var(--surface)]/96 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex w-full max-w-7xl gap-3 px-1">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/search")}>Reset</Button>
          <Button type="button" className="flex-1" onClick={applyFilters}>Apply filters</Button>
        </div>
      </div>
    </section>
  );
}