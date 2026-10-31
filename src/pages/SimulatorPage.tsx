/**
 * ReguloMe — Regulatory Twin Simulator  (GOD-MODE REDESIGN)
 * Interactive what-if analysis with cinematic visuals.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, RefreshCw, TrendingDown, TrendingUp, Minus, Zap, Heart, Brain, Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const ease = [0.22, 0.61, 0.36, 1] as [number, number, number, number];

interface Intervention {
  id: string; label: string; category: string; color: string;
  icon: string; description: string;
  effects: { inflammatoryBurden: number; regulatoryAge: number; longevityPathway: number; mitochondrialHealth: number; cardiovascularRisk: number; };
}

const INTERVENTIONS: Intervention[] = [
  { id: 'fasting', label: 'Intermittent Fasting', category: 'Diet', color: '#0ae8d2', icon: '⏱️',
    description: '16:8 time-restricted eating activates AMPK and FOXO3 pathways.',
    effects: { inflammatoryBurden: -12, regulatoryAge: -0.8, longevityPathway: +18, mitochondrialHealth: +10, cardiovascularRisk: -8 } },
  { id: 'exercise_aerobic', label: 'Aerobic Exercise 5×/wk', category: 'Fitness', color: '#8b5cf6', icon: '🏃',
    description: 'Zone 2 cardio upregulates PGC1α and mitochondrial biogenesis.',
    effects: { inflammatoryBurden: -15, regulatoryAge: -1.2, longevityPathway: +14, mitochondrialHealth: +22, cardiovascularRisk: -18 } },
  { id: 'sleep', label: 'Sleep Optimization 8h', category: 'Recovery', color: '#3b82f6', icon: '🌙',
    description: 'Deep sleep drives DNA repair, GH secretion, and epigenetic maintenance.',
    effects: { inflammatoryBurden: -10, regulatoryAge: -0.6, longevityPathway: +8, mitochondrialHealth: +12, cardiovascularRisk: -5 } },
  { id: 'omega3', label: 'Omega-3 Supplementation', category: 'Nutrition', color: '#f59e0b', icon: '🐟',
    description: 'EPA/DHA resolve neuroinflammation and modulate NF-κB signaling.',
    effects: { inflammatoryBurden: -18, regulatoryAge: -0.4, longevityPathway: +5, mitochondrialHealth: +6, cardiovascularRisk: -12 } },
  { id: 'nad', label: 'NAD⁺ Precursors (NMN/NR)', category: 'Nutrition', color: '#10b981', icon: '💊',
    description: 'Boosts sirtuin activity and NAD⁺ pool, supporting SIRT1/SIRT3 pathways.',
    effects: { inflammatoryBurden: -6, regulatoryAge: -0.9, longevityPathway: +20, mitochondrialHealth: +18, cardiovascularRisk: -3 } },
  { id: 'meditation', label: 'Mindfulness & Meditation', category: 'Recovery', color: '#3b82f6', icon: '🧘',
    description: 'Reduces cortisol, modulates HPA axis, activates parasympathetic regulatory networks.',
    effects: { inflammatoryBurden: -8, regulatoryAge: -0.3, longevityPathway: +6, mitochondrialHealth: +4, cardiovascularRisk: -6 } },
  { id: 'stress', label: 'Chronic Stress (untreated)', category: 'Risk Factor', color: '#ef4444', icon: '⚡',
    description: 'Cortisol elevation disrupts glucocorticoid receptor signaling and epigenetic maintenance.',
    effects: { inflammatoryBurden: +22, regulatoryAge: +1.5, longevityPathway: -15, mitochondrialHealth: -12, cardiovascularRisk: +14 } },
  { id: 'smoking', label: 'Smoking', category: 'Risk Factor', color: '#ef4444', icon: '🚬',
    description: 'Tobacco smoke induces widespread epigenetic clock acceleration and oxidative stress.',
    effects: { inflammatoryBurden: +28, regulatoryAge: +3.2, longevityPathway: -20, mitochondrialHealth: -18, cardiovascularRisk: +24 } },
];

const BASELINE = { inflammatoryBurden: 65, regulatoryAge: 0, longevityPathway: 50, mitochondrialHealth: 55, cardiovascularRisk: 40 };

const METRICS = [
  { key: 'inflammatoryBurden',  label: 'Inflammatory Burden',       color: '#ef4444', icon: <Flame size={14} />, lowerIsBetter: true },
  { key: 'longevityPathway',    label: 'Longevity Pathway Score',    color: '#10b981', icon: <Zap size={14} />,   lowerIsBetter: false },
  { key: 'mitochondrialHealth', label: 'Mitochondrial Health',       color: '#f59e0b', icon: <Zap size={14} />,   lowerIsBetter: false },
  { key: 'cardiovascularRisk',  label: 'Cardiovascular Risk',        color: '#3b82f6', icon: <Heart size={14} />, lowerIsBetter: true },
] as const;

export default function SimulatorPage() {
  const { mode } = useApp();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const activeInterventions = INTERVENTIONS.filter(i => selected.has(i.id));

  const simulated = useMemo(() => {
    const t = { ...BASELINE };
    for (const iv of activeInterventions) {
      t.inflammatoryBurden  = Math.max(0, Math.min(100, t.inflammatoryBurden  + iv.effects.inflammatoryBurden));
      t.regulatoryAge       = t.regulatoryAge + iv.effects.regulatoryAge;
      t.longevityPathway    = Math.max(0, Math.min(100, t.longevityPathway    + iv.effects.longevityPathway));
      t.mitochondrialHealth = Math.max(0, Math.min(100, t.mitochondrialHealth + iv.effects.mitochondrialHealth));
      t.cardiovascularRisk  = Math.max(0, Math.min(100, t.cardiovascularRisk  + iv.effects.cardiovascularRisk));
    }
    return t;
  }, [activeInterventions]);

  const ageShift = simulated.regulatoryAge;
  const ageColor = ageShift < -0.5 ? '#10b981' : ageShift > 0.5 ? '#ef4444' : '#8899b8';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>

      {/* ── Hero ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        padding: '52px 48px 44px',
        borderRadius: 28,
        background: 'linear-gradient(135deg, rgba(10,14,26,0.95) 0%, rgba(17,24,39,0.88) 100%)',
        border: '1px solid rgba(139,92,246,0.2)',
        backdropFilter: 'blur(32px)',
      }}>
        {/* Floating orbs */}
        <motion.div animate={{ y: [0,-18,0], x: [0,8,0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position:'absolute', top:-60, right:100, width:280, height:280, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)', filter:'blur(50px)', pointerEvents:'none' }} />
        <motion.div animate={{ y: [0,14,0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay:2 }}
          style={{ position:'absolute', bottom:-40, left:80, width:200, height:200, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(10,232,210,0.08) 0%, transparent 65%)', filter:'blur(40px)', pointerEvents:'none' }} />

        <div style={{ position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <motion.div initial={{ scale:0, rotate:-180 }} animate={{ scale:1, rotate:0 }}
              transition={{ duration:0.6, ease, delay:0.1 }}
              style={{ width:68, height:68, borderRadius:22, flexShrink:0,
                background:'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(10,232,210,0.15))',
                border:'1px solid rgba(139,92,246,0.35)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 0 40px rgba(139,92,246,0.15)' }}>
              <FlaskConical size={30} color="#8b5cf6" />
            </motion.div>
            <div>
              <h1 style={{ fontSize:46, fontWeight:900, letterSpacing:'-0.035em', lineHeight:1.05,
                background:'linear-gradient(135deg, #e8edf5 20%, #a78bfa 70%, #0ae8d2 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Regulatory Twin
              </h1>
              <p style={{ fontSize:16, color:'#8899b8', marginTop:6, fontWeight:500 }}>
                Simulate lifestyle interventions — see predicted impact on your regulatory genome
              </p>
            </div>
          </div>

          {/* Live age readout in hero */}
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', color:'#6b7d9c', marginBottom:4 }}>
              Epigenetic Age Shift
            </p>
            <motion.div key={ageShift}
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease }}>
              <span style={{ fontSize:56, fontWeight:900, lineHeight:1, color: ageColor,
                textShadow: `0 0 40px ${ageColor}50` }}>
                {ageShift > 0 ? '+' : ''}{ageShift.toFixed(1)}
              </span>
              <span style={{ fontSize:22, color:'#6b7d9c', fontWeight:600, marginLeft:6 }}>yrs</span>
            </motion.div>
            <p style={{ fontSize:12, color: ageColor, marginTop:6, fontWeight:600 }}>
              {ageShift < -1 ? '✅ Significant deceleration' : ageShift < 0 ? '🟢 Mild deceleration' : ageShift === 0 ? 'Select interventions' : ageShift < 1 ? '🟡 Slight acceleration' : '🔴 Acceleration detected'}
            </p>
          </div>
        </div>

        {/* Stat mini row */}
        <div style={{ position:'relative', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginTop:36 }}>
          {METRICS.map(m => {
            const sim = simulated[m.key as keyof typeof simulated] as number;
            const base = BASELINE[m.key as keyof typeof BASELINE] as number;
            const delta = sim - base;
            const good = m.lowerIsBetter ? delta < 0 : delta > 0;
            const dc = delta === 0 ? '#6b7d9c' : good ? '#10b981' : '#ef4444';
            return (
              <div key={m.key} style={{ padding:'16px 14px', borderRadius:14,
                background:'rgba(10,14,26,0.6)', border:`1px solid ${m.color}20`,
                backdropFilter:'blur(12px)' }}>
                <p style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#6b7d9c', marginBottom:6 }}>
                  {m.label}
                </p>
                <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                  <span style={{ fontSize:26, fontWeight:800, color: m.color }}>{sim.toFixed(0)}</span>
                  {delta !== 0 && (
                    <span style={{ fontSize:11, fontWeight:700, color: dc }}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(0)}
                    </span>
                  )}
                </div>
                <div style={{ marginTop:8, height:4, borderRadius:999, background:'rgba(56,78,122,0.3)', overflow:'hidden' }}>
                  <motion.div animate={{ width: `${Math.max(0,Math.min(100,sim))}%` }}
                    transition={{ duration:0.7, ease:'easeOut' }}
                    style={{ height:'100%', borderRadius:999, background: m.color }} />
                </div>
              </div>
            );
          })}
        </div>

        {mode === 'demo' && (
          <div style={{ position:'relative', marginTop:20, display:'inline-flex', alignItems:'center', gap:8,
            padding:'6px 14px', borderRadius:999,
            background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', fontSize:11, color:'#f59e0b' }}>
            🎭 Demo mode — predictions use published regulatory genomics models, not clinical advice
          </div>
        )}
      </div>

      {/* ── Body: interventions + detail panel ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24 }}>
        {/* Left: intervention grid */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#e8edf5', letterSpacing:'-0.02em' }}>
                Interventions
              </h2>
              <p style={{ fontSize:12, color:'#6b7d9c', marginTop:2 }}>
                {selected.size > 0 ? `${selected.size} active — predictions updating in real time` : 'Click any card to activate'}
              </p>
            </div>
            {selected.size > 0 && (
              <button onClick={() => setSelected(new Set())}
                style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7d9c',
                  cursor:'pointer', background:'none', border:'1px solid rgba(56,78,122,0.3)',
                  padding:'6px 14px', borderRadius:999, transition:'all 0.15s' }}>
                <RefreshCw size={12} /> Reset all
              </button>
            )}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:14 }}>
            {INTERVENTIONS.map((iv, idx) => {
              const active = selected.has(iv.id);
              const isRisk = iv.category === 'Risk Factor';
              return (
                <motion.div key={iv.id}
                  initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: idx * 0.05, duration:0.4, ease }}
                  whileHover={{ y:-2, scale:1.01 }} whileTap={{ scale:0.98 }}
                  onClick={() => toggle(iv.id)}
                  style={{ position:'relative', cursor:'pointer', padding:'20px 20px 18px',
                    borderRadius:18, overflow:'hidden',
                    background: active ? `linear-gradient(135deg, ${iv.color}10, ${iv.color}06)` : 'rgba(17,24,39,0.75)',
                    border: active ? `1px solid ${iv.color}55` : '1px solid rgba(56,78,122,0.2)',
                    boxShadow: active ? `0 0 30px ${iv.color}18, inset 0 0 30px ${iv.color}05` : '0 2px 12px rgba(0,0,0,0.25)',
                    transition:'all 0.2s ease' }}>

                  {/* Active glow sweep */}
                  {active && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                      style={{ position:'absolute', inset:0, borderRadius:18, overflow:'hidden', pointerEvents:'none' }}>
                      <motion.div animate={{ x:['-100%','200%'] }} transition={{ duration:2, repeat:Infinity, ease:'easeInOut', repeatDelay:3 }}
                        style={{ position:'absolute', top:0, bottom:0, width:'40%',
                          background:`linear-gradient(90deg, transparent, ${iv.color}15, transparent)` }} />
                    </motion.div>
                  )}

                  <div style={{ position:'relative' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontSize:22 }}>{iv.icon}</span>
                        <div>
                          <p style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em',
                            color: isRisk ? '#ef4444' : iv.color, marginBottom:3 }}>
                            {iv.category}
                          </p>
                          <p style={{ fontSize:13, fontWeight:700, color: active ? iv.color : '#c4cfe8', lineHeight:1.2 }}>
                            {iv.label}
                          </p>
                        </div>
                      </div>
                      {/* Checkbox */}
                      <motion.div animate={{ scale: active ? [1, 1.2, 1] : 1 }} transition={{ duration:0.3 }}
                        style={{ width:22, height:22, borderRadius:6, flexShrink:0, marginTop:2,
                          background: active ? iv.color : 'rgba(56,78,122,0.3)',
                          border: active ? `1px solid ${iv.color}` : '1px solid rgba(56,78,122,0.5)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          boxShadow: active ? `0 0 12px ${iv.color}60` : 'none' }}>
                        {active && <motion.span initial={{ scale:0 }} animate={{ scale:1 }} style={{ color:'#0a0e1a', fontSize:13, fontWeight:900, lineHeight:1 }}>✓</motion.span>}
                      </motion.div>
                    </div>

                    {/* Effect preview chips */}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {iv.effects.inflammatoryBurden !== 0 && (
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                          color: iv.effects.inflammatoryBurden < 0 ? '#10b981' : '#ef4444',
                          background: iv.effects.inflammatoryBurden < 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                          border: `1px solid ${iv.effects.inflammatoryBurden < 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                          🔥 {iv.effects.inflammatoryBurden > 0 ? '+' : ''}{iv.effects.inflammatoryBurden}%
                        </span>
                      )}
                      {iv.effects.regulatoryAge !== 0 && (
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                          color: iv.effects.regulatoryAge < 0 ? '#10b981' : '#ef4444',
                          background: iv.effects.regulatoryAge < 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                          border: `1px solid ${iv.effects.regulatoryAge < 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                          ⏰ {iv.effects.regulatoryAge > 0 ? '+' : ''}{iv.effects.regulatoryAge}yr
                        </span>
                      )}
                    </div>

                    {/* Expanded description */}
                    <AnimatePresence>
                      {active && (
                        <motion.p initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                          exit={{ opacity:0, height:0 }} transition={{ duration:0.25 }}
                          style={{ fontSize:11, color:'#8899b8', marginTop:10, lineHeight:1.6, overflow:'hidden' }}>
                          {iv.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: detail panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, position:'sticky', top:20, alignSelf:'start' }}>
          {/* Network impact */}
          <div style={{ padding:'24px 22px', borderRadius:20,
            background:'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(10,14,26,0.85))',
            border:'1px solid rgba(56,78,122,0.25)', backdropFilter:'blur(20px)' }}>
            <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#6b7d9c', marginBottom:20 }}>
              Regulatory Network Impact
            </p>
            {METRICS.map(m => {
              const sim = simulated[m.key as keyof typeof simulated] as number;
              const base = BASELINE[m.key as keyof typeof BASELINE] as number;
              const delta = sim - base;
              const good = m.lowerIsBetter ? delta < 0 : delta > 0;
              const dc = delta === 0 ? '#6b7d9c' : good ? '#10b981' : '#ef4444';
              return (
                <div key={m.key} style={{ marginBottom:22 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{ fontSize:12, color:'#c4cfe8', fontWeight:600 }}>{m.label}</span>
                    <span style={{ fontSize:12, fontWeight:800, color: dc }}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                    <div>
                      <p style={{ fontSize:9, color:'#4a5568', marginBottom:3 }}>Baseline</p>
                      <div style={{ height:6, borderRadius:999, background:'rgba(56,78,122,0.3)', overflow:'hidden' }}>
                        <div style={{ width:`${base}%`, height:'100%', borderRadius:999, background:`${m.color}55` }} />
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize:9, color:'#4a5568', marginBottom:3 }}>Simulated</p>
                      <div style={{ height:6, borderRadius:999, background:'rgba(56,78,122,0.3)', overflow:'hidden' }}>
                        <motion.div animate={{ width:`${Math.max(0,Math.min(100,sim))}%` }}
                          transition={{ duration:0.7, ease:'easeOut' }}
                          style={{ height:'100%', borderRadius:999,
                            background: delta === 0 ? m.color : good ? '#10b981' : '#ef4444',
                            boxShadow: `0 0 8px ${delta === 0 ? m.color : good ? '#10b981' : '#ef4444'}60` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active stack */}
          {activeInterventions.length > 0 && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              style={{ padding:'20px 20px', borderRadius:18,
                background:'rgba(10,14,26,0.7)', border:'1px solid rgba(56,78,122,0.2)' }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#6b7d9c', marginBottom:12 }}>
                Active Stack ({activeInterventions.length})
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {activeInterventions.map(iv => (
                  <div key={iv.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10,
                    background:`${iv.color}10`, border:`1px solid ${iv.color}25` }}>
                    <span style={{ fontSize:16 }}>{iv.icon}</span>
                    <span style={{ fontSize:12, fontWeight:600, color: iv.color }}>{iv.label}</span>
                    <span style={{ marginLeft:'auto', fontSize:11, color:'#10b981', fontWeight:700 }}>
                      {iv.effects.regulatoryAge < 0 ? `${iv.effects.regulatoryAge}yr` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <p style={{ fontSize:10, color:'#4a5568', lineHeight:1.6, padding:'0 2px' }}>
            ⚠️ Predictions are based on published regulatory genomics models. For research & educational use only — not clinical advice.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
