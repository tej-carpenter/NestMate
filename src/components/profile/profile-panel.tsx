"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserRound, BadgeCheck, Phone, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { getAccountLabel, getPostLoginRoute, loadSupabaseSessionProfile, readLocalSession, signOutSession, subscribeToSupabaseAuth } from "@/lib/session";
import { isAuthenticatedSession } from "@/lib/auth/permissions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ProfilePanel() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = React.useState(false);
  const [session, setSession] = React.useState(() => null as ReturnType<typeof readLocalSession>);
  const [userStats, setUserStats] = React.useState({
    loginCount: 1,
    totalBookings: 0,
    paymentRecords: 0,
  });
  const [legalDetails, setLegalDetails] = React.useState({
    age: "",
    gender: "",
    government_id_type: "",
    government_id: "",
    address: "",
  });
  const [isEditingLegal, setIsEditingLegal] = React.useState(searchParams?.get("onboarding") === "true");
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  function formatGovernmentId(type: string, value: string) {
    if (!value) return value;
    const clean = value.replace(/\s+/g, "").toUpperCase();
    
    if (type === "aadhaar") {
      const numbers = clean.replace(/\D/g, "");
      return numbers.replace(/(.{4})/g, "$1 ").trim().substring(0, 14);
    }
    
    if (type === "pan") {
      return clean.substring(0, 10);
    }

    if (type === "passport") {
      return clean.substring(0, 8);
    }
    
    return clean;
  }

  function validateLegalDetails(details: typeof legalDetails) {
    if (!details.government_id_type) return "Please select an ID Type.";
    if (!details.government_id) return "Please enter your Government ID.";
    
    const cleanId = details.government_id.replace(/\s+/g, "");
    
    if (details.government_id_type === "aadhaar") {
      if (cleanId.length !== 12 || !/^\d{12}$/.test(cleanId)) {
        return "Aadhaar must be exactly 12 digits.";
      }
    } else if (details.government_id_type === "pan") {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanId.toUpperCase())) {
        return "Invalid PAN format. Expected: 5 letters, 4 numbers, 1 letter.";
      }
    } else if (details.government_id_type === "passport") {
      if (!/^[A-Z][0-9]{7}$/.test(cleanId.toUpperCase())) {
        return "Invalid Passport format. Expected: 1 letter followed by 7 digits.";
      }
    }
    return null;
  }

  React.useEffect(() => {
    const refreshSession = () => setSession(readLocalSession());

    let active = true;
    const handle = window.setTimeout(() => {
      refreshSession();
      void loadSupabaseSessionProfile().then((sess) => {
        if (!active) return;
        setSession(sess);
        if (sess?.phone || sess?.email) {
          const supabase = createSupabaseBrowserClient();
          Promise.all([
            sess.email ? supabase.from("users").select("id, age, gender, government_id_type, government_id, address").eq("email", sess.email).maybeSingle() : Promise.resolve({ data: null }),
            sess.phone && sess.phone.trim() ? (supabase.from("bookings") as any).select("id", { count: "exact" }).eq("user_phone", sess.phone) : Promise.resolve({ count: 0 }),
            sess.phone && sess.phone.trim() ? (supabase.from("transactions") as any).select("id", { count: "exact" }).eq("user_phone", sess.phone) : Promise.resolve({ count: 0 })
          ]).then(([{ data: userRecord }, { count: bCount }, { count: pCount }]) => { const user = userRecord as any;
            if (active) {
              setUserStats({
                loginCount: 1, // Will implement session history later
                totalBookings: bCount || 0,
                paymentRecords: pCount || 0,
              });
              if (user) {
                setLegalDetails({
                  age: user.age ? String(user.age) : "",
                  gender: user.gender || "",
                  government_id_type: user.government_id_type || "",
                  government_id: user.government_id || "",
                  address: user.address || "",
                });
              }
              setMounted(true);
            }
          });
        } else {
          setMounted(true);
        }
      }).catch((e) => {
        refreshSession();
        setMounted(true);
      });
    }, 0);

    const unsubscribe = subscribeToSupabaseAuth(setSession);
    window.addEventListener("storage", refreshSession);
    window.addEventListener("nestmate-auth-change", refreshSession);

    return () => {
      active = false;
      window.clearTimeout(handle);
      unsubscribe();
      window.removeEventListener("storage", refreshSession);
      window.removeEventListener("nestmate-auth-change", refreshSession);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.22fr_0.78fr] lg:items-start">
        <Card className="p-6 sm:p-8 lg:self-start">
          <div className="space-y-3">
            <p className="h-3 w-28 rounded-full bg-slate-200/80 dark:bg-slate-800/70" />
            <div className="h-10 w-72 max-w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/70" />
            <p className="h-4 w-full max-w-xl rounded-full bg-slate-200/70 dark:bg-slate-800/60" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="min-h-32 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                <div className="h-4 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800/70" />
                <div className="mt-4 h-6 w-24 rounded-full bg-slate-200/70 dark:bg-slate-800/60" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
          <div className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800/70" />
          <div className="mt-4 h-8 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/70" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-11 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticatedSession(session)) {
    return (
      <Card className="mx-auto w-full max-w-2xl p-6 sm:p-8">
        <Badge className="bg-teal-50 text-teal-950 dark:bg-teal-500/15 dark:text-teal-100">Profile</Badge>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50">Sign in to view your profile</h1>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">The profile area is reserved for authenticated accounts. Anonymous visitors can browse listings without signing in.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button asChild>
            <Link href="/auth/login">Go to login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">Browse listings</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">Guest Dashboard</h1>
        <p className="mt-2 text-[15px] text-[color:var(--muted)]">Manage your stays, profile, and payments.</p>
        
        {/* Simple Tab Navigation */}
        <div className="mt-6 flex items-center gap-6 border-b border-[color:var(--border)]">
          <Link href="/profile" className="border-b-2 border-[color:var(--foreground)] pb-3 text-[15px] font-semibold text-[color:var(--foreground)]">
            Profile
          </Link>
          <Link href="/guest/bookings" className="pb-3 text-[15px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors">
            My Bookings
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.22fr_0.78fr] lg:items-start">
        <Card className="overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm sm:p-8 lg:self-start">
          {searchParams?.get("onboarding") === "true" && (
            <div className="mb-6 rounded-xl border border-rose-200/70 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-900/10">
              <p className="text-[14px] font-semibold text-rose-900/90 dark:text-rose-100/90">Action Required</p>
              <p className="mt-1 text-[13px] text-rose-800/80 dark:text-rose-200/80">
                Please complete your Identity & Legal Details below before you can book a property.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-[14px] font-medium text-[color:var(--muted)]">Profile Details</p>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--foreground)]">{session.name || "Nestmate User"}</h1>
            </div>
            <Chip className="inline-flex items-center gap-2 px-4 py-2 font-medium">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              {getAccountLabel(session.role)}
            </Chip>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm">
              <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                <UserRound className="h-4 w-4" />
                Name
              </div>
              <p className="mt-3 text-[16px] font-semibold text-[color:var(--foreground)] truncate">{session.name || "Not set"}</p>
            </div>
            <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm">
              <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                <Phone className="h-4 w-4" />
                Phone
              </div>
              <p className="mt-3 text-[16px] font-semibold text-[color:var(--foreground)] truncate">{session.phone || "Not added"}</p>
            </div>
            <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                <BadgeCheck className="h-4 w-4" />
                Email
              </div>
              <p className="mt-3 text-[16px] font-semibold text-[color:var(--foreground)] break-all">{session.email ?? "Not added"}</p>
            </div>
            <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                <CalendarDays className="h-4 w-4" />
                Signed in
              </div>
              <p className="mt-3 text-[16px] font-semibold text-[color:var(--foreground)] truncate">
                {formatDateTime(session.signedInAt)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="mt-8 overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm sm:p-8 lg:self-start">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between mb-6">
            <div className="space-y-2">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--foreground)]">Identity & Legal Details</h2>
              <p className="text-[14px] text-[color:var(--muted)]">Required for property hosts when you make a booking.</p>
            </div>
            {!isEditingLegal && (
              <Button variant="outline" onClick={() => setIsEditingLegal(true)}>
                Edit Details
              </Button>
            )}
          </div>
          
          {isEditingLegal ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Age</label>
                  <Input 
                    id="age" 
                    type="number" 
                    placeholder="Enter your age" 
                    value={legalDetails.age}
                    onChange={(e) => setLegalDetails(prev => ({ ...prev, age: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Gender</label>
                  <Select 
                    id="gender"
                    value={legalDetails.gender} 
                    onChange={(e) => setLegalDetails(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="government_id_type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">ID Type</label>
                  <Select 
                    id="government_id_type"
                    value={legalDetails.government_id_type} 
                    onChange={(e) => {
                      const newType = e.target.value;
                      setLegalDetails(prev => ({ 
                        ...prev, 
                        government_id_type: newType,
                        government_id: formatGovernmentId(newType, prev.government_id) 
                      }));
                    }}
                  >
                    <option value="" disabled>Select ID Type</option>
                    <option value="aadhaar">Aadhaar</option>
                    <option value="pan">PAN Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="government_id" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Government ID Number</label>
                  <Input 
                    id="government_id" 
                    placeholder="Enter your ID number" 
                    value={legalDetails.government_id}
                    onChange={(e) => setLegalDetails(prev => ({ ...prev, government_id: formatGovernmentId(prev.government_id_type, e.target.value) }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Address</label>
                <Textarea 
                  id="address" 
                  placeholder="Enter your permanent address" 
                  className="min-h-[100px]"
                  value={legalDetails.address}
                  onChange={(e) => setLegalDetails(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              {saveError && (
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{saveError}</p>
              )}
              <div className="pt-4 flex items-center gap-3">
                <Button 
                  disabled={isSaving}
                  onClick={async () => {
                    const validationError = validateLegalDetails(legalDetails);
                    if (validationError) {
                      setSaveError(validationError);
                      return;
                    }
                    
                    setIsSaving(true);
                    setSaveError(null);
                    const supabase = createSupabaseBrowserClient();
                    const { error } = await (supabase.from("users") as any).update({
                      age: legalDetails.age ? parseInt(legalDetails.age) : null,
                      gender: legalDetails.gender || null,
                      government_id_type: legalDetails.government_id_type || null,
                      government_id: legalDetails.government_id.replace(/\s+/g, "") || null,
                      address: legalDetails.address || null
                    }).eq("id", session.userId);
                    
                    setIsSaving(false);
                    if (error) {
                      console.error("Save error:", JSON.stringify(error, null, 2), error);
                      setSaveError(error.message || "Failed to save details. Please try again.");
                    } else {
                      setIsEditingLegal(false);
                    }
                  }}
                >
                  {isSaving ? "Saving..." : "Save details"}
                </Button>
                <Button variant="ghost" disabled={isSaving} onClick={() => setIsEditingLegal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm">
                <div className="text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)] mb-1">Age</div>
                <div className="text-[16px] font-medium text-[color:var(--foreground)]">{legalDetails.age || "Not provided"}</div>
              </div>
              <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm">
                <div className="text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)] mb-1">Gender</div>
                <div className="text-[16px] font-medium text-[color:var(--foreground)] capitalize">{legalDetails.gender || "Not provided"}</div>
              </div>
              <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm sm:col-span-2">
                <div className="text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)] mb-1">
                  Government ID {legalDetails.government_id_type ? `(${legalDetails.government_id_type})` : ""}
                </div>
                <div className="text-[16px] font-medium text-[color:var(--foreground)]">{legalDetails.government_id || "Not provided"}</div>
              </div>
              <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm sm:col-span-2">
                <div className="text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)] mb-1">Address</div>
                <div className="text-[16px] font-medium text-[color:var(--foreground)] whitespace-pre-line">{legalDetails.address || "Not provided"}</div>
              </div>
            </div>
          )}
        </Card>

        <aside className="lg:sticky lg:top-8 lg:self-start mt-8 lg:mt-0">
          <Card className="flex flex-col gap-6 overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-[14px] font-medium text-[color:var(--muted)]">Account Actions</p>
            </div>

            <div className="flex flex-col gap-3 border-y border-[color:var(--border)] py-6">
              <Button asChild className="h-12 w-full justify-start text-[15px]">
                <Link href="/guest/bookings">View Bookings</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 w-full justify-start text-[15px]">
                <Link href="/search">Browse Listings</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 w-full justify-start text-[15px]">
                <Link href="/profile/archived-listings">Archived Listings</Link>
              </Button>
            </div>

            <Button
              variant="outline"
              className="h-12 w-full text-[15px] font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
              onClick={async () => {
                await signOutSession();
                setSession(null);
              }}
            >
              Sign out
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
