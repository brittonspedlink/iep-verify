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
    return "review_finding";
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "verified" ||
    normalized === "pass" ||
    normalized === "supported" ||
    normalized === "ready"
  ) {
    return "verified";
  }

  if (
    normalized === "not_provided" ||
    normalized === "not provided" ||
    normalized === "not evaluated" ||
    normalized === "missing"
  ) {
    return "not_provided";
  }

  if (
    normalized === "concern" ||
    normalized === "review_finding" ||
    normalized === "warning" ||
    normalized === "weakly supported" ||
    normalized === "weakly-supported" ||
    normalized === "review with caution"
  ) {
    return "review_finding";
  }

  return "review_finding";
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
  const expectedTeacherSurveys = Number(payload.expectedTeacherSurveyCount ?? 0);
  const completedTeacherSurveys = Number(payload.completedTeacherSurveyCount ?? 0);
  const teacherGap = Math.max(expectedTeacherSurveys - completedTeacherSurveys, 0);

  const sourceEvidenceFields = [
    ["teacherSurvey", payload.teacherSurvey],
    ["parentSurvey", payload.parentSurvey],
    ["studentSurvey", payload.studentSurvey],
    ["caseNotes", payload.caseNotes],
  ] as Array<[string, unknown]>;

  const documentFields = [
    ["plaafp", payload.plaafp],
    ["vision", payload.vision],
    ["goals", payload.goals],
    ["accommodations", payload.accommodations],
    ["services", payload.services],
    ["recommendedTeks", payload.recommendedTeks],
  ] as Array<[string, unknown]>;

  let readinessScore = 100;

  if (expectedTeacherSurveys > 0) {
    readinessScore -= Math.min(teacherGap * 15, 45);
  }

  sourceEvidenceFields.forEach(([, value]) => {
    if (!isMeaningfulText(value)) {
      readinessScore -= 10;
    } else if (isPlaceholderLike(value)) {
      readinessScore -= 5;
    }
  });

  documentFields.forEach(([, value]) => {
    if (!isMeaningfulText(value)) {
      readinessScore -= 6;
    }
  });

  const placeholderResponses = sourceEvidenceFields.filter(([, value]) => isPlaceholderLike(value));
  readinessScore -= placeholderResponses.length * 4;

  return Math.max(0, Math.min(100, Math.round(readinessScore)));
}

function collectCriticalGaps(payload: Record<string, unknown>, evidenceReadinessScore: number) {
  const gaps: string[] = [];
  const sourceEvidence = [
    ["teacherSurvey", payload.teacherSurvey],
    ["parentSurvey", payload.parentSurvey],
    ["studentSurvey", payload.studentSurvey],
    ["caseNotes", payload.caseNotes],
  ] as Array<[string, unknown]>;

  const documentFields = [
    ["PLAAFP", payload.plaafp],
    ["Vision", payload.vision],
    ["Goals", payload.goals],
    ["Accommodations", payload.accommodations],
    ["Services", payload.services],
    ["Recommended TEKS", payload.recommendedTeks],
  ] as Array<[string, unknown]>;

  const anySourceEvidence = sourceEvidence.some(([, value]) => isMeaningfulText(value) && !isPlaceholderLike(value));
  if (!anySourceEvidence) {
    gaps.push("No usable source evidence was provided for the review.");
  }

  const parentSurvey = payload.parentSurvey;
  if (!isMeaningfulText(parentSurvey) || isPlaceholderLike(parentSurvey)) {
    gaps.push("Parent survey evidence is missing or incomplete.");
  }

  const studentSurvey = payload.studentSurvey;
  if (!isMeaningfulText(studentSurvey) || isPlaceholderLike(studentSurvey)) {
    gaps.push("Student survey evidence is missing or incomplete.");
  }

  const caseNotes = payload.caseNotes;
  if (!isMeaningfulText(caseNotes) || isPlaceholderLike(caseNotes)) {
    gaps.push("Case notes are missing or incomplete.");
  }

  const blankDocuments = documentFields.filter(([, value]) => !isMeaningfulText(value)).map(([label]) => label);
  if (blankDocuments.length > 0) {
    gaps.push(`Blank document sections detected: ${blankDocuments.join(", ")}.`);
  }

  const combinedSourceEvidence = sourceEvidence
    .filter(([, value]) => isMeaningfulText(value))
    .map(([, value]) => String(value))
    .join(" ")
    .toLowerCase();

  if (!isMeaningfulText(payload.accommodations) && /difficulty|barrier|organization|attention|focus|support|classroom/i.test(combinedSourceEvidence)) {
    gaps.push("Accommodations are blank even though the source evidence suggests support needs.");
  }

  if (!isMeaningfulText(payload.services) && /service|support|intervention|therapy|instruction|communication|behavior/i.test(combinedSourceEvidence)) {
    gaps.push("Services are blank even though the source evidence suggests service needs.");
  }

  if (evidenceReadinessScore < 60) {
    gaps.push("Evidence readiness is too weak for a strong alignment review.");
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
          content: `You are conducting an evidence-alignment audit for generated IEP documentation. Compare the source evidence to the generated documents and focus only on evidence alignment. Treat the source evidence as the comparison baseline. SOURCE EVIDENCE: teacherSurvey, parentSurvey, studentSurvey, caseNotes. DOCUMENTS TO VERIFY: plaafp, vision, goals, accommodations, services, recommendedTeks. Your job is to identify what content in each generated document is supported by the source evidence, what important evidence is missing from the generated document, what statements appear unsupported by the source evidence, what conflicts or inconsistencies exist, and what specific revision would improve evidence alignment.

SPEDLINK-GENERATED ACCOMMODATIONS
<<<ACCOMMODATIONS_START>>>
${accommodations || "Not provided"}
<<<ACCOMMODATIONS_END>>>

SPEDLINK-GENERATED SERVICES RECOMMENDATIONS
<<<SERVICES_START>>>
${services || "Not provided"}
<<<SERVICES_END>>>

Accommodation Validation:
- For each generated accommodation: identify the documented need it addresses, identify the source evidence supporting it, determine whether it is supported, weakly supported, or unsupported, and identify important evidence-supported accommodations that SpedLink may have omitted.
- Do not recommend accommodations solely because they are common for a disability category.
- Do not infer effectiveness unless effectiveness is described in the source evidence.
- Flag accommodation without documented need, accommodation without supporting evidence, evidence-supported accommodation omitted by SpedLink, duplicate or materially overlapping accommodation, and accommodation stated more broadly than the evidence supports.

Services Validation:
- For each generated service recommendation: identify the documented need it addresses, identify the source evidence supporting it, identify any generated goal connected to the same need, determine whether the recommendation is supported, weakly supported, or unsupported, and identify significant documented needs that may not be addressed by a service recommendation.
- Do not evaluate actual service delivery, service logs, missed sessions, provider compliance, start date, frequency, duration, location, or implementation fidelity.
- Flag service recommendation without documented need, service recommendation without supporting evidence, significant need without a corresponding service consideration, service recommendation inconsistent with the PLAAFP or goals, and recommendation that states implementation details not present in the source evidence.
- If implementation details are absent, do not reduce the SpedLink validation score merely because they are unavailable.

Do not evaluate legal compliance. Do not make legal conclusions. Do not infer eligibility requirements. Do not recommend new services, accommodations, goals, or programming unless the source evidence explicitly supports them. Do not criticize missing cognitive, eligibility, evaluation, or assessment information unless that information is explicitly present in the source evidence and omitted or contradicted in the generated document. If a document field is blank, state that no alignment review can be completed for that document and identify relevant source evidence that may belong there. If source responses contain placeholders like Test, incomplete answers, or unanswered questions, identify them as weak or incomplete source evidence rather than meaningful student information. If critical evidence is missing or incomplete, lower the document scores materially. Do not infer facts not explicitly present. Do not include broad best-practice advice unrelated to the submitted evidence. Keep every finding specific to the submitted student. Return valid JSON with this exact shape: {\"overallScore\": number, \"overallSummary\": string, \"documentReviews\": {\"plaafp\": {\"score\": number | null, \"status\": string, \"mainIssue\": string, \"supportedContent\": string[], \"missingEvidence\": string[], \"unsupportedStatements\": string[], \"conflicts\": string[], \"omittedRecommendations\": string[], \"recommendedRevisions\": string[], \"findings\": {\"severity\": string, \"title\": string, \"explanation\": string, \"evidence\": string[], \"recommendation\": string}[]}, \"vision\": {\"score\": number | null, \"status\": string, \"mainIssue\": string, \"supportedContent\": string[], \"missingEvidence\": string[], \"unsupportedStatements\": string[], \"conflicts\": string[], \"omittedRecommendations\": string[], \"recommendedRevisions\": string[], \"findings\": {\"severity\": string, \"title\": string, \"explanation\": string, \"evidence\": string[], \"recommendation\": string}[]}, \"goals\": {\"score\": number | null, \"status\": string, \"mainIssue\": string, \"supportedContent\": string[], \"missingEvidence\": string[], \"unsupportedStatements\": string[], \"conflicts\": string[], \"omittedRecommendations\": string[], \"recommendedRevisions\": string[], \"findings\": {\"severity\": string, \"title\": string, \"explanation\": string, \"evidence\": string[], \"recommendation\": string}[]}, \"accommodations\": {\"score\": number | null, \"status\": string, \"mainIssue\": string, \"supportedContent\": string[], \"missingEvidence\": string[], \"unsupportedStatements\": string[], \"conflicts\": string[], \"omittedRecommendations\": string[], \"recommendedRevisions\": string[], \"findings\": {\"severity\": string, \"title\": string, \"explanation\": string, \"evidence\": string[], \"recommendation\": string}[]}, \"services\": {\"score\": number | null, \"status\": string, \"mainIssue\": string, \"supportedContent\": string[], \"missingEvidence\": string[], \"unsupportedStatements\": string[], \"conflicts\": string[], \"omittedRecommendations\": string[], \"recommendedRevisions\": string[], \"findings\": {\"severity\": string, \"title\": string, \"explanation\": string, \"evidence\": string[], \"recommendation\": string}[]}, \"recommendedTeks\": {\"score\": number | null, \"status\": string, \"mainIssue\": string, \"supportedContent\": string[], \"missingEvidence\": string[], \"unsupportedStatements\": string[], \"conflicts\": string[], \"omittedRecommendations\": string[], \"recommendedRevisions\": string[], \"findings\": {\"severity\": string, \"title\": string, \"explanation\": string, \"evidence\": string[], \"recommendation\": string}[]}}}.`
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
    const documentScores = Object.values(documentReviews)
  .map((review) => (review as Record<string, unknown>).score)
  .filter((score): score is number => typeof score === "number")
  .map((score) => (score <= 10 ? score * 10 : score));
    const documentationAlignmentScore = documentScores.length
      ? Math.round(documentScores.reduce((sum, score) => sum + score, 0) / documentScores.length)
      : 0;

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


    let overallScore = Math.round(evidenceReadinessScore * 0.6 + documentationAlignmentScore * 0.4);

    if (missingTeacherSurveys >= 1) {
      overallScore = Math.min(overallScore, 75);
    }

    if (missingTeacherSurveys >= 2) {
      overallScore = Math.min(overallScore, 50);
    }

    const evidenceText = [payload.teacherSurvey, payload.parentSurvey, payload.studentSurvey, payload.caseNotes]
      .filter(isMeaningfulText)
      .join(" ")
      .toLowerCase();

    if (!isMeaningfulText(payload.accommodations) && /difficulty|barrier|organization|attention|focus|support|classroom/i.test(evidenceText)) {
      overallScore = Math.min(overallScore, 45);
    }

    if (!isMeaningfulText(payload.services) && /service|support|intervention|therapy|instruction|communication|behavior/i.test(evidenceText)) {
      overallScore = Math.min(overallScore, 45);
    }

    if (!isMeaningfulText(payload.accommodations) && !isMeaningfulText(payload.services) && /difficulty|barrier|organization|attention|focus|support|service|intervention|therapy|instruction|communication|behavior/i.test(evidenceText)) {
      overallScore = Math.min(overallScore, 35);
    }

    let auditStatus: AuditResponse["auditStatus"];

if (overallScore >= 85) {
  auditStatus = "Ready for Review";
} else if (overallScore >= 70) {
  auditStatus = "Review with Caution";
} else {
  auditStatus = "Not Ready for Review";
}

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
        const status = isNotProvided
          ? "not_provided"
          : typeof reviewValue.status === "string"
            ? reviewValue.status
            : "Review with Caution";
        const mainIssue = typeof reviewValue.mainIssue === "string"
          ? reviewValue.mainIssue
          : isNotProvided
            ? `No generated ${key === "accommodations" ? "accommodations" : "services"} were provided.`
            : missingEvidence.length
              ? "Important evidence is missing."
              : "No major alignment concerns were identified.";

        return [key, {
          score,
         status:
  score === null
    ? "not_provided"
    : score >= 85
      ? "verified"
      : score >= 70
        ? "review_finding"
        : "not_ready",
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
