"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const processingSteps = [
  {
    label: "Upload received",
    detail: "The primary IEP and supporting documents were received.",
  },
  {
    label: "Reading document",
    detail: "Reviewing the uploaded file structure and document content.",
  },
  {
    label: "Extracting text",
    detail: "Preparing document text for section identification.",
  },
  {
    label: "Detecting IEP sections",
    detail: "Identifying headings and organizing the document by section.",
  },
  {
    label: "Finding FIE Summary",
    detail: "Locating evaluation and FIE summary information.",
  },
  {
    label: "Finding PLAAFP",
    detail: "Identifying present levels and related student needs.",
  },
  {
    label: "Finding annual goals",
    detail: "Locating measurable annual goals and objectives.",
  },
  {
    label: "Finding accommodations",
    detail: "Identifying instructional and assessment accommodations.",
  },
  {
    label: "Finding services",
    detail: "Locating service recommendations and support information.",
  },
  {
    label: "Building evidence map",
    detail: "Organizing source evidence for the later alignment review.",
  },
  {
    label: "Preparing section review",
    detail: "Preparing the extracted content for educator confirmation.",
  },
];

type DocumentSummaryItem = {
  name: string;
  type: string;
  detail: string;
  badge: string;
};
function ProcessingPageContent() {
  const searchParams = useSearchParams();
  const auditId = searchParams.get("auditId");

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(8);
  const [finished, setFinished] = useState(false);
  const [documentSummary, setDocumentSummary] =
  useState<DocumentSummaryItem[]>([]);
  const processingStartedRef = useRef(false);

useEffect(() => {
  if (!auditId) {
    return;
  }

  if (processingStartedRef.current) {
  return;
}

processingStartedRef.current = true;

  let cancelled = false;

  async function extractDocument() {
    try {
      const { data: existingAudit, error: existingAuditError } =
  await supabase
    .from("audits")
    .select("source_input")
    .eq("id", auditId)
    .single();

if (existingAuditError || !existingAudit) {
  throw new Error("Unable to load the audit before processing.");
}

const existingSourceInput = existingAudit.source_input ?? {};

if (existingSourceInput?.extracted?.primaryIep?.text) {
  const files = existingSourceInput.files ?? {};
  const evidenceText = existingSourceInput.evidenceText ?? {};

  const summaryItems: DocumentSummaryItem[] = [];

  if (files.primary?.name) {
    summaryItems.push({
      name: files.primary.name,
      type: "Primary IEP",
      detail: "Uploaded document",
      badge: files.primary.name.toLowerCase().endsWith(".docx")
        ? "DOCX"
        : "PDF",
    });
  }

  if (
    !files.primary?.name &&
    existingSourceInput.primaryText?.trim()
  ) {
    summaryItems.push({
      name: "Pasted IEP",
      type: "Primary IEP",
      detail: `${existingSourceInput.primaryText
        .trim()
        .length.toLocaleString()} characters`,
      badge: "TEXT",
    });
  }

  for (const file of files.combinedSurvey ?? []) {
    summaryItems.push({
      name: file.name,
      type: "Survey Evidence",
      detail: "Uploaded supporting document",
      badge: file.name.toLowerCase().endsWith(".docx")
        ? "DOCX"
        : "PDF",
    });
  }


  setDocumentSummary(summaryItems);

  if (!cancelled) {
    setCurrentStep(processingSteps.length - 1);
    setProgress(100);
    setFinished(true);
  }

  return;
}
      setCurrentStep(1);
      setProgress(15);

      const response = await fetch(
        `/api/audits/${encodeURIComponent(auditId!)}/extract`,
        {
          method: "POST",
        }
      );

      const data = await response.json();
if (cancelled) {
  return;
}
      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to process the uploaded document."
        );
      }
const { data: audit, error: auditError } = await supabase
  .from("audits")
  .select("source_input")
  .eq("id", auditId)
  .single();

if (auditError || !audit) {
  console.error("Processing document summary load error:", auditError);
}

if (audit) {
  const sourceInput = audit.source_input ?? {};
  const files = sourceInput.files ?? {};
  const evidenceText = sourceInput.evidenceText ?? {};

  const summaryItems: DocumentSummaryItem[] = [];

  if (files.primary?.name) {
    summaryItems.push({
      name: files.primary.name,
      type: "Primary IEP",
      detail: "Uploaded document",
      badge: files.primary.name.toLowerCase().endsWith(".docx")
  ? "DOCX"
  : "PDF",
    });
  }

  if (!files.primary?.name && sourceInput.primaryText?.trim()) {
  summaryItems.push({
    name: "Pasted IEP",
    type: "Primary IEP",
    detail: `${sourceInput.primaryText.trim().length.toLocaleString()} characters`,
    badge: "TEXT",
  });
}
for (const file of files.combinedSurvey ?? []) {
  summaryItems.push({
    name: file.name,
    type: "Survey Evidence",
    detail: "Uploaded supporting document",
    badge: file.name.toLowerCase().endsWith(".docx")
      ? "DOCX"
      : "PDF",
  });
}
  for (const file of files.teacherSurvey ?? []) {
  summaryItems.push({
    name: file.name,
    type: "Teacher Survey Evidence",
    detail: "Uploaded supporting document",
    badge: file.name.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF",
  });
}

for (const file of files.parentSurvey ?? []) {
  summaryItems.push({
    name: file.name,
    type: "Parent Survey Evidence",
    detail: "Uploaded supporting document",
    badge: file.name.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF",
  });
}

for (const file of files.studentSurvey ?? []) {
  summaryItems.push({
    name: file.name,
    type: "Student Survey Evidence",
    detail: "Uploaded supporting document",
    badge: file.name.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF",
  });
}
for (const file of files.caseManagerNotes ?? []) {
  summaryItems.push({
    name: file.name,
    type: "Case Manager Notes",
    detail: "Uploaded supporting document",
    badge: file.name.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF",
  });
}

for (const file of files.fieEvaluation ?? []) {
  summaryItems.push({
    name: file.name,
    type: "FIE / Evaluation Evidence",
    detail: "Uploaded supporting document",
    badge: file.name.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF",
  });
}
if (evidenceText.fieEvaluation?.trim()) {
  summaryItems.push({
    name: "FIE / Evaluation Evidence",
    type: "Pasted evidence",
    detail: `${evidenceText.fieEvaluation.trim().length.toLocaleString()} characters`,
    badge: "TEXT",
  });
}
for (const file of files.progressData ?? []) {
  summaryItems.push({
    name: file.name,
    type: "Progress Data",
    detail: "Uploaded supporting document",
    badge: file.name.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF",
  });
}
if (evidenceText.progressData?.trim()) {
  summaryItems.push({
    name: "Progress Data",
    type: "Pasted evidence",
    detail: `${evidenceText.progressData.trim().length.toLocaleString()} characters`,
    badge: "TEXT",
  });
}
  setDocumentSummary(summaryItems);
}
      if (cancelled) {
        return;
      }

      setCurrentStep(processingSteps.length - 1);
      setProgress(100);
      setFinished(true);

      console.log("EXTRACTION RESULT:", data);
    } catch (error) {
      if (cancelled) {
        return;
      }

      console.error("Document extraction error:", error);
    }
  }

  extractDocument();

return () => {
  cancelled = true;
  processingStartedRef.current = false;
};
}, [auditId]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section>
        <Link
          href={
  auditId
    ? `/dashboard/new/upload?auditId=${encodeURIComponent(auditId)}`
    : "/dashboard/new/upload"
}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0a3d73] hover:underline"
        >
          <span aria-hidden="true">←</span>
          Back to Upload
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
          New audit
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Preparing your audit
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          IEP Verify is reading the uploaded documents and preparing the
          detected sections for educator review.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { step: "1", label: "Upload", state: "complete" },
            {
              step: "2",
              label: "Process",
              state: finished ? "complete" : "active",
            },
            { step: "3", label: "Review Sections", state: "upcoming" },
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

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0a3d73]">
                Document processing
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {finished
                  ? "Documents are ready"
                  : processingSteps[currentStep].label}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {finished
                  ? "The document sections have been prepared for educator review."
                  : processingSteps[currentStep].detail}
              </p>
            </div>

            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[8px] ${
                finished
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-blue-100 bg-blue-50 text-[#0a3d73]"
              }`}
            >
              <span className="text-lg font-semibold">
                {finished ? "✓" : `${progress}%`}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  finished ? "bg-emerald-500" : "bg-[#0a3d73]"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-4 text-xs text-slate-500">
              <span>{finished ? "Processing complete" : "Processing documents"}</span>
              <span>{progress}%</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {processingSteps.map((step, index) => {
              const complete = finished || index < currentStep;
              const active = !finished && index === currentStep;
              const upcoming = index > currentStep;

              return (
                <div
                  key={step.label}
                  className={`flex items-start gap-4 rounded-2xl border px-4 py-4 transition ${
                    complete
                      ? "border-emerald-200 bg-emerald-50"
                      : active
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      complete
                        ? "bg-emerald-100 text-emerald-700"
                        : active
                          ? "bg-[#0a3d73] text-white"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {complete ? "✓" : active ? "•" : "○"}
                  </span>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        complete
                          ? "text-emerald-800"
                          : active
                            ? "text-slate-950"
                            : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </p>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        upcoming ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Sources Being Processed
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Uploaded documents and pasted evidence being prepared for review.
            </p>

            <div className="mt-5 space-y-3">
              {documentSummary.map((document) => (
                <div
                  key={document.name}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-semibold text-[#0a3d73]">
                      {document.badge}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {document.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {document.type} · {document.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-semibold text-[#0a3d73] shadow-sm">
              i
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#0a3d73]">
              Review comes next
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              IEP Verify will show every detected section, including the FIE
              Summary, before the audit is run.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Estimated time
            </p>

<p className="mt-2 text-2xl font-semibold text-slate-950">
  {finished ? "Complete" : "Processing"}
</p>

<p className="mt-2 text-xs leading-5 text-slate-500">
  Processing time depends on document length, file type, and the amount
  of supporting evidence included.
</p>
          </section>
        </aside>
      </section>

      <section className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={
  auditId
    ? `/dashboard/new/upload?auditId=${encodeURIComponent(auditId)}`
    : "/dashboard/new/upload"
}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Upload
        </Link>

        {finished ? (
<Link
  href={`/dashboard/new/review?auditId=${encodeURIComponent(auditId ?? "")}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0a3d73] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07325f] focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Review Extracted Sections
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center rounded-2xl bg-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-500"
          >
            Processing Documents
          </button>
        )}
      </section>
    </div>
  );
}
export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl p-8 text-sm text-slate-500">
          Loading audit...
        </div>
      }
    >
      <ProcessingPageContent />
    </Suspense>
  );
}