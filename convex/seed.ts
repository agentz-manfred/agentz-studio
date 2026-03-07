import { mutation } from "./_generated/server";

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if demo data already exists
    const existingIdeas = await ctx.db.query("ideas").collect();
    if (existingIdeas.length > 0) {
      return { status: "exists", message: "Demo-Daten existieren bereits" };
    }

    // Get admin user
    const admin = await ctx.db.query("users").first();
    if (!admin) return { status: "error", message: "Kein Admin-User vorhanden" };

    // Get or check client "Pflegedienst Kolbe"
    let client = (await ctx.db.query("clients").collect()).find(
      (c) => c.company === "Pflegedienst Kolbe"
    );

    if (!client) {
      const clientId = await ctx.db.insert("clients", {
        name: "Sebastian Kolbe",
        company: "Pflegedienst Kolbe",
        email: "s.kolbe@pflegedienst-kolbe.de",
        phone: "+49 385 123 4567",
        createdAt: Date.now() - 7 * 86400000,
      });
      client = (await ctx.db.get(clientId)) ?? undefined;
    }

    if (!client) return { status: "error", message: "Client konnte nicht erstellt werden" };

    // Create second demo client
    const client2Id = await ctx.db.insert("clients", {
      name: "Maria Richter",
      company: "Praxis Dr. Richter",
      email: "m.richter@praxis-richter.de",
      phone: "+49 385 987 6543",
      createdAt: Date.now() - 3 * 86400000,
    });

    const now = Date.now();

    // Demo ideas across different stages
    const demoIdeas = [
      {
        clientId: client._id,
        title: "Tag im Pflegedienst — Behind the Scenes",
        description: "Authentischer Einblick in den Arbeitsalltag. Morgenrunde, Patienten besuchen, Teamwork. Nahbar und echt.",
        status: "veröffentlicht",
        order: 0,
        createdAt: now - 14 * 86400000,
        updatedAt: now - 2 * 86400000,
      },
      {
        clientId: client._id,
        title: "Warum Pflege? — Mitarbeiter-Interview",
        description: "Kurzes Interview mit einer Pflegekraft: Motivation, schönste Momente, was sie antreibt. Emotional, authentisch.",
        status: "geschnitten",
        order: 1,
        createdAt: now - 10 * 86400000,
        updatedAt: now - 1 * 86400000,
      },
      {
        clientId: client._id,
        title: "5 Mythen über ambulante Pflege",
        description: "Edutainment-Format: Häufige Vorurteile aufgreifen und mit Humor + Fakten entkräften.",
        status: "gedreht",
        order: 2,
        createdAt: now - 7 * 86400000,
        updatedAt: now - 12 * 3600000,
      },
      {
        clientId: client._id,
        title: "Neue Mitarbeiter gesucht — Recruiting Clip",
        description: "Recruiting-Video für TikTok/Instagram. Team-Spirit zeigen, Benefits, lockere Atmosphäre. Hook: \"Wir suchen DICH\"",
        status: "freigabe",
        order: 3,
        createdAt: now - 5 * 86400000,
        updatedAt: now - 6 * 3600000,
      },
      {
        clientId: client._id,
        title: "Patient bedankt sich — Testimonial",
        description: "Kurzes Statement eines zufriedenen Patienten (mit Einverständnis). Authentisch, keine Inszenierung.",
        status: "skript",
        order: 4,
        createdAt: now - 3 * 86400000,
        updatedAt: now - 4 * 3600000,
      },
      {
        clientId: client._id,
        title: "Pflegetipps für Angehörige",
        description: "Hilfreiche Alltagstipps: Richtig heben, Hautpflege, Ernährung. Mehrwert-Content der geteilt wird.",
        status: "idee",
        order: 5,
        createdAt: now - 1 * 86400000,
        updatedAt: now - 2 * 3600000,
      },
      {
        clientId: client2Id,
        title: "Praxis-Rundgang — Wir stellen uns vor",
        description: "Virtueller Rundgang durch die Praxis. Empfang, Behandlungsräume, Team. Vertrauensaufbau für neue Patienten.",
        status: "freigegeben",
        order: 0,
        createdAt: now - 4 * 86400000,
        updatedAt: now - 8 * 3600000,
      },
      {
        clientId: client2Id,
        title: "Gesundheitstipp der Woche — Serie",
        description: "Wiederkehrendes Format: Jede Woche ein kurzer Gesundheitstipp von Dr. Richter. Kompetenz + Nahbarkeit.",
        status: "idee",
        order: 1,
        createdAt: now - 2 * 86400000,
        updatedAt: now - 5 * 3600000,
      },
    ];

    const ideaIds: string[] = [];
    for (const idea of demoIdeas) {
      const id = await ctx.db.insert("ideas", {
        ...idea,
        createdBy: admin._id,
      });
      ideaIds.push(id);
    }

    // Demo scripts for some ideas
    await ctx.db.insert("scripts", {
      ideaId: ideaIds[1] as any,
      content: "**INTRO (0-3 Sek)**\n[Pflegekraft läuft durch Flur, Kamera folgt]\nText-Overlay: \"Warum Pflege?\"\n\n**INTERVIEW (3-25 Sek)**\nFrage: \"Was treibt dich jeden Tag an?\"\n[Nahaufnahme, natürliches Licht]\n\n**B-ROLL (25-40 Sek)**\n[Arbeit mit Patienten, Lachen, Teammomente]\n\n**OUTRO (40-45 Sek)**\nText: \"Pflegedienst Kolbe — Weil Pflege Herz braucht.\"\nLogo + Kontakt",
      version: 1,
      createdBy: admin._id,
      createdAt: now - 9 * 86400000,
    });

    await ctx.db.insert("scripts", {
      ideaId: ideaIds[3] as any,
      content: "**HOOK (0-2 Sek)**\n\"Wir suchen DICH!\" [Schnelle Schnitte, Team winkt]\n\n**CONTENT (2-20 Sek)**\n- Flexible Arbeitszeiten\n- Familiäres Team\n- Faire Bezahlung\n- Firmenwagen\n[Jeweils mit B-Roll unterlegt]\n\n**CTA (20-25 Sek)**\n\"Bewirb dich jetzt — Link in Bio\"\n[Team-Gruppenfoto]",
      version: 1,
      createdBy: admin._id,
      createdAt: now - 4 * 86400000,
    });

    // Demo shoot dates
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    await ctx.db.insert("shootDates", {
      clientId: client._id,
      ideaIds: [ideaIds[3] as any],
      date: formatDate(new Date(today.getTime() + 3 * 86400000)),
      time: "10:00",
      location: "Pflegedienst Kolbe, Schweriner Str. 42",
      notes: "Team-Aufnahmen für Recruiting. Alle Mitarbeiter informiert.",
      createdAt: now - 3 * 86400000,
    });

    await ctx.db.insert("shootDates", {
      clientId: client._id,
      ideaIds: [ideaIds[4] as any],
      date: formatDate(new Date(today.getTime() + 8 * 86400000)),
      time: "14:00",
      location: "Bei Patientin Frau Müller (nach Absprache)",
      notes: "Testimonial-Aufnahme. Einverständniserklärung vorbereiten!",
      createdAt: now - 2 * 86400000,
    });

    await ctx.db.insert("shootDates", {
      clientId: client2Id,
      ideaIds: [ideaIds[6] as any],
      date: formatDate(new Date(today.getTime() + 5 * 86400000)),
      time: "09:00",
      location: "Praxis Dr. Richter, Am Markt 15, Schwerin",
      notes: "Praxis-Rundgang. Vor Praxisöffnung drehen (ruhig, kein Patientenbetrieb).",
      createdAt: now - 1 * 86400000,
    });

    // Demo comments
    await ctx.db.insert("comments", {
      targetType: "idea",
      targetId: ideaIds[3],
      userId: admin._id,
      content: "Skript steht, Sebastian hat es freigegeben. Drehtag ist Montag geplant.",
      resolved: false,
      createdAt: now - 4 * 3600000,
    });

    await ctx.db.insert("comments", {
      targetType: "idea",
      targetId: ideaIds[1],
      userId: admin._id,
      content: "Schnitt fast fertig. Noch Farbkorrektur und Untertitel.",
      resolved: false,
      createdAt: now - 8 * 3600000,
    });

    return {
      status: "created",
      message: `Demo-Daten erstellt: ${demoIdeas.length} Ideen, 2 Skripte, 3 Drehtermine, 2 Kommentare`,
    };
  },
});
