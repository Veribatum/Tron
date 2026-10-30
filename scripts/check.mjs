import {readFile,readdir,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);let count=0;
for(const dir of['src','scripts','tests'])for(const name of await readdir(path.join(root,dir))){if(!/\.(?:m?js)$/.test(name))continue;const p=path.join(root,dir,name),r=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});if(r.status)throw Error(r.stderr);const text=await readFile(p,'utf8');for(const m of text.matchAll(/from\s*['"](\.[^'"]+)['"]/g))await stat(path.resolve(path.dirname(p),m[1].split('?')[0]));count++}
for(const file of['index.html','src/style.css','vendor/three.module.js','vendor/LICENSE-THREE.txt','icon.svg'])if(!(await stat(path.join(root,file))).size)throw Error('Missing '+file);console.log('Checked '+count+' modules and local assets.');
