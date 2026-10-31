import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, Text, MeshWobbleMaterial, OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  type ChromosomeInfo,
  type TADRegion,
  type RegulatoryAnnotation,
  elementTypeConfig,
} from '@/data/genomeExplorerData';

/* ================================================================
   ReguloMe — REVOLUTIONARY 3D Genome Scene (GOD-MODE ULTRA)
   Custom GLSL shaders · Instanced base pairs · Hi-C contact map
   Floating gene labels · Sparkle super-enhancers · Stars field
   Animated signal propagation · Chromatin fiber · Energy arcs
   ================================================================ */

const compartmentColors = { A: '#0ae8d2', B: '#8b5cf6' };
const TUBE_LENGTH = 5.2;

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

/* ─── CUSTOM GLSL SHADERS ─────────────────────────────────────── */

// Chromosome backbone: animated plasma surface shader
const chromosomeVert = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;

  // Simplex-like hash
  float hash(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p.zxy, p.yxz + 19.19);
    return fract(p.x * p.y * p.z);
  }

  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Subtle vertex displacement based on noise
    float n = noise(position * 4.0 + uTime * 0.3);
    vec3 displaced = position + normal * n * 0.008;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const chromosomeFrag = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uRegulatoryDensity; // 0-1
  uniform vec3 uColor;

  void main() {
    // Fresnel rim glow
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.5);

    // Animated energy bands along Y axis
    float band = sin(vPosition.y * 12.0 + uTime * 1.4) * 0.5 + 0.5;
    band *= sin(vPosition.y * 5.0 - uTime * 0.7) * 0.5 + 0.5;

    // Regulatory density color shift (teal → violet based on density)
    vec3 colorA = vec3(0.04, 0.91, 0.82); // teal
    vec3 colorB = vec3(0.55, 0.36, 0.96); // violet
    vec3 baseColor = mix(colorA, colorB, uRegulatoryDensity);
    baseColor = mix(baseColor, uColor, 0.3);

    float glow = fresnel * 0.6 + band * 0.15;
    vec3 finalColor = baseColor + vec3(glow);

    gl_FragColor = vec4(finalColor, 0.18 + fresnel * 0.25 + band * 0.08);
  }
`;

// Hi-C contact map shader — shows contact frequency as heat
const hicVert = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const hicFrag = /* glsl */`
  varying vec2 vUv;
  uniform float uTime;
  uniform sampler2D uContactMap;

  vec3 heatmap(float t) {
    // Black → blue → cyan → teal → amber → red
    t = clamp(t, 0.0, 1.0);
    vec3 c0 = vec3(0.0, 0.04, 0.13);
    vec3 c1 = vec3(0.04, 0.91, 0.82);
    vec3 c2 = vec3(0.98, 0.62, 0.0);
    vec3 c3 = vec3(0.93, 0.10, 0.14);
    if (t < 0.33) return mix(c0, c1, t / 0.33);
    if (t < 0.66) return mix(c1, c2, (t - 0.33) / 0.33);
    return mix(c2, c3, (t - 0.66) / 0.34);
  }

  void main() {
    // Symmetric contact frequency (fake procedural Hi-C)
    float dist = abs(vUv.x - vUv.y);
    float freq = exp(-dist * 6.0);
    // TAD blocks: add structured high-contact regions
    float tadBlock = step(0.0, sin(vUv.x * 20.0)) * step(0.0, sin(vUv.y * 20.0));
    tadBlock *= (1.0 - smoothstep(0.0, 0.05, abs(vUv.x - vUv.y)));
    float signal = freq + tadBlock * 0.4;
    // Subtle animation
    signal *= 0.9 + 0.1 * sin(uTime * 0.5 + vUv.x * 10.0);
    float alpha = min(signal * 0.75, 0.85);
    gl_FragColor = vec4(heatmap(signal), alpha);
  }
`;

// Signal wave propagation shader (for TAD activation)
const signalVert = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const signalFrag = /* glsl */`
  varying vec2 vUv;
  uniform float uTime;
  uniform float uActivation; // 0-1
  uniform vec3 uColor;

  void main() {
    float wave = sin(vUv.y * 30.0 - uTime * 5.0) * 0.5 + 0.5;
    wave *= sin(vUv.y * 8.0 + uTime * 1.5) * 0.5 + 0.5;
    float alpha = wave * uActivation * 0.5;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

/* ─── CAMERA RIG — smooth zoom to active TAD ─────────────────── */
function CameraRig({ targetY, zoomAction }: { targetY: number | null; zoomAction: { type: 'in' | 'out' | 'fit' | 'none'; ts: number } }) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const lerpTarget = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (targetY !== null) {
      lerpTarget.current.set(0, targetY, 0);
    } else {
      lerpTarget.current.set(0, 0, 0);
    }
  }, [targetY]);

  // React to zoom button clicks using OrbitControls' native dolly
  useEffect(() => {
    if (!controlsRef.current || zoomAction.type === 'none') return;

    if (zoomAction.type === 'fit') {
      // FIT: reset camera to default distance of 3.5
      const cam = controlsRef.current.object;
      const target = controlsRef.current.target;
      const dir = cam.position.clone().sub(target).normalize();
      cam.position.copy(target).add(dir.multiplyScalar(3.5));
      controlsRef.current.update();
    } else if (zoomAction.type === 'in') {
      controlsRef.current.dollyIn(1.3);
      controlsRef.current.update();
    } else if (zoomAction.type === 'out') {
      controlsRef.current.dollyOut(1.3);
      controlsRef.current.update();
    }
  }, [zoomAction]);

  useFrame(() => {
    if (!controlsRef.current) return;
    controlsRef.current.target.lerp(lerpTarget.current, 0.045);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={1.5}
      maxDistance={8}
      autoRotate
      autoRotateSpeed={targetY !== null ? 0.0 : 0.25}
      enableDamping
      dampingFactor={0.04}
    />
  );
}

/* ─── CHROMOSOME BACKBONE (Custom Shader + multi-shell bloom) ─── */
function ChromosomeShell({
  chromosome,
  isActive,
}: {
  chromosome: ChromosomeInfo;
  isActive: boolean;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const density = useMemo(
    () => Math.min(chromosome.regulatoryDensity / 20, 1),
    [chromosome.regulatoryDensity],
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRegulatoryDensity: { value: density },
      uColor: { value: new THREE.Color(chromosome.color) },
    }),
    [density, chromosome.color],
  );

  return (
    <>
      {/* ── Multi-shell fake bloom (4 additive shells at increasing radius) ── */}
      {[0.23, 0.30, 0.40, 0.55].map((r, i) => (
        <mesh key={i}>
          <cylinderGeometry args={[r, r, TUBE_LENGTH * (1 - i * 0.04), 32, 1, true]} />
          <meshBasicMaterial
            color={chromosome.color}
            transparent
            opacity={[0.03, 0.018, 0.009, 0.004][i]}
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      {/* Core shader shell */}
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, TUBE_LENGTH, 64, 1, true]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={chromosomeVert}
          fragmentShader={chromosomeFrag}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Signal wave overlay */}
      {isActive && <SignalWave color={chromosome.color} />}
    </>
  );
}

/* ─── SIGNAL WAVE (animates on active chromosome shell) ───────── */
function SignalWave({ color }: { color: string }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uActivation.value = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });
  return (
    <mesh>
      <cylinderGeometry args={[0.19, 0.19, TUBE_LENGTH, 32, 1, true]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={signalVert}
        fragmentShader={signalFrag}
        uniforms={{
          uTime: { value: 0 },
          uActivation: { value: 0 },
          uColor: { value: new THREE.Color(color) },
        }}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ─── HI-C CONTACT MAP (3D plane, curved) ────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HiCContactMap({ visible }: { visible: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  if (!visible) return null;

  return (
    <mesh position={[1.8, 0, -0.5]} rotation={[0, -0.5, 0]}>
      <planeGeometry args={[2.5, 2.5, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={hicVert}
        fragmentShader={hicFrag}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ─── INSTANCED BASE-PAIR NUCLEOTIDES ─────────────────────────── */
function BasePairField({ tubeLength }: { tubeLength: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const COUNT = 400;

  const colors = useMemo(() => {
    const cols = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const colors4 = [
        [0.04, 0.91, 0.82],
        [0.55, 0.36, 0.96],
        [0.23, 0.51, 0.96],
        [0.98, 0.62, 0.00],
      ];
      const c = colors4[i % 4];
      cols[i * 3] = c[0]; cols[i * 3 + 1] = c[1]; cols[i * 3 + 2] = c[2];
    }
    return cols;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    const turns = 40;
    const helixRadius = 0.12;
    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT;
      const sa = i % 2 === 0 ? 1 : -1;
      const angle = t * turns * Math.PI * 2 + state.clock.elapsedTime * 0.08;
      const x = Math.cos(angle + (sa < 0 ? Math.PI : 0)) * helixRadius;
      const z = Math.sin(angle + (sa < 0 ? Math.PI : 0)) * helixRadius;
      const y = (t - 0.5) * tubeLength;
      const scale = 0.009;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        vertexColors
        emissive="#ffffff"
        emissiveIntensity={0.5}
        roughness={0.6}
        metalness={0}
        transparent
        opacity={0.9}
      />
      <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
    </instancedMesh>
  );
}

/* ─── BASE-PAIR RUNGS — removed (visual clutter) ─────────────── */
// RungsField removed: the horizontal cylinders inside the helix
// looked like sticks in a cage, too dense and distracting.


/* ─── FLOATING 3D GENE LABELS (troika via @react-three/drei) ──── */
function GeneLabel({
  annotation,
  chromosomeSize,
  active,
}: {
  annotation: RegulatoryAnnotation;
  chromosomeSize: number;
  active: boolean;
}) {
  const posY = ((annotation.positionMb / chromosomeSize) - 0.5) * TUBE_LENGTH;
  const idx = parseInt(annotation.id.replace('reg-', ''), 10);
  const angle = (idx * 1.61803) % (Math.PI * 2); // golden angle
  const dist = 0.6 + (idx % 3) * 0.15;
  const x = Math.cos(angle) * dist;
  const z = Math.sin(angle) * dist;
  const cfg = elementTypeConfig[annotation.elementType];

  // Only show important ones (high score or active)
  if (!active && annotation.score < 88) return null;

  return (
    <Float speed={1.5} floatIntensity={0.15} rotationIntensity={0}>
      <group position={[x, posY, z]}>
        {/* Label background pill */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.38, 0.1]} />
          <meshBasicMaterial color="#0a0e1a" transparent opacity={0.75} />
        </mesh>
        <Text
          fontSize={0.055}
          color={cfg.color}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          outlineWidth={0.002}
          outlineColor="#0a0e1a"
        >
          {annotation.gene}
        </Text>
        {/* Thin line to chromosome */}
        <primitive object={(() => {
          const g = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-x * 0.85, 0, -z * 0.85),
          ]);
          return new THREE.Line(g, new THREE.LineBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.25 }));
        })()} />
      </group>
    </Float>
  );
}

/* ─── SUPER-ENHANCER SPARKLE HALOS ───────────────────────────── */
function SuperEnhancerHalo({
  annotation,
  chromosomeSize,
}: {
  annotation: RegulatoryAnnotation;
  chromosomeSize: number;
}) {
  const posY = ((annotation.positionMb / chromosomeSize) - 0.5) * TUBE_LENGTH;
  const cfg = elementTypeConfig[annotation.elementType];
  return (
    <group position={[0, posY, 0]}>
      <Sparkles
        count={30}
        scale={[0.8, 0.3, 0.8]}
        size={1.5}
        speed={0.3}
        color={cfg.color}
        opacity={0.7}
      />
    </group>
  );
}

/* ─── TAD SEGMENT with advanced glow & boundary arcs ─────────── */
function TADSegment({
  tad, chromosomeSize, isActive, isHovered, onHover, onClick,
}: {
  tad: TADRegion; chromosomeSize: number;
  isActive: boolean; isHovered: boolean;
  onHover: (id: string | null) => void; onClick: (id: string) => void;
}) {
  const outerRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const startY = ((tad.startMb / chromosomeSize) - 0.5) * TUBE_LENGTH;
  const endY = ((tad.endMb / chromosomeSize) - 0.5) * TUBE_LENGTH;
  const segLen = Math.max(endY - startY, 0.01);
  const centerY = startY + segLen / 2;
  const color = compartmentColors[tad.compartment];

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (innerRef.current) {
      const mat = innerRef.current.material as THREE.MeshStandardMaterial;
      const targetOp = isActive ? 0.55 : isHovered ? 0.35 : 0.12;
      const targetEm = isActive ? 0.6 : isHovered ? 0.35 : 0.05;
      mat.opacity += (targetOp - mat.opacity) * 0.14;
      mat.emissiveIntensity += (targetEm - mat.emissiveIntensity) * 0.14;
      if (isActive) innerRef.current.scale.set(1 + Math.sin(t * 2.5) * 0.015, 1, 1 + Math.sin(t * 2.5) * 0.015);
      else innerRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
    if (outerRef.current) {
      const mat = outerRef.current.material as THREE.MeshBasicMaterial;
      const targetOp = isActive ? 0.12 : isHovered ? 0.06 : 0;
      mat.opacity += (targetOp - mat.opacity) * 0.12;
    }
  });

  return (
    <group position={[0, centerY, 0]}>
      {/* Outer volumetric glow shell */}
      <mesh ref={outerRef}>
        <cylinderGeometry args={[0.28, 0.28, segLen + 0.02, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* Main clickable segment */}
      <mesh
        ref={innerRef}
        onPointerEnter={(e) => { e.stopPropagation(); onHover(tad.id); }}
        onPointerLeave={(e) => { e.stopPropagation(); onHover(null); }}
        onClick={(e) => { e.stopPropagation(); onClick(tad.id); }}
      >
        <cylinderGeometry args={[0.19, 0.19, segLen, 32]} />
        <meshStandardMaterial
          color={color} transparent opacity={0.12}
          emissive={color} emissiveIntensity={0.05}
          roughness={0.1} metalness={0.9}
        />
      </mesh>

      {/* Boundary torus rings with animated rotation */}
      {([startY - centerY, endY - centerY] as number[]).map((by, i) => (
        <BoundaryRing key={i} y={by} color={color} active={isActive} />
      ))}

      {/* TAD insulation score arc */}
      {(isActive || isHovered) && (
        <InsulationArc score={tad.insulationScore} color={color} segLen={segLen} />
      )}
    </group>
  );
}

function BoundaryRing({ y, color, active }: { y: number; color: string; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * (active ? 1.5 : 0.4);
  });
  return (
    <mesh ref={ref} position={[0, y, 0]}>
      <torusGeometry args={[0.21, 0.006, 8, 64]} />
      <meshStandardMaterial
        color={color} emissive={color}
        emissiveIntensity={active ? 0.8 : 0.2}
        transparent opacity={active ? 0.7 : 0.2}
        roughness={0.1} metalness={1}
      />
    </mesh>
  );
}

function InsulationArc({ score, color, segLen }: { score: number; color: string; segLen: number }) {
  const lineRef = useRef<THREE.Line>(null);
  const arcLine = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const r = 0.35;
    const arcAngle = score * Math.PI * 1.5;
    for (let i = 0; i <= 48; i++) {
      const a = -arcAngle / 2 + (i / 48) * arcAngle;
      pts.push(new THREE.Vector3(Math.cos(a) * r, (i / 48 - 0.5) * segLen * 0.8, Math.sin(a) * r));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 });
    return new THREE.Line(geo, mat);
  }, [score, color, segLen]);

  useFrame((state) => {
    const mat = lineRef.current?.material as THREE.LineBasicMaterial | undefined;
    if (!mat) return;
    mat.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
  });

  return <primitive ref={lineRef} object={arcLine} />;
}

/* ─── ADVANCED ANNOTATION MARKERS ────────────────────────────── */
function AnnotationMarker({
  annotation, chromosomeSize,
}: {
  annotation: RegulatoryAnnotation; chromosomeSize: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const posY = ((annotation.positionMb / chromosomeSize) - 0.5) * TUBE_LENGTH;
  const cfg = elementTypeConfig[annotation.elementType];
  const idx = parseInt(annotation.id.replace('reg-', ''), 10);
  const angle = (idx * 1.61803) % (Math.PI * 2); // golden ratio angle spread
  const dist = 0.28 + (idx % 3) * 0.06;
  const ox = Math.cos(angle) * dist;
  const oz = Math.sin(angle) * dist;

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = posY + Math.sin(state.clock.elapsedTime * 1.2 + idx) * 0.018;
    ref.current.rotation.y = state.clock.elapsedTime * 0.6;
    ref.current.rotation.x = state.clock.elapsedTime * 0.3;
  });

  const geo = useMemo(() => {
    switch (annotation.elementType) {
      case 'enhancer': return new THREE.OctahedronGeometry(0.04, 1);
      case 'promoter': return new THREE.CylinderGeometry(0.03, 0.03, 0.012, 6);
      case 'super_enhancer': return new THREE.IcosahedronGeometry(0.048, 1);
      case 'ctcf_site': return new THREE.TorusGeometry(0.028, 0.01, 8, 20);
      case 'silencer': return new THREE.BoxGeometry(0.04, 0.04, 0.04);
      case 'tfbs': return new THREE.TetrahedronGeometry(0.038);
      case 'insulator': return new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6);
      default: return new THREE.SphereGeometry(0.032, 12, 12);
    }
  }, [annotation.elementType]);

  // Pulse size based on score
  const baseScale = 0.8 + annotation.score / 100 * 0.6;

  // Connector to backbone
  const connLine = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(ox, posY, oz),
      new THREE.Vector3(0, posY, 0),
    ]);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.18 }));
  }, [ox, posY, oz, cfg.color]);

  return (
    <Float speed={1.8} floatIntensity={0.25} rotationIntensity={0}>
      <group>
        <mesh ref={ref} position={[ox, posY, oz]} scale={baseScale} geometry={geo}>
          <meshStandardMaterial
            color={cfg.color}
            emissive={cfg.color}
            emissiveIntensity={annotation.evidenceLevel === 'validated' ? 1.2 : 0.7}
            roughness={0.05}
            metalness={1}
            transparent
            opacity={0.95}
          />
        </mesh>
        {/* Score halo */}
        {annotation.score >= 90 && (
          <mesh position={[ox, posY, oz]} geometry={geo} scale={baseScale * 1.6}>
            <meshBasicMaterial color={cfg.color} transparent opacity={0.06} side={THREE.BackSide} />
          </mesh>
        )}
        <primitive object={connLine} />
      </group>
    </Float>
  );
}

/* ─── CHROMATIN LOOP ARCS (gradient energy arcs) ─────────────── */
function ChromatinLoops({
  annotations, chromosomeSize,
}: {
  annotations: RegulatoryAnnotation[]; chromosomeSize: number;
}) {
  const enhancers = useMemo(() => annotations.filter(a => a.elementType === 'enhancer' || a.elementType === 'super_enhancer'), [annotations]);
  const promoters = useMemo(() => annotations.filter(a => a.elementType === 'promoter'), [annotations]);

  const loops = useMemo(() => {
    const result: { line: THREE.Line; color: string; idx: number }[] = [];
    enhancers.forEach((e, idx) => {
      const near = promoters.find(p => p.tadId === e.tadId);
      if (!near) return;
      const fromY = ((e.positionMb / chromosomeSize) - 0.5) * TUBE_LENGTH;
      const toY = ((near.positionMb / chromosomeSize) - 0.5) * TUBE_LENGTH;
      const arcH = Math.min(Math.abs(toY - fromY) * 0.5, 0.7);
      const pts: THREE.Vector3[] = [];
      const side = (idx % 2 === 0 ? 1 : -1);
      for (let s = 0; s <= 48; s++) {
        const t = s / 48;
        pts.push(new THREE.Vector3(
          side * Math.sin(t * Math.PI) * arcH,
          fromY + (toY - fromY) * t,
          Math.cos(t * Math.PI * 0.5) * arcH * 0.25,
        ));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const c = idx % 2 === 0 ? '#0ae8d2' : '#8b5cf6';
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.18 }));
      result.push({ line, color: c, idx });
    });
    return result;
  }, [enhancers, promoters, chromosomeSize]);

  const groupRef = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
      if (mat?.opacity !== undefined) {
        mat.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.9 + i * 0.7) * 0.1;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {loops.map(({ line }, i) => <primitive key={i} object={line} />)}
    </group>
  );
}

/* ─── ENERGY FLOW PARTICLES ──────────────────────────────────── */
function EnergyFlow({ tubeLength }: { tubeLength: number }) {
  const COUNT = 60;
  const ref = useRef<THREE.Points>(null!);

  const { positions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT);
    const cols = new Float32Array(COUNT * 3);
    const palettes = [[0.04, 0.91, 0.82], [0.55, 0.36, 0.96], [0.23, 0.51, 0.96], [0.98, 0.62, 0]];
    for (let i = 0; i < COUNT; i++) {
      const radiusSeed = pseudoRandom(i + tubeLength);
      const angleSeed = pseudoRandom(i * 2 + tubeLength);
      const ySeed = pseudoRandom(i * 3 + tubeLength);
      const speedSeed = pseudoRandom(i * 4 + tubeLength);
      const directionSeed = pseudoRandom(i * 5 + tubeLength);
      const r = 0.13 + radiusSeed * 0.05;
      const a = angleSeed * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (ySeed - 0.5) * tubeLength;
      pos[i * 3 + 2] = Math.sin(a) * r;
      vel[i] = (0.4 + speedSeed * 0.8) * (directionSeed > 0.5 ? 1 : -1);
      const c = palettes[i % 4];
      cols[i * 3] = c[0]; cols[i * 3 + 1] = c[1]; cols[i * 3 + 2] = c[2];
    }
    return { positions: pos, velocities: vel, colors: cols };
  }, [tubeLength]);

  useFrame(() => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const half = tubeLength / 2;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += velocities[i] * 0.007;
      if (arr[i * 3 + 1] > half) arr[i * 3 + 1] = -half;
      if (arr[i * 3 + 1] < -half) arr[i * 3 + 1] = half;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial vertexColors size={0.022} transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}

/* ─── CENTROMERE (wobble material) ───────────────────────────── */
function Centromere() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.5; });

  return (
    <group>
      {/* Outer ring — small and subtle */}
      <mesh ref={ref}>
        <torusGeometry args={[0.12, 0.015, 16, 48]} />
        <meshStandardMaterial
          color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5}
          roughness={0.1} metalness={0.9} transparent opacity={0.5}
        />
      </mesh>
      {/* Inner constriction with wobble */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
        <MeshWobbleMaterial
          color="#f59e0b"
          factor={0.06}
          speed={2}
          transparent
          opacity={0.25}
          emissive="#f59e0b"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Glow halo — smaller */}
      <mesh>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.025} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/* ─── PULSING TELOMERE CAPS ──────────────────────────────────── */
function Telomeres() {
  const t1 = useRef<THREE.Group>(null!);
  const t2 = useRef<THREE.Group>(null!);
  useFrame((s) => {
    const p = 1 + Math.sin(s.clock.elapsedTime * 2.2) * 0.07;
    if (t1.current) t1.current.scale.setScalar(p);
    if (t2.current) t2.current.scale.setScalar(p);
  });

  return (
    <>
      {([TUBE_LENGTH / 2, -TUBE_LENGTH / 2] as number[]).map((y, i) => (
        <group key={i} ref={i === 0 ? t1 : t2} position={[0, y, 0]}>
          <mesh>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial color="#0ae8d2" emissive="#0ae8d2" emissiveIntensity={0.5}
              transparent opacity={0.4} roughness={0.1} metalness={1} />
          </mesh>
          {/* Two glow shells */}
          {[0.22, 0.32].map((r, j) => (
            <mesh key={j}>
              <sphereGeometry args={[r, 16, 16]} />
              <meshBasicMaterial color="#0ae8d2" transparent opacity={0.04} side={THREE.BackSide} />
            </mesh>
          ))}
          <Sparkles count={12} scale={0.4} size={1.2} speed={0.5} color="#0ae8d2" opacity={0.6} />
        </group>
      ))}
    </>
  );
}

/* ─── GLOW RINGS (multi-axis animated) ───────────────────────── */
function GlowRings() {
  const refA = useRef<THREE.Mesh>(null!);
  const refB = useRef<THREE.Mesh>(null!);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (refA.current) {
      refA.current.rotation.z = t * 0.12;
      refA.current.rotation.x = Math.PI / 2.2 + Math.sin(t * 0.12) * 0.06;
    }
    if (refB.current) {
      refB.current.rotation.z = -t * 0.07;
      refB.current.rotation.x = Math.PI / 3.2 + Math.sin(t * 0.1 + 1) * 0.05;
    }
  });

  return (
    <>
      {/* Inner equatorial ring — teal */}
      <mesh ref={refA} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[1.05, 0.006, 12, 160]} />
        <meshBasicMaterial color="#0ae8d2" transparent opacity={0.22} />
      </mesh>
      {/* Outer inclined ring — violet */}
      <mesh ref={refB} rotation={[Math.PI / 3.2, 0.35, 0]}>
        <torusGeometry args={[1.55, 0.004, 12, 160]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.15} />
      </mesh>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN EXPORTED SCENE
   ────────────────────────────────────────────────────────────── */

export default function ChromosomeScene3D({
  chromosome, tads, annotations,
  activeTadId, hoveredTadId, onHoverTad, onClickTad,
  cameraTargetY, zoomAction,
}: {
  chromosome: ChromosomeInfo;
  tads: TADRegion[];
  annotations: RegulatoryAnnotation[];
  activeTadId: string | null;
  hoveredTadId: string | null;
  onHoverTad: (id: string | null) => void;
  onClickTad: (id: string) => void;
  cameraTargetY: number | null;
  zoomAction: { type: 'in' | 'out' | 'fit' | 'none'; ts: number };
}) {
  const isChromActive = activeTadId !== null;

  return (
    <>
      {/* ── CAMERA RIG ── */}
      <CameraRig targetY={cameraTargetY} zoomAction={zoomAction} />



      {/* ── LIGHTING ── */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 6, 4]} intensity={0.5} color="#e8edf5" />
      <pointLight position={[-3, -2,  2]} intensity={0.6} color="#0ae8d2" distance={12} decay={2} />
      <pointLight position={[ 2, -3, -3]} intensity={0.4} color="#8b5cf6" distance={12} decay={2} />
      <pointLight position={[ 0,  5,  0]} intensity={0.3} color="#3b82f6" distance={10} decay={2} />
      <spotLight position={[-5, 2, -3]} intensity={0.5} color="#0ae8d2" angle={0.25} penumbra={1} castShadow={false} />

      {/* ── ENVIRONMENT (removed — reflections made everything white) ── */}



      {/* ── 4 ANIMATED GLOW RINGS ── */}
      <GlowRings />

      {/* ── CHROMOSOME BACKBONE (Custom GLSL shader) ── */}
      <ChromosomeShell chromosome={chromosome} isActive={isChromActive} />

      {/* ── 400 INSTANCED NUCLEOTIDE BASE PAIRS ── */}
      <BasePairField tubeLength={TUBE_LENGTH} />

      {/* ── CENTROMERE (wobble material + torus) ── */}
      <Centromere />

      {/* ── PULSING TELOMERES WITH SPARKLES ── */}
      <Telomeres />

      {/* ── TAD SEGMENTS WITH BOUNDARY RINGS ── */}
      {tads.map((tad) => (
        <TADSegment
          key={tad.id}
          tad={tad}
          chromosomeSize={chromosome.sizeMb}
          isActive={activeTadId === tad.id}
          isHovered={hoveredTadId === tad.id}
          onHover={onHoverTad}
          onClick={onClickTad}
        />
      ))}

      {/* ── ANNOTATION MARKERS (unique geometry per type) ── */}
      {annotations.map((ann) => (
        <AnnotationMarker
          key={ann.id}
          annotation={ann}
          chromosomeSize={chromosome.sizeMb}
        />
      ))}

      {/* ── SUPER-ENHANCER SPARKLE HALOS ── */}
      {annotations
        .filter(a => a.elementType === 'super_enhancer')
        .map((ann) => (
          <SuperEnhancerHalo key={ann.id} annotation={ann} chromosomeSize={chromosome.sizeMb} />
        ))}

      {/* ── CHROMATIN LOOP ARCS ── */}
      <ChromatinLoops annotations={annotations} chromosomeSize={chromosome.sizeMb} />

      {/* ── MULTI-COLOR ENERGY FLOW PARTICLES ── */}
      <EnergyFlow tubeLength={TUBE_LENGTH} />

      {/* ── 3D FLOATING GENE LABELS (troika-three-text) ── */}
      {annotations.map((ann) => (
        <GeneLabel
          key={ann.id}
          annotation={ann}
          chromosomeSize={chromosome.sizeMb}
          active={activeTadId === ann.tadId}
        />
      ))}
    </>
  );
}
