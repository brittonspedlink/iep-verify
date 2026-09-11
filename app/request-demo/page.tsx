import type { Metadata } from "next";
import RequestDemoClient from "./RequestDemoClient";

export const metadata: Metadata = {
  title: "Request an IEP Verify Demo | Texas IEP Review",
  description:
    "Request a demo of IEP Verify and see how Texas educators can review IEP documentation, supporting evidence, alignment, gaps, and audit findings.",
};

export default function RequestDemoPage() {
  return <RequestDemoClient />;
}