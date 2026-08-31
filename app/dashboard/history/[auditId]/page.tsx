import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type PageProps = {
  params: Promise<{
    auditId: string;
  }>;
};

type AuditResult = {
  overallScore?: number;
  evidenceReadinessScore?: number;
  documentationAlignmentScore?: number;
  auditStatus?: string;
  overallSummary?: string;
  criticalGaps?: string[];
  caseCompleteness?: Record<string, unknown>;
  documentReviews?: Record<string, unknown>;
};

function formatStatus(status: string | null) {
  if (!status) return "Completed";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default async function SavedAuditPage({ params }: PageProps) {
  const { auditId } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: audit, error } = await supabase
    .from("audits")
    .select(
      `
        id,
        audit_name,
        student_identifier,
        status,
        overall_score,
        evidence_readiness_score,
        documentation_alignment_score,
        overall_summary,
        critical_gaps,
        case_completeness,
        document_reviews,
        result_snapshot,
        created_at,
        updated_at,
        completed_at
      `
    )
    .eq("id", auditId)
    .eq("owner_user_id", user.id)
    .single();

if (error || !audit) {
  console.error("Saved audit lookup failed:", {
    auditId,
    error,
    audit,
    userId: user.id,
  });

  notFound();
}

  const snapshot = (audit.result_snapshot ?? {}) as AuditResult;

  const overallScore =
    audit.overall_score ?? snapshot.overallScore ?? null;

  const evidenceScore =
    audit.evidence_readiness_score ??
    snapshot.evidenceReadinessScore ??
    null;

  const alignmentScore =
    audit.documentation_alignment_score ??
    snapshot.documentationAlignmentScore ??
    null;

  const overallSummary =
    audit.overall_summary ??
    snapshot.overallSummary ??
    "No overall summary was saved for this audit.";

  const criticalGaps =
    audit.critical_gaps ??
    snapshot.criticalGaps ??
    [];

  const documentReviews =
    audit.document_reviews ??
    snapshot.documentReviews ??
    {};

  const completedDate = audit.completed_at
    ? new Date(audit.completed_at).toLocaleString()
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/history"
            className="text-sm font-semibold text-[#0a3d73] hover:underline"
          >
            ← Audit History
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
            Saved Audit Report
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {audit.audit_name || "IEP Audit"}
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Student identifier:{" "}
            <span className="font-semibold text-slate-700">
              {audit.student_identifier || "Not provided"}
            </span>
          </p>

          {completedDate ? (
            <p className="mt-1 text-xs text-slate-400">
              Completed {completedDate}
            </p>
          ) : null}
        </div>

        <span className="inline-flex w-fit rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-[#0a3d73]">
          {formatStatus(audit.status)}
        </span>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Overall Score
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-emerald-700">
            {overallScore ?? "—"}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Evidence Readiness
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {evidenceScore ?? "—"}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Documentation Alignment
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {alignmentScore ?? "—"}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4d9e7c]">
          Overall Review
        </p>

        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Audit Summary
        </h2>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {overallSummary}
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4d9e7c]">
              Priority Findings
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Critical Gaps
            </h2>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {Array.isArray(criticalGaps) ? criticalGaps.length : 0}
          </span>
        </div>

        {Array.isArray(criticalGaps) && criticalGaps.length > 0 ? (
          <div className="mt-6 space-y-3">
            {criticalGaps.map((gap, index) => (
              <div
                key={`${index}-${String(gap)}`}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900"
              >
                {String(gap)}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-slate-500">
            No critical gaps were identified in this saved audit.
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4d9e7c]">
          Section Review
        </p>

        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Document Reviews
        </h2>

        {Object.keys(documentReviews).length > 0 ? (
          <div className="mt-6 space-y-4">
            {Object.entries(documentReviews).map(
              ([sectionName, review]) => (
                <article
                  key={sectionName}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <h3 className="font-semibold capitalize text-slate-950">
                    {sectionName.replaceAll("_", " ")}
                  </h3>

                  <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">
                    {typeof review === "string"
                      ? review
                      : JSON.stringify(review, null, 2)}
                  </pre>
                </article>
              )
            )}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-slate-500">
            No section-level reviews were saved for this audit.
          </p>
        )}
      </section>

      <div className="flex flex-wrap gap-3 pb-8">
        <Link
          href="/dashboard/history"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Audit History
        </Link>

        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center rounded-2xl bg-[#0a3d73] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#07325f]"
        >
          Start New Audit
        </Link>
      </div>
    </div>
  );
}