import fs from 'node:fs/promises';
const r=JSON.parse(await fs.readFile('artifacts/site-audit-before-20261026.json'));
const types={};const issues=[];
const walk=(x,fn)=>{if(Array.isArray(x))x.forEach(v=>walk(v,fn));else if(x&&typeof x==='object'){fn(x);Object.values(x).forEach(v=>walk(v,fn));}};
for(const p of r.pages){if(p.h1.length!==1)issues.push({url:p.url,issue:'H1 count',count:p.h1.length});if(!p.description||!p.title)issues.push({url:p.url,issue:'Missing title/description'});walk(p.schemas,x=>{if(x['@type'])types[x['@type']]=(types[x['@type']]||0)+1;if(x['@type']==='Question'&&!p.visible.includes(x.name))issues.push({url:p.url,issue:'FAQ question not in HTML',name:x.name});if(x['@type']==='Product'&&(!x.name||!x.offers||!x.url))issues.push({url:p.url,issue:'Missing product field'});if(x['@type']==='Article'&&(!x.headline||!x.datePublished||!x.author))issues.push({url:p.url,issue:'Missing Article field'});});}
console.log(JSON.stringify({types,issues,duplicates:r.pages.filter((p,i,a)=>a.findIndex(q=>q.title===p.title)!==i).map(p=>p.url),smash:r.pages.filter(p=>p.url.includes('so-smash')).map(({url,title,description,schemas})=>({url,title,description,schemas}))},null,2));
