import { motion } from 'framer-motion'
import { Sliders, Cpu, Shield, Globe, Activity } from 'lucide-react'

const Parameter = ({ icon: Icon, label, value, color }: any) => (
  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-mono text-primary">{value}</span>
    </div>
    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
      <motion.div 
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: "70%" }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
)

export const Sidebar = () => {
  return (
    <div className="w-80 flex flex-col gap-6">
      <div className="p-6 glass-card rounded-3xl border border-white/5 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Configuración</h2>
          </div>
          <div className="px-2 py-1 rounded bg-primary/10 text-[10px] font-bold text-primary uppercase">v2.4.0</div>
        </div>

        <div className="flex flex-col gap-4">
          <Parameter icon={Cpu} label="Temp" value="0.72" color="#6366f1" />
          <Parameter icon={Shield} label="Tokens" value="4096" color="#8b5cf6" />
          <Parameter icon={Globe} label="Top-P" value="0.95" color="#ec4899" />
          <Parameter icon={Activity} label="Latency" value="120ms" color="#10b981" />
        </div>

        <div className="h-40 relative rounded-2xl overflow-hidden bg-black/40 border border-white/5 p-4 flex flex-col justify-end">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.05)_20px,rgba(255,255,255,0.05)_21px)]" />
          </div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Network Health</p>
          <div className="flex items-end gap-1 h-12">
            {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-primary/40 rounded-t-sm"
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />
            ))}
          </div>
        </div>

        <button className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all">
          Guardar Cambios
        </button>
      </div>
    </div>
  )
}
