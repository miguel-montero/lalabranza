import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="px-6 py-16 md:px-12 max-w-sm">
      <h1 className="font-display text-2xl mb-6">Staff Login</h1>
      <AdminLoginForm />
    </main>
  );
}
