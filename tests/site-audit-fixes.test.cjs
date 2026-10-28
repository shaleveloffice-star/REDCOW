const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createLoader}=require('./helpers.cjs');

test('recommendations metadata has its own canonical and social URL, disabled page stays noindex',async()=>{
 let enabled=true;
 const load=createLoader({
 'react/jsx-runtime':{jsx(){},jsxs(){}},
 'next/navigation':{notFound(){}},
 '@/components/features/recommendations/recommendations-page-view':{},
 '@/components/layout/site-footer':{},
 '@/i18n/get-localized-messages':{},
 '@/i18n/get-locale':{getServerLocale:async()=> 'he'},
 '@/lib/cache/cached-data':{getRecommendationsForDisplay:async()=>({enabled,title:'ממליצים עלינו',introduction:'התוכן הקיים'})}
 });
 const {generateMetadata}=load('@/app/recommendations/page');
 const meta=await generateMetadata();
 assert.equal(meta.alternates.canonical,'/recommendations');
 assert.equal(meta.openGraph.url,'/recommendations');
 assert.equal(meta.description,'התוכן הקיים');
 enabled=false;
 const hidden=await generateMetadata();
 assert.equal(hidden.robots.index,false);
 assert.equal(hidden.alternates,undefined);
});

test('hero optimization preserves custom admin URLs, trim and existing media files',()=>{
 const load=createLoader();
 const {resolveHeroVideo}=load('@/lib/hero-video');
 const {videoSourcesForMp4}=load('@/lib/video-sources');
 const optimized=resolveHeroVideo('/videos/sowhat-hero-20261020.mp4');
 assert.equal(optimized.src,'/videos/sowhat-hero-20261027-optimized.mp4');
 assert.equal(optimized.poster,'/videos/sowhat-hero-20261027-poster.webp');
 for(const {src} of videoSourcesForMp4(optimized.src)) assert.ok(fs.existsSync(path.join(__dirname,'../public',src)));
 assert.ok(fs.existsSync(path.join(__dirname,'../public',optimized.poster)));
 for(const custom of ['/videos/custom.mp4','https://example.com/clip.mp4','/image.jpg']) assert.deepEqual(resolveHeroVideo(custom),{src:custom});
 assert.equal(resolveHeroVideo('/videos/sowhat-hero-20261020.mp4',4).poster,undefined);
 assert.equal(resolveHeroVideo('/videos/sowhat-hero-20261027-optimized.mp4').src,'/videos/sowhat-hero-20261027-optimized.mp4');
});

test('retired content without verified replacements is not redirected to unrelated pages',()=>{
 const {getLegacyPathRedirects}=createLoader()('@/data/legacy-path-redirects');
 const rules=getLegacyPathRedirects();
 const retired=['/stories/burger','/stories/dining-vs-delivery','/stories/burgers-in-raanana','/stories/raanana','/stories/burger-and-fries-classic','/stories/burger-restaurant-vs-stand','/menu/green-salad','/menu/home-fries','/menu/nuggets-7','/menu/caesar-salad-small','/menu/caesar-salad-large'];
 for(const source of retired)assert.ok(!rules.some(r=>r.source===source));
 assert.ok(rules.every(r=>!rules.some(other=>other.source===r.destination)));
});

test('creator embeds stay mounted once active so carousel rotation does not remount iframes',()=>{
 let state=[],cursor=0,effects=[];
 const node={};
 const jsx=(type,props)=>({type,props});
 const load=createLoader({
 react:{useState:initial=>{const i=cursor++; if(!(i in state))state[i]=initial;return[state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},useRef:()=>({current:node}),useEffect:fn=>effects.push(fn)},
 'react/jsx-runtime':{jsx,jsxs:jsx},'next/link':{},
 '@/components/features/recommendations/recommendation-video-dialog':{},
 '@/components/providers/locale-provider':{useLocale:()=>({locale:'he'}),useTranslations:()=>({nav:{recommendations:'Reviews'}})}
 },{ResizeObserver:class{observe(){} disconnect(){}}});
 const Home=load('@/components/features/home/home-recommendations-section').HomeRecommendationsSection;
 const home=Home({items:[{id:'a',creatorName:'A',contentUrl:'https://instagram.com/p/a/',mediaUrl:''}]});
 const preview=home.props.children[1].props.children[0].props.children[0].props.children[0];
 const render=(props)=>{cursor=0;effects=[];return preview.type(props);};
 state=[];
 const activeFrame=render({src:preview.props.src,title:preview.props.title,active:true}).props.children;
 assert.equal(activeFrame.type,'iframe');
 assert.equal(activeFrame.props.src,'https://www.instagram.com/p/a/embed/?hidecaption=1');
 assert.equal(activeFrame.props.loading,'eager');
 // width=state[0], loaded=state[1] — keep loaded true while parking the slide.
 state[1]=true;
 const parkedFrame=render({src:preview.props.src,title:preview.props.title,active:false}).props.children;
 assert.equal(parkedFrame.type,'iframe');
 assert.equal(parkedFrame.props.src,'https://www.instagram.com/p/a/embed/?hidecaption=1');
});
