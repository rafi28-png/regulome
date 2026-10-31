/**
 * ReguloMe — Report Center (GOD-MODE)
 * Generate & download real genomics analysis reports.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Loader2, CheckCircle, Database, Dna, HeartPulse, Activity, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useRegulatoryProfile } from '@/hooks/useRegulatoryProfile';
import type { VariantExplorerEntry } from '@/data/variantData';
import type { DiseaseDomain } from '@/data/diseaseHubData';
import type { GeneSummary } from '@/data/geneExpressionData';

const ease = [0.22, 0.61, 0.36, 1] as [number, number, number, number];

const REPORTS = [
  { id: 'full_analysis',   title: 'Full Genomic Report',      desc: 'Complete regulatory analysis — variants, expression, disease associations, and insights summary.',   icon: <Database size={22} />,  color: '#0ae8d2',  sections: ['Variants','Diseases','Expression','Summary'], badge: 'COMPREHENSIVE' },
  { id: 'variant_report',  title: 'Variant Report',           desc: 'All regulatory variants with evidence levels, priority scores, affected TFs, and tissue impacts.',     icon: <Dna size={22} />,       color: '#8b5cf6',  sections: ['Top 20 Variants','Evidence','Hotspots'],       badge: 'VARIANTS' },
  { id: 'disease_report',  title: 'Disease Systems Report',   desc: 'Systems biology overview of disease domains with regulatory burden scores and intervention targets.',   icon: <HeartPulse size={22} />, color: '#ef4444', sections: ['6 Domains','Risk Levels','Pathways'],           badge: 'DISEASES' },
  { id: 'expression_report', title: 'Expression Landscape',   desc: 'Gene × tissue expression deviations and hotspot gene analysis across regulatory networks.',           icon: <Activity size={22} />,  color: '#f59e0b',  sections: ['Expression Matrix','Hotspots','Tissue Stats'],  badge: 'EXPRESSION' },
] as const;

function generate(
  type: string,
  persona: string | undefined,
  mode: string,
  variantExplorerData: VariantExplorerEntry[],
  diseaseDomains: DiseaseDomain[],
  geneSummaries: GeneSummary[]
): object {
  const base = {
    report_type: type, generated_at: new Date().toISOString(),
    mode, persona: persona ?? 'general', platform: 'ReguloMe v0.1.0',
    data_sources: mode === 'real'
      ? ['MyVariant.info (NCBI ClinVar/dbSNP/CADD/gnomAD)','Ensembl VEP REST API','GTEx v10','JASPAR PWM Motif Engine']
      : ['ReguloMe Dynamic Persona Regulatory Graph'],
  };
  if (type === 'variant_report' || type === 'full_analysis') {
    return { ...base, variants: {
      total: variantExplorerData.length,
      top_20: [...variantExplorerData].sort((a,b)=>b.priorityScore-a.priorityScore).slice(0,20)
        .map(v=>({ rs_id:v.rsId, gene:v.gene, chromosome:v.chromosome, position:v.position,
          element_type:v.elementType, effect:v.effect, evidence_level:v.evidenceLevel,
          priority_score:v.priorityScore, tissues:v.tissues, affected_tfs:v.affectedTFs })),
    }, ...(type === 'full_analysis' ? {
      disease_domains: diseaseDomains.map(d=>({
        domain:d.id, label:d.name, risk_level:d.riskLevel,
        regulatory_burden:d.burdenScore, variant_count:d.variantCount, top_gene:d.topGene,
      })),
      expression_summary: geneSummaries.map(g=>({
        gene: g.gene, chromosome: g.chromosome, avg_expression: g.avgExpression,
        max_deviation: g.maxDeviation, top_tissue: g.topTissue, hotspots: g.hotspotCount,
      })),
    } : {})};
  }
  if (type === 'disease_report') {
    return { ...base, disease_domains: diseaseDomains.map(d=>({
      domain:d.id, label:d.name, risk_level:d.riskLevel,
      regulatory_burden:d.burdenScore, variant_count:d.variantCount, top_gene:d.topGene,
    }))};
  }
  if (type === 'expression_report') {
    return { ...base, expression_summary: geneSummaries.map(g=>({
      gene: g.gene, chromosome: g.chromosome, avg_expression: g.avgExpression,
      max_deviation: g.maxDeviation, top_tissue: g.topTissue, hotspots: g.hotspotCount,
    }))};
  }
  return { ...base, summary: 'Report generated from ReguloMe regulatory genomics analysis.' };
}

function download(data: object, filename: string, fmt: 'json' | 'txt') {
  let content: string;
  let mime: string;
  if (fmt === 'json') {
    content = JSON.stringify(data, null, 2);
    mime = 'application/json';
  } else {
    const lines: string[] = ['═'.repeat(58), '  ReguloMe — Analysis Report', '═'.repeat(58), ''];
    const flat = (obj: object, indent = 0) => {
      for (const [k,v] of Object.entries(obj)) {
        if (Array.isArray(v)) { lines.push(`${'  '.repeat(indent)}${k}: [${v.length} items]`); v.slice(0,3).forEach(i=>typeof i==='object'&&i&&flat(i,indent+1)); }
        else if (typeof v==='object'&&v) { lines.push(`${'  '.repeat(indent)}${k}:`); flat(v,indent+1); }
        else lines.push(`${'  '.repeat(indent)}${k}: ${v}`);
      }
    };
    flat(data);
    content = lines.join('\n');
    mime = 'text/plain';
  }
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a'); a.href = url;
  a.download = filename; a.click(); URL.revokeObjectURL(url);
}

export default function ReportCenterPage() {
  const { mode, currentPersona } = useApp();
  const { profile } = useRegulatoryProfile();
  const variantExplorerData = profile.variants;
  const diseaseDomains = profile.diseases.domains;
  const geneSummaries = profile.expression.geneSummaries;
  const [generating, setGenerating] = useState<string|null>(null);
  const [done, setDone] = useState<string|null>(null);

  const handle = async (id: string, fmt: 'json' | 'txt') => {
    setGenerating(`${id}_${fmt}`);
    await new Promise(r => setTimeout(r, 800));
    const data = generate(id, currentPersona?.id, mode, variantExplorerData, diseaseDomains, geneSummaries);
    const ts = new Date().toISOString().slice(0,16).replace(/[:.T]/g, '-');
    download(data, `regulome_${id}_${ts}.${fmt}`, fmt);
    setGenerating(null); setDone(id);
    setTimeout(() => setDone(null), 3000);
  };

  const totalVariants = variantExplorerData.length;
  const highPriority  = variantExplorerData.filter(v => v.priorityScore >= 85).length;
  const totalDiseases = diseaseDomains.length;

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, ease }}
      style={{ display:'flex', flexDirection:'column', gap:32, width:'100%' }}>

      {/* ── Hero ── */}
      <div style={{ position:'relative', overflow:'hidden', padding:'52px 48px 44px', borderRadius:28,
        background:'linear-gradient(135deg, rgba(10,14,26,0.95), rgba(17,24,39,0.88))',
        border:'1px solid rgba(10,232,210,0.15)', backdropFilter:'blur(32px)' }}>
        <motion.div animate={{ y:[0,-16,0] }} transition={{ duration:9, repeat:Infinity }}
          style={{ position:'absolute', top:-60, right:100, width:260, height:260, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(10,232,210,0.08), transparent 65%)', filter:'blur(50px)', pointerEvents:'none' }} />
        <motion.div animate={{ y:[0,14,0] }} transition={{ duration:7, repeat:Infinity, delay:2 }}
          style={{ position:'absolute', bottom:-40, left:80, width:200, height:200, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(139,92,246,0.07), transparent 65%)', filter:'blur(40px)', pointerEvents:'none' }} />

        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:24, marginBottom:36 }}>
          <motion.div initial={{ scale:0, rotate:-180 }} animate={{ scale:1, rotate:0 }}
            transition={{ duration:0.6, ease, delay:0.1 }}
            style={{ width:68, height:68, borderRadius:22, flexShrink:0,
              background:'linear-gradient(135deg, rgba(10,232,210,0.2), rgba(139,92,246,0.14))',
              border:'1px solid rgba(10,232,210,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 40px rgba(10,232,210,0.12)' }}>
            <FileText size={30} color="#0ae8d2" />
          </motion.div>
          <div>
            <h1 style={{ fontSize:46, fontWeight:900, letterSpacing:'-0.035em', lineHeight:1.05,
              background:'linear-gradient(135deg, #e8edf5 20%, #0ae8d2 80%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Report Center
            </h1>
            <p style={{ fontSize:15, color:'#8899b8', marginTop:6 }}>
              Export your genomic analysis as structured data · {mode === 'demo' ? '🎭 Demo dataset' : '🔬 Live data'}
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ position:'relative', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {[
            { label:'Total Variants', value: totalVariants, color:'#0ae8d2', sub:'in dataset' },
            { label:'High Priority', value: highPriority, color:'#8b5cf6', sub:'score ≥ 85' },
            { label:'Disease Domains', value: totalDiseases, color:'#ef4444', sub:'mapped' },
            { label:'Report Formats', value: 2, color:'#f59e0b', sub:'JSON & Text' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: 0.1 + i*0.06, duration:0.4, ease }}
              style={{ padding:'18px 16px', borderRadius:16,
                background:'rgba(10,14,26,0.6)', border:`1px solid ${s.color}18`,
                backdropFilter:'blur(12px)' }}>
              <p style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#6b7d9c', marginBottom:6 }}>{s.label}</p>
              <p style={{ fontSize:32, fontWeight:900, color: s.color, lineHeight:1 }}>{s.value}</p>
              <p style={{ fontSize:10, color:'#4a5568', marginTop:4 }}>{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Report Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 }}>
        {REPORTS.map((r, idx) => {
          const isGen = generating?.startsWith(r.id);
          const isDone = done === r.id;
          return (
            <motion.div key={r.id}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: idx*0.08, duration:0.4, ease }}
              whileHover={{ y:-3 }}
              style={{ position:'relative', overflow:'hidden', padding:'28px 28px 24px', borderRadius:24,
                background:`linear-gradient(135deg, rgba(17,24,39,0.92), rgba(10,14,26,0.88))`,
                border:`1px solid ${r.color}22`,
                backdropFilter:'blur(20px)',
                boxShadow:`0 0 40px ${r.color}08`,
                transition:'box-shadow 0.2s ease, transform 0.2s ease',
                cursor:'default' }}>

              {/* Corner badge */}
              <div style={{ position:'absolute', top:20, right:20, padding:'3px 10px', borderRadius:999,
                background:`${r.color}15`, border:`1px solid ${r.color}30`,
                fontSize:9, fontWeight:800, letterSpacing:'0.12em', color: r.color }}>
                {r.badge}
              </div>

              {/* Subtle bg glow */}
              <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%',
                background:`radial-gradient(circle, ${r.color}08, transparent 70%)`, filter:'blur(30px)', pointerEvents:'none' }} />

              <div style={{ position:'relative' }}>
                {/* Icon + title */}
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
                  <div style={{ width:52, height:52, borderRadius:16, flexShrink:0,
                    background:`${r.color}15`, border:`1px solid ${r.color}30`,
                    display:'flex', alignItems:'center', justifyContent:'center', color: r.color,
                    boxShadow:`0 0 20px ${r.color}20` }}>
                    {r.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize:16, fontWeight:800, color:'#e8edf5', letterSpacing:'-0.02em' }}>{r.title}</h3>
                  </div>
                </div>

                <p style={{ fontSize:12, color:'#8899b8', lineHeight:1.7, marginBottom:18 }}>{r.desc}</p>

                {/* Section chips */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:22 }}>
                  {r.sections.map(s => (
                    <span key={s} style={{ padding:'3px 10px', borderRadius:999, fontSize:10, fontWeight:600,
                      background:`${r.color}10`, color: r.color, border:`1px solid ${r.color}25` }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* Success flash */}
                <AnimatePresence>
                  {isDone && (
                    <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12,
                        color:'#10b981', fontSize:12, fontWeight:700 }}>
                      <CheckCircle size={14} /> Downloaded successfully!
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Download buttons */}
                <div style={{ display:'flex', gap:10 }}>
                  {(['json','txt'] as const).map(fmt => {
                    const thisLoading = generating === `${r.id}_${fmt}`;
                    return (
                      <motion.button key={fmt} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                        onClick={() => handle(r.id, fmt)} disabled={!!generating}
                        style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 22px', borderRadius:12,
                          fontWeight:700, fontSize:12, cursor: generating ? 'not-allowed' : 'pointer',
                          border: fmt==='json' ? `1px solid ${r.color}50` : '1px solid rgba(56,78,122,0.35)',
                          background: fmt==='json'
                            ? `linear-gradient(135deg, ${r.color}22, ${r.color}12)`
                            : 'rgba(26,32,53,0.6)',
                          color: fmt==='json' ? r.color : '#8899b8',
                          opacity: generating ? 0.5 : 1,
                          boxShadow: fmt==='json' && !generating ? `0 0 16px ${r.color}20` : 'none',
                          transition:'all 0.15s' }}>
                        {thisLoading
                          ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} />
                          : <Download size={14} />}
                        {fmt === 'json' ? 'JSON' : 'Text'}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Info strip ── */}
      <div style={{ padding:'20px 28px', borderRadius:16,
        background:'rgba(10,232,210,0.05)', border:'1px solid rgba(10,232,210,0.15)',
        display:'flex', alignItems:'center', gap:14 }}>
        <Sparkles size={18} color="#0ae8d2" style={{ flexShrink:0 }} />
        <p style={{ fontSize:12, color:'#8899b8', lineHeight:1.6 }}>
          <strong style={{ color:'#0ae8d2' }}>Real mode tip:</strong> Start the backend and switch to Real mode to generate reports enriched with live Ensembl annotations, ClinVar clinical significance, GTEx expression data, and Open Targets disease associations.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
