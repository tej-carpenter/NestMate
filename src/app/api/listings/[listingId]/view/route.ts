import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ listingId: string }> }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.listingId;
    
    // Get IP for hash (fallback to unknown if missing)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown-ip";
    const userAgent = req.headers.get("user-agent") || "unknown-ua";
    
    // Create an anonymous hash
    const ip_hash = crypto.createHash("sha256").update(`${ip}-${userAgent}`).digest("hex");

    const supabase = await createSupabaseServerClient();
    
    // 1. Get the listing ID and check if it exists
    const { data: listing } = await (supabase.from("listings") as any)
      .select("id")
      .eq("id", slug)
      .single();
      
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    
    // Get the current user if logged in
    const { data: { user } } = await supabase.auth.getUser();
    const viewer_id = user?.id || null;
    
    // 2. Check if a view exists for this IP hash in the last 30 minutes
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { data: recentView } = await (supabase.from("listing_views") as any)
      .select("id")
      .eq("listing_id", listing.id)
      .eq("ip_hash", ip_hash)
      .gte("created_at", thirtyMinsAgo)
      .limit(1)
      .maybeSingle();
      
    if (recentView) {
      // Debounce: Already viewed recently
      return NextResponse.json({ success: true, debounced: true });
    }
    
    // 3. Record the view
    await (supabase.from("listing_views") as any).insert({
      listing_id: listing.id,
      viewer_id,
      ip_hash
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
