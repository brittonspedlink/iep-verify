"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const featureItems = [
  "Evidence-based alignment review",
  "Saved audit history",
  "District-ready reporting",
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    setMessage("");
    setIsError(false);

    if (!normalizedEmail) {
      setIsError(true);
      setMessage("Enter your email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      const { data: isApproved, error: approvalError } =
        await supabase.rpc("is_email_approved", {
          target_email: normalizedEmail,
        });

      if (approvalError) {
        console.error("Approval check failed:", approvalError);

        setIsError(true);
        setMessage(
          "We could not verify your account right now. Please try again."
        );
        return;
      }

      if (!isApproved) {
        setIsError(true);
        setMessage(
          "This email address is not currently approved for an IEP Verify workspace."
        );
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      });

      if (signInError) {
        console.error("Magic link error:", signInError);

        setIsError(true);
        setMessage(
          "We could not send your secure sign-in link. Please try again."
        );
        return;
      }

      setIsError(false);
      setMessage(
        "Secure sign-in link sent. Check your email to continue to IEP Verify."
      );
    } catch (error) {
      console.error("Login error:", error);

      setIsError(true);
      setMessage(
        "Something went wrong while preparing your secure sign-in link."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid w-full overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_40px_110px_-45px_rgba(15,23,42,0.5)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden bg-[#0a3d73] px-7 py-9 text-white sm:px-10 sm:py-10 lg:px-14 lg:py-14">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.07),_transparent_42%),radial-gradient(circle_at_15%_10%,_rgba(255,255,255,0.13),_transparent_25%),radial-gradient(circle_at_88%_88%,_rgba(77,158,124,0.22),_transparent_28%)]" />

            <div className="absolute inset-0 opacity-[0.08]">
              <div className="absolute left-8 top-20 h-48 w-48 rounded-full border border-white" />
              <div className="absolute -right-16 bottom-10 h-64 w-64 rounded-full border border-white" />
              <div className="absolute right-16 top-24 h-24 w-24 rounded-3xl border border-white" />
            </div>

            <div className="relative flex h-full min-h-[620px] flex-col">
              <div>
                <div className="inline-flex rounded-[28px] bg-white px-10 py-8 shadow-[0_24px_70px_-25px_rgba(15,23,42,0.7)]">
                  <Image
                    src="/iep-verify-logo.png"
                    alt="IEP Verify"
                    width={520}
                    height={180}
                    priority
                    className="h-auto w-[340px] object-contain sm:w-[390px] lg:w-[420px]"
                  />
                </div>

                <p className="mt-10 text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">
                  Independent IEP review platform
                </p>

                <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                  Review documentation with confidence.
                </h1>

                <p className="mt-6 max-w-xl text-base leading-8 text-blue-100 sm:text-lg">
                  Compare IEP documentation against available evidence,
                  identify gaps, and prepare records for qualified educator
                  review.
                </p>

                <div className="mt-10 grid gap-3">
                  {featureItems.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4d9e7c] text-sm font-bold text-white">
                        ✓
                      </span>

                      <span className="text-sm font-medium text-white sm:text-base">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-auto pt-10 text-xs leading-6 text-blue-200">
                IEP Verify supports professional documentation review. It
                does not replace educator judgment or determine legal
                compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
            <div className="w-full max-w-md">
              <div className="mb-9">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#3d9b78]">
                  Secure access
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Welcome back
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Sign in to review, save, and manage your IEP audits.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-800">
                    Email address
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setMessage("");
                      setIsError(false);
                    }}
                    placeholder="you@district.org"
                    autoComplete="email"
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0a3d73] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#07325f] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Sending secure link..."
                    : "Continue with secure link"}
                </button>
              </form>

              {message ? (
                <div
                  className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-6 ${
                    isError
                      ? "border-red-200 bg-red-50 text-red-800"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {message}
                </div>
              ) : null}

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0a3d73]">
                    ✉
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Password-free sign-in
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      We will email you a secure link to access your IEP
                      Verify account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-[#0a3d73] shadow-sm">
                    TX
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[#0a3d73]">
                        Texas Review Framework
                      </p>

                      <span className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0a3d73]">
                        Current
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      IEP Verify is currently designed for Texas educators
                      and uses a review framework aligned to Texas Education
                      Agency guidance and Texas special education
                      documentation practices.
                    </p>

                    <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
                      Additional state review frameworks are planned.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-200 pt-6">
                <p className="text-center text-xs leading-6 text-slate-500">
                  By continuing, you agree to the Terms of Service and Privacy
                  Policy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}