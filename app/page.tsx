import type { Metadata } from "next";
import IEPVerifyLanding from "../components/IEPVerifyLanding";

export const metadata: Metadata = {
  title: "IEP Verify | Texas IEP Documentation Review",
  description:
    "Review IEP documentation against available evidence, identify material gaps, and evaluate alignment across key IEP sections.",
};

export default function HomePage() {
  return <IEPVerifyLanding />;
}