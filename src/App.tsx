import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NetworkGraph } from './components/NetworkGraph';
import { motion } from 'framer-motion';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/30">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)]" />
      </div>

      <Navbar />
      
      <main className="pt-24 pb-12 px-8 flex gap-8 items-start max-w-[1600px] mx-auto relative z-10">
        <div className="flex-1 flex flex-col gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <h1 className="text-4xl font-bold tracking-tight text-gradient">Dashboard General</h1>
            <p className="text-muted-foreground text-lg">Visualiza y gestiona tus redes de conocimiento neuronal en tiempo real.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <NetworkGraph />
          </motion.div>

          <footer className="mt-8 flex gap-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span>Sistemas Activos</span>
            </div>
            <span>•</span>
            <span>Uptime: 99.9%</span>
            <span>•</span>
            <span>Región: AWS-US-EAST</span>
          </footer>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Sidebar />
        </motion.div>
      </main>
    </div>
  );
}

export default App;
