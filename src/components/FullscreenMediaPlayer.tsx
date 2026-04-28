import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';
import { ArchiveItem } from '../types';
import { archiveService } from '../services/archiveService';

interface FullscreenMediaPlayerProps {
  item: ArchiveItem;
  onClose: () => void;
}

export const FullscreenMediaPlayer: React.FC<FullscreenMediaPlayerProps> = ({ item, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen?.();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Fullscreen request failed:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Exit fullscreen failed:', err);
      }
    }
  };

  // Handle escape key to exit fullscreen
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black via-black/50 to-transparent">
        <div className="flex flex-col">
          <h2 className="text-white font-bold text-lg line-clamp-1">{item.title}</h2>
          <p className="text-white/60 text-xs font-mono">{item.mediatype?.toUpperCase()}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Toggle fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize2 size={20} className="text-white" />
            ) : (
              <Maximize2 size={20} className="text-white" />
            )}
          </button>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Close (ESC)"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Media Container */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
            <div className="w-12 h-12 border-2 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin mb-4" />
            <span className="font-mono text-sm text-neon-cyan uppercase animate-pulse tracking-[0.2em]">
              Decrypting Stream...
            </span>
          </div>
        )}

        <iframe
          src={archiveService.getEmbedUrl(item.identifier)}
          className="w-full h-full border-none"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/50 to-transparent">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-xs line-clamp-2 mb-2">{item.description}</p>
            <div className="flex items-center space-x-4 text-[10px] font-mono text-white/60">
              <span>{item.year}</span>
              {item.creator && <span>By: {item.creator}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Hints */}
      <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/40 space-y-1 text-right">
        <div>ESC to close</div>
        <div>F to fullscreen</div>
      </div>
    </motion.div>
  );
};
