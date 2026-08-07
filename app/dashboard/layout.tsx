"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const primaryNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "▦",
  },
  {
    label: "New Audit",
    href: "/dashboard/new",
    icon: "+",
  },
  {
    label: "Audit History",
    href: "/dashboard/audits",
    icon: "✓",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Layout profile error:", profileError);
        return;
      }

      const firstName = profile?.first_name ?? "";
      const lastName = profile?.last_name ?? "";

      const name = `${firstName} ${lastName}`.trim();

      setFullName(name || "IEP Verify User");

      const userInitials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

      setInitials(userInitials || "IV");
    }

    loadUser();
  }, [router]);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 flex-col bg-[#0a3d73] px-5 py-6 text-white lg:flex">
          <div className="rounded-[26px] bg-white px-6 py-6 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.7)]">
            <Image
              src="/iep-verify-logo.png"
              alt="IEP Verify"
              width={420}
              height={140}
              priority
              className="h-auto w-full object-contain"
            />
          </div>

          <nav className="mt-8">
            <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-200">
              Workspace
            </p>

            <div className="mt-3 space-y-2">
              {primaryNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-base font-semibold">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                ↪
              </span>

              <span>Sign out</span>
            </button>
          </div>

          <div className="mt-auto space-y-4 pt-8">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
                Review workspace
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-50">
                Review documentation, save audit history, and track findings in
                one place.
              </p>
            </div>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                ⚙
              </span>

              <span>Settings</span>
            </Link>

            <Link
              href="/dashboard/help"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                ?
              </span>

              <span>Help & Support</span>
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden">
              <Image
                src="/iep-verify-logo.png"
                alt="IEP Verify"
                width={170}
                height={58}
                priority
                className="h-auto w-[150px] object-contain"
              />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {fullName}
                </p>

                <p className="text-xs text-slate-500">
                  IEP Verify account
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dce9f7] text-sm font-semibold text-[#0a3d73]">
                {initials}
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}