'use strict';
// This is a local browser preview, never an authentication or bot API.
const previewConfig = fetch('./demo-config.json').then(response => {
    if (!response.ok) throw Error('Vorschaukonfiguration fehlt.');
    return response.json();
});
const storagePrefix = 'nexora-public-preview-v1:';
let previewHistory = [];
const clonePreview = value => JSON.parse(JSON.stringify(value));
function previewResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {status, headers: {'Content-Type': 'application/json'}});
}
window.nexoraPreviewRequest = async (path, options = {}) => {
    const modules = await previewConfig;
    const method = options.method || 'GET';
    if (path === '/api/public') return previewResponse({demo_available: true, login_configured: false});
    if (path === '/auth/demo' && method === 'POST') {
        sessionStorage.setItem(storagePrefix + 'open', 'true');
        return previewResponse({ok: true});
    }
    if (sessionStorage.getItem(storagePrefix + 'open') !== 'true') return previewResponse({detail: 'Design-Vorschau öffnen.'}, 401);
    if (path === '/api/me') return previewResponse({user: {id: 'local-demo', username: 'Design-Vorschau'}, can_edit: true, demo: true, csrf: 'browser-preview-only', guild_id: 'preview'});
    if (path === '/auth/logout') {
        sessionStorage.removeItem(storagePrefix + 'open');
        return previewResponse({ok: true});
    }
    if (path === '/api/status') return previewResponse({health: {status: 'unknown', age_seconds: null, latency_ms: null}, live_changes_enabled: false, modules, scopes: ['community', 'theprisons', 'sky-supra']});
    if (path === '/api/operations') return previewResponse({presence:'mastering NEXORA',checks:[{name:'Design-Vorschau',ready:true,detail:'Daten liegen nur in diesem Browser'},{name:'Live-Verbindung',ready:false,detail:'Für echte Daten mit Discord anmelden'}]});
    if (path === '/api/tickets') return previewResponse({available:false,tickets:[],reason:'Private Tickets sind nur im geschützten Dashboard zugänglich.'});
    if (path === '/api/jobs') return previewResponse({enabled:false,jobs:[]});
    const toolMatch = path.match(/^\/api\/tools\/preview\/(community|theprisons|sky-supra)\/(moderation|automod|event)$/);
    if (toolMatch && method === 'POST') {
        let settings;
        try { settings = JSON.parse(options.body); } catch { return previewResponse({detail:'Ungültige Werkzeug-Vorschau.'},400); }
        if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return previewResponse({detail:'Werkzeugeinstellungen fehlen.'},400);
        const [, scope, tool] = toolMatch;
        return previewResponse({schema:'nexora-pages-tool-preview-v1',scope,module:'tool-'+tool,revision:0,
            simulation:true,live_apply_available:false,
            blocking:['Design-Vorschau: Serverzugriff, Berechtigungen und Modulfreigabe wurden nicht geprüft.'],
            changes:[{action:tool,settings}],notes:['Keine Discord-Aktion. Für eine echte geprüfte Freigabe mit Discord anmelden.']});
    }
    if (path.startsWith('/api/releases/')) return previewResponse({detail:'Für echte Release-Daten mit Discord anmelden.'},503);
    if (path === '/api/backup') {
        const drafts=[];
        for(const scope of ['community','theprisons','sky-supra']) for(const module of Object.keys(modules)) {
            const saved=JSON.parse(localStorage.getItem(storagePrefix+scope+':'+module)||'null');
            if(saved) drafts.push(saved);
        }
        return previewResponse({schema:'nexora-browser-preview-backup-v1',simulation:true,drafts});
    }
    if (path === '/api/server') return previewResponse({available: false, reason: 'Diese öffentliche Vorschau ist mit keinem Discord-Server verbunden.', roles: [], channels: []});
    if (path === '/api/audit') {
        return previewResponse(JSON.parse(localStorage.getItem(storagePrefix + 'audit') || '[]'));
    }
    const match = path.match(/^\/api\/(drafts|preview)\/(community|theprisons|sky-supra)\/(roles|messages|tickets|releases|setup)$/);
    if (!match) return previewResponse({detail: 'In der Website-Vorschau nicht verfügbar.'}, 404);
    const [, action, scope, module] = match;
    const key = storagePrefix + scope + ':' + module;
    const defaults = {enabled: false, settings: clonePreview(modules[module].settings)};
    if (module === 'tickets') defaults.settings.category_id = '';
    const draft = JSON.parse(localStorage.getItem(key) || 'null') || {scope, module, revision: 0, document: defaults, updated_at: null};
    if (action === 'drafts' && method === 'GET') return previewResponse(draft);
    let body;
    try { body = JSON.parse(options.body); } catch { return previewResponse({detail: 'Ungültige Vorschauanfrage.'}, 400); }
    if (body.revision !== draft.revision) return previewResponse({detail: 'Die Vorschau wurde inzwischen geändert. Neu laden.'}, 409);
    if (action === 'drafts' && method === 'PUT') {
        if (!body.document || typeof body.document.enabled !== 'boolean' || !body.document.settings) return previewResponse({detail: 'Ungültige Einstellungen.'}, 400);
        const updated = {...draft, revision: draft.revision + 1, document: body.document, updated_at: Date.now() / 1000};
        localStorage.setItem(key, JSON.stringify(updated));
        const audit = JSON.parse(localStorage.getItem(storagePrefix + 'audit') || '[]');
        audit.unshift({scope, module, revision: updated.revision, actor: 'local-demo', created_at: updated.updated_at, changed_fields: JSON.stringify(Object.keys(updated.document.settings).filter(k => updated.document.settings[k] !== draft.document.settings[k]).map(k => 'settings.' + k))});
        localStorage.setItem(storagePrefix + 'audit', JSON.stringify(audit.slice(0, 40)));
        return previewResponse(updated);
    }
    if (action === 'preview' && method === 'POST') {
        const proposal = {schema: 'nexora-pages-design-preview-v1', scope, module, revision: draft.revision, simulation: true, live_apply_available: false, blocking: ['Design-Vorschau: Discord-Ressourcen und Berechtigungen sind nicht geprüft.'], changes: [{action: {roles: 'configure_autorole', messages: 'prepare_message', tickets: 'configure_private_tickets', releases: 'prepare_release', setup: 'prepare_server_structure'}[module], ...draft.document.settings}], notes: ['Diese Daten liegen nur in diesem Browser. Kein Backend und kein Discord-Zugriff.']};
        previewHistory.push(proposal);
        return previewResponse(proposal);
    }
    return previewResponse({detail: 'Aktion in der Vorschau nicht verfügbar.'}, 405);
};
document.addEventListener('DOMContentLoaded', async () => {
    const login = document.querySelector('.login-link');
    login.href = '#';
    login.setAttribute('aria-disabled', 'true');
    login.addEventListener('click', event => {
        if (login.getAttribute('aria-disabled') === 'false') return;
        event.preventDefault();
        document.getElementById('login-note').textContent = 'Für echten Discord-Login muss zuerst das Backend mit HTTPS verbunden werden. Du kannst die Design-Vorschau öffnen.';
    });
    try {
        const response = await fetch('./backend.json', {cache: 'no-store'});
        if (!response.ok) return;
        const config = await response.json();
        if (typeof config.origin !== 'string') return;
        const origin = new URL(config.origin);
        if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) return;
        login.href = origin.origin + '/auth/login';
        login.textContent = 'Mit Discord anmelden ↗';
        login.setAttribute('aria-disabled', 'false');
        document.getElementById('login-note').textContent = 'Die Anmeldung öffnet das geschützte Nexora-Dashboard. Die Design-Vorschau bleibt hier verfügbar.';
    } catch { /* Missing configuration keeps the preview usable. */ }
});
