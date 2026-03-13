import { motion } from 'framer-motion'
import { Sliders, Cpu, Shield, Globe, Plus, Minus } from 'lucide-react'
import { useStore } from '../store/useStore'

const Slider = ({
    icon: Icon,
    label,
    value,
    min,
    max,
    step,
    color,
    displayValue,
    onChange,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    color: string;
    displayValue: string;
    onChange: (v: number) => void;
}) => {
    const pct = ((value - min) / (max - min)) * 100;

    return (
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color }} />
                    <span className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">{label}</span>
                </div>
                <span className="text-xs font-mono text-primary">{displayValue}</span>
            </div>

            {/* Custom range slider */}
            <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-visible group/slider cursor-pointer">
                <motion.div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.15 }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="nodrag absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                />
            </div>

            {/* Increment/decrement buttons */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(3))))}
                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                    <Minus className="w-3 h-3 text-muted-foreground" />
                </button>
                <span className="text-[9px] text-muted-foreground/40 font-mono">
                    {min} – {max}
                </span>
                <button
                    onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(3))))}
                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                    <Plus className="w-3 h-3 text-muted-foreground" />
                </button>
            </div>
        </div>
    )
}

export const Sidebar = () => {
    const { modelSettings, setTemperature, setMaxTokens, setTopP } = useStore()

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
                    <Slider
                        icon={Cpu}
                        label="Temperatura"
                        value={modelSettings.temperature}
                        min={0}
                        max={1}
                        step={0.01}
                        color="#6366f1"
                        displayValue={modelSettings.temperature.toFixed(2)}
                        onChange={setTemperature}
                    />
                    <Slider
                        icon={Shield}
                        label="Max Tokens"
                        value={modelSettings.maxTokens}
                        min={512}
                        max={8192}
                        step={128}
                        color="#8b5cf6"
                        displayValue={modelSettings.maxTokens.toString()}
                        onChange={setMaxTokens}
                    />
                    <Slider
                        icon={Globe}
                        label="Top-P"
                        value={modelSettings.topP}
                        min={0}
                        max={1}
                        step={0.01}
                        color="#ec4899"
                        displayValue={modelSettings.topP.toFixed(2)}
                        onChange={setTopP}
                    />
                </div>

                {/* Network Health mini-chart */}
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

                {/* Settings summary */}
                <div className="rounded-2xl bg-black/20 border border-white/5 p-3 space-y-1">
                    <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-2">Configuración activa</p>
                    <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground/60">Temperatura</span>
                        <span className="font-mono text-indigo-400">{modelSettings.temperature.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground/60">Max Tokens</span>
                        <span className="font-mono text-purple-400">{modelSettings.maxTokens}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground/60">Top-P</span>
                        <span className="font-mono text-pink-400">{modelSettings.topP.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={() => {
                        // Reset a defaults
                        setTemperature(0.72);
                        setMaxTokens(4096);
                        setTopP(0.95);
                    }}
                >
                    Restaurar defaults
                </button>
            </div>
        </div>
    )
}
