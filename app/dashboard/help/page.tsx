import Link from "next/link";

export default function HelpSupportPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0a3d73] hover:underline"
        >
          <span aria-hidden="true">←</span>
          Back to Dashboard
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
          Help &amp; Support
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Need help with IEP Verify?
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          If you run into a problem, have a question about an audit, or need
          help using IEP Verify, contact our support team.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4d9e7c]">
          Contact support
        </p>

        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Email SpedLink &amp; IEP Verify Support
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          For product questions, access issues, audit problems, or technical
          support, email:
        </p>

        <a
          href="mailto:support@spedlink.org?subject=IEP%20Verify%20Support"
          className="mt-5 inline-flex items-center justify-center rounded-2xl bg-[#0a3d73] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07325f]"
        >
          support@spedlink.org
        </a>
      </section>

      <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-[#0a3d73]">
          When reporting an issue
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-700">
          Include the audit name, student initials or district-approved
          identifier, and a brief description of what happened.
        </p>

        <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
          Please do not email full student names, IEP documents, evaluation
          records, or other sensitive student information.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-950">
          Common first steps
        </h2>

        <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
          <p>
            <span className="font-semibold text-slate-900">
              Sign-in link not working:
            </span>{" "}
            Request a new magic link and use the newest email you received.
          </p>

          <p>
            <span className="font-semibold text-slate-900">
              Audit appears incomplete:
            </span>{" "}
            Return to Review Sections and confirm that the extracted sections
            contain the expected content.
          </p>

          <p>
            <span className="font-semibold text-slate-900">
              Need to continue later:
            </span>{" "}
            Open Audit History and select Resume for an unfinished audit.
          </p>
        </div>
      </section>
    </div>
  );
}