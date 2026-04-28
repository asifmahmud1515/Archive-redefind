import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Share2, MessageCircle, Bookmark, Loader2, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { ArchiveItem } from '../types';
import { archiveService } from '../services/archiveService';

interface ReelsViewProps {
  items: ArchiveItem[];
  isLoading: boolean;
  onLoadMore: () => void;
  onBack: () => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({ items, isLoading, onLoadMore, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const currentItem = items[currentIndex];

  useEffect(() => {
    // Load saved state from localStorage
    const saved = localStorage.getItem('reels_liked');
    if (saved) setLikedItems(new Set(JSON.parse(saved)));
    const bookmarked = localStorage.getItem('reels_saved');
    if (bookmarked) setSavedItems(new Set(JSON.parse(bookmarked)));
  }, []);

  useEffect(() => {
    // Save liked state
    localStorage.setItem('reels_liked', JSON.stringify(Array.from(likedItems)));
  }, [likedItems]);

  useEffect(() => {
    // Save bookmarks
    localStorage.setItem('reels_saved', JSON.stringify(Array.from(savedItems)));
  }, [savedItems]);

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (!isLoading) {
      onLoadMore();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const toggleLike = () => {
    if (!currentItem) return;
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentItem.identifier)) {
        newSet.delete(currentItem.identifier);
      } else {
        newSet.add(currentItem.identifier);
      }
      return newSet;
    });
  };

  const toggleSave = () => {
    if (!currentItem) return;
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentItem.identifier)) {
        newSet.delete(currentItem.identifier);
      } else {
        newSet.add(currentItem.identifier);
      }
      return newSet;
    });
  };

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-40">
        <Loader2 className="text-neon-cyan animate-spin mb-4" size={32} />
        <span className="font-mono text-sm text-neon-cyan uppercase animate-pulse">Loading Reels...</span>
        <button
          onClick={onBack}
          className="mt-8 px-6 py-2 border border-white/20 rounded hover:border-neon-cyan hover:text-neon-cyan transition-colors font-mono text-xs uppercase"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#050505] z-40 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onBack}
          className="p-2 glass rounded-full hover:bg-white/20 transition-colors"
          title="Exit Reels"
        >
          <ChevronUp size={20} className="text-white" />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 right-4 z-10 font-mono text-xs text-white/60">
        {currentIndex + 1} / {items.length}
      </div>

      {/* Main Reel Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem?.identifier}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="flex-1 flex items-center justify-center relative overflow-hidden"
        >
          {/* Background Blur */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />

          {/* Media */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="aspect-video w-full max-w-2xl h-full max-h-screen rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <iframe
                src={archiveService.getEmbedUrl(currentItem.identifier)}
                className="w-full h-full border-none"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-white font-bold text-xl mb-2 line-clamp-2">{currentItem.title}</h3>
              <p className="text-white/70 text-sm mb-4 line-clamp-3">{currentItem.description}</p>
              
              <div className="flex items-center space-x-4 text-xs font-mono text-white/60">
                <span>{currentItem.mediatype?.toUpperCase()}</span>
                <span>•</span>
                <span>{currentItem.year}</span>
                {currentItem.creator && (
                  <>
                    <span>•</span>
                    <span>{currentItem.creator}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-1/2 translate-y-1/2 flex flex-col items-center space-y-6">
        {/* Like Button */}
        <button
          onClick={toggleLike}
          className="group flex flex-col items-center"
        >
          <div className={`p-3 rounded-full transition-all duration-200 ${
            likedItems.has(currentItem?.identifier || '') 
              ? 'bg-red-500/20 scale-110' 
              : 'glass hover:bg-white/20'
          }`}>
            <Heart
              size={24}
              className={`transition-colors ${
                likedItems.has(currentItem?.identifier || '') 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-white'
              }`}
            />
          </div>
          <span className="text-[10px] text-white/60 mt-2 font-mono">
            {likedItems.has(currentItem?.identifier || '') ? 'Liked' : 'Like'}
          </span>
        </button>

        {/* Comment Button */}
        <button className="group flex flex-col items-center">
          <div className="p-3 glass rounded-full hover:bg-white/20 transition-all">
            <MessageCircle size={24} className="text-white" />
          </div>
          <span className="text-[10px] text-white/60 mt-2 font-mono">Share</span>
        </button>

        {/* Save Button */}
        <button
          onClick={toggleSave}
          className="group flex flex-col items-center"
        >
          <div className={`p-3 rounded-full transition-all duration-200 ${
            savedItems.has(currentItem?.identifier || '') 
              ? 'bg-neon-cyan/20' 
              : 'glass hover:bg-white/20'
          }`}>
            <Bookmark
              size={24}
              className={`transition-colors ${
                savedItems.has(currentItem?.identifier || '') 
                  ? 'text-neon-cyan fill-neon-cyan' 
                  : 'text-white'
              }`}
            />
          </div>
          <span className="text-[10px] text-white/60 mt-2 font-mono">Save</span>
        </button>

        {/* Source Button */}
        <button
          onClick={() => window.open(archiveService.getDetailsUrl(currentItem.identifier), '_blank')}
          className="group flex flex-col items-center"
        >
          <div className="p-3 glass rounded-full hover:bg-white/20 transition-all">
            <ExternalLink size={24} className="text-white" />
          </div>
          <span className="text-[10px] text-white/60 mt-2 font-mono">Source</span>
        </button>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 glass rounded-full hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronUp size={24} className="text-white" />
      </button>

      <button
        onClick={handleNext}
        className="absolute left-4 bottom-4 p-2 glass rounded-full hover:bg-white/20 transition-colors"
      >
        <ChevronDown size={24} className="text-white" />
      </button>

      {/* Loading Indicator */}
      {isLoading && currentIndex === items.length - 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <Loader2 className="text-neon-cyan animate-spin" size={20} />
        </div>
      )}

      {/* Keyboard Hints */}
      <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/40 space-y-1 text-right">
        <div>↑↓ or SWIPE to navigate</div>
        <div>ESC to exit</div>
      </div>
    </motion.div>
  );
};
