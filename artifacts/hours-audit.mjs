import {writeFile} from 'node:fs/promises';
const root='https://www.sowhat.co.il';
const xml=await (await fetch(root+'/sitemap.xml')).text();
const urls=[...new Set([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]).concat([root+'/about',root+'/recommendations']))];
const rows=await Promise.all(urls.map(async url=>{
 const r=await fetch(url); const html=await r.text();
 const text=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
 const oldHours=/\b(?:11:00|20:00)[–-]00:00/.test(text);
 const closed=/שישי\s+סגור/.test(text);
 const updated=text.includes('11:00–23:00')&&text.includes('20:00–23:00');
 const schemas=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 const schemaOld=schemas.some(s=>/"closes"\s*:\s*"00:00"/.test(s));
 return {url,status:r.status,oldHours,closed,updated,schemaOld};
}));
await writeFile('artifacts/hours-audit.json',JSON.stringify(rows,null,2));
console.log(JSON.stringify({pages:rows.length,passed:rows.filter(x=>x.status===200&&!x.oldHours&&x.closed&&x.updated&&!x.schemaOld).length,failures:rows.filter(x=>x.status!==200||x.oldHours||!x.closed||!x.updated||x.schemaOld)},null,2));
