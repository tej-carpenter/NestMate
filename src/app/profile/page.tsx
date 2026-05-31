import { ProfilePanel } from "@/components/profile/profile-panel";
import { RouteAccessGate } from "@/components/auth/route-access-gate";

export default function ProfilePage() {
  return (
    <RouteAccessGate
      variant="authenticated"
      title="Sign in to view your profile"
      description="The profile area is reserved for signed-in users and admins. Anonymous visitors can browse listings without signing in."
      actionLabel="Go to login"
      actionHref="/auth/login"
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <ProfilePanel />
      </main>
    </RouteAccessGate>
  );
}