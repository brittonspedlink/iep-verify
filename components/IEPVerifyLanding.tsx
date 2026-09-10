import Link from "next/link";

export default function IEPVerifyLanding() {
  return (
    <main className="landing">
      <header className="nav">
        <div className="navInner">
          <Link href="/" className="brand">
            <img
              src="/iep-verify-logo.png"
              alt="IEP Verify"
              className="logo"
            />
          </Link>

<nav className="navLinks">
  <Link href="/how-it-works">How It Works</Link>
  <Link href="/texas">Texas Framework</Link>
  <a href="#faq">FAQs</a>

  <Link href="/login" className="loginButton">
    Log In
  </Link>
</nav>
        </div>
      </header>

      <section className="hero">
        <div className="heroInner">
          <div className="heroCopy">
            <div className="eyebrow">
              INDEPENDENT IEP REVIEW PLATFORM
            </div>

            <h1>
              Review IEP documentation
              <span> with confidence.</span>
            </h1>

            <p className="heroText">
              IEP Verify provides an independent review of IEP documentation
              against available evidence and Texas special education standards —
              helping educators identify material gaps, confirm alignment, and
              know what needs attention before final review.
            </p>

            <div className="heroButtons">
              <Link href="/login" className="primaryButton">
                Log In to IEP Verify
                <span>→</span>
              </Link>

<Link href="/how-it-works" className="secondaryButton">
  See How It Works
</Link>
            </div>

            <p className="secureNote">
              Secure, password-free sign-in.
            </p>

            <div className="trustRow">
              <div className="trustItem">
                <span>✓</span>
                Evidence-based review
              </div>

              <div className="trustItem">
                <span>✓</span>
                Texas-focused framework
              </div>

              <div className="trustItem">
                <span>✓</span>
                Clear next steps
              </div>
            </div>
          </div>

<div className="heroVisual">
  <div className="laptopWrap">
    <div className="laptop">
      <div className="laptopScreen">
        <div className="workspacePreview">
          <aside className="workspaceSidebar">
            <div className="workspaceLogoCard">
              <img
                src="/iep-verify-logo.png"
                alt="IEP Verify"
                className="workspaceLogo"
              />
            </div>

            <div className="workspaceSidebarLabel">WORKSPACE</div>

            <div className="workspaceNavItem">
              <span className="workspaceNavIcon">▣</span>
              <span>Dashboard</span>
            </div>

            <div className="workspaceNavItem">
              <span className="workspaceNavIcon">＋</span>
              <span>New Audit</span>
            </div>

            <div className="workspaceNavItem active">
              <span className="workspaceNavIcon">✓</span>
              <span>Audit History</span>
            </div>

            <div className="workspaceNavItem">
              <span className="workspaceNavIcon">↪</span>
              <span>Sign out</span>
            </div>
          </aside>

          <div className="workspaceMain">
            <div className="workspaceTopBar">
              <div>
                <div className="workspaceEyebrow">AUDIT REPORT</div>
                <h3>Avery Morgan · Annual IEP Review</h3>
                <p>Completed Aug 31, 2026</p>
              </div>

              <div className="workspacePill">Ready for Review</div>
            </div>

            <div className="workspaceScoreGrid">
              <div className="workspaceScoreCard">
                <span>Overall Score</span>
                <strong className="scoreGreen">99</strong>
              </div>

              <div className="workspaceScoreCard">
                <span>Evidence Readiness</span>
                <strong>100</strong>
              </div>

              <div className="workspaceScoreCard">
                <span>Documentation Alignment</span>
                <strong>97</strong>
              </div>
            </div>

            <div className="workspaceSectionCard">
              <div className="workspaceSectionLabel">OVERALL REVIEW</div>
              <h4>Audit Summary</h4>
              <p>
                The IEP documentation generally aligns well with the source
                evidence. Key student needs are reflected across the reviewed
                sections, and supports are tied to documented needs.
              </p>
            </div>

            <div className="workspaceBottomRow">
              <div className="workspaceSectionCard compact">
                <div className="workspaceSectionLabel">PRIORITY FINDINGS</div>
                <h4>Critical Gaps</h4>
                <div className="workspaceMiniRow">
                  <p>No critical gaps were identified in this audit.</p>
                  <span className="workspaceCountPill">0</span>
                </div>
              </div>

              <div className="workspaceSectionCard compact">
                <div className="workspaceSectionLabel">SECTION REVIEW</div>
                <h4>Document Reviews</h4>

                <div className="docReviewRow">
                  <span>Goals</span>
                  <div className="docReviewBadges">
                    <span className="miniScore">100</span>
                    <span className="miniStatus">Verified</span>
                  </div>
                </div>

                <div className="docReviewRow">
                  <span>PLAAFP</span>
                  <div className="docReviewBadges">
                    <span className="miniScore">98</span>
                    <span className="miniStatus">Verified</span>
                  </div>
                </div>

                <div className="docReviewRow">
                  <span>Accommodations</span>
                  <div className="docReviewBadges">
                    <span className="miniScore">95</span>
                    <span className="miniStatus">Aligned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>

      <div className="laptopBase">
        <div className="laptopNotch" />
      </div>
    </div>
  </div>
</div>
</div>
</section>

<section className="valueSection">
  <div className="valueSectionInner">
    <div className="valueHeading">
      <div className="eyebrow">BUILT FOR TEXAS EDUCATORS</div>

      <h2>
        A clearer path to supported IEP documentation.
      </h2>
    </div>

    <div className="valueGrid">
      <div className="valueCard">
        <div className="valueIcon">✓</div>

        <h3>Evidence-Based Review</h3>

        <p>
          Compare IEP documentation against available evidence to identify
          meaningful gaps and areas that need attention.
        </p>
      </div>

      <div className="valueCard">
        <div className="valueIcon texasValueIcon">
  <img
    src="/blue_texas_outline_icon.png"
    alt="Texas"
    className="texasIconImage"
  />
</div>

        <h3>Texas-Focused Framework</h3>

        <p>
          Review documentation using a framework aligned with TEA guidance
          and Texas special education documentation practices.
        </p>
      </div>

      <div className="valueCard">
        <div className="valueIcon">→</div>

        <h3>Actionable Next Steps</h3>

        <p>
          See what is aligned, what needs attention, and what to review next.
        </p>
      </div>
    </div>
  </div>
</section>

<section id="faq" className="faqSection">
  <div className="faqInner">
    <div className="faqHeading">
      <div className="eyebrow">FREQUENTLY ASKED QUESTIONS</div>

      <h2>Questions about IEP Verify.</h2>

      <p>
        Learn how IEP Verify reviews documentation, uses available evidence,
        and supports professional educator review.
      </p>
    </div>

    <div className="faqList">
      <details className="faqItem">
        <summary>What does IEP Verify review?</summary>
        <p>
          IEP Verify compares submitted IEP documentation against the available
          supporting evidence to identify alignment, material gaps, and areas
          that may need educator attention.
        </p>
      </details>

      <details className="faqItem">
        <summary>Does IEP Verify determine legal compliance?</summary>
        <p>
          No. IEP Verify supports professional documentation review. It does not
          certify legal compliance, replace educator judgment, or verify that
          services and accommodations were implemented.
        </p>
      </details>

      <details className="faqItem">
        <summary>What evidence can be reviewed?</summary>
        <p>
          Reviews may include available teacher, parent, and student input,
          case notes, evaluation information, and other supporting records
          provided with the IEP documentation.
        </p>
      </details>

      <details className="faqItem">
        <summary>Is IEP Verify designed for Texas educators?</summary>
        <p>
          Yes. The current review framework is designed for Texas educators and
          reflects Texas Education Agency guidance and Texas special education
          documentation practices.
        </p>
      </details>

      <details className="faqItem">
        <summary>Does IEP Verify replace educator review?</summary>
        <p>
          No. IEP Verify is designed to help qualified educators review
          documentation more efficiently and identify areas that deserve
          professional attention.
        </p>
      </details>
    </div>
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

    <div className="footerCopyright">
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
          text-decoration: none;
          color: inherit;
        }

        .landing {
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

        .nav {
          width: 100%;
          border-bottom: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.97);
        }

        .navInner {
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

        .navLinks {
          display: flex;
          align-items: center;
          gap: 32px;
          font-size: 14px;
          font-weight: 650;
          color: #334761;
        }

        .loginButton {
          padding: 12px 22px;
          border-radius: 9px;
          background: var(--navy);
          color: white;
        }

        .hero {
          background:
            radial-gradient(
              circle at 82% 30%,
              rgba(85, 167, 124, 0.12),
              transparent 30%
            ),
            linear-gradient(180deg, #ffffff 0%, #f7fafd 100%);
        }

        .heroInner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 96px 28px 72px;
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 42px;
          align-items: center;
        }

        .eyebrow {
          margin-bottom: 20px;
          color: var(--green-dark);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.22em;
        }

        .hero h1 {
          margin: 0;
          max-width: 620px;
          color: var(--navy-dark);
          font-size: clamp(48px, 5vw, 68px);
          line-height: 1.03;
          letter-spacing: -0.045em;
        }

        .hero h1 span {
          color: var(--green);
        }

        .heroText {
          max-width: 620px;
          margin: 28px 0 32px;
          color: #53647b;
          font-size: 18px;
          line-height: 1.7;
        }

        .heroButtons {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
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
          box-shadow: 0 10px 24px rgba(23, 63, 117, 0.16);
        }

        .secondaryButton {
          padding: 0 22px;
          border: 1px solid var(--border);
          background: white;
          color: #344963;
        }

        .secureNote {
          margin-top: 12px;
          color: #7b899a;
          font-size: 12px;
        }

.trustRow {
  margin-top: 36px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 14px;
  color: #586a80;
  font-size: 11px;
  font-weight: 600;
}

.trustItem {
  white-space: nowrap;
}

        .trustItem {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .trustItem span {
          width: 21px;
          height: 21px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--green);
          color: white;
          font-size: 11px;
          font-weight: 900;
        }

.heroVisual {
  position: relative;
  min-width: 0;
}

.laptopWrap {
  position: relative;
  width: 100%;
}

.laptop {
  position: relative;
  width: 100%;
  max-width: 740px;
  margin: 0 auto;
}

.laptopScreen {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border: 11px solid #171c23;
  border-bottom-width: 15px;
  border-radius: 18px 18px 10px 10px;
  background: #eef3f9;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 34px 65px rgba(17, 35, 58, 0.18),
    0 10px 24px rgba(17, 35, 58, 0.12);
}

.laptopScreen::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    118deg,
    rgba(255, 255, 255, 0.13) 0%,
    rgba(255, 255, 255, 0.03) 25%,
    transparent 45%
  );
}

.workspacePreview {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 24% 76%;
  background: #f3f6fa;
}

.workspaceSidebar {
  height: 100%;
  padding: 14px 11px;
  background: #1f4a80;
  color: white;
}

.workspaceLogoCard {
  height: 72px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: white;
}

.workspaceLogo {
  width: 84%;
  height: auto;
}

.workspaceSidebarLabel {
  margin: 0 5px 9px;
  color: #cfe1f5;
  font-size: 6px;
  font-weight: 800;
  letter-spacing: 0.22em;
}

.workspaceNavItem {
  min-height: 27px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 7px;
  border-radius: 7px;
  color: #f4f8fc;
  font-size: 7px;
  font-weight: 600;
}

.workspaceNavItem + .workspaceNavItem {
  margin-top: 4px;
}

.workspaceNavItem.active {
  background: rgba(255, 255, 255, 0.13);
}

.workspaceNavIcon {
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 7px;
}

.workspaceMain {
  padding: 18px 18px 15px;
  overflow: hidden;
}

.workspaceTopBar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.workspaceEyebrow,
.workspaceSectionLabel {
  margin-bottom: 4px;
  color: #4b9c72;
  font-size: 5px;
  font-weight: 850;
  letter-spacing: 0.2em;
}

.workspaceTopBar h3 {
  margin: 0;
  color: #0d213c;
  font-size: 13px;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.workspaceTopBar p {
  margin: 4px 0 0;
  color: #7b8aa0;
  font-size: 6px;
}

.workspacePill {
  flex-shrink: 0;
  padding: 5px 7px;
  border: 1px solid #b8d4f6;
  border-radius: 999px;
  background: #f4f9ff;
  color: #173f75;
  font-size: 5px;
  font-weight: 750;
}

.workspaceScoreGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.workspaceScoreCard {
  min-height: 60px;
  padding: 10px;
  border: 1px solid #dce5ef;
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 4px rgba(20, 45, 75, 0.04);
}

.workspaceScoreCard span {
  display: block;
  margin-bottom: 7px;
  color: #60728a;
  font-size: 6px;
}

.workspaceScoreCard strong {
  color: #0c1524;
  font-size: 18px;
  line-height: 1;
}

.workspaceScoreCard .scoreGreen {
  color: #108755;
}

.workspaceSectionCard {
  padding: 11px 13px;
  border: 1px solid #dce5ef;
  border-radius: 11px;
  background: white;
  box-shadow: 0 2px 4px rgba(20, 45, 75, 0.035);
}

.workspaceSectionCard h4 {
  margin: 0;
  color: #111c2c;
  font-size: 8px;
}

.workspaceSectionCard p {
  margin: 6px 0 0;
  color: #566981;
  font-size: 5.7px;
  line-height: 1.55;
}

.workspaceBottomRow {
  margin-top: 9px;
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 8px;
}

.workspaceSectionCard.compact {
  padding: 10px 11px;
}

.workspaceMiniRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 7px;
}

.workspaceCountPill {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #eff4f9;
  color: #456079;
  font-size: 6px;
  font-weight: 700;
}

.docReviewRow {
  min-height: 22px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 4px 6px;
  border: 1px solid #e7edf3;
  border-radius: 6px;
  background: #f8fafc;
  color: #233b59;
  font-size: 5.5px;
  font-weight: 700;
}

.docReviewBadges {
  display: flex;
  gap: 3px;
}

.miniScore,
.miniStatus {
  padding: 2px 4px;
  border-radius: 999px;
  font-size: 4.5px;
  font-weight: 800;
}

.miniScore {
  background: #dff8e9;
  color: #118251;
}

.miniStatus {
  border: 1px solid #b8ead0;
  background: #f5fff9;
  color: #118251;
}

.laptopBase {
  position: relative;
  width: 102%;
  height: 20px;
  margin-left: -1%;
  margin-top: -1px;
  border-radius: 2px 2px 16px 16px;
  background: linear-gradient(
    180deg,
    #eef1f3 0%,
    #cbd0d5 35%,
    #9da5ad 72%,
    #7b838c 100%
  );
  box-shadow:
    0 14px 20px rgba(16, 32, 52, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.laptopBase::before {
  content: "";
  position: absolute;
  left: 2%;
  right: 2%;
  bottom: -3px;
  height: 5px;
  border-radius: 0 0 50% 50%;
  background: rgba(70, 78, 88, 0.22);
  filter: blur(2px);
}

.laptopBase::after {
  content: "";
  position: absolute;
  left: 6%;
  right: 6%;
  top: 2px;
  height: 1px;
  background: rgba(255, 255, 255, 0.75);
}

.laptopNotch {
  position: absolute;
  top: 0;
  left: 50%;
  width: 76px;
  height: 6px;
  transform: translateX(-50%);
  border-radius: 0 0 8px 8px;
  background: linear-gradient(
    180deg,
    #9199a2,
    #737b84
  );
}
  .valueSection {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background:
    linear-gradient(180deg, #f7fbff 0%, #eef5fb 100%);
}

.valueSectionInner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 52px 28px 72px;
}

.valueHeading {
  max-width: 760px;
  margin: 0 auto 44px;
  text-align: center;
}

.valueHeading .eyebrow {
  margin-bottom: 14px;
}

.valueHeading h2 {
  margin: 0;
  color: var(--navy-dark);
  font-size: clamp(30px, 3.5vw, 42px);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.valueGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.valueCard {
  text-align: center;
  padding: 6px 18px 0;
}

.valueIcon {
  width: 62px;
  height: 62px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #d4e1ec;
  background: white;
  color: var(--navy);
  box-shadow:
    0 10px 24px rgba(25, 55, 88, 0.09),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  font-size: 19px;
  font-weight: 900;
}

.valueCard:first-child .valueIcon {
  background: var(--green);
  border-color: var(--green);
  color: white;
}

.valueCard:nth-child(3) .valueIcon {
  background: var(--navy);
  border-color: var(--navy);
  color: white;
}

.texasValueIcon {
  background: #edf4fb;
  color: var(--navy);
}

.texasValueIcon svg {
  width: 32px;
  height: 32px;
  display: block;
  fill: currentColor;
}

.valueCard h3 {
  margin: 0 0 10px;
  color: var(--navy-dark);
  font-size: 17px;
}

.valueCard p {
  margin: 0 auto;
  max-width: 300px;
  color: #66788e;
  font-size: 13px;
  line-height: 1.65;
}
  .faqSection {
  background: #ffffff;
  border-bottom: 1px solid var(--border);
}

.faqInner {
  max-width: 960px;
  margin: 0 auto;
  padding: 82px 28px 88px;
}

.faqHeading {
  max-width: 680px;
  margin: 0 auto 42px;
  text-align: center;
}

.faqHeading .eyebrow {
  margin-bottom: 14px;
}

.faqHeading h2 {
  margin: 0;
  color: var(--navy-dark);
  font-size: clamp(32px, 3.5vw, 44px);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.faqHeading p {
  margin: 16px auto 0;
  max-width: 620px;
  color: #66788e;
  font-size: 15px;
  line-height: 1.7;
}

.faqList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faqItem {
  overflow: hidden;
  border: 1px solid #dce5ef;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(25, 55, 88, 0.04);
}

.faqItem summary {
  position: relative;
  padding: 20px 52px 20px 22px;
  cursor: pointer;
  list-style: none;
  color: var(--navy-dark);
  font-size: 15px;
  font-weight: 750;
}

.faqItem summary::-webkit-details-marker {
  display: none;
}

.faqItem summary::after {
  content: "+";
  position: absolute;
  top: 50%;
  right: 22px;
  transform: translateY(-50%);
  color: var(--green-dark);
  font-size: 22px;
  font-weight: 500;
}

.faqItem[open] summary::after {
  content: "−";
}

.faqItem[open] summary {
  border-bottom: 1px solid #e6edf3;
}

.faqItem p {
  margin: 0;
  padding: 18px 22px 22px;
  color: #62748a;
  font-size: 14px;
  line-height: 1.7;
}
  .footer {
  border-top: 1px solid var(--border);
  background: #ffffff;
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
  height: auto;
  display: block;
}

.footerBrand p {
  margin: 0;
  max-width: 340px;
  color: #718095;
  font-size: 11px;
  line-height: 1.5;
}

.footerLinks {
  display: flex;
  align-items: center;
  gap: 22px;
  color: #40546d;
  font-size: 12px;
  font-weight: 650;
}

.footerLinks a:hover {
  color: var(--navy);
}

.footerCopyright {
  color: #8794a5;
  font-size: 11px;
  white-space: nowrap;
}
  @media (max-width: 1050px) {
  .heroInner {
    grid-template-columns: 1fr;
    gap: 58px;
  }

  .heroCopy {
    max-width: 680px;
  }

  .heroVisual {
    width: 100%;
    max-width: 740px;
    margin: 0 auto;
  }

  .laptopWrap {
    transform: none;
  }
}

@media (max-width: 650px) {
  .navInner {
    height: 72px;
    padding: 0 20px;
  }

  .logo {
    width: 155px;
  }

  .navLinks {
    gap: 12px;
  }

  .navLinks > a:not(.loginButton) {
    display: none;
  }

  .loginButton {
    padding: 10px 16px;
  }

  .heroInner {
    padding: 64px 24px 72px;
    gap: 46px;
  }

  .hero h1 {
    font-size: 46px;
  }

  .heroText {
    font-size: 16px;
  }

  .heroButtons {
    align-items: stretch;
  }

  .trustRow {
    flex-wrap: wrap;
    row-gap: 12px;
  }

  .heroVisual {
    width: 100%;
  }

  .laptop {
    width: 100%;
  }
    .faqInner {
  padding: 62px 20px 68px;
}

.faqHeading {
  margin-bottom: 32px;
}

.faqHeading h2 {
  font-size: 32px;
}

.faqItem summary {
  padding: 18px 48px 18px 18px;
}

.faqItem p {
  padding: 16px 18px 20px;
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

.footerCopyright {
  white-space: normal;
}

      `}</style>
    </main>
  );
}

function ResultRow({
  label,
  score,
}: {
  label: string;
  score: string;
}) {
  return (
    <div className="resultRow">
      <span className="resultCheck">✓</span>
      <strong>{label}</strong>
      <b>{score}</b>
    </div>
  );
}