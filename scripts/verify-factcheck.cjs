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
// Non-fiscal regressions: execute the actual FX/spread expressions and compare cash flows.
let additionalChecks=0;
const close=(actual,expected)=>{assert(Math.abs(actual-expected)<1e-8*Math.max(1,Math.abs(expected)));additionalChecks++;};
const fx=read('chapters/fx.html'),forward=fx.match(/var F = E0[^;]+;/)[0],krw=fx.match(/var krw = PR[^;]+;/)[0],usd=fx.match(/var usd = function \(s\) \{[^}]+\};/)[0];
for(const ik of [0,.03,.07])for(const iu of [0,.04,.07])for(const H1 of [false,true])for(const spot of [1100,1338.5,1600]){
 const c={E0:1338.5,PR:1e8,ik,iu,hedge:{checked:H1}};vm.runInNewContext(forward+krw+usd,c);
 const proceeds=c.usd(spot);close(c.krw,1e8*(1+ik));
 close(proceeds,H1?1e8*(1+ik):1e8/1338.5*(1+iu)*spot);
 if(H1)close(c.usd(1100),c.usd(1600));
}
const credit={};vm.runInNewContext(read('chapters/rates.html').match(/function spread\(pd, rec, m\) \{[^}]+\}/)[0],credit);
close(100*(EC.KR.bond3y+credit.spread(.2,.2,.0035)),24.311);
close(100*(EC.KR.bond3y+credit.spread(.2,.4,.0035)),19.311);
close(100*(EC.KR.bond3y+credit.spread(.15,.4,.0035)),14.899235294117647);
// Growth, price deflation, and real-interest arithmetic use distinct compounded identities.
for(const g of [-.05,0,.001,.012,.05]){let level=1;for(let q=0;q<4;q++)level*=1+g;close(EC.annualize(g),level-1);}
for(const n of [0,.03,.1])for(const pi of [0,.02,.05])close((1+EC.fisher(n,pi))*(1+pi),1+n);
for(const deflator of [80,100,120])close(EC.real(240,deflator)*deflator/100,240);
for(const years of [1,3,10,30])for(const yld of [0,.03,.1]){
 const price=EC.bond({face:100,coupon:.03,yld,years}).price;
 const expected=yld===0?100+3*years:3*(1-(1+yld)**(-years))/yld+100*(1+yld)**(-years);close(price,expected);
}
console.log({additionalChecks});
let scripts=0;for(const file of fs.readdirSync(path.join(root,'chapters')).filter(f=>f.endsWith('.html')))for(const m of read('chapters/'+file).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){if(m[1].includes('src='))continue;if(m[1].includes('ld+json'))JSON.parse(m[2]);else new vm.Script(m[2],{filename:file});scripts++;}
console.log({checks,compiledScriptBlocks:scripts,defaultSteady:1.04});
