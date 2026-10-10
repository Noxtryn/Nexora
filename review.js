'use strict';
const reviewButton = document.createElement('button');
reviewButton.type = 'button';
reviewButton.className = 'secondary';
reviewButton.textContent = 'Änderungen prüfen';
document.querySelector('.save-bar').insertBefore(reviewButton, document.getElementById('save'));
const reviewDialog = document.createElement('dialog');
reviewDialog.className = 'review-dialog';
document.body.append(reviewDialog);
reviewButton.onclick = async () => {
    if (!me?.can_edit || !draft) return toast('Bitte zuerst einen bearbeitbaren Entwurf öffnen.', true);
    if (dirty) return toast('Speichere deine Änderungen vor der Prüfung.', true);
    reviewButton.disabled = true;
    try {
        const proposal = await api(`/api/preview/${scope}/${page}`, {
            method: 'POST', body: JSON.stringify({revision: draft.revision})
        });
        reviewDialog.replaceChildren();
        const top = node('div', undefined, 'panel-heading');
        const close = node('button', 'Schließen', 'secondary');
        close.onclick = () => reviewDialog.close();
        top.append(node('h2', 'Änderungsvorschau'), close);
        reviewDialog.append(top, node('p', `${names[proposal.scope]} · ${status.modules[proposal.module].title} · Revision ${proposal.revision}`));
        reviewDialog.append(node('p', proposal.simulation
            ? 'Simulation — bestehende Discord-Ressourcen sind nicht geprüft.'
            : 'Geprüft gegen einen frisch gelesenen Serverzustand.'));
        if (proposal.blocking.length) {
            reviewDialog.append(node('h3', 'Vor einer Freigabe klären'));
            for (const reason of proposal.blocking) reviewDialog.append(node('p', reason));
        }
        reviewDialog.append(node('h3', `${proposal.changes.length} vorbereitete Änderungen`));
        const actions = {
            prepare_message: 'Nachrichtenentwurf', configure_autorole: 'Member-Autorolle',
            configure_private_tickets: 'Private Ticketkonfiguration', prepare_release: 'Mod-Release',
            prepare_server_structure: 'Serverstruktur'
        };
        for (const change of proposal.changes) {
            const row = node('div', undefined, 'preview-row');
            row.append(node('span', change.kind || 'Konfiguration'),
                node('b', change.action ? actions[change.action] : `${change.id ? 'Anpassen' : 'Anlegen'}: ${change.body.name || change.key}`));
            reviewDialog.append(row);
        }
        if (proposal.payload) {
            const embed = proposal.payload.embeds[0];
            const box = node('div', undefined, 'embed');
            box.append(node('h4', embed.title), node('p', embed.description));
            reviewDialog.append(box);
        }
        for (const note of proposal.notes || []) reviewDialog.append(node('p', note, 'hint'));
        const details = node('details');
        details.append(node('summary', 'Vollständige Vorschau'), node('pre', JSON.stringify(proposal, null, 2)));
        reviewDialog.append(details);
        const download = node('button', 'Vorschau als JSON herunterladen', 'secondary');
        download.onclick = () => {
            const url = URL.createObjectURL(new Blob([JSON.stringify(proposal, null, 2)], {type: 'application/json'}));
            const link = node('a');
            link.href = url;
            link.download = `nexora-${proposal.scope}-${proposal.module}-revision-${proposal.revision}.json`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
        reviewDialog.append(download);
        if(proposal.live_apply_available && !proposal.simulation && !proposal.blocking.length){
            const consent=node('label','Diesen konkreten Plan für Discord ausdrücklich freigeben.');
            const box=node('input');box.type='checkbox';consent.prepend(box);
            const scheduleLabel=node('label','Optionaler Termin (deine Zeitzone, maximal sieben Tage)');
            const schedule=node('input');schedule.type='datetime-local';scheduleLabel.append(schedule);
            const apply=node('button','Plan freigeben und einreihen','primary');apply.disabled=true;
            box.onchange=()=>apply.disabled=!box.checked;
            apply.onclick=async()=>{apply.disabled=true;try{
                const body={digest:proposal.digest,revision:proposal.revision};
                if(schedule.value)body.scheduled_at=new Date(schedule.value).getTime()/1000;
                const job=await api('/api/approve',{method:'POST',body:JSON.stringify(body)});
                reviewDialog.append(node('p','Auftrag '+job.id.slice(0,12)+' · '+job.status+'. Status unter Aufträge prüfen.'));
                consent.remove();apply.remove();scheduleLabel.remove();
            }catch(error){toast(error.message,true);apply.disabled=!box.checked}};
            reviewDialog.append(scheduleLabel,consent,apply);
        }else reviewDialog.append(node('p','Live-Anwendung ist gesperrt. Vorschauen ändern Discord nicht.','hint'));
        reviewDialog.showModal();
    } catch (error) {
        toast(error.message, true);
    } finally {
        reviewButton.disabled = false;
    }
};
