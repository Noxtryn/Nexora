'use strict';
const jobsPanel=node('section',undefined,'panel');
const jobsHeading=node('div',undefined,'panel-heading');
const jobsButton=node('button','Aufträge aktualisieren','secondary');
const jobsTarget=node('div','Noch keine Aufträge geladen.');
jobsHeading.append(node('h2','Freigaben & geplante Aufträge'),jobsButton);
jobsPanel.append(jobsHeading,jobsTarget);
document.getElementById('overview').append(jobsPanel);
jobsButton.onclick=async()=>{
    jobsButton.disabled=true;
    try{
        const data=await api('/api/jobs');jobsTarget.replaceChildren();
        jobsTarget.append(node('p',data.enabled?'Live-Anwendung freigeschaltet; jeder Auftrag braucht einen geprüften Plan.':'Live-Anwendung gesperrt. Vorschauen ändern Discord nicht.'));
        const statuses={queued:'Wartet',claimed:'In Bearbeitung · bei Unterbrechung manuell prüfen',succeeded:'Erfolgreich',rejected:'Abgewiesen · Vorschau erneuern',uncertain:'Ergebnis unklar · keine automatische Wiederholung'};
        for(const job of data.jobs){
            const row=node('div',undefined,'audit-row');
            const title=status?.modules[job.module]?.title||({'ticket-action':'Ticketaktion','tool-moderation':'Moderation','tool-automod':'AutoMod','tool-event':'Mod-Event'}[job.module]||job.module);
            const info=node('div',(names[job.scope]||job.scope)+' · '+title);
            info.append(node('small',job.id.slice(0,12)+' · '+new Date((job.not_before||job.created_at)*1000).toLocaleString('de-DE')));
            const result=node('div',statuses[job.status]||job.status);
            if(job.result){const receipt=JSON.parse(job.result);if(receipt.restart_required)result.append(node('small','Bot-Neustart erforderlich: Gateway-Intents werden beim Start gewählt.'));}
            row.append(info,result);jobsTarget.append(row);
        }
        if(!data.jobs.length)jobsTarget.append(node('p','Keine freigegebenen Aufträge.'));
    }catch(error){jobsTarget.replaceChildren(node('p',error.message));}
    finally{jobsButton.disabled=false;}
};

async function manageTicket(ticket){
    const dialog=node('dialog',undefined,'review-dialog');
    const title=node('h2','Privates Ticket · '+names[ticket.mod]);
    const action=node('select');
    for(const [value,label] of [['close','Schließen'],['reopen','Wieder öffnen'],['assign','Teammitglied zuweisen'],['priority','Priorität setzen'],['note','Interne Notiz']]){
        const option=node('option',label);option.value=value;action.append(option);
    }
    const value=node('textarea');value.placeholder='Zuweisung: Mitglied-ID · Priorität: low/normal/high/urgent · Notiz: Text';
    value.maxLength=2000;
    const explanation=node('p','Zuerst prüfen, dann diesen konkreten Auftrag ausdrücklich freigeben. Der Bot prüft deinen privaten Ticketzugriff erneut.');
    const preview=node('button','Ticketaktion prüfen','secondary');
    const close=node('button','Abbrechen','secondary');close.onclick=()=>{dialog.close();dialog.remove();};
    const result=node('div');
    preview.onclick=async()=>{
        preview.disabled=true;result.replaceChildren();
        try{
            const proposal=await api('/api/ticket-preview/'+ticket.id,{method:'POST',body:JSON.stringify({action:action.value,value:['close','reopen'].includes(action.value)?null:value.value})});
            action.disabled=true;value.disabled=true;
            const consent=node('label','Diese Ticketaktion ausdrücklich freigeben.');
            const box=node('input');box.type='checkbox';consent.prepend(box);
            const apply=node('button','Freigeben und einreihen','primary');apply.disabled=true;
            box.onchange=()=>apply.disabled=!box.checked;
            apply.onclick=async()=>{apply.disabled=true;try{
                const job=await api('/api/approve',{method:'POST',body:JSON.stringify({digest:proposal.digest,revision:0})});
                result.replaceChildren(node('p','Auftrag '+job.id.slice(0,12)+' · '+job.status+'. Status unter Freigaben & geplante Aufträge.'));
            }catch(error){toast(error.message,true);apply.disabled=!box.checked;}};
            result.append(node('p',action.selectedOptions[0].textContent+' · '+ticket.name),consent,apply);
        }catch(error){result.append(node('p',error.message));preview.disabled=false;}
    };
    dialog.append(title,explanation,action,value,preview,close,result);document.body.append(dialog);dialog.showModal();
}

const toolsPanel=node('section',undefined,'panel');
toolsPanel.append(node('h2','Moderation, AutoMod & Mod-Events'),node('p','Jedes Werkzeug erstellt zuerst einen Plan. Der lokale Bot prüft Teamrechte, eigene Rechte und das aktivierte Modul vor der Ausführung.'));
const toolKind=node('select');
for(const [value,label] of [['moderation','Moderation'],['automod','Discord AutoMod'],['event','Mod-Event']]){const option=node('option',label);option.value=value;toolKind.append(option);}
toolKind.setAttribute('aria-label','Werkzeug');
const toolFields=node('div');const toolResults=node('div');
const definitions={
    moderation:{action:['Aktion','select',['warn','timeout','kick','ban']],target_id:['Mitglied-ID','text',''],reason:['Begründung','textarea',''],minutes:['Timeout in Minuten (0 entfernt ihn)','number',60]},
    automod:{keywords:['Schlüsselwörter (eine Zeile pro Wort, maximal 100)','textarea',''],enabled:['Nach Freigabe blockieren (aus: Regel deaktiviert vorbereiten)','checkbox',false]},
    event:{name:['Eventname','text',''],description:['Beschreibung','textarea',''],start:['Beginn (lokale Zeit)','datetime-local',''],end:['Ende (lokale Zeit)','datetime-local',''],location:['Ort / Treffpunkt','text','']}
};
function renderTool(){
    toolFields.replaceChildren();toolResults.replaceChildren();
    for(const [key,[label,type,initial]] of Object.entries(definitions[toolKind.value])){
        const field=node('div',undefined,'field');const text=node('label',label);text.htmlFor='tool-'+key;
        const input=node(type==='select'?'select':type==='textarea'?'textarea':'input');input.id='tool-'+key;input.dataset.toolKey=key;
        if(type==='select'){for(const value of initial){const option=node('option',value);option.value=value;input.append(option);}}
        else if(type==='checkbox'){input.type=type;input.checked=initial;}
        else{if(input.tagName==='INPUT')input.type=type;input.value=initial;if(type==='number'){input.min='0';input.max='40320';input.step='1';}}
        field.append(text,input);toolFields.append(field);
    }
}
toolKind.onchange=renderTool;
const toolPreview=node('button','Werkzeug prüfen','secondary');
toolPreview.onclick=async()=>{
    toolPreview.disabled=true;toolResults.replaceChildren();
    try{
        const values={};
        for(const input of toolFields.querySelectorAll('[data-tool-key]')){
            let value=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.value;
            if(input.type==='datetime-local'){if(!input.value)throw Error('Bitte Beginn und Ende auswählen.');value=new Date(input.value).toISOString();}
            values[input.dataset.toolKey]=value;
        }
        const proposal=await api('/api/tools/preview/'+scope+'/'+toolKind.value,{method:'POST',body:JSON.stringify(values)});
        const details=node('details');details.open=true;details.append(node('summary','Konkreter Plan'),node('pre',JSON.stringify(proposal,null,2)));toolResults.append(details);
        if(!proposal.live_apply_available||proposal.blocking.length){toolResults.append(node('p','Ausführung gesperrt: '+(proposal.blocking.join(' · ')||'Serverfreigabe ausstehend')));return;}
        const label=node('label','Diesen Plan ausdrücklich freigeben.');const consent=node('input');consent.type='checkbox';label.prepend(consent);
        const apply=node('button','Freigeben und einreihen','primary');apply.disabled=true;consent.onchange=()=>apply.disabled=!consent.checked;
        apply.onclick=async()=>{apply.disabled=true;try{const job=await api('/api/approve',{method:'POST',body:JSON.stringify({digest:proposal.digest,revision:0})});toolResults.replaceChildren(node('p','Auftrag '+job.id.slice(0,12)+' · '+job.status));}catch(error){toast(error.message,true);apply.disabled=!consent.checked;}};
        toolResults.append(label,apply);
    }catch(error){toolResults.append(node('p',error.message));}
    finally{toolPreview.disabled=false;}
};
toolsPanel.append(toolKind,toolFields,toolPreview,toolResults);document.getElementById('overview').append(toolsPanel);renderTool();
