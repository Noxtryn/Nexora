# Nexora Control

Website für **Nexora • Mod Community**, ThePrisons und Sky Supra.

## Website

https://noxtryn.github.io/Nexora/

Öffentliche Design-Vorschau mit getrennten Mod-Bereichen und bearbeitbaren
Beispieleinstellungen. Eingaben bleiben ausschließlich im jeweiligen Browser.
Die Vorschau hat keinen Discord-Zugriff. Der Discord-Login öffnet das separat
gehostete, geschützte Dashboard unter https://nexora-control.onrender.com .

GitHub Pages hostet HTML, CSS und JavaScript. Für echten Discord-OAuth-Login,
private Tickets und die Serververwaltung ist das Python-Backend
unter HTTPS erforderlich. Bot-Token und OAuth Client Secret gehören niemals
in diese Website oder in Git.

## Veröffentlichung

`.github/workflows/pages.yml` veröffentlicht diese Website über GitHub Actions.
Die HTML-/CSS-/JavaScript-Dateien liegen im Repository-Stamm. Bestehende LICENSE
und die erste Repository-Historie bleiben erhalten.

## Bot und Backend

[Geprüfter Quellstand als Archiv](nexora-source.zip) enthält den Bot, das lokale
OAuth-Dashboard und Tests mit separater Runtime-Konfiguration. 141 Tests ausgeführt: 140 bestanden, ein echter PostgreSQL-Test ohne Testverbindung ausgesetzt.
Die Offline-Metadaten von ThePrisons sind ausdrücklich als Snapshot gekennzeichnet.
Keine Credentials, Datenbanken oder Laufzeitdateien enthalten.

Servermigration und öffentliche Discord-Posts bleiben bis zur ausdrücklichen
Freigabe gesperrt. Eine Website-Veröffentlichung aktiviert sie nicht.

## Backend ohne Docker und ohne eigene Domain

Native Python-Runtime auf Render, Frankfurt, Free-Tarif. HTTPS-Healthcheck und
OAuth-Weiterleitung geprüft. Ein vollständiger Discord-Login wurde vom Benutzer bestätigt. [Einrichtung und Einschränkungen](BACKEND-SETUP.md).
Free-Hosting sperrt das Speichern, bis dauerhafter Datenspeicher eingerichtet ist.
Die Design-Vorschau speichert ihre Beispiele weiterhin nur im jeweiligen Browser.


## Betriebsfunktionen

Ticketübersicht mit Mod-Filter, Release-Ansichten, Konfigurationsbackup und Verbindungsprüfung sind implementiert. Der Bot unterstützt den Spielstatus `mastering NEXORA`, einen Dashboard-Link bei `/status` und sichere Member-Autorollen. PostgreSQL und die ausgehende Windows-Agent-Verbindung sind vorbereitet; Datenbank und Verbindungsschlüssel müssen noch eingerichtet werden. Details und verbleibende Ausbaustufen: [FEATURES-SETUP.md](FEATURES-SETUP.md).

