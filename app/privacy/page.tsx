import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="privacyPage">
      <header className="privacyNav">
        <div className="privacyNavInner">
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

      <section className="privacyHero">
        <div className="privacyContainer">
          <div className="eyebrow">IEP VERIFY</div>

          <h1>Privacy Policy</h1>

          <p className="effectiveDate">
            Effective date: September 8, 2026
          </p>

          <p className="intro">
            IEP Verify is designed to support education professionals in
            reviewing IEP documentation against available supporting evidence.
            We recognize that education records and student information require
            careful handling, and we are committed to protecting the
            information entrusted to the platform.
          </p>
        </div>
      </section>

      <section className="privacyContent">
        <div className="privacyContainer policyLayout">
          <div className="policyCard">
            <PolicySection title="1. Information We Process">
              <p>
                IEP Verify may process information submitted by authorized
                education professionals in connection with an IEP review.
                Depending on the materials provided, this information may
                include student identifiers, IEP documentation, evaluation
                information, educator notes, survey responses, supporting
                evidence, and audit results.
              </p>

              <p>
                We may also process account information such as a user&apos;s
                name, email address, organization, and information necessary to
                provide secure access to the platform.
              </p>
            </PolicySection>

            <PolicySection title="2. How Information Is Used">
              <p>
                Information submitted to IEP Verify is used to provide and
                operate the IEP review service, including processing submitted
                documentation, generating review findings, maintaining audit
                history, supporting authorized users, improving reliability,
                and protecting the security of the platform.
              </p>
            </PolicySection>

            <PolicySection title="3. Student and District Data">
              <p>
                Student information submitted through IEP Verify is used to
                provide the requested documentation review and related platform
                functions. Districts and education organizations retain
                ownership and control of the student information they provide.
              </p>

              <p>
                IEP Verify is designed to support districts&apos; obligations
                when working with protected student information. Each district
                or education organization remains responsible for determining
                its own legal, policy, and records-management requirements.
              </p>
            </PolicySection>

            <PolicySection title="4. Artificial Intelligence and Model Training">
              <p>
                Student data submitted to IEP Verify is not used to train AI
                models. Information submitted for a review is processed for the
                purpose of providing the requested IEP review and related
                platform functionality.
              </p>
            </PolicySection>

            <PolicySection title="5. Service Providers">
              <p>
                IEP Verify may use technology and infrastructure providers to
                host, secure, transmit, process, or support the service. These
                providers are used only as necessary to operate the platform and
                provide requested functionality.
              </p>
            </PolicySection>

            <PolicySection title="6. Security">
              <p>
                IEP Verify uses administrative, technical, and organizational
                safeguards intended to protect information from unauthorized
                access, disclosure, alteration, or loss.
              </p>

              <p>
                No technology system can guarantee absolute security. Users
                should follow their district&apos;s approved practices when
                accessing, uploading, downloading, or sharing student records.
              </p>
            </PolicySection>

            <PolicySection title="7. Data Retention">
              <p>
                Information may be retained as necessary to provide the service,
                maintain authorized audit records, support users, satisfy
                contractual requirements, and meet applicable legal or
                operational obligations.
              </p>

              <p>
                Retention requirements may also be governed by agreements with
                participating districts or education organizations.
              </p>
            </PolicySection>

            <PolicySection title="8. Access and Account Information">
              <p>
                Access to IEP Verify is intended for authorized users. Users are
                responsible for protecting access to their email account,
                secure sign-in links, and any device used to access IEP Verify.
              </p>
            </PolicySection>

            <PolicySection title="9. Professional Review">
              <p>
                IEP Verify supports professional documentation review. It does
                not replace educator judgment, determine whether an IEP is
                legally compliant, or verify that documented services,
                accommodations, or supports were implemented.
              </p>
            </PolicySection>

            <PolicySection title="10. Updates to This Policy">
              <p>
                We may update this Privacy Policy as the platform evolves or as
                legal, operational, or security requirements change. The
                effective date shown at the top of this page will be updated
                when material changes are made.
              </p>
            </PolicySection>

            <PolicySection title="11. Questions About Privacy">
              <p>
                Questions regarding privacy, student information, or district
                data practices may be directed to IEP Verify through the
                organization&apos;s established support or administrative
                contact.
              </p>
            </PolicySection>
          </div>

          <aside className="privacyAside">
            <div className="asideCard">
              <div className="asideLabel">PRIVACY PRINCIPLES</div>

              <div className="asideItem">
                <span>✓</span>
                Student data is not used to train AI models.
              </div>

              <div className="asideItem">
                <span>✓</span>
                Districts retain ownership and control of their data.
              </div>

              <div className="asideItem">
                <span>✓</span>
                Access is intended for authorized education professionals.
              </div>

              <div className="asideItem">
                <span>✓</span>
                IEP Verify supports professional review rather than replacing
                educator judgment.
              </div>
            </div>

            <Link href="/" className="backLink">
              ← Return to IEP Verify
            </Link>
          </aside>
        </div>
      </section>

      <footer className="footer">
        <div className="footerInner">
          <img
            src="/iep-verify-logo.png"
            alt="IEP Verify"
            className="footerLogo"
          />

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
          --text: #10233f;
          --muted: #65768c;
          --border: #dce5ef;
          --background: #f6f9fc;
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

        .privacyPage {
          min-height: 100vh;
          color: var(--text);
          background: white;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .privacyNav {
          border-bottom: 1px solid var(--border);
          background: white;
        }

        .privacyNavInner {
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
          color: white;
          background: var(--navy);
        }

        .privacyHero {
          border-bottom: 1px solid var(--border);
          background:
            radial-gradient(
              circle at 78% 20%,
              rgba(85, 167, 124, 0.11),
              transparent 30%
            ),
            linear-gradient(180deg, #ffffff, #f6f9fc);
        }

        .privacyContainer {
          max-width: 1120px;
          margin: 0 auto;
          padding-left: 28px;
          padding-right: 28px;
        }

        .privacyHero .privacyContainer {
          padding-top: 78px;
          padding-bottom: 70px;
        }

        .eyebrow {
          margin-bottom: 14px;
          color: var(--green-dark);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.22em;
        }

        h1 {
          margin: 0;
          color: var(--navy-dark);
          font-size: clamp(44px, 5vw, 62px);
          line-height: 1.05;
          letter-spacing: -0.04em;
        }

        .effectiveDate {
          margin: 16px 0 0;
          color: #8190a2;
          font-size: 13px;
        }

        .intro {
          max-width: 760px;
          margin: 28px 0 0;
          color: #566981;
          font-size: 17px;
          line-height: 1.75;
        }

        .privacyContent {
          padding: 72px 0 84px;
          background: var(--background);
        }

        .policyLayout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 36px;
          align-items: start;
        }

        .policyCard {
          padding: 46px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: white;
          box-shadow: 0 12px 36px rgba(26, 52, 80, 0.05);
        }

        .policySection + .policySection {
          margin-top: 38px;
          padding-top: 38px;
          border-top: 1px solid #e7edf3;
        }

        .policySection h2 {
          margin: 0 0 14px;
          color: var(--navy-dark);
          font-size: 21px;
          line-height: 1.3;
        }

        .policySection p {
          margin: 0;
          color: #5c6e84;
          font-size: 14px;
          line-height: 1.8;
        }

        .policySection p + p {
          margin-top: 14px;
        }

        .privacyAside {
          position: sticky;
          top: 28px;
        }

        .asideCard {
          padding: 28px;
          border: 1px solid #d7e4ee;
          border-radius: 16px;
          background: white;
          box-shadow: 0 10px 28px rgba(26, 52, 80, 0.05);
        }

        .asideLabel {
          margin-bottom: 20px;
          color: var(--green-dark);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.18em;
        }

        .asideItem {
          display: grid;
          grid-template-columns: 22px 1fr;
          gap: 10px;
          color: #566981;
          font-size: 12px;
          line-height: 1.55;
        }

        .asideItem + .asideItem {
          margin-top: 18px;
        }

        .asideItem span {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: white;
          background: var(--green);
          font-size: 10px;
          font-weight: 900;
        }

        .backLink {
          margin-top: 18px;
          display: inline-block;
          color: var(--navy);
          font-size: 12px;
          font-weight: 700;
        }

        .footer {
          border-top: 1px solid var(--border);
          background: white;
        }

        .footerInner {
          max-width: 1180px;
          min-height: 94px;
          margin: 0 auto;
          padding: 24px 28px;
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 30px;
          align-items: center;
        }

        .footerLogo {
          width: 140px;
          display: block;
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

        @media (max-width: 850px) {
          .policyLayout {
            grid-template-columns: 1fr;
          }

          .privacyAside {
            position: static;
          }
        }

        @media (max-width: 650px) {
          .privacyNavInner {
            height: 72px;
            padding: 0 20px;
          }

          .logo {
            width: 155px;
          }

          .navActions > a:first-child {
            display: none;
          }

          .privacyContainer {
            padding-left: 20px;
            padding-right: 20px;
          }

          .privacyHero .privacyContainer {
            padding-top: 56px;
            padding-bottom: 54px;
          }

          .intro {
            font-size: 16px;
          }

          .privacyContent {
            padding: 44px 0 56px;
          }

          .policyCard {
            padding: 28px 22px;
          }

          .footerInner {
            padding: 28px 20px;
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .footerLinks {
            flex-wrap: wrap;
          }

          .copyright {
            white-space: normal;
          }
        }
      `}</style>
    </main>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="policySection">
      <h2>{title}</h2>
      {children}
    </section>
  );
}