import { NextResponse } from "next/server";
import OpenAI from "openai";

type ResultFinding = {
  severity: "critical" | "major" | "minor";
  title: string;
  explanation: string;
  evidence: string[];
  recommendation: string;
};

type DocumentReview = {
  score: number | null;
  status: string;
  mainIssue: string;
  supportedContent: string[];
  missingEvidence: string[];
  unsupportedStatements: string[];
  conflicts: string[];
  omittedRecommendations: string[];
  recommendedRevisions: string[];
  findings: ResultFinding[];
};

type AuditResponse = {
  overallScore: number;
  evidenceReadinessScore: number;
  documentationAlignmentScore: number;
  auditStatus: "Ready for Review" | "Review with Caution" | "Not Ready for Review";
  criticalGaps: string[];
  caseCompleteness: {
    expectedTeacherSurveys: number;
    completedTeacherSurveys: number;
    missingTeacherSurveys: number;
    blankDocuments: string[];
    placeholderResponses: string[];
  };
  overallSummary: string;
  documentReviews: {
    plaafp: DocumentReview;
    vision: DocumentReview;
    goals: DocumentReview;
    accommodations: DocumentReview;
    services: DocumentReview;
    recommendedTeks: DocumentReview;
  };
};

type OpenAIResponseShape = {
  overallScore: number;
  overallSummary: string;
  documentReviews?: Record<string, unknown>;
  accommodationsReview?: Record<string, unknown>;
  servicesReview?: Record<string, unknown>;
};

function isMeaningfulText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlaceholderLike(value: unknown): boolean {
  if (!isMeaningfulText(value)) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  if (["test", "n/a", "na", "none", "tbd", "placeholder", "sample"].includes(normalized)) {
    return true;
  }

  if (normalized.includes("test") || normalized.includes("sample")) {
    return true;
  }

  return normalized.length < 8;
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

type CandidateArray = unknown[];

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isFindingsArray(value: unknown): value is ResultFinding[] {
  return (
    Array.isArray(value) &&
    value.every((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }
      const candidate = item as Record<string, unknown>;
      return (
        typeof candidate.severity === "string" &&
        typeof candidate.title === "string" &&
        typeof candidate.explanation === "string" &&
        Array.isArray(candidate.evidence) &&
        candidate.evidence.every((e) => typeof e === "string") &&
        typeof candidate.recommendation === "string"
      );
    })
  );
}

function normalizeFindingSeverity(value: unknown): ResultFinding["severity"] {
  if (typeof value !== "string") {
    return "minor";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "critical" || normalized === "high") {
    return "critical";
  }

  if (normalized === "major" || normalized === "moderate" || normalized === "medium") {
    return "major";
  }

  return "minor";
}

function extractOpenAIResponseText(response: unknown): string {
  if (!response || typeof response !== "object") {
    return "";
  }

  const candidate = response as Record<string, unknown>;
  if (typeof candidate.output_text === "string") {
    return candidate.output_text;
  }

  if (typeof candidate.text === "string") {
    return candidate.text;
  }

  const output = candidate.output;
  if (Array.isArray(output)) {
    return output
      .flatMap((item) => {
        if (!item || typeof item !== "object") {
          return [];
        }

        const itemRecord = item as Record<string, unknown>;
        const content = itemRecord.content;
        if (!Array.isArray(content)) {
          return [];
        }

        return content.flatMap((part) => {
          if (!part || typeof part !== "object") {
            return [];
          }

          const partRecord = part as Record<string, unknown>;
          if (typeof partRecord.text === "string") {
            return [partRecord.text];
          }

          if (typeof partRecord.value === "string") {
            return [partRecord.value];
          }

          return [];
        });
      })
      .join("\n");
  }

  return "";
}

function normalizeOpenAIResponseText(value: string): string {
  const trimmed = value.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fencedMatch ? fencedMatch[1].trim() : trimmed;
}

function normalizeReviewStatus(value: unknown): string {
  if (typeof value !== "string") {
    return "verified_with_notes";
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");

  if (
    normalized === "verified" ||
    normalized === "pass" ||
    normalized === "supported" ||
    normalized === "ready"
  ) {
    return "verified";
  }

  if (
    normalized === "verified_with_notes" ||
    normalized === "review_finding" ||
    normalized === "warning" ||
    normalized === "weakly_supported" ||
    normalized === "review_with_caution"
  ) {
    return "verified_with_notes";
  }

  if (
    normalized === "review_required" ||
    normalized === "concern" ||
    normalized === "not_ready"
  ) {
    return "review_required";
  }

  if (
    normalized === "insufficient_evidence" ||
    normalized === "not_provided" ||
    normalized === "not_evaluated" ||
    normalized === "missing"
  ) {
    return "insufficient_evidence";
  }

  return "verified_with_notes";
}

  

function isOpenAIReview(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const score = candidate.score;
  return (
    (typeof score === "number" || score === null) &&
    isStringArray(candidate.supportedContent) &&
    isStringArray(candidate.missingEvidence) &&
    isStringArray(candidate.unsupportedStatements) &&
    isStringArray(candidate.conflicts) &&
    (typeof candidate.status === "undefined" || typeof candidate.status === "string") &&
    (typeof candidate.mainIssue === "undefined" || typeof candidate.mainIssue === "string") &&
    (typeof candidate.omittedRecommendations === "undefined" || isStringArray(candidate.omittedRecommendations)) &&
    (typeof candidate.recommendedRevisions === "undefined" || isStringArray(candidate.recommendedRevisions)) &&
    (typeof candidate.findings === "undefined" || isFindingsArray(candidate.findings))
  );
}

function isOpenAIResponseShape(value: unknown): value is OpenAIResponseShape {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.overallScore !== "number" || typeof candidate.overallSummary !== "string") {
    return false;
  }

  const reviews = candidate.documentReviews;
  const legacyReviews = reviews && typeof reviews === "object" ? (reviews as Record<string, unknown>) : {};
  const hasRequiredLegacyDocuments = ["plaafp", "vision", "goals", "recommendedTeks"].every((key) => isOpenAIReview(legacyReviews[key]));
  const hasAccommodationsReview = isOpenAIReview(legacyReviews.accommodations) || isOpenAIReview(candidate.accommodationsReview);
  const hasServicesReview = isOpenAIReview(legacyReviews.services) || isOpenAIReview(candidate.servicesReview);

  return hasRequiredLegacyDocuments && hasAccommodationsReview && hasServicesReview;
}

function getEvidenceReadinessScore(payload: Record<string, unknown>) {
  const expectedTeacherSurveys = Number(
    payload.expectedTeacherSurveyCount ?? 0
  );

  const completedTeacherSurveys = Number(
    payload.completedTeacherSurveyCount ?? 0
  );

  const missingTeacherSurveys = Math.max(
    expectedTeacherSurveys - completedTeacherSurveys,
    0
  );

  let readinessScore = 100;

  // Missing expected teacher surveys are a significant evidence gap.
  if (missingTeacherSurveys > 0) {
    readinessScore -= Math.min(
      missingTeacherSurveys * 20,
      60
    );
  }

  // If teacher evidence itself is absent, the audit loses a major
  // source of classroom evidence.
  if (
    !isMeaningfulText(payload.teacherSurvey) ||
    isPlaceholderLike(payload.teacherSurvey)
  ) {
    readinessScore -= 20;
  }

  // Parent and student voice are meaningful parts of the evidence baseline.
  if (
    !isMeaningfulText(payload.parentSurvey) ||
    isPlaceholderLike(payload.parentSurvey)
  ) {
    readinessScore -= 15;
  }

  if (
    !isMeaningfulText(payload.studentSurvey) ||
    isPlaceholderLike(payload.studentSurvey)
  ) {
    readinessScore -= 15;
  }

  // Case manager notes are useful, but their absence should not carry
  // the same penalty as a missing survey.
  if (
    isMeaningfulText(payload.caseNotes) &&
    isPlaceholderLike(payload.caseNotes)
  ) {
    readinessScore -= 5;
  }

  const documentFields = [
    payload.plaafp,
    payload.vision,
    payload.goals,
    payload.accommodations,
    payload.services,
    payload.recommendedTeks,
  ];

  const blankDocuments = documentFields.filter(
    (value) => !isMeaningfulText(value)
  ).length;

  readinessScore -= blankDocuments * 5;

  return Math.max(
    0,
    Math.min(100, Math.round(readinessScore))
  );
}

function collectCriticalGaps(
  payload: Record<string, unknown>,
  evidenceReadinessScore: number
) {
  const gaps: string[] = [];

  const expectedTeacherSurveys = Number(
    payload.expectedTeacherSurveyCount ?? 0
  );

  const completedTeacherSurveys = Number(
    payload.completedTeacherSurveyCount ?? 0
  );

  const missingTeacherSurveys = Math.max(
    expectedTeacherSurveys - completedTeacherSurveys,
    0
  );

  const teacherSurvey = payload.teacherSurvey;
  const parentSurvey = payload.parentSurvey;
  const studentSurvey = payload.studentSurvey;
  const caseNotes = payload.caseNotes;

  const sourceEvidence = [
    teacherSurvey,
    parentSurvey,
    studentSurvey,
    caseNotes,
  ];

  const anyUsableSourceEvidence = sourceEvidence.some(
    (value) =>
      isMeaningfulText(value) &&
      !isPlaceholderLike(value)
  );

  if (!anyUsableSourceEvidence) {
    gaps.push(
      "Evidence gap: No usable source evidence was available for this audit."
    );
  }

  if (missingTeacherSurveys > 0) {
    gaps.push(
      `Evidence gap: ${missingTeacherSurveys} of ${expectedTeacherSurveys} expected teacher survey${
        expectedTeacherSurveys === 1 ? "" : "s"
      } were not available for this audit.`
    );
  } else if (
    expectedTeacherSurveys > 0 &&
    (
      !isMeaningfulText(teacherSurvey) ||
      isPlaceholderLike(teacherSurvey)
    )
  ) {
    gaps.push(
      "Evidence gap: Teacher survey evidence was expected but was not available or was incomplete."
    );
  }

  if (
    !isMeaningfulText(parentSurvey) ||
    isPlaceholderLike(parentSurvey)
  ) {
    gaps.push(
      "Evidence gap: Parent survey evidence was not available or was incomplete."
    );
  }

  if (
    !isMeaningfulText(studentSurvey) ||
    isPlaceholderLike(studentSurvey)
  ) {
    gaps.push(
      "Evidence gap: Student survey evidence was not available or was incomplete."
    );
  }

  const documentFields = [
    ["PLAAFP", payload.plaafp],
    ["Vision", payload.vision],
    ["Goals", payload.goals],
    ["Accommodations", payload.accommodations],
    ["Services", payload.services],
    ["Recommended TEKS", payload.recommendedTeks],
  ] as Array<[string, unknown]>;

  const blankDocuments = documentFields
    .filter(([, value]) => !isMeaningfulText(value))
    .map(([label]) => label);

  if (blankDocuments.length > 0) {
    gaps.push(
      `Review limitation: IEP sections not provided: ${blankDocuments.join(
        ", "
      )}. Alignment could not be determined for those sections.`
    );
  }

  if (
    evidenceReadinessScore < 60 &&
    gaps.length === 0
  ) {
    gaps.push(
      "Evidence gap: The evidence baseline is too incomplete for a reliable alignment determination."
    );
  }

  return gaps;
}
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const teacherSurvey = normalizeString(body.teacherSurvey);
    const parentSurvey = normalizeString(body.parentSurvey);
    const studentSurvey = normalizeString(body.studentSurvey);
    const caseNotes = normalizeString(body.caseNotes);
    const plaafp = normalizeString(body.plaafp);
    const vision = normalizeString(body.vision);
    const goals = normalizeString(body.goals);
    const accommodations = normalizeString(body.accommodations);
    const services = normalizeString(body.services);
    const recommendedTeks = normalizeString(body.recommendedTeks);
    const expectedTeacherSurveyCount = Number(body.expectedTeacherSurveyCount ?? 0);
    const completedTeacherSurveyCount = Number(body.completedTeacherSurveyCount ?? 0);

    const payload = {
      teacherSurvey,
      parentSurvey,
      studentSurvey,
      caseNotes,
      plaafp,
      vision,
      goals,
      accommodations,
      services,
      recommendedTeks,
      expectedTeacherSurveyCount,
      completedTeacherSurveyCount,
    };

    console.log("Audit API payload:", payload);

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `You are conducting an evidence-alignment audit of IEP documentation. Compare the source evidence to the submitted IEP documentation. Treat the source evidence as the comparison baseline. SOURCE EVIDENCE: teacherSurvey, parentSurvey, studentSurvey, caseNotes. DOCUMENTS TO VERIFY: plaafp, vision, goals, accommodations, services, recommendedTeks. Your job is to identify what content in each IEP section is supported by the source evidence, what important evidence is missing from the generated document, what statements appear unsupported by the source evidence, what conflicts or inconsistencies exist, and what specific revision would improve evidence alignment.
CORE AUDIT DOCTRINE:
- IEP Verify is an evidence-alignment audit. It is not an exercise in creating a perfect or maximally comprehensive IEP.
- The central question is whether the submitted IEP materially reflects and aligns with the relevant source evidence that was actually provided.
- Do not penalize an IEP section merely because additional detail could theoretically be added.
- Do not recommend a revision merely because a different wording, greater specificity, or additional explanation might improve the document.
- A section is sufficiently aligned when the relevant documented student needs, strengths, concerns, supports, and priorities are materially carried forward into that section.
- Distinguish material alignment deficiencies from optional enhancements.
- Optional enhancements may be noted as minor findings, but they must not cause a section to be classified as Review Required.
- Do not manufacture findings in order to avoid giving a high score.
- If the IEP section is materially aligned to the evidence supplied, say so clearly and move on.
- Do not infer that information should exist merely because it is commonly found in an IEP.
- Do not require information that is not present in the supplied evidence unless its absence genuinely prevents an alignment determination.

EVIDENCE AVAILABILITY:
- Missing expected teacher, parent, or student survey evidence is an important limitation of the audit evidence baseline.
- Missing survey evidence affects confidence in the audit and evidence readiness, but it is not by itself proof that the IEP documentation is misaligned.
- When evidence needed to evaluate a particular section is genuinely unavailable, use insufficient evidence rather than inventing a deficiency.
- Evaluate documentation alignment only against evidence actually supplied.

SECTION STATUS RULES:
- "verified": The section is materially aligned and no meaningful correction is needed.
- "verified_with_notes": The section is materially aligned. A minor, optional clarification or enhancement may be helpful, but revision is not necessary to establish alignment.
- "review_required": A material alignment deficiency exists and educator review or correction is warranted.
- "insufficient_evidence": The supplied evidence is insufficient to determine alignment for that section. This does not mean the IEP itself is deficient.

FINDING SEVERITY:
- "critical": A substantial contradiction, unsupported statement, or omission materially undermines the reliability or alignment of the section.
- "major": A documented need, support, concern, or priority is materially omitted, contradicted, or unsupported.
- "minor": A limited, non-material opportunity for clarification or improvement. Minor findings are advisory and must not be treated as failures.

SCORING GUIDANCE:
- 95-100: Materially aligned. Appropriate for Verified sections.
- 90-99: May also be used for Verified with Notes when only minor, non-material improvements exist.
- 75-89: A material alignment concern exists and review is required.
- Below 75: Significant alignment deficiencies exist.
- Do not deduct points solely because an IEP could be more detailed.
- Do not deduct points simply to avoid awarding a high score.
- Do not lower a document-alignment score merely because a survey was unavailable; missing surveys are handled separately as evidence-readiness limitations.
- High scores are appropriate when the submitted documentation is sufficiently aligned to the available evidence.

IEP ACCOMMODATIONS
<<<ACCOMMODATIONS_START>>>
${accommodations || "Not provided"}
<<<ACCOMMODATIONS_END>>>

IEP SERVICES
<<<SERVICES_START>>>
${services || "Not provided"}
<<<SERVICES_END>>>

Accommodation Validation:
- For each documented accommodation: identify the documented need it addresses, identify the source evidence supporting it, determine whether it is supported, weakly supported, or unsupported, and identify important evidence-supported accommodations that may have been omitted from the IEP documentation.
- Do not recommend accommodations solely because they are common for a disability category.
- Do not infer effectiveness unless effectiveness is described in the source evidence.
- Flag accommodation without documented need, accommodation without supporting evidence, evidence-supported accommodation omitted from the IEP documentation, duplicate or materially overlapping accommodation, and accommodation stated more broadly than the evidence supports.

Services Validation:
- For each documented service: identify the documented need it addresses, identify the source evidence supporting it, identify any generated goal connected to the same need, determine whether the recommendation is supported, weakly supported, or unsupported, and identify significant documented needs that may not be addressed by a service recommendation.
- Do not evaluate actual service delivery, service logs, missed sessions, provider compliance, start date, frequency, duration, location, or implementation fidelity.
- Flag service recommendation without documented need, service recommendation without supporting evidence, significant need without a corresponding service consideration, service recommendation inconsistent with the PLAAFP or goals, and recommendation that states implementation details not present in the source evidence.
- If implementation details are absent, do not reduce the validation score merely because they are unavailable.

Do not evaluate legal compliance. Do not make legal conclusions. Do not infer eligibility requirements. Do not recommend new services, accommodations, goals, or programming unless the source evidence explicitly supports them. Do not criticize missing cognitive, eligibility, evaluation, or assessment information unless that information is explicitly present in the source evidence and omitted or contradicted in the generated document. If a document field is blank, state that no alignment review can be completed for that document and identify relevant source evidence that may belong there. If source responses contain placeholders like Test, incomplete answers, or unanswered questions, identify them as weak or incomplete source evidence rather than meaningful student information. If expected source evidence such as teacher, parent, or student surveys is missing or incomplete, treat that as an evidence-readiness limitation. Do not automatically lower the document-alignment score for that reason alone. Lower a document score materially only when the evidence that is actually supplied demonstrates a material alignment deficiency, or use "insufficient_evidence" when the available evidence is not enough to make a reliable section-level determination. Do not infer facts not explicitly present. Do not include broad best-practice advice unrelated to the submitted evidence. Keep every finding specific to the submitted student. Return valid JSON with this exact shape: {\"overallScore\": number, \"overallSummary\": string, \"documentReviews\": {\"plaafp\": {\"score\": number | null, \"status\": string, \"mainIssue\": string, \"supportedContent\": string[], \"missingEvidence\": string[], \"unsupportedStatements\": string[], \"conflicts\": string[], \"omittedRecommendations\": string[], \"recommendedRevisions\": string[], \"findings\": {\"severity\": string, \"title\": string, \"explanation\": string, \"evidence\": string[], \"recommendation\": string}[]}, \"vision\": {\"score\": number | null, \"status\": string, \"mainIssue\": string, \"supportedContent\": string[], \"missingEvidence\": string[], \"unsupportedStatements\": string[], \"conflicts\": string[], \"omittedRecommendations\": string[], \"recommendedRevisions\": string[], \"findings\": {\"severity\": string, \"title\": string, \"explanation\": string, \"evidence\": string[], \"recommendation\": string}[]}, \"goals\": {\"score\": number | null, \"status\": string, \"mainIssue\": string, \"supportedContent\": string[], \"missingEvidence\": string[], \"unsupportedStatements\": string[], \"conflicts\": string[], \"omittedRecommendations\": string[], \"recommendedRevisions\": string[], \"findings\": {\"severity\": string, \"title\": string, \"explanation\": string, \"evidence\": string[], \"recommendation\": string}[]}, \"accommodations\": {\"score\": number | null, \"status\": string, \"mainIssue\": string, \"supportedContent\": string[], \"missingEvidence\": string[], \"unsupportedStatements\": string[], \"conflicts\": string[], \"omittedRecommendations\": string[], \"recommendedRevisions\": string[], \"findings\": {\"severity\": string, \"title\": string, \"explanation\": string, \"evidence\": string[], \"recommendation\": string}[]}, \"services\": {\"score\": number | null, \"status\": string, \"mainIssue\": string, \"supportedContent\": string[], \"missingEvidence\": string[], \"unsupportedStatements\": string[], \"conflicts\": string[], \"omittedRecommendations\": string[], \"recommendedRevisions\": string[], \"findings\": {\"severity\": string, \"title\": string, \"explanation\": string, \"evidence\": string[], \"recommendation\": string}[]}, \"recommendedTeks\": {\"score\": number | null, \"status\": string, \"mainIssue\": string, \"supportedContent\": string[], \"missingEvidence\": string[], \"unsupportedStatements\": string[], \"conflicts\": string[], \"omittedRecommendations\": string[], \"recommendedRevisions\": string[], \"findings\": {\"severity\": string, \"title\": string, \"explanation\": string, \"evidence\": string[], \"recommendation\": string}[]}}}.`
        },
        {
          role: "user",
          content: JSON.stringify({
            teacherSurvey: payload.teacherSurvey,
            parentSurvey: payload.parentSurvey,
            studentSurvey: payload.studentSurvey,
            caseNotes: payload.caseNotes,
            plaafp: payload.plaafp,
            vision: payload.vision,
            goals: payload.goals,
            accommodations: payload.accommodations,
            services: payload.services,
            recommendedTeks: payload.recommendedTeks,
            expectedTeacherSurveyCount: payload.expectedTeacherSurveyCount,
            completedTeacherSurveyCount: payload.completedTeacherSurveyCount,
          }),
        },
      ],
    });

    let parsedResponse: unknown;

    const responseText = normalizeOpenAIResponseText(extractOpenAIResponseText(completion));
    console.error("RAW_OPENAI_AUDIT_RESPONSE", responseText);

    try {
      parsedResponse = JSON.parse(responseText);
    } catch (error) {
      console.error("AUDIT_JSON_PARSE_ERROR", error, responseText);
      return NextResponse.json(
        { error: "OpenAI response was not valid JSON." },
        { status: 502 }
      );
    }

    console.error("PARSED_OPENAI_AUDIT_RESPONSE", JSON.stringify(parsedResponse, null, 2));

    if (!isOpenAIResponseShape(parsedResponse)) {
      console.error("AUDIT_SCHEMA_VALIDATION_ERRORS", {
        expected: ["overallScore", "overallSummary", "documentReviews or accommodationsReview/servicesReview"],
        received: parsedResponse,
      });
      return NextResponse.json(
        { error: "OpenAI response did not match the expected structure." },
        { status: 502 }
      );
    }

    const evidenceReadinessScore = getEvidenceReadinessScore(payload);
    const reviewsPayload = parsedResponse.documentReviews && typeof parsedResponse.documentReviews === "object"
      ? (parsedResponse.documentReviews as Record<string, unknown>)
      : {};
    const accommodationReview = isOpenAIReview(parsedResponse.accommodationsReview)
      ? parsedResponse.accommodationsReview
      : isOpenAIReview(reviewsPayload.accommodations)
        ? reviewsPayload.accommodations
        : undefined;
    const servicesReview = isOpenAIReview(parsedResponse.servicesReview)
      ? parsedResponse.servicesReview
      : isOpenAIReview(reviewsPayload.services)
        ? reviewsPayload.services
        : undefined;
    const documentReviews = {
      plaafp: reviewsPayload.plaafp,
      vision: reviewsPayload.vision,
      goals: reviewsPayload.goals,
      accommodations: accommodationReview,
      services: servicesReview,
      recommendedTeks: reviewsPayload.recommendedTeks,
    };


    const expectedTeacherSurveys = Number(payload.expectedTeacherSurveyCount ?? 0);
    const completedTeacherSurveys = Number(payload.completedTeacherSurveyCount ?? 0);
    const missingTeacherSurveys = Math.max(expectedTeacherSurveys - completedTeacherSurveys, 0);
    const blankDocuments = [
      ["PLAAFP", payload.plaafp],
      ["Vision", payload.vision],
      ["Goals", payload.goals],
      ["Accommodations", payload.accommodations],
      ["Services", payload.services],
      ["Recommended TEKS", payload.recommendedTeks],
    ]
      .filter(([, value]) => !isMeaningfulText(value))
      .map(([label]) => label);
   
const placeholderResponses = [
  ["teacherSurvey", payload.teacherSurvey],
  ["parentSurvey", payload.parentSurvey],
  ["studentSurvey", payload.studentSurvey],
  ["caseNotes", payload.caseNotes],
]
  .filter(([, value]) => isPlaceholderLike(value))
  .map(([label]) => label);

const criticalGaps = collectCriticalGaps(
  payload,
  evidenceReadinessScore
);

    const normalizedDocumentReviews = Object.fromEntries(
      Object.entries(documentReviews).map(([key, review]) => {
        const reviewValue = review && typeof review === "object" ? (review as Record<string, unknown>) : {};
        const isNotProvided =
          (key === "accommodations" && !isMeaningfulText(accommodations)) ||
          (key === "services" && !isMeaningfulText(services));
        const score = isNotProvided
          ? null
          : typeof reviewValue.score === "number"
            ? reviewValue.score
            : reviewValue.score === null
              ? null
              : Number(reviewValue.score ?? 0);
        const supportedContent = Array.isArray(reviewValue.supportedContent)
          ? reviewValue.supportedContent.filter((item): item is string => typeof item === "string")
          : [];
        const missingEvidence = Array.isArray(reviewValue.missingEvidence)
          ? reviewValue.missingEvidence.filter((item): item is string => typeof item === "string")
          : [];
        const unsupportedStatements = Array.isArray(reviewValue.unsupportedStatements)
          ? reviewValue.unsupportedStatements.filter((item): item is string => typeof item === "string")
          : [];
        const conflicts = Array.isArray(reviewValue.conflicts)
          ? reviewValue.conflicts.filter((item): item is string => typeof item === "string")
          : [];
        const omittedRecommendations = Array.isArray(reviewValue.omittedRecommendations)
          ? reviewValue.omittedRecommendations.filter((item): item is string => typeof item === "string")
          : [];
        const recommendedRevisions = Array.isArray(reviewValue.recommendedRevisions)
          ? reviewValue.recommendedRevisions.filter((item): item is string => typeof item === "string")
          : [];
        const findings = Array.isArray(reviewValue.findings)
          ? reviewValue.findings.flatMap((item): ResultFinding[] => {
              if (!item || typeof item !== "object") {
                return [];
              }
              const candidate = item as Record<string, unknown>;
              if (
                typeof candidate.title !== "string" ||
                typeof candidate.explanation !== "string" ||
                !Array.isArray(candidate.evidence) ||
                candidate.evidence.some((e) => typeof e !== "string") ||
                typeof candidate.recommendation !== "string"
              ) {
                return [];
              }

              return [{
                severity: normalizeFindingSeverity(candidate.severity),
                title: candidate.title,
                explanation: candidate.explanation,
                evidence: candidate.evidence.filter((e): e is string => typeof e === "string"),
                recommendation: candidate.recommendation,
              }];
            })
          : [];
const mainIssue = typeof reviewValue.mainIssue === "string"
  ? reviewValue.mainIssue
  : isNotProvided
    ? `No generated ${
        key === "accommodations" ? "accommodations" : "services"
      } were provided.`
    : missingEvidence.length
      ? "Additional evidence-alignment context should be reviewed."
      : "No major alignment concerns were identified.";

const modelStatus = isNotProvided
  ? "insufficient_evidence"
  : normalizeReviewStatus(reviewValue.status);

const hasMaterialFinding = findings.some(
  (finding) =>
    finding.severity === "critical" ||
    finding.severity === "major"
);

const hasMinorFinding = findings.some(
  (finding) => finding.severity === "minor"
);

const hasMaterialConcern =
  hasMaterialFinding ||
  conflicts.length > 0 ||
  unsupportedStatements.length > 0;

const hasAdvisoryNote =
  hasMinorFinding ||
  recommendedRevisions.length > 0 ||
  missingEvidence.length > 0;

const finalStatus =
  isNotProvided || modelStatus === "insufficient_evidence"
    ? "insufficient_evidence"
    : hasMaterialConcern || modelStatus === "review_required"
      ? "review_required"
      : hasAdvisoryNote || modelStatus === "verified_with_notes"
        ? "verified_with_notes"
        : "verified";

const normalizedScore =
  score === null
    ? null
    : score <= 10
      ? score * 10
      : score;

const adjustedScore =
  normalizedScore === null
    ? null
    : finalStatus === "review_required"
      ? Math.min(normalizedScore, 89)
      : finalStatus === "verified_with_notes"
        ? Math.max(90, Math.min(normalizedScore, 99))
        : finalStatus === "verified"
          ? Math.max(95, Math.min(normalizedScore, 100))
          : normalizedScore;

return [key, {
  score: adjustedScore,
  status: finalStatus,
  mainIssue,
          supportedContent,
          missingEvidence,
          unsupportedStatements,
          conflicts,
          omittedRecommendations,
          recommendedRevisions,
          findings,
        }];
      })
    ) as AuditResponse["documentReviews"];
const normalizedReviews = Object.values(
  normalizedDocumentReviews
);

const normalizedDocumentScores = normalizedReviews
  .map((review) => review.score)
  .filter(
    (score): score is number =>
      typeof score === "number"
  );

let documentationAlignmentScore =
  normalizedDocumentScores.length > 0
    ? Math.round(
        normalizedDocumentScores.reduce(
          (sum, score) => sum + score,
          0
        ) / normalizedDocumentScores.length
      )
    : 0;

const reviewRequiredCount = normalizedReviews.filter(
  (review) => review.status === "review_required"
).length;

const hasReviewRequired =
  reviewRequiredCount > 0;

const hasInsufficientEvidenceSection =
  normalizedReviews.some(
    (review) =>
      review.status === "insufficient_evidence"
  );

const hasCriticalFinding =
  normalizedReviews.some((review) =>
    review.findings.some(
      (finding) => finding.severity === "critical"
    )
  );

// A material finding must be reflected in the alignment score.
// A report should never show near-perfect alignment while also
// requiring material review.
if (hasReviewRequired) {
  documentationAlignmentScore = Math.min(
    documentationAlignmentScore,
    89
  );
}

if (reviewRequiredCount >= 2) {
  documentationAlignmentScore = Math.min(
    documentationAlignmentScore,
    84
  );
}

if (hasCriticalFinding) {
  documentationAlignmentScore = Math.min(
    documentationAlignmentScore,
    79
  );
}

// Documentation alignment is the primary purpose of IEP Verify.
// Evidence readiness affects confidence in that determination
// without automatically declaring the IEP itself misaligned.
let overallScore = Math.round(
  evidenceReadinessScore * 0.4 +
    documentationAlignmentScore * 0.6
);

if (hasReviewRequired) {
  overallScore = Math.min(overallScore, 89);
}

if (reviewRequiredCount >= 2) {
  overallScore = Math.min(overallScore, 84);
}

if (hasCriticalFinding) {
  overallScore = Math.min(overallScore, 79);
}

// Weak evidence readiness is a meaningful limitation of the audit,
// even when the documentation that can be reviewed appears aligned.
if (evidenceReadinessScore < 60) {
  overallScore = Math.min(overallScore, 69);
} else if (evidenceReadinessScore < 80) {
  overallScore = Math.min(overallScore, 89);
}

let auditStatus: AuditResponse["auditStatus"];

if (
  evidenceReadinessScore < 60 ||
  hasCriticalFinding ||
  documentationAlignmentScore < 75
) {
  auditStatus = "Not Ready for Review";
} else if (
  hasReviewRequired ||
  hasInsufficientEvidenceSection ||
  evidenceReadinessScore < 90 ||
  overallScore < 90
) {
  auditStatus = "Review with Caution";
} else {
  auditStatus = "Ready for Review";
}
    const response: AuditResponse = {
      overallScore,
      evidenceReadinessScore,
      documentationAlignmentScore,
      auditStatus,
      criticalGaps,
      caseCompleteness: {
        expectedTeacherSurveys,
        completedTeacherSurveys,
        missingTeacherSurveys,
        blankDocuments,
        placeholderResponses,
      },
      overallSummary:
        parsedResponse.overallSummary ||
        `${auditStatus} based on ${criticalGaps.length > 0 ? "significant" : "limited"} evidence gaps and document alignment findings.`,
      documentReviews: normalizedDocumentReviews,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Audit API error:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OpenAI request failed." },
      { status: 502 }
    );
  }
}
