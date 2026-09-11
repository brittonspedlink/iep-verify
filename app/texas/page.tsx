import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "Texas IEP Review Framework | IEP Verify",
  description:
    "Explore IEP Verify's Texas-focused framework for reviewing IEP documentation, evidence readiness, alignment, material gaps, and conflicts.",
};

export default function TexasFrameworkPage() {
  return (
    <main className="texasPage">
      <GoogleAnalytics />
      <header className="texasNav">
        <div className="texasNavInner">
          <Link href="/" className="brand">
            <img
              src="/iep-verify-logo.png"
              alt="IEP Verify"
              className="logo"
            />
          </Link>

          <div className="navActions">
            <Link href="/">Home</Link>

            <Link href="/login" className="loginButton">
              Log In
            </Link>
          </div>
        </div>
      </header>

      <section className="texasHero">
        <div className="texasContainer heroGrid">
          <div>
            <div className="eyebrow">TEXAS REVIEW FRAMEWORK</div>

            <h1>
              Built around the way Texas educators review IEP documentation.
            </h1>

            <p className="intro">
              IEP Verify uses a Texas-focused review framework to compare IEP
              documentation against the available evidence and identify
              meaningful gaps, alignment concerns, and areas that may require
              educator attention.
            </p>

            <div className="heroActions">
              <Link href="/login" className="primaryButton">
                Log In to IEP Verify
                <span>→</span>
              </Link>

              <Link href="/" className="secondaryButton">
                Back to Home
              </Link>
            </div>
          </div>

          <div className="texasVisual">
            <div className="texasIconWrap">
              <img
                src="/blue_texas_outline_icon.png"
                alt="Texas"
                className="texasIcon"
              />
            </div>

            <div className="visualLabel">TEXAS-FOCUSED REVIEW</div>

            <h2>Evidence before assumptions.</h2>

            <p>
              The framework is designed to evaluate whether IEP documentation
              is materially supported by the records provided for review.
            </p>

            <div className="visualCheck">
              <span>✓</span>
              Evidence readiness
            </div>

            <div className="visualCheck">
              <span>✓</span>
              Documentation alignment
            </div>

            <div className="visualCheck">
              <span>✓</span>
              Material gaps and conflicts
            </div>

            <div className="visualCheck">
              <span>✓</span>
              Clear next steps
            </div>
          </div>
        </div>
      </section>

      <section className="overviewSection">
        <div className="texasContainer">
          <div className="sectionHeading">
            <div className="eyebrow">WHAT THE FRAMEWORK REVIEWS</div>

            <h2>Two questions drive every audit.</h2>

            <p>
              IEP Verify separates the quality of the evidence package from the
              alignment of the IEP documentation itself.
            </p>
          </div>

          <div className="overviewGrid">
            <div className="overviewCard">
              <div className="cardNumber">01</div>

              <h3>Is the evidence ready?</h3>

              <p>
                IEP Verify reviews whether the available supporting information
                is sufficient to meaningfully evaluate the IEP documentation.
              </p>

              <ul>
                <li>Teacher input</li>
                <li>Parent input when available or expected</li>
                <li>Student input when available or expected</li>
                <li>Evaluation and case information</li>
                <li>Other supporting evidence provided for review</li>
              </ul>
            </div>

            <div className="overviewCard">
              <div className="cardNumber">02</div>

              <h3>Does the documentation align?</h3>

              <p>
                IEP Verify evaluates whether the major IEP sections materially
                reflect and align with the evidence supplied for the review.
              </p>

              <ul>
                <li>Needs reflected in the PLAAFP</li>
                <li>Vision and goals connected to documented needs</li>
                <li>Accommodations tied to supporting evidence</li>
                <li>Services reflected in the documentation</li>
                <li>Recommended TEKS aligned to the documented instructional need</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="principlesSection">
        <div className="texasContainer">
          <div className="sectionHeading">
            <div className="eyebrow">REVIEW PRINCIPLES</div>

            <h2>Focused on meaningful alignment, not paperwork perfection.</h2>

            <p>
              The framework is designed to distinguish material documentation
              concerns from optional opportunities to add more detail.
            </p>
          </div>

          <div className="principlesGrid">
            <FrameworkCard
              title="Evidence-Based"
              text="Findings are grounded in the records provided for the review rather than assumptions about the student."
            />

            <FrameworkCard
              title="Material Alignment"
              text="The review focuses on whether the documentation meaningfully reflects documented student needs, supports, and educational decisions."
            />

            <FrameworkCard
              title="Section-to-Section Consistency"
              text="IEP Verify looks for meaningful connections across the PLAAFP, vision, goals, accommodations, services, and recommended instruction."
            />

            <FrameworkCard
              title="Conflicts and Omissions"
              text="The framework identifies unsupported statements, conflicting information, missing evidence, and material needs that appear to have been omitted."
            />

            <FrameworkCard
              title="Professional Judgment"
              text="Audit findings are designed to help qualified educators focus their review. They do not replace professional decision-making."
            />

            <FrameworkCard
              title="Clear Next Steps"
              text="When an area needs attention, the audit explains why it matters and what should be reviewed before finalizing the documentation."
            />
          </div>
        </div>
      </section>

      <section className="sectionsSection">
        <div className="texasContainer">
          <div className="sectionHeading">
            <div className="eyebrow">DOCUMENT REVIEW</div>

            <h2>Review the IEP as a connected record.</h2>

            <p>
              Each section is evaluated individually while also considering how
              it connects to the broader evidence and IEP.
            </p>
          </div>

          <div className="reviewList">
            <ReviewRow
              name="PLAAFP"
              description="Does the present-level documentation materially reflect the student needs shown in the available evidence?"
            />

            <ReviewRow
              name="Vision"
              description="Does the vision reflect the documented priorities and direction for the student?"
            />

            <ReviewRow
              name="Goals"
              description="Are goals connected to documented needs and supported by the information provided?"
            />

            <ReviewRow
              name="Accommodations"
              description="Are accommodations supported by documented student needs and consistent with the evidence?"
            />

            <ReviewRow
              name="Services"
              description="Are documented services reasonably connected to the needs and supports reflected in the record?"
            />

            <ReviewRow
              name="Recommended TEKS"
              description="Are recommended instructional standards connected to documented needs, goals, and instructional priorities?"
            />
          </div>
        </div>
      </section>

      <section className="texasNotice">
        <div className="texasContainer noticeInner">
          <div>
            <div className="eyebrow">IMPORTANT DISTINCTION</div>

            <h2>A review tool — not a compliance certification.</h2>

            <p>
              IEP Verify supports professional documentation review. It does
              not determine legal compliance, replace an ARD committee or
              qualified educator, or verify that documented services,
              accommodations, or supports were implemented.
            </p>

            <p>
              The framework is designed with reference to Texas Education
              Agency guidance and Texas special education documentation
              practices. IEP Verify is not affiliated with or endorsed by the
              Texas Education Agency.
            </p>
          </div>
        </div>
      </section>

      <section className="ctaSection">
        <div className="texasContainer ctaInner">
          <div>
            <div className="eyebrow">IEP VERIFY</div>

            <h2>Know what is supported. Know what needs attention.</h2>

            <p>
              Use IEP Verify to bring evidence and documentation together in one
              focused review.
            </p>
          </div>

          <Link href="/login" className="primaryButton">
            Log In to IEP Verify
            <span>→</span>
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footerInner">
          <div className="footerBrand">
            <img
              src="/iep-verify-logo.png"
              alt="IEP Verify"
              className="footerLogo"
            />

            <p>
              Independent IEP documentation review for education professionals.
            </p>
          </div>

          <div className="footerLinks">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/login">Log In</Link>
          </div>

          <div className="copyright">
            © {new Date().getFullYear()} IEP Verify
          </div>
        </div>
      </footer>

      <style>{`
        :root {
          --navy: #173f75;
          --navy-dark: #0d2e59;
          --green: #55a77c;
          --green-dark: #398860;
          --green-light: #edf8f2;
          --text: #10233f;
          --muted: #63728a;
          --border: #dce5ef;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .texasPage {
          min-height: 100vh;
          background: white;
          color: var(--text);
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .texasNav {
          border-bottom: 1px solid var(--border);
          background: white;
        }

        .texasNavInner {
          max-width: 1180px;
          height: 82px;
          margin: 0 auto;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          width: 190px;
          height: auto;
          display: block;
        }

        .navActions {
          display: flex;
          align-items: center;
          gap: 28px;
          color: #40546d;
          font-size: 14px;
          font-weight: 650;
        }

        .loginButton {
          padding: 12px 22px;
          border-radius: 9px;
          background: var(--navy);
          color: white;
        }

        .texasContainer {
          max-width: 1180px;
          margin: 0 auto;
          padding-left: 28px;
          padding-right: 28px;
        }

        .texasHero {
          border-bottom: 1px solid var(--border);
          background:
            radial-gradient(
              circle at 80% 25%,
              rgba(85, 167, 124, 0.12),
              transparent 30%
            ),
            linear-gradient(180deg, #ffffff 0%, #f6f9fc 100%);
        }

        .heroGrid {
          padding-top: 88px;
          padding-bottom: 90px;
          display: grid;
          grid-template-columns: 1.05fr 0.75fr;
          gap: 76px;
          align-items: center;
        }

        .eyebrow {
          margin-bottom: 16px;
          color: var(--green-dark);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.22em;
        }

        h1 {
          margin: 0;
          max-width: 720px;
          color: var(--navy-dark);
          font-size: clamp(46px, 5vw, 64px);
          line-height: 1.04;
          letter-spacing: -0.045em;
        }

        .intro {
          max-width: 720px;
          margin: 28px 0 0;
          color: #566981;
          font-size: 18px;
          line-height: 1.75;
        }

        .heroActions {
          margin-top: 34px;
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .primaryButton,
        .secondaryButton {
          min-height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          font-size: 15px;
          font-weight: 750;
        }

        .primaryButton {
          gap: 14px;
          padding: 0 24px;
          background: var(--navy);
          color: white;
          box-shadow: 0 10px 24px rgba(23, 63, 117, 0.14);
        }

        .secondaryButton {
          padding: 0 22px;
          border: 1px solid var(--border);
          background: white;
          color: #344963;
        }

        .texasVisual {
          padding: 36px;
          border: 1px solid #d9e4ee;
          border-radius: 20px;
          background: white;
          box-shadow: 0 18px 45px rgba(24, 53, 84, 0.08);
        }

        .texasIconWrap {
          width: 74px;
          height: 74px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d7e3ee;
          border-radius: 50%;
          background: #f3f7fb;
        }

        .texasIcon {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .visualLabel {
          margin-bottom: 10px;
          color: var(--green-dark);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.19em;
        }

        .texasVisual h2 {
          margin: 0;
          color: var(--navy-dark);
          font-size: 27px;
          letter-spacing: -0.025em;
        }

        .texasVisual > p {
          margin: 14px 0 24px;
          color: #66788e;
          font-size: 14px;
          line-height: 1.65;
        }

        .visualCheck {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #40546d;
          font-size: 13px;
          font-weight: 650;
        }

        .visualCheck + .visualCheck {
          margin-top: 13px;
        }

        .visualCheck span {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--green);
          color: white;
          font-size: 10px;
          font-weight: 900;
        }

        .overviewSection,
        .principlesSection,
        .sectionsSection {
          padding: 86px 0;
        }

        .overviewSection {
          background: white;
        }

        .principlesSection {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: linear-gradient(180deg, #f7fbff, #eef5fb);
        }

        .sectionsSection {
          background: white;
        }

        .sectionHeading {
          max-width: 760px;
          margin: 0 auto 48px;
          text-align: center;
        }

        .sectionHeading .eyebrow {
          margin-bottom: 14px;
        }

        .sectionHeading h2 {
          margin: 0;
          color: var(--navy-dark);
          font-size: clamp(32px, 4vw, 44px);
          line-height: 1.1;
          letter-spacing: -0.035em;
        }

        .sectionHeading p {
          margin: 18px auto 0;
          max-width: 680px;
          color: #66788e;
          font-size: 15px;
          line-height: 1.7;
        }

        .overviewGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
        }

        .overviewCard {
          padding: 34px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: white;
          box-shadow: 0 8px 26px rgba(24, 53, 84, 0.05);
        }

        .cardNumber {
          margin-bottom: 20px;
          color: var(--green-dark);
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.15em;
        }

        .overviewCard h3 {
          margin: 0;
          color: var(--navy-dark);
          font-size: 23px;
          letter-spacing: -0.02em;
        }

        .overviewCard > p {
          margin: 14px 0 20px;
          color: #62748a;
          font-size: 14px;
          line-height: 1.7;
        }

        .overviewCard ul {
          margin: 0;
          padding-left: 19px;
          color: #536980;
          font-size: 13px;
          line-height: 1.9;
        }

        .principlesGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .frameworkCard {
          min-height: 190px;
          padding: 28px;
          border: 1px solid #dbe6ef;
          border-radius: 14px;
          background: white;
        }

        .frameworkCheck {
          width: 34px;
          height: 34px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--green-light);
          color: var(--green-dark);
          font-size: 14px;
          font-weight: 900;
        }

        .frameworkCard h3 {
          margin: 0 0 10px;
          color: var(--navy-dark);
          font-size: 17px;
        }

        .frameworkCard p {
          margin: 0;
          color: #66788e;
          font-size: 13px;
          line-height: 1.7;
        }

        .reviewList {
          max-width: 900px;
          margin: 0 auto;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: white;
          box-shadow: 0 8px 28px rgba(24, 53, 84, 0.05);
        }

        .reviewRow {
          display: grid;
          grid-template-columns: 190px 1fr;
          gap: 28px;
          padding: 23px 28px;
          align-items: start;
        }

        .reviewRow + .reviewRow {
          border-top: 1px solid #e7edf3;
        }

        .reviewName {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--navy-dark);
          font-size: 14px;
          font-weight: 800;
        }

        .reviewName span {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: var(--green);
          color: white;
          font-size: 9px;
        }

        .reviewRow p {
          margin: 0;
          color: #62748a;
          font-size: 13px;
          line-height: 1.65;
        }

        .texasNotice {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: #f5f8fb;
        }

        .noticeInner {
          padding-top: 70px;
          padding-bottom: 70px;
        }

        .noticeInner > div {
          max-width: 820px;
        }

        .noticeInner h2 {
          margin: 0;
          color: var(--navy-dark);
          font-size: 34px;
          letter-spacing: -0.03em;
        }

        .noticeInner p {
          margin: 18px 0 0;
          color: #617389;
          font-size: 14px;
          line-height: 1.75;
        }

        .ctaSection {
          background: white;
        }

        .ctaInner {
          padding-top: 68px;
          padding-bottom: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 42px;
        }

        .ctaInner h2 {
          margin: 0;
          max-width: 700px;
          color: var(--navy-dark);
          font-size: 34px;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        .ctaInner p {
          margin: 12px 0 0;
          color: #66788e;
          font-size: 14px;
        }

        .footer {
          border-top: 1px solid var(--border);
          background: white;
        }

        .footerInner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 34px 28px;
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 34px;
        }

        .footerBrand {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .footerLogo {
          width: 145px;
          display: block;
        }

        .footerBrand p {
          margin: 0;
          max-width: 320px;
          color: #718095;
          font-size: 11px;
          line-height: 1.5;
        }

        .footerLinks {
          display: flex;
          gap: 22px;
          color: #40546d;
          font-size: 12px;
          font-weight: 650;
        }

        .copyright {
          color: #8794a5;
          font-size: 11px;
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .heroGrid {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .texasVisual {
            max-width: 620px;
          }

          .principlesGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .ctaInner {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 650px) {
          .texasNavInner {
            height: 72px;
            padding: 0 20px;
          }

          .logo {
            width: 155px;
          }

          .navActions > a:first-child {
            display: none;
          }

          .texasContainer {
            padding-left: 20px;
            padding-right: 20px;
          }

          .heroGrid {
            padding-top: 58px;
            padding-bottom: 62px;
          }

          h1 {
            font-size: 43px;
          }

          .intro {
            font-size: 16px;
          }

          .texasVisual {
            padding: 26px;
          }

          .overviewSection,
          .principlesSection,
          .sectionsSection {
            padding: 62px 0;
          }

          .overviewGrid,
          .principlesGrid {
            grid-template-columns: 1fr;
          }

          .overviewCard {
            padding: 26px;
          }

          .sectionHeading {
            margin-bottom: 36px;
          }

          .sectionHeading h2 {
            font-size: 32px;
          }

          .reviewRow {
            grid-template-columns: 1fr;
            gap: 10px;
            padding: 20px;
          }

          .noticeInner {
            padding-top: 54px;
            padding-bottom: 54px;
          }

          .noticeInner h2 {
            font-size: 30px;
          }

          .ctaInner {
            padding-top: 54px;
            padding-bottom: 54px;
          }

          .ctaInner h2 {
            font-size: 30px;
          }

          .footerInner {
            padding: 30px 20px;
            grid-template-columns: 1fr;
            gap: 22px;
          }

          .footerBrand {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .footerLinks {
            flex-wrap: wrap;
            gap: 16px;
          }

          .copyright {
            white-space: normal;
          }
        }
      `}</style>
    </main>
  );
}

function FrameworkCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="frameworkCard">
      <div className="frameworkCheck">✓</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ReviewRow({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div className="reviewRow">
      <div className="reviewName">
        <span>✓</span>
        {name}
      </div>

      <p>{description}</p>
    </div>
  );
}