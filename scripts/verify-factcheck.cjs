const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),ctx={};vm.runInNewContext(read('js/econ.js'),ctx);const EC=ctx.EC;
let checks=0;
for(const r of [0,.03,.04,.06,.1])for(const g of [-.01,0,.03,.04,.09])for(const pb of [-.06,-.01,0,.01,.03]){
 const result=EC.debtPath({b0:.49,r,g,pb,years:30});const a=(1+r)/(1+g);
 for(let n=0;n<=30;n++){let sum=0;for(let k=0;k<n;k++)sum+=a**k;const expected=.49*a**n-pb*sum;assert(Math.abs(result.rows[n].b-expected)<1e-10);checks++;}
 if(r!==g){assert(Math.abs(a*result.steady-pb-result.steady)<1e-12);checks++;}else if(pb===0)assert.equal(result.steady,.49);else assert(Number.isNaN(result.steady));
}
assert(Math.abs(EC.debtPath({b0:.49,r:.03,g:.04,pb:-.01}).steady-1.04)<1e-12);
assert(Number.isNaN(EC.debtPath({b0:.49,r:.03,g:.04,pb:t=>-.01*t}).steady));
const fiscal=read('chapters/fiscal.html'),start=fiscal.indexOf('  function debtSummary('),end=fiscal.indexOf('  /* ---------------- sim-debt',start);
const summaryCtx={B0:.49,pc:x=>(x*100).toFixed(0)+'%'};vm.runInNewContext(fiscal.slice(start,end),summaryCtx);
for(const [r,g,pb,part] of [[.03,.04,-.01,'104%'],[.04,.04,0,'시작 비율 유지'],[.04,.04,.01,'감소'],[.04,.04,-.01,'증가'],[.06,.04,.49*.02/1.04,'불안정 균형'],[.06,.04,.02,'감소'],[.06,.04,-.01,'증가']]){assert(summaryCtx.debtSummary(r,g,pb,EC.debtPath({b0:.49,r,g,pb}).steady).includes(part));checks++;}
let scripts=0;for(const file of fs.readdirSync(path.join(root,'chapters')).filter(f=>f.endsWith('.html')))for(const m of read('chapters/'+file).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){if(m[1].includes('src='))continue;if(m[1].includes('ld+json'))JSON.parse(m[2]);else new vm.Script(m[2],{filename:file});scripts++;}
console.log({checks,compiledScriptBlocks:scripts,defaultSteady:1.04});
