import { Skeleton, GlassCard } from './index';

// === Card Skeletons ===
export function StatCardSkeleton() {
  return (
    <GlassCard className="p-6">
      <Skeleton className="w-8 h-8 rounded-lg mb-4" />
      <Skeleton className="w-24 h-4 mb-2" />
      <Skeleton className="w-32 h-8" />
    </GlassCard>
  );
}

export function ContentCardSkeleton() {
  return (
    <GlassCard className="p-6">
      <Skeleton className="w-1/3 h-6 mb-4" />
      <div className="space-y-3">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-5/6 h-4" />
        <Skeleton className="w-4/6 h-4" />
      </div>
    </GlassCard>
  );
}

// === Table Skeletons ===
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 px-6 border-b border-rg-border/50">
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-32 h-4" />
      <Skeleton className="w-16 h-6 rounded-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-3 px-6 bg-rg-bg-hover/30 border-y border-rg-border">
        <Skeleton className="w-24 h-3 bg-white/5" />
        <Skeleton className="w-full h-3 bg-white/5" />
        <Skeleton className="w-32 h-3 bg-white/5" />
        <Skeleton className="w-16 h-3 bg-white/5" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
}

// === Chart Skeletons ===
export function ChartSkeleton({ height = '300px' }: { height?: string }) {
  return (
    <div className="w-full flex items-end justify-between gap-2 p-6" style={{ height }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${Math.max(20, Math.random() * 100)}%`, opacity: 0.2 + (Math.random() * 0.5) }}
        />
      ))}
    </div>
  );
}

export function NetworkSkeleton() {
  return (
    <div className="w-full h-[600px] relative flex shadow-inner items-center justify-center overflow-hidden">
        {/* Glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rg-teal-500/10 blur-[100px] rounded-full" />
        
        {/* Central Node */}
        <Skeleton rounded="full" className="w-16 h-16 absolute z-10" />
        
        {/* Surrounding Nodes */}
        {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 120 + Math.random() * 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
                <div key={i} className="absolute" style={{ transform: `translate(${x}px, ${y}px)` }}>
                    <Skeleton rounded="full" className="w-10 h-10" />
                </div>
            )
        })}
    </div>
  )
}
