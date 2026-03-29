/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Info, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ShieldCheck, 
  Database,
  Terminal,
  AlertCircle,
  X,
  User,
  Lock,
  Loader2,
  Film,
  Music,
  FileText
} from 'lucide-react';
import { ArchiveItem, ViewType, AppState } from './types';
import { archiveService } from './services/archiveService';
import { NeuralHandshake } from './components/NeuralHandshake';
import { BottomNav } from './components/BottomNav';
import { DossierCard } from './components/DossierCard';
import { BiometricHandshake } from './components/BiometricHandshake';
import { MediaPlayer } from './components/MediaPlayer';

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    // Load vault from localStorage on init
    const savedVault = localStorage.getItem('archive_vault');
    return {
      currentView: 'dossier',
      selectedItem: null,
      vault: savedVault ? JSON.parse(savedVault) : [],
      isHandshakeComplete: false,
      isBiometricVerified: false,
    };
  });

  const nodeID = React.useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), []);

  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Persistence effect
  useEffect(() => {
    localStorage.setItem('archive_vault', JSON.stringify(state.vault));
  }, [state.vault]);

  const fetchItems = useCallback(async (query?: string, isNewSearch: boolean = true) => {
    if (isNewSearch) {
      setIsSearching(true);
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const currentPage = isNewSearch ? 1 : page + 1;
      
      // Determine effective query for default feed
      let effectiveQuery = query;
      if (!effectiveQuery) {
        if (isNewSearch || !activeTopic) {
          const newTopic = archiveService.getMysteriousQuery();
          setActiveTopic(newTopic);
          effectiveQuery = newTopic;
        } else {
          effectiveQuery = activeTopic;
        }
      }

      const results = await archiveService.search(effectiveQuery, currentPage);
      
      if (results.length === 0) {
        if (!query) {
          // Default feed reached end of a topic, pivot to a new one immediately for "unlimited" feel
          const nextTopic = archiveService.getMysteriousQuery();
          setActiveTopic(nextTopic);
          const nextResults = await archiveService.search(nextTopic, 1);
          setItems(prev => [...prev, ...nextResults]);
          setPage(1);
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      } else {
        setItems(prev => isNewSearch ? results : [...prev, ...results]);
        if (isNewSearch) {
          setPage(1);
        } else {
          setPage(prev => prev + 1);
        }
      }
    } catch (err) {
      setError('Failed to establish neural link with Archive database.');
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  }, [page, activeTopic]);

  useEffect(() => {
    fetchItems();
  }, []); // Initial load only

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    // Trigger when 800px from bottom for "seamless" feel
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 800;
    
    if (
      isAtBottom &&
      !isLoadingMore &&
      (hasMore || !searchQuery) && // Always allow more for default feed
      state.currentView === 'dossier' &&
      items.length > 0
    ) {
      fetchItems(searchQuery || undefined, false);
    }
  };

  const handleViewChange = (view: ViewType) => {
    setState(prev => ({ ...prev, currentView: view, selectedItem: null }));
  };

  const handleSelectItem = (item: ArchiveItem) => {
    setState(prev => ({ ...prev, selectedItem: item, currentView: 'detail' }));
  };

  const handleAddToVault = (item: ArchiveItem) => {
    if (!state.vault.find(v => v.identifier === item.identifier)) {
      setState(prev => ({ ...prev, vault: [...prev.vault, item] }));
    }
  };

  const handleRemoveFromVault = (identifier: string) => {
    setState(prev => ({ ...prev, vault: prev.vault.filter(v => v.identifier !== identifier) }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchItems(searchQuery, true);
    }
  };

  const handleHandshakeComplete = useCallback(() => {
    setState(prev => ({ ...prev, isHandshakeComplete: true }));
  }, []);

  const handleBiometricVerified = useCallback(() => {
    setState(prev => ({ ...prev, isBiometricVerified: true }));
  }, []);

  if (!state.isHandshakeComplete) {
    return <NeuralHandshake onComplete={handleHandshakeComplete} />;
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white font-sans selection:bg-neon-cyan selection:text-black">
      {/* Header */}
      <header className="safe-pt glass border-b border-white/10 z-30">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tighter flex items-center">
              <span className="text-neon-cyan mr-2">ARCHIVE</span>
              <span className="font-light opacity-50">NEURAL INTERFACE</span>
            </h1>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-[8px] text-white/40 tracking-widest uppercase">
                Secure Link Active // Node: {nodeID}
              </span>
            </div>
          </div>
          <div className="p-2 glass rounded-full">
            <Terminal size={16} className="text-neon-cyan" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-1 overflow-y-auto px-4 pt-4 pb-24 scroll-smooth"
        onScroll={handleScroll}
      >
        <AnimatePresence mode="wait">
          {state.currentView === 'dossier' && (
            <motion.div
              key="dossier"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="flex justify-between items-end mb-6 px-2">
                <h2 className="font-mono text-xs text-neon-cyan tracking-[0.3em] uppercase">
                  Intelligence Feed
                </h2>
                <span className="font-mono text-[8px] text-white/20 uppercase">
                  {items.length} Dossiers Loaded
                </span>
              </div>

              {/* Stories Bar */}
              <div className="flex space-x-4 overflow-x-auto pb-6 mb-6 no-scrollbar px-2">
                {['UFO_NODE', 'AREA_51', 'VOYNICH', 'MK_ULTRA', 'APOLLO', 'TESLA'].map((node, i) => (
                  <button
                    key={node}
                    onClick={() => fetchItems(node, true)}
                    className="flex flex-col items-center space-y-2 flex-shrink-0 hover:opacity-100 opacity-70 transition-opacity duration-200 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-neon-cyan to-transparent hover:shadow-lg hover:shadow-neon-cyan/50 transition-shadow duration-200">
                      <div className="w-full h-full rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                        <img 
                          src={`https://picsum.photos/seed/${node}/100/100`} 
                          alt={node}
                          className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-200"
                        />
                      </div>
                    </div>
                    <span className="font-mono text-[7px] text-white/40 tracking-tighter">{node}</span>
                  </button>
                ))}
              </div>
              
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-2 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
                  <span className="font-mono text-[10px] text-neon-cyan uppercase animate-pulse">Scanning Archive...</span>
                </div>
              ) : (
                <>
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.identifier}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index % 20) * 0.03 }}
                    >
                      <DossierCard 
                        item={item} 
                        onSelect={handleSelectItem}
                        onVault={handleAddToVault}
                        onRedact={(id) => setItems(prev => prev.filter(i => i.identifier !== id))}
                      />
                    </motion.div>
                  ))}
                  
                  {isLoadingMore && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-2">
                      <Loader2 className="text-neon-cyan animate-spin" size={24} />
                      <span className="font-mono text-[8px] text-neon-cyan uppercase tracking-widest animate-pulse">Synchronizing...</span>
                    </div>
                  )}

                  {searchQuery && !hasMore && items.length > 0 && (
                    <div className="text-center py-8 opacity-20 font-mono text-[8px] uppercase tracking-[0.5em]">
                      End of Intelligence Stream
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {state.currentView === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6 max-w-md mx-auto"
            >
              <div className="relative px-2">
                <form onSubmit={handleSearch}>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="QUERY DATABASE..."
                    className="w-full glass neon-border rounded-lg px-12 py-4 font-mono text-sm uppercase tracking-widest placeholder:text-white/20 focus:outline-none focus:border-neon-cyan/60 transition-colors"
                  />
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neon-cyan" size={20} />
                  {isSearching && <div className="scanning-line" />}
                </form>
              </div>

              <div className="grid grid-cols-3 gap-1">
                {items.map((item, idx) => (
                  <motion.div
                    key={`${item.identifier}-explore-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (idx % 30) * 0.01 }}
                    onClick={() => handleSelectItem(item)}
                    className="aspect-square relative group cursor-pointer overflow-hidden bg-white/5"
                  >
                    <img 
                      src={archiveService.getItemImageUrl(item.identifier)} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-neon-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Media Type Icon Overlay */}
                    <div className="absolute top-1 right-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      {item.mediatype === 'movies' && <Film size={10} className="text-white" />}
                      {item.mediatype === 'audio' && <Music size={10} className="text-white" />}
                      {item.mediatype === 'texts' && <FileText size={10} className="text-white" />}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {state.currentView === 'vault' && (
            <motion.div
              key="vault"
              className="h-full"
            >
              {!state.isBiometricVerified ? (
                <BiometricHandshake onVerified={handleBiometricVerified} />
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="font-mono text-xs text-neon-cyan tracking-[0.3em] uppercase">Secure Vault</h2>
                    <button 
                      onClick={() => setState(prev => ({ ...prev, isBiometricVerified: false }))}
                      className="p-2 glass rounded text-white/40 hover:text-white"
                    >
                      <Lock size={14} />
                    </button>
                  </div>

                  {state.vault.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                      <Database size={48} className="text-white/10 mb-4" />
                      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Vault Empty // No Intelligence Saved</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1">
                      {state.vault.map(item => (
                        <motion.div
                          key={`${item.identifier}-vault`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => handleSelectItem(item)}
                          className="aspect-square relative group cursor-pointer overflow-hidden bg-white/5"
                        >
                          <img 
                            src={archiveService.getItemImageUrl(item.identifier)} 
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-neon-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {state.currentView === 'detail' && state.selectedItem && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <button 
                onClick={() => handleViewChange('dossier')}
                className="flex items-center text-neon-cyan font-mono text-[10px] uppercase tracking-widest mb-4"
              >
                <ChevronLeft size={16} className="mr-1" /> Back to Feed
              </button>

              <div className="space-y-6">
                <MediaPlayer item={state.selectedItem} />

                <div className="glass p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-mono text-[10px] text-white/40 uppercase tracking-widest flex items-center">
                      <Info size={12} className="mr-2" /> Intelligence Report
                    </h3>
                    <span className="font-mono text-[8px] text-neon-cyan uppercase">ID: {state.selectedItem.identifier}</span>
                  </div>
                  <h2 className="text-xl font-bold mb-3">{state.selectedItem.title}</h2>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {state.selectedItem.description || 'No detailed intelligence available for this dossier.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-3 rounded-lg">
                    <span className="font-mono text-[8px] text-white/30 uppercase block mb-1">Creator</span>
                    <span className="font-mono text-[10px] text-neon-cyan truncate block">{state.selectedItem.creator || 'UNKNOWN'}</span>
                  </div>
                  <div className="glass p-3 rounded-lg">
                    <span className="font-mono text-[8px] text-white/30 uppercase block mb-1">Date</span>
                    <span className="font-mono text-[10px] text-white block">{state.selectedItem.date || 'CLASSIFIED'}</span>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    onClick={() => window.open(archiveService.getDetailsUrl(state.selectedItem!.identifier), '_blank')}
                    className="flex-1 bg-neon-cyan text-black font-mono font-bold text-xs py-4 rounded-lg flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                  >
                    <Download size={16} />
                    <span>DECRYPT & EXPORT</span>
                  </button>
                  <button 
                    onClick={() => handleAddToVault(state.selectedItem!)}
                    className="w-16 glass flex items-center justify-center rounded-lg active:scale-95 transition-transform"
                  >
                    <ShieldCheck size={20} className="text-neon-cyan" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {state.currentView === 'profile' && (
            <motion.div
              key="profile"
              className="space-y-8"
            >
              <div className="flex flex-col items-center py-8">
                <div className="w-24 h-24 rounded-full glass neon-border flex items-center justify-center mb-4">
                  <User size={48} className="text-neon-cyan" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">AGENT_1515</h2>
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.3em]">Level 4 Clearance</span>
              </div>

              <div className="space-y-4">
                <div className="glass p-4 rounded-lg flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck size={18} className="text-neon-cyan" />
                    <span className="font-mono text-xs uppercase">Neural Link Status</span>
                  </div>
                  <span className="font-mono text-xs text-green-500 uppercase">Encrypted</span>
                </div>
                <div className="glass p-4 rounded-lg flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Database size={18} className="text-neon-cyan" />
                    <span className="font-mono text-xs uppercase">Vault Capacity</span>
                  </div>
                  <span className="font-mono text-xs text-white/60 uppercase">{state.vault.length} / 500</span>
                </div>
              </div>

              <div className="pt-8">
                <button className="w-full glass border-red-500/30 text-red-500 font-mono text-xs py-4 rounded-lg uppercase tracking-widest hover:bg-red-500/10 transition-colors">
                  Terminate Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-6 right-6 glass border-red-500/50 p-4 rounded-lg flex items-center space-x-3 z-50"
          >
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="font-mono text-[10px] text-white/80 uppercase flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-white/40">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <BottomNav currentView={state.currentView} onViewChange={handleViewChange} />
    </div>
  );
}
