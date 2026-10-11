import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError =
    error === "admin"
      ? "This dashboard is for admins only."
      : error === "suspended"
        ? "This account is suspended."
        : undefined;

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-dark lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,160,90,0.18),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(201,160,90,0.1),transparent_40%)]" />
        <div className="relative flex items-center gap-3">
          <Image src="/logo.png" alt="" width={44} height={44} className="rounded-xl" />
          <span className="text-sm tracking-[0.24em] text-gold uppercase">Omega Outdoor</span>
        </div>
        <div className="relative max-w-md">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">Field command</p>
          <h1 className="mt-4 text-5xl leading-tight font-semibold text-[#f6efe2] lg:text-6xl">
            See the team.
            <br />
            Close the loop.
          </h1>
          <p className="mt-6 text-sm leading-7 text-[#b8b0a4]">
            Live visits, pending work, and approvals — the same records as the mobile app, for the people who run the day.
          </p>
        </div>
        <p className="relative text-xs text-[#7d766c]">Internal dashboard · not for technicians</p>
      </section>

      <section className="flex items-center justify-center bg-[#f3eee4] px-5 py-12 pt-[max(3rem,env(safe-area-inset-top))] sm:px-6 sm:py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Image src="/logo.png" alt="" width={56} height={56} className="mb-4 rounded-2xl" />
            <p className="text-[11px] font-semibold tracking-[0.22em] text-gold uppercase">Omega Outdoor</p>
          </div>
          <h2 className="text-4xl font-semibold text-ink">Welcome back</h2>
          <p className="mt-2 mb-8 text-sm text-muted">Sign in with your admin account.</p>
          <div className="panel p-6">
            <LoginForm initialError={initialError} />
          </div>
        </div>
      </section>
    </main>
  );
}
