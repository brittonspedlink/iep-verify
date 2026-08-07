import Link from "next/link";

const alternativeOptions = [
  {
    title: "Paste IEP Sections",
    description:
      "Paste source evidence, PLAAFP, goals, accommodations, services, and other IEP sections into a guided workflow.",
    href: "/dashboard/new/paste",
    icon: "≡",
    iconClass: "bg-emerald-100 text-emerald-700",
    linkClass: "text-emerald-700",
  },
  {
    title: "Resume Audit",
    description:
      "Return to a previously saved audit and continue where you left off.",
    href: "/dashboard/audits",
    icon: "↻",
    iconClass: "bg-slate-100 text-slate-700",
    linkClass: "text-slate-700",
  },
];

export default function NewAuditPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#4d9e7c]">
          Create new audit
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Start a new IEP documentation review.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Upload a complete IEP document, paste individual sections, or resume
          an existing audit.
        </p>
      </section>

      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-semibold text-[#0a3d73]">
              ↑
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#0a3d73]">
              Recommended workflow
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Upload IEP
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Upload a PDF or DOCX. IEP Verify will prepare the document for
              section review before the audit runs.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "PDF and DOCX support",
                "Section-by-section review",
                "Missing-section warnings",
                "Editable extracted content",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                    ✓
                  </span>

                  <span className="text-sm font-medium text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/new/upload"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0a3d73] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07325f] focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              Upload IEP
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="border-t border-slate-200 bg-[#f7f9fc] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              What happens next
            </p>

            <div className="mt-6 space-y-5">
              {[
                {
                  step: "1",
                  title: "Upload received",
                  description:
                    "Select the IEP and any supporting documents you want included.",
                },
                {
                  step: "2",
                  title: "Sections identified",
                  description:
                    "Review detected content such as PLAAFP, goals, accommodations, and services.",
                },
                {
                  step: "3",
                  title: "Run the audit",
                  description:
                    "Confirm the extracted sections and begin the evidence-alignment review.",
                },
              ].map((item, index, items) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0a3d73] text-sm font-semibold text-white">
                      {item.step}
                    </div>

                    {index < items.length - 1 ? (
                      <div className="mt-2 h-full min-h-10 w-px bg-slate-300" />
                    ) : null}
                  </div>

                  <div className="pb-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-[#0a3d73]">
                Review before analysis
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                IEP Verify will show the sections it identifies before any
                audit is run.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            Other ways to begin
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Choose another workflow when a complete IEP document is not
            available.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {alternativeOptions.map((option) => (
            <Link
              key={option.title}
              href={option.href}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-semibold ${option.iconClass}`}
              >
                {option.icon}
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                {option.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {option.description}
              </p>

              <p className={`mt-5 text-sm font-semibold ${option.linkClass}`}>
                Continue
                <span className="ml-2 inline-block transition group-hover:translate-x-1">
                  →
                </span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-lg font-semibold text-violet-700">
            ⇄
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-950">
                Import from SpedLink
              </h2>

              <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                Coming soon
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Structured IEP data will eventually be sent directly from
              SpedLink into IEP Verify without requiring another upload.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}