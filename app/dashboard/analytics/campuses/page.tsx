"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DateRange = "30 days" | "90 days" | "School year";
type GradeLevel = "All grade levels" | "Elementary" | "Middle School" | "High School";
type SortOption =
  | "Highest score"
  | "Lowest score"
  | "Most audits"
  | "Most critical gaps";

type CampusRecord = {
  id: string;
  campus: string;
  shortName: string;
  gradeLevel: Exclude<GradeLevel, "All grade levels">;
  audits: number;
  averageScore: number;
  priorScore: number;
  readyRate: number;
  needsReview: number;
  criticalGaps: number;
  teachers: number;
  mostCommonFinding: string;
  categoryScores: {
    plaafp: number;
    goals: number;
    accommodations: number;
    services: number;
    evidence: number;
  };
};

const campusRecords: CampusRecord[] = [
  {
    id: "college-park",
    campus: "College Park High School",
    shortName: "CPHS",
    gradeLevel: "High School",
    audits: 118,
    averageScore: 95,
    priorScore: 92,
    readyRate: 91,
    needsReview: 7,
    criticalGaps: 4,
    teachers: 18,
    mostCommonFinding: "Services rationale needs additional detail",
    categoryScores: {
      plaafp: 97,
      goals: 94,
      accommodations: 93,
      services: 89,
      evidence: 96,
    },
  },
  {
    id: "caney-creek",
    campus: "Caney Creek High School",
    shortName: "CCHS",
    gradeLevel: "High School",
    audits: 104,
    averageScore: 92,
    priorScore: 89,
    readyRate: 86,
    needsReview: 10,
    criticalGaps: 7,
    teachers: 16,
    mostCommonFinding: "Goal criteria are not consistently measurable",
    categoryScores: {
      plaafp: 94,
      goals: 88,
      accommodations: 91,
      services: 87,
      evidence: 93,
    },
  },
  {
    id: "oak-ridge",
    campus: "Oak Ridge High School",
    shortName: "ORHS",
    gradeLevel: "High School",
    audits: 86,
    averageScore: 89,
    priorScore: 87,
    readyRate: 79,
    needsReview: 14,
    criticalGaps: 11,
    teachers: 14,
    mostCommonFinding: "Accommodations lack direct supporting evidence",
    categoryScores: {
      plaafp: 91,
      goals: 87,
      accommodations: 83,
      services: 85,
      evidence: 89,
    },
  },
  {
    id: "grand-oaks",
    campus: "Grand Oaks High School",
    shortName: "GOHS",
    gradeLevel: "High School",
    audits: 72,
    averageScore: 87,
    priorScore: 84,
    readyRate: 74,
    needsReview: 15,
    criticalGaps: 14,
    teachers: 12,
    mostCommonFinding: "Services are weakly connected to documented needs",
    categoryScores: {
      plaafp: 89,
      goals: 84,
      accommodations: 86,
      services: 79,
      evidence: 88,
    },
  },
  {
    id: "conroe-high",
    campus: "Conroe High School",
    shortName: "CHS",
    gradeLevel: "High School",
    audits: 63,
    averageScore: 85,
    priorScore: 82,
    readyRate: 69,
    needsReview: 12,
    criticalGaps: 17,
    teachers: 11,
    mostCommonFinding: "Survey evidence is incomplete or missing",
    categoryScores: {
      plaafp: 87,
      goals: 82,
      accommodations: 84,
      services: 78,
      evidence: 80,
    },
  },
  {
    id: "peet-junior-high",
    campus: "Peet Junior High School",
    shortName: "PJH",
    gradeLevel: "Middle School",
    audits: 54,
    averageScore: 90,
    priorScore: 88,
    readyRate: 82,
    needsReview: 8,
    criticalGaps: 6,
    teachers: 10,
    mostCommonFinding: "Progress-monitoring methods need clarification",
    categoryScores: {
      plaafp: 92,
      goals: 88,
      accommodations: 91,
      services: 86,
      evidence: 93,
    },
  },
];

const dateOptions: DateRange[] = ["30 days", "90 days", "School year"];

const gradeOptions: GradeLevel[] = [
  "All grade levels",
  "Elementary",
  "Middle School",
  "High School",
];

const sortOptions: SortOption[] = [
  "Highest score",
  "Lowest score",
  "Most audits",
  "Most critical gaps",
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

function getScoreBarClass(score: number) {
  if (score >= 90) {
    return "bg-emerald-500";
  }

  if (score >= 80) {
    return "bg-amber-500";
  }

  return "bg-rose-500";
}

function getTrendClasses(change: number) {
  if (change > 0) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (change < 0) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function CampusAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("School year");
  const [gradeLevel, setGradeLevel] =
    useState<GradeLevel>("All grade levels");
  const [sortOption, setSortOption] =
    useState<SortOption>("Highest score");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampusId, setSelectedCampusId] = useState(
    campusRecords[0].id
  );
  const [message, setMessage] = useState("");

  const filteredCampuses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = campusRecords.filter((campus) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        campus.campus.toLowerCase().includes(normalizedSearch) ||
        campus.shortName.toLowerCase().includes(normalizedSearch);

      const matchesGrade =
        gradeLevel === "All grade levels" ||
        campus.gradeLevel === gradeLevel;

      return matchesSearch && matchesGrade;
    });

    return [...filtered].sort((first, second) => {
      switch (sortOption) {
        case "Highest score":
          return second.averageScore - first.averageScore;

        case "Lowest score":
          return first.averageScore - second.averageScore;

        case "Most audits":
          return second.audits - first.audits;

        case "Most critical gaps":
          return second.criticalGaps - first.criticalGaps;
      }
    });
  }, [gradeLevel, searchTerm, sortOption]);

  const selectedCampus =
    campusRecords.find((campus) => campus.id === selectedCampusId) ??
    campusRecords[0];

  const totalAudits = filteredCampuses.reduce(
    (total, campus) => total + campus.audits,
    0
  );

  const totalCriticalGaps = filteredCampuses.reduce(
    (total, campus) => total + campus.criticalGaps,
    0
  );

  const averageScore =
    filteredCampuses.length > 0
      ? Math.round(
          filteredCampuses.reduce(
            (total, campus) => total + campus.averageScore,
            0
          ) / filteredCampuses.length
        )
      : 0;

  const averageReadyRate =
    filteredCampuses.length > 0
      ? Math.round(
          filteredCampuses.reduce(
            (total, campus) => total + campus.readyRate,
            0
          ) / filteredCampuses.length
        )
      : 0;

  const strongestCampus = [...filteredCampuses].sort(
    (first, second) => second.averageScore - first.averageScore
  )[0];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Link
            href="/dashboard/analytics"
            className="text-sm font-semibold text-[#0a3d73] hover:underline"
          >
            ← Back to Analytics Overview
          </Link>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
            District intelligence
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Campus Analysis
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Compare documentation quality, readiness, recurring findings, and
            support needs across district campuses.
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
            {dateOptions.map((option) => (
              <option key={option} value={option}>
                {option === "30 days"
                  ? "Last 30 days"
                  : option === "90 days"
                    ? "Last 90 days"
                    : "School year"}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() =>
              setMessage(
                "Campus analytics export will be connected after live audit records are stored."
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
                Campus insight
              </span>

              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                {dateRange}
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              Campus performance is improving, with the largest opportunity in
              services and accommodations alignment.
            </h2>

            <p className="mt-4 text-sm leading-7 text-blue-100 sm:text-base">
              {strongestCampus?.campus ?? "The highest-performing campus"} has
              the strongest overall documentation quality. Campuses with lower
              readiness rates share recurring concerns involving incomplete
              evidence and insufficient connections between identified needs,
              goals, accommodations, and services.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 xl:w-[330px]">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
                Strongest campus
              </p>

              <p className="mt-2 text-base font-semibold text-white">
                {strongestCampus?.shortName ?? "—"}
              </p>

              <p className="mt-1 text-sm text-emerald-200">
                {strongestCampus?.averageScore ?? 0} average
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
                Priority area
              </p>

              <p className="mt-2 text-base font-semibold text-white">
                Services
              </p>

              <p className="mt-1 text-sm text-amber-200">
                District training
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Campuses Included
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-[#0a3d73]">
            {filteredCampuses.length}
          </p>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Matching current filters
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Audits</p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-[#0a3d73]">
            {totalAudits}
          </p>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Completed during selected period
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Average Campus Score
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-emerald-700">
            {averageScore}
          </p>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Across selected campuses
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Critical Gaps
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-rose-700">
            {totalCriticalGaps}
          </p>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            {averageReadyRate}% average readiness rate
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
              Campus filters
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Compare district campuses
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Search campus
              </span>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by campus name"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Grade level
              </span>

              <select
                value={gradeLevel}
                onChange={(event) =>
                  setGradeLevel(event.target.value as GradeLevel)
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              >
                {gradeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Sort campuses
              </span>

              <select
                value={sortOption}
                onChange={(event) =>
                  setSortOption(event.target.value as SortOption)
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d9e7c]">
              District comparison
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Campus Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a campus to view detailed category performance.
            </p>
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
                    Score
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Trend
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Ready
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Gaps
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    View
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCampuses.map((campus) => {
                  const scoreChange =
                    campus.averageScore - campus.priorScore;
                  const selected = campus.id === selectedCampus.id;

                  return (
                    <tr
                      key={campus.id}
                      className={`border-t border-slate-200 transition ${
                        selected ? "bg-blue-50/70" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#dce9f7] text-xs font-semibold text-[#0a3d73]">
                            {campus.shortName}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {campus.campus}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {campus.teachers} educators ·{" "}
                              {campus.gradeLevel}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm font-semibold text-slate-700">
                        {campus.audits}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`text-xl font-semibold ${getScoreTextClass(
                            campus.averageScore
                          )}`}
                        >
                          {campus.averageScore}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getTrendClasses(
                            scoreChange
                          )}`}
                        >
                          {scoreChange > 0 ? "+" : ""}
                          {scoreChange}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="min-w-28">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-slate-600">
                              {campus.readyRate}%
                            </span>
                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{
                                width: `${campus.readyRate}%`,
                              }}
                            />
                          </div>
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
                        <button
                          type="button"
                          onClick={() => setSelectedCampusId(campus.id)}
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

          {filteredCampuses.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <h3 className="text-lg font-semibold text-slate-950">
                No campuses found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Change the search or grade-level filter.
              </p>
            </div>
          ) : null}
        </article>

        <aside className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
              Selected campus
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {selectedCampus.campus}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {selectedCampus.audits} audits · {selectedCampus.teachers}{" "}
              educators
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700">
                  Average Score
                </p>

                <p className="mt-2 text-3xl font-semibold text-emerald-700">
                  {selectedCampus.averageScore}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-semibold text-[#0a3d73]">
                  Ready Rate
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#0a3d73]">
                  {selectedCampus.readyRate}%
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {[
                {
                  label: "PLAAFP",
                  score: selectedCampus.categoryScores.plaafp,
                },
                {
                  label: "Goals",
                  score: selectedCampus.categoryScores.goals,
                },
                {
                  label: "Accommodations",
                  score:
                    selectedCampus.categoryScores.accommodations,
                },
                {
                  label: "Services",
                  score: selectedCampus.categoryScores.services,
                },
                {
                  label: "Evidence Readiness",
                  score: selectedCampus.categoryScores.evidence,
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
          </article>

          <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Most common finding
            </p>

            <h3 className="mt-3 text-lg font-semibold text-slate-950">
              {selectedCampus.mostCommonFinding}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              This finding appears more frequently than other documentation
              concerns at this campus and may represent the strongest
              professional-development opportunity.
            </p>

            <button
              type="button"
              onClick={() =>
                setMessage(
                  `A training brief for ${selectedCampus.campus} will be available after analytics are connected to live records.`
                )
              }
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              Create Campus Brief
            </button>
          </article>

          <article className="rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a3d73]">
              Campus readiness
            </p>

            <h3 className="mt-3 text-lg font-semibold text-slate-950">
              {selectedCampus.needsReview} audits currently need attention.
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {selectedCampus.criticalGaps} audits contain critical gaps that
              should be reviewed before documentation is finalized.
            </p>

            <Link
              href="/dashboard/history"
              className="mt-5 inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-[#0a3d73] transition hover:bg-blue-50"
            >
              View Campus Audits
            </Link>
          </article>
        </aside>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d9e7c]">
              Next analysis
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Explore district-wide documentation findings.
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review recurring issues across PLAAFPs, goals, accommodations,
              services, evidence, and standards alignment.
            </p>
          </div>

          <Link
            href="/dashboard/analytics/findings"
            className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-[#0a3d73] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#07325f]"
          >
            Open Documentation Trends →
          </Link>
        </div>
      </section>

      <p className="text-center text-xs leading-6 text-slate-400">
        Sample campus data is shown for demonstration. Live analytics will be
        calculated from saved district audit records.
      </p>
    </div>
  );
}