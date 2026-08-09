"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SectionKey =
  | "studentInformation"
  | "eligibility"
  | "fieSummary"
  | "plaafp"
  | "vision"
  | "goals"
  | "accommodations"
  | "services"
  | "recommendedTeks"
  | "transition"
  | "progressMonitoring";

type SectionState = Record<SectionKey, string>;
type ExpandedState = Record<SectionKey, boolean>;
type ConfirmedState = Record<SectionKey, boolean>;
type AbsentState = Record<SectionKey, boolean>;

type SectionDefinition = {
  key: SectionKey;
  title: string;
  description: string;
  source: string;
  required: boolean;
  placeholder: string;
};

const sectionDefinitions: SectionDefinition[] = [
  {
    key: "studentInformation",
    title: "Student Information",
    description:
      "Confirm the student identifier, grade level, and other basic information detected from the IEP.",
    source: "Detected from document cover and student-information pages",
    required: true,
    placeholder:
      "Student identifier, grade level, campus, review type, and other basic information.",
  },
  {
    key: "eligibility",
    title: "Eligibility",
    description:
      "Review the eligibility or disability information explicitly stated in the document.",
    source: "Detected from eligibility and evaluation references",
    required: false,
    placeholder:
      "Paste or edit eligibility information exactly as supported by the uploaded document.",
  },
  {
    key: "fieSummary",
    title: "FIE Summary",
    description:
      "Confirm the evaluation summary that should inform the present levels and related documentation.",
    source: "Detected from FIE or evaluation information",
    required: true,
    placeholder:
      "Paste or edit the FIE summary or relevant evaluation narrative.",
  },
  {
    key: "plaafp",
    title: "PLAAFP",
    description:
      "Review the present levels statement, including strengths, needs, impact, and measurable evidence.",
    source: "Detected from present-level sections",
    required: true,
    placeholder:
      "Paste or edit the complete PLAAFP section.",
  },
  {
    key: "vision",
    title: "Vision",
    description:
      "Confirm the long-term student vision and intended educational direction.",
    source: "Detected from vision or future-planning sections",
    required: false,
    placeholder:
      "Paste or edit the vision statement.",
  },
  {
    key: "goals",
    title: "Annual Goals",
    description:
      "Review annual goals, objectives, baselines, conditions, criteria, and progress expectations.",
    source: "Detected from annual-goal pages",
    required: true,
    placeholder:
      "Paste or edit the annual goals and related objectives.",
  },
  {
    key: "accommodations",
    title: "Accommodations",
    description:
      "Confirm instructional, assessment, setting, scheduling, and presentation accommodations.",
    source: "Detected from accommodations and supports pages",
    required: true,
    placeholder:
      "Paste or edit all current and recommended accommodations.",
  },
  {
    key: "services",
    title: "Services",
    description:
      "Review special education, related, supplementary, and instructional service information.",
    source: "Detected from service-delivery pages",
    required: true,
    placeholder:
      "Paste or edit current services, frequency, duration, location, and provider information.",
  },
  {
    key: "recommendedTeks",
    title: "Recommended TEKS",
    description:
      "Confirm the standards identified for instructional alignment and goal support.",
    source: "Detected from standards-alignment information",
    required: false,
    placeholder:
      "Paste or edit recommended TEKS codes and descriptions.",
  },
  {
    key: "transition",
    title: "Transition",
    description:
      "Review postsecondary goals, student preferences, transition needs, and coordinated activities.",
    source: "Detected from transition-planning sections",
    required: false,
    placeholder:
      "Paste or edit transition information.",
  },
  {
    key: "progressMonitoring",
    title: "Progress Monitoring",
    description:
      "Confirm how progress will be measured, reported, and reviewed.",
    source: "Detected from goal and progress-reporting sections",
    required: false,
    placeholder:
      "Paste or edit progress-monitoring methods, frequency, and reporting details.",
  },
];

const initialSections: SectionState = {
  studentInformation:
    "Student Identifier: J.R.\nGrade Level: 10\nAudit Type: Annual IEP Review",
  eligibility:
    "The student is eligible for special education services under the eligibility category stated in the uploaded IEP.",
  fieSummary:
    "Evaluation information indicates documented needs in the areas reflected in the current IEP. Confirm and replace this sample text with the extracted FIE summary.",
  plaafp:
    "The student demonstrates documented strengths and needs across academic, functional, behavioral, and transition areas. Replace this sample text with the extracted PLAAFP.",
  vision:
    "The student will increase independence, access grade-level instruction, and progress toward identified postsecondary goals.",
  goals:
    "Annual Goal 1: Replace this sample goal with the extracted annual goal text.\n\nAnnual Goal 2: Replace this sample goal with the extracted annual goal text.",
  accommodations:
    "Extended time\nSmall-group testing\nFrequent checks for understanding\nAccess to teacher-provided notes",
  services:
    "Special education instructional support\nService frequency and duration to be confirmed from the uploaded document",
  recommendedTeks:
    "Replace this sample text with extracted TEKS codes and descriptions.",
  transition:
    "Replace this sample text with extracted transition goals, needs, preferences, and coordinated activities.",
  progressMonitoring:
    "Progress will be measured using curriculum-based data, work samples, and scheduled reporting intervals.",
};

const initialExpandedState: ExpandedState = {
  studentInformation: true,
  eligibility: false,
  fieSummary: true,
  plaafp: true,
  vision: false,
  goals: true,
  accommodations: true,
  services: true,
  recommendedTeks: false,
  transition: false,
  progressMonitoring: false,
};

const initialConfirmedState: ConfirmedState = {
  studentInformation: false,
  eligibility: false,
  fieSummary: false,
  plaafp: false,
  vision: false,
  goals: false,
  accommodations: false,
  services: false,
  recommendedTeks: false,
  transition: false,
  progressMonitoring: false,
};

const initialAbsentState: AbsentState = {
  studentInformation: false,
  eligibility: false,
  fieSummary: false,
  plaafp: false,
  vision: false,
  goals: false,
  accommodations: false,
  services: false,
  recommendedTeks: false,
  transition: false,
  progressMonitoring: false,
};

type StoredDetectedSection = {
  key: string;
  label: string;
  found: boolean;
  text: string;
};

export default function ReviewExtractedSectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auditId = searchParams.get("auditId");

  const [sections, setSections] = useState<SectionState>(initialSections);
  const [expanded, setExpanded] =
    useState<ExpandedState>(initialExpandedState);
  const [confirmed, setConfirmed] =
    useState<ConfirmedState>(initialConfirmedState);
  const [absent, setAbsent] =
  useState<AbsentState>(initialAbsentState);

  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

useEffect(() => {
  if (!auditId) {
    setErrorMessage("No audit ID was provided.");
    return;
  }

  let cancelled = false;

  async function loadExtractedSections() {
    const { data: audit, error } = await supabase
      .from("audits")
      .select(
        "id, student_identifier, grade_level, audit_type, source_input"
      )
      .eq("id", auditId)
      .single();

    if (cancelled) {
      return;
    }

    if (error || !audit) {
      console.error("Review audit load error:", error);
      setErrorMessage("Unable to load the extracted audit sections.");
      return;
    }

    const detectedSections =
      (audit.source_input?.extracted?.primaryIep
        ?.detectedSections ?? []) as StoredDetectedSection[];

    const detectedByKey = new Map(
      detectedSections.map((section) => [section.key, section])
    );

    const getDetectedText = (key: string) =>
      detectedByKey.get(key)?.text?.trim() ?? "";

    const savedReview = audit.source_input?.reviewed;

    const savedSections =
     (savedReview?.sections ?? null) as SectionState | null;

    const savedConfirmed =
     (savedReview?.confirmed ?? null) as ConfirmedState | null;

    const savedAbsent =
     (savedReview?.absent ?? null) as AbsentState | null;

setSections(
  savedSections ?? {
    studentInformation: [
      `Student Identifier: ${audit.student_identifier ?? ""}`,
      `Grade Level: ${audit.grade_level ?? ""}`,
      `Audit Type: ${audit.audit_type ?? ""}`,
    ].join("\n"),

    eligibility: "",

    fieSummary: getDetectedText("fie_summary"),
    plaafp: getDetectedText("plaafp"),
    vision: getDetectedText("vision"),
    goals: getDetectedText("annual_goals"),
    accommodations: getDetectedText("accommodations"),
    services: getDetectedText("services"),
    recommendedTeks: getDetectedText("recommended_teks"),
    transition: getDetectedText("transition"),
    progressMonitoring: getDetectedText("progress_monitoring"),
  }
);
if (savedConfirmed) {
  setConfirmed(savedConfirmed);
}

if (savedAbsent) {
  setAbsent(savedAbsent);
}
    setExpanded((current) => ({
      ...current,
      studentInformation: true,
      fieSummary: Boolean(getDetectedText("fie_summary")),
      plaafp: Boolean(getDetectedText("plaafp")),
      vision: Boolean(getDetectedText("vision")),
      goals: Boolean(getDetectedText("annual_goals")),
      accommodations: Boolean(getDetectedText("accommodations")),
      services: Boolean(getDetectedText("services")),
      recommendedTeks: Boolean(getDetectedText("recommended_teks")),
      progressMonitoring: Boolean(getDetectedText("progress_monitoring")),
      transition: Boolean(getDetectedText("transition")),
    }));

    setErrorMessage("");
  }

  loadExtractedSections();

  return () => {
    cancelled = true;
  };
}, [auditId]);

  const requiredSections = useMemo(
    () => sectionDefinitions.filter((section) => section.required),
    []
  );

  const confirmedRequiredCount = requiredSections.filter(
    (section) => confirmed[section.key]
  ).length;

  const totalConfirmedCount = Object.values(confirmed).filter(Boolean).length;

  const completionPercent = Math.round(
    (totalConfirmedCount / sectionDefinitions.length) * 100
  );

  const allSectionsConfirmed =
  totalConfirmedCount === sectionDefinitions.length;

  function clearMessages() {
    setErrorMessage("");
    setStatusMessage("");
  }

  function toggleExpanded(key: SectionKey) {
    setExpanded((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function updateSection(key: SectionKey, value: string) {
    setSections((current) => ({
      ...current,
      [key]: value,
    }));

    setConfirmed((current) => ({
      ...current,
      [key]: false,
    }));

    clearMessages();
  }

function confirmSection(key: SectionKey) {
  const hasContent = sections[key].trim().length > 0;

  setConfirmed((current) => ({
    ...current,
    [key]: true,
  }));

  setAbsent((current) => ({
    ...current,
    [key]: !hasContent,
  }));

  clearMessages();
}

function reopenSection(key: SectionKey) {
  setConfirmed((current) => ({
    ...current,
    [key]: false,
  }));

  setAbsent((current) => ({
    ...current,
    [key]: false,
  }));

  setExpanded((current) => ({
    ...current,
    [key]: true,
  }));

  clearMessages();
}

  function confirmAllCompletedSections() {
    const nextConfirmed = { ...confirmed };

    for (const section of sectionDefinitions) {
      if (sections[section.key].trim()) {
        nextConfirmed[section.key] = true;
      }
    }

    setConfirmed(nextConfirmed);
    setStatusMessage("All completed sections have been marked as reviewed.");
    setErrorMessage("");
  }
async function saveReview() {
  if (!auditId) {
    setErrorMessage("No audit ID was provided.");
    return false;
  }

  clearMessages();

  const { data: audit, error: loadError } = await supabase
    .from("audits")
    .select("source_input")
    .eq("id", auditId)
    .single();

  if (loadError || !audit) {
    console.error("Review save load error:", loadError);
    setErrorMessage("Unable to load the audit before saving.");
    return false;
  }

  const updatedSourceInput = {
    ...(audit.source_input ?? {}),
    reviewed: {
      sections,
      confirmed,
      absent,
      reviewedAt: new Date().toISOString(),
    },
  };

  const { error: saveError } = await supabase
    .from("audits")
    .update({
      source_input: updatedSourceInput,
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", auditId);

  if (saveError) {
    console.error("Review save error:", saveError);
    setErrorMessage("Unable to save the reviewed sections.");
    return false;
  }

  setStatusMessage("Review saved successfully.");
  return true;
}
async function handleContinue() {
  const unconfirmedSections = sectionDefinitions.filter(
    (section) => !confirmed[section.key]
  );

  if (unconfirmedSections.length > 0) {
    const firstMissing = unconfirmedSections[0];

    setExpanded((current) => ({
      ...current,
      [firstMissing.key]: true,
    }));

    setErrorMessage(
      `Review and confirm every section before running the audit. Start with ${firstMissing.title}.`
    );

    return;
  }

  clearMessages();

  const saved = await saveReview();

  if (!saved) {
    return;
  }

router.push(
  `/dashboard/new/audit?auditId=${encodeURIComponent(auditId!)}`
);
}

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section>
        <Link
          href="/dashboard/new/process"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0a3d73] hover:underline"
        >
          <span aria-hidden="true">←</span>
          Back to Processing
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
          New audit
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Review Extracted Sections
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Confirm that IEP Verify identified the correct content before the
          audit runs. Edit any section that was incomplete or extracted
          incorrectly.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { step: "1", label: "Upload", state: "complete" },
            { step: "2", label: "Process", state: "complete" },
            { step: "3", label: "Review Sections", state: "active" },
            { step: "4", label: "Run Audit", state: "upcoming" },
          ].map((item, index, items) => {
            const isComplete = item.state === "complete";
            const isActive = item.state === "active";

            return (
              <div key={item.step} className="flex items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      isComplete
                        ? "bg-emerald-100 text-emerald-700"
                        : isActive
                          ? "bg-[#0a3d73] text-white"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isComplete ? "✓" : item.step}
                  </span>

                  <span
                    className={`truncate text-sm font-semibold ${
                      isComplete
                        ? "text-emerald-700"
                        : isActive
                          ? "text-slate-950"
                          : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {index < items.length - 1 ? (
                  <div className="mx-4 hidden h-px flex-1 bg-slate-200 sm:block" />
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {sectionDefinitions.map((section) => {
            const isOpen = expanded[section.key];
            const isConfirmed = confirmed[section.key];
            const hasContent = sections[section.key].trim().length > 0;

            return (
              <article
                key={section.key}
                className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition ${
                  isConfirmed
                    ? "border-emerald-200"
                    : section.required
                      ? "border-slate-300"
                      : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpanded(section.key)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start justify-between gap-5 px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                        isConfirmed
                          ? "bg-emerald-100 text-emerald-700"
                          : hasContent
                            ? "bg-blue-100 text-[#0a3d73]"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isConfirmed ? "✓" : hasContent ? "•" : "!"}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-base font-semibold text-slate-950">
                          {section.title}
                        </h2>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            section.required
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {section.required ? "Required" : "Optional"}
                        </span>

                       {isConfirmed ? (
  <>
    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      Reviewed
    </span>

    {absent[section.key] ? (
      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        Not Present
      </span>
    ) : null}
  </>
) : null}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {section.description}
                      </p>

                      <p className="mt-2 text-xs font-medium text-slate-400">
                        {section.source}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-600 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  >
                    ⌄
                  </span>
                </button>

                {isOpen ? (
                  <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-6 sm:px-6">
                    <textarea
                      value={sections[section.key]}
                      onChange={(event) =>
                        updateSection(section.key, event.target.value)
                      }
                      placeholder={section.placeholder}
                      rows={section.key === "goals" ? 12 : 9}
                      className="min-h-52 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
                    />

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-slate-400">
                        {sections[section.key].length.toLocaleString()} characters
                      </span>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(sections[section.key])
                          }
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Copy
                        </button>

                        {isConfirmed ? (
                          <button
                            type="button"
                            onClick={() => reopenSection(section.key)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit Again
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => confirmSection(section.key)}
                            className="inline-flex items-center justify-center rounded-xl bg-[#0a3d73] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#07325f]"
                          >
                            {hasContent ? "Confirm Section" : "Confirm Not Present"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0a3d73]">
              Review progress
            </p>

            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold text-slate-950">
                  {completionPercent}%
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {totalConfirmedCount} of {sectionDefinitions.length} sections
                  reviewed
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-[#0a3d73]">
                {totalConfirmedCount}/{sectionDefinitions.length}
              </div>
            </div>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#0a3d73] transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Required sections
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {confirmedRequiredCount} of {requiredSections.length} required
                sections confirmed
              </p>
            </div>

            <button
              type="button"
              onClick={confirmAllCompletedSections}
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Confirm All Completed Sections
            </button>
          </section>

          <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-semibold text-[#0a3d73] shadow-sm">
              i
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#0a3d73]">
              Human review required
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Confirm that extracted sections are complete and accurately
              reflect the uploaded IEP before the audit engine evaluates them.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">
              Required before audit
            </h2>

            <div className="mt-4 space-y-3">
              {requiredSections.map((section) => (
                <div
                  key={section.key}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-slate-600">{section.title}</span>

                  <span
                    className={`font-semibold ${
                      confirmed[section.key]
                        ? "text-emerald-700"
                        : "text-slate-400"
                    }`}
                  >
                    {confirmed[section.key] ? "✓" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
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

      <section className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/new/process"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Processing
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={saveReview}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Save Review
          </button>

<button
  type="button"
  onClick={handleContinue}
  disabled={!allSectionsConfirmed}
  title={
    allSectionsConfirmed
      ? "All sections confirmed. Continue to run the audit."
      : "Confirm all sections before running the audit."
  }
  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-sm transition ${
    allSectionsConfirmed
      ? "bg-[#0a3d73] text-white hover:bg-[#07325f] focus:outline-none focus:ring-4 focus:ring-blue-200"
      : "cursor-not-allowed bg-slate-200 text-slate-400"
  }`}
>
  Continue to Run Audit
  <span aria-hidden="true">→</span>
</button>
        </div>
      </section>
    </div>
  );
}