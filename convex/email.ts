import { action, internalAction } from "./_generated/server";
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

// Client-facing statuses that trigger email notifications
const CLIENT_NOTIFY_STATUSES = ["freigabe", "korrektur", "veröffentlicht"];

export const sendStatusNotification = internalAction({
  args: {
    clientEmail: v.string(),
    clientName: v.string(),
    ideaTitle: v.string(),
    newStatus: v.string(),
    studioUrl: v.string(),
  },
  handler: async (_ctx, args) => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log("SMTP not configured, skipping email notification");
      return;
    }

    const statusLabel = STATUS_LABELS[args.newStatus] || args.newStatus;
    const subject = `AgentZ Studio: "${args.ideaTitle}" — ${statusLabel}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a">
  <div style="text-align:center;margin-bottom:32px">
    <div style="display:inline-block;width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;font-weight:bold;font-size:18px;line-height:40px">Z</div>
  </div>
  <h2 style="font-size:20px;font-weight:600;margin:0 0 8px">Hallo ${args.clientName},</h2>
  <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px">
    Der Status Ihrer Video-Idee wurde aktualisiert:
  </p>
  <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin-bottom:24px">
    <p style="font-size:16px;font-weight:600;margin:0 0 8px">${args.ideaTitle}</p>
    <p style="font-size:14px;margin:0">
      Neuer Status: <strong style="color:#3b82f6">${statusLabel}</strong>
    </p>
  </div>
  ${args.newStatus === "freigabe" ? `
  <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px">
    Bitte schauen Sie sich die Idee an und geben Sie Ihr Feedback. Sie können direkt im Studio freigeben oder Änderungen anfordern.
  </p>` : ""}
  <a href="${args.studioUrl}" style="display:inline-block;background:#1e40af;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
    Im Studio ansehen →
  </a>
  <p style="font-size:12px;color:#999;margin-top:40px;border-top:1px solid #eee;padding-top:16px">
    AgentZ Media · Diese E-Mail wurde automatisch gesendet.
  </p>
</body>
</html>`;

    // Use fetch to send via SMTP relay endpoint (or direct SMTP if available)
    // For now, log the email - actual SMTP requires Node.js nodemailer which isn't available in Convex
    console.log(`📧 Email notification would be sent to ${args.clientEmail}:`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Status: ${statusLabel}`);
    console.log(`   Idea: ${args.ideaTitle}`);

    // TODO: Integrate with external email API (SendGrid, Resend, etc.)
    // For now, this serves as the notification template and hook point
  },
});
