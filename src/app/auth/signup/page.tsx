import { SignupForm } from "@/components/auth/signup-form";
import { PageShell } from "@/components/layout/page-shell";

export default function SignupPage() {
  return (
    <PageShell className="justify-center gap-8">
      <SignupForm />
    </PageShell>
  );
}
