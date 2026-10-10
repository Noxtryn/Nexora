# Nexora – Sprint und Betriebsanbindung

GitHub Pages: https://noxtryn.github.io/Nexora/
Geschütztes Dashboard: https://nexora-control.onrender.com

## Implementierte Kernfunktionen

- Discord-Login, erneute Serverberechtigungsprüfung, CSRF-Schutz und getrennte Design-Vorschau.
- Community, ThePrisons und Sky Supra: versionierte Einstellungen, Audit, Export und PostgreSQL-Unterstützung.
- Freiwillige Mod-Rollen mit persistenten Menüs/Buttons und Onboarding-Kompatibilität.
- Member-Autorollen mit Verzögerung, Screening, Rollenhierarchie und dauerhafter Warteschlange.
- Embed-Editor, mod-spezifische Downloads und Veröffentlichungen mit gemeinsamer Duplikatkontrolle.
- Private Ticketformulare, Archivierung, Wiederöffnung, Zuweisung, Priorität, interne Notizen und private JSON-Transkripte.
- Serverstruktur-Vorschau mit Berechtigungsmatrix und Erhalt bestehender IDs. Keine Kanal- oder Nachrichtenlöschung.
- Dauerhafte Freigabe-Aufträge, Zeitplanung bis sieben Tage, frische Prüfung vor Ausführung. Unklare Aktionen werden nicht blind wiederholt.
- Moderation: lokale Verwarnungsfälle, Timeout, Kick und Ban mit Rechte- und Hierarchieprüfung. Bans löschen keine Nachrichten.
- Native AutoMod-Schlüsselwortregeln für Community oder eine Mod mit Kanal-Ausnahmen.
- Native Discord-Events für beide Mods mit Ort, Beginn und Ende.
- Animierter Organizer-Bereich, reduzierte Bewegung nach Systemeinstellung, Spielstatus mastering NEXORA und Dashboard-Linkbutton bei /status.

## Tatsächlicher Stand

141 Tests ausgeführt: 140 bestanden, ein echter PostgreSQL-Test ohne Test-Datenbank ausgesetzt. JavaScript-Formulare und die isolierte Pages-Vorschau sind separat geprüft. Code-Unterstützung bedeutet noch keine aktive Live-Anbindung. Die zuletzt überprüfte Render-Konfiguration enthielt weder DATABASE_URL noch Agent-Schlüssel. Keine Servermigration wurde freigegeben oder angewendet.

## Datenbank verbinden

1. Vorhandenes Neon-Projekt square-grass-63437288 verwenden.
2. PostgreSQL-Verbindungsadresse ausschließlich bei Render als DATABASE_URL hinterlegen. TLS aktiv lassen, beispielsweise sslmode=require. Keine Zugangsdaten in Chat oder Git.
3. Deploy starten und Datenbankstart prüfen. NEXORA_READONLY=1 bis zur erfolgreichen Prüfung erhalten.
4. Danach Schreibbetrieb freigeben, Entwurf speichern und erhaltene Revision nach einem erneuten Deploy prüfen. Gesonderte Test-Datenbank optional als NEXORA_TEST_DATABASE_URL verwenden.

## Lokalen Bot anbinden

1. Aktuelle Bot-Quelle installieren. state, .venv, verschlüsselte Zugangsdaten und lokale Konfiguration erhalten.
2. Zufälligen gemeinsamen Schlüssel mit mindestens 32 Zeichen bei Render als NEXORA_AGENT_KEY hinterlegen.
3. Lokal hosting/windows/Configure-NexoraAgent.ps1 ausführen und denselben Schlüssel verdeckt eingeben; Windows-DPAPI schützt ihn.
4. Bot neu starten und frisches Inventar prüfen. Nach 120 Sekunden ohne Signal gilt die Verbindung als veraltet.

Der Bot-Token bleibt lokal. Der Agent öffnet keine Benutzer-Sitzung. Bei freigegebenem Kontrollbetrieb kann sein Schlüssel Aufträge dieses Servers abholen und Ergebnisse bestätigen; wie ein Secret behandeln.

## Freigaben für echten Betrieb

Eine Vorschau schreibt nicht zu Discord. Ein Auftrag benötigt eine sichtbare Vorschau und gesonderte Bestätigung. Lokale Freigabeschalter werden durch keinen Entwurf umgangen:

| Schalter | Wirkung |
|---|---|
| NEXORA_CONTROL_ENABLED=true | Backend und Bot erlauben den kontrollierten Auftragskanal |
| NEXORA_COMMUNITY_ENABLED=true | Bot erlaubt Community-Schreibzugriffe |
| NEXORA_PUBLISH_ENABLED=true | Nachrichten und Releases veröffentlichen |
| NEXORA_MIGRATION_APPROVED=true | Struktur-Aufträge zusätzlich zur Owner-Freigabe erlauben |
| NEXORA_MODERATION_ENABLED=true | Moderationsaufträge erlauben |
| NEXORA_AUTOMOD_ENABLED=true | Native AutoMod-Aufträge erlauben |
| NEXORA_EVENTS_ENABLED=true | Native Event-Aufträge erlauben |

Migration und Veröffentlichung bleiben bis zur ausdrücklichen Serverfreigabe ausgeschaltet. Command-Registrierung ist eine eigene Discord-Schreibaktion. Autorollen benötigen den Server Members Intent und eine rechtefreie Member-Rolle unter dem Bot. Die Aktivierung verlangt einen Neustart, damit der Intent korrekt angefordert wird. Moderation, AutoMod und Events benötigen nur ihre jeweiligen Rechte; kein Administratorrecht für den Bot.

## Weitere Ausbaustufen und Grenzen

Der frühere umfangreiche Featurekatalog ist noch nicht vollständig umgesetzt: visueller bedingter Automationseditor, XP/Levels, Umfragen, Beta-Anmeldungen, Raid-Erkennung, Einsprüche, temporäre Voice-Kanäle, Dashboard-Ticketantworten/Teilnehmerverwaltung, Eventbearbeitung/-absage und allgemeine Backup-Wiederherstellung fehlen. Aufbewahrungsdauer und Release-Alerts sind bisher gespeicherte Einstellungen, keine laufende Bereinigung oder Benachrichtigung. Diese dürfen nicht als aktiv dargestellt werden.

Discord-Bot-Spielaktivitäten unterstützen keine frei gestaltbaren animierten RPC-Hintergründe oder beliebigen Dashboard-Buttons. Animationen befinden sich im Dashboard; /status enthält den funktionierenden Link. Die tatsächliche Änderung von Discord-Profilbild und Banner ist noch nicht bestätigt.
