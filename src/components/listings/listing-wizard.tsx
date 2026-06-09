"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ExternalLink, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { resolveGoogleMapsUrl } from "@/lib/google-maps";
import { createListingFromWizard } from "@/lib/local-data";
import { listingWizardSchema, type ListingWizardInput } from "@/lib/validators/listing";
import { createListingDraftAction, publishListingAction } from "@/actions/listings";

const defaultValues: ListingWizardInput = {
  propertyType: "pg",
  title: "",
  description: "",
  city: "",
  locality: "",
  address: "",
  googleMapsUrl: "",
  price: 0,
  priceType: "monthly",
  amenities: [],
  genderPreference: "any",
  // Latitude/longitude are kept as legacy optional fields. They are not
  // required and are no longer used in the wizard UI.
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
    fields: ["city", "locality", "address"] as const,
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
  const [isPending, startTransition] = useTransition();
  const hasHydratedDraftRef = useRef(false);

  const { register, handleSubmit, control, reset, trigger, setValue } = useForm<ListingWizardInput>({
    resolver: zodResolver(listingWizardSchema),
    defaultValues,
    mode: "onBlur",
  });

  const values = useWatch({ control, defaultValue: defaultValues });
  const amenities = values.amenities ?? [];

  const previewGoogleMapsUrl = useMemo(
    () => resolveGoogleMapsUrl(
      { title: values.title ?? "", locality: values.locality ?? "", city: values.city ?? "" },
      typeof values.googleMapsUrl === "string" && values.googleMapsUrl.trim().length > 0 ? values.googleMapsUrl : null,
    ),
    [values.title, values.locality, values.city, values.googleMapsUrl],
  );

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
      if (!result.submittedForReview) {
        setStatus("Submission failed.");
        toast.error("Submission failed.");
        return;
      }

      const listing = createListingFromWizard(result.listing);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(draftStorageKey);
      }

      setStatus(`Submitted ${listing.title} for review. It will go live after approval.`);
      toast.success(`Submitted ${listing.title} for review.`);
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
              <Input {...register("city")} placeholder="Indore" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Locality</span>
              <Input {...register("locality")} placeholder="BTM Layout" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Address</span>
              <Input {...register("address")} placeholder="Building / street / landmark" />
            </label>
            <div className="md:col-span-2 space-y-3 overflow-hidden rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">Google Maps link (optional)</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Paste a Google Maps link to use the exact location. Otherwise, a search link is generated automatically from the title, locality, and city.
                  </p>
                </div>
              </div>
              <Input
                {...register("googleMapsUrl")}
                type="url"
                placeholder="https://www.google.com/maps/search/..."
                inputMode="url"
                autoComplete="url"
              />
              <div className="rounded-[1.25rem] bg-[color:var(--surface)] p-4 text-sm text-slate-700 dark:text-slate-200">
                <p className="font-semibold text-slate-950 dark:text-slate-50">Preview link</p>
                <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">{previewGoogleMapsUrl}</p>
              </div>
              <Button asChild type="button" variant="outline" className="w-full justify-center sm:w-auto">
                <a href={previewGoogleMapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-4 w-4" />
                  Open in Google Maps
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
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
                <dd>{[values.address, values.locality, values.city].filter((part) => typeof part === "string" && part.trim().length > 0).join(", ") || "Location pending"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950 dark:text-slate-50">Google Maps</dt>
                <dd className="break-all text-xs">{previewGoogleMapsUrl}</dd>
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

        <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)]/95 px-4 py-4 shadow-lg shadow-slate-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
