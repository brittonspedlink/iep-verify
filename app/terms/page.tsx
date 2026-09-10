import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="termsPage">
      <header className="termsNav">
        <div className="termsNavInner">
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

      <section className="termsHero">
        <div className="termsContainer">
          <div className="eyebrow">IEP VERIFY</div>

          <h1>Terms of Service</h1>

          <p className="effectiveDate">
            Effective date: September 8, 2026
          </p>

          <p className="intro">
            These Terms of Service govern access to and use of IEP Verify.
            IEP Verify is a professional documentation review platform designed
            to help authorized education professionals compare IEP
            documentation against available supporting evidence and identify
            areas that may require further review.
          </p>
        </div>
      </section>

      <section className="termsContent">
        <div className="termsContainer policyLayout">
          <div className="policyCard">
            <PolicySection title="1. Acceptance of These Terms">
              <p>
                By accessing or using IEP Verify, you agree to these Terms of
                Service. If you are using IEP Verify on behalf of a school,
                district, education organization, or other entity, you represent
                that you are authorized to use the service in connection with
                that organization.
              </p>
            </PolicySection>

            <PolicySection title="2. Authorized Use">
              <p>
                IEP Verify is intended for authorized education professionals
                and other approved users engaged in legitimate educational,
                administrative, or documentation-review activities.
              </p>

              <p>
                Users must access and use IEP Verify only in accordance with
                applicable organizational policies, agreements, and legal
                requirements.
              </p>
            </PolicySection>

            <PolicySection title="3. Professional Documentation Review">
              <p>
                IEP Verify provides an independent review of submitted IEP
                documentation against the supporting information made available
                for the review.
              </p>

              <p>
                IEP Verify does not replace educator judgment, an ARD or IEP
                team, legal counsel, district decision-making, or other
                qualified professional review.
              </p>
            </PolicySection>

            <PolicySection title="4. No Determination of Legal Compliance">
              <p>
                IEP Verify does not certify that an IEP or other educational
                record is legally compliant. Review findings are intended to
                help users identify documentation alignment, material gaps, and
                areas that may deserve professional attention.
              </p>

              <p>
                Responsibility for final educational decisions, documentation,
                implementation, and legal compliance remains with the
                appropriate educators, school systems, and other responsible
                professionals.
              </p>
            </PolicySection>

            <PolicySection title="5. Submitted Information">
              <p>
                Users are responsible for ensuring they are authorized to
                submit information to IEP Verify. Submitted materials may
                include IEP documentation, evaluation information, educator
                notes, survey responses, supporting evidence, and other
                education records used in connection with a review.
              </p>

              <p>
                Users should submit only information reasonably necessary for
                the intended review and should follow applicable district or
                organizational requirements for handling student information.
              </p>
            </PolicySection>

            <PolicySection title="6. Ownership and Control of Data">
              <p>
                Schools, districts, education organizations, and their
                authorized users retain ownership and control of the student
                information and educational records they submit to IEP Verify.
              </p>

              <p>
                IEP Verify does not claim ownership of submitted student or
                district records.
              </p>
            </PolicySection>

            <PolicySection title="7. Artificial Intelligence">
              <p>
                IEP Verify may use artificial intelligence and automated
                processing as part of its documentation-review functions.
                Automated findings are intended to support, not replace,
                professional educator review.
              </p>

              <p>
                Student data submitted to IEP Verify is not used to train AI
                models.
              </p>
            </PolicySection>

            <PolicySection title="8. User Responsibilities">
              <p>
                Users are responsible for reviewing IEP Verify findings before
                relying on them in professional work. Users should exercise
                independent judgment and verify information when appropriate.
              </p>

              <p>
                Users are also responsible for protecting access to their
                accounts, email accounts, secure sign-in links, and devices used
                to access IEP Verify.
              </p>
            </PolicySection>

            <PolicySection title="9. Prohibited Use">
              <p>
                Users may not use IEP Verify to gain unauthorized access to
                student information, interfere with the operation or security
                of the service, attempt to bypass access controls, submit
                information they are not authorized to use, or use the service
                for unlawful purposes.
              </p>
            </PolicySection>

            <PolicySection title="10. Availability and Changes to the Service">
              <p>
                We may update, improve, modify, suspend, or discontinue portions
                of IEP Verify as the platform evolves. We may also perform
                maintenance or make changes necessary to protect the reliability
                and security of the service.
              </p>
            </PolicySection>

            <PolicySection title="11. Review Results and Accuracy">
              <p>
                IEP Verify is designed to provide useful documentation-review
                findings based on the information supplied. Results may be
                affected by incomplete, inaccurate, missing, or unclear source
                information.
              </p>

              <p>
                Users should not assume that the absence of a flagged issue
                establishes that all requirements have been satisfied.
              </p>
            </PolicySection>

            <PolicySection title="12. Third-Party Services">
              <p>
                IEP Verify may rely on third-party technology and infrastructure
                providers to host, process, secure, transmit, or support the
                service. Use of such providers is limited to functions necessary
                to operate and support IEP Verify.
              </p>
            </PolicySection>

            <PolicySection title="13. Privacy">
              <p>
                Our handling of information submitted through IEP Verify is
                described in the IEP Verify Privacy Policy.
              </p>

              <Link href="/privacy" className="inlineLink">
                View Privacy Policy →
              </Link>
            </PolicySection>

            <PolicySection title="14. Disclaimer">
              <p>
                IEP Verify is provided as a professional documentation-review
                tool. To the extent permitted by applicable law, the service is
                provided without guarantees that every possible documentation
                issue, error, omission, or compliance concern will be
                identified.
              </p>
            </PolicySection>

            <PolicySection title="15. Limitation of Responsibility">
              <p>
                Final decisions regarding an IEP, student services,
                accommodations, educational programming, documentation, and
                implementation remain the responsibility of the appropriate
                educators, school systems, and other authorized professionals.
              </p>
            </PolicySection>

            <PolicySection title="16. Changes to These Terms">
              <p>
                We may update these Terms as IEP Verify evolves or as
                operational, contractual, legal, or security requirements
                change. The effective date at the top of this page will be
                updated when material revisions are made.
              </p>
            </PolicySection>

            <PolicySection title="17. Questions">
              <p>
                Questions regarding these Terms or use of IEP Verify may be
                directed through IEP Verify&apos;s established support or
                administrative contact.
              </p>
            </PolicySection>
          </div>

          <aside className="termsAside">
            <div className="asideCard">
              <div className="asideLabel">IMPORTANT</div>

              <div className="asideItem">
                <span>✓</span>
                IEP Verify supports professional documentation review.
              </div>

              <div className="asideItem">
                <span>✓</span>
                Educators remain responsible for final decisions.
              </div>

              <div className="asideItem">
                <span>✓</span>
                Review results depend on the evidence provided.
              </div>

              <div className="asideItem">
                <span>✓</span>
                IEP Verify does not certify legal compliance.
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

        .termsPage {
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

        .termsNav {
          border-bottom: 1px solid var(--border);
          background: white;
        }

        .termsNavInner {
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

        .termsHero {
          border-bottom: 1px solid var(--border);
          background:
            radial-gradient(
              circle at 78% 20%,
              rgba(85, 167, 124, 0.11),
              transparent 30%
            ),
            linear-gradient(180deg, #ffffff, #f6f9fc);
        }

        .termsContainer {
          max-width: 1120px;
          margin: 0 auto;
          padding-left: 28px;
          padding-right: 28px;
        }

        .termsHero .termsContainer {
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

        .termsContent {
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

        .inlineLink {
          display: inline-block;
          margin-top: 14px;
          color: var(--navy);
          font-size: 13px;
          font-weight: 750;
        }

        .termsAside {
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

          .termsAside {
            position: static;
          }
        }

        @media (max-width: 650px) {
          .termsNavInner {
            height: 72px;
            padding: 0 20px;
          }

          .logo {
            width: 155px;
          }

          .navActions > a:first-child {
            display: none;
          }

          .termsContainer {
            padding-left: 20px;
            padding-right: 20px;
          }

          .termsHero .termsContainer {
            padding-top: 56px;
            padding-bottom: 54px;
          }

          .intro {
            font-size: 16px;
          }

          .termsContent {
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