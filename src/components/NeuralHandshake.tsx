import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, ShieldCheck, Cpu } from 'lucide-react';

interface NeuralHandshakeProps {
  onComplete: () => void;
}

export const NeuralHandshake: React.FC<NeuralHandshakeProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('INITIALIZING NEURAL LINK...');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress > 20) setStatus('DECRYPTING INTERFACE...');
    if (progress > 50) setStatus('ESTABLISHING SECURE VAULT...');
    if (progress > 80) setStatus('SYNCHRONIZING DOSSIERS...');
    if (progress === 100) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-8"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mb-12"
      >
        <Cpu size={80} className="text-neon-cyan" />
      </motion.div>

      <div className="w-full max-w-xs space-y-4">
        <div className="flex justify-between items-end">
          <span className="font-mono text-[10px] text-neon-cyan tracking-widest uppercase">
            {status}
          </span>
          <span className="font-mono text-xs text-neon-cyan">
            {progress}%
          </span>
        </div>
        
        <div className="h-1 w-full bg-white/5 border border-white/10 overflow-hidden">
          <motion.div 
            className="h-full bg-neon-cyan shadow-[0_0_10px_#00f2ff]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-center space-x-4 pt-4">
          <Fingerprint size={20} className={progress > 30 ? "text-neon-cyan" : "text-white/20"} />
          <ShieldCheck size={20} className={progress > 60 ? "text-neon-cyan" : "text-white/20"} />
        </div>
      </div>

      <div className="absolute bottom-12 font-mono text-[8px] text-white/30 tracking-[0.3em] uppercase">
        Archive Neural Interface v1.0.4 // Secure Link
      </div>
    </motion.div>
  );
};
