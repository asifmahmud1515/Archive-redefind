import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, FileText, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { ArchiveItem } from '../types';
import { archiveService } from '../services/archiveService';

interface MediaPlayerProps {
  item: ArchiveItem;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ item }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <div className="relative w-full bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10">
            <Loader2 className="text-neon-cyan animate-spin mb-4" size={32} />
            <span className="font-mono text-[10px] text-neon-cyan uppercase tracking-[0.3em] animate-pulse">
              Decrypting Stream...
            </span>
          </div>
        )}
        
        <div className={`${item.mediatype === 'texts' ? 'h-[600px]' : 'aspect-video'} w-full`}>
          <iframe
            src={archiveService.getEmbedUrl(item.identifier)}
            className="w-full h-full border-none"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Scanning Overlay Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-[8px] text-white/40 uppercase tracking-widest">
            Live Decryption Protocol Active
          </span>
        </div>
        <button 
          onClick={() => window.open(archiveService.getDetailsUrl(item.identifier), '_blank')}
          className="font-mono text-[8px] text-neon-cyan hover:underline uppercase tracking-widest flex items-center"
        >
          Source Terminal <ExternalLink size={8} className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
};
