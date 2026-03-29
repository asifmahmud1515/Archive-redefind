import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Lock, Unlock, ShieldAlert } from 'lucide-react';

interface BiometricHandshakeProps {
  onVerified: () => void;
}

export const BiometricHandshake: React.FC<BiometricHandshakeProps> = ({ onVerified }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsSuccess(true);
      setTimeout(onVerified, 800);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12"
      >
        <div className="w-16 h-16 rounded-full border border-neon-cyan/30 flex items-center justify-center mb-4 mx-auto">
          <Lock size={24} className="text-neon-cyan" />
        </div>
        <h2 className="font-sans font-bold text-xl tracking-tight mb-2 uppercase">
          Vault Access Restricted
        </h2>
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
          Biometric Handshake Required
        </p>
      </motion.div>

      <button
        onClick={handleScan}
        disabled={isScanning || isSuccess}
        className="relative group"
      >
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 -m-4 border-2 border-neon-cyan rounded-full scanning-line"
              style={{ animation: 'scan 1.5s linear infinite', height: 'auto' }}
            />
          )}
        </AnimatePresence>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-32 h-32 rounded-full glass flex items-center justify-center transition-colors ${
            isScanning ? 'border-neon-cyan shadow-[0_0_20px_rgba(0,242,255,0.3)]' : 
            isSuccess ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-white/10'
          }`}
        >
          {isSuccess ? (
            <Unlock size={48} className="text-green-500" />
          ) : (
            <Fingerprint 
              size={48} 
              className={`transition-colors ${isScanning ? 'text-neon-cyan' : 'text-white/20'}`} 
            />
          )}
        </motion.div>

        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -bottom-8 left-0 right-0 font-mono text-[8px] text-neon-cyan uppercase tracking-[0.2em]"
          >
            Scanning Identity...
          </motion.div>
        )}
      </button>

      <div className="mt-24 flex items-center space-x-2 text-white/20">
        <ShieldAlert size={14} />
        <span className="font-mono text-[8px] uppercase tracking-widest">
          Security Protocol Alpha-9
        </span>
      </div>
    </div>
  );
};
