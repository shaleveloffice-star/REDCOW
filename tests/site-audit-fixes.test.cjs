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
 assert.match(optimized.src,/-optimized.mp4$/);
 assert.ok(optimized.poster);
 for(const {src} of videoSourcesForMp4(optimized.src)) assert.ok(fs.existsSync(path.join(__dirname,'../public',src)));
 assert.ok(fs.existsSync(path.join(__dirname,'../public',optimized.poster)));
 for(const custom of ['/videos/custom.mp4','https://example.com/clip.mp4','/image.jpg']) assert.deepEqual(resolveHeroVideo(custom),{src:custom});
 assert.equal(resolveHeroVideo('/videos/sowhat-hero-20261020.mp4',4).poster,undefined);
});

test('retired content without verified replacements is not redirected to unrelated pages',()=>{
 const {getLegacyPathRedirects}=createLoader()('@/data/legacy-path-redirects');
 const rules=getLegacyPathRedirects();
 const retired=['/stories/burger','/stories/dining-vs-delivery','/stories/burgers-in-raanana','/stories/raanana','/stories/burger-and-fries-classic','/stories/burger-restaurant-vs-stand','/menu/green-salad','/menu/home-fries','/menu/nuggets-7','/menu/caesar-salad-small','/menu/caesar-salad-large'];
 for(const source of retired)assert.ok(!rules.some(r=>r.source===source));
 assert.ok(rules.every(r=>!rules.some(other=>other.source===r.destination)));
});

test('creator iframes load only once their card is visible, keeping the embed playable',()=>{
 let state=[],cursor=0,effects=[],onIntersect;
 const node={};
 const jsx=(type,props)=>({type,props});
 const load=createLoader({
 react:{useState:initial=>{const i=cursor++; if(!(i in state))state[i]=initial;return[state[i],v=>state[i]=v];},useRef:()=>({current:node}),useEffect:fn=>effects.push(fn)},
 'react/jsx-runtime':{jsx,jsxs:jsx},'next/link':{},
 '@/components/features/recommendations/recommendation-video-dialog':{},
 '@/components/providers/locale-provider':{useLocale:()=>({locale:'he'}),useTranslations:()=>({nav:{recommendations:'Reviews'}})}
 },{ResizeObserver:class{observe(){} disconnect(){}},IntersectionObserver:class{constructor(fn){onIntersect=fn;}observe(){}disconnect(){}}});
 const Home=load('@/components/features/home/home-recommendations-section').HomeRecommendationsSection;
 const home=Home({items:[{id:'a',creatorName:'A',contentUrl:'https://instagram.com/p/a/',mediaUrl:''}]});
 const preview=home.props.children[1].props.children[0].props.children[0].props.children[0];
 const render=()=>{cursor=0;effects=[];return preview.type(preview.props);};
 state=[];
 assert.equal(render().props.children,null);
 effects.forEach(fn=>fn());
 onIntersect([{isIntersecting:false}]);
 assert.equal(render().props.children,null);
 onIntersect([{isIntersecting:true}]);
 const frame=render().props.children;
 assert.equal(frame.type,'iframe');
 assert.equal(frame.props.src,'https://www.instagram.com/p/a/embed/?hidecaption=1');
 assert.equal(frame.props.loading,'eager');
});
