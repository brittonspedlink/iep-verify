import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AuditReport from "@/components/AuditReport";
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
    <Link
      href="/dashboard/history"
      className="inline-flex text-sm font-semibold text-[#0a3d73] hover:underline"
    >
      ← Audit History
    </Link>

    <AuditReport
      title={audit.audit_name}
      studentIdentifier={audit.student_identifier}
      completedDate={completedDate}
      auditStatus={audit.status}
      overallScore={overallScore}
      evidenceReadinessScore={evidenceScore}
      documentationAlignmentScore={alignmentScore}
      overallSummary={overallSummary}
      criticalGaps={
        Array.isArray(criticalGaps)
          ? criticalGaps.map((gap) => String(gap))
          : []
      }
      documentReviews={
        documentReviews as Record<string, unknown>
      }
    />

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