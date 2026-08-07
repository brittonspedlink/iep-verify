"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type AuditStatus =
  | "Verified"
  | "Ready for Review"
  | "Needs Review"
  | "Not Ready"
  | "Draft";

type AuditType =
  | "Annual IEP Review"
  | "Initial IEP Review"
  | "Reevaluation Review"
  | "Amendment Review";

type AuditRecord = {
  id: string;
  studentIdentifier: string;
  auditName: string;
  auditType: AuditType;
  campus: string;
  score: number | null;
  evidenceReadiness: number | null;
  alignmentScore: number | null;
  status: AuditStatus;
  updatedAt: string;
  updatedLabel: string;
  createdBy: string;
  hasCriticalGaps: boolean;
};

type StatusFilter =
  | "All statuses"
  | "Verified"
  | "Ready for Review"
  | "Needs Review"
  | "Not Ready"
  | "Draft";

type AuditTypeFilter = "All audit types" | AuditType;

type ScoreFilter =
  | "All scores"
  | "90–100"
  | "80–89"
  | "Below 80"
  | "Not scored";

type SortOption =
  | "Most recently updated"
  | "Oldest updated"
  | "Highest score"
  | "Lowest score"
  | "Student identifier";

const sampleAudits: AuditRecord[] = [
  {
    id: "audit-001",
    studentIdentifier: "J.R.",
    auditName: "J.R. — Annual IEP Review",
    auditType: "Annual IEP Review",
    campus: "College Park High School",
    score: 97,
    evidenceReadiness: 100,
    alignmentScore: 94,
    status: "Verified",
    updatedAt: "2026-08-06T14:18:00",
    updatedLabel: "Today at 2:18 PM",
    createdBy: "Britton Doss",
    hasCriticalGaps: false,
  },
  {
    id: "audit-002",
    studentIdentifier: "M.J.",
    auditName: "M.J. — Annual IEP Review",
    auditType: "Annual IEP Review",
    campus: "Caney Creek High School",
    score: 93,
    evidenceReadiness: 96,
    alignmentScore: 91,
    status: "Ready for Review",
    updatedAt: "2026-08-05T16:42:00",
    updatedLabel: "Yesterday at 4:42 PM",
    createdBy: "Britton Doss",
    hasCriticalGaps: false,
  },
  {
    id: "audit-003",
    studentIdentifier: "E.B.",
    auditName: "E.B. — Initial IEP Review",
    auditType: "Initial IEP Review",
    campus: "Wylie High School",
    score: 84,
    evidenceReadiness: 89,
    alignmentScore: 80,
    status: "Needs Review",
    updatedAt: "2026-08-05T10:15:00",
    updatedLabel: "Yesterday at 10:15 AM",
    createdBy: "Britton Doss",
    hasCriticalGaps: true,
  },
  {
    id: "audit-004",
    studentIdentifier: "C.T.",
    auditName: "C.T. — Reevaluation Review",
    auditType: "Reevaluation Review",
    campus: "College Park High School",
    score: null,
    evidenceReadiness: null,
    alignmentScore: null,
    status: "Draft",
    updatedAt: "2026-08-04T13:07:00",
    updatedLabel: "Aug 4 at 1:07 PM",
    createdBy: "Britton Doss",
    hasCriticalGaps: false,
  },
  {
    id: "audit-005",
    studentIdentifier: "A.S.",
    auditName: "A.S. — Amendment Review",
    auditType: "Amendment Review",
    campus: "Tomball High School",
    score: 72,
    evidenceReadiness: 76,
    alignmentScore: 68,
    status: "Not Ready",
    updatedAt: "2026-08-02T09:34:00",
    updatedLabel: "Aug 2 at 9:34 AM",
    createdBy: "Britton Doss",
    hasCriticalGaps: true,
  },
  {
    id: "audit-006",
    studentIdentifier: "L.M.",
    auditName: "L.M. — Annual IEP Review",
    auditType: "Annual IEP Review",
    campus: "Caney Creek High School",
    score: 96,
    evidenceReadiness: 98,
    alignmentScore: 94,
    status: "Verified",
    updatedAt: "2026-08-01T15:55:00",
    updatedLabel: "Aug 1 at 3:55 PM",
    createdBy: "Britton Doss",
    hasCriticalGaps: false,
  },
];

const statusOptions: StatusFilter[] = [
  "All statuses",
  "Verified",
  "Ready for Review",
  "Needs Review",
  "Not Ready",
  "Draft",
];

const auditTypeOptions: AuditTypeFilter[] = [
  "All audit types",
  "Annual IEP Review",
  "Initial IEP Review",
  "Reevaluation Review",
  "Amendment Review",
];

const scoreOptions: ScoreFilter[] = [
  "All scores",
  "90–100",
  "80–89",
  "Below 80",
  "Not scored",
];

const sortOptions: SortOption[] = [
  "Most recently updated",
  "Oldest updated",
  "Highest score",
  "Lowest score",
  "Student identifier",
];

function getStatusClasses(status: AuditStatus) {
  switch (status) {
    case "Verified":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Ready for Review":
      return "border-blue-200 bg-blue-50 text-[#0a3d73]";

    case "Needs Review":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "Not Ready":
      return "border-rose-200 bg-rose-50 text-rose-700";

    case "Draft":
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function getScoreClasses(score: number | null) {
  if (score === null) {
    return "text-slate-400";
  }

  if (score >= 90) {
    return "text-emerald-700";
  }

  if (score >= 80) {
    return "text-amber-700";
  }

  return "text-rose-700";
}

function matchesScoreFilter(score: number | null, filter: ScoreFilter) {
  if (filter === "All scores") {
    return true;
  }

  if (filter === "Not scored") {
    return score === null;
  }

  if (score === null) {
    return false;
  }

  if (filter === "90–100") {
    return score >= 90;
  }

  if (filter === "80–89") {
    return score >= 80 && score <= 89;
  }

  return score < 80;
}

export default function AuditHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All statuses");
  const [auditTypeFilter, setAuditTypeFilter] =
    useState<AuditTypeFilter>("All audit types");
  const [scoreFilter, setScoreFilter] =
    useState<ScoreFilter>("All scores");
  const [sortOption, setSortOption] =
    useState<SortOption>("Most recently updated");
  const [message, setMessage] = useState("");

  const completedAudits = sampleAudits.filter(
    (audit) => audit.status !== "Draft"
  );

  const averageScore =
    completedAudits.length > 0
      ? Math.round(
          completedAudits.reduce(
            (total, audit) => total + (audit.score ?? 0),
            0
          ) / completedAudits.length
        )
      : 0;

  const needsAttentionCount = sampleAudits.filter(
    (audit) =>
      audit.status === "Needs Review" ||
      audit.status === "Not Ready" ||
      audit.hasCriticalGaps
  ).length;

  const verifiedCount = sampleAudits.filter(
    (audit) => audit.status === "Verified"
  ).length;

  const draftCount = sampleAudits.filter(
    (audit) => audit.status === "Draft"
  ).length;

  const filteredAudits = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = sampleAudits.filter((audit) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        audit.studentIdentifier.toLowerCase().includes(normalizedSearch) ||
        audit.auditName.toLowerCase().includes(normalizedSearch) ||
        audit.campus.toLowerCase().includes(normalizedSearch) ||
        audit.auditType.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All statuses" ||
        audit.status === statusFilter;

      const matchesAuditType =
        auditTypeFilter === "All audit types" ||
        audit.auditType === auditTypeFilter;

      const matchesScore = matchesScoreFilter(
        audit.score,
        scoreFilter
      );

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAuditType &&
        matchesScore
      );
    });

    return [...filtered].sort((first, second) => {
      switch (sortOption) {
        case "Most recently updated":
          return (
            new Date(second.updatedAt).getTime() -
            new Date(first.updatedAt).getTime()
          );

        case "Oldest updated":
          return (
            new Date(first.updatedAt).getTime() -
            new Date(second.updatedAt).getTime()
          );

        case "Highest score":
          return (second.score ?? -1) - (first.score ?? -1);

        case "Lowest score":
          return (first.score ?? 101) - (second.score ?? 101);

        case "Student identifier":
          return first.studentIdentifier.localeCompare(
            second.studentIdentifier
          );
      }
    });
  }, [
    searchTerm,
    statusFilter,
    auditTypeFilter,
    scoreFilter,
    sortOption,
  ]);

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All statuses");
    setAuditTypeFilter("All audit types");
    setScoreFilter("All scores");
    setSortOption("Most recently updated");
    setMessage("");
  }

  function handleExport(audit: AuditRecord) {
    setMessage(
      `Export for ${audit.auditName} will be connected to the saved audit report after Supabase is wired.`
    );
  }

  function handleDelete(audit: AuditRecord) {
    setMessage(
      `Delete confirmation for ${audit.auditName} will be enabled after saved audit records are connected.`
    );
  }

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "All statuses" ||
    auditTypeFilter !== "All audit types" ||
    scoreFilter !== "All scores" ||
    sortOption !== "Most recently updated";

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
            Review workspace
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Audit History
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Search completed audits, resume drafts, review scores, and open
            saved reports.
          </p>
        </div>

        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0a3d73] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07325f] focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          <span aria-hidden="true">+</span>
          New Audit
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Audits
              </p>

              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {sampleAudits.length}
              </p>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0a3d73]">
              ▦
            </span>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Includes completed audits and drafts.
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Average Score
              </p>

              <p className="mt-2 text-3xl font-semibold text-emerald-700">
                {averageScore}
              </p>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              ✓
            </span>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Across completed audits.
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Needs Attention
              </p>

              <p className="mt-2 text-3xl font-semibold text-amber-700">
                {needsAttentionCount}
              </p>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              !
            </span>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Needs review, not ready, or critical gaps.
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Verified / Drafts
              </p>

              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {verifiedCount}
                <span className="mx-2 text-slate-300">/</span>
                {draftCount}
              </p>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              ◔
            </span>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Verified reports and unfinished records.
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Find an audit
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Search by student identifier, campus, audit name, or audit type.
              </p>
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(260px,1.4fr)_repeat(4,minmax(150px,1fr))]">
            <label className="block">
              <span className="sr-only">Search audits</span>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                  ⌕
                </span>

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setMessage("");
                  }}
                  placeholder="Search audits"
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </label>

            <label className="block">
              <span className="sr-only">Status filter</span>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as StatusFilter);
                  setMessage("");
                }}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="sr-only">Audit type filter</span>

              <select
                value={auditTypeFilter}
                onChange={(event) => {
                  setAuditTypeFilter(
                    event.target.value as AuditTypeFilter
                  );
                  setMessage("");
                }}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              >
                {auditTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="sr-only">Score filter</span>

              <select
                value={scoreFilter}
                onChange={(event) => {
                  setScoreFilter(event.target.value as ScoreFilter);
                  setMessage("");
                }}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              >
                {scoreOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="sr-only">Sort audits</span>

              <select
                value={sortOption}
                onChange={(event) => {
                  setSortOption(event.target.value as SortOption);
                  setMessage("");
                }}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
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

      {message ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-[#0a3d73]">
          {message}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Saved Audits
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredAudits.length} of {sampleAudits.length} audits
            </p>
          </div>

          <p className="text-xs font-medium text-slate-400">
            Sample records shown until Supabase is connected
          </p>
        </div>

        {filteredAudits.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Audit
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Campus
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Score
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Updated
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAudits.map((audit) => (
                    <tr
                      key={audit.id}
                      className="border-t border-slate-200 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-semibold text-[#0a3d73]">
                            {audit.studentIdentifier}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950">
                              {audit.auditName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {audit.auditType}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-700">
                          {audit.campus}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Created by {audit.createdBy}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p
                          className={`text-xl font-semibold ${getScoreClasses(
                            audit.score
                          )}`}
                        >
                          {audit.score ?? "—"}
                        </p>

                        {audit.score !== null ? (
                          <p className="mt-1 text-xs text-slate-400">
                            Evidence {audit.evidenceReadiness} · Alignment{" "}
                            {audit.alignmentScore}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-slate-400">
                            Not scored
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            audit.status
                          )}`}
                        >
                          {audit.status}
                        </span>

                        {audit.hasCriticalGaps ? (
                          <p className="mt-2 text-xs font-medium text-rose-600">
                            Critical gaps identified
                          </p>
                        ) : null}
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-700">
                          {audit.updatedLabel}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          {audit.status === "Draft" ? (
                            <Link
                              href="/dashboard/new/audit"
                              className="inline-flex items-center justify-center rounded-xl bg-[#0a3d73] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#07325f]"
                            >
                              Resume
                            </Link>
                          ) : (
                            <Link
                              href={`/dashboard/history/${audit.id}`}
                              className="inline-flex items-center justify-center rounded-xl bg-[#0a3d73] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#07325f]"
                            >
                              Open Report
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => handleExport(audit)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Export
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(audit)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                            aria-label={`Delete ${audit.auditName}`}
                          >
                            ⋯
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-200 lg:hidden">
              {filteredAudits.map((audit) => (
                <article key={audit.id} className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-semibold text-[#0a3d73]">
                        {audit.studentIdentifier}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {audit.auditName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {audit.auditType}
                        </p>
                      </div>
                    </div>

                    <p
                      className={`text-2xl font-semibold ${getScoreClasses(
                        audit.score
                      )}`}
                    >
                      {audit.score ?? "—"}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Campus
                      </p>

                      <p className="mt-2 text-sm text-slate-700">
                        {audit.campus}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Updated
                      </p>

                      <p className="mt-2 text-sm text-slate-700">
                        {audit.updatedLabel}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        audit.status
                      )}`}
                    >
                      {audit.status}
                    </span>

                    {audit.hasCriticalGaps ? (
                      <span className="text-xs font-medium text-rose-600">
                        Critical gaps identified
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {audit.status === "Draft" ? (
                      <Link
                        href="/dashboard/new/audit"
                        className="inline-flex items-center justify-center rounded-xl bg-[#0a3d73] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#07325f]"
                      >
                        Resume
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/history/${audit.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-[#0a3d73] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#07325f]"
                      >
                        Open Report
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleExport(audit)}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Export
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(audit)}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    >
                      More
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">
              ⌕
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-950">
              No audits found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try changing your search or filters. New audit records will
              appear here after they are saved.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}