function clean(value: unknown) {
  return String(value ?? "").trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = clean(body.name);
    const organization = clean(body.organization);
    const role = clean(body.role);
    const email = clean(body.email);
    const phone = clean(body.phone);
    const message = clean(body.message);
    const website = clean(body.website);

    // Basic bot trap. Real users never see this field.
    if (website) {
      return Response.json({ success: true });
    }

    if (!name || !organization || !role || !email) {
      return Response.json(
        {
          error:
            "Please complete your name, Texas district or organization, role, and work email.",
        },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return Response.json(
        { error: "Please enter a valid work email address." },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY");

      return Response.json(
        { error: "Demo requests are temporarily unavailable." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "IEP Verify <noreply@iepverify.com>",
        to: ["brittondoss@spedlink.org"],
        reply_to: email,
        subject: `IEP Verify Demo Request — ${organization}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #10233f; max-width: 650px;">
            <h2 style="color: #173f75;">New IEP Verify Demo Request</h2>

            <p>A new Texas demo request was submitted through IEPVerify.com.</p>

            <table
              cellpadding="0"
              cellspacing="0"
              style="width: 100%; border-collapse: collapse; margin-top: 24px;"
            >
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                  Name
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                  ${escapeHtml(name)}
                </td>
              </tr>

              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                  Texas District / Organization
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                  ${escapeHtml(organization)}
                </td>
              </tr>

              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                  Role
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                  ${escapeHtml(role)}
                </td>
              </tr>

              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                  Work Email
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                  ${escapeHtml(email)}
                </td>
              </tr>

              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                  Phone
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                  ${phone ? escapeHtml(phone) : "Not provided"}
                </td>
              </tr>
            </table>

            <div style="margin-top: 24px;">
              <strong>Message</strong>

              <div
                style="
                  margin-top: 8px;
                  padding: 16px;
                  background: #f4f7fb;
                  border: 1px solid #dce5ef;
                  border-radius: 8px;
                  white-space: pre-wrap;
                "
              >${message ? escapeHtml(message) : "No message provided."}</div>
            </div>

            <p style="margin-top: 28px; color: #66788e; font-size: 12px;">
              Submitted through the IEP Verify Texas Request a Demo form.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend demo request error:", errorText);

      return Response.json(
        { error: "Unable to send your demo request. Please try again." },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Request demo error:", error);

    return Response.json(
      { error: "Unable to send your demo request. Please try again." },
      { status: 500 }
    );
  }
}