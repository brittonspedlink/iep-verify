"use client";

import { useEffect } from "react";

type AuditExportButtonProps = {
  auditId?: string;
  label?: string;
  className?: string;
  autoPrintFromQuery?: boolean;
};

export default function AuditExportButton({
  auditId,
  label = "Export Audit",
  className = "",
  autoPrintFromQuery = false,
}: AuditExportButtonProps) {
  useEffect(() => {
    if (!autoPrintFromQuery) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (params.get("print") !== "1") {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [autoPrintFromQuery]);

  if (autoPrintFromQuery) {
    return null;
  }

  function handleExport() {
    if (auditId) {
      window.open(
        `/dashboard/history/${encodeURIComponent(auditId)}?print=1`,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    window.print();
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className={className}
    >
      {label}
    </button>
  );
}