"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const roleOptions = [
  "Special Education Teacher",
  "Case Manager",
  "Diagnostician",
  "Special Education Coordinator",
  "Campus Administrator",
  "District Administrator",
  "Other",
];

const gradeLevelOptions = [
  "Elementary",
  "Middle School",
  "High School",
  "K–12",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState(roleOptions[0]);
  const [districtName, setDistrictName] = useState("");
  const [campusName, setCampusName] = useState("");
  const [gradeLevels, setGradeLevels] = useState("High School");
  const [activeIepStudents, setActiveIepStudents] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [setupComplete, setSetupComplete] = useState(false);
  const [loadingApproval, setLoadingApproval] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
  async function loadApproval() {
    setLoadingApproval(true);
    setErrorMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session lookup error:", sessionError);
      router.replace("/login");
      return;
    }

    if (!session) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase.rpc("current_approval");

    if (error) {
      console.error("Approval lookup error:", error);

      setErrorMessage(
        "We could not load your approved workspace information."
      );

      setLoadingApproval(false);
      return;
    }

    const approval = Array.isArray(data) ? data[0] : data;

    if (!approval) {
      setErrorMessage(
        "No approved IEP Verify workspace was found for this account."
      );

      setLoadingApproval(false);
      return;
    }

    const roleLabels: Record<string, string> = {
      special_education_teacher: "Special Education Teacher",
      case_manager: "Case Manager",
      campus_admin: "Campus Administrator",
      district_admin: "District Administrator",
    };

    setRole(roleLabels[approval.role] ?? approval.role ?? roleOptions[0]);
    setDistrictName(approval.district_name ?? "");
    setCampusName(approval.campus_name ?? "");
    setGradeLevels(approval.grade_band ?? "High School");

    setLoadingApproval(false);
  }

  loadApproval();
}, [router]);

  const completedFields = useMemo(() => {
    return [
      firstName.trim(),
      lastName.trim(),
      role.trim(),
      districtName.trim(),
      campusName.trim(),
    ].filter(Boolean).length;
  }, [firstName, lastName, role, districtName, campusName]);

  const completionPercent = setupComplete
    ? 100
    : Math.round((completedFields / 5) * 100);

  const educatorName =
    `${firstName.trim()} ${lastName.trim()}`.trim() || "Educator";

  function clearMessages() {
    setErrorMessage("");
    setStatusMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firstName.trim()) {
      setErrorMessage("Enter your first name.");
      return;
    }

    if (!lastName.trim()) {
      setErrorMessage("Enter your last name.");
      return;
    }

    if (!districtName.trim()) {
      setErrorMessage("Enter your school district.");
      return;
    }

    if (!campusName.trim()) {
      setErrorMessage("Enter your school or campus.");
      return;
    }

    if (
      activeIepStudents.trim() &&
      (Number.isNaN(Number(activeIepStudents)) ||
        Number(activeIepStudents) < 0)
    ) {
      setErrorMessage("Enter a valid number of active IEP students.");
      return;
    }

    clearMessages();
    setIsSubmitting(true);

    const activeStudentCount = activeIepStudents.trim()
      ? Number(activeIepStudents)
      : null;

    const { data, error } = await supabase.rpc("complete_onboarding", {
      p_first_name: firstName.trim(),
      p_last_name: lastName.trim(),
      p_active_student_count: activeStudentCount,
    });

    if (error) {
      console.error("Onboarding error:", error);

      setErrorMessage(
        error.message || "We could not complete your workspace setup."
      );

      setIsSubmitting(false);
      return;
    }

    console.log("Onboarding complete:", data);

    setStatusMessage("Your IEP Verify workspace is ready.");
    setSetupComplete(true);
    setIsSubmitting(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleGoToDashboard() {
    router.push("/dashboard");
  }

  function handleEditInformation() {
    setSetupComplete(false);
    clearMessages();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(10,61,115,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(77,158,124,0.12),_transparent_30%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
          <section className="grid w-full overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_40px_110px_-45px_rgba(15,23,42,0.5)] lg:grid-cols-[0.78fr_1.22fr]">
            <aside className="relative overflow-hidden bg-[#0a3d73] px-7 py-9 text-white sm:px-10 lg:px-12 lg:py-12">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.07),_transparent_42%),radial-gradient(circle_at_16%_12%,_rgba(255,255,255,0.13),_transparent_25%),radial-gradient(circle_at_88%_88%,_rgba(77,158,124,0.24),_transparent_28%)]" />

              <div className="absolute inset-0 opacity-[0.08]">
                <div className="absolute -left-12 top-24 h-52 w-52 rounded-full border border-white" />
                <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full border border-white" />
              </div>

              <div className="relative flex h-full min-h-[700px] flex-col">
                <div>
                  <div className="inline-flex rounded-[26px] bg-white px-8 py-7 shadow-[0_24px_70px_-25px_rgba(15,23,42,0.7)]">
                    <Image
                      src="/iep-verify-logo.png"
                      alt="IEP Verify"
                      width={520}
                      height={180}
                      priority
                      className="h-auto w-[280px] object-contain sm:w-[320px]"
                    />
                  </div>

                  <p className="mt-10 text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
                    Workspace setup
                  </p>

                  <h1 className="mt-5 max-w-md text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                    {setupComplete
                      ? "Your workspace is ready."
                      : "Set up your educator workspace."}
                  </h1>

                  <p className="mt-6 max-w-md text-base leading-8 text-blue-100">
                    {setupComplete
                      ? "Review your information, then continue to your IEP Verify dashboard."
                      : "Tell us who you are and where you work so IEP Verify can organize your audits by educator, campus, and district."}
                  </p>

                  <div className="mt-10 space-y-4">
                    {[
                      "Your audits stay connected to your account",
                      "Campus and district information is entered once",
                      "Texas review framework is applied automatically",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4d9e7c] text-sm font-bold">
                          ✓
                        </span>

                        <p className="pt-1 text-sm leading-6 text-white">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-10">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
                      Texas Review Framework
                    </p>

                    <p className="mt-3 text-sm leading-6 text-white">
                      Your workspace will use IEP Verify&apos;s Texas-aligned
                      review framework. Additional state frameworks may be
                      added later.
                    </p>
                  </div>

                  <p className="mt-6 text-xs leading-6 text-blue-200">
                    IEP Verify supports professional documentation review. It
                    does not replace educator judgment or determine legal
                    compliance.
                  </p>
                </div>
              </div>
            </aside>

            <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
              <div className="mx-auto max-w-3xl">
                <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
                      Account onboarding
                    </p>

                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                      {setupComplete
                        ? `Welcome, ${firstName.trim()}.`
                        : "Create your workspace"}
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                      {setupComplete
                        ? "Your educator workspace has been prepared. Confirm the information below before continuing."
                        : "Enter your educator and school information. You will only need to complete this setup once."}
                    </p>
                  </div>

                  <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:w-44">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        Setup progress
                      </span>

                      <span className="text-xs font-semibold text-[#0a3d73]">
                        {completionPercent}%
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#0a3d73] transition-all"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {setupComplete ? (
                  <section className="mt-8 space-y-6">
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-7">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                          ✓
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                            Setup complete
                          </p>

                          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                            Your IEP Verify account is ready.
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Your audits will be organized under the educator,
                            campus, district, and review framework shown below.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
                        Account summary
                      </p>

                      <h3 className="mt-2 text-xl font-semibold text-slate-950">
                        Confirm your workspace
                      </h3>

                      <div className="mt-6 divide-y divide-slate-200">
                        <SummaryRow
                          label="Educator"
                          value={educatorName}
                          secondaryValue={role}
                        />

                        <SummaryRow
                          label="District"
                          value={districtName}
                          verified
                        />

                        <SummaryRow
                          label="Campus"
                          value={campusName}
                          verified
                        />

                        <SummaryRow
                          label="Grade levels"
                          value={gradeLevels}
                        />

                        <SummaryRow
                          label="Review framework"
                          value="Texas"
                          secondaryValue="Texas Review Framework"
                          verified
                        />

                        <SummaryRow
                          label="Active IEP students"
                          value={
                            activeIepStudents.trim()
                              ? activeIepStudents
                              : "Not provided"
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-[#0a3d73] shadow-sm">
                          TX
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-[#0a3d73]">
                            Texas-aligned workspace
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Every audit created from this account will
                            automatically use the Texas review framework.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={handleEditInformation}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit Information
                      </button>

                      <button
                        type="button"
                        onClick={handleGoToDashboard}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0a3d73] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07325f] focus:outline-none focus:ring-4 focus:ring-blue-200"
                      >
                        Go to Dashboard
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </section>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-7">
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
                          Your profile
                        </p>

                        <h3 className="mt-2 text-xl font-semibold text-slate-950">
                          Educator information
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          This information identifies the person creating and
                          reviewing audit records.
                        </p>
                      </div>

                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-800">
                            First name
                          </span>

                          <input
                            type="text"
                            value={firstName}
                            onChange={(event) => {
                              setFirstName(event.target.value);
                              clearMessages();
                            }}
                            placeholder="Britton"
                            autoComplete="given-name"
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
                          />
                        </label>

                        <label className="block">
                          <span className="text-sm font-semibold text-slate-800">
                            Last name
                          </span>

                          <input
                            type="text"
                            value={lastName}
                            onChange={(event) => {
                              setLastName(event.target.value);
                              clearMessages();
                            }}
                            placeholder="Doss"
                            autoComplete="family-name"
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
                          />
                        </label>

                        <label className="block sm:col-span-2">
                          <span className="text-sm font-semibold text-slate-800">
                            Role
                          </span>

                          <select
                            value={role}
                            disabled
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100 disabled:cursor-default disabled:bg-white disabled:text-slate-900 disabled:opacity-100"
                          >
                            {roleOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
                          Your school
                        </p>

                        <h3 className="mt-2 text-xl font-semibold text-slate-950">
                          District and campus
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Audit records will be associated with this district
                          and campus.
                        </p>
                      </div>

                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <label className="block sm:col-span-2">
                          <span className="text-sm font-semibold text-slate-800">
                            School district
                          </span>

                          <input
                            type="text"
                            value={districtName}
                            readOnly
                            placeholder="Conroe Independent School District"
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
                          />
                        </label>

                        <label className="block sm:col-span-2">
                          <span className="text-sm font-semibold text-slate-800">
                            School or campus
                          </span>

                          <input
                            type="text"
                            value={campusName}
                            readOnly
                            placeholder="Caney Creek High School"
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
                          />
                        </label>

                        <label className="block">
                          <span className="text-sm font-semibold text-slate-800">
                            State
                          </span>

                          <div className="mt-2 flex min-h-[50px] items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-[#0a3d73]">
                                Texas
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                Texas Review Framework
                              </p>
                            </div>

                            <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-[#0a3d73]">
                              Current
                            </span>
                          </div>
                        </label>

                        <label className="block">
                          <span className="text-sm font-semibold text-slate-800">
                            Grade levels served
                          </span>

                          <select
                            value={gradeLevels}
                            disabled
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100 disabled:cursor-default disabled:bg-white disabled:text-slate-900 disabled:opacity-100"
                          >
                            {gradeLevelOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block sm:col-span-2">
                          <span className="text-sm font-semibold text-slate-800">
                            Number of Active IEP Students
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={activeIepStudents}
                            onChange={(event) => {
                              setActiveIepStudents(event.target.value);
                              clearMessages();
                            }}
                            placeholder="18"
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
                          />

                          <p className="mt-2 text-xs leading-5 text-slate-400">
                            Optional. This helps personalize dashboard summaries
                            and future caseload tools.
                          </p>
                        </label>
                      </div>
                    </section>

                    <section className="rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-[#0a3d73] shadow-sm">
                          TX
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-[#0a3d73]">
                            Texas-aligned workspace
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            All audits created in this workspace will use the
                            current Texas review framework. You will not need
                            to select a state for each student.
                          </p>
                        </div>
                      </div>
                    </section>

                    {errorMessage ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                        {errorMessage}
                      </div>
                    ) : null}

                    {statusMessage ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                        {statusMessage}
                      </div>
                    ) : null}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setStatusMessage(
                            "Profile saving will be enabled when Supabase is connected."
                          )
                        }
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Save and Finish Later
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || loadingApproval}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0a3d73] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07325f] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting
                          ? "Creating Workspace..."
                          : "Continue to Dashboard"}

                        {!isSubmitting ? (
                          <span aria-hidden="true">→</span>
                        ) : null}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  secondaryValue?: string;
  verified?: boolean;
};

function SummaryRow({
  label,
  value,
  secondaryValue,
  verified = false,
}: SummaryRowProps) {
  return (
    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>

        {secondaryValue ? (
          <p className="mt-1 text-xs text-slate-500">{secondaryValue}</p>
        ) : null}
      </div>

      {verified ? (
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span aria-hidden="true">✓</span>
          Confirmed
        </span>
      ) : null}
    </div>
  );
}