import React from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { ArchiveItem } from '../types';
import { archiveService } from '../services/archiveService';
import { FileText, Music, Film, Database, Share2, Trash2, ShieldPlus } from 'lucide-react';

interface DossierCardProps {
  item: ArchiveItem;
  onSelect: (item: ArchiveItem) => void;
  onVault: (item: ArchiveItem) => void;
  onRedact: (identifier: string) => void;
}

export const DossierCard: React.FC<DossierCardProps> = ({ item, onSelect, onVault, onRedact }) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);
  const vaultOpacity = useTransform(x, [0, 50], [0, 1]);
  const redactOpacity = useTransform(x, [-50, 0], [1, 0]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'texts': return <FileText size={14} />;
      case 'audio': return <Music size={14} />;
      case 'movies': return <Film size={14} />;
      default: return <Database size={14} />;
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onVault(item);
    } else if (info.offset.x < -100) {
      onRedact(item.identifier);
    }
  };

    const creatorString = Array.isArray(item.creator) ? item.creator[0] : item.creator;
    const creatorInitial = creatorString?.substring(0, 1).toUpperCase() || '?';
    const creatorDisplay = creatorString || 'UNKNOWN_SOURCE';

    const dateString = Array.isArray(item.date) ? item.date[0] : item.date;
    const dateDisplay = dateString?.substring(0, 4) || 'N/A';

    return (
      <div className="relative mb-8 overflow-hidden rounded-xl">
        {/* Swipe Action Backgrounds */}
        <div className="absolute inset-0 flex items-center justify-between px-10 pointer-events-none">
          <motion.div style={{ opacity: vaultOpacity }} className="flex flex-col items-center text-neon-cyan">
            <ShieldPlus size={32} className="mb-2" />
            <span className="font-mono text-[10px] font-bold tracking-widest">VAULT</span>
          </motion.div>
          <motion.div style={{ opacity: redactOpacity }} className="flex flex-col items-center text-red-500">
            <Trash2 size={32} className="mb-2" />
            <span className="font-mono text-[10px] font-bold tracking-widest">REDACT</span>
          </motion.div>
        </div>
  
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          style={{ x, opacity }}
          className="relative glass neon-border flex flex-col overflow-hidden"
        >
          {/* Card Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full glass border border-neon-cyan/30 flex items-center justify-center">
                <span className="font-mono text-[10px] text-neon-cyan">{creatorInitial}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-xs text-white/90 truncate max-w-[150px]">
                  {creatorDisplay}
                </span>
                <span className="font-mono text-[8px] text-white/30 tracking-widest uppercase">
                  NODE: {item.identifier.substring(0, 8)}
                </span>
              </div>
            </div>
            <div className="p-1.5 glass rounded text-neon-cyan/60">
              {getIcon(item.mediatype)}
            </div>
          </div>

        {/* Media Section */}
        <div 
          onClick={() => onSelect(item)}
          className="relative aspect-square w-full bg-black/40 overflow-hidden group cursor-pointer"
        >
          <img 
            src={archiveService.getItemImageUrl(item.identifier)} 
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
          />
          
          {/* Scanning Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            <div className="scanning-line" />
          </div>

          <div className="absolute bottom-3 right-3 glass px-2 py-1 rounded text-[8px] font-mono text-neon-cyan tracking-widest uppercase">
            {item.mediatype}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 flex items-center space-x-4">
          <button 
            onClick={() => onVault(item)}
            className="text-white/60 hover:text-neon-cyan transition-colors"
          >
            <ShieldPlus size={22} />
          </button>
          <button 
            onClick={() => onSelect(item)}
            className="text-white/60 hover:text-neon-cyan transition-colors"
          >
            <Share2 size={20} />
          </button>
          <div className="flex-1" />
          <button 
            onClick={() => onRedact(item.identifier)}
            className="text-white/20 hover:text-red-500 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Content Section */}
        <div className="px-4 pb-4 space-y-2">
          <div className="flex flex-col">
            <h3 className="font-sans font-bold text-sm text-white/95">
              {item.title}
            </h3>
            <p className="font-sans text-[11px] text-white/50 line-clamp-2 mt-1 leading-relaxed">
              <span className="font-mono text-neon-cyan/60 mr-1">REPORT:</span>
              {item.description || 'No intelligence report available for this dossier.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="font-mono text-[8px] text-white/20 uppercase">DATE:</span>
                <span className="font-mono text-[8px] text-white/60 uppercase">{dateDisplay}</span>
              </div>
            </div>
            <span className="font-mono text-[8px] text-neon-cyan/40 uppercase tracking-tighter">
              SECURE_LINK_ESTABLISHED
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
