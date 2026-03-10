import { ArrowLeft } from "lucide-react";

function LegalLayout({ title, children, onBack }: { title: string; children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)] text-[var(--color-text-primary)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-[var(--color-text-tertiary)] hover:text-[var(--color-green)] transition-colors mb-6 border-2 border-[var(--color-border-strong)] px-3 py-1.5 hover:border-[var(--color-green)]"
          style={{ borderRadius: 0, letterSpacing: '0.06em' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Zurück
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-[3px] h-[24px] bg-[var(--color-green)]" />
          <h1 className="text-[28px] font-bold uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>{title}</h1>
        </div>
        <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase font-bold mb-10 ml-[15px]" style={{ letterSpacing: '0.08em' }}>Stand: 07. März 2026</p>
        <div className="space-y-8 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
          {children}
        </div>
        <div className="mt-12 pt-6 border-t-2 border-[var(--color-border-strong)] flex gap-4 text-[11px] font-bold uppercase text-[var(--color-text-tertiary)]" style={{ letterSpacing: '0.06em' }}>
          <a href="#/impressum" className="hover:text-[var(--color-green)] transition-colors">Impressum</a>
          <a href="#/datenschutz" className="hover:text-[var(--color-green)] transition-colors">Datenschutz</a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-[2px] h-[16px] bg-[var(--color-green)]" />
        <h2 className="text-[16px] font-bold uppercase text-[var(--color-text-primary)]" style={{ letterSpacing: '0.04em' }}>{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] p-5 space-y-1" style={{ borderRadius: 0 }}>
      {children}
    </div>
  );
}

export function ImpressumPage({ onBack }: { onBack: () => void }) {
  return (
    <LegalLayout title="Impressum" onBack={onBack}>
      <Section title="Angaben gemäß § 5 DDG">
        <InfoBox>
          <p><strong>AgentZ Media</strong></p>
          <p>Einzelunternehmen</p>
          <p>Ziegenmarkt 6</p>
          <p>19055 Schwerin</p>
          <p>Deutschland</p>
          <p className="mt-3"><strong>Inhaber:</strong> Axel Roller</p>
        </InfoBox>
      </Section>

      <Section title="Kontakt">
        <InfoBox>
          <p><strong>Telefon:</strong> <a href="tel:+4938557568044" className="text-[var(--color-accent)] hover:underline">0385 / 57 56 80 44</a></p>
          <p><strong>E-Mail:</strong> <a href="mailto:kontakt@agent-z.de" className="text-[var(--color-accent)] hover:underline">kontakt@agent-z.de</a></p>
        </InfoBox>
      </Section>

      <Section title="Berufsbezeichnung und berufsrechtliche Regelungen">
        <InfoBox>
          <p><strong>Berufsbezeichnung:</strong> Werbe- und Mediendienstleistungen</p>
          <p><strong>Zuständige Kammer:</strong> IHK zu Schwerin</p>
          <p>Graf-Schack-Allee 12, 19053 Schwerin</p>
          <p><a href="https://www.schwerin.ihk.de" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">www.schwerin.ihk.de</a></p>
        </InfoBox>
      </Section>

      <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <InfoBox>
          <p>Axel Roller</p>
          <p>Ziegenmarkt 6</p>
          <p>19055 Schwerin</p>
        </InfoBox>
      </Section>

      <Section title="EU-Streitschlichtung">
        <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline break-all">https://ec.europa.eu/consumers/odr/</a></p>
        <p>Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
      </Section>

      <Section title="Verbraucherstreitbeilegung">
        <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      </Section>

      <Section title="Haftung für Inhalte">
        <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
        <p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
      </Section>

      <Section title="Haftung für Links">
        <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>
        <p>Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
      </Section>

      <Section title="Urheberrecht">
        <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
        <p>Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>
      </Section>
    </LegalLayout>
  );
}

export function DatenschutzPage({ onBack }: { onBack: () => void }) {
  return (
    <LegalLayout title="Datenschutzerklärung" onBack={onBack}>
      <Section title="1. Verantwortlicher und Kontaktdaten">
        <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
        <InfoBox>
          <p><strong>AgentZ Media</strong></p>
          <p>Einzelunternehmen</p>
          <p>Ziegenmarkt 6, 19055 Schwerin, Deutschland</p>
          <p className="mt-2"><strong>Inhaber:</strong> Axel Roller</p>
          <p><strong>E-Mail:</strong> <a href="mailto:kontakt@agent-z.de" className="text-[var(--color-accent)] hover:underline">kontakt@agent-z.de</a></p>
          <p><strong>Telefon:</strong> <a href="tel:+4938557568044" className="text-[var(--color-accent)] hover:underline">0385 / 57 56 80 44</a></p>
        </InfoBox>
      </Section>

      <Section title="2. Allgemeine Hinweise zur Datenverarbeitung">
        <p>Der Schutz Ihrer personenbezogenen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TTDSG).</p>
        <p>Wir erheben und verwenden personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist.</p>
        <p>Die personenbezogenen Daten der betroffenen Person werden gelöscht oder gesperrt, sobald der Zweck der Speicherung entfällt.</p>
      </Section>

      <Section title="3. Server-Log-Files">
        <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Files, die Ihr Browser automatisch an uns übermittelt:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Browsertyp und Browserversion</li>
          <li>Verwendetes Betriebssystem</li>
          <li>Referrer URL</li>
          <li>Hostname des zugreifenden Rechners</li>
          <li>Uhrzeit der Serveranfrage</li>
          <li>IP-Adresse</li>
        </ul>
        <p>Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
      </Section>

      <Section title="4. SSL/TLS-Verschlüsselung">
        <p>Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.</p>
      </Section>

      <Section title="5. Hosting">
        <p>Diese Website wird bei <strong>Vercel Inc.</strong> (440 N Barranca Ave #4133, Covina, CA 91723, USA) gehostet. Vercel hat sich zur Einhaltung der EU-Standardvertragsklauseln verpflichtet.</p>
        <p>Backend-Dienste werden von <strong>Convex Inc.</strong> bereitgestellt. Dabei werden Nutzerdaten (E-Mail, Name, verschlüsseltes Passwort) in der Convex-Datenbank gespeichert.</p>
        <p>Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
      </Section>

      <Section title="6. Benutzerkonten und Authentifizierung">
        <p>Für die Nutzung von AgentZ Studio ist ein Benutzerkonto erforderlich. Folgende Daten werden gespeichert:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Name</li>
          <li>E-Mail-Adresse</li>
          <li>Verschlüsseltes Passwort (bcrypt)</li>
          <li>Rolle (Admin/Kunde)</li>
          <li>Sitzungs-Token</li>
        </ul>
        <p>Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>
      </Section>

      <Section title="7. Cookies und lokale Speicherung">
        <p>Diese Website verwendet ausschließlich technisch notwendige Cookies und localStorage-Einträge für die Sitzungsverwaltung (Login-Token) und Benutzereinstellungen (Theme). Es werden keine Tracking-Cookies oder Analyse-Cookies eingesetzt.</p>
        <p>Die Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.</p>
      </Section>

      <Section title="8. Videoinhalte (Bunny CDN)">
        <p>Für die Bereitstellung von Videoinhalten nutzen wir <strong>BunnyCDN</strong> (BunnyWay d.o.o., Slowenien). Beim Abruf von Videos wird Ihre IP-Adresse an BunnyCDN übermittelt.</p>
        <p>Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
      </Section>

      <Section title="9. KI-gestützte Funktionen">
        <p>Im Admin-Bereich werden KI-Funktionen (Ideen- und Skript-Generierung) über <strong>OpenRouter</strong> bereitgestellt. Dabei werden Projektdaten (Kundennamen, Ideentitel, Kontextinformationen) an die KI-API übermittelt. <strong>Keine personenbezogenen Kundendaten</strong> werden an KI-Dienste weitergegeben.</p>
        <p>Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
      </Section>

      <Section title="10. Rechte der betroffenen Personen">
        <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Auskunftsrecht (Art. 15 DSGVO)</li>
          <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
          <li>Recht auf Löschung (Art. 17 DSGVO)</li>
          <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
        </ul>
      </Section>

      <Section title="11. Beschwerderecht bei der Aufsichtsbehörde">
        <InfoBox>
          <p><strong>Der Landesbeauftragte für Datenschutz und Informationsfreiheit Mecklenburg-Vorpommern</strong></p>
          <p>Werderstraße 74a, 19055 Schwerin</p>
          <p>Telefon: 0385 59 49 4-0</p>
          <p><a href="mailto:info@datenschutz-mv.de" className="text-[var(--color-accent)] hover:underline">info@datenschutz-mv.de</a></p>
          <p><a href="https://www.datenschutz-mv.de" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">www.datenschutz-mv.de</a></p>
        </InfoBox>
      </Section>

      <Section title="12. Fragen zum Datenschutz">
        <p>Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer personenbezogenen Daten wenden Sie sich bitte an: <a href="mailto:kontakt@agent-z.de" className="text-[var(--color-accent)] hover:underline font-medium">kontakt@agent-z.de</a></p>
      </Section>
    </LegalLayout>
  );
}
