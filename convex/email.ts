import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const STATUS_LABELS: Record<string, string> = {
  idee: "Idee",
  skript: "Skript",
  freigabe: "Zur Freigabe",
  korrektur: "Korrektur nötig",
  freigegeben: "Freigegeben",
  gedreht: "Gedreht",
  geschnitten: "Geschnitten",
  review: "Review",
  veröffentlicht: "Veröffentlicht",
};

function buildEmailHtml(args: {
  clientName: string;
  ideaTitle: string;
  newStatus: string;
  studioUrl: string;
}) {
  const statusLabel = STATUS_LABELS[args.newStatus] || args.newStatus;

  const ctaText =
    args.newStatus === "freigabe"
      ? "Jetzt ansehen & freigeben →"
      : "Im Studio ansehen →";

  const contextText =
    args.newStatus === "freigabe"
      ? "Ihre Video-Idee ist bereit zur Freigabe. Bitte schauen Sie sich das Skript an und geben Sie Ihr Feedback — direkt im Studio."
      : args.newStatus === "korrektur"
        ? "Es gibt Änderungswünsche zu dieser Video-Idee. Bitte prüfen Sie die Anmerkungen im Studio."
        : args.newStatus === "geschnitten"
          ? "Ihr Video wurde geschnitten und steht zur Ansicht bereit."
          : args.newStatus === "veröffentlicht"
            ? "Ihr Video wurde veröffentlicht! 🎉"
            : "Der Status Ihrer Video-Idee wurde aktualisiert.";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a;background:#ffffff">
  <div style="text-align:center;margin-bottom:32px">
    <div style="display:inline-block;width:44px;height:44px;border-radius:11px;background:linear-gradient(135deg,#0f172a,#1e3a5f);color:white;font-weight:700;font-size:20px;line-height:44px;letter-spacing:-0.5px">Z</div>
  </div>
  <h2 style="font-size:20px;font-weight:600;margin:0 0 8px;color:#0f172a">Hallo ${args.clientName},</h2>
  <p style="font-size:15px;color:#64748b;line-height:1.6;margin:0 0 24px">
    ${contextText}
  </p>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px">
    <p style="font-size:16px;font-weight:600;margin:0 0 8px;color:#0f172a">${args.ideaTitle}</p>
    <p style="font-size:14px;margin:0;color:#64748b">
      Neuer Status: <strong style="color:#3b82f6">${statusLabel}</strong>
    </p>
  </div>
  <div style="text-align:center;margin-bottom:32px">
    <a href="${args.studioUrl}" style="display:inline-block;background:#0f172a;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
      ${ctaText}
    </a>
  </div>
  <p style="font-size:12px;color:#94a3b8;margin-top:40px;border-top:1px solid #e2e8f0;padding-top:16px;text-align:center">
    AgentZ Media · Diese E-Mail wurde automatisch gesendet.
  </p>
</body>
</html>`;
}

export const sendStatusNotification = internalAction({
  args: {
    clientEmail: v.string(),
    clientName: v.string(),
    ideaTitle: v.string(),
    newStatus: v.string(),
    studioUrl: v.string(),
  },
  handler: async (_ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log(
        `📧 [DRY RUN] Email → ${args.clientEmail}: "${args.ideaTitle}" → ${args.newStatus}`
      );
      console.log("   Set RESEND_API_KEY env var to enable email delivery.");
      return;
    }

    const statusLabel = STATUS_LABELS[args.newStatus] || args.newStatus;
    const subject = `AgentZ Studio: "${args.ideaTitle}" — ${statusLabel}`;
    const html = buildEmailHtml(args);

    const fromAddress =
      process.env.EMAIL_FROM || "AgentZ Studio <studio@agent-z.de>";

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [args.clientEmail],
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`📧 Resend error (${res.status}): ${errText}`);
        return;
      }

      const data = await res.json();
      console.log(`📧 Email sent to ${args.clientEmail} (id: ${data.id})`);
    } catch (err) {
      console.error(`📧 Email failed:`, err);
    }
  },
});
