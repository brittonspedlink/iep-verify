"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DateRange = "30 days" | "90 days" | "School year";

type TrendPoint = {
  label: string;
  score: number;
  audits: number;
};

type Finding = {
  label: string;
  percentage: number;
  count: number;
  category: string;
};

type CampusRecord = {
  campus: string;
  audits: number;
  averageScore: number;
  readyRate: number;
  criticalGaps: number;
};

const trendData: Record<DateRange, TrendPoint[]> = {
  "30 days": [
    { label: "Jul 8", score: 87, audits: 32 },
    { label: "Jul 15", score: 89, audits: 41 },
    { label: "Jul 22", score: 90, audits: 48 },
    { label: "Jul 29", score: 92, audits: 55 },
    { label: "Aug 5", score: 93, audits: 61 },
  ],
  "90 days": [
    { label: "May", score: 84, audits: 96 },
    { label: "Jun", score: 87, audits: 128 },
    { label: "Jul", score: 90, audits: 164 },
    { label: "Aug", score: 92, audits: 78 },
  ],
  "School year": [
    { label: "Aug", score: 82, audits: 88 },
    { label: "Sep", score: 84, audits: 121 },
    { label: "Oct", score: 85, audits: 138 },
    { label: "Nov", score: 87, audits: 146 },
    { label: "Dec", score: 88, audits: 117 },
    { label: "Jan", score: 89, audits: 158 },
    { label: "Feb", score: 90, audits: 172 },
    { label: "Mar", score: 91, audits: 184 },
    { label: "Apr", score: 92, audits: 196 },
    { label: "May", score: 93, audits: 143 },
  ],
};

const commonFindings: Finding[] = [
  {
    label: "Goals not fully supported by the PLAAFP",
    percentage: 34,
    count: 147,
    category: "Goals",
  },
  {
    label: "Services lack sufficient documented rationale",
    percentage: 28,
    count: 121,
    category: "Services",
  },
  {
    label: "Accommodations lack direct evidence support",
    percentage: 22,
    count: 95,
    category: "Accommodations",
  },
  {
    label: "Survey or source evidence is incomplete",
    percentage: 18,
    count: 78,
    category: "Evidence",
  },
  {
    label: "Recommended TEKS are weakly aligned",
    percentage: 14,
    count: 61,
    category: "TEKS",
  },
];

const campusRecords: CampusRecord[] = [
  {
    campus: "College Park High School",
    audits: 118,
    averageScore: 95,
    readyRate: 91,
    criticalGaps: 4,
  },
  {
    campus: "Caney Creek High School",
    audits: 104,
    averageScore: 92,
    readyRate: 86,
    criticalGaps: 7,
  },
  {
    campus: "Oak Ridge High School",
    audits: 86,
    averageScore: 89,
    readyRate: 79,
    criticalGaps: 11,
  },
  {
    campus: "Grand Oaks High School",
    audits: 72,
    averageScore: 87,
    readyRate: 74,
    criticalGaps: 14,
  },
  {
    campus: "Conroe High School",
    audits: 63,
    averageScore: 85,
    readyRate: 69,
    criticalGaps: 17,
  },
];

const categoryScores = [
  { label: "PLAAFP", score: 93 },
  { label: "Goals", score: 87 },
  { label: "Accommodations", score: 84 },
  { label: "Services", score: 81 },
  { label: "Recommended TEKS", score: 88 },
  { label: "Evidence Readiness", score: 90 },
];

function getScoreTextClass(score: number) {
  if (score >= 90) {
    return "text-emerald-700";
  }

  if (score >= 80) {
    return "text-amber-700";
  }

  return "text-rose-700";
}

function getScoreBackgroundClass(score: number) {
  if (score >= 90) {
    return "bg-emerald-500";
  }

  if (score >= 80) {
    return "bg-amber-500";
  }

  return "bg-rose-500";
}

function buildChartPoints(data: TrendPoint[]) {
  const width = 720;
  const height = 220;
  const paddingX = 28;
  const paddingY = 22;

  const minimumScore = Math.min(...data.map((point) => point.score)) - 3;
  const maximumScore = Math.max(...data.map((point) => point.score)) + 2;
  const scoreRange = Math.max(maximumScore - minimumScore, 1);

  return data.map((point, index) => {
    const x =
      paddingX +
      (index / Math.max(data.length - 1, 1)) * (width - paddingX * 2);

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

export default function AnalyticsOverviewPage() {
  const [dateRange, setDateRange] = useState<DateRange>("School year");
  const [message, setMessage] = useState("");

  const activeTrend = trendData[dateRange];

  const chartPoints = useMemo(
    () => buildChartPoints(activeTrend),
    [activeTrend]
  );

  const polylinePoints = chartPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const totalAudits = 443;
  const averageScore = 91;
  const readyRate = 83;
  const needsReviewRate = 13;
  const criticalRate = 4;
  const hoursSaved = 1108;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
            District intelligence
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Analytics Overview
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Monitor documentation quality, identify recurring gaps, and
            understand audit trends across your district.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="block">
            <span className="sr-only">Date range</span>

            <select
              value={dateRange}
              onChange={(event) => {
                setDateRange(event.target.value as DateRange);
                setMessage("");
              }}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100 sm:w-44"
            >
              <option value="30 days">Last 30 days</option>
              <option value="90 days">Last 90 days</option>
              <option value="School year">School year</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() =>
              setMessage(
                "District analytics export will be connected after live audit data is stored in Supabase."
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Export Summary
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
                AI District Insight
              </span>

              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                Updated today
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              Documentation quality is improving, but services alignment remains
              the clearest training opportunity.
            </h2>

            <p className="mt-4 text-sm leading-7 text-blue-100 sm:text-base">
              Average audit scores increased from 82 to 93 during the current
              school year. The largest recurring concern is insufficient
              documentation connecting identified needs to service
              recommendations. This pattern appears most often when PLAAFP
              statements describe organizational or written-expression needs
              without clearly connecting those needs to services or goals.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 xl:w-[310px]">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
                Priority
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                Services alignment
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
                Trend
              </p>

              <p className="mt-2 text-lg font-semibold text-emerald-200">
                +11 points
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Audits</p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-[#0a3d73]">
            {totalAudits}
          </p>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Across five campuses
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Average Score</p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-emerald-700">
            {averageScore}
          </p>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Up 4 points this term
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Ready for Review
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-emerald-700">
            {readyRate}%
          </p>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            368 completed audits
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Needs Review</p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-amber-700">
            {needsReviewRate}%
          </p>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            58 audits need attention
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Critical Gaps</p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-rose-700">
            {criticalRate}%
          </p>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            17 audits contain critical gaps
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
                Quality trend
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Average Audit Score
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Average documentation-alignment score over the selected period.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
              <p className="text-xs font-semibold text-emerald-700">
                Current average
              </p>

              <p className="mt-1 text-2xl font-semibold text-emerald-700">
                {activeTrend[activeTrend.length - 1].score}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <svg
              viewBox="0 0 720 220"
              role="img"
              aria-label="Average audit score trend"
              className="h-auto w-full"
            >
              {[0, 1, 2, 3, 4].map((line) => {
                const y = 22 + line * 44;

                return (
                  <line
                    key={line}
                    x1="28"
                    x2="692"
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
                <g key={point.label}>
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

            <div
              className="mt-2 grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${activeTrend.length}, minmax(0, 1fr))`,
              }}
            >
              {activeTrend.map((point) => (
                <div key={point.label} className="text-center">
                  <p className="text-xs font-semibold text-slate-600">
                    {point.label}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {point.audits} audits
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d9e7c]">
            Estimated impact
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Educator Time Saved
          </h2>

          <div className="mt-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-blue-50 p-6 text-center">
            <p className="text-5xl font-semibold tracking-tight text-[#0a3d73]">
              {hoursSaved.toLocaleString()}
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-700">
              estimated hours saved
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Based on an estimated 2.5 hours of review and revision time saved
              per completed audit.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Equivalent days
              </p>

              <p className="mt-2 text-xl font-semibold text-slate-950">
                138.5
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Per audit
              </p>

              <p className="mt-2 text-xl font-semibold text-slate-950">
                2.5 hrs
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
                Recurring concerns
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Most Common Findings
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Percentage of completed audits containing each finding.
              </p>
            </div>

            <Link
              href="/dashboard/analytics/findings"
              className="text-sm font-semibold text-[#0a3d73] hover:underline"
            >
              View details
            </Link>
          </div>

          <div className="mt-6 space-y-5">
            {commonFindings.map((finding) => (
              <div key={finding.label}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {finding.label}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {finding.category} · {finding.count} audits
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-slate-700">
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d9e7c]">
              Document quality
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Average Score by Category
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              District-wide performance across the major audit categories.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {categoryScores.map((category) => (
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
                    className={`h-full rounded-full ${getScoreBackgroundClass(
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
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
              Campus comparison
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Performance by Campus
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Compare audit volume, average scores, readiness, and critical
              gaps.
            </p>
          </div>

          <Link
            href="/dashboard/analytics/campuses"
            className="text-sm font-semibold text-[#0a3d73] hover:underline"
          >
            Open campus analysis
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 sm:px-6">
                  Campus
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Audits
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Average Score
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Ready Rate
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Critical Gaps
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Analysis
                </th>
              </tr>
            </thead>

            <tbody>
              {campusRecords.map((campus, index) => (
                <tr
                  key={campus.campus}
                  className="border-t border-slate-200 transition hover:bg-slate-50/70"
                >
                  <td className="px-5 py-5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-sm font-semibold text-[#0a3d73]">
                        {index + 1}
                      </span>

                      <p className="text-sm font-semibold text-slate-900">
                        {campus.campus}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-5 text-sm font-semibold text-slate-700">
                    {campus.audits}
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`text-lg font-semibold ${getScoreTextClass(
                        campus.averageScore
                      )}`}
                    >
                      {campus.averageScore}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex min-w-40 items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${campus.readyRate}%` }}
                        />
                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        {campus.readyRate}%
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                        campus.criticalGaps <= 5
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : campus.criticalGaps <= 12
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {campus.criticalGaps}
                    </span>
                  </td>

                  <td className="px-5 py-5 text-right">
                    <Link
                      href="/dashboard/analytics/campuses"
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Recommended district action
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Prioritize professional development on connecting documented
              needs to services and goals.
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Services alignment and goal-to-PLAAFP alignment account for the
              two most frequent district-wide findings. A targeted review
              session using anonymized audit examples would address the largest
              current quality gap.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setMessage(
                "A district training-priority report will be generated from live analytics after Supabase is connected."
              )
            }
            className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-amber-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            Create Training Brief
          </button>
        </div>
      </section>

      <p className="text-center text-xs leading-6 text-slate-400">
        Sample district data is shown for demonstration. Analytics will be
        generated from saved IEP Verify audit records after Supabase is
        connected.
      </p>
    </div>
  );
}