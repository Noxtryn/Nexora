# Nexora Control

Website für **Nexora • Mod Community**, ThePrisons und Sky Supra.

## Website

https://noxtryn.github.io/Nexora/

Öffentliche Design-Vorschau mit getrennten Mod-Bereichen und bearbeitbaren
Beispieleinstellungen. Eingaben bleiben ausschließlich im jeweiligen Browser.
Die Vorschau hat keinen Discord-Zugriff und keinen angeschlossenen Login.

GitHub Pages hostet HTML, CSS und JavaScript. Für echten Discord-OAuth-Login,
private Tickets und die Serververwaltung ist zusätzlich das Python-Backend
unter HTTPS erforderlich. Bot-Token und OAuth Client Secret gehören niemals
in diese Website oder in Git.

## Veröffentlichung

`.github/workflows/pages.yml` veröffentlicht diese Website über GitHub Actions.
Die HTML-/CSS-/JavaScript-Dateien liegen im Repository-Stamm. Bestehende LICENSE
und die erste Repository-Historie bleiben erhalten.

## Bot und Backend

[Geprüfter Quellstand als Archiv](nexora-source.zip) enthält den Bot, das lokale
OAuth-Dashboard und Tests mit separater Runtime-Konfiguration. 94 Tests bestanden.
Die Offline-Metadaten von ThePrisons sind ausdrücklich als Snapshot gekennzeichnet.
Keine Credentials, Datenbanken oder Laufzeitdateien enthalten.

Servermigration und öffentliche Discord-Posts bleiben bis zur ausdrücklichen
Freigabe gesperrt. Eine Website-Veröffentlichung aktiviert sie nicht.
