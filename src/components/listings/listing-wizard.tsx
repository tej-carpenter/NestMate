"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { geocodeQuery } from "@/lib/nominatim";
import { createListingFromWizard } from "@/lib/local-data";
import { listingWizardSchema, type ListingWizardInput } from "@/lib/validators/listing";
import { createListingDraftAction, publishListingAction } from "@/actions/listings";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("@/components/map/location-picker-map").then((module) => module.LocationPickerMap), {
  ssr: false,
  loading: () => <div className="flex h-[320px] items-center justify-center rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] text-sm text-[color:var(--muted)] sm:h-[380px] lg:h-[460px]">Loading location picker...</div>,
});

const defaultValues: ListingWizardInput = {
  propertyType: "pg",
  title: "",
  description: "",
  city: "",
  locality: "",
  price: 0,
  priceType: "monthly",
  amenities: [],
  genderPreference: "any",
  latitude: undefined,
  longitude: undefined,
};

const draftStorageKey = "nestmate.listingDraft.v1";

type ListingWizardDraft = {
  values: Partial<ListingWizardInput>;
  stepIndex: number;
  uploads: Array<{ name: string; size: number; type: string }>;
};

const stepDefinitions = [
  {
    title: "Property type",
    fields: ["propertyType", "title", "description"] as const,
  },
  {
    title: "Address and location",
    fields: ["city", "locality"] as const,
  },
  {
    title: "Pricing",
    fields: ["price", "priceType", "genderPreference"] as const,
  },
  {
    title: "Amenities",
    fields: ["amenities"] as const,
  },
  {
    title: "Photos",
    fields: [] as const,
  },
  {
    title: "Review and publish",
    fields: [] as const,
  },
] as const;

function parseDraft(): ListingWizardDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(draftStorageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ListingWizardDraft> | null;

    if (!parsed || typeof parsed !== "object" || !parsed.values || typeof parsed.values !== "object") {
      return null;
    }

    return {
      values: parsed.values,
      stepIndex: typeof parsed.stepIndex === "number" ? parsed.stepIndex : 0,
      uploads: Array.isArray(parsed.uploads) ? parsed.uploads.filter((item) => item && typeof item.name === "string") : [],
    };
  } catch {
    return null;
  }
}

export function ListingWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [uploadFiles, setUploadFiles] = useState<Array<{ name: string; size: number; type: string }>>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [isPending, startTransition] = useTransition();
  const hasHydratedDraftRef = useRef(false);

  const { register, handleSubmit, control, reset, trigger, setValue, formState } = useForm<ListingWizardInput>({
    resolver: zodResolver(listingWizardSchema),
    defaultValues,
    mode: "onBlur",
  });

  const values = useWatch({ control, defaultValue: defaultValues });
  const amenities = values.amenities ?? [];
  const selectedLocation = typeof values.latitude === "number" && typeof values.longitude === "number" ? { latitude: values.latitude, longitude: values.longitude } : null;

  async function resolveLocation() {
    const searchParts = [values.title, values.locality, values.city, "India"].filter((part): part is string => typeof part === "string" && part.trim().length > 0);

    if (searchParts.length < 2) {
      toast.error("Add at least a city and locality before picking a location.");
      return;
    }

    setIsResolvingLocation(true);

    try {
      const result = await geocodeQuery(searchParts.join(", "));

      if (!result) {
        toast.error("Could not find that location.");
        return;
      }

      setValue("latitude", result.lat, { shouldDirty: true, shouldValidate: true });
      setValue("longitude", result.lng, { shouldDirty: true, shouldValidate: true });
      setStatus(`Location picked for ${result.label}.`);
      toast.success("Location picked.");
    } finally {
      setIsResolvingLocation(false);
    }
  }

  function updateLocation(latitude: number, longitude: number) {
    setValue("latitude", latitude, { shouldDirty: true, shouldValidate: true });
    setValue("longitude", longitude, { shouldDirty: true, shouldValidate: true });
    setStatus(`Pinned location at ${latitude.toFixed(5)}, ${longitude.toFixed(5)}.`);
  }

  function clearLocation() {
    setValue("latitude", undefined, { shouldDirty: true, shouldValidate: true });
    setValue("longitude", undefined, { shouldDirty: true, shouldValidate: true });
    setStatus("Location cleared.");
  }

  useEffect(() => {
    const draft = parseDraft();
    hasHydratedDraftRef.current = true;

    if (!draft) {
      return;
    }

    const handle = window.setTimeout(() => {
      reset({ ...defaultValues, ...draft.values });
      setStepIndex(Math.min(stepDefinitions.length - 1, Math.max(0, draft.stepIndex)));
      setUploadFiles(draft.uploads);
    }, 0);

    return () => window.clearTimeout(handle);
  }, [reset]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasHydratedDraftRef.current) {
      return;
    }

    const handle = window.setTimeout(() => {
      const draft: ListingWizardDraft = {
        values: { ...values },
        stepIndex,
        uploads: uploadFiles,
      };

      window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    }, 400);

    return () => window.clearTimeout(handle);
  }, [stepIndex, uploadFiles, values]);

  const step = stepDefinitions[stepIndex];
  const progress = useMemo(() => `${stepIndex + 1}/${stepDefinitions.length}`, [stepIndex]);

  async function nextStep() {
    if (stepIndex < stepDefinitions.length - 1) {
      setStepIndex((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStatus(null);
    }
  }

  function previousStep() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  async function saveDraft() {
    startTransition(async () => {
      try {
        const draft: ListingWizardDraft = {
          values: { ...values },
          stepIndex,
          uploads: uploadFiles,
        };

        window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
        await createListingDraftAction(draft.values);
        setStatus("Draft saved locally. Your progress is preserved.");
        toast.success("Draft saved locally.");
      } catch {
        setStatus("Draft save failed.");
        toast.error("Draft save failed.");
      }
    });
  }

  async function publishListing() {
    const valid = await trigger();
    if (!valid) {
      setStatus("Fix validation errors before publishing.");
      return;
    }

    startTransition(async () => {
      const result = await publishListingAction(values);
      if (!result.published) {
        setStatus("Publish failed.");
        toast.error("Publish failed.");
        return;
      }

      const listing = createListingFromWizard(result.listing);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(draftStorageKey);
      }

      setStatus(`Published ${listing.title} and added it to the shared listing inventory.`);
      toast.success(`Published ${listing.title}.`);
    });
  }

  return (
    <div className="glass-panel rounded-[2rem] p-5 sm:p-8">
      <div className="flex flex-col gap-3 border-b border-[color:var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Listing wizard</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-950 dark:text-slate-50">Create a trusted listing</h1>
        </div>
        <Badge>{progress}</Badge>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        {stepDefinitions.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`min-h-24 rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${index === stepIndex ? "border-teal-700 bg-teal-50 text-teal-950 dark:bg-teal-500/15 dark:text-teal-50" : "border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--foreground)]"}`}
            onClick={() => setStepIndex(index)}
          >
            <span className="block text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Step {index + 1}</span>
            {item.title}
          </button>
        ))}
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(saveDraft)}>
        {stepIndex === 0 ? (
          <div className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
            <label className="space-y-2 lg:col-span-1">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Property type</span>
              <select className="h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 text-sm text-[color:var(--foreground)]" {...register("propertyType")}>
                <option value="pg">PG</option>
                <option value="room">Room</option>
                <option value="bed">Bed</option>
                <option value="lodge">Lodge</option>
                <option value="apartment">Apartment</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Title</span>
              <Input {...register("title")} placeholder="Fully furnished PG near Electronic City" />
            </label>
            <label className="space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Description</span>
              <Textarea {...register("description")} placeholder="Write a trustworthy, detailed description covering access, meals, safety, and bills." />
            </label>
          </div>
        ) : null}

        {stepIndex === 1 ? (
          <div className="grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">City</span>
              <Input {...register("city")} placeholder="Bengaluru" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Locality</span>
              <Input {...register("locality")} placeholder="BTM Layout" />
            </label>
            <div className="md:col-span-2 space-y-3 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">Location picker</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Geocode the address, then click the map to fine-tune the pin.</p>
                </div>
                <div className="flex gap-2">
                  {selectedLocation ? (
                    <Button type="button" variant="outline" onClick={clearLocation}>
                      Clear
                    </Button>
                  ) : null}
                  <Button type="button" onClick={resolveLocation} disabled={isResolvingLocation}>
                    {isResolvingLocation ? "Resolving..." : "Find on map"}
                  </Button>
                </div>
              </div>
              <LocationPickerMap
                value={selectedLocation}
                onPick={(point) => {
                  updateLocation(point.latitude, point.longitude);
                }}
              />
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                {selectedLocation ? `Picked ${values.latitude?.toFixed(5)}, ${values.longitude?.toFixed(5)}.` : "No coordinates selected yet."}
              </p>
            </div>
          </div>
        ) : null}

        {stepIndex === 2 ? (
          <div className="grid gap-4 md:grid-cols-[1.05fr_1fr_1fr]">
            <label className="space-y-2 md:col-span-1">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Monthly price</span>
              <Input {...register("price", { valueAsNumber: true })} inputMode="numeric" placeholder="12000" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Price type</span>
              <select className="h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 text-sm text-[color:var(--foreground)]" {...register("priceType")}>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
                <option value="bedspace">Bed space</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Gender preference</span>
              <select className="h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 text-sm text-[color:var(--foreground)]" {...register("genderPreference")}>
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </div>
        ) : null}

        {stepIndex === 3 ? (
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Amenities, comma separated</span>
              <Textarea
                value={amenities.join(", ")}
                onChange={(event) =>
                  setValue(
                    "amenities",
                    event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                    { shouldValidate: true },
                  )
                }
                placeholder="Wi-Fi, AC, meals, parking, geyser"
              />
            </label>
          </div>
        ) : null}

        {stepIndex === 4 ? (
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Listing photos</span>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  setUploadFiles(
                    Array.from(event.target.files ?? []).map((file) => ({
                      name: file.name,
                      size: file.size,
                      type: file.type,
                    })),
                  )
                }
              />
            </label>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
              <p className="font-medium text-slate-950">Selected files</p>
              <ul className="mt-2 space-y-1">
                {uploadFiles.length > 0 ? uploadFiles.map((file) => <li key={file.name}>{file.name}</li>) : <li>No files selected yet.</li>}
              </ul>
            </div>
          </div>
        ) : null}

        {stepIndex === 5 ? (
          <div className="grid gap-4 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Preview</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{values.title || "Untitled listing"}</h2>
            </div>
            <dl className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
              <div>
                <dt className="font-medium text-slate-950 dark:text-slate-50">Location</dt>
                <dd>{[values.locality, values.city].filter(Boolean).join(", ") || "Location pending"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950 dark:text-slate-50">Coordinates</dt>
                <dd>{selectedLocation ? `${values.latitude?.toFixed(5)}, ${values.longitude?.toFixed(5)}` : "Not selected"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950 dark:text-slate-50">Price</dt>
                <dd>{values.price ? `₹${values.price.toLocaleString("en-IN")}` : "Price pending"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950 dark:text-slate-50">Amenities</dt>
                <dd>{amenities.length > 0 ? amenities.join(", ") : "None selected"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950 dark:text-slate-50">Status</dt>
                <dd>Ready to publish</dd>
              </div>
            </dl>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-[color:var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={previousStep} disabled={stepIndex === 0 || isPending}>
              Back
            </Button>
            {stepIndex < stepDefinitions.length - 1 ? (
              <Button type="button" onClick={nextStep} disabled={isPending}>
                Continue
              </Button>
            ) : null}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={saveDraft} disabled={isPending}>
              Save draft
            </Button>
            <Button type="button" onClick={publishListing} disabled={isPending}>
              Publish listing
            </Button>
          </div>
        </div>
      </form>

      {status ? <p className="mt-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[color:var(--foreground)]">{status}</p> : null}
    </div>
  );
}