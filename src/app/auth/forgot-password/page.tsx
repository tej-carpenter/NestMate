import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { PageShell } from "@/components/layout/page-shell";

export default function ForgotPasswordPage() {
  return (
    <PageShell className="justify-center gap-8">
      <ForgotPasswordForm />
    </PageShell>
  );
}
