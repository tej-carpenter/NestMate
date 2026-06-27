import { describe, it, expect, vi } from "vitest";

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "host-123" } }, error: null }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { owner_id: "host-123" }, error: null }),
    rpc: vi.fn().mockResolvedValue({ error: null }),
  })),
}));

// Mock Next.js cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { updateListingAvailability } from "@/actions/host";

describe("updateListingAvailability", () => {
  it("successfully updates availability for an authorized host", async () => {
    const result = await updateListingAvailability("listing-456", 5);
    expect(result.success).toBe(true);
  });
});
