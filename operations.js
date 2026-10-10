'use strict';
// Uses the authenticated same-origin API and renders text without HTML injection.
async function loadOperations(){
 const target=$('operations-results');target.replaceChildren(node('p','Betriebsdaten werden geladen …'));
 try{const data=await api('/api/operations');target.replaceChildren();
 for(const check of data.checks){const row=node('div',undefined,'preview-row');const detail=node('div',check.name);detail.append(node('small',check.detail));row.append(detail,node('b',check.ready?'Bereit':'Einrichtung offen'));target.append(row)}
 const card=node('div',undefined,'embed');card.append(node('h4','🎮 '+data.presence),node('p','Der Bot zeigt diese Spielaktivität nach dem Start. Der Dashboard-Link ist über /status erreichbar.'));target.append(card);
 }catch(error){target.replaceChildren(node('p',error.message))}
}
async function loadTickets(){
 const target=$('ticket-results');target.replaceChildren(node('p','Tickets werden geladen …'));
 try{const data=await api('/api/tickets');target.replaceChildren();if(!data.available){target.append(node('p',data.reason));return}
 const query=$('ticket-search').value.trim().toLowerCase();const mod=$('ticket-mod').value;
 const items=data.tickets.filter(t=>(!mod||t.mod===mod)&&(!query||[t.name,t.requester_id,t.kind].some(v=>v.toLowerCase().includes(query))));
 target.append(node('p',items.length+' passende Tickets'));
 for(const ticket of items){const row=node('div',undefined,'audit-row');const details=node('div',names[ticket.mod]+' · '+ticket.kind);details.append(node('small',ticket.name+' · Ersteller '+ticket.requester_id));const link=node('a','In Discord öffnen ↗','secondary');link.href=ticket.url;link.target='_blank';link.rel='noopener noreferrer';row.append(details,link);target.append(row)}
 }catch(error){target.replaceChildren(node('p',error.message))}
}
async function loadRelease(){
 const target=$('release-results');target.replaceChildren(node('p','Release wird geladen …'));
 try{const data=await api('/api/releases/'+$('release-mod').value);target.replaceChildren(node('h3',names[data.mod]+' · '+data.version));
 for(const card of data.cards){const embed=node('div',undefined,'embed');embed.append(node('h4',card.title),node('p',card.description));target.append(embed)}
 }catch(error){target.replaceChildren(node('p',error.message))}
}
$('load-operations').onclick=loadOperations;
$('load-tickets').onclick=loadTickets;
$('ticket-mod').onchange=loadTickets;
$('ticket-search').oninput=()=>{clearTimeout(loadTickets.timer);loadTickets.timer=setTimeout(loadTickets,400)};
$('load-release').onclick=loadRelease;
$('backup-config').onclick=async()=>{try{const data=await api('/api/backup');const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const link=node('a');link.href=url;link.download='nexora-config-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(error){toast(error.message,true)}};
