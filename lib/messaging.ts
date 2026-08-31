type SendEmailResult = {
  ok: boolean;
  provider?: "sendgrid";
  message?: string;
};

export async function sendEmail(
  to: string,
  subject: string,
  text: string
): Promise<SendEmailResult> {
  if ((process.env.EMAIL_PROVIDER || "").toLowerCase() !== "sendgrid") {
    return { ok: false, message: "이메일 발송 제공자가 설정되지 않았습니다." };
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const fromName = process.env.SENDGRID_FROM_NAME || "동고리";
  if (!apiKey || !fromEmail) {
    return { ok: false, message: "이메일 발송 설정이 누락되었습니다." };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }], subject }],
        from: { email: fromEmail, name: fromName },
        content: [{ type: "text/plain", value: text }],
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("[email] provider request failed", { status: response.status });
      return { ok: false, provider: "sendgrid", message: "이메일 발송에 실패했습니다." };
    }

    return { ok: true, provider: "sendgrid" };
  } catch {
    console.error("[email] provider request failed");
    return { ok: false, provider: "sendgrid", message: "이메일 발송에 실패했습니다." };
  }
}
