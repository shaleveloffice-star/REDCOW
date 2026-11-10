const test = require('node:test');
const assert = require('node:assert/strict');
const {createLoader} = require('./helpers.cjs');
for (const mobile of [true,false]) test(`responsive video chooses one source after hydration (${mobile?'mobile':'desktop'})`,()=>{
 let values=[],cursor=0,effects=[],isMobile=mobile;
 const jsx=(type,props)=>({type,props});
 const load=createLoader({
  react:{useState:initial=>{const i=cursor++;if(!(i in values))values[i]=initial;return[values[i],value=>values[i]=typeof value==='function'?value(values[i]):value];},useRef:()=>({current:null}),useEffect:fn=>effects.push(fn)},
  'react/jsx-runtime':{jsx,jsxs:jsx},
  '@/components/providers/locale-provider':{useTranslations:()=>({a11y:{playVideo:'play',pauseVideo:'pause'}})},
  '@/components/shared/use-video-trim':{useVideoTrim(){}}
 },{window:{matchMedia:()=>({matches:isMobile})}});
 const {AutoplayVideo}=load('@/components/shared/autoplay-video');
 const props={src:'/desktop.mp4',mobileSrc:'/mobile.mp4',preload:'metadata'};
 const render=()=>{cursor=0;effects=[];return AutoplayVideo(props).props.children[0];};
 const initial=render();
 assert.equal(initial.props.src,undefined);
 assert.equal(initial.props.children,null);
 assert.equal(initial.props.preload,'none');
 effects[0]();
 const chosen=render();
 assert.equal(chosen.props.src,mobile?'/mobile.mp4':'/desktop.mp4');
 assert.equal(chosen.props.children,null);
 isMobile=!mobile;
 effects[0]();
 assert.equal(render().props.src,chosen.props.src,'resize or repeated effects must not download the other variant');
});
