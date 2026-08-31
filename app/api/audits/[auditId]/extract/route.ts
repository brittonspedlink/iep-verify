import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import OpenAI from "openai";
import mammoth from "mammoth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const mathWithSumPrecise = Math as typeof Math & {
  sumPrecise?: (values: Iterable<number>) => number;
};

if (typeof mathWithSumPrecise.sumPrecise !== "function") {
  mathWithSumPrecise.sumPrecise = (values: Iterable<number>) => {
    let total = 0;

    for (const value of values) {
      total += value;
    }

    return total;
  };
}


type StoredFileMetadata = {
  name: string;
  path: string;
  size?: number;
  type?: string;
};

type DetectedSection = {
  key: string;
  label: string;
  found: boolean;
  text: string;
};

async function extractStoredEvidenceFile(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  file: StoredFileMetadata
) {
  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from("audit-documents")
    .download(file.path);

  if (downloadError || !fileBlob) {
    throw new Error(`Unable to download ${file.name}.`);
  }

  const extension = file.name.toLowerCase();

  if (extension.endsWith(".pdf")) {
    const arrayBuffer = await fileBlob.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);
    const pdf = await getDocumentProxy(pdfData);

    const { text } = await extractText(pdf, {
      mergePages: true,
    });

    return text.trim();
  }

if (extension.endsWith(".docx")) {
  const arrayBuffer = await fileBlob.arrayBuffer();

  const result = await mammoth.extractRawText({
    buffer: Buffer.from(arrayBuffer),
  });

  return result.value.trim();
}

  throw new Error(`Unsupported file type for ${file.name}.`);
}
async function classifyCombinedSurveyEvidence(rawText: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !rawText.trim()) {
    return {
      teacherSurvey: "",
      parentSurvey: "",
      studentSurvey: "",
    };
  }

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: `Classify combined special education survey evidence into teacher, parent, and student survey evidence.

Use only the text provided.

Preserve the original questions, responses, observations, and wording as closely as possible.

Do not invent information.
Do not summarize away meaningful details.
Do not place the same evidence into multiple categories unless the source clearly applies to more than one respondent.
If a category is not present, return an empty string.

Return valid JSON only with this exact shape:
{
  "teacherSurvey": "string",
  "parentSurvey": "string",
  "studentSurvey": "string"
}`,
      },
      {
        role: "user",
        content: rawText,
      },
    ],
  });

  const responseText = response.output_text?.trim() ?? "";

  if (!responseText) {
    return {
      teacherSurvey: "",
      parentSurvey: "",
      studentSurvey: "",
    };
  }

  const cleaned = responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as {
    teacherSurvey?: string;
    parentSurvey?: string;
    studentSurvey?: string;
  };

  return {
    teacherSurvey: parsed.teacherSurvey?.trim() ?? "",
    parentSurvey: parsed.parentSurvey?.trim() ?? "",
    studentSurvey: parsed.studentSurvey?.trim() ?? "",
  };
}
function detectIepSections(rawText: string): DetectedSection[] {
  type LineEntry = {
    text: string;
    index: number;
  };

  type TopLevelDefinition = {
    key: string;
    label: string;
    patterns: RegExp[];
  };

const normalizeLine = (value: string) =>
  value
    .replace(/\u00a0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const buildLineEntries = (text: string): LineEntry[] => {
    const lines = text.split(/\r?\n/);
    let cursor = 0;

    return lines.map((line) => {
      const locatedIndex = text.indexOf(line, cursor);
      const index = locatedIndex >= 0 ? locatedIndex : cursor;

      cursor = index + line.length;

      while (
        cursor < text.length &&
        (text[cursor] === "\r" || text[cursor] === "\n")
      ) {
        cursor += 1;
      }

      return {
        text: normalizeLine(line),
        index,
      };
    });
  };

  const matchesAny = (text: string, patterns: RegExp[]) =>
    patterns.some((pattern) => pattern.test(text));

  const topLevelDefinitions: TopLevelDefinition[] = [
    {
  key: "case_manager_notes",
  label: "Case Manager Notes",
  patterns: [
    /^CASE\s+MANAGER\s+NOTES?$/i,
    /^CASE\s+MANAGER\s+SUMMARY$/i,
    /^CASE\s+MANAGER\s+INPUT$/i,
  ],
},
    {
      key: "fie_summary",
      label: "FIE Summary",
      patterns: [
        /^FIE\s+SUMMARY(?:\s+STATEMENT)?$/i,
        /^(?:FULL\s+AND\s+INDIVIDUAL|FULL\s+INDIVIDUAL)\s+EVALUATION\s+SUMMARY$/i,
        /^EVALUATION\s+SUMMARY$/i,
      ],
    },
    {
      key: "plaafp",
      label: "PLAAFP",
      patterns: [
        /^PLAAFP$/i,
        /^PRESENT\s+LEVELS?\s+OF\s+ACADEMIC\s+ACHIEVEMENT\s+AND\s+FUNCTIONAL\s+PERFORMANCE$/i,
        /^PRESENT\s+LEVELS?\s+OF\s+ACADEMIC\s+ACHIEVEMENT$/i,
      ],
    },
    {
      key: "vision",
      label: "Vision",
      patterns: [
        /^VISION$/i,
        /^VISION\s*\/\s*TRANSITION$/i,
        /^VISION\s*\/\s*ANNUAL\s+EDUCATIONAL\s+DIRECTION$/i,
        /^ANNUAL\s+EDUCATIONAL\s+DIRECTION$/i,
      ],
    },
    {
      key: "annual_goals",
      label: "Annual Goals",
      patterns: [
        /^ANNUAL\s+IEP\s+GOALS?$/i,
        /^ANNUAL\s+GOALS?$/i,
        /^MEASURABLE\s+ANNUAL\s+GOALS?$/i,
        /^IEP\s+GOALS?$/i,
      ],
    },
    {
      key: "accommodations",
      label: "Accommodations",
      patterns: [
        /^ACCOMMODATIONS?$/i,
        /^CLASSROOM\s+ACCOMMODATIONS?$/i,
      ],
    },
    {
      key: "services",
      label: "Services",
      patterns: [
        /^SERVICES$/i,
        /^SPECIAL\s+EDUCATION\s+SERVICES$/i,
        /^RELATED\s+SERVICES$/i,
        /^SERVICES\s+AND\s+SUPPORTS$/i,
      ],
    },
    {
      key: "recommended_teks",
      label: "Recommended TEKS",
      patterns: [
        /^RECOMMENDED\s+TEKS(?:\s+ALIGNMENT)?$/i,
        /^TEKS\s+ALIGNMENT$/i,
        /^RECOMMENDED\s+STANDARDS$/i,
      ],
    },
  ];

  const lineEntries = buildLineEntries(rawText);

  const topLevelMatches: Array<
    TopLevelDefinition & { index: number }
  > = [];

  for (const section of topLevelDefinitions) {
    const heading = lineEntries.find((entry) =>
      matchesAny(entry.text, section.patterns)
    );

    if (heading) {
      topLevelMatches.push({
        ...section,
        index: heading.index,
      });
    }
  }

  topLevelMatches.sort((a, b) => a.index - b.index);

  const topLevelText = new Map<string, string>();

  topLevelMatches.forEach((section, index) => {
    const nextSection = topLevelMatches[index + 1];

    const end =
      nextSection?.index !== undefined
        ? nextSection.index
        : rawText.length;

    topLevelText.set(
      section.key,
      rawText.slice(section.index, end).trim()
    );
  });

  const getTopLevelText = (key: string) =>
    topLevelText.get(key) ?? "";

const extractNestedSection = (
  parentText: string,
  startPatterns: RegExp[],
  endPatterns: RegExp[]
) => {
  if (!parentText.trim()) {
    return "";
  }

  const searchableText = parentText
    .replace(/\u00a0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, " ");

  const findFirstIndex = (
    patterns: RegExp[],
    startAt = 0
  ) => {
    let firstIndex = -1;

    const textToSearch = searchableText.slice(startAt);

    for (const pattern of patterns) {
      const flags = pattern.flags
        .replace(/g/g, "")
        .includes("m")
        ? pattern.flags.replace(/g/g, "")
        : `${pattern.flags.replace(/g/g, "")}m`;

      const regex = new RegExp(pattern.source, flags);
      const match = regex.exec(textToSearch);

      if (match?.index !== undefined) {
        const absoluteIndex = startAt + match.index;

        if (
          firstIndex === -1 ||
          absoluteIndex < firstIndex
        ) {
          firstIndex = absoluteIndex;
        }
      }
    }

    return firstIndex;
  };

  const startIndex = findFirstIndex(startPatterns);

  if (startIndex < 0) {
    return "";
  }

  let endIndex = parentText.length;

  for (const pattern of endPatterns) {
    const candidateIndex = findFirstIndex(
      [pattern],
      startIndex + 1
    );

    if (
      candidateIndex >= 0 &&
      candidateIndex < endIndex
    ) {
      endIndex = candidateIndex;
    }
  }

  return parentText
    .slice(startIndex, endIndex)
    .trim();
};

  const firstTopLevelIndex =
    topLevelMatches[0]?.index ?? rawText.length;

  const headerText = rawText.slice(0, firstTopLevelIndex);
  const headerLines = buildLineEntries(headerText);

  const studentInformation = headerLines
    .filter(
      (entry) =>
        /^STUDENT\s*:/i.test(entry.text) ||
        /^GENERATED\s*:/i.test(entry.text)
    )
    .map((entry) => entry.text)
    .join("\n")
    .trim();

  const plaafpText = getTopLevelText("plaafp");

const eligibilityText = extractNestedSection(
  plaafpText,
  [
    /ELIGIBILITY\s*\/\s*FIE\s*\/\s*COGNITIVE/i,
    /ELIGIBILITY\s*\/\s*FIE/i,
  ],
  [
    /LANGUAGE\s*\/\s*COMMUNICATION/i,
    /EMOTIONAL\s*\/\s*BEHAVIORAL\s*\/\s*SOCIAL/i,
    /PHYSICAL\s*\/\s*MOTOR/i,
    /ACADEMIC\s*\/\s*FUNCTIONAL\s+PERFORMANCE/i,
    /\bTRANSITION\b/i,
    /NEEDS\s+CRITICAL\s+IN\s+NATURE/i,
    /IMPACT\s+ON\s+GENERAL\s+EDUCATION\s+CURRICULUM/i,
    /ACCOMMODATIONS\s*\/\s*SUPPORTS/i,
  ]
);

const visionText = getTopLevelText("vision");

const transitionText = extractNestedSection(
  plaafpText,
  [
    /\bTRANSITION\b/i,
  ],
  [
    /NEEDS\s+CRITICAL\s+IN\s+NATURE/i,
    /IMPACT\s+ON\s+GENERAL\s+EDUCATION\s+CURRICULUM/i,
    /ACCOMMODATIONS\s*\/\s*SUPPORTS/i,
  ]
);

const annualGoalsText = getTopLevelText("annual_goals");

const progressMonitoringParts: string[] = [];
let currentGoalTitle = "";

for (const line of annualGoalsText.split(/\r?\n/)) {
  const trimmed = normalizeLine(line);

  if (!trimmed) {
    continue;
  }

  if (
    /\bGOAL$/i.test(trimmed) &&
    !/^ANNUAL\s+(?:IEP\s+)?GOALS?$/i.test(trimmed)
  ) {
    currentGoalTitle = trimmed;
  }

  const progressIndex = trimmed.search(
    /\bPROGRESS\s+MONITORING\b/i
  );

  if (progressIndex >= 0) {
    const progressText = trimmed
      .slice(progressIndex)
      .trim();

    progressMonitoringParts.push(
      currentGoalTitle
        ? `${currentGoalTitle}\n${progressText}`
        : progressText
    );
  }
}

const progressMonitoringText =
  progressMonitoringParts.join("\n\n").trim();

  const sectionResults: DetectedSection[] = [
    {
  key: "case_manager_notes",
  label: "Case Manager Notes",
  found: Boolean(getTopLevelText("case_manager_notes")),
  text: getTopLevelText("case_manager_notes"),
},
    {
      key: "student_information",
      label: "Student Information",
      found: Boolean(studentInformation),
      text: studentInformation,
    },
    {
      key: "eligibility",
      label: "Eligibility",
      found: Boolean(eligibilityText),
      text: eligibilityText,
    },
    {
      key: "fie_summary",
      label: "FIE Summary",
      found: Boolean(getTopLevelText("fie_summary")),
      text: getTopLevelText("fie_summary"),
    },
    {
      key: "plaafp",
      label: "PLAAFP",
      found: Boolean(plaafpText),
      text: plaafpText,
    },
    {
      key: "vision",
      label: "Vision",
      found: Boolean(visionText),
      text: visionText,
    },
    {
      key: "annual_goals",
      label: "Annual Goals",
      found: Boolean(annualGoalsText),
      text: annualGoalsText,
    },
    {
      key: "accommodations",
      label: "Accommodations",
      found: Boolean(getTopLevelText("accommodations")),
      text: getTopLevelText("accommodations"),
    },
    {
      key: "services",
      label: "Services",
      found: Boolean(getTopLevelText("services")),
      text: getTopLevelText("services"),
    },
    {
      key: "recommended_teks",
      label: "Recommended TEKS",
      found: Boolean(getTopLevelText("recommended_teks")),
      text: getTopLevelText("recommended_teks"),
    },
    {
      key: "transition",
      label: "Transition",
      found: Boolean(transitionText),
      text: transitionText,
    },
    {
      key: "progress_monitoring",
      label: "Progress Monitoring",
      found: Boolean(progressMonitoringText),
      text: progressMonitoringText,
    },
  ];

  return sectionResults;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await context.params;

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select("id, owner_user_id, source_input")
      .eq("id", auditId)
      .single();

    if (auditError || !audit) {
      console.error("Audit lookup error:", auditError);

      return NextResponse.json(
        { error: "Audit not found." },
        { status: 404 }
      );
    }

    if (audit.owner_user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const sourceInput = audit.source_input ?? {};

    const primaryFile =
      sourceInput?.files?.primary as StoredFileMetadata | null | undefined;
    const pastedPrimaryText =
  typeof sourceInput?.primaryText === "string"
    ? sourceInput.primaryText.trim()
    : "";  
    const combinedSurveyFiles =
  (sourceInput?.files?.combinedSurvey as StoredFileMetadata[] | undefined) ?? [];

    const combinedSurveyText =
  typeof sourceInput?.evidenceText?.combinedSurvey === "string"
    ? sourceInput.evidenceText.combinedSurvey.trim()
    : "";
    
const extractedCombinedSurveyParts: string[] = [];

if (combinedSurveyText) {
  extractedCombinedSurveyParts.push(combinedSurveyText);
}

for (const file of combinedSurveyFiles) {
  const extractedText = await extractStoredEvidenceFile(supabase, file);

  if (extractedText) {
    extractedCombinedSurveyParts.push(extractedText);
  }
}

const combinedSurveyEvidence = extractedCombinedSurveyParts
  .join("\n\n")
  .trim();
const classifiedCombinedSurvey =
  combinedSurveyEvidence.length > 0
    ? await classifyCombinedSurveyEvidence(combinedSurveyEvidence)
    : {
        teacherSurvey: "",
        parentSurvey: "",
        studentSurvey: "",
      };
if (!primaryFile?.path && !pastedPrimaryText) {
  return NextResponse.json(
    { error: "No primary IEP document or pasted IEP text was provided." },
    { status: 400 }
  );
}

let rawText = "";
let totalPages = 0;
let primaryFileName = "Pasted IEP";
let primaryFilePath: string | null = null;

if (primaryFile?.path) {
  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from("audit-documents")
    .download(primaryFile.path);

  if (downloadError || !fileBlob) {
    console.error("Primary document download error:", downloadError);

    return NextResponse.json(
      { error: "Unable to download the primary IEP document." },
      { status: 500 }
    );
  }

  const extension = primaryFile.name.toLowerCase();

  if (extension.endsWith(".docx")) {
    const arrayBuffer = await fileBlob.arrayBuffer();

    const result = await mammoth.extractRawText({
      buffer: Buffer.from(arrayBuffer),
    });

    rawText = result.value.trim();
  } else {
    const arrayBuffer = await fileBlob.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);

    const pdf = await getDocumentProxy(pdfData);

    const extracted = await extractText(pdf, {
      mergePages: true,
    });

    totalPages = extracted.totalPages;
    rawText = extracted.text.trim();
  }

  primaryFileName = primaryFile.name;
  primaryFilePath = primaryFile.path;
} else {
  rawText = pastedPrimaryText;
}
console.log("RAW TEXT LENGTH:", rawText.length);
console.log("RAW TEXT PREVIEW:");
console.log(rawText.slice(0, 3000));

const detectedSections = detectIepSections(rawText);
const detectedCaseManagerNotes =
  detectedSections.find(
    (section) => section.key === "case_manager_notes"
  )?.text ?? "";
console.table(
  detectedSections.map((section) => ({
    section: section.key,
    found: section.found,
    characters: section.text.length,
  }))
);

    if (!rawText) {
      return NextResponse.json(
        {
          error:
            "No readable text was found in the PDF. The document may require OCR.",
        },
        { status: 422 }
      );
    }

const updatedSourceInput = {
  ...sourceInput,
  evidenceText: {
    ...(sourceInput.evidenceText ?? {}),

    teacherSurvey:
      combinedSurveyEvidence.length > 0
        ? classifiedCombinedSurvey.teacherSurvey
        : sourceInput.evidenceText?.teacherSurvey ?? "",

    parentSurvey:
      combinedSurveyEvidence.length > 0
        ? classifiedCombinedSurvey.parentSurvey
        : sourceInput.evidenceText?.parentSurvey ?? "",

    studentSurvey:
      combinedSurveyEvidence.length > 0
        ? classifiedCombinedSurvey.studentSurvey
        : sourceInput.evidenceText?.studentSurvey ?? "",

    caseManagerNotes:
      sourceInput.evidenceText?.caseManagerNotes?.trim() ||
      detectedCaseManagerNotes,
  },
      extracted: {
        ...(sourceInput.extracted ?? {}),
primaryIep: {
  text: rawText,
  pageCount: totalPages,
  extractedAt: new Date().toISOString(),
  fileName: primaryFileName,
  filePath: primaryFilePath,
  detectedSections,
},
      },
    };

    const { error: updateError } = await supabase
      .from("audits")
      .update({
        source_input: updatedSourceInput,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", auditId);

    if (updateError) {
      console.error("Audit extraction save error:", updateError);

      return NextResponse.json(
        { error: "Text was extracted but could not be saved." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      auditId,
      fileName: primaryFileName,
      pageCount: totalPages,
      characterCount: rawText.length,
      preview: rawText.slice(0, 1000),
      detectedSections,
    });
  } catch (error) {
    console.error("Audit extraction route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to extract the IEP document.",
      },
      { status: 500 }
    );
  }
}