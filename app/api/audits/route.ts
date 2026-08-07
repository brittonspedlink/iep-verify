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
  auditName: string;
  studentIdentifier: string;
  gradeLevel?: string | null;
  auditType?: string;

  expectedTeacherSurveyCount?: number;
  completedTeacherSurveyCount?: number;

  sourceInput: Record<string, unknown>;
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

    const auditName = body.auditName?.trim();
    const studentIdentifier = body.studentIdentifier?.trim();

    if (!auditName) {
      return NextResponse.json(
        { error: "Audit name is required." },
        { status: 400 }
      );
    }

    if (!studentIdentifier) {
      return NextResponse.json(
        { error: "Student identifier is required." },
        { status: 400 }
      );
    }

    if (!body.sourceInput || typeof body.sourceInput !== "object") {
      return NextResponse.json(
        { error: "Audit source input is required." },
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
    // 3. GET USER'S ACTIVE MEMBERSHIP
    // -------------------------------------------------------

    const { data: membership, error: membershipError } =
      await supabase
        .from("memberships")
        .select(
          `
            id,
            district_id,
            campus_id,
            role,
            status
          `
        )
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

    if (membershipError) {
      console.error(
        "Audit membership lookup error:",
        membershipError
      );

      return NextResponse.json(
        { error: "Unable to determine your IEP Verify workspace." },
        { status: 500 }
      );
    }

    if (!membership) {
      return NextResponse.json(
        {
          error:
            "No active district or campus membership was found for this account.",
        },
        { status: 403 }
      );
    }

    // -------------------------------------------------------
    // 4. GET DISTRICT REVIEW FRAMEWORK
    // -------------------------------------------------------

    const { data: district, error: districtError } =
      await supabase
        .from("districts")
        .select("id, framework_id")
        .eq("id", membership.district_id)
        .single();

    if (districtError) {
      console.error(
        "Audit district lookup error:",
        districtError
      );

      return NextResponse.json(
        { error: "Unable to determine the review framework." },
        { status: 500 }
      );
    }

    // -------------------------------------------------------
    // 5. NORMALIZE AUDIT VALUES
    // -------------------------------------------------------

    const now = new Date().toISOString();

    const expectedTeacherSurveyCount = Math.max(
      0,
      Number(body.expectedTeacherSurveyCount ?? 0)
    );

    const completedTeacherSurveyCount = Math.max(
      0,
      Number(body.completedTeacherSurveyCount ?? 0)
    );

    const status = mapAuditStatus(body.result.auditStatus);

    // -------------------------------------------------------
    // 6. CREATE PERMANENT AUDIT RECORD
    // -------------------------------------------------------

    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .insert({
        owner_user_id: user.id,

        district_id: membership.district_id,
        campus_id: membership.campus_id,

        audit_name: auditName,
        student_identifier: studentIdentifier,
        grade_level: body.gradeLevel?.trim() || null,

        audit_type:
          body.auditType?.trim() || "evidence_alignment",

        status,

        framework_id: district.framework_id ?? null,

        expected_teacher_survey_count:
          expectedTeacherSurveyCount,

        completed_teacher_survey_count:
          completedTeacherSurveyCount,

        external_source: "manual",

        source_input: body.sourceInput,

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
    // 7. RETURN SAVED AUDIT
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