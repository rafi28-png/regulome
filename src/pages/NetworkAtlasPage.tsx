import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import {
  Network,
  Search,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Info,
  RefreshCcw,
} from 'lucide-react';
import {
  GlassCard,
  Input,
  NetworkSkeleton,
  StatCardSkeleton,
  ErrorState,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import {
  networkNodes,
  networkEdges,
  networkStats,
  nodeColors,
  nodeIcons,
  nodeTypeLabels,
  edgeColors,
  type NetworkNode,
  type NetworkEdge,
  type NodeType,
} from '@/data/networkAtlasData';

/* =============================================
   ReguloMe — Network Atlas  (GOD-MODE)
   ============================================= */

const ease = [0.22, 0.61, 0.36, 1] as [number, number, number, number];

const stagger = {
  container: { initial: {}, animate: { transition: { staggerChildren: 0.09 } } },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
  },
};

/* ── D3 Simulation types ── */
interface SimNode extends NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
}

interface SimEdge {
  source: SimNode;
  target: SimNode;
  type: string;
  weight: number;
}

/* ── Force Graph Component (GOD-MODE) ── */
function ForceGraph({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  visibleTypes,
}: {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  selectedNode: string | null;
  onSelectNode: (id: string | null) => void;
  visibleTypes: Set<NodeType>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimEdge> | null>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgSelRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ x: number; y: number; node: SimNode } | null>(null);

  // Filter nodes/edges by visible types
  const filteredNodes = useMemo(() => nodes.filter((n) => visibleTypes.has(n.type)), [nodes, visibleTypes]);
  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);
  const filteredEdges = useMemo(
    () => edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)),
    [edges, filteredNodeIds]
  );

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svgSelRef.current = svg;
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll('*').remove();

    // ── Premium Defs ──
    const defs = svg.append('defs');

    // Stronger glow filter
    const glowFilter = defs.append('filter').attr('id', 'node-glow').attr('x', '-60%').attr('y', '-60%').attr('width', '220%').attr('height', '220%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'blur');
    glowFilter.append('feComposite').attr('in', 'blur').attr('in2', 'SourceGraphic').attr('operator', 'over');

    // Ambient glow for selected
    const focusGlow = defs.append('filter').attr('id', 'focus-glow').attr('x', '-100%').attr('y', '-100%').attr('width', '300%').attr('height', '300%');
    focusGlow.append('feGaussianBlur').attr('stdDeviation', '12').attr('result', 'blur');
    focusGlow.append('feComposite').attr('in', 'blur').attr('in2', 'SourceGraphic').attr('operator', 'over');

    // Radial gradients for each node type
    Object.entries(nodeColors).forEach(([type, color]) => {
      const grad = defs.append('radialGradient').attr('id', `grad-${type}`);
      grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', '0.9');
      grad.append('stop').attr('offset', '60%').attr('stop-color', color).attr('stop-opacity', '0.5');
      grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', '0.1');
    });

    // Arrow markers for directed edges
    Object.entries(edgeColors).forEach(([type, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -3 8 6')
        .attr('refX', 22)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-3L8,0L0,3')
        .attr('fill', color)
        .attr('fill-opacity', 0.6);
    });

    // Grid background pattern
    const gridPattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 40)
      .attr('height', 40)
      .attr('patternUnits', 'userSpaceOnUse');
    gridPattern.append('path')
      .attr('d', 'M 40 0 L 0 0 0 40')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(56,78,122,0.06)')
      .attr('stroke-width', 0.5);

    // Background grid rect
    svg.append('rect')
      .attr('width', width * 3)
      .attr('height', height * 3)
      .attr('x', -width)
      .attr('y', -height)
      .attr('fill', 'url(#grid)');

    // Main group with zoom
    const g = svg.append('g');
    gRef.current = g;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);
    zoomRef.current = zoom;

    // Center the camera
    svg.call(zoom.transform, d3.zoomIdentity.translate(width * 0.08, height * 0.05).scale(0.88));

    // ── Prepare simulation data ──
    const simNodes: SimNode[] = filteredNodes.map((n) => ({ ...n, x: 0, y: 0, vx: 0, vy: 0, fx: null, fy: null }));
    const simEdges: SimEdge[] = filteredEdges.map((e) => ({
      source: simNodes.find((n) => n.id === e.source)!,
      target: simNodes.find((n) => n.id === e.target)!,
      type: e.type,
      weight: e.weight,
    })).filter((e) => e.source && e.target);

    // ── Simulation with better physics ──
    const sim = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimEdge>(simEdges).id((d) => d.id).distance(90).strength((d) => d.weight * 0.4))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.12))
      .force('collision', d3.forceCollide().radius((d) => (d as SimNode).size * 18 + 8))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04));

    simRef.current = sim;

    // ── Edges ──
    const edgeGroup = g.append('g').attr('class', 'edges');
    const edgeSel = edgeGroup.selectAll('line')
      .data(simEdges)
      .enter()
      .append('line')
      .attr('stroke', (d) => edgeColors[d.type] || '#384e7a')
      .attr('stroke-width', (d) => Math.max(1.5, d.weight * 3))
      .attr('stroke-opacity', 0.45)
      .attr('stroke-dasharray', (d) => d.type === 'associated' || d.type === 'expressed_in' ? '6 4' : 'none')
      .attr('marker-end', (d) => `url(#arrow-${d.type})`);

    // ── Node groups ──
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeSel = nodeGroup.selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('click', (_, d) => {
        onSelectNode(d.id);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode({ x: event.pageX, y: event.pageY, node: d });
      })
      .on('mousemove', (event) => {
        setHoveredNode((prevNode) => prevNode ? { ...prevNode, x: event.pageX, y: event.pageY } : null);
      })
      .on('mouseleave', () => setHoveredNode(null));

    // Ambient outer ring (glow effect)
    nodeSel.append('circle')
      .attr('r', (d) => 16 * d.size)
      .attr('fill', (d) => `url(#grad-${d.type})`)
      .attr('filter', 'url(#node-glow)');

    // Main node circle
    nodeSel.append('circle')
      .attr('r', (d) => 10 * d.size)
      .attr('fill', (d) => nodeColors[d.type])
      .attr('fill-opacity', 0.7)
      .attr('stroke', (d) => nodeColors[d.type])
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.9);

    // Inner bright core
    nodeSel.append('circle')
      .attr('r', (d) => 4 * d.size)
      .attr('fill', '#ffffff')
      .attr('fill-opacity', 0.2);

    // Node icon text
    nodeSel.append('text')
      .text((d) => nodeIcons[d.type])
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', (d) => 10 * d.size)
      .attr('pointer-events', 'none');

    // Labels with background
    const labelGroup = nodeSel.append('g').attr('class', 'label');

    // Label bg rect
    labelGroup.append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'rgba(10,14,26,0.8)')
      .attr('stroke', 'rgba(56,78,122,0.2)')
      .attr('stroke-width', 0.5);

    // Label text
    const labelText = labelGroup.append('text')
      .text((d) => d.label)
      .attr('dy', (d) => 14 * d.size + 16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#c3cedf')
      .attr('font-size', 10)
      .attr('font-weight', 700)
      .attr('letter-spacing', '0.01em')
      .attr('pointer-events', 'none');

    // Size label backgrounds
    labelText.each(function() {
      const bbox = (this as SVGTextElement).getBBox();
      const parent = (this as SVGTextElement).parentNode as SVGGElement;
      d3.select(parent).select('rect')
        .attr('x', bbox.x - 4)
        .attr('y', bbox.y - 2)
        .attr('width', bbox.width + 8)
        .attr('height', bbox.height + 4);
    });

    // ── Tick ──
    sim.on('tick', () => {
      edgeSel
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      nodeSel.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // ── Highlight selected ──
    if (selectedNode) {
      const connectedIds = new Set<string>();
      connectedIds.add(selectedNode);
      simEdges.forEach((e) => {
        if (e.source.id === selectedNode) connectedIds.add(e.target.id);
        if (e.target.id === selectedNode) connectedIds.add(e.source.id);
      });

      // Dim non-connected nodes
      nodeSel.selectAll('circle')
        .attr('opacity', (d) => connectedIds.has((d as SimNode).id) ? 1 : 0.15);

      nodeSel.select('.label')
        .attr('opacity', (d) => connectedIds.has((d as SimNode).id) ? 1 : 0.2);

      // Selected node gets focus glow
      nodeSel.filter((d) => d.id === selectedNode)
        .select('circle:first-child')
        .attr('filter', 'url(#focus-glow)');

      edgeSel
        .attr('stroke-opacity', (d) =>
          d.source.id === selectedNode || d.target.id === selectedNode ? 0.8 : 0.06
        )
        .attr('stroke-width', (d) =>
          d.source.id === selectedNode || d.target.id === selectedNode
            ? Math.max(2.5, d.weight * 4)
            : Math.max(1, d.weight * 2)
        );
    }

    return () => {
      sim.stop();
    };
  }, [filteredNodes, filteredEdges, selectedNode, onSelectNode]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at 40% 40%, rgba(10,232,210,0.04) 0%, rgba(139,92,246,0.02) 30%, rgba(10,14,26,0.6) 80%)',
          borderRadius: 16,
        }}
      />

      {/* ── Zoom Controls Overlay ── */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        display: 'flex', flexDirection: 'column', gap: 6,
        background: 'rgba(10,14,26,0.7)', padding: 6,
        borderRadius: 12, border: '1px solid rgba(56,78,122,0.3)',
        backdropFilter: 'blur(10px)',
      }}>
        <button
          onClick={() => {
            if (zoomRef.current && svgSelRef.current) {
              zoomRef.current.scaleBy(svgSelRef.current.transition().duration(250), 1.4);
            }
          }}
          className="hover:bg-rg-bg-hover text-rg-text-secondary hover:text-rg-text-primary rounded-lg p-2 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => {
            if (zoomRef.current && svgSelRef.current) {
              zoomRef.current.scaleBy(svgSelRef.current.transition().duration(250), 1 / 1.4);
            }
          }}
          className="hover:bg-rg-bg-hover text-rg-text-secondary hover:text-rg-text-primary rounded-lg p-2 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={() => {
            if (zoomRef.current && svgSelRef.current) {
              const width = containerRef.current?.clientWidth || 800;
              const height = containerRef.current?.clientHeight || 560;
              svgSelRef.current.transition().duration(500).call(
                zoomRef.current.transform, 
                d3.zoomIdentity.translate(width * 0.08, height * 0.05).scale(0.88)
              );
            }
          }}
          className="hover:bg-rg-bg-hover text-rg-text-secondary hover:text-rg-text-primary rounded-lg p-2 transition-colors cursor-pointer"
          title="Reset View"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      {/* ── Hover Tooltip (Rich Popup) ── */}
      <AnimatePresence>
        {hoveredNode && (() => {
          const nodeId = hoveredNode.node.id;
          const connections = networkEdges.filter(
            (e) => e.source === nodeId || e.target === nodeId
          );
          const edgeTypeSet = new Set(connections.map((e) => e.type));
          const edgeTypeList = Array.from(edgeTypeSet).slice(0, 3);
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: hoveredNode.y + 16,
                left: hoveredNode.x + 16,
                pointerEvents: 'none',
                zIndex: 50,
                borderRadius: 14,
                background: 'rgba(5,8,16,0.94)',
                border: `1px solid ${nodeColors[hoveredNode.node.type]}40`,
                boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px ${nodeColors[hoveredNode.node.type]}15`,
                backdropFilter: 'blur(20px)',
                maxWidth: 260,
                overflow: 'hidden',
              }}
            >
              {/* Color accent bar */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${nodeColors[hoveredNode.node.type]}, ${nodeColors[hoveredNode.node.type]}40)` }} />

              <div style={{ padding: '12px 16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: `${nodeColors[hoveredNode.node.type]}15`,
                    border: `1px solid ${nodeColors[hoveredNode.node.type]}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>
                    {nodeIcons[hoveredNode.node.type]}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: nodeColors[hoveredNode.node.type], lineHeight: 1.2 }}>
                      {hoveredNode.node.label}
                    </p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {nodeTypeLabels[hoveredNode.node.type]}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                {hoveredNode.node.metadata && (
                  <p style={{ fontSize: 11, color: '#c3cedf', lineHeight: 1.5, marginBottom: 10 }}>
                    {hoveredNode.node.metadata}
                  </p>
                )}

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <div style={{
                    flex: 1, padding: '8px 10px', borderRadius: 8,
                    background: 'rgba(56,78,122,0.15)', border: '1px solid rgba(56,78,122,0.2)',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: '#e8edf5', lineHeight: 1 }}>
                      {connections.length}
                    </p>
                    <p style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                      Connections
                    </p>
                  </div>
                  <div style={{
                    flex: 1, padding: '8px 10px', borderRadius: 8,
                    background: 'rgba(56,78,122,0.15)', border: '1px solid rgba(56,78,122,0.2)',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: '#e8edf5', lineHeight: 1 }}>
                      {edgeTypeSet.size}
                    </p>
                    <p style={{ fontSize: 9, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                      Edge Types
                    </p>
                  </div>
                </div>

                {/* Edge types */}
                {edgeTypeList.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                    {edgeTypeList.map((et) => (
                      <span key={et} style={{
                        fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                        background: `${edgeColors[et as keyof typeof edgeColors] || '#384e7a'}18`,
                        border: `1px solid ${edgeColors[et as keyof typeof edgeColors] || '#384e7a'}30`,
                        color: edgeColors[et as keyof typeof edgeColors] || '#8899b8',
                        textTransform: 'capitalize',
                      }}>
                        {et.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Click hint */}
                <p style={{ fontSize: 9, color: '#4b5a73', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Click to inspect full detail
                </p>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

/* ── Node Detail Panel ── */
function NodeDetailPanel({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const node = networkNodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const connections = networkEdges.filter((e) => e.source === nodeId || e.target === nodeId);
  const connectedNodes = connections.map((e) => {
    const otherId = e.source === nodeId ? e.target : e.source;
    const otherNode = networkNodes.find((n) => n.id === otherId);
    return { edge: e, node: otherNode };
  }).filter((c) => c.node);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
    >
      <GlassCard padding="xl" hover={false} animate={false}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{nodeIcons[node.type]}</span>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: nodeColors[node.type] }}>{node.label}</h4>
              <p style={{ fontSize: 11, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                {nodeTypeLabels[node.type]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#6b7d9c', cursor: 'pointer', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {node.metadata && (
          <p style={{ fontSize: 13, color: '#8899b8', marginBottom: 16, lineHeight: 1.5 }}>{node.metadata}</p>
        )}

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Connections ({connections.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
            {connectedNodes.map((c, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8,
                  background: 'rgba(26,32,53,0.6)', border: '1px solid rgba(56,78,122,0.2)',
                }}
              >
                <span style={{ fontSize: 12 }}>{nodeIcons[c.node!.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: nodeColors[c.node!.type] }}>{c.node!.label}</p>
                  <p style={{ fontSize: 10, color: '#6b7d9c' }}>{c.edge.type} · {(c.edge.weight * 100).toFixed(0)}%</p>
                </div>
                <div style={{
                  width: 24, height: 4, borderRadius: 999,
                  background: 'rgba(10,14,26,0.5)', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${c.edge.weight * 100}%`, height: '100%', borderRadius: 999,
                    background: edgeColors[c.edge.type] || '#384e7a',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ── God-Mode Hero Section ── */
function HeroSection() {
  const stats = [
    { label: 'Nodes', value: networkStats.totalNodes, color: '#e8edf5', icon: <Network size={14} /> },
    { label: 'Edges', value: networkStats.totalEdges, color: '#0ae8d2', icon: <Filter size={14} /> },
    { label: 'Variants', value: networkStats.variants, color: nodeColors.variant, icon: <ZoomIn size={14} /> },
    { label: 'Genes', value: networkStats.genes, color: nodeColors.gene, icon: <Maximize2 size={14} /> },
    { label: 'Connectivity', value: networkStats.avgConnectivity, color: '#f59e0b', icon: <Info size={14} /> },
  ];

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '48px 44px', borderRadius: 28,
      background: 'linear-gradient(135deg, rgba(17,24,39,0.8), rgba(10,14,26,0.9))',
      border: '1px solid rgba(56,78,122,0.18)',
      backdropFilter: 'blur(24px)',
    }}>
      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: -50, right: 100, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,232,210,0.06) 0%, transparent 65%)', filter: 'blur(40px)' }}
      />
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        style={{ position: 'absolute', bottom: -30, left: 80, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)', filter: 'blur(35px)' }}
      />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
          style={{
            width: 60, height: 60, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(10,232,210,0.2), rgba(139,92,246,0.15))',
            border: '1px solid rgba(10,232,210,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(10,232,210,0.08)',
          }}
        >
          <Network size={28} color="#0ae8d2" />
        </motion.div>
        <div>
          <h1 style={{
            fontSize: 42, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #e8edf5 30%, #8899b8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Network Atlas
          </h1>
          <p style={{ fontSize: 15, color: '#8899b8', marginTop: 8, maxWidth: 520 }}>
            Explore the regulatory network connecting variants, transcription factors, genes, and disease phenotypes
          </p>
        </div>
      </div>

      {/* Inline stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, position: 'relative' }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
            style={{
              padding: '18px 12px', textAlign: 'center', borderRadius: 14,
              background: 'rgba(10,14,26,0.5)', border: '1px solid rgba(56,78,122,0.15)',
            }}
          >
            <div style={{ color: s.color, opacity: 0.5, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
            <p style={{ fontSize: 8, color: '#6b7d9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Legend ── */
function NetworkLegend({
  visibleTypes,
  onToggleType,
}: {
  visibleTypes: Set<NodeType>;
  onToggleType: (type: NodeType) => void;
}) {
  const types: NodeType[] = ['variant', 'tf', 'gene', 'pathway', 'disease', 'tissue'];

  return (
    <GlassCard padding="lg" hover={false} animate={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Filter size={14} color="#6b7d9c" />
        <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Node Types</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {types.map((t) => {
          const active = visibleTypes.has(t);
          return (
            <button
              key={t}
              onClick={() => onToggleType(t)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                background: active ? `${nodeColors[t]}10` : 'transparent',
                border: active ? `1px solid ${nodeColors[t]}30` : '1px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s',
                opacity: active ? 1 : 0.4,
              }}
            >
              <span style={{ fontSize: 14 }}>{nodeIcons[t]}</span>
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: active ? nodeColors[t] : '#6b7d9c',
              }}>
                {nodeTypeLabels[t]}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'monospace', color: '#6b7d9c' }}>
                {networkNodes.filter((n) => n.type === t).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Edge legend */}
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(56,78,122,0.15)' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7d9c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Edge Types</p>
        {Object.entries(edgeColors).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 20, height: 2,
              background: color,
              borderTop: type === 'associated' || type === 'expressed_in' ? `2px dashed ${color}` : 'none',
            }} />
            <span style={{ fontSize: 10, color: '#8899b8', textTransform: 'capitalize' }}>{type.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────── */

export default function NetworkAtlasPage() {
  const { isLoading, error, refetch, data: _apiData } = useApi('/network');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleTypes, setVisibleTypes] = useState<Set<NodeType>>(
    new Set(['variant', 'tf', 'gene', 'pathway', 'disease', 'tissue'])
  );

  const toggleType = useCallback((type: NodeType) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  // Filter by search
  const displayNodes = useMemo(() => {
    if (!searchQuery) return networkNodes;
    const q = searchQuery.toLowerCase();
    const matchedIds = new Set(
      networkNodes.filter((n) =>
        n.label.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q) ||
        (n.metadata && n.metadata.toLowerCase().includes(q))
      ).map((n) => n.id)
    );
    // Also include connected nodes
    networkEdges.forEach((e) => {
      if (matchedIds.has(e.source)) matchedIds.add(e.target);
      if (matchedIds.has(e.target)) matchedIds.add(e.source);
    });
    return networkNodes.filter((n) => matchedIds.has(n.id));
  }, [searchQuery]);

  const displayEdges = useMemo(() => {
    const nodeIds = new Set(displayNodes.map((n) => n.id));
    return networkEdges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [displayNodes]);

  if (isLoading) {
    return (
       <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}>
        <div className="grid gap-4 md:grid-cols-5">
           {Array.from({length: 5}).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <GlassCard padding="xl"><div style={{ height: 600 }}><NetworkSkeleton /></div></GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 0' }}>
        <ErrorState message={error.message} onRetry={refetch} />
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}
    >
      {/* ── Hero ── */}
      <motion.div variants={stagger.item}>
        <HeroSection />
      </motion.div>

      {/* ── Search ── */}
      <motion.div variants={stagger.item}>
        <Input
          placeholder="Search nodes by name, type, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={18} />}
          iconRight={
            searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="text-rg-text-muted hover:text-rg-text-primary transition-colors cursor-pointer">
                <X size={14} />
              </button>
            ) : undefined
          }
        />
      </motion.div>

      {/* ── Graph + Sidebar ── */}
      <motion.div variants={stagger.item} style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, minHeight: 560 }}>
        {/* Graph */}
        <GlassCard padding="sm" hover={false} animate={false} className="overflow-hidden">
          <div style={{ width: '100%', height: 560, position: 'relative' }}>
            <ForceGraph
              nodes={displayNodes}
              edges={displayEdges}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
              visibleTypes={visibleTypes}
            />

            {/* Drag hint */}
            <div style={{
              position: 'absolute', bottom: 12, left: 12,
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(10,14,26,0.8)', border: '1px solid rgba(56,78,122,0.2)',
            }}>
              <Info size={10} color="#6b7d9c" />
              <span style={{ fontSize: 10, color: '#6b7d9c' }}>Drag nodes · Scroll to zoom · Click to inspect</span>
            </div>
          </div>
        </GlassCard>

        {/* Sidebar: Legend or Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <NodeDetailPanel
                key="detail"
                nodeId={selectedNode}
                onClose={() => setSelectedNode(null)}
              />
            ) : (
              <motion.div key="legend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NetworkLegend visibleTypes={visibleTypes} onToggleType={toggleType} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
