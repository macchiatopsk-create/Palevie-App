// Build-time only: download pinned, checksum-verified assets to our own origin.
// No user device contacts these vendors. Do not replace versioned URLs with latest.
import { createHash } from 'node:crypto';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const npm='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/';
const assets=[
 ['vision_bundle.js',npm+'vision_bundle.cjs','7fba4f9807297e229371318df577e96fc9f1b3d93e79075e3798ade2fc790c9e'],
 ['vision_wasm_internal.js',npm+'wasm/vision_wasm_internal.js','e7fd9858e8e8f221d9b96eddc11f8e077f263e0b7bbd79d3cbe882b134274f8c'],
 ['vision_wasm_internal.wasm',npm+'wasm/vision_wasm_internal.wasm','6a5c64584c2ab61c763b6e204afbdbc7ce1caf7f5216187322bca8df94f646bc'],
 ['vision_wasm_nosimd_internal.js',npm+'wasm/vision_wasm_nosimd_internal.js','438d1fe8ff7f4d946025bc211c291543c037d8a3785ed4eee60f1f521b236296'],
 ['vision_wasm_nosimd_internal.wasm',npm+'wasm/vision_wasm_nosimd_internal.wasm','8a3092d34c79d3f57e6ba8592105e8a90f6b07c27891ffecd14cca428bfd3e31'],
 ['face_landmarker.task','https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task','64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff'],
 ['LICENSE-mediapipe.txt','https://raw.githubusercontent.com/google-ai-edge/mediapipe/v0.10.35/LICENSE','8707eef0533987efc5b155d64761eeb6e20793f50b9bd1a68dad1cf4719d0ed8']
];
const hash=b=>createHash('sha256').update(b).digest('hex');
const dest=path.join(root,'public/drape-tools/vendor');await mkdir(dest,{recursive:true});
for(const [name,url,expected] of assets){
 const out=path.join(dest,name);
 try{if(hash(await readFile(out))===expected)continue;}catch{}
 const res=await fetch(url,{signal:AbortSignal.timeout(60000)});
 if(!res.ok)throw new Error('Could not prepare '+name+': '+res.status);
 const bytes=Buffer.from(await res.arrayBuffer());
 if(bytes.length>30000000||hash(bytes)!==expected)throw new Error('Asset checksum mismatch: '+name);
 await writeFile(out,bytes);
}
console.log('Live Guide: pinned assets verified and hosted locally.');
