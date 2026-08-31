"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "@/lib/supabaseClient";

type SelectedFile = {
  id: string;
  file: File;
};
type StoredFileMetadata = {
  name: string;
  path: string;
  size: number;
  type: string;
};
type EvidenceKey =
  | "teacherSurvey"
  | "parentSurvey"
  | "studentSurvey"
  | "combinedSurvey"
  | "caseManagerNotes"
  | "fieEvaluation"
  | "progressData";

type EvidenceFiles = Record<EvidenceKey, SelectedFile[]>;
type EvidenceText = Record<EvidenceKey, string>;
type SavedEvidenceFiles = Record<EvidenceKey, StoredFileMetadata[]>;

type SavedSourceInput = {
  primaryText?: string;

  evidenceText?: Partial<EvidenceText>;

  files?: {
    primary?: StoredFileMetadata | null;
    teacherSurvey?: StoredFileMetadata[];
    parentSurvey?: StoredFileMetadata[];
    studentSurvey?: StoredFileMetadata[];
    combinedSurvey?: StoredFileMetadata[];
    caseManagerNotes?: StoredFileMetadata[];
    fieEvaluation?: StoredFileMetadata[];
    progressData?: StoredFileMetadata[];
  };

  metadata?: {
    auditName?: string;
    studentIdentifier?: string;
    gradeLevel?: string | null;
    auditType?: string;
  };

  expectedTeacherSurveyCount?: number;
  completedTeacherSurveyCount?: number;
};
type EvidenceDragging = Record<EvidenceKey, boolean>;
type AccordionState = Record<EvidenceKey, boolean>;

type EvidenceDefinition = {
  key: EvidenceKey;
  title: string;
  description: string;
  uploadInstructions: string;
  pastePlaceholder: string;
  badge: string;
  badgeClass: string;
};

const auditTypes = [
  "Annual IEP Review",
  "Initial IEP Review",
  "Reevaluation Review",
  "Amendment Review",
  "Other",
];

const acceptedFileTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const maxFileSize = 25 * 1024 * 1024;

const evidenceDefinitions: EvidenceDefinition[] = [
{
  key: "teacherSurvey",
  title: "Teacher Survey Evidence",
  description:
    "Upload or paste teacher survey questions, responses, observations, and classroom evidence used to inform the IEP.",
  uploadInstructions:
    "Upload one or more completed teacher survey documents.",
  pastePlaceholder:
    "Paste teacher survey questions and responses here. Include both prompts and responses whenever possible.",
  badge: "Required",
  badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
},
{
  key: "parentSurvey",
  title: "Parent Survey Evidence",
  description:
    "Upload or paste parent survey questions, responses, concerns, priorities, and family input used to inform the IEP.",
  uploadInstructions:
    "Upload one or more completed parent survey documents.",
  pastePlaceholder:
    "Paste parent survey questions and responses here. Include both prompts and responses whenever possible.",
  badge: "Optional",
  badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
},
{
  key: "studentSurvey",
  title: "Student Survey Evidence",
  description:
    "Upload or paste student survey questions, responses, preferences, strengths, needs, and student voice.",
  uploadInstructions:
    "Upload one or more completed student survey documents.",
  pastePlaceholder:
    "Paste student survey questions and responses here. Include both prompts and responses whenever possible.",
  badge: "Optional",
  badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
},
  {
    key: "combinedSurvey",
    title: "Combined Survey Evidence",
    description:
      "Upload or paste a document containing teacher, parent, and/or student survey responses.",
    uploadInstructions:
      "Upload one or more combined survey documents.",
    pastePlaceholder:
      "Paste combined teacher, parent, and student survey questions and responses here. Include respondent labels when available.",
    badge: "Optional",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
  },
  {
    key: "fieEvaluation",
    title: "FIE Summary or Evaluation Information",
    description:
      "Provide the FIE summary, evaluation report, or relevant evaluation information used in the IEP draft.",
    uploadInstructions:
      "Upload one or more FIE, evaluation, or assessment documents.",
    pastePlaceholder:
      "Paste the FIE summary or relevant evaluation information here.",
    badge: "Recommended",
    badgeClass: "border-blue-200 bg-blue-50 text-[#0a3d73]",
  },
  {
    key: "progressData",
    title: "Progress Data",
    description:
      "Provide progress reports, goal-progress records, probes, or other measurable performance data.",
    uploadInstructions:
      "Upload one or more progress reports, probes, or goal-progress documents.",
    pastePlaceholder:
      "Paste progress-monitoring data, goal progress, baselines, probes, or other measurable performance information.",
    badge: "Optional",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
  },
];

const initialEvidenceFiles: EvidenceFiles = {
  teacherSurvey: [],
  parentSurvey: [],
  studentSurvey: [],
  combinedSurvey: [],
  caseManagerNotes: [],
  fieEvaluation: [],
  progressData: [],
};
const initialSavedEvidenceFiles: SavedEvidenceFiles = {
  teacherSurvey: [],
  parentSurvey: [],
  studentSurvey: [],
  combinedSurvey: [],
  caseManagerNotes: [],
  fieEvaluation: [],
  progressData: [],
};
const initialEvidenceText: EvidenceText = {
  teacherSurvey: "",
  parentSurvey: "",
  studentSurvey: "",
  combinedSurvey: "",
  caseManagerNotes: "",
  fieEvaluation: "",
  progressData: "",
};

const initialEvidenceDragging: EvidenceDragging = {
  teacherSurvey: false,
  parentSurvey: false,
  studentSurvey: false,
  combinedSurvey: false,
  caseManagerNotes: false,
  fieEvaluation: false,
  progressData: false,
};

const initialAccordionState: AccordionState = {
  teacherSurvey: true,
  parentSurvey: false,
  studentSurvey: false,
  combinedSurvey: false,
  caseManagerNotes: false,
  fieEvaluation: false,
  progressData: false,
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createSelectedFile(file: File): SelectedFile {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
  };
}

function validateFile(file: File) {
  const hasAcceptedMimeType = acceptedFileTypes.includes(file.type);
  const fileName = file.name.toLowerCase();

  const hasAcceptedExtension =
    fileName.endsWith(".pdf") || fileName.endsWith(".docx");

  if (!hasAcceptedMimeType && !hasAcceptedExtension) {
    return `${file.name} must be a PDF or DOCX file.`;
  }

  if (file.size > maxFileSize) {
    return `${file.name} is larger than the 25 MB limit.`;
  }

  return "";
}

function UploadIEPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
const existingAuditId = searchParams.get("auditId");

const formRef = useRef<HTMLFormElement | null>(null);
const submitModeRef = useRef<"draft" | "process">("process");

const [savedAuditId, setSavedAuditId] = useState<string | null>(null);
  const [savedPrimaryDocument, setSavedPrimaryDocument] =
  useState<StoredFileMetadata | null>(null);

const [savedEvidenceFiles, setSavedEvidenceFiles] =
  useState<SavedEvidenceFiles>(initialSavedEvidenceFiles);

const [isLoadingDraft, setIsLoadingDraft] =
  useState(Boolean(existingAuditId));
  const primaryInputRef = useRef<HTMLInputElement | null>(null);

  const evidenceInputRefs = useRef<
    Partial<Record<EvidenceKey, HTMLInputElement | null>>
  >({});

  const [auditName, setAuditName] = useState("");
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [auditType, setAuditType] = useState(auditTypes[0]);

  const [primaryFile, setPrimaryFile] = useState<SelectedFile | null>(null);
  const [primaryText, setPrimaryText] = useState("");

  const [evidenceFiles, setEvidenceFiles] =
    useState<EvidenceFiles>(initialEvidenceFiles);

  const [evidenceText, setEvidenceText] =
    useState<EvidenceText>(initialEvidenceText);

  const [evidenceDragging, setEvidenceDragging] =
    useState<EvidenceDragging>(initialEvidenceDragging);

  const [accordionState, setAccordionState] =
    useState<AccordionState>(initialAccordionState);

  const [primaryDragging, setPrimaryDragging] = useState(false);

  const [expectedTeacherSurveyCount, setExpectedTeacherSurveyCount] =
    useState(0);

  const [completedTeacherSurveyCount, setCompletedTeacherSurveyCount] =
    useState(0);

const [errorMessage, setErrorMessage] = useState("");
const [statusMessage, setStatusMessage] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
  if (!existingAuditId) {
    setIsLoadingDraft(false);
    return;
  }

  let cancelled = false;

  async function loadSavedDraft() {
    setIsLoadingDraft(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const { data: audit, error: auditError } = await supabase
        .from("audits")
        .select(
          `
          id,
          audit_name,
          student_identifier,
          grade_level,
          audit_type,
          expected_teacher_survey_count,
          completed_teacher_survey_count,
          source_input
          `
        )
        .eq("id", existingAuditId)
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (auditError) {
        throw new Error(auditError.message);
      }

      if (!audit) {
        throw new Error("Saved audit draft was not found.");
      }

      const sourceInput =
        (audit.source_input as SavedSourceInput | null) ?? {};

      setAuditName(
        sourceInput.metadata?.auditName ??
          audit.audit_name ??
          ""
      );

      setStudentIdentifier(
        sourceInput.metadata?.studentIdentifier ??
          audit.student_identifier ??
          ""
      );

      setGradeLevel(
        sourceInput.metadata?.gradeLevel ??
          audit.grade_level ??
          ""
      );

      setAuditType(
        sourceInput.metadata?.auditType ??
          audit.audit_type ??
          auditTypes[0]
      );

      setPrimaryText(sourceInput.primaryText ?? "");

      setEvidenceText({
        teacherSurvey:
          sourceInput.evidenceText?.teacherSurvey ?? "",
        parentSurvey:
          sourceInput.evidenceText?.parentSurvey ?? "",
        studentSurvey:
          sourceInput.evidenceText?.studentSurvey ?? "",
        combinedSurvey:
          sourceInput.evidenceText?.combinedSurvey ?? "",
        caseManagerNotes:
          sourceInput.evidenceText?.caseManagerNotes ?? "",
        fieEvaluation:
          sourceInput.evidenceText?.fieEvaluation ?? "",
        progressData:
          sourceInput.evidenceText?.progressData ?? "",
      });

      setSavedPrimaryDocument(
        sourceInput.files?.primary ?? null
      );

      setSavedEvidenceFiles({
        teacherSurvey:
          sourceInput.files?.teacherSurvey ?? [],
        parentSurvey:
          sourceInput.files?.parentSurvey ?? [],
        studentSurvey:
          sourceInput.files?.studentSurvey ?? [],
        combinedSurvey:
          sourceInput.files?.combinedSurvey ?? [],
        caseManagerNotes:
          sourceInput.files?.caseManagerNotes ?? [],
        fieEvaluation:
          sourceInput.files?.fieEvaluation ?? [],
        progressData:
          sourceInput.files?.progressData ?? [],
      });

      setExpectedTeacherSurveyCount(
        sourceInput.expectedTeacherSurveyCount ??
          audit.expected_teacher_survey_count ??
          0
      );

      setCompletedTeacherSurveyCount(
        sourceInput.completedTeacherSurveyCount ??
          audit.completed_teacher_survey_count ??
          0
      );

      setSavedAuditId(audit.id);
      setStatusMessage("Draft loaded.");
    } catch (error) {
      if (cancelled) return;

      console.error("Draft load error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load the saved draft."
      );
    } finally {
      if (!cancelled) {
        setIsLoadingDraft(false);
      }
    }
  }

  loadSavedDraft();

  return () => {
    cancelled = true;
  };
}, [existingAuditId]);

function clearMessages() {
    setErrorMessage("");
    setStatusMessage("");
  }

  function toggleAccordion(key: EvidenceKey) {
    setAccordionState((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function addPrimaryFile(file: File) {
    const validationError = validateFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setPrimaryFile(createSelectedFile(file));
    clearMessages();
  }

  function addEvidenceFiles(key: EvidenceKey, files: File[]) {
    const selectedFiles: SelectedFile[] = [];

    for (const file of files) {
      const validationError = validateFile(file);

      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      selectedFiles.push(createSelectedFile(file));
    }

    setEvidenceFiles((current) => ({
      ...current,
      [key]: [...current[key], ...selectedFiles],
    }));

    clearMessages();
  }

  function handlePrimaryInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      addPrimaryFile(file);
    }

    event.target.value = "";
  }

  function handleEvidenceInput(
    key: EvidenceKey,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      addEvidenceFiles(key, files);
    }

    event.target.value = "";
  }

  function handlePrimaryDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setPrimaryDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      addPrimaryFile(file);
    }
  }

  function handleEvidenceDrop(
    key: EvidenceKey,
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setEvidenceDragging((current) => ({
      ...current,
      [key]: false,
    }));

    const files = Array.from(event.dataTransfer.files ?? []);

    if (files.length > 0) {
      addEvidenceFiles(key, files);
    }
  }

  function removeEvidenceFile(key: EvidenceKey, fileId: string) {
    setEvidenceFiles((current) => ({
      ...current,
      [key]: current[key].filter((item) => item.id !== fileId),
    }));

    clearMessages();
  }

  function handleEvidenceTextChange(key: EvidenceKey, value: string) {
    setEvidenceText((current) => ({
      ...current,
      [key]: value,
    }));

    clearMessages();
  }

function hasEvidenceContent(key: EvidenceKey) {
  return (
    evidenceFiles[key].length > 0 ||
    savedEvidenceFiles[key].length > 0 ||
    evidenceText[key].trim().length > 0
  );
}

function getEvidenceSummary(key: EvidenceKey) {
  const fileCount =
    evidenceFiles[key].length +
    savedEvidenceFiles[key].length;
    const hasText = evidenceText[key].trim().length > 0;

    if (fileCount > 0 && hasText) {
      return `${fileCount} file${fileCount === 1 ? "" : "s"} and pasted text`;
    }

    if (fileCount > 0) {
      return `${fileCount} file${fileCount === 1 ? "" : "s"} added`;
    }

    if (hasText) {
      return "Pasted text added";
    }

    return "No evidence added";
  }
async function updateSavedDraft() {
  if (!savedAuditId) return;

  setIsSubmitting(true);
  setErrorMessage("");
  setStatusMessage("Saving draft...");

  try {
    const { data: existingAudit, error: loadError } = await supabase
      .from("audits")
      .select("source_input")
      .eq("id", savedAuditId)
      .single();

    if (loadError) {
      throw new Error(loadError.message);
    }

    const existingSourceInput =
      (existingAudit?.source_input as SavedSourceInput | null) ?? {};

    const updatedSourceInput = {
      ...existingSourceInput,

      primaryText: primaryText.trim(),

      evidenceText: {
        ...(existingSourceInput.evidenceText ?? {}),
        ...evidenceText,
      },

      metadata: {
        auditName: auditName.trim(),
        studentIdentifier: studentIdentifier.trim(),
        gradeLevel: gradeLevel.trim() || null,
        auditType,
      },

      expectedTeacherSurveyCount,
      completedTeacherSurveyCount,
    };

    const { error: updateError } = await supabase
      .from("audits")
      .update({
        audit_name: auditName.trim(),
        student_identifier: studentIdentifier.trim(),
        grade_level: gradeLevel.trim() || null,
        audit_type: auditType,

        expected_teacher_survey_count: expectedTeacherSurveyCount,
        completed_teacher_survey_count: completedTeacherSurveyCount,

        source_input: updatedSourceInput,

        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", savedAuditId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    setStatusMessage("Draft saved successfully.");
  } catch (error) {
    console.error("Draft update error:", error);

    setErrorMessage(
      error instanceof Error
        ? error.message
        : "Unable to update the draft."
    );

    setStatusMessage("");
  } finally {
    setIsSubmitting(false);
  }
}
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
if (savedAuditId) {
  if (submitModeRef.current === "draft") {
    setErrorMessage("");
    setStatusMessage("Draft already saved.");
    return;
  }

  router.push(
    `/dashboard/new/process?auditId=${encodeURIComponent(savedAuditId)}`
  );
  return;
}
  if (!auditName.trim()) {
    setErrorMessage("Enter an audit name.");
    return;
  }

  if (!studentIdentifier.trim()) {
    setErrorMessage(
      "Enter student initials or another district-approved identifier."
    );
    return;
  }

if (!primaryFile && !primaryText.trim()) {
  setErrorMessage("Upload or paste the primary IEP document.");
  return;
}

const hasSurveyEvidence =
  evidenceFiles.teacherSurvey.length > 0 ||
  evidenceText.teacherSurvey.trim().length > 0 ||
  evidenceFiles.parentSurvey.length > 0 ||
  evidenceText.parentSurvey.trim().length > 0 ||
  evidenceFiles.studentSurvey.length > 0 ||
  evidenceText.studentSurvey.trim().length > 0 ||
  evidenceFiles.combinedSurvey.length > 0 ||
  evidenceText.combinedSurvey.trim().length > 0;

  if (!hasSurveyEvidence) {
    setAccordionState((current) => ({
      ...current,
      combinedSurvey: true,
    }));

    setErrorMessage(
      "Upload or paste the required Survey Evidence before continuing."
    );

    return;
  }

  if (completedTeacherSurveyCount > expectedTeacherSurveyCount) {
    setErrorMessage(
      "Completed teacher surveys cannot exceed the expected teacher survey count."
    );
    return;
  }

  clearMessages();
  setIsSubmitting(true);
  setStatusMessage("Creating audit workspace...");

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const userId = user.id;

    const { data: membership, error: membershipError } = await supabase
      .from("memberships")
      .select("district_id, campus_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.error("Membership lookup error:", membershipError);
      throw new Error("Unable to load your IEP Verify workspace.");
    }

    if (!membership) {
      throw new Error(
        "No active district or campus membership was found for this account."
      );
    }

    const initialSourceInput = {
      primaryText: primaryText.trim(),
evidenceText: {
  teacherSurvey: evidenceText.teacherSurvey,
  parentSurvey: evidenceText.parentSurvey,
  studentSurvey: evidenceText.studentSurvey,
  combinedSurvey: evidenceText.combinedSurvey,
  caseManagerNotes: evidenceText.caseManagerNotes,
  fieEvaluation: evidenceText.fieEvaluation,
  progressData: evidenceText.progressData,
},

files: {
  primary: null,
  teacherSurvey: [],
  parentSurvey: [],
  studentSurvey: [],
  combinedSurvey: [],
  caseManagerNotes: [],
  fieEvaluation: [],
  progressData: [],
},

      metadata: {
        auditName: auditName.trim(),
        studentIdentifier: studentIdentifier.trim(),
        gradeLevel: gradeLevel.trim() || null,
        auditType,
      },

      expectedTeacherSurveyCount,
      completedTeacherSurveyCount,
    };

    console.log("AUDIT INSERT DEBUG", {
  authUserId: user.id,
  ownerUserId: userId,
  districtId: membership.district_id,
  campusId: membership.campus_id,
  auditName: auditName.trim(),
  studentIdentifier: studentIdentifier.trim(),
});
const auditId = crypto.randomUUID();

const { error: auditError } = await supabase
  .from("audits")
  .insert({
    id: auditId,
    owner_user_id: userId,
    district_id: membership.district_id,
    campus_id: membership.campus_id,

    audit_name: auditName.trim(),
    student_identifier: studentIdentifier.trim(),
    grade_level: gradeLevel.trim() || null,
    audit_type: auditType,

    status: "draft",

    expected_teacher_survey_count: expectedTeacherSurveyCount,
    completed_teacher_survey_count: completedTeacherSurveyCount,

    external_source: "manual",
    source_input: initialSourceInput,
  });

if (auditError) {
  console.error("Audit creation error:", auditError);

  throw new Error(
    auditError?.message || "Unable to create the audit record."
  );
}


    setStatusMessage("Uploading audit documents...");

    type StoredFileMetadata = {
      name: string;
      path: string;
      size: number;
      type: string;
    };

    async function uploadFile(
      file: File,
      folder: string
    ): Promise<StoredFileMetadata> {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

      const storagePath =
        `${userId}/${auditId}/${folder}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("audit-documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        console.error("Document upload error:", uploadError);

        throw new Error(
          `Unable to upload ${file.name}: ${uploadError.message}`
        );
      }

      return {
        name: file.name,
        path: storagePath,
        size: file.size,
        type: file.type,
      };
    }

let primaryDocument: StoredFileMetadata | null = null;

if (primaryFile) {
  primaryDocument = await uploadFile(
    primaryFile.file,
    "primary"
  );
}

const storedEvidenceFiles: Record<
  EvidenceKey,
  StoredFileMetadata[]
> = {
  teacherSurvey: [],
  parentSurvey: [],
  studentSurvey: [],
  combinedSurvey: [],
  caseManagerNotes: [],
  fieEvaluation: [],
  progressData: [],
};

const evidenceKeys: EvidenceKey[] = [
  "teacherSurvey",
  "parentSurvey",
  "studentSurvey",
  "combinedSurvey",
  "caseManagerNotes",
  "fieEvaluation",
  "progressData",
];

    for (const key of evidenceKeys) {
      for (const selectedFile of evidenceFiles[key]) {
        const storedFile = await uploadFile(
          selectedFile.file,
          `evidence/${key}`
        );

        storedEvidenceFiles[key].push(storedFile);
      }
    }

    const finalSourceInput = {
      primaryText: primaryText.trim(),
evidenceText: {
  teacherSurvey: evidenceText.teacherSurvey,
  parentSurvey: evidenceText.parentSurvey,
  studentSurvey: evidenceText.studentSurvey,
  combinedSurvey: evidenceText.combinedSurvey,
  caseManagerNotes: evidenceText.caseManagerNotes,
  fieEvaluation: evidenceText.fieEvaluation,
  progressData: evidenceText.progressData,
},

files: {
  primary: primaryDocument,
  teacherSurvey: storedEvidenceFiles.teacherSurvey,
  parentSurvey: storedEvidenceFiles.parentSurvey,
  studentSurvey: storedEvidenceFiles.studentSurvey,
  combinedSurvey: storedEvidenceFiles.combinedSurvey,
  caseManagerNotes: storedEvidenceFiles.caseManagerNotes,
  fieEvaluation: storedEvidenceFiles.fieEvaluation,
  progressData: storedEvidenceFiles.progressData,
},

      metadata: {
        auditName: auditName.trim(),
        studentIdentifier: studentIdentifier.trim(),
        gradeLevel: gradeLevel.trim() || null,
        auditType,
      },

      expectedTeacherSurveyCount,
      completedTeacherSurveyCount,
    };

    const { error: updateError } = await supabase
      .from("audits")
      .update({
        source_input: finalSourceInput,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", auditId);

    if (updateError) {
      console.error("Audit source update error:", updateError);

      throw new Error(
        "Documents uploaded, but the audit record could not be updated."
      );
    }

if (submitModeRef.current === "draft") {
  setSavedAuditId(auditId);
  setStatusMessage("Draft saved successfully.");

  router.replace(
    `/dashboard/new/upload?auditId=${encodeURIComponent(auditId)}`
  );

  return;
}

setStatusMessage("Documents uploaded. Preparing audit...");

router.push(
  `/dashboard/new/process?auditId=${encodeURIComponent(auditId)}`
);
  } catch (error) {
    console.error("Audit upload workflow error:", error);

    setErrorMessage(
      error instanceof Error
        ? error.message
        : "Unable to prepare the audit."
    );

    setStatusMessage("");
  } finally {
    setIsSubmitting(false);
  }
}
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0a3d73] hover:underline"
        >
          <span aria-hidden="true">←</span>
          Back to New Audit
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
          New audit
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Upload IEP
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Upload the IEP draft being reviewed. Then upload, paste, or combine
          the survey responses and other source evidence used to develop the
          document.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { step: "1", label: "Upload", active: true },
            { step: "2", label: "Process", active: false },
            { step: "3", label: "Review Sections", active: false },
            { step: "4", label: "Run Audit", active: false },
          ].map((item, index, items) => (
            <div key={item.step} className="flex items-center">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    item.active
                      ? "bg-[#0a3d73] text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.step}
                </span>

                <span
                  className={`truncate text-sm font-semibold ${
                    item.active ? "text-slate-950" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {index < items.length - 1 ? (
                <div className="mx-4 hidden h-px flex-1 bg-slate-200 sm:block" />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <form
  ref={formRef}
  onSubmit={handleSubmit}
  className="space-y-6"
>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Audit Information
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Use initials or a district-approved identifier rather than a full
              student name.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Audit name
              </span>

              <input
                type="text"
                value={auditName}
                onChange={(event) => {
                  setAuditName(event.target.value);
                  clearMessages();
                }}
                placeholder="J.R. — Annual IEP Review"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Student identifier
              </span>

              <input
                type="text"
                value={studentIdentifier}
                onChange={(event) => {
                  setStudentIdentifier(event.target.value);
                  clearMessages();
                }}
                placeholder="J.R. or district student ID"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Grade level
              </span>

              <input
                type="text"
                value={gradeLevel}
                onChange={(event) => {
                  setGradeLevel(event.target.value);
                  clearMessages();
                }}
                placeholder="10"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Audit type
              </span>

              <select
                value={auditType}
                onChange={(event) => {
                  setAuditType(event.target.value);
                  clearMessages();
                }}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              >
                {auditTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Primary IEP Document
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Upload the complete IEP draft that IEP Verify should review.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              Required
            </span>
          </div>

          <input
            ref={primaryInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handlePrimaryInput}
            className="hidden"
          />

          {primaryFile || savedPrimaryDocument ? (
            <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-semibold text-emerald-700 shadow-sm">
                  ✓
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {primaryFile?.file.name ?? savedPrimaryDocument?.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatFileSize(
  primaryFile?.file.size ??
    savedPrimaryDocument?.size ??
    0
)}{" "}
· {primaryFile ? "Ready to process" : "Saved to draft"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => primaryInputRef.current?.click()}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Replace
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrimaryFile(null);
                    clearMessages();
                  }}
                  className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => primaryInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  primaryInputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setPrimaryDragging(true);
              }}
              onDragLeave={() => setPrimaryDragging(false)}
              onDrop={handlePrimaryDrop}
              className={`mt-6 cursor-pointer rounded-3xl border-2 border-dashed px-6 py-12 text-center transition ${
                primaryDragging
                  ? "border-[#0a3d73] bg-blue-50"
                  : "border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
              }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-semibold text-[#0a3d73]">
                ↑
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                Drag and drop the IEP here
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Or click to browse your computer.
              </p>

              <p className="mt-4 text-xs text-slate-400">
                PDF or DOCX · Maximum 25 MB
              </p>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Or paste IEP text
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-5">
              <textarea
                value={primaryText}
                onChange={(event) => {
                  setPrimaryText(event.target.value);
                  clearMessages();
                }}
                placeholder="Paste the complete IEP draft here. Include the PLAAFP, vision, annual goals, accommodations, services, FIE or evaluation information, recommended TEKS, and any other relevant IEP sections."
                className="h-80 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-2 flex justify-end">
                <span className="text-xs text-slate-400">
                  {primaryText.length.toLocaleString()} characters
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4d9e7c]">
              Alignment evidence
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Alignment Evidence
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Expand the sections you need. Upload files, paste text, or use
              both. These records form the comparison baseline for the audit.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Survey evidence is required for alignment review.
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-800">
              For the most accurate audit, include both the survey questions and
              the responses. Questions provide the context needed to determine
              whether the IEP documentation is fully supported by the evidence.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Expected teacher survey count
              </span>

              <input
                type="number"
                min="0"
                value={expectedTeacherSurveyCount}
                onChange={(event) => {
                  setExpectedTeacherSurveyCount(
                    Math.max(0, Number(event.target.value))
                  );
                  clearMessages();
                }}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Completed teacher survey count
              </span>

              <input
                type="number"
                min="0"
                value={completedTeacherSurveyCount}
                onChange={(event) => {
                  setCompletedTeacherSurveyCount(
                    Math.max(0, Number(event.target.value))
                  );
                  clearMessages();
                }}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="mt-7 space-y-4">
            {evidenceDefinitions.map((definition) => {
              const selectedFiles = evidenceFiles[definition.key];
              const savedFiles = savedEvidenceFiles[definition.key];
              const isDragging = evidenceDragging[definition.key];
              const isOpen = accordionState[definition.key];
              const hasContent = hasEvidenceContent(definition.key);

              return (
                <article
                  key={definition.key}
                  className={`overflow-hidden rounded-3xl border bg-white transition ${
                    hasContent
                      ? "border-emerald-200"
                      : "border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(definition.key)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-5 px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <span
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                          hasContent
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {hasContent ? "✓" : "+"}
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-base font-semibold text-slate-950">
                            {definition.title}
                          </h3>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${definition.badgeClass}`}
                          >
                            {definition.badge}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {definition.description}
                        </p>

                        <p
                          className={`mt-2 text-xs font-semibold ${
                            hasContent
                              ? "text-emerald-700"
                              : "text-slate-400"
                          }`}
                        >
                          {getEvidenceSummary(definition.key)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-600 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    >
                     ⌄
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-6 sm:px-6">
                      <div className="grid gap-5 xl:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Upload files
                          </p>

                          <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                            {definition.uploadInstructions}
                          </p>

                          <input
                            ref={(element) => {
                              evidenceInputRefs.current[definition.key] =
                                element;
                            }}
                            type="file"
                            accept=".pdf,.docx"
                            multiple
                            onChange={(event) =>
                              handleEvidenceInput(definition.key, event)
                            }
                            className="hidden"
                          />

                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              evidenceInputRefs.current[
                                definition.key
                              ]?.click()
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                evidenceInputRefs.current[
                                  definition.key
                                ]?.click();
                              }
                            }}
                            onDragOver={(event) => {
                              event.preventDefault();

                              setEvidenceDragging((current) => ({
                                ...current,
                                [definition.key]: true,
                              }));
                            }}
                            onDragLeave={() =>
                              setEvidenceDragging((current) => ({
                                ...current,
                                [definition.key]: false,
                              }))
                            }
                            onDrop={(event) =>
                              handleEvidenceDrop(definition.key, event)
                            }
                            className={`mt-4 flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-7 text-center transition ${
                              isDragging
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-slate-300 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
                            }`}
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-semibold text-emerald-700">
                              ↑
                            </div>

                            <p className="mt-4 text-sm font-semibold text-slate-900">
                              Drop files here
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Or click to browse
                            </p>

                            <p className="mt-4 text-xs text-slate-400">
                              Multiple PDF or DOCX files
                            </p>
                          </div>
{savedFiles.length > 0 ? (
  <div className="mt-4 space-y-3">
    {savedFiles.map((savedFile) => (
      <div
        key={savedFile.path}
        className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {savedFile.name}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {formatFileSize(savedFile.size)} · Saved to draft
          </p>
        </div>

        <span className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-emerald-700">
          Saved
        </span>
      </div>
    ))}
  </div>
) : null}
                          {selectedFiles.length > 0 ? (
                            <div className="mt-4 space-y-3">
                              {selectedFiles.map((selectedFile) => (
                                <div
                                  key={selectedFile.id}
                                  className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                      {selectedFile.file.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {formatFileSize(
                                        selectedFile.file.size
                                      )}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeEvidenceFile(
                                        definition.key,
                                        selectedFile.id
                                      )
                                    }
                                    className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Paste text
                          </p>

                          <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                            Paste evidence directly when it is not available as
                            a separate file.
                          </p>

                          <textarea
                            value={evidenceText[definition.key]}
                            onChange={(event) =>
                              handleEvidenceTextChange(
                                definition.key,
                                event.target.value
                              )
                            }
                            placeholder={definition.pastePlaceholder}
                            className="mt-4 h-56 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0a3d73] focus:ring-4 focus:ring-blue-100"
                          />

                          <div className="mt-2 flex justify-end">
                            <span className="text-xs text-slate-400">
                              {evidenceText[
                                definition.key
                              ].length.toLocaleString()}{" "}
                              characters
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-[#0a3d73]">
            How the evidence will be used
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            IEP Verify will normalize uploaded files and pasted text into the
            same structured evidence fields. The IEP will then be compared
            against the survey questions and answers, case manager notes, FIE
            information, and progress data supplied.
          </p>
        </section>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
            {statusMessage}
          </div>
        ) : null}

        <section className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard/new"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
  type="button"
  disabled={isSubmitting || isLoadingDraft}
onClick={() => {
  if (savedAuditId) {
    updateSavedDraft();
    return;
  }

  submitModeRef.current = "draft";
  formRef.current?.requestSubmit();
}}
  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
>
  {isSubmitting && submitModeRef.current === "draft"
    ? "Saving..."
    : "Save Draft"}
</button>

<button
  type="button"
  disabled={isSubmitting || isLoadingDraft}
  onClick={() => {
    if (savedAuditId) {
      router.push(
        `/dashboard/new/process?auditId=${encodeURIComponent(savedAuditId)}`
      );
      return;
    }

    submitModeRef.current = "process";
    formRef.current?.requestSubmit();
  }}
  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0a3d73] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07325f] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
>
  {isSubmitting && submitModeRef.current === "process"
    ? "Saving..."
    : "Process Documents"}
  <span aria-hidden="true">→</span>
</button>
          </div>
        </section>
      </form>
    </div>
  );
}
export default function UploadIEPPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl p-8 text-sm text-slate-500">
          Loading audit...
        </div>
      }
    >
      <UploadIEPContent />
    </Suspense>
  );
}