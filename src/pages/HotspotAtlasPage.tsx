/**
 * ReguloMe — Regulatory Hotspot Atlas
 * Chromosomal heatmap · Tissue matrix · Gene hotspot ranking · Variant storyline
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Dna, Activity, Layers, ChevronRight, TrendingUp, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRegulatoryProfile } from '@/hooks/useRegulatoryProfile';

const ease = [0.22, 0.61, 0.36, 1] as [number,number,number,number];

// All human chromosomes — empty ones show as greyed-out (no data)
const CHR_ORDER = [
  'chr1','chr2','chr3','chr4','chr5','chr6','chr7','chr8','chr9','chr10',
  'chr11','chr12','chr13','chr14','chr15','chr16','chr17','chr18','chr19',
  'chr20','chr21','chr22','chrX',
];

const ALL_TISSUES = ['Immune','Liver','Heart','Brain','Adipose','Intestine','Pancreas','Lung','Bone Marrow','Multiple'];

const EFFECT_COLOR = { gain:'#10b981', loss:'#ef4444', neutral:'#6b7d9c' } as const;
const EVIDENCE_COLOR: Record<string,string> = { validated:'#0ae8d2', literature:'#8b5cf6', predicted:'#f59e0b', inferred:'#6b7d9c' };

// ── helpers ─────────────────────────────────────────────────────────────────
const Chip = ({ label, color }: { label:string; color:string }) => (
  <span style={{ padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:700,
    background:`${color}15`, color, border:`1px solid ${color}30` }}>{label}</span>
);

export default function HotspotAtlasPage() {
  const navigate = useNavigate();
  const { profile } = useRegulatoryProfile();
  const variantExplorerData = profile.variants;
  const [selectedChr, setSelectedChr] = useState<string|null>(null);
  const [view, setView] = useState<'genome'|'tissue'|'genes'>('genome');

  const chrData = useMemo(() => CHR_ORDER.map(chr => {
    const vs = variantExplorerData.filter(v => v.chromosome === chr);
    const avgScore = vs.length ? Math.round(vs.reduce((s,v)=>s+v.priorityScore,0)/vs.length) : 0;
    return { chr, count: vs.length, avgScore, variants: vs };
  }), [variantExplorerData]);

  const maxChrCount = useMemo(() => Math.max(...chrData.map(c=>c.count), 1), [chrData]);

  const tissueMatrix = useMemo(() => ALL_TISSUES.map(tissue => {
    const vs = variantExplorerData.filter(v => v.tissues.includes(tissue));
    const gain = vs.filter(v=>v.effect==='gain').length;
    const loss = vs.filter(v=>v.effect==='loss').length;
    return { tissue, count: vs.length, gain, loss, avgScore: vs.length ? Math.round(vs.reduce((s,v)=>s+v.priorityScore,0)/vs.length) : 0 };
  }).sort((a,b)=>b.count-a.count), [variantExplorerData]);

  const geneHotspots = useMemo(() => Object.entries(
    variantExplorerData.reduce((acc,v) => { acc[v.gene]=(acc[v.gene]||[]); acc[v.gene].push(v); return acc; }, {} as Record<string,typeof variantExplorerData>)
  ).map(([gene,vs]) => ({ gene, count: vs.length, maxScore: Math.max(...vs.map(v=>v.priorityScore)), publications: vs.reduce((s,v)=>s+v.publicationCount,0), diseases: [...new Set(vs.flatMap(v=>v.linkedDiseases))] }))
   .sort((a,b)=>b.maxScore-a.maxScore).slice(0,8), [variantExplorerData]);

  const goToVariant  = (id: string) => navigate(`/app/variants/${id}`);
  const goToGene     = (gene: string) => navigate(`/app/workbench?q=${encodeURIComponent(gene)}`);

  const focusVariants = useMemo(() =>
    selectedChr ? variantExplorerData.filter(v=>v.chromosome===selectedChr).sort((a,b)=>b.priorityScore-a.priorityScore) : [],
  [variantExplorerData, selectedChr]);

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,ease}}
      style={{display:'flex',flexDirection:'column',gap:28,width:'100%'}}>

      {/* ── Hero ── */}
      <div style={{position:'relative',overflow:'hidden',padding:'48px 48px 40px',borderRadius:28,
        background:'linear-gradient(135deg,rgba(10,14,26,0.95),rgba(17,24,39,0.9))',
        border:'1px solid rgba(10,232,210,0.15)',backdropFilter:'blur(32px)'}}>
        <motion.div animate={{y:[0,-18,0],x:[0,10,0]}} transition={{duration:10,repeat:Infinity}}
          style={{position:'absolute',top:-60,right:80,width:260,height:260,borderRadius:'50%',
            background:'radial-gradient(circle,rgba(10,232,210,0.09),transparent 65%)',filter:'blur(50px)',pointerEvents:'none'}}/>
        <motion.div animate={{y:[0,14,0]}} transition={{duration:7,repeat:Infinity,delay:3}}
          style={{position:'absolute',bottom:-40,left:120,width:200,height:200,borderRadius:'50%',
            background:'radial-gradient(circle,rgba(139,92,246,0.07),transparent 65%)',filter:'blur(40px)',pointerEvents:'none'}}/>

        <div style={{position:'relative',display:'flex',alignItems:'center',gap:24,marginBottom:32}}>
          <motion.div initial={{scale:0,rotate:-180}} animate={{scale:1,rotate:0}} transition={{duration:0.6,ease,delay:0.1}}
            style={{width:68,height:68,borderRadius:22,flexShrink:0,
              background:'linear-gradient(135deg,rgba(10,232,210,0.2),rgba(139,92,246,0.14))',
              border:'1px solid rgba(10,232,210,0.3)',display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:'0 0 40px rgba(10,232,210,0.12)'}}>
            <MapPin size={30} color="#0ae8d2"/>
          </motion.div>
          <div>
            <h1 style={{fontSize:46,fontWeight:900,letterSpacing:'-0.035em',lineHeight:1.05,
              background:'linear-gradient(135deg,#e8edf5 20%,#0ae8d2 80%)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
              Hotspot Atlas
            </h1>
            <p style={{fontSize:15,color:'#8899b8',marginTop:6}}>
              Regulatory variant density across the genome · chromosomes, tissues & genes
            </p>
          </div>
        </div>

        {/* Stat strip */}
        <div style={{position:'relative',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {[
            {label:'Total Variants',value:variantExplorerData.length,color:'#0ae8d2'},
            {label:'Chromosomes Mapped',value:CHR_ORDER.length,color:'#8b5cf6'},
            {label:'Hotspot Genes',value:geneHotspots.length,color:'#f59e0b'},
            {label:'Peak Score',value:Math.max(...variantExplorerData.map(v=>v.priorityScore)),color:'#10b981'},
          ].map((s,i)=>(
            <motion.div key={s.label} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
              transition={{delay:0.1+i*0.06,duration:0.4,ease}}
              style={{padding:'16px 14px',borderRadius:14,background:'rgba(10,14,26,0.6)',
                border:`1px solid ${s.color}18`,backdropFilter:'blur(12px)'}}>
              <p style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'#6b7d9c',marginBottom:6}}>{s.label}</p>
              <p style={{fontSize:30,fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* View tabs */}
        <div style={{position:'relative',display:'flex',gap:8,marginTop:24}}>
          {([['genome','Genome Map',<MapPin size={13}/>],['tissue','Tissue Matrix',<Layers size={13}/>],['genes','Gene Hotspots',<TrendingUp size={13}/>]] as const).map(([v,label,icon])=>(
            <button key={v} onClick={()=>setView(v)}
              style={{display:'flex',alignItems:'center',gap:7,padding:'8px 20px',borderRadius:999,
                fontSize:12,fontWeight:700,cursor:'pointer',transition:'all 0.15s',
                border:view===v?'1px solid rgba(10,232,210,0.5)':'1px solid rgba(56,78,122,0.3)',
                background:view===v?'rgba(10,232,210,0.12)':'rgba(26,32,53,0.6)',
                color:view===v?'#0ae8d2':'#6b7d9c'}}>
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Genome Map ── */}
      <AnimatePresence mode="wait">
      {view==='genome' && (
        <motion.div key="genome" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
          transition={{duration:0.3,ease}} style={{display:'flex',flexDirection:'column',gap:20}}>

          <div style={{padding:'28px 32px',borderRadius:24,
            background:'linear-gradient(135deg,rgba(17,24,39,0.9),rgba(10,14,26,0.85))',
            border:'1px solid rgba(56,78,122,0.2)',backdropFilter:'blur(20px)'}}>
            <p style={{fontSize:13,fontWeight:700,color:'#e8edf5',marginBottom:20}}>
              Chromosomal Variant Density — click a chromosome to inspect variants
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {chrData.map((c,i)=>{
                const pct = (c.count/maxChrCount)*100;
                const isSelected = selectedChr===c.chr;
                const color = c.avgScore>=85?'#0ae8d2':c.avgScore>=75?'#8b5cf6':c.avgScore>=65?'#f59e0b':'#6b7d9c';
                return (
                  <motion.div key={c.chr} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}
                    transition={{delay:i*0.03,duration:0.3,ease}}
                    onClick={()=>setSelectedChr(isSelected?null:c.chr)}
                    style={{display:'flex',alignItems:'center',gap:16,cursor:c.count>0?'pointer':'default',
                      padding:'10px 14px',borderRadius:12,transition:'all 0.15s',
                      background:isSelected?`${color}12`:'transparent',
                      border:isSelected?`1px solid ${color}40`:'1px solid transparent'}}>
                    <span style={{width:48,fontSize:11,fontWeight:700,color:isSelected?color:'#6b7d9c',flexShrink:0,fontFamily:'monospace'}}>
                      {c.chr.replace('chr','')}
                    </span>
                    <div style={{flex:1,height:18,borderRadius:6,background:'rgba(56,78,122,0.2)',overflow:'hidden',position:'relative'}}>
                      {c.count>0&&(
                        <motion.div initial={{width:0}} animate={{width:`${pct}%`}}
                          transition={{duration:0.8,ease:'easeOut',delay:i*0.04}}
                          style={{height:'100%',borderRadius:6,
                            background:`linear-gradient(90deg,${color}aa,${color})`,
                            boxShadow:`0 0 12px ${color}50`,position:'relative'}}>
                          {/* Shimmer */}
                          <motion.div animate={{x:['-100%','200%']}} transition={{duration:2.5,repeat:Infinity,ease:'easeInOut',repeatDelay:4}}
                            style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)',borderRadius:6}}/>
                        </motion.div>
                      )}
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                      <span style={{fontSize:13,fontWeight:800,color:c.count>0?color:'#4a5568',minWidth:16,textAlign:'center'}}>{c.count}</span>
                      {c.count>0&&<span style={{fontSize:10,color:'#6b7d9c'}}>avg {c.avgScore}</span>}
                      {c.count>0&&<ChevronRight size={12} color={isSelected?color:'#4a5568'}/>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Variant detail panel */}
          <AnimatePresence>
          {selectedChr&&focusVariants.length>0&&(
            <motion.div key={selectedChr} initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              transition={{duration:0.3}} style={{overflow:'hidden'}}>
              <div style={{padding:'28px 32px',borderRadius:24,
                background:'linear-gradient(135deg,rgba(17,24,39,0.9),rgba(10,14,26,0.85))',
                border:'1px solid rgba(10,232,210,0.2)',backdropFilter:'blur(20px)'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
                  <Dna size={16} color="#0ae8d2"/>
                  <p style={{fontSize:13,fontWeight:700,color:'#e8edf5'}}>
                    {selectedChr} — {focusVariants.length} variant{focusVariants.length!==1?'s':''}
                  </p>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
                  {focusVariants.map((v,i)=>(
                    <motion.div key={v.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06,duration:0.3}}
                      style={{padding:'16px 18px',borderRadius:14,
                        background:'rgba(10,14,26,0.6)',border:'1px solid rgba(56,78,122,0.2)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                        <div>
                          <button onClick={()=>goToVariant(v.id)}
                            style={{fontSize:13,fontWeight:800,color:'#0ae8d2',fontFamily:'monospace',
                              background:'none',border:'none',cursor:'pointer',padding:0,textAlign:'left',
                              display:'flex',alignItems:'center',gap:4}}>
                            {v.rsId} <ExternalLink size={10}/>
                          </button>
                          <button onClick={()=>goToGene(v.gene)}
                            style={{fontSize:12,fontWeight:700,color:'#8b5cf6',marginTop:2,
                              background:'none',border:'none',cursor:'pointer',padding:0,textAlign:'left',
                              display:'flex',alignItems:'center',gap:4}}>
                            {v.gene} <ExternalLink size={10}/>
                          </button>
                        </div>
                        <span style={{fontSize:20,fontWeight:900,color:EFFECT_COLOR[v.effect]}}>{v.priorityScore}</span>
                      </div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:8}}>
                        <Chip label={v.elementType} color="#8b5cf6"/>
                        <Chip label={v.effect} color={EFFECT_COLOR[v.effect]}/>
                        <Chip label={v.evidenceLevel} color={EVIDENCE_COLOR[v.evidenceLevel]??'#6b7d9c'}/>
                      </div>
                      <p style={{fontSize:10,color:'#6b7d9c'}}>
                        {v.tissues.join(' · ')} · {v.publicationCount.toLocaleString()} publications
                      </p>
                      {/* Score bar */}
                      <div style={{marginTop:10,height:4,borderRadius:999,background:'rgba(56,78,122,0.3)',overflow:'hidden'}}>
                        <motion.div initial={{width:0}} animate={{width:`${v.priorityScore}%`}} transition={{duration:0.7,ease:'easeOut',delay:i*0.06+0.2}}
                          style={{height:'100%',borderRadius:999,background:`linear-gradient(90deg,${EFFECT_COLOR[v.effect]}aa,${EFFECT_COLOR[v.effect]})`}}/>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Tissue Matrix ── */}
      {view==='tissue'&&(
        <motion.div key="tissue" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
          transition={{duration:0.3,ease}}>
          <div style={{padding:'28px 32px',borderRadius:24,
            background:'linear-gradient(135deg,rgba(17,24,39,0.9),rgba(10,14,26,0.85))',
            border:'1px solid rgba(56,78,122,0.2)',backdropFilter:'blur(20px)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:24}}>
              <Layers size={16} color="#8b5cf6"/>
              <p style={{fontSize:13,fontWeight:700,color:'#e8edf5'}}>Cross-Tissue Regulatory Impact</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
              {tissueMatrix.filter(t=>t.count>0).map((t,i)=>{
                const maxT=tissueMatrix[0].count;
                const gainPct=t.count>0?(t.gain/t.count)*100:0;
                const lossPct=t.count>0?(t.loss/t.count)*100:0;
                return(
                  <motion.div key={t.tissue} initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}}
                    transition={{delay:i*0.06,duration:0.3,ease}}
                    style={{padding:'20px 20px',borderRadius:16,
                      background:'rgba(10,14,26,0.6)',border:'1px solid rgba(56,78,122,0.2)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <div>
                        <p style={{fontSize:14,fontWeight:800,color:'#e8edf5'}}>{t.tissue}</p>
                        <p style={{fontSize:10,color:'#6b7d9c',marginTop:2}}>avg score {t.avgScore}</p>
                      </div>
                      <span style={{fontSize:24,fontWeight:900,color:'#8b5cf6'}}>{t.count}</span>
                    </div>
                    {/* Gain/loss stacked bar */}
                    <div style={{height:8,borderRadius:999,overflow:'hidden',background:'rgba(56,78,122,0.3)',display:'flex',marginBottom:8}}>
                      <motion.div initial={{width:0}} animate={{width:`${(t.count/maxT)*gainPct}%`}} transition={{duration:0.8,ease:'easeOut',delay:i*0.06}}
                        style={{height:'100%',background:'#10b981'}}/>
                      <motion.div initial={{width:0}} animate={{width:`${(t.count/maxT)*lossPct}%`}} transition={{duration:0.8,ease:'easeOut',delay:i*0.06+0.1}}
                        style={{height:'100%',background:'#ef4444'}}/>
                    </div>
                    <div style={{display:'flex',gap:12,fontSize:10,color:'#6b7d9c'}}>
                      <span style={{color:'#10b981'}}>↑ {t.gain} gain</span>
                      <span style={{color:'#ef4444'}}>↓ {t.loss} loss</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Gene Hotspots ── */}
      {view==='genes'&&(
        <motion.div key="genes" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
          transition={{duration:0.3,ease}}>
          <div style={{padding:'28px 32px',borderRadius:24,
            background:'linear-gradient(135deg,rgba(17,24,39,0.9),rgba(10,14,26,0.85))',
            border:'1px solid rgba(56,78,122,0.2)',backdropFilter:'blur(20px)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:24}}>
              <Activity size={16} color="#f59e0b"/>
              <p style={{fontSize:13,fontWeight:700,color:'#e8edf5'}}>Top Regulatory Hotspot Genes</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {geneHotspots.map((g,i)=>{
                const colors=['#0ae8d2','#8b5cf6','#f59e0b','#10b981','#ef4444','#3b82f6','#ec4899','#14b8a6'];
                const c=colors[i%colors.length];
                return(
                  <motion.div key={g.gene} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}}
                    transition={{delay:i*0.07,duration:0.35,ease}}
                    style={{display:'flex',alignItems:'center',gap:16,padding:'18px 20px',borderRadius:16,
                      background:`${c}08`,border:`1px solid ${c}22`,position:'relative',overflow:'hidden'}}>
                    {/* Rank */}
                    <span style={{width:32,height:32,borderRadius:10,background:`${c}20`,border:`1px solid ${c}35`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:14,fontWeight:900,color:c,flexShrink:0}}>
                      {i+1}
                    </span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                        <button onClick={()=>goToGene(g.gene)}
                          style={{fontSize:16,fontWeight:900,color:c,background:'none',border:'none',
                            cursor:'pointer',padding:0,display:'flex',alignItems:'center',gap:5}}>
                          {g.gene} <ExternalLink size={12}/>
                        </button>
                        <span style={{fontSize:11,fontWeight:700,color:'#6b7d9c'}}>peak {g.maxScore}</span>
                        {g.diseases.slice(0,2).map(d=><Chip key={d} label={d} color={c}/>)}
                      </div>
                      <div style={{height:5,borderRadius:999,background:'rgba(56,78,122,0.25)',overflow:'hidden'}}>
                        <motion.div initial={{width:0}} animate={{width:`${g.maxScore}%`}}
                          transition={{duration:0.8,ease:'easeOut',delay:i*0.07+0.1}}
                          style={{height:'100%',borderRadius:999,background:`linear-gradient(90deg,${c}80,${c})`,
                            boxShadow:`0 0 8px ${c}50`}}/>
                      </div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <p style={{fontSize:18,fontWeight:900,color:c}}>{g.publications.toLocaleString()}</p>
                      <p style={{fontSize:9,color:'#6b7d9c',marginTop:2}}>publications</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
