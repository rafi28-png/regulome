import { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { chromosomes, type ChromosomeInfo } from '@/data/genomeExplorerData';

/* ================================================================
   ReguloMe — Nuclear Territory View  (GOD-MODE v3 — Stable)
   Per-blob GLSL shaders · Screen-space tooltip via parent callback
   Orbit rings · Chromatin cloud · Nucleolus
   ================================================================ */

export type NuclearHoverInfo = {
  chr: ChromosomeInfo;
  screenX: number;
  screenY: number;
} | null;

// Bolzer et al. 2005 — large→peripheral, gene-rich→central
const TERRITORY_POSITIONS: Record<string, [number, number, number]> = {
  chr1:  [-1.4,  0.3,  0.2],
  chr2:  [ 1.3, -0.5,  0.4],
  chr3:  [-0.9,  1.0, -0.3],
  chr4:  [ 0.8,  1.1,  0.5],
  chr5:  [-1.2, -0.8, -0.2],
  chr6:  [ 1.1,  0.2, -0.9],
  chr7:  [-0.6, -1.2,  0.7],
  chr8:  [ 0.5,  0.9, -1.1],
  chr9:  [-1.0,  0.0,  0.8],
  chr10: [ 0.9, -0.9, -0.4],
  chr11: [-0.4,  1.3,  0.0],
  chr12: [ 0.3, -0.7,  1.1],
  chr13: [-1.3,  0.6, -0.7],
  chr14: [ 1.2, -0.3,  0.8],
  chr15: [-0.5, -1.1, -0.9],
  chr16: [ 0.7,  0.6,  0.9],
  chr17: [-0.2,  0.4, -0.5],
  chr18: [ 1.4, -0.6,  0.0],
  chr19: [ 0.0,  0.1,  0.2],
  chr20: [-0.3, -0.3,  0.6],
  chr21: [ 0.4,  0.8, -0.8],
  chr22: [-0.3,  0.7,  0.7],
  chrX:  [ 1.1,  0.5, -0.5],
  chrY:  [-1.0, -0.4,  0.5],
};

const NUCLEUS_RADIUS = 2.2;

/* ── Per-blob territory GLSL ───────────────────────────────────── */
const territoryVert = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uHover;

  float hash(vec3 p){p=fract(p*vec3(443.8975,397.2973,491.1871));p+=dot(p.zxy,p.yxz+19.19);return fract(p.x*p.y*p.z);}
  float noise(vec3 p){vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    float n = noise(position * 3.5 + uTime * 0.4);
    vec3 displaced = position + normal * n * 0.07 * (1.0 + uHover * 0.5);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const territoryFrag = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3  uColor;
  uniform float uHover;
  uniform float uDensity;

  void main() {
    vec3 vd = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(vNormal, vd), 2.2);
    float band = sin(vPosition.y*14.0+uTime*1.8)*0.5+0.5;
    band *= sin(vPosition.y*6.0-uTime*0.9)*0.5+0.5;
    float rings = smoothstep(0.44, 0.5, abs(fract(vUv.y*5.0)-0.5));
    vec3 col = mix(uColor*0.55, uColor+vec3(0.18), fresnel*0.7+band*0.3);
    col += rings * uColor * 0.3;
    col += uHover * (sin(uTime*4.0)*0.5+0.5) * 0.22;
    col += uDensity * 0.14 * uColor;
    gl_FragColor = vec4(col, 0.70 + fresnel*0.24 + band*0.06 + uHover*0.1);
  }
`;

/* ── Nuclear Membrane shaders ───────────────────────────────────── */
const memVert = /* glsl */`
  varying vec3 vNormal; varying vec3 vPosition; uniform float uTime;
  void main(){vNormal=normalize(normalMatrix*normal);vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position*(1.0+sin(uTime*0.4)*0.008),1.0);}
`;
const memFrag = /* glsl */`
  varying vec3 vNormal; varying vec3 vPosition; uniform float uTime;
  void main(){
    vec3 vd=normalize(cameraPosition-vPosition);
    float fr=pow(1.0-abs(dot(vNormal,vd)),3.0);
    float rp=sin(vPosition.y*8.0+uTime*0.6)*0.5+0.5;rp*=sin(vPosition.x*6.0-uTime*0.4)*0.5+0.5;
    gl_FragColor=vec4(mix(vec3(0.04,0.91,0.82),vec3(0.55,0.36,0.96),rp*0.5+0.5),fr*0.4+rp*0.05);
  }
`;

/* ── Nuclear Membrane ───────────────────────────────────────────── */
function NuclearMembrane() {
  const r1 = useRef<THREE.ShaderMaterial>(null!);
  const r2 = useRef<THREE.ShaderMaterial>(null!);
  const u  = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame(s => {
    if (r1.current) r1.current.uniforms.uTime.value = s.clock.elapsedTime;
    if (r2.current) r2.current.uniforms.uTime.value = s.clock.elapsedTime;
  });
  return (
    <>
      <mesh><sphereGeometry args={[NUCLEUS_RADIUS+0.6,32,32]}/><meshBasicMaterial color="#0ae8d2" transparent opacity={0.022} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>
      <mesh><sphereGeometry args={[NUCLEUS_RADIUS+0.3,48,48]}/><meshBasicMaterial color="#8b5cf6" transparent opacity={0.028} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>
      <mesh><sphereGeometry args={[NUCLEUS_RADIUS,96,96]}/><shaderMaterial ref={r1} vertexShader={memVert} fragmentShader={memFrag} uniforms={u} transparent side={THREE.FrontSide} depthWrite={false}/></mesh>
      <mesh><sphereGeometry args={[NUCLEUS_RADIUS-0.05,64,64]}/><shaderMaterial ref={r2} vertexShader={memVert} fragmentShader={memFrag} uniforms={{uTime:{value:0}}} transparent side={THREE.BackSide} depthWrite={false}/></mesh>
      <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[NUCLEUS_RADIUS,0.009,8,96]}/><meshBasicMaterial color="#0ae8d2" transparent opacity={0.25} depthWrite={false}/></mesh>
      <mesh rotation={[Math.PI/4,0.3,0]}><torusGeometry args={[NUCLEUS_RADIUS,0.006,8,96]}/><meshBasicMaterial color="#8b5cf6" transparent opacity={0.14} depthWrite={false}/></mesh>
      <mesh rotation={[-Math.PI/5,0,0.6]}><torusGeometry args={[NUCLEUS_RADIUS,0.004,8,96]}/><meshBasicMaterial color="#0ae8d2" transparent opacity={0.08} depthWrite={false}/></mesh>
    </>
  );
}

/* ── Nuclear Pores ─────────────────────────────────────────────── */
function NuclearPores() {
  const ref = useRef<THREE.Points>(null!);
  const { positions, colors } = useMemo(() => {
    const N=200,pos=new Float32Array(N*3),cols=new Float32Array(N*3);
    for(let i=0;i<N;i++){
      const th=Math.acos(1-2*(i+.5)/N),ph=Math.PI*(1+Math.sqrt(5))*i,r=NUCLEUS_RADIUS+0.01;
      pos[i*3]=r*Math.sin(th)*Math.cos(ph);pos[i*3+1]=r*Math.cos(th);pos[i*3+2]=r*Math.sin(th)*Math.sin(ph);
      const t=i%2===0;cols[i*3]=t?.04:.55;cols[i*3+1]=t?.91:.36;cols[i*3+2]=t?.82:.96;
    }
    return{positions:pos,colors:cols};
  },[]);
  useFrame(s=>{if(ref.current)(ref.current.material as THREE.PointsMaterial).opacity=0.25+Math.sin(s.clock.elapsedTime*1.1)*0.1;});
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/><bufferAttribute attach="attributes-color" args={[colors,3]}/></bufferGeometry><pointsMaterial vertexColors size={0.025} transparent opacity={0.25} sizeAttenuation depthWrite={false}/></points>;
}

/* ── Chromosome Territory Blob ──────────────────────────────────── */
function ChromosomeTerritoryBlob({ chr, isHovered, isSelected, onHover, onClick, onHoverInfo }: {
  chr: ChromosomeInfo;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  /** Passes screen-space position to parent so it can render HTML tooltip outside Canvas */
  onHoverInfo: (info: NuclearHoverInfo) => void;
}) {
  const matRef  = useRef<THREE.ShaderMaterial>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const grpRef  = useRef<THREE.Group>(null!);
  const pos = TERRITORY_POSITIONS[chr.id] ?? [0, 0, 0];
  const { camera, size } = useThree();

  const scale   = 0.04 + (Math.log(chr.sizeMb) / Math.log(250)) * 0.062;
  const density = Math.min(chr.regulatoryDensity / 20, 1);

  const uniforms = useMemo(() => ({
    uTime:    { value: 0 },
    uColor:   { value: new THREE.Color(chr.color) },
    uHover:   { value: 0 },
    uDensity: { value: density },
  }), [chr.color, density]);

  useFrame(s => {
    const t = s.clock.elapsedTime;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t;
      const target = isHovered || isSelected ? 1 : 0;
      matRef.current.uniforms.uHover.value += (target - matRef.current.uniforms.uHover.value) * 0.1;
    }
    if (grpRef.current) {
      const ts = isSelected ? scale*1.45 : isHovered ? scale*1.22 : scale;
      const sc = grpRef.current.scale;
      sc.x += (ts-sc.x)*0.1; sc.y += (ts-sc.y)*0.1; sc.z += (ts-sc.z)*0.1;
      grpRef.current.position.y = pos[1] + Math.sin(t*0.65+pos[0]*2.8)*0.03;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = t*(isHovered ? 2.8 : 0.6);
      ringRef.current.rotation.x = t*(isHovered ? 1.4 : 0.28);
      const m = ringRef.current.material as THREE.MeshStandardMaterial;
      m.opacity += ((isHovered||isSelected ? 0.9 : 0.3)-m.opacity)*0.1;
      m.emissiveIntensity += ((isHovered ? 1.6 : 0.4)-m.emissiveIntensity)*0.1;
    }
    // Project to screen space — send to parent as callback (no HTML inside Canvas)
    if (isHovered && grpRef.current) {
      const wp = new THREE.Vector3();
      grpRef.current.getWorldPosition(wp);
      const projected = wp.clone().project(camera);
      // Guard against invalid projections (NaN, ±Infinity)
      if (isFinite(projected.x) && isFinite(projected.y)) {
        const sx = (projected.x * 0.5 + 0.5) * size.width;
        const sy = (-projected.y * 0.5 + 0.5) * size.height;
        onHoverInfo({ chr, screenX: sx, screenY: sy });
      }
    }
  });

  return (
    <group ref={grpRef} position={[pos[0], pos[1], pos[2]]} scale={scale}>
      {/* Volumetric glow */}
      <mesh>
        <sphereGeometry args={[1.7,12,12]}/>
        <meshBasicMaterial color={chr.color} transparent opacity={isHovered||isSelected ? 0.09 : 0.03} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending}/>
      </mesh>
      {/* Main shaded blob */}
      <mesh
        onPointerEnter={e=>{ e.stopPropagation(); onHover(chr.id); }}
        onPointerLeave={e=>{ e.stopPropagation(); onHover(null); onHoverInfo(null); }}
        onClick={e=>{ e.stopPropagation(); onClick(chr.id); }}
      >
        <sphereGeometry args={[1,32,32]}/>
        <shaderMaterial ref={matRef} vertexShader={territoryVert} fragmentShader={territoryFrag} uniforms={uniforms} transparent/>
      </mesh>
      {/* Orbit ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.38,0.045,8,48]}/>
        <meshStandardMaterial color={chr.color} emissive={chr.color} emissiveIntensity={0.4} roughness={0.08} metalness={1} transparent opacity={0.3}/>
      </mesh>
      {/* Sparkles — density-scaled */}
      {chr.regulatoryDensity > 7 && (
        <Sparkles
          count={Math.max(6, Math.floor(chr.regulatoryDensity * 0.8))}
          scale={[3.2,3.2,3.2]}
          size={chr.regulatoryDensity > 14 ? 1.8 : 1.1}
          speed={0.4}
          color={chr.color}
          opacity={0.5}
        />
      )}
    </group>
  );
}

/* ── Chromatin Interaction Arcs ─────────────────────────────────── */
function ChromatinInteractionArcs() {
  const ints: [string,string,string][] = [
    ['chr1','chr19','#0ae8d2'],['chr6','chr17','#8b5cf6'],
    ['chr11','chr22','#10b981'],['chr2','chr7','#3b82f6'],
    ['chr17','chr19','#f59e0b'],['chrX','chr1','#ec4899'],
  ];
  const lines = useMemo(()=> ints.map(([a,b,color])=>{
    const fr=TERRITORY_POSITIONS[a]??[0,0,0],to=TERRITORY_POSITIONS[b]??[0,0,0];
    const mid=[(fr[0]+to[0])*.2,(fr[1]+to[1])*.2,(fr[2]+to[2])*.2];
    const pts:THREE.Vector3[]=[];
    for(let i=0;i<=40;i++){const t=i/40,mt=1-t;pts.push(new THREE.Vector3(mt*mt*fr[0]+2*mt*t*mid[0]+t*t*to[0],mt*mt*fr[1]+2*mt*t*mid[1]+t*t*to[1],mt*mt*fr[2]+2*mt*t*mid[2]+t*t*to[2]));}
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:true,opacity:.12}));
  }),[]);
  const gRef=useRef<THREE.Group>(null!);
  useFrame(s=>{if(!gRef.current)return;gRef.current.children.forEach((c,i)=>{const m=(c as THREE.Line).material as THREE.LineBasicMaterial;if(m?.opacity!==undefined)m.opacity=0.04+Math.sin(s.clock.elapsedTime*.6+i*.8)*.07;});});
  return <group ref={gRef}>{lines.map((l,i)=><primitive key={i} object={l}/>)}</group>;
}

/* ── Star Field ─────────────────────────────────────────────────── */
function StarField() {
  const ref=useRef<THREE.Points>(null!);
  const{positions,colors}=useMemo(()=>{
    const N=700,pos=new Float32Array(N*3),cols=new Float32Array(N*3);
    const p=[[.04,.91,.82],[.55,.36,.96],[.23,.51,.96],[1,1,1]];
    for(let i=0;i<N;i++){const r=5+Math.random()*4,th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);pos[i*3]=r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=r*Math.cos(ph);pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);const c=p[i%4];cols[i*3]=c[0];cols[i*3+1]=c[1];cols[i*3+2]=c[2];}
    return{positions:pos,colors:cols};
  },[]);
  useFrame(s=>{if(ref.current)ref.current.rotation.y=s.clock.elapsedTime*.007;});
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/><bufferAttribute attach="attributes-color" args={[colors,3]}/></bufferGeometry><pointsMaterial vertexColors size={0.02} transparent opacity={0.5} sizeAttenuation depthWrite={false}/></points>;
}

/* ── Chromatin Cloud ────────────────────────────────────────────── */
function ChromatinCloud() {
  const ref=useRef<THREE.Points>(null!);
  const{positions,colors}=useMemo(()=>{
    const N=500,pos=new Float32Array(N*3),cols=new Float32Array(N*3);
    for(let i=0;i<N;i++){const r=Math.random()*(NUCLEUS_RADIUS-.3),th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);pos[i*3]=r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=r*Math.cos(ph);pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);const dk=Math.random()>.7;cols[i*3]=dk?.55:.04;cols[i*3+1]=dk?.36:.91;cols[i*3+2]=dk?.96:.82;}
    return{positions:pos,colors:cols};
  },[]);
  useFrame(s=>{if(ref.current){ref.current.rotation.y=s.clock.elapsedTime*.016;ref.current.rotation.x=s.clock.elapsedTime*.006;(ref.current.material as THREE.PointsMaterial).opacity=.04+Math.sin(s.clock.elapsedTime*.5)*.02;}});
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/><bufferAttribute attach="attributes-color" args={[colors,3]}/></bufferGeometry><pointsMaterial vertexColors size={0.012} transparent opacity={.04} sizeAttenuation depthWrite={false}/></points>;
}

/* ── Nucleolus ──────────────────────────────────────────────────── */
function Nucleolus(){
  const ref=useRef<THREE.Mesh>(null!);
  useFrame(s=>{if(ref.current){ref.current.rotation.y=s.clock.elapsedTime*.15;(ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity=.45+Math.sin(s.clock.elapsedTime*1.5)*.15;}});
  return(
    <group position={[.1,-.05,.08]}>
      <mesh ref={ref}><sphereGeometry args={[.28,20,20]}/><meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={.45} roughness={.5} metalness={.3} transparent opacity={.6}/></mesh>
      <mesh><sphereGeometry args={[.38,16,16]}/><meshBasicMaterial color="#f59e0b" transparent opacity={.05} side={THREE.BackSide} depthWrite={false}/></mesh>
      <Sparkles count={20} scale={[.9,.9,.9]} size={1.3} speed={.5} color="#f59e0b" opacity={.4}/>
    </group>
  );
}

/* ── Main Exported Scene (pure 3D — no HTML) ────────────────────── */
export default function NuclearTerritoryScene({
  onSelectChromosome,
  onHoverChange,
}: {
  onSelectChromosome: (chromosomeId: string) => void;
  onHoverChange: (info: NuclearHoverInfo) => void;
}) {
  const [hoveredId,  setHoveredId]  = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    setSelectedId(id);
    onHoverChange(null);
    setTimeout(() => onSelectChromosome(id), 500);
  };

  const handleHoverInfo = useCallback((info: NuclearHoverInfo) => {
    onHoverChange(info);
  }, [onHoverChange]);

  return (
    <>
      <ambientLight intensity={0.22}/>
      <pointLight position={[4,4,4]}    intensity={1.4} color="#0ae8d2"/>
      <pointLight position={[-4,-3,-4]} intensity={0.9} color="#8b5cf6"/>
      <pointLight position={[0,0,0]}    intensity={0.5} color="#f59e0b"/>
      <pointLight position={[0,4,0]}    intensity={0.4} color="#3b82f6"/>

      <OrbitControls
        enablePan={false}
        minDistance={3.5}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.06}
      />

      <StarField/>
      <NuclearMembrane/>
      <NuclearPores/>
      <ChromatinCloud/>
      <Nucleolus/>
      <ChromatinInteractionArcs/>

      {chromosomes.map(chr => (
        <Float key={chr.id} speed={1.1} floatIntensity={0.07} rotationIntensity={0}>
          <ChromosomeTerritoryBlob
            chr={chr}
            isHovered={hoveredId === chr.id}
            isSelected={selectedId === chr.id}
            onHover={id => { setHoveredId(id); if (!id) onHoverChange(null); }}
            onClick={handleClick}
            onHoverInfo={handleHoverInfo}
          />
        </Float>
      ))}
    </>
  );
}
