"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

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
};

type AuditResult = {
  overallScore: number;
  supportedContent: string[];
  potentialGaps: string[];
  recommendations: string[];
};

const fieldDefinitions: Array<{
  key: keyof FormState;
  label: string;
  placeholder: string;
}> = [
  {
    key: "teacherSurvey",
    label: "Teacher Survey",
    placeholder: "Capture teacher observations, instructional notes, and classroom evidence.",
  },
  {
    key: "parentSurvey",
    label: "Parent Survey",
    placeholder: "Record family insights, concerns, routines, and home support strategies.",
  },
  {
    key: "studentSurvey",
    label: "Student Survey",
    placeholder: "Document the student’s voice, preferences, strengths, and self-reported challenges.",
  },
  {
    key: "caseNotes",
    label: "Case Manager / Teacher / Parent Notes",
    placeholder:
      "Add case manager observations, teacher follow-up notes, parent concerns, ARD preparation notes, or other relevant context not captured in the surveys.",
  },
  {
    key: "plaaFP",
    label: "PLAAFP",
    placeholder: "Summarize present levels of academic achievement and functional performance.",
  },
  {
    key: "vision",
    label: "Vision",
    placeholder: "Outline future-oriented expectations and student-centered outcomes.",
  },
  {
    key: "goals",
    label: "Goals",
    placeholder: "Describe measurable, evidence-based annual goals and success criteria.",
  },
  {
    key: "accommodations",
    label: "Accommodations",
    placeholder: "List supports that reduce barriers and increase access to instruction.",
  },
  {
    key: "services",
    label: "Services",
    placeholder: "Capture specialized supports, frequency, and service delivery details.",
  },
  {
    key: "recommendedTEKS",
    label: "Recommended TEKS",
    placeholder: "Align standards, curriculum connections, and instructional priorities.",
  },
];

const groups: Array<{
  title: string;
  description: string;
  fields: Array<keyof FormState>;
}> = [
  {
    title: "Group 1: Source Evidence",
    description:
      "Use the teacher, parent, and student surveys as the source evidence that supports each generated document.",
    fields: ["teacherSurvey", "parentSurvey", "studentSurvey", "caseNotes"],
  },
  {
    title: "Group 2: Documents to Verify",
    description:
      "Compare each generated document against the survey evidence to check support, completeness, and alignment.",
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
};

const sourceEvidenceFields: Array<keyof FormState> = [
  "teacherSurvey",
  "parentSurvey",
  "studentSurvey",
  "caseNotes",
];

export default function Home() {
  const [formData, setFormData] = useState<FormState>(initialState);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [validationError, setValidationError] = useState("");
  const [auditMessage, setAuditMessage] = useState(
    "Ready to compare generated documentation against survey evidence and surface supported content, missing information, unsupported statements, and alignment concerns."
  );
  const resultsRef = useRef<HTMLElement | null>(null);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleRunAudit = () => {
    const sourceEvidenceCompleted = sourceEvidenceFields.filter((field) => formData[field].trim().length > 0).length;

    if (sourceEvidenceCompleted === 0) {
      setAuditResult(null);
      setValidationError("Add at least one source evidence field before running the audit.");
      setAuditMessage(
        "Add at least one source evidence field to generate an audit and review documentation alignment."
      );
      return;
    }

    setValidationError("");
    setAuditResult({
      overallScore: 85,
      supportedContent: [
        "PLAAFP aligns with teacher survey evidence.",
        "Goals address documented academic needs.",
        "Accommodations support identified classroom barriers."
      ],
      potentialGaps: [
        "Student survey concerns are not reflected in accommodations.",
        "Services lack supporting evidence references.",
        "Parent concerns are not fully represented in the vision statement."
      ],
      recommendations: [
        "Add accommodations linked to organizational difficulties.",
        "Clarify service frequency and delivery setting.",
        "Incorporate parent priorities into the vision statement."
      ]
    });
    setAuditMessage(
      `Audit prepared with ${Object.values(formData).filter((value) => value.trim().length > 0).length} sections populated for review and alignment.`
    );
  };

  const completedCount = Object.values(formData).filter((value) => value.trim().length > 0).length;

  useEffect(() => {
    if (auditResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [auditResult]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#f5f7ff_45%,_#eef3ff_100%)] text-slate-900">
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur xl:p-8">
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
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                Run Audit
              </button>
              {validationError ? (
                <p className="max-w-sm text-sm leading-6 text-rose-600">{validationError}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.55fr_0.8fr]">
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
                        <textarea
                          value={formData[field.key]}
                          onChange={handleChange(field.key)}
                          placeholder={field.placeholder}
                          rows={5}
                          className="min-h-32 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
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
            className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.3)] backdrop-blur sm:p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Audit Results
                </p>
                <h2 className="text-2xl font-semibold text-slate-950">Professional review summary</h2>
                <p className="text-sm leading-7 text-slate-600">
                  This mock audit highlights supported content, potential gaps, and recommendations based on the current documentation and evidence fields.
                </p>
              </div>

              <div className="flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-6 py-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-sky-700">Overall Score</p>
                  <p className="text-3xl font-semibold text-slate-950">{auditResult.overallScore}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <h3 className="text-lg font-semibold text-slate-950">Supported Content</h3>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                  {auditResult.supportedContent.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <h3 className="text-lg font-semibold text-slate-950">Potential Gaps</h3>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                  {auditResult.potentialGaps.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <h3 className="text-lg font-semibold text-slate-950">Recommendations</h3>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                  {auditResult.recommendations.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
