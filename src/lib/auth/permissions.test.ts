import { describe, expect, it } from "vitest";
import { canContactOwner, canCreateListing, canDeleteListing, canEditListing, canModerateListings, canSaveListing } from "./permissions";
import { normalizeRole } from "./roles";
import { getAccountLabel, getPostLoginRoute } from "../session";

describe("auth role normalization", () => {
  it("maps legacy roles to the new model", () => {
    expect(normalizeRole("guest")).toBe("user");
    expect(normalizeRole("host")).toBe("user");
    expect(normalizeRole("owner")).toBe("user");
    expect(normalizeRole("admin")).toBe("admin");
    expect(normalizeRole("invalid")).toBeNull();
  });
});

describe("access helpers", () => {
  it("separates guest and authenticated access", () => {
    expect(canSaveListing(null)).toBe(false);
    expect(canContactOwner(null)).toBe(false);
    expect(canSaveListing({ role: "user" })).toBe(true);
    expect(canContactOwner({ role: "user" })).toBe(true);
  });

  it("allows authenticated users and admins to create listings", () => {
    expect(canCreateListing({ role: "user" })).toBe(true);
    expect(canCreateListing({ role: "admin" })).toBe(true);
  });

  it("allows users or admins to edit and delete their listings", () => {
    const listing = { ownerId: "listing-owner" };

    expect(canEditListing({ id: "listing-owner", role: "user" }, listing)).toBe(true);
    expect(canDeleteListing({ id: "other-user", role: "user" }, listing)).toBe(false);
    expect(canEditListing({ id: "anyone", role: "admin" }, listing)).toBe(true);
  });

  it("allows only admins to moderate listings", () => {
    expect(canModerateListings({ role: "user" })).toBe(false);
    expect(canModerateListings({ role: "admin" })).toBe(true);
  });
});

describe("post-login routes", () => {
  it("routes roles to the correct landing pages", () => {
    expect(getPostLoginRoute("user")).toBe("/profile");
    expect(getPostLoginRoute("admin")).toBe("/admin/dashboard");
    expect(getAccountLabel("user")).toBe("User");
    expect(getAccountLabel("admin")).toBe("Admin");
  });
});
