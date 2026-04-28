import React from 'react';
import { motion } from 'motion/react';
import { Archive, Search, Shield, User, Film } from 'lucide-react';
import { ViewType } from '../types';

interface BottomNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onReelsClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange, onReelsClick }) => {
  const navItems = [
    { id: 'dossier', icon: Archive, label: 'DOSSIER' },
    { id: 'explore', icon: Search, label: 'EXPLORE' },
    { id: 'vault', icon: Shield, label: 'VAULT' },
    { id: 'profile', icon: User, label: 'PROFILE' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 safe-pb z-40">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className="relative flex flex-col items-center justify-center w-16 h-full group"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-lg transition-colors ${
                  isActive ? 'text-neon-cyan' : 'text-white/40 group-hover:text-white/60'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              
              <span className={`font-mono text-[8px] tracking-tighter transition-colors ${
                isActive ? 'text-neon-cyan' : 'text-white/20'
              }`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute -top-1 w-8 h-[2px] bg-neon-cyan shadow-[0_0_10px_#00f2ff]"
                />
              )}
            </button>
          );
        })}
        
        {/* Reels Button */}
        {onReelsClick && (
          <button
            onClick={onReelsClick}
            className="relative flex flex-col items-center justify-center w-16 h-full group"
            title="Open Reels"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg transition-colors text-white/40 group-hover:text-white/60"
            >
              <Film size={24} strokeWidth={2} />
            </motion.div>
            
            <span className="font-mono text-[8px] tracking-tighter transition-colors text-white/20">
              REELS
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
