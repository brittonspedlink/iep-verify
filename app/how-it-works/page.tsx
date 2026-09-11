/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "How IEP Verify Works | Evidence-Based IEP Review",
  description:
    "See how IEP Verify reviews IEP documentation against available evidence, identifies gaps, and evaluates alignment across key IEP sections.",
};

type Step = {
  number: string;
  label: string;
  title: string;
  description: ReactNode;
  images: {
    src: string;
    alt: string;
    cropHistory?: boolean;
  }[];
  note?: ReactNode;
};

const steps: Step[] = [
  {
    number: "01",
    label: "Secure Access",
    title: "Sign in to IEP Verify",
    description: (
      <>
        Start at IEP Verify and select <strong>Log In</strong>. Enter your
        authorized email address and request a secure sign-in link. IEP Verify
        uses password-free access.
      </>
    ),
    images: [
      {
        src: "/landingpage.png",
        alt: "IEP Verify landing page",
      },
      {
        src: "/login.png",
        alt: "IEP Verify secure login page",
      },
    ],
    note: (
      <>
        Don&apos;t see the email? Check your <strong>Spam or Junk</strong>{" "}
        folder before requesting another link.
      </>
    ),
  },
  {
    number: "02",
    label: "Begin Your Review",
    title: "Start a new audit",
    description: (
      <>
        From the dashboard, select <strong>New Audit</strong>. Your dashboard
        also gives you access to drafts, recent audits, and audit history.
      </>
    ),
    images: [
      {
        src: "/Dashboard.png",
        alt: "IEP Verify dashboard",
      },
      {
        src: "/newaudit.png",
        alt: "IEP Verify new audit page",
      },
    ],
  },
  {
    number: "03",
    label: "Primary Document",
    title: "Add the IEP being reviewed",
    description: (
      <>
        Enter the audit information and upload the complete IEP document you
        want IEP Verify to review. You may also paste the complete IEP text
        directly into the workspace.
      </>
    ),
    images: [
      {
        src: "/IEPupload1.png",
        alt: "IEP audit information and primary document upload",
      },
    ],
    note: (
      <>
        <strong>Supported files:</strong> PDF and DOCX. Older Word files such
        as .doc should be opened in Word and saved as PDF or DOCX before
        uploading.
      </>
    ),
  },
  {
    number: "04",
    label: "Alignment Evidence",
    title: "Add supporting evidence",
    description: (
      <>
        Add the evidence that was available to support the IEP. Teacher,
        parent, and student surveys can be uploaded individually. If those
        responses are already combined into one document, use the{" "}
        <strong>Combined Survey Evidence</strong> section instead.
      </>
    ),
    images: [
      {
        src: "/IEPupload3.png",
        alt: "IEP Verify evidence upload sections",
      },
      {
        src: "/IEPupload4.png",
        alt: "Combined survey evidence uploaded",
      },
    ],
    note: (
      <>
        You may also provide FIE or evaluation information, progress data, and
        other supporting records when they are part of the evidence used to
        develop the IEP.
      </>
    ),
  },
  {
    number: "05",
    label: "Required Before Processing",
    title: "Confirm expected and received survey evidence",
    description: (
      <>
        Before processing, tell IEP Verify what survey evidence was expected
        and what was actually received. Enter the expected and received teacher
        survey counts and confirm whether parent and student input were expected
        and received.
      </>
    ),
    images: [
      {
        src: "/IEPupload2.png",
        alt: "Survey completeness and confirmation controls",
      },
    ],
    note: (
      <>
        <strong>Important:</strong> You must check{" "}
        <strong>Confirm survey completeness</strong> before processing.
        Missing expected evidence affects Evidence Readiness. Evidence that was
        not expected should not be treated as missing.
      </>
    ),
  },
  {
    number: "06",
    label: "Save or Continue",
    title: "Save your draft or process the documents",
    description: (
      <>
        At the bottom of the page, select <strong>Save Draft</strong> if you
        need to return to the audit later. When the IEP and supporting evidence
        are ready, select <strong>Process Documents</strong>.
      </>
    ),
    images: [
      {
        src: "/IEPupload5.png",
        alt: "Save Draft and Process Documents controls",
      },
    ],
  },
  {
    number: "07",
    label: "Document Processing",
    title: "IEP Verify prepares the record",
    description: (
      <>
        IEP Verify reads the uploaded documents, extracts the text, identifies
        the major IEP sections, and organizes the evidence that will be used in
        the review.
      </>
    ),
    images: [
      {
        src: "/processing1.png",
        alt: "IEP Verify processing documents",
      },
      {
        src: "/processing3.png",
        alt: "IEP Verify processing complete",
      },
    ],
    note: (
      <>
        Processing time varies depending on document length, file type, and the
        amount of supporting evidence.{" "}
        <strong>Processing may take several minutes.</strong>
      </>
    ),
  },
  {
    number: "08",
    label: "Educator Review",
    title: "Review and confirm the extracted sections",
    description: (
      <>
        Before the audit runs, IEP Verify shows the sections it identified in
        the uploaded IEP. Review each section and confirm that the extracted
        content is complete and accurate. If necessary, you can edit the
        extracted text before continuing.
      </>
    ),
    images: [
      {
        src: "/review1.png",
        alt: "Beginning the extracted section review",
      },
      {
        src: "/review3.png",
        alt: "Extracted section review complete",
      },
    ],
    note: (
      <>
        This human review step is intentional. The educator confirms the
        extracted record before the audit engine evaluates it.
      </>
    ),
  },
  {
    number: "09",
    label: "Final Review",
    title: "Confirm the audit record and run the audit",
    description: (
      <>
        IEP Verify provides a final readiness view of the supporting evidence
        and IEP sections. Review the record at a glance and, when everything is
        ready, select <strong>Run Evidence Audit</strong>.
      </>
    ),
    images: [
      {
        src: "/reviewrun1.png",
        alt: "Final audit preparation screen",
      },
      {
        src: "/reviewrun3.png",
        alt: "IEP Verify evidence audit running",
      },
    ],
  },
  {
    number: "10",
    label: "Audit Findings",
    title: "Review the results",
    description: (
      <>
        The completed audit provides an Overall Score, Evidence Readiness,
        Documentation Alignment, audit status, summary, priority findings, and
        section-by-section reviews.
      </>
    ),
    images: [
      {
        src: "/audit1.png",
        alt: "IEP Verify audit scores and summary",
      },
      {
        src: "/audit2.png",
        alt: "IEP Verify detailed document review",
      },
    ],
    note: (
      <>
        Focus first on material gaps, conflicts, and unsupported documentation.
        IEP Verify is designed to evaluate evidence completeness and alignment,
        not require additional detail simply because more information could be
        added.
      </>
    ),
  },
  {
    number: "11",
    label: "Saved Work",
    title: "Export or return to Audit History",
    description: (
      <>
        Completed audits can be exported for review and recordkeeping. Audit
        History lets you reopen completed reports and resume unfinished drafts
        without starting over.
      </>
    ),
    images: [
      {
        src: "/audithistory.png",
        alt: "IEP Verify Audit History",
        cropHistory: true,
      },
    ],
  },
];

function Screenshot({
  src,
  alt,
  large = false,
  cropHistory = false,
}: {
  src: string;
  alt: string;
  large?: boolean;
  cropHistory?: boolean;
}) {
  if (cropHistory) {
    return (
      <div
        className={`overflow-hidden rounded-2xl border border-[#d8e2ee] bg-white ${
          large ? "mx-auto max-w-5xl" : ""
        }`}
        style={{
          boxShadow: "0 18px 45px rgba(20, 55, 100, 0.09)",
        }}
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: "1.95 / 1" }}>
          <img
            src={src}
            alt={alt}
            className="absolute left-0 top-0 h-auto w-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[#d8e2ee] bg-white ${
        large ? "mx-auto max-w-5xl" : ""
      }`}
      style={{
        boxShadow: "0 18px 45px rgba(20, 55, 100, 0.09)",
      }}
    >
      <img src={src} alt={alt} className="block h-auto w-full" />
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#132f53]">
      <GoogleAnalytics />
      {/* HEADER */}
      <header className="border-b border-[#dbe4ef] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center">
            <img
              src="/iep-verify-logo.png"
              alt="IEP Verify"
              className="h-14 w-auto"
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-[#173f78] hover:bg-[#f3f7fc] sm:inline-flex"
            >
              Home
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-[#173f78] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#123664]"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-[#dbe4ef] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#58a678]">
            How IEP Verify Works
          </p>

          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold tracking-tight text-[#132f53] sm:text-5xl">
            From supporting evidence to a focused IEP review.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#5a6f89]">
            Follow the workflow below to upload an IEP, provide the supporting
            evidence, confirm the extracted documentation, run the audit, and
            review the findings.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              "PDF & DOCX",
              "Evidence-based review",
              "Human confirmation",
              "Saved audit history",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#d7e2ef] bg-[#f7faff] px-4 py-2 text-sm font-medium text-[#526983]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="space-y-24">
          {steps.map((step) => (
            <section key={step.number}>
              <div className="mb-8 grid gap-5 md:grid-cols-[85px_1fr]">
                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#173f78] text-lg font-bold text-white">
                    {step.number}
                  </div>
                </div>

                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#58a678]">
                    {step.label}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#132f53]">
                    {step.title}
                  </h2>

                  <div className="mt-4 text-base leading-7 text-[#566d87]">
                    {step.description}
                  </div>

                  {step.note && (
                    <div className="mt-6 rounded-xl border border-[#bcd4f2] bg-[#edf5ff] px-5 py-4 text-sm leading-6 text-[#173f78]">
                      {step.note}
                    </div>
                  )}
                </div>
              </div>

              <div
                className={
                  step.images.length === 1
                    ? "md:ml-[85px]"
                    : "grid gap-6 md:ml-[85px] lg:grid-cols-2"
                }
              >
                {step.images.map((image) => (
                  <Screenshot
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    large={step.images.length === 1}
                    cropHistory={image.cropHistory}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* EXPLANATION */}
      <section className="border-y border-[#dbe4ef] bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-3xl bg-[#173f78] px-8 py-12 text-white sm:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8fd2ab]">
              What IEP Verify Reviews
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Evidence first. Alignment across the IEP.
            </h2>

<p className="mt-5 max-w-3xl text-base leading-7 text-[#d9e6f5]">
  IEP Verify evaluates whether the supplied evidence supports the
  documented needs and whether those needs carry through the
  PLAAFP, goals, accommodations, services, and instructional
  alignment. It also identifies material gaps, including missing
  expected survey evidence or missing IEP sections, and flags
  conflicts or unsupported documentation. Missing expected evidence
  also affects the confidence of the review.
</p>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#58a678]">
            Ready to Begin
          </p>

          <h2 className="mt-3 text-3xl font-bold text-[#132f53]">
            Start your IEP documentation review.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#566d87]">
            Sign in to begin a new audit or return to your saved review
            workspace.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-flex rounded-xl bg-[#173f78] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#123664]"
          >
            Log In to IEP Verify →
          </Link>

          <p className="mx-auto mt-10 max-w-3xl text-xs leading-5 text-[#74869d]">
            IEP Verify supports professional documentation review. It does not
            replace educator judgment, certify legal compliance, or verify
            implementation.
          </p>
        </div>
      </section>
    </main>
  );
}