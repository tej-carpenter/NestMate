import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
import { calculateHostPayout } from "@/lib/payouts";

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 1. Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hostId = user.id;

    // 2. Fetch Host Listings for summary and management
    const { data: listings } = await (supabase.from("listings") as any)
      .select("id, title, status, available_units, total_units, space_type")
      .eq("host_id", hostId)
      .order("created_at", { ascending: false });

    const listingSummary = {
      total: listings?.length || 0,
      active: listings?.filter((l: any) => l.status === "approved").length || 0,
      full: listings?.filter((l: any) => l.available_units <= 0 || l.status === "full").length || 0,
    };

    const listingIds = listings?.map((l: any) => l.id) || [];

    // 3. Fetch Bookings
    const { data: bookings } = await (supabase.from("bookings") as any)
      .select(`
        id, 
        booking_status, 
        payment_status, 
        rent_amount, 
        created_at, 
        move_in_date, 
        move_out_date,
        guest_count,
        quantity,
        users:guest_id (full_name, phone, email),
        listings:listing_id (title)
      `)
      .eq("host_id", hostId)
      .order("created_at", { ascending: false });

    const activeBookings = bookings?.filter(
      (b: any) => ["pending", "confirmed", "active"].includes(b.booking_status)
    ).length || 0;

    const nextPayout = calculateHostPayout(bookings || []);

    // 4. Fetch Views
    let listingViews = 0;
    let viewsData: any[] = [];
    if (listingIds.length > 0) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: views } = await (supabase.from("listing_views") as any)
        .select("id, created_at")
        .in("listing_id", listingIds)
        .gte("created_at", thirtyDaysAgo);
        
      listingViews = views?.length || 0;
      viewsData = views || [];
    }

    // 5. Fetch Messages (Assuming we have a messages/chats setup with host_id on chat)
    // We'll approximate unread messages by querying messages linked to the host's chats
    let unreadMessages = 0;
    let messagesData: any[] = [];
    const { data: chats } = await (supabase.from("chats") as any)
      .select("id")
      .eq("host_id", hostId);
      
    if (chats && chats.length > 0) {
      const chatIds = chats.map((c: any) => c.id);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: messages } = await (supabase.from("messages") as any)
        .select("id, is_read, created_at")
        .in("chat_id", chatIds)
        .gte("created_at", thirtyDaysAgo);
        
      if (messages) {
        messagesData = messages;
        unreadMessages = messages.filter((m: any) => m.is_read === false).length;
      }
    }

    // 6. Aggregate Activity Graph (Last 30 days)
    const activityGraphMap: Record<string, { date: string; Bookings: number; Views: number; Messages: number }> = {};
    
    // Initialize 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
      activityGraphMap[dateStr] = { date: dateStr, Bookings: 0, Views: 0, Messages: 0 };
    }

    // Populate graph data
    bookings?.forEach((b: any) => {
      const d = b.created_at.split("T")[0];
      if (activityGraphMap[d]) activityGraphMap[d].Bookings += 1;
    });

    viewsData.forEach((v: any) => {
      const d = v.created_at.split("T")[0];
      if (activityGraphMap[d]) activityGraphMap[d].Views += 1;
    });
    
    messagesData.forEach((m: any) => {
      const d = m.created_at.split("T")[0];
      if (activityGraphMap[d]) activityGraphMap[d].Messages += 1;
    });

    const activityGraph = Object.values(activityGraphMap).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate sum of graph items to check if empty
    const totalActivity = activityGraph.reduce((sum, item) => sum + item.Bookings + item.Views + item.Messages, 0);

    return NextResponse.json({
      activeBookings,
      listingViews,
      unreadMessages,
      nextPayout,
      listingSummary,
      recentBookings: bookings?.slice(0, 20) || [], // Return top 20 recent bookings
      hostListings: listings || [],
      activityGraph: totalActivity > 0 ? activityGraph : [], // Return empty if absolutely no activity
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
