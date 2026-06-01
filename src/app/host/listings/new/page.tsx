import { ListingWizard } from "@/components/listings/listing-wizard";
import { RouteAccessGate } from "@/components/auth/route-access-gate";

export default function NewListingPage() {
  return (
    <RouteAccessGate
      variant="creator"
      title="Sign in as a user to create a listing"
      description="Anonymous browsing stays available without login, but listing creation is reserved for user and admin accounts."
      actionLabel="Go to login"
      actionHref="/auth/login"
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ListingWizard />
      </main>
    </RouteAccessGate>
  );
}