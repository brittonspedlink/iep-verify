"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, Fragment } from "react";

type FormState = {
  teacherSurvey: string;
  parentSurvey: string;
  studentSurvey: string;
  caseNotes: string;
  fieSummary: string;
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

type TextFieldKey = Exclude<keyof FormState, "expectedTeacherSurveyCount" | "completedTeacherSurveyCount">;
type GroupKey = "evidence" | "iep";

const fieldDefinitions: Array<{
  key: TextFieldKey;
  label: string;
  placeholder: string;
  description: string;
}> = [
  { key: "teacherSurvey", label: "Teacher Survey Evidence", placeholder: "Capture teacher survey questions, responses, observations, instructional notes, and classroom evidence.", description: "Teacher questions and responses classified from the uploaded survey evidence." },
  { key: "parentSurvey", label: "Parent Survey Evidence", placeholder: "Record parent survey questions, responses, family insights, concerns, routines, and support strategies.", description: "Parent questions and responses classified from the uploaded survey evidence." },
  { key: "studentSurvey", label: "Student Survey Evidence", placeholder: "Document student survey questions, responses, voice, preferences, strengths, and challenges.", description: "Student questions and responses classified from the uploaded survey evidence." },
  { key: "caseNotes", label: "Case Manager Notes", placeholder: "Add case manager observations, teacher follow-up notes, parent concerns, ARD preparation notes, or other relevant context.", description: "Additional supporting notes used as part of the evidence baseline." },
  { key: "fieSummary", label: "FIE Summary", placeholder: "Review the evaluation summary that informed this IEP.", description: "Evaluation context identified from the uploaded IEP or supporting records." },
  { key: "plaaFP", label: "PLAAFP", placeholder: "Summarize present levels of academic achievement and functional performance.", description: "Present levels of academic achievement and functional performance." },
  { key: "vision", label: "Vision", placeholder: "Outline future-oriented expectations and student-centered outcomes.", description: "The student-centered educational direction and future vision." },
  { key: "goals", label: "Annual Goals", placeholder: "Describe measurable, evidence-based annual goals and success criteria.", description: "Annual goals, objectives, baselines, conditions, and criteria." },
  { key: "accommodations", label: "Accommodations", placeholder: "Paste accommodations to review for evidence support, need alignment, completeness, and unsupported recommendations.", description: "Instructional and assessment accommodations included in the IEP." },
  { key: "services", label: "Services", placeholder: "Paste services recommendations to review for evidence support and alignment to documented needs and goals.", description: "Special education, related, supplementary, and instructional services." },
  { key: "recommendedTEKS", label: "Recommended TEKS", placeholder: "Align standards, curriculum connections, and instructional priorities.", description: "Standards identified for instructional and goal alignment." },
];

const evidenceFields: TextFieldKey[] = ["teacherSurvey", "parentSurvey", "studentSurvey", "caseNotes"];
const iepFields: TextFieldKey[] = ["fieSummary", "plaaFP", "vision", "goals", "accommodations", "services", "recommendedTEKS"];
const auditPayloadFields: TextFieldKey[] = ["teacherSurvey", "parentSurvey", "studentSurvey", "caseNotes", "plaaFP", "vision", "goals", "accommodations", "services", "recommendedTEKS"];

const initialState: FormState = {
  teacherSurvey: "",
  parentSurvey: "",
  studentSurvey: "",
  caseNotes: "",
  fieSummary: "",
  plaaFP: "",
  vision: "",
  goals: "",
  accommodations: "",
  services: "",
  recommendedTEKS: "",
  expectedTeacherSurveyCount: 0,
  completedTeacherSurveyCount: 0,
};

function fieldLabel(key: TextFieldKey) {
  return fieldDefinitions.find((field) => field.key === key)?.label ?? key;
}

export default function ReviewAndRunAuditPage() {
  const [formData, setFormData] = useState<FormState>(initialState);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [validationError, setValidationError] = useState("");
  const [auditError, setAuditError] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [expandedDocument, setExpandedDocument] = useState<string | null>("plaafp");
  const [expandedGroups, setExpandedGroups] = useState<Record<GroupKey, boolean>>({ evidence: true, iep: true });
  const [expandedFields, setExpandedFields] = useState<Partial<Record<TextFieldKey, boolean>>>({
    teacherSurvey: false,
    parentSurvey: false,
    studentSurvey: false,
    caseNotes: false,
    fieSummary: true,
    plaaFP: true,
    vision: false,
    goals: true,
    accommodations: false,
    services: false,
    recommendedTEKS: false,
  });
  const [editingFields, setEditingFields] = useState<Partial<Record<TextFieldKey, boolean>>>({});
  const [auditMessage, setAuditMessage] = useState(
    "Ready to compare generated documentation against survey evidence and surface supported content, missing information, unsupported statements, and alignment concerns."
  );
  const resultsRef = useRef<HTMLElement | null>(null);

  const handleTextChange = (field: TextFieldKey) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleNumberChange = (field: "expectedTeacherSurveyCount" | "completedTeacherSurveyCount") => (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleRunAudit = async () => {
    const sourceEvidenceCompleted = evidenceFields.filter((field) => formData[field].trim().length > 0).length;

    if (sourceEvidenceCompleted === 0) {
      setAuditResult(null);
      setAuditError("");
      setValidationError("Add at least one source evidence field before running the audit.");
      setAuditMessage("Add at least one source evidence field to generate an audit and review documentation alignment.");
      setExpandedGroups((current) => ({ ...current, evidence: true }));
      return;
    }

    setValidationError("");
    setAuditError("");
    setIsAuditing(true);
    setAuditMessage("Running audit...");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      if (!response.ok) throw new Error(data?.error || "Unable to complete audit request.");

      setAuditResult(data as AuditResult);
      setAuditMessage(`Audit completed with ${auditPayloadFields.filter((key) => formData[key].trim()).length} sections populated for review and alignment.`);
    } catch (error) {
      setAuditResult(null);
      setAuditError(error instanceof Error ? error.message : "Unable to complete audit request.");
      setAuditMessage("Audit could not be completed.");
    } finally {
      setIsAuditing(false);
    }
  };

  const completedCount = auditPayloadFields.filter((key) => formData[key].trim().length > 0).length;
  const surveyEvidenceCount = [formData.teacherSurvey, formData.parentSurvey, formData.studentSurvey].filter((value) => value.trim()).length;
  const generatedSectionCount = [formData.plaaFP, formData.vision, formData.goals, formData.accommodations, formData.services, formData.recommendedTEKS].filter((value) => value.trim()).length;

  const readinessItems = [
    { label: "Survey Evidence", ready: surveyEvidenceCount > 0 },
    { label: "Case Manager Notes", ready: formData.caseNotes.trim().length > 0, optional: true },
    { label: "FIE Summary", ready: formData.fieSummary.trim().length > 0 },
    { label: "PLAAFP", ready: formData.plaaFP.trim().length > 0 },
    { label: "Annual Goals", ready: formData.goals.trim().length > 0 },
    { label: "Accommodations", ready: formData.accommodations.trim().length > 0 },
    { label: "Services", ready: formData.services.trim().length > 0 },
    { label: "Recommended TEKS", ready: formData.recommendedTEKS.trim().length > 0, optional: true },
  ];

  useEffect(() => {
    if (auditResult && resultsRef.current) resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [auditResult]);

  function renderTextField(key: TextFieldKey) {
    const definition = fieldDefinitions.find((field) => field.key === key)!;
    const value = formData[key];
    const hasContent = value.trim().length > 0;
    const isExpanded = expandedFields[key] ?? false;
    const isEditing = editingFields[key] ?? !hasContent;
    const isSurvey = key === "teacherSurvey" || key === "parentSurvey" || key === "studentSurvey";

    return (
      <article key={key} className={`overflow-hidden rounded-2xl border bg-white transition ${hasContent ? "border-emerald-200" : "border-slate-200"}`}>
        <button
          type="button"
          onClick={() => setExpandedFields((current) => ({ ...current, [key]: !isExpanded }))}
          className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${hasContent ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {hasContent ? "✓" : "+"}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-950">{definition.label}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{definition.description}</p>
              <p className={`mt-2 text-xs font-semibold ${hasContent ? "text-emerald-700" : "text-slate-400"}`}>
                {hasContent ? `${value.length.toLocaleString()} characters found` : isSurvey ? "No classified evidence added" : "No content added"}
              </p>
            </div>
          </div>
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}>⌄</span>
        </button>

        {isExpanded ? (
          <div className="border-t border-slate-200 bg-slate-50/60 p-5">
            {isEditing ? (
              <>
                <textarea
                  value={value}
                  onChange={handleTextChange(key)}
                  placeholder={definition.placeholder}
                  rows={key === "goals" ? 11 : 7}
                  className="min-h-44 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">{value.length.toLocaleString()} characters</span>
                  {hasContent ? (
                    <button type="button" onClick={() => setEditingFields((current) => ({ ...current, [key]: false }))} className="rounded-xl bg-[#0a3d73] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#07325f]">
                      Done Editing
                    </button>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <div className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-700">{value}</div>
                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={() => setEditingFields((current) => ({ ...current, [key]: true }))} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </article>
    );
  }

  function renderGroup(group: GroupKey, title: string, description: string, fields: TextFieldKey[]) {
    const isExpanded = expandedGroups[group];
    const populated = fields.filter((key) => formData[key].trim()).length;

    return (
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <button type="button" onClick={() => setExpandedGroups((current) => ({ ...current, [group]: !isExpanded }))} className="flex w-full items-start justify-between gap-5 px-6 py-6 text-left hover:bg-slate-50 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4d9e7c]">Audit record</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            <p className="mt-3 text-xs font-semibold text-[#0a3d73]">{populated} of {fields.length} sections populated</p>
          </div>
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}>⌄</span>
        </button>
        {isExpanded ? (
          <div className="border-t border-slate-200 bg-slate-50/40 p-5 sm:p-6">
            <div className="space-y-4">{fields.map(renderTextField)}</div>
            {group === "evidence" ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="text-sm font-semibold text-slate-900">Expected Teacher Survey Count</span>
                  <input type="number" min="0" value={formData.expectedTeacherSurveyCount} onChange={handleNumberChange("expectedTeacherSurveyCount")} className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100" />
                </label>
                <label className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="text-sm font-semibold text-slate-900">Completed Teacher Survey Count</span>
                  <input type="number" min="0" value={formData.completedTeacherSurveyCount} onChange={handleNumberChange("completedTeacherSurveyCount")} className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100" />
                </label>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section>
        <Link href="/dashboard/new/review" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0a3d73] hover:underline"><span aria-hidden="true">←</span>Back to Review Sections</Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">Final review</p>
        <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Review &amp; Run Audit</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Confirm the supporting evidence and final IEP sections, then run the evidence-alignment audit.</p>
          </div>
          <button type="button" onClick={handleRunAudit} disabled={isAuditing} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0a3d73] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07325f] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70">{isAuditing ? "Running audit..." : "Run Evidence Audit"}<span aria-hidden="true">→</span></button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="grid gap-3 sm:grid-cols-4">{[
          { step: "1", label: "Upload", state: "complete" },
          { step: "2", label: "Process", state: "complete" },
          { step: "3", label: "Review Sections", state: "complete" },
          { step: "4", label: "Run Audit", state: "active" },
        ].map((item, index, items) => {
          const isComplete = item.state === "complete";
          const isActive = item.state === "active";
          return <div key={item.step} className="flex items-center"><div className="flex min-w-0 items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${isComplete ? "bg-emerald-100 text-emerald-700" : isActive ? "bg-[#0a3d73] text-white" : "bg-slate-100 text-slate-500"}`}>{isComplete ? "✓" : item.step}</span><span className={`truncate text-sm font-semibold ${isComplete ? "text-emerald-700" : isActive ? "text-slate-950" : "text-slate-500"}`}>{item.label}</span></div>{index < items.length - 1 ? <div className="mx-4 hidden h-px flex-1 bg-slate-200 sm:block" /> : null}</div>;
        })}</div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4d9e7c]">Audit preparation summary</p><h2 className="mt-2 text-xl font-semibold text-slate-950">Confirm the audit record at a glance</h2></div><p className="text-sm text-slate-500">{completedCount} of 10 audit inputs populated</p></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
          { label: "Survey evidence", value: `${surveyEvidenceCount}/3`, detail: "Teacher, parent, and student evidence", complete: surveyEvidenceCount > 0 },
          { label: "Supporting notes", value: formData.caseNotes.trim() ? "Added" : "Not added", detail: "Case manager and supporting notes", complete: !!formData.caseNotes.trim() },
          { label: "FIE Summary", value: formData.fieSummary.trim() ? "Included" : "Not included", detail: "Evaluation context for review", complete: !!formData.fieSummary.trim() },
          { label: "IEP sections", value: `${generatedSectionCount}/6`, detail: "PLAAFP through Recommended TEKS", complete: generatedSectionCount > 0 },
        ].map((item) => <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-900">{item.label}</p><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${item.complete ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>{item.complete ? "✓" : "—"}</span></div><p className="mt-3 text-2xl font-semibold text-slate-950">{item.value}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p></div>)}</div>
      </section>

      {validationError || auditError ? <section className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{validationError || auditError}</section> : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {renderGroup("evidence", "Supporting Evidence", "Review the survey evidence and supporting notes used as the comparison baseline.", evidenceFields)}
          {renderGroup("iep", "Generated IEP", "Review the IEP sections that will be evaluated against the supporting evidence.", iepFields)}
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0a3d73]">Audit readiness</p>
            <div className="mt-5 space-y-3">{readinessItems.map((item) => <div key={item.label} className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-600">{item.label}{item.optional ? <span className="ml-1 text-xs text-slate-400">(optional)</span> : null}</span><span className={`font-semibold ${item.ready ? "text-emerald-700" : "text-slate-400"}`}>{item.ready ? "✓" : "Pending"}</span></div>)}</div>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0a3d73] transition-all" style={{ width: `${Math.round((completedCount / 10) * 100)}%` }} /></div>
            <p className="mt-4 text-xs leading-5 text-slate-500">{auditMessage}</p>
          </section>

          <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-semibold text-[#0a3d73] shadow-sm">i</div><h2 className="mt-5 text-lg font-semibold text-[#0a3d73]">Final human review</h2><p className="mt-2 text-sm leading-6 text-slate-600">Uploaded audits arrive with extracted content populated. Manual-entry audits use the same workspace with blank fields. Expand a section only when you need to inspect or edit it.</p></section>

          {auditResult ? <button type="button" onClick={() => window.print()} className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Export Audit</button> : null}
          <button type="button" onClick={handleRunAudit} disabled={isAuditing} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0a3d73] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07325f] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70">{isAuditing ? "Running audit..." : "Run Evidence Audit"}<span aria-hidden="true">→</span></button>
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
    SpedLink
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
              IEP Verify evaluates SpedLink-generated documentation based on the records supplied. It does not certify legal compliance or verify implementation.
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-2">
              {[
                {
                  key: "accommodations",
                  label: "Accommodations Alignment",
                  note: "This review evaluates SpedLink accommodations against source evidence. It does not verify delivery, scheduling, implementation, or compliance logs.",
                  noData: "Not evaluated — no generated accommodations were provided.",
                },
                {
                  key: "services",
                  label: "Services Alignment",
                  note: "This review evaluates the documentation and evidence alignment of SpedLink’s service recommendations. It does not verify service delivery, scheduling, implementation, or compliance logs.",
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
    </div>
  );
}