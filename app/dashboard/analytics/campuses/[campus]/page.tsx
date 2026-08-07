"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

type DateRange = "30 days" | "90 days" | "School year";

type GradeFilter =
  | "All grade levels"
  | "9th Grade"
  | "10th Grade"
  | "11th Grade"
  | "12th Grade";

type StatusFilter =
  | "All statuses"
  | "Ready for Review"
  | "Needs Review"
  | "Critical Gap"
  | "Draft";

type SortOption =
  | "Highest score"
  | "Lowest score"
  | "Most audits"
  | "Most active students"
  | "Most critical gaps";

type CategoryScores = {
  plaafp: number;
  vision: number;
  goals: number;
  accommodations: number;
  services: number;
  evidence: number;
};

type CaseManager = {
  id: string;
  name: string;
  initials: string;
  role: string;
  gradeLevels: string[];
  activeStudents: number;
  completedAudits: number;
  drafts: number;
  averageScore: number;
  priorScore: number;
  readyRate: number;
  needsReview: number;
  criticalGaps: number;
  mostCommonFinding: string;
  categoryScores: CategoryScores;
};

type AttentionAudit = {
  id: string;
  studentIdentifier: string;
  caseManager: string;
  auditType: string;
  score: number;
  status: "Needs Review" | "Critical Gap";
  criticalGaps: number;
  updated: string;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: "success" | "warning" | "neutral";
};

const caseManagers: CaseManager[] = [
  {
    id: "jennifer-smith",
    name: "Jennifer Smith",
    initials: "JS",
    role: "Special Education Teacher",
    gradeLevels: ["9th Grade", "10th Grade"],
    activeStudents: 18,
    completedAudits: 18,
    drafts: 1,
    averageScore: 97,
    priorScore: 94,
    readyRate: 94,
    needsReview: 1,
    criticalGaps: 0,
    mostCommonFinding:
      "Services recommendations could include additional rationale connected to the PLAAFP.",
    categoryScores: {
      plaafp: 99,
      vision: 97,
      goals: 96,
      accommodations: 95,
      services: 92,
      evidence: 98,
    },
  },
  {
    id: "michael-jones",
    name: "Michael Jones",
    initials: "MJ",
    role: "Case Manager",
    gradeLevels: ["10th Grade", "11th Grade"],
    activeStudents: 17,
    completedAudits: 17,
    drafts: 1,
    averageScore: 95,
    priorScore: 92,
    readyRate: 91,
    needsReview: 2,
    criticalGaps: 1,
    mostCommonFinding:
      "Annual goals are generally aligned but some criteria require additional measurability.",
    categoryScores: {
      plaafp: 97,
      vision: 95,
      goals: 91,
      accommodations: 94,
      services: 92,
      evidence: 96,
    },
  },
  {
    id: "ashley-garcia",
    name: "Ashley Garcia",
    initials: "AG",
    role: "Special Education Teacher",
    gradeLevels: ["11th Grade", "12th Grade"],
    activeStudents: 16,
    completedAudits: 16,
    drafts: 2,
    averageScore: 93,
    priorScore: 91,
    readyRate: 89,
    needsReview: 2,
    criticalGaps: 2,
    mostCommonFinding:
      "Some accommodations need clearer evidence support from teacher and student records.",
    categoryScores: {
      plaafp: 96,
      vision: 94,
      goals: 92,
      accommodations: 88,
      services: 91,
      evidence: 93,
    },
  },
  {
    id: "tyler-brown",
    name: "Tyler Brown",
    initials: "TB",
    role: "Case Manager",
    gradeLevels: ["9th Grade", "10th Grade"],
    activeStudents: 14,
    completedAudits: 14,
    drafts: 1,
    averageScore: 90,
    priorScore: 87,
    readyRate: 85,
    needsReview: 3,
    criticalGaps: 3,
    mostCommonFinding:
      "Service frequency and duration are not consistently connected to documented student needs.",
    categoryScores: {
      plaafp: 93,
      vision: 91,
      goals: 89,
      accommodations: 90,
      services: 84,
      evidence: 92,
    },
  },
  {
    id: "emily-davis",
    name: "Emily Davis",
    initials: "ED",
    role: "Special Education Teacher",
    gradeLevels: ["11th Grade", "12th Grade"],
    activeStudents: 12,
    completedAudits: 12,
    drafts: 1,
    averageScore: 87,
    priorScore: 84,
    readyRate: 79,
    needsReview: 4,
    criticalGaps: 4,
    mostCommonFinding:
      "Survey evidence is incomplete or does not consistently include the original questions and responses.",
    categoryScores: {
      plaafp: 90,
      vision: 89,
      goals: 86,
      accommodations: 85,
      services: 84,
      evidence: 81,
    },
  },
  {
    id: "robert-wilson",
    name: "Robert Wilson",
    initials: "RW",
    role: "Case Manager",
    gradeLevels: ["9th Grade", "12th Grade"],
    activeStudents: 13,
    completedAudits: 11,
    drafts: 2,
    averageScore: 89,
    priorScore: 88,
    readyRate: 82,
    needsReview: 3,
    criticalGaps: 2,
    mostCommonFinding:
      "Progress-monitoring methods need clearer schedules and reporting expectations.",
    categoryScores: {
      plaafp: 92,
      vision: 90,
      goals: 87,
      accommodations: 89,
      services: 86,
      evidence: 90,
    },
  },
];

const attentionAudits: AttentionAudit[] = [
  {
    id: "audit-jr",
    studentIdentifier: "J.R.",
    caseManager: "Michael Jones",
    auditType: "Annual IEP Review",
    score: 84,
    status: "Needs Review",
    criticalGaps: 1,
    updated: "Today at 8:42 AM",
  },
  {
    id: "audit-al",
    studentIdentifier: "A.L.",
    caseManager: "Ashley Garcia",
    auditType: "Reevaluation Review",
    score: 81,
    status: "Critical Gap",
    criticalGaps: 2,
    updated: "Yesterday at 4:18 PM",
  },
  {
    id: "audit-km",
    studentIdentifier: "K.M.",
    caseManager: "Tyler Brown",
    auditType: "Annual IEP Review",
    score: 86,
    status: "Needs Review",
    criticalGaps: 1,
    updated: "Yesterday at 2:06 PM",
  },
  {
    id: "audit-sc",
    studentIdentifier: "S.C.",
    caseManager: "Emily Davis",
    auditType: "Initial IEP Review",
    score: 78,
    status: "Critical Gap",
    criticalGaps: 3,
    updated: "Aug 5 at 11:24 AM",
  },
];

const activityItems: ActivityItem[] = [
  {
    id: "activity-1",
    title: "Audit completed",
    description: "Jennifer Smith completed an Annual IEP Review.",
    time: "Today at 9:12 AM",
    tone: "success",
  },
  {
    id: "activity-2",
    title: "Draft saved",
    description: "Ashley Garcia saved a Reevaluation Review draft.",
    time: "Today at 8:47 AM",
    tone: "neutral",
  },
  {
    id: "activity-3",
    title: "Audit marked for review",
    description: "Michael Jones marked an Annual IEP Review for attention.",
    time: "Yesterday at 4:18 PM",
    tone: "warning",
  },
  {
    id: "activity-4",
    title: "Critical gap resolved",
    description: "Tyler Brown corrected a services-alignment concern.",
    time: "Yesterday at 2:06 PM",
    tone: "success",
  },
];

const campusTrendScores = [
  { month: "Aug", score: 87 },
  { month: "Sep", score: 89 },
  { month: "Oct", score: 90 },
  { month: "Nov", score: 91 },
  { month: "Dec", score: 92 },
  { month: "Jan", score: 93 },
  { month: "Feb", score: 93 },
  { month: "Mar", score: 94 },
  { month: "Apr", score: 95 },
  { month: "May", score: 95 },
];

const campusCategoryScores = [
  { label: "PLAAFP", score: 97 },
  { label: "Vision", score: 95 },
  { label: "Goals", score: 92 },
  { label: "Accommodations", score: 89 },
  { label: "Services", score: 88 },
  { label: "Evidence Alignment", score: 94 },
];

const recurringFindings = [
  {
    label: "Services lack explicit connection to documented needs",
    percentage: 24,
    count: 28,
  },
  {
    label: "Goal criteria require additional measurability",
    percentage: 19,
    count: 22,
  },
  {
    label: "Accommodations need clearer evidence support",
    percentage: 16,
    count: 19,
  },
  {
    label: "Survey evidence is incomplete",
    percentage: 11,
    count: 13,
  },
];

function formatCampusName(slug: string | undefined) {
  if (!slug) {
    return "College Park High School";
  }

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getScoreTextClass(score: number) {
  if (score >= 90) {
    return "text-emerald-700";
  }

  if (score >= 80) {
    return "text-amber-700";
  }

  return "text-rose-700";
}

function getScoreBarClass(score: number) {
  if (score >= 90) {
    return "bg-emerald-500";
  }

  if (score >= 80) {
    return "bg-amber-500";
  }

  return "bg-rose-500";
}

function getStatusClasses(status: AttentionAudit["status"]) {
  if (status === "Critical Gap") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getActivityClasses(tone: ActivityItem["tone"]) {
  if (tone === "success") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (tone === "warning") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-600";
}

function buildTrendChartPoints() {
  const width = 760;
  const height = 210;
  const paddingX = 34;
  const paddingY = 28;
  const minimumScore = 84;
  const maximumScore = 98;
  const scoreRange = maximumScore - minimumScore;

  return campusTrendScores.map((point, index) => {
    const x =
      paddingX +
      (index / Math.max(campusTrendScores.length - 1, 1)) *
        (width - paddingX * 2);

    const y =
      height -
      paddingY -
      ((point.score - minimumScore) / scoreRange) *
        (height - paddingY * 2);

    return {
      ...point,
      x,
      y,
    };
  });
}

export default function IndividualCampusAnalyticsPage() {
  const params = useParams<{ campus: string }>();

  const campusName = formatCampusName(params?.campus);

  const [dateRange, setDateRange] = useState<DateRange>("School year");
  const [gradeFilter, setGradeFilter] =
    useState<GradeFilter>("All grade levels");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All statuses");
  const [sortOption, setSortOption] =
    useState<SortOption>("Highest score");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCaseManagerId, setSelectedCaseManagerId] = useState(
    caseManagers[0].id
  );
  const [message, setMessage] = useState("");

  const filteredCaseManagers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = caseManagers.filter((caseManager) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        caseManager.name.toLowerCase().includes(normalizedSearch) ||
        caseManager.role.toLowerCase().includes(normalizedSearch);

      const matchesGrade =
        gradeFilter === "All grade levels" ||
        caseManager.gradeLevels.includes(gradeFilter);

      const matchesStatus =
        statusFilter === "All statuses" ||
        (statusFilter === "Ready for Review" &&
          caseManager.readyRate >= 90) ||
        (statusFilter === "Needs Review" &&
          caseManager.needsReview > 0) ||
        (statusFilter === "Critical Gap" &&
          caseManager.criticalGaps > 0) ||
        (statusFilter === "Draft" && caseManager.drafts > 0);

      return matchesSearch && matchesGrade && matchesStatus;
    });

    return [...filtered].sort((first, second) => {
      switch (sortOption) {
        case "Highest score":
          return second.averageScore - first.averageScore;

        case "Lowest score":
          return first.averageScore - second.averageScore;

        case "Most audits":
          return second.completedAudits - first.completedAudits;

        case "Most active students":
          return second.activeStudents - first.activeStudents;

        case "Most critical gaps":
          return second.criticalGaps - first.criticalGaps;
      }
    });
  }, [gradeFilter, searchTerm, sortOption, statusFilter]);

  const selectedCaseManager =
    caseManagers.find(
      (caseManager) => caseManager.id === selectedCaseManagerId
    ) ?? caseManagers[0];

  const trendPoints = useMemo(() => buildTrendChartPoints(), []);

  const trendPolyline = trendPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const completedAudits = caseManagers.reduce(
    (total, caseManager) => total + caseManager.completedAudits,
    0
  );

  const totalDrafts = caseManagers.reduce(
    (total, caseManager) => total + caseManager.drafts,
    0
  );

  const totalCriticalGaps = caseManagers.reduce(
    (total, caseManager) => total + caseManager.criticalGaps,
    0
  );

  const averageReadyRate = Math.round(
    caseManagers.reduce(
      (total, caseManager) => total + caseManager.readyRate,
      0
    ) / caseManagers.length
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Link
            href="/dashboard/analytics"
            className="text-sm font-semibold text-[#0a3d73] hover:underline"
          >
            ← Back to District Analytics
          </Link>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
            Campus intelligence
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {campusName}
          </h1>

          <p className="mt-1 text-xl font-semibold text-slate-700">
            Campus Analytics
          </p>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Monitor documentation quality, case-manager performance, recurring
            findings, and audits requiring attention across this campus.
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
                "Campus report export will be connected after live audit records are stored in Supabase."
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Export Campus Report
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
                AI Campus Insight
              </span>

              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                Updated today
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              Documentation quality continues to improve across {campusName}.
            </h2>

            <p className="mt-4 text-sm leading-7 text-blue-100 sm:text-base">
              The campus maintains strong PLAAFP and evidence-alignment scores.
              The clearest improvement opportunity is strengthening the
              connection between documented student needs, measurable annual
              goals, accommodations, and service recommendations.
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
                Priority Area
              </p>

              <p className="mt-2 text-lg font-semibold text-white">Services</p>

              <p className="mt-1 text-sm font-semibold text-amber-200">
                88 average
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          label="Completed Audits"
          value={completedAudits.toString()}
          supportingText="Current school year"
          valueClass="text-[#0a3d73]"
        />

        <MetricCard
          label="Average Score"
          value="95"
          supportingText="+3 points this year"
          valueClass="text-emerald-700"
        />

        <MetricCard
          label="Ready for Review"
          value={`${averageReadyRate}%`}
          supportingText="Across completed audits"
          valueClass="text-emerald-700"
        />

        <MetricCard
          label="Critical Gaps"
          value={totalCriticalGaps.toString()}
          supportingText="Require campus attention"
          valueClass="text-rose-700"
        />

        <MetricCard
          label="Case Managers"
          value={caseManagers.length.toString()}
          supportingText="Included in analytics"
          valueClass="text-[#0a3d73]"
        />

        <MetricCard
          label="Draft Audits"
          value={totalDrafts.toString()}
          supportingText="Ready to continue"
          valueClass="text-slate-950"
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
            Campus filters
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Review case-manager performance
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Search educators and filter the campus data by grade level, record
            status, or performance.
          </p>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Search case manager
            </span>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by educator name"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Grade level
            </span>

            <select
              value={gradeFilter}
              onChange={(event) =>
                setGradeFilter(event.target.value as GradeFilter)
              }
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
            >
              <option>All grade levels</option>
              <option>9th Grade</option>
              <option>10th Grade</option>
              <option>11th Grade</option>
              <option>12th Grade</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Audit status
            </span>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
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
              Sort case managers
            </span>

            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value as SortOption)
              }
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
            >
              <option>Highest score</option>
              <option>Lowest score</option>
              <option>Most audits</option>
              <option>Most active students</option>
              <option>Most critical gaps</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.82fr]">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d9e7c]">
              Campus team
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Case Manager Performance
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Select a case manager to view detailed category performance and
              support needs.
            </p>
          </div>

          {filteredCaseManagers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 sm:px-6">
                      Case Manager
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Students
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Audits
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Score
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Trend
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Ready
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Gaps
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      View
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCaseManagers.map((caseManager) => {
                    const scoreChange =
                      caseManager.averageScore - caseManager.priorScore;

                    const selected =
                      caseManager.id === selectedCaseManager.id;

                    return (
                      <tr
                        key={caseManager.id}
                        className={`border-t border-slate-200 transition ${
                          selected ? "bg-blue-50/70" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-5 py-5 sm:px-6">
                          <div className="flex min-w-52 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#dce9f7] text-xs font-semibold text-[#0a3d73]">
                              {caseManager.initials}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {caseManager.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {caseManager.role}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-5 text-sm font-semibold text-slate-700">
                          {caseManager.activeStudents}
                        </td>

                        <td className="px-4 py-5 text-sm font-semibold text-slate-700">
                          {caseManager.completedAudits}
                        </td>

                        <td className="px-4 py-5">
                          <span
                            className={`text-xl font-semibold ${getScoreTextClass(
                              caseManager.averageScore
                            )}`}
                          >
                            {caseManager.averageScore}
                          </span>
                        </td>

                        <td className="px-4 py-5">
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            +{scoreChange}
                          </span>
                        </td>

                        <td className="px-4 py-5">
                          <div className="min-w-24">
                            <span className="text-xs font-semibold text-slate-600">
                              {caseManager.readyRate}%
                            </span>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${caseManager.readyRate}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              caseManager.criticalGaps === 0
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : caseManager.criticalGaps <= 2
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-rose-200 bg-rose-50 text-rose-700"
                            }`}
                          >
                            {caseManager.criticalGaps}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCaseManagerId(caseManager.id)
                            }
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Analyze
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <h3 className="text-lg font-semibold text-slate-950">
                No case managers found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Change the search or filter selections.
              </p>
            </div>
          )}
        </article>

        <aside className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
              Selected Case Manager
            </p>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dce9f7] text-sm font-semibold text-[#0a3d73]">
                {selectedCaseManager.initials}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {selectedCaseManager.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedCaseManager.role}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-semibold text-[#0a3d73]">
                  Active Students
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#0a3d73]">
                  {selectedCaseManager.activeStudents}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700">
                  Average Score
                </p>

                <p className="mt-2 text-3xl font-semibold text-emerald-700">
                  {selectedCaseManager.averageScore}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Completed Audits
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {selectedCaseManager.completedAudits}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Ready Rate
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {selectedCaseManager.readyRate}%
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {[
                {
                  label: "PLAAFP",
                  score: selectedCaseManager.categoryScores.plaafp,
                },
                {
                  label: "Vision",
                  score: selectedCaseManager.categoryScores.vision,
                },
                {
                  label: "Goals",
                  score: selectedCaseManager.categoryScores.goals,
                },
                {
                  label: "Accommodations",
                  score:
                    selectedCaseManager.categoryScores.accommodations,
                },
                {
                  label: "Services",
                  score: selectedCaseManager.categoryScores.services,
                },
                {
                  label: "Evidence Alignment",
                  score: selectedCaseManager.categoryScores.evidence,
                },
              ].map((category) => (
                <div key={category.label}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-700">
                      {category.label}
                    </p>

                    <p
                      className={`text-sm font-semibold ${getScoreTextClass(
                        category.score
                      )}`}
                    >
                      {category.score}
                    </p>
                  </div>

                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${getScoreBarClass(
                        category.score
                      )}`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/history"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#0a3d73] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#07325f]"
            >
              View Case Manager Audits →
            </Link>
          </article>

          <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Most Common Finding
            </p>

            <h3 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
              {selectedCaseManager.mostCommonFinding}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use related audit examples to provide targeted review or
              professional support.
            </p>

            <button
              type="button"
              onClick={() =>
                setMessage(
                  `A case-manager support brief for ${selectedCaseManager.name} will be generated after analytics are connected to live audit records.`
                )
              }
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              Create Support Brief
            </button>
          </article>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
                Campus trend
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Average Audit Score
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Campus documentation quality across the current school year.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
              <p className="text-xs font-semibold text-emerald-700">
                Current average
              </p>

              <p className="mt-1 text-2xl font-semibold text-emerald-700">
                95
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <svg
              viewBox="0 0 760 210"
              role="img"
              aria-label="Campus average audit score trend"
              className="h-auto w-full"
            >
              {[0, 1, 2, 3, 4].map((line) => {
                const y = 28 + line * 38;

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
                points={trendPolyline}
                fill="none"
                stroke="#0a3d73"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {trendPoints.map((point) => (
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
              {campusTrendScores.map((point) => (
                <p
                  key={point.month}
                  className="text-center text-xs font-semibold text-slate-500"
                >
                  {point.month}
                </p>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d9e7c]">
            Document quality
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Campus Category Scores
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Average performance across all completed campus audits.
          </p>

          <div className="mt-6 space-y-5">
            {campusCategoryScores.map((category) => (
              <div key={category.label}>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {category.label}
                  </p>

                  <p
                    className={`text-sm font-semibold ${getScoreTextClass(
                      category.score
                    )}`}
                  >
                    {category.score}
                  </p>
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
            ))}
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
              Campus attention
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Audits Requiring Attention
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Records with low scores, critical gaps, or findings requiring
              educator review.
            </p>
          </div>

          <Link
            href="/dashboard/history"
            className="text-sm font-semibold text-[#0a3d73] hover:underline"
          >
            View all campus audits
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 sm:px-6">
                  Student
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Case Manager
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Audit Type
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Score
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Updated
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Report
                </th>
              </tr>
            </thead>

            <tbody>
              {attentionAudits.map((audit) => (
                <tr
                  key={audit.id}
                  className="border-t border-slate-200 transition hover:bg-slate-50"
                >
                  <td className="px-5 py-5 sm:px-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dce9f7] text-sm font-semibold text-[#0a3d73]">
                      {audit.studentIdentifier}
                    </div>
                  </td>

                  <td className="px-5 py-5 text-sm font-semibold text-slate-800">
                    {audit.caseManager}
                  </td>

                  <td className="px-5 py-5 text-sm text-slate-600">
                    {audit.auditType}
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`text-xl font-semibold ${getScoreTextClass(
                        audit.score
                      )}`}
                    >
                      {audit.score}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        audit.status
                      )}`}
                    >
                      {audit.status}
                    </span>

                    <p className="mt-2 text-xs text-slate-400">
                      {audit.criticalGaps} critical{" "}
                      {audit.criticalGaps === 1 ? "gap" : "gaps"}
                    </p>
                  </td>

                  <td className="px-5 py-5 text-sm text-slate-600">
                    {audit.updated}
                  </td>

                  <td className="px-5 py-5 text-right">
                    <Link
                      href={`/dashboard/history/${audit.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Open Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
            Most Common
          </p>

          <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
            Services lack explicit connection to documented student needs.
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Identified in 24% of completed campus audits.
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Improving
          </p>

          <h2 className="mt-3 text-lg font-semibold text-slate-950">
            Goal measurability
          </h2>

          <p className="mt-3 text-4xl font-semibold text-emerald-700">+9%</p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Improvement compared with the prior reporting period.
          </p>
        </article>

        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Training Opportunity
          </p>

          <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
            Strengthen evidence supporting accommodations and services.
          </h2>

          <button
            type="button"
            onClick={() =>
              setMessage(
                "A campus training brief will be generated from live findings after Supabase is connected."
              )
            }
            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            Create Training Brief
          </button>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
            Recurring Findings
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Campus Documentation Trends
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Percentage of campus audits containing each recurring concern.
          </p>

          <div className="mt-6 space-y-5">
            {recurringFindings.map((finding) => (
              <div key={finding.label}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {finding.label}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {finding.count} audits
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    {finding.percentage}%
                  </span>
                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#0a3d73]"
                    style={{ width: `${finding.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d9e7c]">
            Recent Activity
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Campus Activity
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Recent audit and case-manager activity.
          </p>

          <div className="mt-6 space-y-5">
            {activityItems.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${getActivityClasses(
                      activity.tone
                    )}`}
                  >
                    {activity.tone === "warning" ? "!" : "✓"}
                  </div>

                  {index < activityItems.length - 1 ? (
                    <div className="mt-2 h-full min-h-10 w-px bg-slate-200" />
                  ) : null}
                </div>

                <div className="pb-3">
                  <p className="text-sm font-semibold text-slate-950">
                    {activity.title}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {activity.description}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <p className="text-center text-xs leading-6 text-slate-400">
        Sample campus data is shown for demonstration. Live campus analytics
        will be generated from saved audit records and educator memberships.
      </p>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  supportingText: string;
  valueClass: string;
};

function MetricCard({
  label,
  value,
  supportingText,
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

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {supportingText}
      </p>
    </article>
  );
}