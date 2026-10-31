import { motion } from 'framer-motion';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  icon: string;
}

export default function PlaceholderPage({ title, subtitle, icon }: PlaceholderPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6"
    >
      <div className="glass-panel p-12 text-center max-w-lg">
        <div className="text-6xl mb-6">{icon}</div>
        <h1 className="text-3xl font-bold mb-3 gradient-text">{title}</h1>
        <p className="text-rg-text-secondary text-lg">{subtitle}</p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rg-teal-500 pulse-glow" />
          <span className="text-rg-text-muted text-sm font-mono">Module loading...</span>
        </div>
      </div>
    </motion.div>
  );
}
