"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import GoogleAnalytics from "@/components/GoogleAnalytics";

type FormState = {
  name: string;
  organization: string;
  role: string;
  email: string;
  phone: string;
  message: string;
  website: string;
};

const initialForm: FormState = {
  name: "",
  organization: "",
  role: "",
  email: "",
  phone: "",
  message: "",
  website: "",
};

export default function RequestDemoPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/request-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to submit your request.");
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
        <GoogleAnalytics />
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
            <Link href="/">Home</Link>

            <Link href="/login" className="loginButton">
              Log In
            </Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="heroInner">
          <div className="intro">
            <div className="eyebrow">REQUEST A DEMO</div>

            <h1>See IEP Verify in action.</h1>

            <p className="lead">
              Tell us a little about your organization and we&apos;ll follow up
              to schedule a conversation and product walkthrough.
            </p>

            <div className="texasNotice">
              <div className="texasIcon">TX</div>

              <div>
                <strong>Currently available in Texas</strong>
                <p>
                  IEP Verify is currently accepting demo requests from Texas
                  educators, schools, districts, and education organizations.
                </p>
              </div>
            </div>

            <div className="expectations">
              <div className="expectation">
                <span>✓</span>
                <div>
                  <strong>See the complete workflow</strong>
                  <p>
                    From evidence upload through documentation review and audit
                    findings.
                  </p>
                </div>
              </div>

              <div className="expectation">
                <span>✓</span>
                <div>
                  <strong>Ask questions about your use case</strong>
                  <p>
                    We&apos;ll focus the conversation on how your team currently
                    reviews IEP documentation.
                  </p>
                </div>
              </div>

              <div className="expectation">
                <span>✓</span>
                <div>
                  <strong>Texas-focused review framework</strong>
                  <p>
                    The current IEP Verify review framework is designed for
                    Texas educators.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="formCard">
            {!success ? (
              <>
                <div className="formHeading">
                  <div className="eyebrow">TEXAS DEMO REQUEST</div>
                  <h2>Request a conversation</h2>
                  <p>
                    Complete the form below and we&apos;ll contact you about a
                    demo.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Honeypot field — hidden from real users */}
                  <div className="honeypot" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) => updateField("website", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="organization">
                      Texas district or organization
                    </label>
                    <input
                      id="organization"
                      type="text"
                      required
                      value={form.organization}
                      onChange={(e) =>
                        updateField("organization", e.target.value)
                      }
                      placeholder="District, school, ESC, or organization"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="role">Role</label>
                    <input
                      id="role"
                      type="text"
                      required
                      value={form.role}
                      onChange={(e) => updateField("role", e.target.value)}
                      placeholder="Your role"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="email">Work email</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="you@district.org"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="phone">
                      Phone <span>Optional</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="message">
                      What would you like to discuss? <span>Optional</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      placeholder="Tell us anything that would be helpful before the demo."
                    />
                  </div>

                  {error && <div className="errorMessage">{error}</div>}

                  <button
                    type="submit"
                    className="submitButton"
                    disabled={submitting}
                  >
                    {submitting ? "Sending Request..." : "Request a Demo →"}
                  </button>

                  <p className="privacyNote">
                    Your information is used only to respond to your demo
                    request.
                  </p>
                </form>
              </>
            ) : (
              <div className="successState">
                <div className="successIcon">✓</div>

                <div className="eyebrow">REQUEST RECEIVED</div>

                <h2>Thanks for your interest in IEP Verify.</h2>

                <p>
                  Your demo request has been received. We&apos;ll follow up with
                  you directly.
                </p>

                <Link href="/" className="homeButton">
                  Return to IEP Verify
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footerInner">
          <div>
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
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(body) {
          margin: 0;
        }

        :global(a) {
          text-decoration: none;
          color: inherit;
        }

        .page {
          min-height: 100vh;
          background: #f4f7fb;
          color: #10233f;
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
          background: rgba(255, 255, 255, 0.98);
          border-bottom: 1px solid #dce5ef;
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
          gap: 28px;
          color: #334761;
          font-size: 14px;
          font-weight: 650;
        }

        .loginButton {
          padding: 12px 22px;
          border-radius: 9px;
          background: #173f75;
          color: white;
        }

        .hero {
          background:
            radial-gradient(
              circle at 17% 24%,
              rgba(85, 167, 124, 0.11),
              transparent 28%
            ),
            linear-gradient(180deg, #ffffff 0%, #f3f7fb 100%);
        }

        .heroInner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 82px 28px 92px;
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 70px;
          align-items: start;
        }

        .intro {
          padding-top: 22px;
        }

        .eyebrow {
          color: #398860;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.22em;
          margin-bottom: 17px;
        }

        .intro h1 {
          max-width: 520px;
          margin: 0;
          color: #0d2e59;
          font-size: clamp(44px, 5vw, 62px);
          line-height: 1.03;
          letter-spacing: -0.045em;
        }

        .lead {
          max-width: 560px;
          margin: 27px 0 0;
          color: #596b82;
          font-size: 18px;
          line-height: 1.7;
        }

        .texasNotice {
          margin-top: 34px;
          max-width: 560px;
          display: flex;
          gap: 16px;
          padding: 19px 20px;
          border: 1px solid #bad3f3;
          border-radius: 14px;
          background: #edf5ff;
        }

        .texasIcon {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: white;
          color: #173f75;
          font-size: 13px;
          font-weight: 850;
          box-shadow: 0 3px 10px rgba(25, 55, 88, 0.06);
        }

        .texasNotice strong {
          color: #173f75;
          font-size: 15px;
        }

        .texasNotice p {
          margin: 6px 0 0;
          color: #566b84;
          font-size: 13px;
          line-height: 1.55;
        }

        .expectations {
          margin-top: 34px;
          max-width: 550px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .expectation {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .expectation > span {
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #dff6e9;
          color: #24845b;
          font-size: 13px;
          font-weight: 900;
        }

        .expectation strong {
          color: #183554;
          font-size: 14px;
        }

        .expectation p {
          margin: 5px 0 0;
          color: #6b7c91;
          font-size: 13px;
          line-height: 1.55;
        }

        .formCard {
          padding: 38px;
          border: 1px solid #d8e2ed;
          border-radius: 22px;
          background: white;
          box-shadow: 0 24px 60px rgba(20, 55, 100, 0.11);
        }

        .formHeading {
          margin-bottom: 28px;
        }

        .formHeading .eyebrow {
          margin-bottom: 10px;
        }

        .formHeading h2,
        .successState h2 {
          margin: 0;
          color: #10233f;
          font-size: 30px;
          letter-spacing: -0.025em;
        }

        .formHeading p,
        .successState p {
          margin: 10px 0 0;
          color: #65768b;
          font-size: 14px;
          line-height: 1.65;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field label {
          color: #183554;
          font-size: 13px;
          font-weight: 750;
        }

        .field label span {
          color: #8592a2;
          font-size: 11px;
          font-weight: 600;
        }

        .field input,
        .field textarea {
          width: 100%;
          border: 1px solid #cad7e6;
          border-radius: 10px;
          background: white;
          color: #122a48;
          font: inherit;
          font-size: 14px;
          outline: none;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .field input {
          height: 48px;
          padding: 0 14px;
        }

        .field textarea {
          padding: 13px 14px;
          resize: vertical;
          line-height: 1.55;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #5d83b3;
          box-shadow: 0 0 0 3px rgba(23, 63, 117, 0.08);
        }

        .field input::placeholder,
        .field textarea::placeholder {
          color: #98a5b6;
        }

        .submitButton {
          min-height: 52px;
          margin-top: 3px;
          border: 0;
          border-radius: 10px;
          background: #173f75;
          color: white;
          cursor: pointer;
          font-size: 15px;
          font-weight: 750;
          box-shadow: 0 10px 24px rgba(23, 63, 117, 0.16);
        }

        .submitButton:hover:not(:disabled) {
          background: #0f3567;
        }

        .submitButton:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .privacyNote {
          margin: -3px 0 0;
          text-align: center;
          color: #8592a2;
          font-size: 11px;
        }

        .errorMessage {
          padding: 13px 14px;
          border: 1px solid #f2b9b9;
          border-radius: 9px;
          background: #fff3f3;
          color: #a82f2f;
          font-size: 13px;
        }

        .successState {
          padding: 45px 5px;
          text-align: center;
        }

        .successIcon {
          width: 64px;
          height: 64px;
          margin: 0 auto 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #dff6e9;
          color: #24845b;
          font-size: 28px;
          font-weight: 900;
        }

        .successState .eyebrow {
          margin-bottom: 12px;
        }

        .successState p {
          max-width: 420px;
          margin: 15px auto 0;
        }

        .homeButton {
          margin-top: 28px;
          display: inline-flex;
          padding: 13px 22px;
          border-radius: 9px;
          background: #173f75;
          color: white;
          font-size: 14px;
          font-weight: 750;
        }

        .honeypot {
          position: absolute;
          left: -9999px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .footer {
          border-top: 1px solid #dce5ef;
          background: white;
        }

        .footerInner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 34px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .footerLogo {
          width: 145px;
          height: auto;
        }

        .footerInner p {
          margin: 8px 0 0;
          color: #718095;
          font-size: 11px;
        }

        .footerLinks {
          display: flex;
          gap: 22px;
          color: #40546d;
          font-size: 12px;
          font-weight: 650;
        }

        @media (max-width: 900px) {
          .heroInner {
            grid-template-columns: 1fr;
            gap: 50px;
          }

          .intro {
            padding-top: 0;
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

          .heroInner {
            padding: 55px 20px 70px;
          }

          .intro h1 {
            font-size: 44px;
          }

          .formCard {
            padding: 26px 20px;
          }

          .footerInner {
            padding: 30px 20px;
            flex-direction: column;
            align-items: flex-start;
          }

          .footerLinks {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}