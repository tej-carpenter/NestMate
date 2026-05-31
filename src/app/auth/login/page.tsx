import { OtpLoginForm } from "@/components/auth/otp-login-form";
import { PageShell } from "@/components/layout/page-shell";

export default function LoginPage() {
  return (
    <PageShell className="justify-center gap-8">
      <OtpLoginForm />
    </PageShell>
  );
}