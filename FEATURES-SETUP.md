# Nexora – Betriebsfunktionen

Die Website bleibt unter https://noxtryn.github.io/Nexora/. Discord-Login und geschützte Funktionen laufen auf https://nexora-control.onrender.com.

## Implementiert

- Spielstatus `mastering NEXORA`; Dashboard-Linkbutton in `/status`.
- Sichere Member-Autorollen: SQLite-Warteschlange, Verzögerung, Screening, Neustarts, erneute Beitritte, Ausschluss von Mod-/Teamrollen.
- Betriebsprüfung mit tatsächlichem Bereitschaftsstatus.
- Private Ticketübersicht mit Suche, Mod-Filter und Link zum Discord-Ticket; Zugriff nur für Serververwaltung.
- Getrennte Release-Abfrage für ThePrisons/GitHub und Sky Supra/Manifest. Keine Veröffentlichung durch Lesen.
- Export aller gespeicherten Dashboard-Entwürfe ohne Zugangsdaten.
- PostgreSQL für dauerhafte Entwürfe, Audit und Vorschauen. Konfliktprüfung und Transaktionen schützen gleichzeitige Bearbeitung.
- Ausgehende Windows-Agent-Verbindung: Bot-Token bleibt lokal; überträgt ausschließlich Serverinventar und Status. Agent-Zugang ersetzt keine Discord-Anmeldung.

## PostgreSQL verbinden

1. Eine PostgreSQL-Datenbank bereitstellen; externe Anbieter benötigen keine eigene Domain.
2. In Render ausschließlich unter Environment `DATABASE_URL` hinterlegen. Für externe Verbindungen TLS nach Vorgaben des Anbieters verwenden, beispielsweise `sslmode=require`.
3. Erst nach erfolgreichem Datenbankstart `NEXORA_READONLY=0` setzen und deployen.
4. Einen Entwurf speichern, Backend neu deployen und die erhaltene Revision prüfen.

Ohne Datenbank bleibt der aktuelle Render-Free-Betrieb absichtlich schreibgeschützt. Keine Datenbank wurde angelegt und kein kostenpflichtiger Tarif gebucht. Die PostgreSQL-Verbindung muss noch gegen die tatsächliche Datenbank getestet werden.

## Windows-Agent verbinden

1. Einen zufälligen Schlüssel mit mindestens 32 Zeichen erzeugen und bei Render als `NEXORA_AGENT_KEY` hinterlegen. Nicht in Git oder Chat speichern.
2. Die aktuelle Bot-Quelle einschließlich `hosting/windows` installieren.
3. `hosting/windows/Configure-NexoraAgent.ps1` lokal ausführen und denselben Schlüssel im verdeckten Eingabefeld eingeben. Er wird über Windows-DPAPI verschlüsselt.
4. Bot neu starten. Der Agent liest etwa jede Minute den Serverzustand und überträgt ihn über HTTPS. Nach 120 Sekunden ohne Signal wird die Verbindung nicht mehr als aktuell angezeigt.

Der Bot-Token und OAuth-Secret werden nicht übertragen. Der Bridge-Schlüssel gestattet nur das Aktualisieren dieses einen Serverinventars. Er gestattet keine Discord-Schreiboperationen und öffnet keine Dashboard-Sitzung.

## Member-Autorolle nach Serverfreigabe

Erst nach ausdrücklicher Serverfreigabe:

- `NEXORA_COMMUNITY_ENABLED=true`
- `NEXORA_AUTOROLES_ENABLED=true`
- `DISCORD_ROLE_MEMBER=<bestehende Member-Rollen-ID>`
- optional `NEXORA_AUTOROLE_DELAY_MINUTES=0` (0 bis 10080)
- `NEXORA_AUTOROLE_SCREENING_REQUIRED=true`

Für Beitrittsereignisse muss im Discord Developer Portal der Server Members Intent aktiviert sein. Ohne eingeschaltete Autorollen fordert der Bot diesen privilegierten Intent nicht an. Die Member-Rolle muss rechtefrei, unverwaltet und unter der Bot-Rolle stehen. Mod-Rollen werden weiterhin ausschließlich freiwillig über `/mods` bzw. Onboarding ausgewählt.

## Noch offen

Dashboard-Entwürfe werden noch nicht automatisch als Live-Konfiguration des Bots aktiviert. Servermigration, Nachrichtenveröffentlichung und Community-Schreibzugriffe bleiben bis zur ausdrücklich freigegebenen Migration gesperrt. AutoMod, Eventverwaltung, Community-Level und allgemeine Automationsregeln sind weiterhin geplante Ausbaustufen.

Discord-Bots können Spielaktivitäten setzen, aber keine beliebigen Rich-Presence-Buttons oder klickbaren Dashboard-URLs in der Spielaktivität. Deshalb verwendet Nexora den echten Linkbutton bei `/status`.
