const base='https://www.sowhat.co.il';
for(const locale of ['he','en','fr']) for(const slug of ['ketchup','mayonnaise']) {
 const r=await fetch(base+'/menu/'+slug,{headers:{Cookie:'nb-locale='+locale},signal:AbortSignal.timeout(30000)});
 const html=await r.text();
 const price=html.match(/class="menu-item-detail-price"[^>]*>(.*?)<\/p>/s)?.[1];
 const schemas=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));
 console.log(JSON.stringify({slug,locale,status:r.status,price,offers:schemas.filter(s=>s['@type']==='Product').map(s=>s.offers)}));
}
