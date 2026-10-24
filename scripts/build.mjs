import fs from 'node:fs/promises'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {spawnSync} from 'node:child_process'
import {build} from 'esbuild'
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url)
const compile=spawnSync(process.execPath,[require.resolve('typescript/bin/tsc'),'-p','tsconfig.json'],{cwd:root,stdio:'inherit',windowsHide:true})
if(compile.error)throw compile.error
if(compile.status!==0)process.exit(compile.status??1)
const result=await build({absWorkingDir:root,entryPoints:['src/memory-plugin.ts'],outfile:path.join(root,'lib/index.js'),bundle:true,format:'esm',platform:'node',target:'node22',charset:'utf8',sourcemap:'linked',sourcesContent:true,external:['@deepseek-ai/*','node:*'],metafile:true,logLevel:'info'})
const external=[...new Set(Object.values(result.metafile.outputs).flatMap(o=>o.imports.filter(i=>i.external).map(i=>i.path)))].sort()
if(external.some(p=>!p.startsWith('@deepseek-ai/')&&!p.startsWith('node:')))throw Error('Unexpected non-native dependency')
await fs.cp(path.join(root,'src'),path.join(root,'core-src'),{recursive:true})
const sha=bytes=>createHash('sha256').update(bytes).digest('hex')
async function inventory(dir){const files=[];for(const e of (await fs.readdir(path.join(root,dir),{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const name=dir+'/'+e.name;if(e.isDirectory())files.push(...await inventory(name));else if(name.endsWith('.ts'))files.push({path:name,sha256:sha(await fs.readFile(path.join(root,name)))})}return files}
const manifest=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'))
await fs.writeFile(path.join(root,'SOURCE-MANIFEST.json'),JSON.stringify({schemaVersion:1,package:{name:manifest.name,version:manifest.version},buildEntry:'src/memory-plugin.ts',coreSources:await inventory('src'),runtime:{entry:'lib/index.js',sha256:sha(await fs.readFile(path.join(root,'lib/index.js')))},externalImports:external},null,2)+'\n')
