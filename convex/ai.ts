import { action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

async function getAiModel(ctx: any): Promise<string> {
  const setting = await ctx.runQuery(internal.ai.getModelSetting);
  return setting || DEFAULT_MODEL;
}

export const generateScript = action({
  args: {
    ideaTitle: v.string(),
    ideaDescription: v.optional(v.string()),
    clientName: v.string(),
    clientCompany: v.optional(v.string()),
    clientContext: v.optional(v.string()),
    clientPlatforms: v.optional(v.array(v.string())),
    clientMainPlatform: v.optional(v.string()),
    existingScript: v.optional(v.string()),
    mode: v.union(v.literal("generate"), v.literal("improve"), v.literal("shorten")),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY nicht konfiguriert");
    }
    const model = await getAiModel(ctx);

    // Check for custom system prompt
    const customPrompt = await ctx.runQuery(internal.ai.getSetting, { key: "ai_prompt_script_system" });

    const systemPrompt = (customPrompt && customPrompt.trim()) ? customPrompt.trim() : `Du bist ein erfahrener Social-Media-Skriptautor für TikTok und Instagram Reels.
Du schreibst Skripte für Unternehmen, die kurze, authentische Videos für Social Media produzieren.

WICHTIG — AUSGABEREGELN:
- Gib AUSSCHLIESSLICH das Skript aus. Keine Einleitung, kein Kommentar, keine Erklärung, kein "Hier ist dein Skript", kein "Ich habe...".
- Deine Ausgabe wird 1:1 in einen Editor eingefügt. Jedes Wort, das kein Skript ist, stört.
- Formatiere als HTML (NICHT Markdown). Nutze: <h3>, <p>, <strong>, <em>, <hr>
- Kein \`\`\`, keine #-Headlines, kein Markdown.

Deine Skripte sind:
- Kurz und prägnant (30-60 Sekunden Sprechzeit)
- Authentisch und nahbar (kein Corporate-Sprech)
- Mit klaren Szenenanweisungen und Textpassagen
- Hook in den ersten 3 Sekunden
- Call-to-Action am Ende
- Auf Deutsch

HTML-Format:
<h3>HOOK</h3>
<p><em>(Die ersten 3 Sekunden)</em></p>
<hr>
<h3>Szene 1</h3>
<p><strong>Kamera:</strong> Einstellung</p>
<p>"Sprechtext..."</p>
<hr>
<h3>CTA</h3>
<p>"Abschluss + Handlungsaufforderung"</p>`;

    let userPrompt = "";

    const contextBlock = args.clientContext ? `\n\nKUNDENKONTEXT (wichtig — Tonalität, Zielgruppe, Do's & Don'ts beachten!):\n${args.clientContext}` : "";
    const platformInfo = args.clientMainPlatform ? `\nHauptplattform: ${args.clientMainPlatform}` : (args.clientPlatforms?.length ? `\nPlattformen: ${args.clientPlatforms.join(", ")}` : "");

    if (args.mode === "generate") {
      userPrompt = `Erstelle ein TikTok/Reels-Skript für folgende Video-Idee:

Kunde: ${args.clientName}${args.clientCompany ? ` (${args.clientCompany})` : ""}${platformInfo}
Video-Idee: ${args.ideaTitle}
${args.ideaDescription ? `Beschreibung: ${args.ideaDescription}` : ""}${contextBlock}

Schreibe ein komplettes, dreh-fertiges Skript.`;
    } else if (args.mode === "improve") {
      userPrompt = `Verbessere dieses Skript — mach es packender, kürzer, authentischer:

Kunde: ${args.clientName}${args.clientCompany ? ` (${args.clientCompany})` : ""}${platformInfo}
Video: ${args.ideaTitle}${contextBlock}

Bestehendes Skript:
${args.existingScript}

Gib das verbesserte Skript zurück. Erkläre NICHT was du geändert hast, gib nur das neue Skript aus.`;
    } else if (args.mode === "shorten") {
      userPrompt = `Kürze dieses Skript auf maximal 30 Sekunden Sprechzeit. Behalte die wichtigsten Punkte:

Kunde: ${args.clientName}${args.clientCompany ? ` (${args.clientCompany})` : ""}${platformInfo}
Video: ${args.ideaTitle}${contextBlock}

Bestehendes Skript:
${args.existingScript}

Gib nur das gekürzte Skript zurück.`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter API Fehler: ${response.status} — ${err}`);
    }

    const data: any = await response.json();
    let script: string = data.choices?.[0]?.message?.content ?? "";
    if (!script) {
      throw new Error("Keine Antwort von der KI erhalten");
    }
    script = script.trim();

    // Post-processing: Strip preamble before actual script content
    // Remove common LLM filler like "Hier ist...", "Natürlich!", "Gerne!", markdown fences
    script = script.replace(/^```html?\s*/i, "").replace(/\s*```$/i, "");
    // If response starts with non-HTML text before the first tag, strip it
    const firstTagIndex = script.indexOf("<");
    if (firstTagIndex > 0 && firstTagIndex < 200) {
      script = script.substring(firstTagIndex);
    }
    // Convert markdown to HTML if model ignored instructions
    if (!script.includes("<h3") && !script.includes("<p")) {
      script = script
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h3>$1</h3>")
        .replace(/^# (.+)$/gm, "<h3>$1</h3>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/^---$/gm, "<hr>")
        .replace(/^(?!<)(.*\S.*)$/gm, "<p>$1</p>");
    }
    return script;
  },
});

export const suggestIdeas = action({
  args: {
    clientName: v.string(),
    clientCompany: v.optional(v.string()),
    clientContext: v.optional(v.string()),
    clientPlatforms: v.optional(v.array(v.string())),
    clientMainPlatform: v.optional(v.string()),
    existingIdeas: v.array(v.string()),
    categoryNames: v.optional(v.array(v.string())),
    count: v.optional(v.number()),
    month: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY nicht konfiguriert");
    }
    const model = await getAiModel(ctx);

    const customIdeasPrompt = await ctx.runQuery(internal.ai.getSetting, { key: "ai_prompt_ideas" });
    const ideaCount = args.count || 5;
    const contextBlock = args.clientContext ? `\n\nKUNDENKONTEXT (wichtig — Tonalität, Zielgruppe, Do's & Don'ts beachten!):\n${args.clientContext}` : "";
    const platformInfo = args.clientMainPlatform ? `\nHauptplattform: ${args.clientMainPlatform}` : (args.clientPlatforms?.length ? `\nPlattformen: ${args.clientPlatforms.join(", ")}` : "");
    const categoryInfo = args.categoryNames?.length ? `\nVerfügbare Kategorien: ${args.categoryNames.join(", ")}` : "";
    const monthInfo = args.month ? `\nZielmonat: ${args.month} (berücksichtige saisonale Themen, Feiertage, Trends für diesen Monat)` : "";

    const prompt = `Du bist ein kreativer Social-Media-Stratege. Schlage ${ideaCount} TikTok/Reels Video-Ideen für den gesamten Monat vor (verteilt auf ca. 4 Wochen) für:

Kunde: ${args.clientName}${args.clientCompany ? ` (${args.clientCompany})` : ""}${platformInfo}${contextBlock}${categoryInfo}${monthInfo}
${args.existingIdeas.length > 0 ? `\nBereits existierende Ideen (NICHT wiederholen):\n${args.existingIdeas.map(i => `- ${i}`).join("\n")}` : ""}

Gib genau ${ideaCount} Ideen als JSON-Array zurück. Jede Idee hat "title" und "description"${args.categoryNames?.length ? ' und optional "category" (muss einer der verfügbaren Kategorien entsprechen)' : ""}.
Nur das JSON-Array, kein anderer Text.
Beispiel: [{"title": "...", "description": "..."${args.categoryNames?.length ? ', "category": "Real Talk"' : ""}}]`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(customIdeasPrompt?.trim() ? [{ role: "system" as const, content: customIdeasPrompt.trim() }] : []),
          { role: "user" as const, content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API Fehler: ${response.status}`);
    }

    const data: any = await response.json();
    const content: string = data.choices?.[0]?.message?.content || "[]";
    // Extract JSON from response
    const jsonMatch: RegExpMatchArray | null = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return [];
    }
  },
});

export const getModelSetting = internalQuery({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q: any) => q.eq("key", "ai_model"))
      .first();
    return setting?.value ?? null;
  },
});

export const getSetting = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q: any) => q.eq("key", args.key))
      .first();
    return setting?.value ?? null;
  },
});
