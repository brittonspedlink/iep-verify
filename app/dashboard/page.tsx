"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AuditResultData = {
  overall_score: number | null;
  audit_status: string | null;
};

type AuditRow = {
  id: string;
  student_identifier: string;
  audit_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  source_input: Record<string, unknown> | null;
  audit_results: AuditResultData | AuditResultData[] | null;
};

type ActivityAuditData = {
  student_identifier: string;
  audit_name: string;
};

type ActivityRow = {
  id: string;
  activity_type: string;
  description: string | null;
  created_at: string;
  audits: ActivityAuditData | ActivityAuditData[] | null;
};

type RecentAudit = {
  id: string;
  student: string;
  auditName: string;
  score: number | null;
  status: string;
  updated: string;
};

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

type DashboardStats = {
  auditsThisMonth: number;
  monthComparison: string;
  needsReview: number;
  averageScore: number | null;
  drafts: number;
};

function getAuditResult(
  result: AuditRow["audit_results"]
): AuditResultData | null {
  if (!result) {
    return null;
  }

  if (Array.isArray(result)) {
    return result[0] ?? null;
  }

  return result;
}

function getActivityAudit(
  audit: ActivityRow["audits"]
): ActivityAuditData | null {
  if (!audit) {
    return null;
  }

  if (Array.isArray(audit)) {
    return audit[0] ?? null;
  }

  return audit;
}

function normalizeStatus(status?: string | null) {
  return (status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function formatStatus(status?: string | null) {
  switch (normalizeStatus(status)) {
    case "ready_for_review":
      return "Ready for Review";

    case "needs_review":
      return "Needs Review";

    case "critical_gap":
      return "Critical Gap";

    case "verified":
      return "Verified";

    case "completed":
      return "Completed";

    case "processing":
      return "Processing";

    case "review_required":
      return "Review Required";

    case "ready_to_audit":
      return "Ready to Audit";

    case "auditing":
      return "Auditing";

    case "uploaded":
      return "Uploaded";

    case "draft":
      return "Draft";

    default:
      if (!status) {
        return "Draft";
      }

      return status;
  }
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const now = new Date();

  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const todayOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const differenceMs = todayOnly.getTime() - dateOnly.getTime();
  const differenceDays = Math.round(
    differenceMs / (1000 * 60 * 60 * 24)
  );

  if (differenceDays === 0) {
    return "Today";
  }

  if (differenceDays === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatActivityTime(value: string) {
  const date = new Date(value);
  const now = new Date();

  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const todayOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const differenceMs = todayOnly.getTime() - dateOnly.getTime();
  const differenceDays = Math.round(
    differenceMs / (1000 * 60 * 60 * 24)
  );

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (differenceDays === 0) {
    return `Today at ${time}`;
  }

  if (differenceDays === 1) {
    return `Yesterday at ${time}`;
  }

  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} at ${time}`;
}

function getActivityTitle(activityType: string) {
  switch (normalizeStatus(activityType)) {
    case "audit_created":
      return "Audit created";

    case "document_uploaded":
      return "Document uploaded";

    case "processing_completed":
      return "Document processing completed";

    case "teacher_survey_added":
      return "Teacher survey added";

    case "review_completed":
      return "Review completed";

    case "draft_saved":
      return "Draft saved";

    case "audit_run":
      return "Audit generated";

    case "audit_completed":
      return "Audit completed";

    case "marked_for_review":
      return "Audit marked for review";

    case "critical_gap_resolved":
      return "Critical gap resolved";

    default:
      return activityType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}

function getStatTone(tone: string) {
  switch (tone) {
    case "green":
      return {
        icon: "✓",
        iconClass: "bg-emerald-100 text-emerald-700",
        valueClass: "text-emerald-700",
      };

    case "amber":
      return {
        icon: "!",
        iconClass: "bg-amber-100 text-amber-700",
        valueClass: "text-amber-700",
      };

    case "slate":
      return {
        icon: "•",
        iconClass: "bg-slate-100 text-slate-700",
        valueClass: "text-slate-900",
      };

    default:
      return {
        icon: "▦",
        iconClass: "bg-blue-100 text-[#0a3d73]",
        valueClass: "text-[#0a3d73]",
      };
  }
}

function getStatusClasses(status: string) {
  if (
    status === "Verified" ||
    status === "Ready for Review" ||
    status === "Completed"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    status === "Needs Review" ||
    status === "Review Required"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "Critical Gap") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}
function getAuditHref(audit: AuditRow) {
  const result = getAuditResult(audit.audit_results);

  const isCompleted =
    Boolean(audit.completed_at) ||
    typeof result?.overall_score === "number" ||
    [
      "verified",
      "ready_for_review",
      "needs_review",
      "review_with_caution",
      "not_ready",
      "not_ready_for_review",
      "completed",
    ].includes(normalizeStatus(audit.status));

  if (isCompleted) {
    return `/dashboard/history/${encodeURIComponent(audit.id)}`;
  }

  const source = (audit.source_input ?? {}) as {
    primaryText?: string;

    evidenceText?: {
      teacherSurvey?: string;
      parentSurvey?: string;
      studentSurvey?: string;
      combinedSurvey?: string;
    };

    files?: {
      primary?: {
        name?: string;
      } | null;

      teacherSurvey?: unknown[];
      parentSurvey?: unknown[];
      studentSurvey?: unknown[];
      combinedSurvey?: unknown[];
    };

    extracted?: {
      primaryIep?: {
        text?: string;
      };
    };

    reviewed?: {
      confirmed?: Record<string, boolean>;
    };
  };

  const hasPrimaryDocument =
    Boolean(source.files?.primary?.name) ||
    Boolean(source.primaryText?.trim());

  const hasSurveyEvidence =
    Boolean(source.files?.teacherSurvey?.length) ||
    Boolean(source.files?.parentSurvey?.length) ||
    Boolean(source.files?.studentSurvey?.length) ||
    Boolean(source.files?.combinedSurvey?.length) ||
    Boolean(source.evidenceText?.teacherSurvey?.trim()) ||
    Boolean(source.evidenceText?.parentSurvey?.trim()) ||
    Boolean(source.evidenceText?.studentSurvey?.trim()) ||
    Boolean(source.evidenceText?.combinedSurvey?.trim());

  if (!hasPrimaryDocument || !hasSurveyEvidence) {
    return `/dashboard/new/upload?auditId=${encodeURIComponent(
      audit.id
    )}`;
  }

  const hasProcessedDocument = Boolean(
    source.extracted?.primaryIep?.text?.trim()
  );

  if (!hasProcessedDocument) {
    return `/dashboard/new/process?auditId=${encodeURIComponent(
      audit.id
    )}`;
  }

  const confirmedSections = source.reviewed?.confirmed;

  const allSectionsConfirmed =
    confirmedSections &&
    Object.keys(confirmedSections).length > 0 &&
    Object.values(confirmedSections).every(Boolean);

  if (!allSectionsConfirmed) {
    return `/dashboard/new/review?auditId=${encodeURIComponent(
      audit.id
    )}`;
  }

  return `/dashboard/new/audit?auditId=${encodeURIComponent(
    audit.id
  )}`;
}
export default function DashboardPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [activityRows, setActivityRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening";

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Dashboard auth error:", userError);
        router.replace("/login");
        return;
      }

      const [
        profileResponse,
        auditsResponse,
        activityResponse,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .single(),

        supabase
          .from("audits")
          .select(
            `
              id,
              student_identifier,
              audit_name,
              status,
              created_at,
              updated_at,
              completed_at,
              source_input,
              audit_results (
                overall_score,
                audit_status
              )
            `
          )
          .order("updated_at", { ascending: false }),

        supabase
          .from("audit_activity")
          .select(
            `
              id,
              activity_type,
              description,
              created_at,
              audits (
                student_identifier,
                audit_name
              )
            `
          )
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      if (profileResponse.error) {
        console.error(
          "Dashboard profile error:",
          profileResponse.error
        );
      } else {
        setFirstName(profileResponse.data?.first_name ?? "");
      }

      if (auditsResponse.error) {
        console.error(
          "Dashboard audits error:",
          auditsResponse.error
        );
        setAudits([]);
      } else {
        setAudits((auditsResponse.data ?? []) as AuditRow[]);
      }

      if (activityResponse.error) {
        console.error(
          "Dashboard activity error:",
          activityResponse.error
        );
        setActivityRows([]);
      } else {
        setActivityRows(
          (activityResponse.data ?? []) as ActivityRow[]
        );
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  const dashboardStats = useMemo<DashboardStats>(() => {
    const now = new Date();

    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const auditsThisMonth = audits.filter((audit) => {
      const createdAt = new Date(audit.created_at);

      return (
        createdAt >= currentMonthStart &&
        createdAt < nextMonthStart
      );
    }).length;

    const auditsLastMonth = audits.filter((audit) => {
      const createdAt = new Date(audit.created_at);

      return (
        createdAt >= previousMonthStart &&
        createdAt < currentMonthStart
      );
    }).length;

    let monthComparison = "Same as last month";

    if (auditsThisMonth > auditsLastMonth) {
      monthComparison = `${
        auditsThisMonth - auditsLastMonth
      } more than last month`;
    }

    if (auditsThisMonth < auditsLastMonth) {
      monthComparison = `${
        auditsLastMonth - auditsThisMonth
      } fewer than last month`;
    }

    if (auditsThisMonth === 0 && auditsLastMonth === 0) {
      monthComparison = "No audits yet";
    }

    const needsReview = audits.filter((audit) => {
      const result = getAuditResult(audit.audit_results);

      return (
        normalizeStatus(audit.status) === "needs_review" ||
        normalizeStatus(result?.audit_status) === "needs_review"
      );
    }).length;

    const scores = audits
      .map((audit) => {
        const result = getAuditResult(audit.audit_results);
        return result?.overall_score ?? null;
      })
      .filter(
        (score): score is number =>
          typeof score === "number"
      );

    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, score) => sum + score, 0) /
              scores.length
          )
        : null;

    const drafts = audits.filter(
      (audit) => normalizeStatus(audit.status) === "draft"
    ).length;

    return {
      auditsThisMonth,
      monthComparison,
      needsReview,
      averageScore,
      drafts,
    };
  }, [audits]);

  const stats = [
    {
      label: "Audits This Month",
      value: loading
        ? "—"
        : String(dashboardStats.auditsThisMonth),
      detail: loading
        ? "Loading audit activity"
        : dashboardStats.monthComparison,
      tone: "blue",
    },
    {
      label: "Needs Review",
      value: loading
        ? "—"
        : String(dashboardStats.needsReview),
      detail: "Requires educator attention",
      tone: "amber",
    },
    {
      label: "Average Score",
      value: loading
        ? "—"
        : dashboardStats.averageScore === null
          ? "—"
          : String(dashboardStats.averageScore),
      detail: "Across completed audits",
      tone: "green",
    },
    {
      label: "Drafts",
      value: loading
        ? "—"
        : String(dashboardStats.drafts),
      detail: "Ready to continue",
      tone: "slate",
    },
  ];

  const recentAudits = useMemo<RecentAudit[]>(() => {
    return audits.slice(0, 4).map((audit) => {
      const result = getAuditResult(audit.audit_results);

      return {
        id: audit.id,
        student: audit.student_identifier,
        auditName: audit.audit_name,
        score: result?.overall_score ?? null,
        status: formatStatus(
          result?.audit_status || audit.status
        ),
        updated: formatRelativeDate(audit.updated_at),
      };
    });
  }, [audits]);

  const activityItems = useMemo<ActivityItem[]>(() => {
    return activityRows.map((activity) => {
      const audit = getActivityAudit(activity.audits);

      const fallbackDetail = audit
        ? `${audit.student_identifier} — ${audit.audit_name}`
        : "IEP Verify workspace";

      return {
        id: activity.id,
        title: getActivityTitle(activity.activity_type),
        detail: activity.description || fallbackDetail,
        time: formatActivityTime(activity.created_at),
      };
    });
  }, [activityRows]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
            WELCOME BACK
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {greeting}
            {firstName ? `, ${firstName}.` : "."}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Review current work, continue drafts, or begin a new IEP audit.
          </p>
        </div>

        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0a3d73] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07325f] focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          <span className="text-lg leading-none">+</span>
          New Audit
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const tone = getStatTone(stat.tone);

          return (
            <article
              key={stat.label}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <p
                    className={`mt-3 text-4xl font-semibold tracking-tight ${tone.valueClass}`}
                  >
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-semibold ${tone.iconClass}`}
                >
                  {tone.icon}
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                {stat.detail}
              </p>
            </article>
          );
        })}
      </section>

<section>
  <div className="mb-4">
    <h2 className="text-xl font-semibold text-slate-950">
      Quick Actions
    </h2>

    <p className="mt-1 text-sm text-slate-600">
      Start a new review or continue an unfinished audit.
    </p>
  </div>

  <div className="grid gap-4 lg:grid-cols-2">
    <Link
      href="/dashboard/new"
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-xl font-semibold text-[#0a3d73]">
        ↑
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-950">
        Start IEP Review
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Upload a PDF or DOCX, or paste the complete IEP text to begin an
        evidence-alignment review.
      </p>

      <p className="mt-5 text-sm font-semibold text-[#0a3d73]">
        Start review
        <span className="ml-2 transition group-hover:translate-x-1">
          →
        </span>
      </p>
    </Link>

    <Link
      href="/dashboard/audits"
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl font-semibold text-slate-700">
        ↻
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-950">
        Continue a Draft
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Return to an unfinished audit and continue where you left off.
      </p>

      <p className="mt-5 text-sm font-semibold text-slate-700">
        View drafts
        <span className="ml-2 transition group-hover:translate-x-1">
          →
        </span>
      </p>
    </Link>
  </div>
</section>

      <section className="grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Recent Audits
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your most recently updated audit records.
              </p>
            </div>

            <Link
              href="/dashboard/audits"
              className="text-sm font-semibold text-[#0a3d73] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold sm:px-6">
                    Audit
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Score
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Updated
                  </th>
                </tr>
              </thead>

              <tbody>
                {!loading && recentAudits.length === 0 ? (
                  <tr className="border-t border-slate-200">
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center sm:px-6"
                    >
                      <p className="text-sm font-semibold text-slate-700">
                        No audits yet.
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Start a new audit and it will appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
recentAudits.map((audit) => {
  const sourceAudit = audits.find(
    (item) => item.id === audit.id
  );

  return (
    <tr
      key={audit.id}
      onClick={() => {
        if (!sourceAudit) {
          return;
        }

        router.push(getAuditHref(sourceAudit));
      }}
      className="cursor-pointer border-t border-slate-200 transition hover:bg-slate-50"
    >
                      <td className="px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dce9f7] text-xs font-semibold text-[#0a3d73]">
                            {audit.student}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {audit.student}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {audit.auditName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {audit.score ?? "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            audit.status
                          )}`}
                        >
                          {audit.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {audit.updated}
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest updates from your workspace.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {!loading && activityItems.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5">
                <p className="text-sm font-semibold text-slate-700">
                  No recent activity.
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Audit updates will appear here as you work.
                </p>
              </div>
            ) : (
              activityItems.map((activity, index) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                      ✓
                    </div>

                    {index < activityItems.length - 1 ? (
                      <div className="mt-2 h-full w-px bg-slate-200" />
                    ) : null}
                  </div>

                  <div className="pb-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.title}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {activity.detail}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}