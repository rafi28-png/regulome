import { useState } from 'react';
import {
  Button,
  GlassCard,
  StatCard,
  Badge,
  EvidenceBadge,
  ScoreBadge,
  Input,
  Select,
  ScoreGauge,
  MiniScore,
  Toggle,
  Tabs,
  ProgressBar,
  Skeleton,
  Tooltip,
  Divider,
  SectionHeader,
  DNASpinner,
  PulseLoader,
  GlowDot,
  StaggerContainer,
  StaggerItem,
  Modal,
} from '@/components/ui';
import { Search, Dna, Activity, HeartPulse, FlaskConical, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DesignSystemPage() {
  const [toggleChecked, setToggleChecked] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity size={14} /> },
    { id: 'variants', label: 'Variants', badge: 42 },
    { id: 'expression', label: 'Expression' },
    { id: 'network', label: 'Network' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-12 pb-20"
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold gradient-text mb-2">ReguloMe Design System</h1>
        <p className="text-rg-text-secondary text-lg">Premium component library for regulatory genomics</p>
      </div>

      {/* Buttons */}
      <section>
        <SectionHeader title="Buttons" subtitle="Interactive elements with spring animations" />
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="primary" icon={<Dna size={16} />}>Primary</Button>
          <Button variant="primary" glow>Primary Glow</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="teal" icon={<Zap size={14} />}>Teal</Button>
          <Button variant="purple">Purple</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" size="xs">Tiny</Button>
          <Button variant="primary" size="xl" glow>Extra Large</Button>
        </div>
      </section>

      <Divider />

      {/* Cards */}
      <section>
        <SectionHeader title="Glass Cards" subtitle="Glassmorphism panels with glow variants" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard glow="teal" delay={0}>
            <h3 className="text-lg font-semibold mb-2 text-rg-teal-400">Teal Glow</h3>
            <p className="text-rg-text-secondary text-sm">Glass card with teal accent glow and hover lift effect.</p>
          </GlassCard>
          <GlassCard glow="purple" delay={0.1}>
            <h3 className="text-lg font-semibold mb-2 text-rg-purple-400">Purple Glow</h3>
            <p className="text-rg-text-secondary text-sm">Glass card with purple accent glow and border highlight on hover.</p>
          </GlassCard>
          <GlassCard delay={0.2}>
            <h3 className="text-lg font-semibold mb-2">Neutral</h3>
            <p className="text-rg-text-secondary text-sm">Standard glass card with subtle border and backdrop blur.</p>
          </GlassCard>
        </div>
      </section>

      <Divider />

      {/* Stat Cards */}
      <section>
        <SectionHeader title="Stat Cards" subtitle="Dashboard metric cards with trends" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Regulatory Age"
            value="34.2"
            subtitle="years"
            trend={{ value: -2.1, label: 'vs last month' }}
            glow="teal"
            icon={<HeartPulse size={20} />}
            delay={0}
            invertTrendColor
          />
          <StatCard
            label="High-Impact Variants"
            value="23"
            subtitle="across 8 tissues"
            trend={{ value: 5, label: 'newly classified' }}
            glow="purple"
            icon={<Dna size={20} />}
            delay={0.1}
          />
          <StatCard
            label="Regulatory Burden"
            value="67"
            subtitle="/ 100"
            trend={{ value: -3, label: 'improving' }}
            glow="teal"
            icon={<Activity size={20} />}
            delay={0.2}
            invertTrendColor
          />
          <StatCard
            label="Active Pathways"
            value="142"
            subtitle="monitored"
            trend={{ value: 0, label: 'stable' }}
            glow="none"
            icon={<FlaskConical size={20} />}
            delay={0.3}
          />
        </div>
      </section>

      <Divider />

      {/* Badges */}
      <section>
        <SectionHeader title="Badges" subtitle="Status indicators and evidence levels" />
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="teal" dot>Teal</Badge>
            <Badge variant="purple" dot pulse>Purple Pulse</Badge>
            <Badge variant="success" dot>Success</Badge>
            <Badge variant="warning" dot>Warning</Badge>
            <Badge variant="error" dot>Error</Badge>
            <Badge variant="info" dot>Info</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <EvidenceBadge level="validated" />
            <EvidenceBadge level="literature" />
            <EvidenceBadge level="predicted" />
            <EvidenceBadge level="inferred" />
          </div>
          <div className="flex flex-wrap gap-2">
            <ScoreBadge score={92} />
            <ScoreBadge score={68} />
            <ScoreBadge score={45} />
            <ScoreBadge score={22} />
          </div>
        </div>
      </section>

      <Divider />

      {/* Score Gauges */}
      <section>
        <SectionHeader title="Score Gauges" subtitle="Circular progress indicators with glow" />
        <div className="mt-4 flex flex-wrap items-end gap-8 justify-center">
          <ScoreGauge value={78} label="RVIS Score" subtitle="Regulatory impact" size="lg" color="gradient" delay={0} />
          <ScoreGauge value={92} label="Pathway Support" subtitle="Diet & sleep" size="md" color="teal" delay={0.2} />
          <ScoreGauge value={34} label="Risk Burden" subtitle="Cardiovascular" size="md" color="auto" delay={0.4} />
          <ScoreGauge value={56} label="Network Score" subtitle="Balanced" size="sm" color="purple" delay={0.6} />
        </div>
        <div className="mt-6 max-w-md">
          <p className="text-sm text-rg-text-muted mb-2">Mini Score Bars:</p>
          <div className="space-y-2">
            <MiniScore value={85} />
            <MiniScore value={62} />
            <MiniScore value={38} />
            <MiniScore value={15} />
          </div>
        </div>
      </section>

      <Divider />

      {/* Inputs */}
      <section>
        <SectionHeader title="Inputs" subtitle="Form elements with dark theme" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <Input label="Gene Search" placeholder="e.g., BRCA1, TP53" icon={<Search size={16} />} />
          <Input label="Chromosome" placeholder="chr1" hint="Use format: chr1–chr22, chrX, chrY" />
          <Input label="Position" placeholder="e.g. 12345678" hint="Zero-based genomic coordinate" />
          <Select
            label="Genome Build"
            placeholder="Select build"
            options={[
              { value: 'hg38', label: 'GRCh38 / hg38' },
              { value: 'hg19', label: 'GRCh37 / hg19' },
            ]}
          />
        </div>
      </section>

      <Divider />

      {/* Tabs & Toggle */}
      <section>
        <SectionHeader title="Tabs & Toggle" subtitle="Navigation controls" />
        <div className="mt-4 space-y-6">
          <div>
            <p className="text-xs text-rg-text-muted mb-2">Underline Tabs:</p>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />
          </div>
          <div>
            <p className="text-xs text-rg-text-muted mb-2">Pill Tabs:</p>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />
          </div>
          <div className="flex gap-6">
            <Toggle checked={toggleChecked} onChange={setToggleChecked} label="Enable real-time updates" />
            <Toggle checked={!toggleChecked} onChange={() => setToggleChecked(!toggleChecked)} label="Demo mode" size="sm" />
          </div>
        </div>
      </section>

      <Divider />

      {/* Progress Bars */}
      <section>
        <SectionHeader title="Progress Bars" subtitle="Pipeline step indicators" />
        <div className="mt-4 max-w-lg space-y-4">
          <ProgressBar value={100} color="teal" label="VCF Upload" showValue />
          <ProgressBar value={100} color="teal" label="Validation" showValue />
          <ProgressBar value={75} color="gradient" label="Regulatory Mapping" showValue />
          <ProgressBar value={30} color="purple" label="Network Assembly" showValue />
          <ProgressBar value={0} color="teal" label="Report Generation" showValue />
        </div>
      </section>

      <Divider />

      {/* Loaders */}
      <section>
        <SectionHeader title="Loaders & Animations" subtitle="DNA-themed loading states" />
        <div className="mt-4 flex items-center gap-12">
          <div className="text-center">
            <DNASpinner size={48} />
            <p className="text-xs text-rg-text-muted mt-2">DNA Spinner</p>
          </div>
          <div className="text-center">
            <PulseLoader size={40} />
            <p className="text-xs text-rg-text-muted mt-2">Pulse Loader</p>
          </div>
          <div className="text-center flex flex-col items-center gap-2">
            <div className="flex gap-3">
              <GlowDot color="teal" />
              <GlowDot color="purple" />
              <GlowDot color="success" />
              <GlowDot color="error" />
              <GlowDot color="warning" />
            </div>
            <p className="text-xs text-rg-text-muted">Glow Dots</p>
          </div>
        </div>
      </section>

      <Divider />

      {/* Skeletons */}
      <section>
        <SectionHeader title="Skeleton Loaders" subtitle="Content loading placeholders" />
        <div className="mt-4 max-w-md space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton width="40px" height="40px" rounded="full" />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height="14px" />
              <Skeleton width="40%" height="12px" />
            </div>
          </div>
          <Skeleton height="120px" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton height="80px" />
            <Skeleton height="80px" />
            <Skeleton height="80px" />
          </div>
        </div>
      </section>

      <Divider />

      {/* Tooltips */}
      <section>
        <SectionHeader title="Tooltips" subtitle="Hover information overlays" />
        <div className="mt-4 flex gap-6">
          <Tooltip content="Regulatory Variant Impact Score">
            <Button variant="outline" size="sm">Hover me (top)</Button>
          </Tooltip>
          <Tooltip content="View variant details" side="bottom">
            <Button variant="ghost" size="sm">Hover (bottom)</Button>
          </Tooltip>
          <Tooltip content="rs123456789" side="right">
            <Badge variant="teal" dot>rs ID</Badge>
          </Tooltip>
        </div>
      </section>

      <Divider />

      {/* Stagger Animation */}
      <section>
        <SectionHeader title="Stagger Animation" subtitle="Sequential entrance effects" />
        <StaggerContainer className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Enhancer', 'Promoter', 'Silencer', 'Insulator', 'TFBS', 'CTCF', 'Super Enhancer', 'LCR'].map((el) => (
            <StaggerItem key={el}>
              <GlassCard animate={false} padding="sm" className="text-center">
                <p className="text-sm font-medium text-rg-teal-400">{el}</p>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <Divider />

      {/* Modal */}
      <section>
        <SectionHeader title="Modal" subtitle="Overlay dialogs" />
        <div className="mt-4">
          <Button variant="primary" onClick={() => setShowModal(true)}>Open Modal</Button>
        </div>
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Variant Detail" subtitle="chr17:7674220 • TP53 Enhancer Region">
          <div className="space-y-4">
            <div className="flex gap-2">
              <EvidenceBadge level="literature" />
              <Badge variant="teal" dot>High Impact</Badge>
            </div>
            <p className="text-sm text-rg-text-secondary">
              This variant disrupts a critical enhancer element upstream of TP53, potentially affecting tumor suppressor regulation across multiple tissues.
            </p>
            <ProgressBar value={82} color="gradient" label="Confidence" showValue />
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-rg-border">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Close</Button>
              <Button variant="primary">View Full Detail</Button>
            </div>
          </div>
        </Modal>
      </section>
    </motion.div>
  );
}
