import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type AuditResult = {
  overallScore: number;
  evidenceReadinessScore: number;
  documentationAlignmentScore: number;
  auditStatus:
    | "Ready for Review"
    | "Review with Caution"
    | "Not Ready for Review";
  criticalGaps: string[];
  caseCompleteness: Record<string, unknown>;
  overallSummary: string;
  documentReviews: Record<string, unknown>;
};

type SaveAuditBody = {
  auditId: string;
  result: AuditResult;
};

function mapAuditStatus(
  status: AuditResult["auditStatus"]
): string {
  switch (status) {
    case "Ready for Review":
      return "ready_for_review";

    case "Review with Caution":
      return "needs_review";

    case "Not Ready for Review":
      return "needs_review";

    default:
      return "completed";
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // -------------------------------------------------------
    // 1. REQUIRE AUTHENTICATED USER
    // -------------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // -------------------------------------------------------
    // 2. PARSE REQUEST
    // -------------------------------------------------------

    const body = (await request.json()) as SaveAuditBody;

    const auditId = body.auditId?.trim();

    if (!auditId) {
      return NextResponse.json(
        { error: "Audit ID is required." },
        { status: 400 }
      );
    }

    if (!body.result || typeof body.result !== "object") {
      return NextResponse.json(
        { error: "Audit result is required." },
        { status: 400 }
      );
    }

    // -------------------------------------------------------
    // 3. VERIFY THE AUDIT BELONGS TO THE USER
    // -------------------------------------------------------

    const { data: existingAudit, error: lookupError } =
      await supabase
        .from("audits")
        .select("id, owner_user_id")
        .eq("id", auditId)
        .single();

    if (lookupError || !existingAudit) {
      console.error("Audit lookup error:", lookupError);

      return NextResponse.json(
        { error: "Audit not found." },
        { status: 404 }
      );
    }

    if (existingAudit.owner_user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    // -------------------------------------------------------
    // 4. NORMALIZE RESULT VALUES
    // -------------------------------------------------------

    const now = new Date().toISOString();
    const status = mapAuditStatus(body.result.auditStatus);

    // -------------------------------------------------------
    // 5. UPDATE EXISTING AUDIT WITH COMPLETED RESULT
    // -------------------------------------------------------

    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .update({
        status,

        result_snapshot: body.result,

        overall_score: body.result.overallScore,

        evidence_readiness_score:
          body.result.evidenceReadinessScore,

        documentation_alignment_score:
          body.result.documentationAlignmentScore,

        overall_summary: body.result.overallSummary,

        critical_gaps: body.result.criticalGaps ?? [],

        case_completeness:
          body.result.caseCompleteness ?? {},

        document_reviews:
          body.result.documentReviews ?? {},

        reviewed_at: now,
        completed_at: now,
        last_activity_at: now,
        updated_at: now,
      })
      .eq("id", auditId)
      .eq("owner_user_id", user.id)
      .select(
        `
          id,
          audit_name,
          student_identifier,
          status,
          overall_score,
          evidence_readiness_score,
          documentation_alignment_score,
          created_at,
          updated_at,
          completed_at
        `
      )
      .single();

    if (auditError) {
      console.error("Audit save error:", auditError);

      return NextResponse.json(
        {
          error: "The audit completed but could not be saved.",
          details: auditError.message,
        },
        { status: 500 }
      );
    }
// -------------------------------------------------------
// 6. LOG COMPLETED AUDIT ACTIVITY
// -------------------------------------------------------

const { error: activityError } = await supabase
  .from("audit_activity")
  .insert({
    audit_id: auditId,
    user_id: user.id,
    activity_type: "audit_completed",
    description: `Score ${body.result.overallScore}`,
  });

if (activityError) {
  console.error("Audit activity save error:", activityError);
}
    // -------------------------------------------------------
    // 7. RETURN UPDATED AUDIT
    // -------------------------------------------------------

    return NextResponse.json({
      success: true,
      audit,
    });
  } catch (error) {
    console.error("Save audit API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save audit.",
      },
      { status: 500 }
    );
  }
}