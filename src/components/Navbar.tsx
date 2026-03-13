import { Brain, Layout, Play, Settings, Bell, Search, Plus } from 'lucide-react';

const NavItem = ({ icon: Icon, label, active = false }: any) => (
  <div className={`
    flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all
    ${active ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground/70 hover:text-foreground hover:bg-white/5'}
  `}>
    <Icon className="w-4 h-4" />
    <span className="text-sm font-semibold tracking-tight">{label}</span>
  </div>
)

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-background/60 backdrop-blur-2xl z-[100] flex items-center justify-between px-8">
            <div className="flex items-center gap-10">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-110 transition-all duration-500">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-black text-2xl tracking-tighter text-gradient uppercase">
                        Bertash
                    </span>
                </div>

                <div className="hidden lg:flex items-center gap-2">
                    <NavItem icon={Layout} label="Dashboard" active />
                    <NavItem icon={Play} label="Procesos" />
                    <NavItem icon={Plus} label="Integrar" />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative hidden xl:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <input 
                        type="text" 
                        placeholder="Buscar componente..." 
                        className="bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-sm w-72 focus:outline-none focus:bg-white/10 focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors relative">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                        <Settings className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    <div className="h-8 w-[1px] bg-white/5 mx-2" />

                    <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-foreground">Federico F.</span>
                            <span className="text-[10px] font-mono text-primary uppercase">Pro Version</span>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-400 p-[1px]">
                            <div className="w-full h-full rounded-[14px] bg-background overflow-hidden">
                                <img src="https://ui-avatars.com/api/?name=Federico+Feres&background=6366f1&color=fff" className="w-full h-full object-cover" alt="User" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
