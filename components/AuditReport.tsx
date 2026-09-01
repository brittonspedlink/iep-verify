type ReviewRecord = Record<string, unknown>;

type AuditReportProps = {
  title?: string | null;
  studentIdentifier?: string | null;
  completedDate?: string | null;
  auditStatus?: string | null;
  overallScore?: number | null;
  evidenceReadinessScore?: number | null;
  documentationAlignmentScore?: number | null;
  overallSummary?: string | null;
  criticalGaps?: string[];
  documentReviews?: Record<string, unknown>;
};

function isRecord(value: unknown): value is ReviewRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getText(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : null;
}

function getTextList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item === "string" && item.trim()) {
      return [item.trim()];
    }

    if (!isRecord(item)) {
      return [];
    }

    const text =
      getText(item.title) ??
      getText(item.issue) ??
      getText(item.description) ??
      getText(item.recommendation) ??
      getText(item.action);

    return text ? [text] : [];
  });
}
type FindingDetail = {
  title: string;
  severity: string;
};

function getFindingDetails(value: unknown): FindingDetail[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item === "string" && item.trim()) {
      return [
        {
          title: item.trim(),
          severity: "minor",
        },
      ];
    }

    if (!isRecord(item)) return [];

    const title =
      getText(item.title) ??
      getText(item.issue) ??
      getText(item.description);

    if (!title) return [];

    return [
      {
        title,
        severity: (getText(item.severity) ?? "minor").toLowerCase(),
      },
    ];
  });
}
function formatStatus(status: string | null) {
  if (!status) return "Completed";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatSectionName(sectionName: string) {
  const normalized = sectionName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .trim()
    .toLowerCase();

  if (normalized === "plaafp") return "PLAAFP";
  if (normalized === "teks") return "TEKS";
  if (normalized === "recommended teks") return "Recommended TEKS";
  if (normalized === "fie") return "FIE";

  return normalized.replace(/\b\w/g, (character) =>
    character.toUpperCase()
  );
}

export default function AuditReport({
  title,
  studentIdentifier,
  completedDate,
  auditStatus,
  overallScore,
  evidenceReadinessScore,
  documentationAlignmentScore,
  overallSummary,
  criticalGaps = [],
  documentReviews = {},
}: AuditReportProps) {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
            Audit Report
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {title || "IEP Audit"}
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Student identifier:{" "}
            <span className="font-semibold text-slate-700">
              {studentIdentifier || "Not provided"}
            </span>
          </p>

          {completedDate ? (
            <p className="mt-1 text-xs text-slate-400">
              Completed {completedDate}
            </p>
          ) : null}
        </div>

        {auditStatus ? (
          <span className="inline-flex w-fit rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-[#0a3d73]">
            {formatStatus(auditStatus)}
          </span>
        ) : null}
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
            {evidenceReadinessScore ?? "—"}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Documentation Alignment
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {documentationAlignmentScore ?? "—"}
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
          {overallSummary ||
            "No overall summary was provided for this audit."}
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
            {criticalGaps.length}
          </span>
        </div>

        {criticalGaps.length > 0 ? (
          <div className="mt-6 space-y-3">
            {criticalGaps.map((gap, index) => (
              <div
                key={`${index}-${gap}`}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900"
              >
                {gap}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-slate-500">
            No critical gaps were identified in this audit.
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

        <p className="mt-2 text-sm text-slate-500">
          Focus on the sections that need attention.
        </p>

        {Object.keys(documentReviews).length > 0 ? (
          <div className="mt-6 space-y-4">
            {Object.entries(documentReviews).map(
              ([sectionName, rawReview]) => {
                const review = isRecord(rawReview)
                  ? rawReview
                  : {};

                const score = getNumber(review.score);
                const status = getText(review.status);
                const mainIssue =
                  getText(review.mainIssue) ??
                  (typeof rawReview === "string"
                    ? rawReview
                    : null);

const findingDetails = getFindingDetails(review.findings);

const findings = findingDetails.map(
  (finding) => finding.title
);

const missingEvidence = getTextList(
  review.missingEvidence
);

const unsupportedStatements = getTextList(
  review.unsupportedStatements
);

const conflicts = getTextList(
  review.conflicts
);

const recommendations = getTextList(
  review.recommendedRevisions
);

const supportedContent = getTextList(
  review.supportedContent
);

const normalizedStatus = (status ?? "")
  .toLowerCase()
  .replaceAll(" ", "_");

const hasMajorFinding = findingDetails.some(
  (finding) =>
    finding.severity === "major" ||
    finding.severity === "critical"
);

const hasMinorFinding = findingDetails.some(
  (finding) => finding.severity === "minor"
);

const insufficientEvidence =
  normalizedStatus === "insufficient_evidence" ||
  normalizedStatus === "not_provided" ||
  (score === null && missingEvidence.length > 0);

const requiresReview =
  normalizedStatus === "review_required" ||
  hasMajorFinding ||
  conflicts.length > 0 ||
  unsupportedStatements.length > 0;

const hasNotes =
  !requiresReview &&
  !insufficientEvidence &&
  (
    normalizedStatus === "verified_with_notes" ||
    normalizedStatus === "review_finding" ||
    hasMinorFinding ||
    recommendations.length > 0 ||
    missingEvidence.length > 0
  );

const displayStatus = insufficientEvidence
  ? "Insufficient Evidence"
  : requiresReview
    ? "Review Required"
    : hasNotes
      ? "Verified with Notes"
      : "Verified";

const issueSummary =
  findings[0] ??
  conflicts[0] ??
  unsupportedStatements[0] ??
  mainIssue ??
  "This section has an alignment concern that should be reviewed.";

                return (
                  <article
                    key={sectionName}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">
                        {formatSectionName(sectionName)}
                      </h3>

                      <div className="flex items-center gap-2">
{score !== null ? (
  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${
      requiresReview
        ? "bg-amber-100 text-amber-800"
        : "bg-emerald-100 text-emerald-800"
    }`}
  >
    {score}
  </span>
) : null}

<span
  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
    requiresReview
      ? "bg-amber-50 text-amber-800 ring-amber-200"
      : insufficientEvidence
        ? "bg-slate-100 text-slate-700 ring-slate-200"
        : "bg-white text-emerald-700 ring-emerald-200"
  }`}
>
  {displayStatus}
</span>
                      </div>
                    </div>

{requiresReview ? (
  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
      Needs Attention
    </p>

    <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
      {issueSummary}
    </p>
  </div>
) : insufficientEvidence ? (
  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-sm font-semibold text-slate-700">
      Insufficient evidence to determine alignment
    </p>

    {mainIssue ? (
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {mainIssue}
      </p>
    ) : null}
  </div>
) : (
  <div className="mt-5">
    <p className="font-semibold text-emerald-800">
      ✓ Aligned
    </p>

    {mainIssue ? (
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {mainIssue}
      </p>
    ) : null}

    {hasNotes && findings.length > 0 ? (
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Optional Note
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {findings[0]}
        </p>
      </div>
    ) : null}
  </div>
)}

                    {requiresReview && findings.length > 0 ? (
                      <div className="mt-5">
                        <p className="text-sm font-semibold text-slate-900">
                          Findings
                        </p>

                        <ul className="mt-2 space-y-2 pl-5 text-sm leading-6 text-slate-700">
                          {findings.map((item) => (
                            <li
                              key={item}
                              className="list-disc"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {recommendations.length > 0 ? (
                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <p className="text-sm font-semibold text-slate-900">
                          Recommended Action
                        </p>

                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                          {recommendations.map((item) => (
                            <li
                              key={item}
                              className="flex gap-2"
                            >
                              <span className="font-semibold text-[#4d9e7c]">
                                →
                              </span>

                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

{supportedContent.length > 0 ? (
  <>
    <details className="mt-5 border-t border-slate-200 pt-4 print:hidden">
      <summary className="cursor-pointer text-sm font-semibold text-[#0a3d73]">
        View supporting evidence
      </summary>

      <ul className="mt-3 space-y-2 pl-5 text-sm leading-6 text-slate-600">
        {supportedContent.map((item) => (
          <li key={item} className="list-disc">
            {item}
          </li>
        ))}
      </ul>
    </details>

    <div className="mt-5 hidden border-t border-slate-200 pt-4 print:block">
      <p className="text-sm font-semibold text-slate-900">
        Supporting Evidence
      </p>

      <ul className="mt-3 space-y-2 pl-5 text-sm leading-6 text-slate-600">
        {supportedContent.map((item) => (
          <li key={item} className="list-disc">
            {item}
          </li>
        ))}
      </ul>
    </div>
  </>
) : null}
                  </article>
                );
              }
            )}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-slate-500">
            No section-level reviews were saved for this audit.
          </p>
        )}
      </section>

      <p className="pb-4 text-sm leading-7 text-slate-500">
        IEP Verify evaluates submitted IEP documentation based on the
        records supplied. It does not certify legal compliance or verify
        implementation.
      </p>
    </div>
  );
}