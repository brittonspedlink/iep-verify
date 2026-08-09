"use client";

import { useEffect, useRef, useState, type ChangeEvent, Fragment } from "react";

type FormState = {
  teacherSurvey: string;
  parentSurvey: string;
  studentSurvey: string;
  caseNotes: string;
  plaaFP: string;
  vision: string;
  goals: string;
  accommodations: string;
  services: string;
  recommendedTEKS: string;
  expectedTeacherSurveyCount: number;
  completedTeacherSurveyCount: number;
};

type ReviewFinding = {
  severity: "critical" | "major" | "minor";
  title: string;
  explanation: string;
  evidence: string[];
  recommendation: string;
};

type DocumentReview = {
  score: number | null;
  status: string;
  mainIssue: string;
  supportedContent: string[];
  missingEvidence: string[];
  unsupportedStatements: string[];
  conflicts: string[];
  omittedRecommendations: string[];
  recommendedRevisions: string[];
  findings: ReviewFinding[];
};

type AuditResult = {
  overallScore: number;
  evidenceReadinessScore: number;
  documentationAlignmentScore: number;
  auditStatus: "Ready for Review" | "Review with Caution" | "Not Ready for Review";
  criticalGaps: string[];
  caseCompleteness: {
    expectedTeacherSurveys: number;
    completedTeacherSurveys: number;
    missingTeacherSurveys: number;
    blankDocuments: string[];
    placeholderResponses: string[];
  };
  overallSummary: string;
  documentReviews: {
    plaafp: DocumentReview;
    vision: DocumentReview;
    goals: DocumentReview;
    accommodations: DocumentReview;
    services: DocumentReview;
    recommendedTeks: DocumentReview;
  };
};

type FieldDefinition = {
  key: keyof FormState;
  label: string;
  placeholder: string;
  kind: "textarea" | "number";
};

const fieldDefinitions: FieldDefinition[] = [
  {
    key: "teacherSurvey",
    label: "Teacher Survey",
    placeholder: "Capture teacher observations, instructional notes, and classroom evidence.",
    kind: "textarea",
  },
  {
    key: "parentSurvey",
    label: "Parent Survey",
    placeholder: "Record family insights, concerns, routines, and home support strategies.",
    kind: "textarea",
  },
  {
    key: "studentSurvey",
    label: "Student Survey",
    placeholder: "Document the student’s voice, preferences, strengths, and self-reported challenges.",
    kind: "textarea",
  },
  {
    key: "caseNotes",
    label: "Case Manager / Teacher / Parent Notes",
    placeholder:
      "Add case manager observations, teacher follow-up notes, parent concerns, ARD preparation notes, or other relevant context not captured in the surveys.",
    kind: "textarea",
  },
  {
    key: "expectedTeacherSurveyCount",
    label: "Expected Teacher Survey Count",
    placeholder: "0",
    kind: "number",
  },
  {
    key: "completedTeacherSurveyCount",
    label: "Completed Teacher Survey Count",
    placeholder: "0",
    kind: "number",
  },
  {
    key: "plaaFP",
    label: "PLAAFP",
    placeholder: "Summarize present levels of academic achievement and functional performance.",
    kind: "textarea",
  },
  {
    key: "vision",
    label: "Vision",
    placeholder: "Outline future-oriented expectations and student-centered outcomes.",
    kind: "textarea",
  },
  {
    key: "goals",
    label: "Goals",
    placeholder: "Describe measurable, evidence-based annual goals and success criteria.",
    kind: "textarea",
  },
{
  key: "accommodations",
  label: "IEP Accommodations",
  placeholder: "Paste the IEP accommodations. These will be reviewed for evidence support, need alignment, completeness, and unsupported recommendations.",
  kind: "textarea",
},
{
  key: "services",
  label: "IEP Services",
  placeholder: "Paste the IEP services. These will be reviewed for evidence support and alignment to documented student needs and goals.",
  kind: "textarea",
},
  {
    key: "recommendedTEKS",
    label: "Recommended TEKS",
    placeholder: "Align standards, curriculum connections, and instructional priorities.",
    kind: "textarea",
  },
];

const groups: Array<{
  title: string;
  description: string;
  fields: Array<keyof FormState>;
}> = [
  {
    title: "Source Evidence",
    description:
      "Teacher, parent, and student surveys provide the source evidence that supports each generated document.",
    fields: ["teacherSurvey", "parentSurvey", "studentSurvey", "caseNotes", "expectedTeacherSurveyCount", "completedTeacherSurveyCount"],
  },
  {
    title: "IEP Documentation",
    description:
      "Paste IEP documentation here and verify each section against the supplied evidence.",
    fields: ["plaaFP", "vision", "goals", "accommodations", "services", "recommendedTEKS"],
  },
];

const initialState: FormState = {
  teacherSurvey: "",
  parentSurvey: "",
  studentSurvey: "",
  caseNotes: "",
  plaaFP: "",
  vision: "",
  goals: "",
  accommodations: "",
  services: "",
  recommendedTEKS: "",
  expectedTeacherSurveyCount: 0,
  completedTeacherSurveyCount: 0,
};

const sourceEvidenceFields: Array<keyof FormState> = ["teacherSurvey", "parentSurvey", "studentSurvey", "caseNotes"];

export default function Home() {
  const [formData, setFormData] = useState<FormState>(initialState);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [validationError, setValidationError] = useState("");
  const [auditError, setAuditError] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [expandedDocument, setExpandedDocument] = useState<string | null>("plaafp");
  const [auditMessage, setAuditMessage] = useState(
    "Ready to compare generated documentation against survey evidence and surface supported content, missing information, unsupported statements, and alignment concerns."
  );
  const resultsRef = useRef<HTMLElement | null>(null);

  const handleTextChange = (field: keyof FormState) => (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const value = event.target.value;
    setFormData((current) => ({ ...current, [field]: value } as FormState));
  };

  const handleNumberChange = (field: "expectedTeacherSurveyCount" | "completedTeacherSurveyCount") => (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleRunAudit = async () => {
    const sourceEvidenceCompleted = sourceEvidenceFields.filter((field) => {
      const value = formData[field];
      return typeof value === "string" && value.trim().length > 0;
    }).length;

    if (sourceEvidenceCompleted === 0) {
      setAuditResult(null);
      setAuditError("");
      setValidationError("Add at least one source evidence field before running the audit.");
      setAuditMessage(
        "Add at least one source evidence field to generate an audit and review documentation alignment."
      );
      return;
    }

    setValidationError("");
    setAuditError("");
    setIsAuditing(true);
    setAuditMessage("Running audit...");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherSurvey: formData.teacherSurvey,
          parentSurvey: formData.parentSurvey,
          studentSurvey: formData.studentSurvey,
          caseNotes: formData.caseNotes,
          expectedTeacherSurveyCount: formData.expectedTeacherSurveyCount,
          completedTeacherSurveyCount: formData.completedTeacherSurveyCount,
          plaafp: formData.plaaFP,
          vision: formData.vision,
          goals: formData.goals,
          accommodations: formData.accommodations,
          services: formData.services,
          recommendedTeks: formData.recommendedTEKS,
        }),
      });

      const data = await response.json();
      console.log("Audit API response:", data);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to complete audit request.");
      }

      setAuditResult(data as AuditResult);
      setAuditMessage(
        `Audit completed with ${Object.entries(formData).filter(([key, value]) => {
          if (key === "expectedTeacherSurveyCount" || key === "completedTeacherSurveyCount") {
            return false;
          }
          return typeof value === "string" && value.trim().length > 0;
        }).length} sections populated for review and alignment.`
      );
    } catch (error) {
      setAuditResult(null);
      setAuditError(error instanceof Error ? error.message : "Unable to complete audit request.");
      setAuditMessage("Audit could not be completed.");
    } finally {
      setIsAuditing(false);
    }
  };

  const completedCount = Object.entries(formData).filter(([key, value]) => {
    if (key === "expectedTeacherSurveyCount" || key === "completedTeacherSurveyCount") {
      return false;
    }
    return typeof value === "string" && value.trim().length > 0;
  }).length;

  useEffect(() => {
    if (auditResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [auditResult]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#f5f7ff_45%,_#eef3ff_100%)] text-slate-900">
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="print:hidden overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur xl:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                Evidence-driven review workspace
              </span>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  IEP Verify
                </h1>
                <p className="text-lg text-slate-600 sm:text-xl">
                  Evidence-Based Documentation Review
                </p>
              </div>
              <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                Compare generated IEP documentation against teacher, parent, and student survey evidence to identify supported content, missing information, unsupported statements, and alignment concerns.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2">
              <button
                type="button"
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAuditing ? "Running audit..." : "Run Audit"}
              </button>

{auditResult ? (
  <button
    type="button"
    onClick={() => window.print()}
    className="print:hidden inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
  >
    Export Audit
  </button>
) : null}

{validationError ? (
                <p className="max-w-sm text-sm leading-6 text-rose-600">{validationError}</p>
              ) : null}
              {auditError ? (
                <p className="max-w-sm text-sm leading-6 text-rose-600">{auditError}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="print:hidden grid gap-6 lg:grid-cols-[1.55fr_0.8fr]">
          <div className="space-y-6 rounded-[28px] border border-slate-200/70 bg-white/85 p-4 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
            {groups.map((group) => (
              <div key={group.title} className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-950">{group.title}</h2>
                  <p className="text-sm leading-7 text-slate-600">{group.description}</p>
                </div>

                <div className="space-y-4">
                  {group.fields.map((fieldKey) => {
                    const field = fieldDefinitions.find((item) => item.key === fieldKey);

                    if (!field) {
                      return null;
                    }

                    return (
                      <label
                        key={field.key}
                        className="block rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm transition hover:border-slate-300 hover:bg-white"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                            {field.label}
                          </span>
                          <span className="text-xs font-medium text-slate-400">Draft</span>
                        </div>
                        {field.kind === "number" ? (
                          <input
                            type="number"
                            min="0"
                            value={Number(formData[field.key] ?? 0)}
                            onChange={handleNumberChange(field.key as "expectedTeacherSurveyCount" | "completedTeacherSurveyCount")}
                            placeholder={field.placeholder}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                          />
                        ) : (
                          <textarea
                            value={formData[field.key] as string}
                            onChange={handleTextChange(field.key)}
                            placeholder={field.placeholder}
                            rows={5}
                            className="min-h-32 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-slate-950 p-6 text-white shadow-[0_20px_60px_-28px_rgba(15,23,42,0.45)]">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Audit snapshot
              </p>
              <h2 className="mt-3 text-xl font-semibold">Review readiness</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{auditMessage}</p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-sm font-medium text-slate-100">Evidence coverage</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {completedCount}/10
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-sm font-medium text-slate-100">Focus area</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Compare each generated document against survey evidence to identify supported content, missing information, unsupported statements, and alignment concerns.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.3)] backdrop-blur">
              <h3 className="text-lg font-semibold text-slate-950">Why this helps</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <li>• Keep survey-based evidence and generated documents side by side.</li>
                <li>• Review support, missing details, and alignment concerns in one view.</li>
                <li>• Support a clear, professional IEP review workflow.</li>
              </ul>
            </div>
          </aside>
        </section>

        {auditResult ? (
         <section
  ref={resultsRef}
  id="audit-results"
  className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.3)] backdrop-blur sm:p-8"
>
  <div className="hidden print:block print:mb-8">
  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
    IEP Verify
  </p>

  <h1 className="mt-2 text-3xl font-semibold text-slate-950">
    IEP Audit Report
  </h1>

  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-700">
    <div>
      <p className="font-semibold text-slate-950">Audit Date</p>
      <p>{new Date().toLocaleDateString()}</p>
    </div>

    <div>
      <p className="font-semibold text-slate-950">Audit Status</p>
      <p>{auditResult.auditStatus}</p>
    </div>

    <div>
      <p className="font-semibold text-slate-950">Overall Score</p>
      <p>{auditResult.overallScore}</p>
    </div>

    <div>
      <p className="font-semibold text-slate-950">Alignment Score</p>
      <p>{auditResult.documentationAlignmentScore}</p>
    </div>
  </div>

  <div className="mt-6 border-t border-slate-200" />
</div>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Audit Results
                </p>
                <h2 className="text-2xl font-semibold text-slate-950">Professional review summary</h2>
                <p className="text-sm leading-7 text-slate-600">
                  {auditResult.overallSummary}
                </p>
              </div>

              <div className="flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-6 py-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-sky-700">Overall Score</p>
                  <p className="text-3xl font-semibold text-slate-950">{auditResult.overallScore}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Audit Status</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{auditResult.auditStatus}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Evidence Readiness</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{auditResult.evidenceReadinessScore}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Alignment Score</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{auditResult.documentationAlignmentScore}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Critical Gaps</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{auditResult.criticalGaps.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Missing Teacher Surveys</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{auditResult.caseCompleteness.missingTeacherSurveys}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Blank Documents</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{auditResult.caseCompleteness.blankDocuments.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Placeholder Responses</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{auditResult.caseCompleteness.placeholderResponses.length}</p>
              </div>
            </div>

            <div className="mt-8 text-sm leading-7 text-slate-500">
              IEP Verify evaluates submitted IEP documentation based on the records supplied. It does not certify legal compliance or verify implementation.
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-2">
              {[
                {
                  key: "accommodations",
                  label: "Accommodations Alignment",
                  note: "This review evaluates IEP accommodations against source evidence. It does not verify delivery, scheduling, implementation, or compliance logs.",
                  noData: "Not evaluated — no generated accommodations were provided.",
                },
                {
                  key: "services",
                  label: "Services Alignment",
                  note: "This review evaluates the documentation and evidence alignment of the IEP services. It does not verify service delivery, scheduling, implementation, or compliance logs.",
                  noData: "Not evaluated — no generated services recommendations were provided.",
                },
              ].map(({ key, label, note, noData }) => {
                const review = auditResult.documentReviews[key as keyof typeof auditResult.documentReviews];
                const hasReviewContent = review.score !== null;
                return (
                  <div key={key} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{note}</p>
                      </div>
                      <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                        {review.status === "review_finding"
  ? "Review Finding"
  : review.status === "verified"
    ? "Verified"
    : review.status.replaceAll("_", " ")}
                      </div>
                    </div>

                    {hasReviewContent ? (
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Score</p>
                          <p className="mt-2 text-3xl font-semibold text-slate-950">{review.score}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Main issue</p>
                          <p className="mt-2 text-sm leading-7 text-slate-700">{review.mainIssue}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Supported content</p>
                          <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-600">
                            {review.supportedContent.length > 0 ? review.supportedContent.map((item) => <li key={item}>• {item}</li>) : <li>• None identified.</li>}
                          </ul>
                        </div>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Possible omissions</p>
                          <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-600">
                            {review.missingEvidence.length > 0 ? review.missingEvidence.map((item) => <li key={item}>• {item}</li>) : <li>• No omissions identified.</li>}
                          </ul>
                        </div>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recommended corrections</p>
                          <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-600">
                            {review.recommendedRevisions.length > 0 ? review.recommendedRevisions.map((item) => <li key={item}>• {item}</li>) : <li>• No corrections identified.</li>}
                          </ul>
                        </div>
                        <div className="sm:col-span-2 rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Prioritized findings</p>
                          <div className="mt-2 space-y-3 text-sm leading-7 text-slate-600">
                            {review.findings.length > 0 ? (
                              review.findings.map((finding) => (
                                <div key={finding.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{finding.severity}</p>
                                  <p className="mt-1 font-semibold text-slate-900">{finding.title}</p>
                                  <p className="mt-1 text-sm text-slate-600">{finding.explanation}</p>
                                </div>
                              ))
                            ) : (
                              <p>• No prioritized findings identified.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-6 text-sm leading-7 text-slate-600">{noData}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white/80">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Document</th>
                    <th className="px-4 py-3 font-semibold">Score</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Main Issue</th>
                    <th className="px-4 py-3 font-semibold print:hidden">View Details</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "plaafp", label: "PLAAFP" },
                    { key: "vision", label: "Vision" },
                    { key: "goals", label: "Goals" },
                    { key: "accommodations", label: "Accommodations" },
                    { key: "services", label: "Services" },
                    { key: "recommendedTeks", label: "Recommended TEKS" },
                  ].map(({ key, label }) => {
                    const review = auditResult.documentReviews[key as keyof typeof auditResult.documentReviews];
                    const isExpanded = expandedDocument === key;
                    const statusClasses =
                      review.status === "not_provided"
                        ? "border-slate-200 bg-slate-100 text-slate-700"
                        :review.status === "Not Ready for Review" || review.status === "review_finding"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : review.status === "Review with Caution"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700";

                    return (
                      <Fragment key={key}>
                        <tr className="border-t border-slate-200/80 align-top">
                          <td className="px-4 py-4 font-medium text-slate-900">{label}</td>
                          <td className="px-4 py-4 text-slate-700">{review.score !== null ? review.score : "Not provided"}</td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses}`}>
                             {review.status === "review_finding"
  ? "Review Finding"
  : review.status === "verified"
    ? "Verified"
    : review.status.replaceAll("_", " ")}
                          </span>
                          </td>
                          <td className="px-4 py-4 text-slate-700">{review.mainIssue}</td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => setExpandedDocument((current) => (current === key ? null : key))}
                              className="print:hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              {isExpanded ? "Hide Details" : "View Details"}
                            </button>
                          </td>
                        </tr>
                        {(
                          <tr className={isExpanded ? "table-row" : "hidden print:table-row"}>
                            <td colSpan={5} className="bg-slate-50/80 px-4 py-4">
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <div>
                                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Supported Content</h4>
                                  <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-600">
                                    {review.supportedContent.length > 0 ? (
                                      review.supportedContent.map((item) => <li key={item}>• {item}</li>)
                                    ) : (
                                      <li>• No supported content identified.</li>
                                    )}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Missing Evidence</h4>
                                  <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-600">
                                    {review.missingEvidence.length > 0 ? (
                                      review.missingEvidence.map((item) => <li key={item}>• {item}</li>)
                                    ) : (
                                      <li>• No missing evidence identified.</li>
                                    )}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Unsupported Statements</h4>
                                  <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-600">
                                    {review.unsupportedStatements.length > 0 ? (
                                      review.unsupportedStatements.map((item) => <li key={item}>• {item}</li>)
                                    ) : (
                                      <li>• No unsupported statements identified.</li>
                                    )}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Conflicts</h4>
                                  <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-600">
                                    {review.conflicts.length > 0 ? (
                                      review.conflicts.map((item) => <li key={item}>• {item}</li>)
                                    ) : (
                                      <li>• No conflicts identified.</li>
                                    )}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Recommended Revisions</h4>
                                  <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-600">
                                    {review.recommendedRevisions.length > 0 ? (
                                      review.recommendedRevisions.map((item) => <li key={item}>• {item}</li>)
                                    ) : (
                                      <li>• No revisions recommended.</li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
