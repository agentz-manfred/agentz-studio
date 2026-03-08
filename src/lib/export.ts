import { STATUS_LABELS } from "./utils";

interface IdeaExport {
  title: string;
  status: string;
  clientName?: string;
  createdAt: number;
  updatedAt: number;
}

export function exportIdeasCSV(ideas: IdeaExport[], filename = "ideen-export.csv") {
  const header = ["Titel", "Status", "Kunde", "Erstellt", "Aktualisiert"];
  const rows = ideas.map((i) => [
    `"${i.title.replace(/"/g, '""')}"`,
    STATUS_LABELS[i.status] || i.status,
    i.clientName || "",
    new Date(i.createdAt).toLocaleDateString("de-DE"),
    new Date(i.updatedAt).toLocaleDateString("de-DE"),
  ]);

  const csv = [header.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

interface ReportData {
  clientName: string;
  month: string;
  totalIdeas: number;
  byStatus: Record<string, number>;
  published: { title: string; date: string }[];
  inProgress: { title: string; status: string }[];
}

export function openMonthlyReport(data: ReportData) {
  const statusRows = Object.entries(data.byStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => `<tr><td>${STATUS_LABELS[status] || status}</td><td>${count}</td></tr>`)
    .join("");

  const publishedRows = data.published.length
    ? data.published.map((p) => `<tr><td>${p.title}</td><td>${p.date}</td></tr>`).join("")
    : '<tr><td colspan="2" style="color:#999">Keine Veröffentlichungen</td></tr>';

  const inProgressRows = data.inProgress.length
    ? data.inProgress.map((p) => `<tr><td>${p.title}</td><td>${STATUS_LABELS[p.status] || p.status}</td></tr>`).join("")
    : '<tr><td colspan="2" style="color:#999">Keine aktiven Ideen</td></tr>';

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Monatsbericht – ${data.clientName} – ${data.month}</title>
<style>
  @page { margin: 2cm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: auto; }
  h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
  h2 { font-size: 16px; font-weight: 600; margin-top: 32px; margin-bottom: 12px; color: #333; }
  .meta { color: #666; font-size: 14px; margin-top: 4px; }
  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 24px; }
  .stat { padding: 16px; border: 1px solid #e5e5e5; border-radius: 10px; }
  .stat-label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.05em; }
  .stat-value { font-size: 28px; font-weight: 600; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
  th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #999; font-weight: 600; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #999; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
    <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#1e40af,#3b82f6);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px">Z</div>
    <div>
      <h1>Monatsbericht</h1>
      <p class="meta">${data.clientName} · ${data.month}</p>
    </div>
  </div>

  <button class="no-print" onclick="window.print()" style="padding:8px 16px;border-radius:8px;background:#1e40af;color:white;border:none;cursor:pointer;font-size:14px;font-weight:500;margin-bottom:24px">
    Als PDF speichern
  </button>

  <div class="stat-grid">
    <div class="stat">
      <div class="stat-label">Gesamt Ideen</div>
      <div class="stat-value">${data.totalIdeas}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Veröffentlicht</div>
      <div class="stat-value">${data.published.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">In Arbeit</div>
      <div class="stat-value">${data.inProgress.length}</div>
    </div>
  </div>

  <h2>Status-Übersicht</h2>
  <table><thead><tr><th>Status</th><th>Anzahl</th></tr></thead><tbody>${statusRows}</tbody></table>

  <h2>Veröffentlichte Videos</h2>
  <table><thead><tr><th>Titel</th><th>Datum</th></tr></thead><tbody>${publishedRows}</tbody></table>

  <h2>In Bearbeitung</h2>
  <table><thead><tr><th>Titel</th><th>Status</th></tr></thead><tbody>${inProgressRows}</tbody></table>

  <div class="footer">
    Erstellt mit AgentZ Studio · ${new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
  </div>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
