import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import OpenAI from "openai";
import mammoth from "mammoth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";


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
  const sectionDefinitions = [
    {
      key: "fie_summary",
      label: "FIE / Evaluation Summary",
      patterns: [
        /FIE\s+SUMMARY/i,
        /FULL\s+INDIVIDUAL.*EVALUATION/i,
        /EVALUATION\s+SUMMARY/i,
      ],
    },
    {
      key: "plaafp",
      label: "PLAAFP",
      patterns: [
        /PLAAFP/i,
        /PRESENT\s+LEVELS?\s+OF\s+ACADEMIC/i,
        /PRESENT\s+LEVELS?\s+OF\s+ACADEMIC\s+ACHIEVEMENT/i,
      ],
    },
    {
  key: "vision",
  label: "Vision",
  patterns: [
    /^\s*VISION\s*$/im,
    /^\s*VISION\s*\/\s*ANNUAL\s+EDUCATIONAL\s+DIRECTION\s*$/im,
    /^\s*ANNUAL\s+EDUCATIONAL\s+DIRECTION\s*$/im,
  ],
},
    {
      key: "annual_goals",
      label: "Annual Goals",
      patterns: [
        /ANNUAL\s+GOALS?/i,
        /MEASURABLE\s+ANNUAL\s+GOALS?/i,
        /IEP\s+GOALS?/i,
      ],
    },
    {
      key: "accommodations",
      label: "Accommodations",
      patterns: [
        /ACCOMMODATIONS?/i,
        /SUPPLEMENTARY\s+AIDS/i,
        /CLASSROOM\s+ACCOMMODATIONS?/i,
      ],
    },
{
  key: "services",
  label: "Services",
  patterns: [
    /^\s*SERVICES\s*$/im,
    /SPECIAL\s+EDUCATION\s+SERVICES/i,
    /RELATED\s+SERVICES/i,
    /SERVICES\s+AND\s+SUPPORTS/i,
  ],
},
   {
  key: "recommended_teks",
  label: "Recommended TEKS",
  patterns: [
    /^\s*RECOMMENDED\s+TEKS(?:\s+ALIGNMENT)?\s*$/im,
    /^\s*TEKS\s+ALIGNMENT\s*$/im,
    /^\s*RECOMMENDED\s+STANDARDS\s*$/im,
  ],
},
{
  key: "progress_monitoring",
  label: "Progress Monitoring",
  patterns: [
    /^\s*PROGRESS\s+DATA\s*$/im,
    /^\s*PROGRESS\s+MONITORING\s*$/im,
    /^\s*PROGRESS\s+REPORTING\s*$/im,
  ],
},
{
  key: "transition",
  label: "Transition",
  patterns: [
    /^\s*TRANSITION\s*$/im,
    /^\s*TRANSITION\s+SERVICES\s*$/im,
    /POSTSECONDARY/i,
    /POST-SECONDARY/i,
  ],
},
  ];

  const matches = sectionDefinitions
    .map((section) => {
      let firstIndex = -1;

      for (const pattern of section.patterns) {
        const match = rawText.match(pattern);

        if (match?.index !== undefined) {
          if (firstIndex === -1 || match.index < firstIndex) {
            firstIndex = match.index;
          }
        }
      }

      return {
        ...section,
        index: firstIndex,
      };
    })
    .filter((section) => section.index >= 0)
    .sort((a, b) => a.index - b.index);

  const detectedText = new Map<string, string>();

  matches.forEach((section, index) => {
    const nextSection = matches[index + 1];

    const end =
      nextSection?.index !== undefined
        ? nextSection.index
        : rawText.length;

    detectedText.set(
      section.key,
      rawText.slice(section.index, end).trim()
    );
  });

  return sectionDefinitions.map((section) => ({
    key: section.key,
    label: section.label,
    found: detectedText.has(section.key),
    text: detectedText.get(section.key) ?? "",
  }));
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
    if (!primaryFile?.path) {
      return NextResponse.json(
        { error: "No primary IEP document is attached to this audit." },
        { status: 400 }
      );
    }

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

const arrayBuffer = await fileBlob.arrayBuffer();
const pdfData = new Uint8Array(arrayBuffer);

const pdf = await getDocumentProxy(pdfData);

const { totalPages, text } = await extractText(pdf, {
  mergePages: true,
});

const rawText = text.trim();
const detectedSections = detectIepSections(rawText);

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

  teacherSurvey: [
    sourceInput.evidenceText?.teacherSurvey ?? "",
    classifiedCombinedSurvey.teacherSurvey,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n\n")
    .trim(),

  parentSurvey: [
    sourceInput.evidenceText?.parentSurvey ?? "",
    classifiedCombinedSurvey.parentSurvey,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n\n")
    .trim(),

  studentSurvey: [
    sourceInput.evidenceText?.studentSurvey ?? "",
    classifiedCombinedSurvey.studentSurvey,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n\n")
    .trim(),
},
      extracted: {
        ...(sourceInput.extracted ?? {}),
primaryIep: {
  text: rawText,
  pageCount: totalPages,
  extractedAt: new Date().toISOString(),
  fileName: primaryFile.name,
  filePath: primaryFile.path,
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
      fileName: primaryFile.name,
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