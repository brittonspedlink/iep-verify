"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

type DateRange = "30 days" | "90 days" | "School year";
type AuditStatus = "All statuses" | "Ready for Review" | "Needs Review" | "Critical Gap" | "Draft";
type AuditType = "All audit types" | "Annual IEP Review" | "Initial IEP Review" | "Reevaluation Review" | "Amendment Review";
type SortOption = "Most recently updated" | "Highest score" | "Lowest score" | "Most critical gaps";

type CategoryScore = {
  label: string;
  score: number;
  priorScore: number;
};

type AuditRecord = {
  id: string;
  studentIdentifier: string;
  auditType: Exclude<AuditType, "All audit types">;
  score: number | null;
  status: Exclude<AuditStatus, "All statuses">;
  criticalGaps: number;
  evidenceReadiness: number | null;
  alignmentScore: number | null;
  updatedAt: string;
  updatedLabel: string;
  owner: string;
  lastActivity: string;
};

type Finding = {
  title: string;
  category: string;
  count: number;
  percentage: number;
  direction: "improving" | "stable" | "needs-attention";
};

const categoryScores: CategoryScore[] = [
  { label: "PLAAFP", score: 97, priorScore: 94 },
  { label: "Vision", score: 95, priorScore: 93 },
  { label: "Goals", score: 91, priorScore: 87 },
  { label: "Accommodations", score: 94, priorScore: 91 },
  { label: "Services", score: 92, priorScore: 88 },
  { label: "Evidence Alignment", score: 96, priorScore: 93 },
  { label: "Recommended TEKS", score: 90, priorScore: 86 },
];

const trendData = [
  { month: "Aug", score: 88, audits: 8 },
  { month: "Sep", score: 90, audits: 10 },
  { month: "Oct", score: 91, audits: 11 },
  { month: "Nov", score: 92, audits: 12 },
  { month: "Dec", score: 93, audits: 10 },
  { month: "Jan", score: 94, audits: 14 },
  { month: "Feb", score: 95, audits: 15 },
  { month: "Mar", score: 95, audits: 16 },
  { month: "Apr", score: 96, audits: 18 },
  { month: "May", score: 97, audits: 18 },
];

const auditRecords: AuditRecord[] = [
  {
    id: "audit-jr",
    studentIdentifier: "J.R.",
    auditType: "Annual IEP Review",
    score: 97,
    status: "Ready for Review",
    criticalGaps: 0,
    evidenceReadiness: 100,
    alignmentScore: 94,
    updatedAt: "2026-08-06T09:12:00",
    updatedLabel: "Today at 9:12 AM",
    owner: "Jennifer Smith",
    lastActivity: "Audit generated",
  },
  {
    id: "audit-ml",
    studentIdentifier: "M.L.",
    auditType: "Annual IEP Review",
    score: 96,
    status: "Ready for Review",
    criticalGaps: 0,
    evidenceReadiness: 98,
    alignmentScore: 94,
    updatedAt: "2026-08-05T15:44:00",
    updatedLabel: "Yesterday at 3:44 PM",
    owner: "Jennifer Smith",
    lastActivity: "Teacher survey completed",
  },
  {
    id: "audit-as",
    studentIdentifier: "A.S.",
    auditType: "Reevaluation Review",
    score: 93,
    status: "Needs Review",
    criticalGaps: 1,
    evidenceReadiness: 95,
    alignmentScore: 90,
    updatedAt: "2026-08-05T11:25:00",
    updatedLabel: "Yesterday at 11:25 AM",
    owner: "Jennifer Smith",
    lastActivity: "Marked for educator review",
  },
  {
    id: "audit-ct",
    studentIdentifier: "C.T.",
    auditType: "Initial IEP Review",
    score: null,
    status: "Draft",
    criticalGaps: 0,
    evidenceReadiness: null,
    alignmentScore: null,
    updatedAt: "2026-08-04T13:07:00",
    updatedLabel: "Aug 4 at 1:07 PM",
    owner: "Jennifer Smith",
    lastActivity: "Draft saved",
  },
  {
    id: "audit-eb",
    studentIdentifier: "E.B.",
    auditType: "Annual IEP Review",
    score: 89,
    status: "Needs Review",
    criticalGaps: 2,
    evidenceReadiness: 91,
    alignmentScore: 86,
    updatedAt: "2026-08-03T10:16:00",
    updatedLabel: "Aug 3 at 10:16 AM",
    owner: "Jennifer Smith",
    lastActivity: "Parent survey uploaded",
  },
  {
    id: "audit-kn",
    studentIdentifier: "K.N.",
    auditType: "Amendment Review",
    score: 84,
    status: "Critical Gap",
    criticalGaps: 2,
    evidenceReadiness: 88,
    alignmentScore: 81,
    updatedAt: "2026-08-02T14:21:00",
    updatedLabel: "Aug 2 at 2:21 PM",
    owner: "Jennifer Smith",
    lastActivity: "Critical gap identified",
  },
];

const recurringFindings: Finding[] = [
  {
    title: "Services rationale could be more explicitly connected to the PLAAFP",
    category: "Services",
    count: 4,
    percentage: 22,
    direction: "needs-attention",
  },
  {
    title: "Annual goal criteria need additional measurability",
    category: "Goals",
    count: 3,
    percentage: 17,
    direction: "improving",
  },
  {
    title: "Accommodation support should reference direct survey evidence",
    category: "Accommodations",
    count: 2,
    percentage: 11,
    direction: "stable",
  },
  {
    title: "Progress-monitoring frequency needs clarification",
    category: "Progress Monitoring",
    count: 2,
    percentage: 11,
    direction: "stable",
  },
];

function formatNameFromSlug(slug: string | undefined) {
  if (!slug) return "Jennifer Smith";

  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getScoreTextClass(score: number | null) {
  if (score === null) return "text-slate-400";
  if (score >= 90) return "text-emerald-700";
  if (score >= 80) return "text-amber-700";
  return "text-rose-700";
}

function getScoreBarClass(score: number) {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 80) return "bg-amber-500";
  return "bg-rose-500";
}

function getStatusClasses(status: AuditRecord["status"]) {
  if (status === "Ready for Review") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Needs Review") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "Critical Gap") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function buildChartPoints() {
  const width = 760;
  const height = 220;
  const paddingX = 34;
  const paddingY = 28;
  const min = 84;
  const max = 100;

  return trendData.map((point, index) => {
    const x =
      paddingX +
      (index / Math.max(trendData.length - 1, 1)) *
        (width - paddingX * 2);

    const y =
      height -
      paddingY -
      ((point.score - min) / (max - min)) * (height - paddingY * 2);

    return { ...point, x, y };
  });
}

export default function CaseManagerPerformancePage() {
  const params = useParams<{ caseManagerId: string }>();

  const caseManagerName = formatNameFromSlug(params?.caseManagerId);
  const initials = getInitials(caseManagerName);

  const [dateRange, setDateRange] = useState<DateRange>("School year");
  const [statusFilter, setStatusFilter] =
    useState<AuditStatus>("All statuses");
  const [auditTypeFilter, setAuditTypeFilter] =
    useState<AuditType>("All audit types");
  const [sortOption, setSortOption] =
    useState<SortOption>("Most recently updated");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const filteredAudits = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = auditRecords.filter((audit) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        audit.studentIdentifier.toLowerCase().includes(normalizedSearch) ||
        audit.auditType.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All statuses" || audit.status === statusFilter;

      const matchesType =
        auditTypeFilter === "All audit types" ||
        audit.auditType === auditTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    return [...filtered].sort((first, second) => {
      switch (sortOption) {
        case "Most recently updated":
          return (
            new Date(second.updatedAt).getTime() -
            new Date(first.updatedAt).getTime()
          );

        case "Highest score":
          return (second.score ?? -1) - (first.score ?? -1);

        case "Lowest score":
          return (first.score ?? 101) - (second.score ?? 101);

        case "Most critical gaps":
          return second.criticalGaps - first.criticalGaps;
      }
    });
  }, [auditTypeFilter, searchTerm, sortOption, statusFilter]);

  const chartPoints = useMemo(() => buildChartPoints(), []);
  const polylinePoints = chartPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const completedAudits = auditRecords.filter(
    (audit) => audit.status !== "Draft"
  );

  const drafts = auditRecords.filter((audit) => audit.status === "Draft").length;
  const needsReview = auditRecords.filter(
    (audit) =>
      audit.status === "Needs Review" || audit.status === "Critical Gap"
  ).length;
  const totalCriticalGaps = auditRecords.reduce(
    (total, audit) => total + audit.criticalGaps,
    0
  );
  const averageScore = Math.round(
    completedAudits.reduce(
      (total, audit) => total + (audit.score ?? 0),
      0
    ) / completedAudits.length
  );
  const readyRate = Math.round(
    (auditRecords.filter((audit) => audit.status === "Ready for Review")
      .length /
      completedAudits.length) *
      100
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Link
            href="/dashboard/analytics/campuses/college-park-high-school"
            className="text-sm font-semibold text-[#0a3d73] hover:underline"
          >
            ← Back to Campus Analytics
          </Link>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
            Case manager intelligence
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#dce9f7] text-lg font-semibold text-[#0a3d73]">
              {initials}
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {caseManagerName}
              </h1>

              <p className="mt-1 text-lg font-semibold text-slate-700">
                Case Manager Performance
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Review caseload activity, audit quality, recurring findings, and
            records requiring attention for this educator.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={dateRange}
            onChange={(event) => {
              setDateRange(event.target.value as DateRange);
              setMessage("");
            }}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
          >
            <option value="30 days">Last 30 days</option>
            <option value="90 days">Last 90 days</option>
            <option value="School year">School year</option>
          </select>

          <button
            type="button"
            onClick={() =>
              setMessage(
                "Case manager report export will be connected after live audit records are stored in Supabase."
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Export Performance Report
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-[#0a3d73]">
          {message}
        </div>
      ) : null}

      <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-[#0a3d73] to-[#082f59] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                AI Performance Insight
              </span>

              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                Updated today
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              {caseManagerName} ranks in the top 15% of case managers at
              College Park High School.
            </h2>

            <p className="mt-4 text-sm leading-7 text-blue-100 sm:text-base">
              Recent audits demonstrate consistently strong PLAAFP development
              and evidence alignment. Continued coaching should focus on
              strengthening the written rationale connecting services to
              documented student needs and measurable annual goals.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 xl:w-[330px]">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
                Strongest Area
              </p>

              <p className="mt-2 text-lg font-semibold text-white">PLAAFP</p>

              <p className="mt-1 text-sm font-semibold text-emerald-200">
                97 average
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
                Coaching Focus
              </p>

              <p className="mt-2 text-lg font-semibold text-white">Services</p>

              <p className="mt-1 text-sm font-semibold text-amber-200">
                92 average
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          label="Active Students"
          value="18"
          detail="Current IEP caseload"
          valueClass="text-[#0a3d73]"
        />

        <MetricCard
          label="Completed Audits"
          value={completedAudits.length.toString()}
          detail="Current reporting period"
          valueClass="text-[#0a3d73]"
        />

        <MetricCard
          label="Average Score"
          value={averageScore.toString()}
          detail="+3 points this year"
          valueClass="text-emerald-700"
        />

        <MetricCard
          label="Ready Rate"
          value={`${readyRate}%`}
          detail="Completed audits"
          valueClass="text-emerald-700"
        />

        <MetricCard
          label="Needs Review"
          value={needsReview.toString()}
          detail="Require educator attention"
          valueClass="text-amber-700"
        />

        <MetricCard
          label="District Rank"
          value="5 of 132"
          detail="Case managers district-wide"
          valueClass="text-[#0a3d73]"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
                Performance trend
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Average Audit Score
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Documentation quality over the selected reporting period.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
              <p className="text-xs font-semibold text-emerald-700">
                Current average
              </p>

              <p className="mt-1 text-2xl font-semibold text-emerald-700">
                97
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <svg
              viewBox="0 0 760 220"
              role="img"
              aria-label="Case manager average audit score trend"
              className="h-auto w-full"
            >
              {[0, 1, 2, 3, 4].map((line) => {
                const y = 28 + line * 41;

                return (
                  <line
                    key={line}
                    x1="34"
                    x2="726"
                    y1={y}
                    y2={y}
                    stroke="#dbe3ee"
                    strokeWidth="1"
                  />
                );
              })}

              <polyline
                points={polylinePoints}
                fill="none"
                stroke="#0a3d73"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {chartPoints.map((point) => (
                <g key={point.month}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="7"
                    fill="#ffffff"
                    stroke="#0a3d73"
                    strokeWidth="4"
                  />

                  <text
                    x={point.x}
                    y={point.y - 16}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill="#0f172a"
                  >
                    {point.score}
                  </text>
                </g>
              ))}
            </svg>

            <div className="mt-2 grid grid-cols-10 gap-2">
              {trendData.map((point) => (
                <div key={point.month} className="text-center">
                  <p className="text-xs font-semibold text-slate-500">
                    {point.month}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {point.audits}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d9e7c]">
            Category performance
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Documentation Scores
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Average score and change from the prior period.
          </p>

          <div className="mt-6 space-y-5">
            {categoryScores.map((category) => {
              const change = category.score - category.priorScore;

              return (
                <div key={category.label}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-700">
                      {category.label}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-700">
                        +{change}
                      </span>

                      <span
                        className={`text-sm font-semibold ${getScoreTextClass(
                          category.score
                        )}`}
                      >
                        {category.score}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${getScoreBarClass(
                        category.score
                      )}`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
            Audit filters
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Review case manager audits
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Search and filter current audit records.
          </p>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Search student
            </span>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search student identifier"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Audit status
            </span>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as AuditStatus)
              }
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
            >
              <option>All statuses</option>
              <option>Ready for Review</option>
              <option>Needs Review</option>
              <option>Critical Gap</option>
              <option>Draft</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Audit type
            </span>

            <select
              value={auditTypeFilter}
              onChange={(event) =>
                setAuditTypeFilter(event.target.value as AuditType)
              }
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
            >
              <option>All audit types</option>
              <option>Annual IEP Review</option>
              <option>Initial IEP Review</option>
              <option>Reevaluation Review</option>
              <option>Amendment Review</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Sort audits
            </span>

            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value as SortOption)
              }
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
            >
              <option>Most recently updated</option>
              <option>Highest score</option>
              <option>Lowest score</option>
              <option>Most critical gaps</option>
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d9e7c]">
              Caseload records
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Audit History
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Showing {filteredAudits.length} audit records for{" "}
              {caseManagerName}.
            </p>
          </div>

          <Link
            href="/dashboard/history"
            className="text-sm font-semibold text-[#0a3d73] hover:underline"
          >
            Open full audit history
          </Link>
        </div>

        {filteredAudits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 sm:px-6">
                    Student
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Owner
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Audit Type
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Score
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Evidence / Alignment
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Last Activity
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAudits.map((audit) => (
                  <tr
                    key={audit.id}
                    className="border-t border-slate-200 transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-5 sm:px-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dce9f7] text-sm font-semibold text-[#0a3d73]">
                        {audit.studentIdentifier}
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-sm font-semibold text-slate-800">
                        {audit.owner}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Case manager
                      </p>
                    </td>

                    <td className="px-5 py-5 text-sm font-semibold text-slate-800">
                      {audit.auditType}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`text-xl font-semibold ${getScoreTextClass(
                          audit.score
                        )}`}
                      >
                        {audit.score ?? "—"}
                      </span>
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-600">
                      {audit.score !== null ? (
                        <>
                          <p>Evidence {audit.evidenceReadiness}</p>
                          <p className="mt-1">Alignment {audit.alignmentScore}</p>
                        </>
                      ) : (
                        "Not scored"
                      )}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          audit.status
                        )}`}
                      >
                        {audit.status === "Draft" ? "In Progress" : audit.status}
                      </span>

                      {audit.criticalGaps > 0 ? (
                        <p className="mt-2 text-xs font-medium text-rose-600">
                          {audit.criticalGaps} critical{" "}
                          {audit.criticalGaps === 1 ? "gap" : "gaps"}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-sm font-semibold text-slate-700">
                        {audit.lastActivity}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {audit.updatedLabel}
                      </p>
                    </td>

                    <td className="px-5 py-5 text-right">
                      {audit.status === "Draft" ? (
                        <div className="flex flex-col items-end gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            In Progress
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Read-only for administrators
                          </span>
                        </div>
                      ) : (
                        <Link
                          href={`/dashboard/history/${audit.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          View Audit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <h3 className="text-lg font-semibold text-slate-950">
              No audits found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Change the search or filter selections.
            </p>
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
            Recurring Findings
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Documentation Patterns
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Most frequent findings across this case manager&apos;s completed
            audits.
          </p>

          <div className="mt-6 space-y-5">
            {recurringFindings.map((finding) => (
              <div key={finding.title}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {finding.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {finding.category} · {finding.count} audits
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    {finding.percentage}%
                  </span>
                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      finding.direction === "improving"
                        ? "bg-emerald-500"
                        : finding.direction === "needs-attention"
                          ? "bg-amber-500"
                          : "bg-[#0a3d73]"
                    }`}
                    style={{ width: `${finding.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Coaching Opportunity
            </p>

            <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
              Strengthen the written connection between services, documented
              needs, and measurable annual goals.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              This finding appears more often than other concerns but has
              improved during the current reporting period.
            </p>

            <button
              type="button"
              onClick={() =>
                setMessage(
                  `A neutral coaching brief for ${caseManagerName} will be generated after analytics are connected to live audit findings.`
                )
              }
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              Create Coaching Brief
            </button>
          </article>

          <article className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
              Positive Trend
            </p>

            <h2 className="mt-3 text-lg font-semibold text-slate-950">
              Goal measurability improved by 4 points.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Recent audits show more consistent baselines, conditions,
              measurable criteria, and progress-monitoring expectations.
            </p>
          </article>

          <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Strength
            </p>

            <h2 className="mt-3 text-lg font-semibold text-slate-950">
              PLAAFP and evidence alignment remain consistently strong.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Current records demonstrate clear use of teacher, parent, and
              student evidence to support present-level statements.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
              Professional Development
            </p>

            <h2 className="mt-3 text-lg font-semibold text-slate-950">
              Coaching History
            </h2>

            <div className="mt-5 space-y-4">
              {[
                {
                  title: "Goal Writing Training",
                  date: "April 2026",
                  status: "Completed",
                },
                {
                  title: "Accommodation Workshop",
                  date: "February 2026",
                  status: "Completed",
                },
                {
                  title: "Services Documentation",
                  date: "Recommended next",
                  status: "Recommended",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.date}</p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      item.status === "Completed"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      <p className="text-center text-xs leading-6 text-slate-400">
        Sample case manager data is shown for demonstration. Live performance
        analytics will be generated from saved audit records and educator
        memberships.
      </p>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  valueClass: string;
};

function MetricCard({
  label,
  value,
  detail,
  valueClass,
}: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p
        className={`mt-3 text-4xl font-semibold tracking-tight ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-4 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  );
}