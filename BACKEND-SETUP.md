# Discord-Login ohne eigene Domain und ohne Docker

Die öffentliche Website bleibt https://noxtryn.github.io/Nexora/ .
Der Login-Link öffnet das geschützte Dashboard auf einer Render-HTTPS-Adresse.
Login und API bleiben dort auf derselben Origin; Tokens werden nie an GitHub Pages
übergeben. Es wird keine Cross-Site-Cookie-Freigabe benötigt.

## Deployment

1. https://dashboard.render.com/ anmelden. Blueprint aus
   https://github.com/Noxtryn/Nexora erstellen. `render.yaml` startet Python direkt.
2. `DISCORD_OAUTH_CLIENT_SECRET` ausschließlich im geschützten Render-Eingabefeld
   eintragen. Application: 1557515544230371338. Kein Bot-Token für Login nötig.
3. Die tatsächlich zugeteilte HTTPS-Serviceadresse ablesen. Im Discord Developer
   Portal unter OAuth2 Redirects exakt `https://SERVICE.onrender.com/auth/callback`
   hinterlegen. SERVICE muss die echte, von Render zugeteilte Adresse sein.
4. `/healthz`, `/auth/login` und vollständigen Discord-Login prüfen. Fremde Hosts,
   ungültiger OAuth-State und Nichtmitglieder müssen abgewiesen werden.
5. Erst nach Erfolg die echte Origin in `backend.json` eintragen. Die GitHub-Seite
   aktiviert dann ihren Login-Link zum Backend. Keine Zugangsdaten in dieser Datei.

## Kostenloser Login-Test

Der Blueprint verwendet Free und startet keinen zweiten Discord-Gateway-Bot.
Free schläft nach Inaktivität und hat keinen dauerhaften lokalen Speicher.
Deshalb sperrt `NEXORA_READONLY=1` alle Konfigurationsschreibzugriffe. Login und
geschützte Ansichten können getestet werden, ohne Entwürfe als dauerhaft zu
versprechen. Eine dauerhafte Datenbank oder ein persistentes Hosting muss vor
Aktivierung des Speicherns eingerichtet werden. Keine kostenpflichtige Ressource
wird durch diesen Blueprint angelegt.

Servermigration und öffentliche Discord-Nachrichten bleiben weiterhin gesperrt.

Referenzen:
- https://render.com/docs/deploy-fastapi
- https://render.com/docs/environment-variables
- https://render.com/docs/free
