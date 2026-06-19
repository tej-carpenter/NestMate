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
import { createListing } from "@/lib/listings";
import { readLocalSession } from "@/lib/session";
import { listingWizardSchema, type ListingWizardInput } from "@/lib/validators/listing";
import { createListingDraftAction, publishListingAction } from "@/actions/listings";
import { uploadToCloudinary } from "@/lib/storage/cloudinary";

const defaultValues: ListingWizardInput = {
  propertyType: "pg",
  title: "",
  description: "",
  city: "indore",
  locality: "",
  address: "",
  googleMapsUrl: "https://www.google.com/maps/search/",
  price: 10000,
  priceType: "monthly",
  amenities: [""],
  genderPreference: "any",
  availableUnits: 1,
  expiresInDays: "30",
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
    fields: ["propertyType", "title", "description", "genderPreference"] as const,
  },
  {
    title: "Address and location",
    fields: ["city", "locality", "address"] as const,
  },
  {
    title: "Pricing & Payment",
    fields: ["price", "priceType"] as const,
  },
  {
    title: "Availability",
    fields: ["availableUnits", "expiresInDays"] as const,
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
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
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
    const fieldsToValidate = stepDefinitions[stepIndex].fields;
    
    if (fieldsToValidate.length > 0) {
      const valid = await trigger(fieldsToValidate as any);
      if (!valid) {
        setStatus("Please fill in all required fields to continue.");
        return;
      }
    }

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
      setStatus("Uploading images...");
      let uploadedUrls: string[] = [];
      try {
        uploadedUrls = await Promise.all(filesToUpload.map((f) => uploadToCloudinary(f)));
      } catch (err: any) {
        setStatus(`Image upload failed: ${err.message}`);
        toast.error("Image upload failed.");
        return;
      }

      const valuesWithImages = { ...values, images: uploadedUrls };

      const result = await publishListingAction(valuesWithImages);
      if (!result.submittedForReview) {
        setStatus("Submission failed.");
        toast.error("Submission failed.");
        return;
      }

      const session = readLocalSession();

      if (!session) {
        throw new Error("You must be logged in.");
      }

      await createListing({
        host_id: session.userId,
        title: result.listing.title,
        description: result.listing.description,
        city: result.listing.city,
        locality: result.listing.locality,
        address: result.listing.address,
        space_type: result.listing.propertyType,
        price: result.listing.price,
        price_type: result.listing.priceType,
        amenities: result.listing.amenities,
        gender_preference: result.listing.genderPreference,
        available_units: result.listing.availableUnits,
        expires_in_days: result.listing.expiresInDays,
        images: result.listing.images,
      });
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(draftStorageKey);
      }

      setStatus(`Listing created successfully. It will go live after approval.`);
      toast.success(`Listing created successfully.`);
    });
  }

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-10 shadow-xl shadow-black/5 dark:shadow-white/5">
      <div className="flex flex-col gap-3 border-b border-[color:var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Listing wizard</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--foreground)]">Create a trusted listing</h1>
        </div>
        <Badge className="bg-[color:var(--foreground)] text-[color:var(--background)] shadow-none border-0 px-3 py-1.5">{progress}</Badge>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
        {stepDefinitions.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`min-h-24 rounded-2xl border px-5 py-4 text-left transition-all ${index === stepIndex ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)] shadow-md" : "border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--foreground)] hover:border-[color:var(--foreground)]/30"}`}
            onClick={() => setStepIndex(index)}
          >
            <span className={`block text-[12px] uppercase tracking-[0.16em] font-semibold ${index === stepIndex ? "text-[color:var(--background)]/80" : "text-[color:var(--muted)]"}`}>Step {index + 1}</span>
            <span className="mt-1 block text-[15px] font-semibold">{item.title}</span>
          </button>
        ))}
      </div>

      <form className="mt-10 space-y-8" onSubmit={handleSubmit(saveDraft)}>
        {stepIndex === 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <label className="space-y-2 lg:col-span-1 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Property type <span className="text-red-500 ml-1">*</span></span>
              <select className="h-12 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-[15px] text-[color:var(--foreground)] transition-colors focus:border-[color:var(--foreground)] focus:ring-1 focus:ring-[color:var(--foreground)]" {...register("propertyType")}>
                <option value="pg">PG</option>
                <option value="room">Room</option>
                <option value="bed">Bed</option>
                <option value="lodge">Lodge</option>
                <option value="apartment">Apartment</option>
              </select>
            </label>
            <label className="space-y-2 lg:col-span-1 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Gender preference <span className="text-red-500 ml-1">*</span></span>
              <select className="h-12 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-[15px] text-[color:var(--foreground)] transition-colors focus:border-[color:var(--foreground)] focus:ring-1 focus:ring-[color:var(--foreground)]" {...register("genderPreference")}>
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className="space-y-2 lg:col-span-2 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Title <span className="text-red-500 ml-1">*</span></span>
              <Input {...register("title")} placeholder="Fully furnished PG near Electronic City" className="h-12 rounded-xl text-[15px]" />
            </label>
            <label className="space-y-2 lg:col-span-2 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Description <span className="text-red-500 ml-1">*</span></span>
              <Textarea {...register("description")} placeholder="Write a trustworthy, detailed description covering access, meals, safety, and bills." className="min-h-[120px] rounded-xl text-[15px]" />
            </label>
          </div>
        ) : null}

        {stepIndex === 1 ? (
          <div className="grid gap-6 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            <label className="space-y-2 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">City <span className="text-red-500 ml-1">*</span></span>
              <Input {...register("city")} placeholder="Indore" className="h-12 rounded-xl text-[15px]" />
            </label>
            <label className="space-y-2 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Locality <span className="text-red-500 ml-1">*</span></span>
              <Input {...register("locality")} placeholder="BTM Layout" className="h-12 rounded-xl text-[15px]" />
            </label>
            <label className="space-y-2 md:col-span-2 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Address <span className="text-red-500 ml-1">*</span></span>
              <Input {...register("address")} placeholder="Building / street / landmark" className="h-12 rounded-xl text-[15px]" />
            </label>
            <div className="md:col-span-2 space-y-4 overflow-hidden rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6">
              <div className="flex flex-col gap-2">
                <p className="text-[15px] font-semibold text-[color:var(--foreground)]">Google Maps link <span className="text-[color:var(--muted)] font-normal">(optional)</span></p>
                <p className="text-[14px] leading-relaxed text-[color:var(--muted)]">
                  Paste a Google Maps link to use the exact location. Otherwise, a search link is generated automatically from the title, locality, and city.
                </p>
              </div>
              <Input
                {...register("googleMapsUrl")}
                type="url"
                placeholder="https://www.google.com/maps/search/..."
                inputMode="url"
                autoComplete="url"
                className="h-12 rounded-xl text-[15px]"
              />
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-[14px] text-[color:var(--muted)]">
                <p className="font-semibold text-[color:var(--foreground)]">Preview link</p>
                <p className="mt-1 break-all text-[13px] text-[color:var(--muted)]">{previewGoogleMapsUrl}</p>
              </div>
              <Button asChild type="button" variant="outline" className="w-full justify-center sm:w-auto h-12 rounded-xl">
                <a href={previewGoogleMapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin className="mr-2 h-4 w-4" />
                  Open in Google Maps
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>
        ) : null}

        {stepIndex === 2 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Price <span className="text-red-500 ml-1">*</span></span>
              <Input {...register("price", { valueAsNumber: true })} inputMode="numeric" placeholder="12000" className="h-12 rounded-xl text-[15px]" />
            </label>
            <label className="space-y-2 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Price type <span className="text-red-500 ml-1">*</span></span>
              <select className="h-12 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-[15px] text-[color:var(--foreground)] transition-colors focus:border-[color:var(--foreground)] focus:ring-1 focus:ring-[color:var(--foreground)]" {...register("priceType")}>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
                <option value="bedspace">Bed space</option>
              </select>
            </label>
          </div>
        ) : null}

        {stepIndex === 3 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Number of vacancies (Available Units) <span className="text-red-500 ml-1">*</span></span>
              <Input {...register("availableUnits", { valueAsNumber: true })} inputMode="numeric" placeholder="1" className="h-12 rounded-xl text-[15px]" />
            </label>
            <label className="space-y-2 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Listing Duration <span className="text-red-500 ml-1">*</span></span>
              <select className="h-12 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-[15px] text-[color:var(--foreground)] transition-colors focus:border-[color:var(--foreground)] focus:ring-1 focus:ring-[color:var(--foreground)]" {...register("expiresInDays")}>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
              </select>
            </label>
          </div>
        ) : null}

        {stepIndex === 4 ? (
          <div className="grid gap-6">
            <label className="space-y-2 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Amenities, comma separated <span className="text-red-500 ml-1">*</span></span>
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
                className="min-h-[120px] rounded-xl text-[15px]"
              />
            </label>
          </div>
        ) : null}

        {stepIndex === 5 ? (
          <div className="grid gap-6">
            <label className="space-y-2 flex flex-col">
              <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Listing photos</span>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="h-12 rounded-xl text-[15px] pt-3"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  setFilesToUpload(files);
                  setUploadFiles(
                    files.map((file) => ({
                      name: file.name,
                      size: file.size,
                      type: file.type,
                    })),
                  );
                }}
              />
            </label>
            <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-[14px] text-[color:var(--muted)]">
              <p className="font-semibold text-[color:var(--foreground)]">Selected files</p>
              <ul className="mt-3 space-y-2">
                {uploadFiles.length > 0 ? uploadFiles.map((file) => <li key={file.name}>{file.name}</li>) : <li>No files selected yet.</li>}
              </ul>
            </div>
          </div>
        ) : null}

        {stepIndex === 6 ? (
          <div className="grid gap-6 rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-8">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">Preview</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--foreground)]">{values.title || "Untitled listing"}</h2>
            </div>
            <dl className="grid gap-5 text-[15px] text-[color:var(--muted)] sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <dt className="font-semibold text-[color:var(--foreground)]">Location</dt>
                <dd className="mt-1">{[values.address, values.locality, values.city].filter((part) => typeof part === "string" && part.trim().length > 0).join(", ") || "Location pending"}</dd>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <dt className="font-semibold text-[color:var(--foreground)]">Price</dt>
                <dd className="mt-1">{values.price ? `₹${values.price.toLocaleString("en-IN")}` : "Price pending"}</dd>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <dt className="font-semibold text-[color:var(--foreground)]">Availability</dt>
                <dd className="mt-1">{values.availableUnits} units, expires in {values.expiresInDays} days</dd>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <dt className="font-semibold text-[color:var(--foreground)]">Status</dt>
                <dd className="mt-1 text-emerald-600 dark:text-emerald-400 font-medium">Ready to publish</dd>
              </div>
            </dl>
          </div>
        ) : null}

        <div className="sticky bottom-6 z-20 flex flex-col gap-4 rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 px-6 py-5 shadow-lg shadow-black/5 dark:shadow-white/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="h-11 rounded-xl px-6" onClick={previousStep} disabled={stepIndex === 0 || isPending}>
              Back
            </Button>
            {stepIndex < stepDefinitions.length - 1 ? (
              <Button type="button" className="h-11 rounded-xl px-6" onClick={nextStep} disabled={isPending}>
                Continue
              </Button>
            ) : null}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="h-11 rounded-xl px-6" onClick={saveDraft} disabled={isPending}>
              Save draft
            </Button>
            <Button type="button" className="h-11 rounded-xl px-6 bg-[color:var(--foreground)] text-[color:var(--background)] hover:bg-[color:var(--foreground)]/90" onClick={publishListing} disabled={isPending}>
              Publish listing
            </Button>
          </div>
        </div>
      </form>

      {status ? <p className="mt-6 rounded-xl border border-[color:var(--border)] bg-black/5 px-5 py-4 text-[14px] font-medium leading-6 text-[color:var(--foreground)] dark:bg-white/5">{status}</p> : null}
    </div>
  );
}
