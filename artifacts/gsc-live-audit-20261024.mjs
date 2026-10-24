import fs from 'node:fs/promises';
const root = 'https://www.sowhat.co.il';
const xml = await (await fetch(root+'/sitemap.xml')).text();
const sitemap = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const old = JSON.parse(await fs.readFile(new URL('./gsc-404-20261024.json',import.meta.url),'utf8'));
const extraFile = new URL('./gsc-unindexed-20261024.json',import.meta.url);
const extra = await fs.readFile(extraFile,'utf8').then(JSON.parse).catch(()=>[]);
const urls = [...new Set([...sitemap,...old,...extra])];
const results=[];
const links=new Set();
for(let i=0;i<urls.length;i+=5){
 await Promise.all(urls.slice(i,i+5).map(async url=>{
  try{
   const r=await fetch(url,{signal:AbortSignal.timeout(45000)}); const html=await r.text();
   if(sitemap.includes(url)) for(const m of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){try{const u=new URL(m[1].replaceAll('&amp;','&'),url); if(u.origin===root){u.hash='';links.add(u.href);}}catch{}}
   results.push({url,status:r.status,final:r.url,inSitemap:sitemap.includes(url),xRobots:r.headers.get('x-robots-tag'),canonical:html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],robots:html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/)?.[1],title:html.match(/<title>(.*?)<\/title>/)?.[1]});
  }catch(e){results.push({url,error:e.message});}
 }));
}
const internal=[];
for(const url of links){if(results.some(r=>r.url===url||r.final===url))continue; const r=await fetch(url,{signal:AbortSignal.timeout(30000)});internal.push({url,status:r.status,final:r.url});await r.arrayBuffer();}
const robots=await (await fetch(root+'/robots.txt')).text();
await fs.writeFile(new URL('./gsc-live-results-20261024.json',import.meta.url),JSON.stringify({sitemap,results,internal,robots},null,2));
console.log(JSON.stringify({sitemapCount:sitemap.length,checked:results.length,internalLinks:links.size,additionalInternal:internal,robots,sitemapIssues:results.filter(r=>r.inSitemap&&(r.status!==200||/noindex/.test((r.robots||'')+(r.xRobots||''))||r.canonical?.replace(/\/$/,'')!==r.url.replace(/\/$/,'')))},null,2));
