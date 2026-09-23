// Patch the captured decorative effect, not the WebGL library used by other code.
export const originalInit='let r=(0,tt.prefersReducedMotion)(),h=new H({alpha:!0,premultipliedAlpha:!0,antialias:!1}),f=h.gl;';
export const safeInit=`let r=(0,tt.prefersReducedMotion)();
let fallback=()=>{
  const oldBackground=t.style.background,oldOpacity=t.style.opacity;
  const paint=()=>{const colors=p.current.colorStops||e;t.style.background="radial-gradient(ellipse at 25% 100%, "+colors[0]+"88, transparent 65%), radial-gradient(ellipse at 75% 100%, "+colors[1]+"66, transparent 65%)";t.style.opacity=String(p.current.opacity??a)};
  t.setAttribute("data-webgl-fallback","aurora");paint();m.current=paint;
  return ()=>{m.current=null;t.removeAttribute("data-webgl-fallback");t.style.background=oldBackground;t.style.opacity=oldOpacity};
};
let canvas=document.createElement("canvas"),context=null;
try{context=canvas.getContext("webgl2",{alpha:true,premultipliedAlpha:true,antialias:false})||canvas.getContext("webgl",{alpha:true,premultipliedAlpha:true,antialias:false})}catch(error){}
if(!context)return fallback();
let h;
try{h=new H({canvas:canvas,alpha:!0,premultipliedAlpha:!0,antialias:!1})}catch(error){context.getExtension("WEBGL_lose_context")?.loseContext();return fallback()}
let f=h.gl;`;
export function patchAurora(source){
  if(source.split(originalInit).length!==2)throw new Error('Captured aurora initializer changed; review fallback patch before deploying.');
  return source.replace(originalInit,safeInit);
}
