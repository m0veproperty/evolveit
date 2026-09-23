import { readdir, readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { patchAurora } from './aurora-fallback.mjs';

const root=process.cwd(),output=path.join(root,'dist');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
const exclude=new Set(['dist','node_modules','.git','.vercel','build-local.mjs','aurora-fallback.mjs','package.json','vercel.json','README.md']);
for(const item of await readdir(root,{withFileTypes:true})){
  if(!exclude.has(item.name))await cp(path.join(root,item.name),path.join(output,item.name),{recursive:true});
}
// Equal-length URL revision preserves captured React stream string lengths.
// Keep original assets too, so existing sessions can finish loading safely.
await cp(path.join(output,'_next/static'),path.join(output,'_next/fix001'),{recursive:true});
let patched=0;
async function transform(dir){
  for(const item of await readdir(dir,{withFileTypes:true})){
    const file=path.join(dir,item.name);
    if(item.isDirectory()){await transform(file);continue}
    if(!/\.(html|js|css|json|bin)$/.test(item.name))continue;
    let source=await readFile(file,'utf8');
    if(source.includes('\ufffd'))continue;
    if(/^0wlno2pmqujb_(?:__q_856038723b)?\.js$/.test(item.name)){
      source=patchAurora(source);patched++;
    }
    source=source.replaceAll('/_next/static/','/_next/fix001/').replaceAll('static/chunks/','fix001/chunks/');
    await writeFile(file,source);
  }
}
await transform(output);
if(patched!==4)throw new Error('Expected both captured aurora aliases in original and versioned directories; got '+patched);
console.log('Built local mirror with guarded WebGL and versioned assets.');
