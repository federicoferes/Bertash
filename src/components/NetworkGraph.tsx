import { motion } from 'framer-motion'
import { Brain, Zap, MessageSquare, Database, Share2 } from 'lucide-react'

const nodes = [
  { id: 1, x: 200, y: 150, icon: Brain, label: 'LLM Node', color: '#6366f1' },
  { id: 2, x: 450, y: 100, icon: Database, label: 'Knowledge Base', color: '#8b5cf6' },
  { id: 3, x: 150, y: 400, icon: MessageSquare, label: 'User Input', color: '#ec4899' },
  { id: 4, x: 600, y: 350, icon: Zap, label: 'Action Output', color: '#f59e0b' },
  { id: 5, x: 400, y: 300, icon: Share2, label: 'Router', color: '#10b981' },
]

const links = [
  { from: 1, to: 2 },
  { from: 1, to: 5 },
  { from: 3, to: 5 },
  { from: 5, to: 4 },
  { from: 2, to: 4 },
]

export const NetworkGraph = () => {
  return (
    <div className="relative w-full h-[600px] glass-card rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
      
      <svg className="w-full h-full">
        {links.map((link, i) => {
          const fromNode = nodes.find(n => n.id === link.from)!
          const toNode = nodes.find(n => n.id === link.to)!
          return (
            <motion.line
              key={i}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="url(#lineGradient)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.2 }}
              transition={{ duration: 1.5, delay: i * 0.2 }}
            />
          )
        })}
        <defs>
          <linearGradient id="lineGradient" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="50%" stopColor="rgba(99,102,241,0.5)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
        </defs>
      </svg>

      {nodes.map((node) => {
        const Icon = node.icon
        return (
          <motion.div
            key={node.id}
            drag
            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
            dragElastic={0.1}
            className="absolute cursor-grab active:cursor-grabbing group"
            style={{ left: node.x, top: node.y }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: node.id * 0.1 }}
          >
            <div className="relative">
              <div 
                className="absolute inset-0 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: node.color }}
              />
              <div 
                className="relative w-16 h-16 rounded-2xl flex items-center justify-center glass border border-white/10 shadow-2xl transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${node.color}10` }}
              >
                <Icon className="w-8 h-8" style={{ color: node.color }} />
              </div>
              <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-medium text-muted-foreground bg-black/40 px-2 py-1 rounded-md backdrop-blur-md border border-white/5">
                  {node.label}
                </span>
              </div>
            </div>
          </motion.div>
        )
      })}

      <div className="absolute bottom-6 left-6 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground/80">Interactive Neural Web</h3>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          Drag nodes to reorganize the architecture. Right-click to configure parameters.
        </p>
      </div>
      
      <div className="absolute top-6 right-6 flex gap-2">
        <button className="px-4 py-2 glass rounded-full text-xs font-medium hover:bg-white/5 transition-colors">
          Auto-Layout
        </button>
        <button className="px-4 py-2 bg-primary text-white rounded-full text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          Deploy Network
        </button>
      </div>
    </div>
  )
}
