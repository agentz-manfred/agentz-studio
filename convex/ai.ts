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

    const systemPrompt = `Du bist ein erfahrener Social-Media-Skriptautor für TikTok und Instagram Reels. 
Du schreibst Skripte für Unternehmen, die kurze, authentische Videos für Social Media produzieren.

Deine Skripte sind:
- Kurz und prägnant (30-60 Sekunden Sprechzeit)
- Authentisch und nahbar (kein Corporate-Sprech)
- Mit klaren Szenenanweisungen [Kamera: ...] und Textpassagen
- Hook in den ersten 3 Sekunden
- Call-to-Action am Ende
- Auf Deutsch

Format:
HOOK: (Die ersten 3 Sekunden)
---
Szene 1: [Beschreibung]
[Kamera: Einstellung]
Text: "..."
---
Szene 2: ...
---
CTA: (Abschluss + Handlungsaufforderung)`;

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

    const data = await response.json();
    const script = data.choices?.[0]?.message?.content;
    if (!script) {
      throw new Error("Keine Antwort von der KI erhalten");
    }
    return script.trim();
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
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY nicht konfiguriert");
    }
    const model = await getAiModel(ctx);

    const contextBlock = args.clientContext ? `\n\nKUNDENKONTEXT (wichtig — Tonalität, Zielgruppe, Do's & Don'ts beachten!):\n${args.clientContext}` : "";
    const platformInfo = args.clientMainPlatform ? `\nHauptplattform: ${args.clientMainPlatform}` : (args.clientPlatforms?.length ? `\nPlattformen: ${args.clientPlatforms.join(", ")}` : "");
    const categoryInfo = args.categoryNames?.length ? `\nVerfügbare Kategorien: ${args.categoryNames.join(", ")}` : "";

    const prompt = `Du bist ein kreativer Social-Media-Stratege. Schlage 5 TikTok/Reels Video-Ideen vor für:

Kunde: ${args.clientName}${args.clientCompany ? ` (${args.clientCompany})` : ""}${platformInfo}${contextBlock}${categoryInfo}
${args.existingIdeas.length > 0 ? `\nBereits existierende Ideen (NICHT wiederholen):\n${args.existingIdeas.map(i => `- ${i}`).join("\n")}` : ""}

Gib genau 5 Ideen als JSON-Array zurück. Jede Idee hat "title" und "description"${args.categoryNames?.length ? ' und optional "category" (muss einer der verfügbaren Kategorien entsprechen)' : ""}.
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
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API Fehler: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
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
