import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { NameOfAllah, namesOfAllah } from './namesData';
import { GalaxyCanvas } from './components/GalaxyCanvas';
import { AuthDialog } from './components/AuthDialog';
import { NotificationHub } from './components/NotificationHub';
import { audio } from './audio';
import { 
  Search, 
  Volume2, 
  VolumeX, 
  User as UserIcon, 
  Bell, 
  Star, 
  CheckSquare, 
  Moon, 
  Sun, 
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Award,
  Globe,
  Play,
  Clock,
  Palette,
  Check,
  Grid,
  Eye,
  EyeOff,
  Music,
  Pause,
  ListPlus
} from 'lucide-react';
import { PronunciationGuide } from './components/PronunciationGuide';
import { GestureTutorial } from './components/GestureTutorial';
import { CertificateModal } from './components/CertificateModal';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface Toast {
  id: number;
  title: string;
  message: string;
}

export default function App() {
  // Sync state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // App settings & view states
  const [theme, setTheme] = useState<'slate' | 'gold' | 'emerald' | 'rose' | 'ruby' | 'nebula'>('slate');
  const [activeRightMenu, setActiveRightMenu] = useState<'architecture' | 'theme' | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showAuth, setShowAuth] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Filtering and selection states
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'completed'>('all');
  const [visualizationType, setVisualizationType] = useState<'spiral' | 'nebula' | 'cluster' | 'wave' | 'supernova' | 'infinity'>('spiral');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Sleep timer and onboarding states
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimeLeft, setSleepTimeLeft] = useState<number>(0);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [forceShowTutorial, setForceShowTutorial] = useState(false);

  // AI Meditative thought states
  const [meditationText, setMeditationText] = useState('');
  const [meditationLoading, setMeditationLoading] = useState(false);
  const [meditationError, setMeditationError] = useState('');

  // User synchronized data state
  const [favorites, setFavorites] = useState<number[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);

  // Newly requested states
  const [exploredNames, setExploredNames] = useState<number[]>([]);
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [playlist, setPlaylist] = useState<number[]>([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState<number | null>(null);
  const [isPlaylistPlaying, setIsPlaylistPlaying] = useState<boolean>(false);

  // 1. Toast Notification Manager
  const triggerToast = (message: string, title: string = 'Notification') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // 2. Load Local Storage state (Offline Support)
  useEffect(() => {
    const cachedFavs = localStorage.getItem('allah_names_favs');
    const cachedComp = localStorage.getItem('allah_names_comp');
    const cachedTheme = localStorage.getItem('allah_names_theme');

    if (cachedFavs) setFavorites(JSON.parse(cachedFavs));
    if (cachedComp) setCompleted(JSON.parse(cachedComp));
    if (cachedTheme && ['slate', 'gold', 'emerald', 'rose', 'ruby', 'nebula'].includes(cachedTheme)) {
      setTheme(cachedTheme as any);
    }
  }, []);

  // 3. Sync theme state
  useEffect(() => {
    localStorage.setItem('allah_names_theme', theme);
  }, [theme]);

  // Handle selectedName updates for Explored Names and Recently Viewed tracking
  useEffect(() => {
    if (selectedName) {
      setExploredNames(prev => prev.includes(selectedName.id) ? prev : [...prev, selectedName.id]);
      setRecentlyViewed(prev => {
        const filtered = prev.filter(id => id !== selectedName.id);
        return [selectedName.id, ...filtered].slice(0, 5);
      });
    }
  }, [selectedName]);

  // Playlist loop controls
  const playPlaylistItem = (index: number) => {
    if (index < 0 || index >= playlist.length) {
      setIsPlaylistPlaying(false);
      setCurrentPlaylistIndex(null);
      triggerToast("Recitation loop completed.", "Recitation Playlist");
      return;
    }
    setCurrentPlaylistIndex(index);
    const nameId = playlist[index];
    const item = namesOfAllah.find(n => n.id === nameId);
    if (item) {
      setSelectedName(item);
      audio.playNameAudio(item.transliteration, item.name, item.id);
    }
  };

  useEffect(() => {
    if (!isPlaylistPlaying || currentPlaylistIndex === null) return;

    // Transition to the next name in the playlist queue after 4.5 seconds
    const timer = setTimeout(() => {
      const nextIndex = currentPlaylistIndex + 1;
      playPlaylistItem(nextIndex);
    }, 4500);

    return () => clearTimeout(timer);
  }, [isPlaylistPlaying, currentPlaylistIndex, playlist]);

  const togglePlaylist = (id: number) => {
    const isAlreadyIn = playlist.includes(id);
    setPlaylist(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
    if (isAlreadyIn) {
      triggerToast("Removed from recitation queue.", "Playlist Queue");
    } else {
      triggerToast("Added to recitation queue.", "Playlist Queue");
    }
    audio.playSparkle('complete');
  };

  const queueCategory = (cat: string) => {
    let ids: number[] = [];
    let label = "";

    if (cat === 'All') {
      ids = namesOfAllah.map(n => n.id);
      label = "All 99 Names";
    } else if (cat === 'Favorites') {
      if (favorites.length === 0) {
        triggerToast("No favorites saved yet to queue.", "Recitation Queue");
        return;
      }
      ids = [...favorites];
      label = `${favorites.length} Favorite Names`;
    } else {
      ids = namesOfAllah.filter(n => n.category === cat).map(n => n.id);
      label = `${cat} Names`;
    }

    setPlaylist(ids);
    setCurrentPlaylistIndex(null);
    setIsPlaylistPlaying(false);
    triggerToast(`Queued ${label} (${ids.length}).`, "Recitation Queue");
    audio.playSparkle('favorite');
  };

  // Sleep Timer logic
  useEffect(() => {
    if (sleepTimer === null) return;
    setSleepTimeLeft(sleepTimer * 60);
  }, [sleepTimer]);

  useEffect(() => {
    if (sleepTimer === null || sleepTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setSleepTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAudioEnabled(false);
          setSleepTimer(null);
          triggerToast("Sleep timer completed. Atmospheric audio paused.", "Sleep Timer");
          return 0;
        }

        // Smooth fade out in final 5 seconds
        if (prev <= 6) {
          const targetVol = ((prev - 1) / 5) * volume;
          audio.setVolume(targetVol);
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      // Restore volume if timer is cancelled or completed
      audio.setVolume(volume);
    };
  }, [sleepTimer, sleepTimeLeft, volume]);

  // Reset meditation thought when selected name changes
  useEffect(() => {
    setMeditationText('');
    setMeditationError('');
  }, [selectedName]);

  // Fetch meditation thought from server
  const fetchMeditation = async (name: NameOfAllah) => {
    setMeditationLoading(true);
    setMeditationError('');
    setMeditationText('');
    try {
      const res = await fetch('/api/gemini/meditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameId: name.id,
          arabicName: name.name,
          transliteration: name.transliteration,
          englishTranslation: name.english
        })
      });
      if (!res.ok) {
        throw new Error('Unable to connect to reflection generator.');
      }
      const data = await res.json();
      setMeditationText(data.thought);
    } catch (err: any) {
      setMeditationError(err?.message || 'Error occurred during generation.');
    } finally {
      setMeditationLoading(false);
    }
  };

  // 4. Handle Firebase Auth status listener & sync cloud data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        triggerToast(`Connected with cloud account: ${user.email || 'Guest Session'}`, 'Cloud Sync');
        
        // Fetch saved user progress from firestore
        try {
          const userDocRef = doc(db, 'user_data', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            const cloudFavs = data.favorites || [];
            const cloudComp = data.completed || [];
            
            // Merge cloud data with local data, prioritizing cloud data
            setFavorites(prev => {
              const merged = Array.from(new Set([...prev, ...cloudFavs]));
              localStorage.setItem('allah_names_favs', JSON.stringify(merged));
              return merged;
            });
            setCompleted(prev => {
              const merged = Array.from(new Set([...prev, ...cloudComp]));
              localStorage.setItem('allah_names_comp', JSON.stringify(merged));
              return merged;
            });
          } else {
            // First time logging in, write current local storage to firestore
            const currentFavs = JSON.parse(localStorage.getItem('allah_names_favs') || '[]');
            const currentComp = JSON.parse(localStorage.getItem('allah_names_comp') || '[]');
            await setDoc(userDocRef, {
              userId: user.uid,
              favorites: currentFavs,
              completed: currentComp,
              updatedAt: new Date().toISOString()
            });
          }
        } catch (err: any) {
          console.error("Firestore sync fetch error: ", err);
          triggerToast("Could not sync with cloud. Continuing in offline mode.", "Sync Pending");
          if (err?.code === 'permission-denied' || err?.message?.includes('permission') || err?.message?.includes('Permission')) {
            handleFirestoreError(err, OperationType.GET, 'user_data/' + user.uid);
          }
        }
      } else {
        triggerToast("Cloud session disconnected. Accessing local database.", "Offline Mode");
      }
    });

    return () => unsubscribe();
  }, []);

  // 5. Update Favorite/Completed lists & sync instantly to local + cloud
  const toggleFavorite = async (id: number) => {
    const isFav = favorites.includes(id);
    const updated = isFav ? favorites.filter(x => x !== id) : [...favorites, id];
    
    setFavorites(updated);
    localStorage.setItem('allah_names_favs', JSON.stringify(updated));

    if (isFav) {
      triggerToast('Removed from favorites', 'Update');
    } else {
      triggerToast('Added to favorites', 'Saved');
      audio.playSparkle('favorite');
    }

    // Write to Firestore if logged in
    if (currentUser) {
      try {
        await setDoc(doc(db, 'user_data', currentUser.uid), {
          favorites: updated,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e: any) {
        console.error("Cloud save favorite error:", e);
        if (e?.code === 'permission-denied' || e?.message?.includes('permission') || e?.message?.includes('Permission')) {
          handleFirestoreError(e, OperationType.WRITE, 'user_data/' + currentUser.uid);
        }
      }
    }
  };

  const toggleCompleted = async (id: number) => {
    const isComp = completed.includes(id);
    const updated = isComp ? completed.filter(x => x !== id) : [...completed, id];

    setCompleted(updated);
    localStorage.setItem('allah_names_comp', JSON.stringify(updated));

    if (isComp) {
      triggerToast('Marked as incomplete', 'Progress');
    } else {
      triggerToast('Successfully memorized & completed recitation!', 'Congratulations!');
      audio.playSparkle('complete');
    }

    // Write to Firestore if logged in
    if (currentUser) {
      try {
        await setDoc(doc(db, 'user_data', currentUser.uid), {
          completed: updated,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e: any) {
        console.error("Cloud save checklist error:", e);
        if (e?.code === 'permission-denied' || e?.message?.includes('permission') || e?.message?.includes('Permission')) {
          handleFirestoreError(e, OperationType.WRITE, 'user_data/' + currentUser.uid);
        }
      }
    }
  };

  // 6. Handle ambient soundscape triggers
  useEffect(() => {
    if (audioEnabled) {
      audio.playAmbientDrone(theme);
    } else {
      audio.stopAmbientDrone();
    }
  }, [audioEnabled, theme]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audio.setVolume(val);
  };

  // Sequential detail navigation
  const handlePrev = () => {
    if (!selectedName) return;
    audio.playSparkle('hover');
    const prevId = selectedName.id === 1 ? 99 : selectedName.id - 1;
    const prevItem = namesOfAllah.find(n => n.id === prevId);
    if (prevItem) {
      setSelectedName(prevItem);
      audio.playNameAudio(prevItem.transliteration, prevItem.name, prevItem.id);
    }
  };

  const handleNext = () => {
    if (!selectedName) return;
    audio.playSparkle('hover');
    const nextId = selectedName.id === 99 ? 1 : selectedName.id + 1;
    const nextItem = namesOfAllah.find(n => n.id === nextId);
    if (nextItem) {
      setSelectedName(nextItem);
      audio.playNameAudio(nextItem.transliteration, nextItem.name, nextItem.id);
    }
  };

  // Get total progress percentage
  const progressPercent = Math.round((completed.length / 99) * 100);

  // Filter lists based on inputs
  const filteredList = namesOfAllah.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bengali.includes(searchQuery) ||
      item.name.includes(searchQuery);

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    const matchesFilterMode = filterMode === 'all' ||
      (filterMode === 'favorites' && favorites.includes(item.id)) ||
      (filterMode === 'completed' && completed.includes(item.id));

    return matchesSearch && matchesCategory && matchesFilterMode;
  });

  return (
    <div className={`relative min-h-screen w-full flex flex-col md:flex-row overflow-hidden transition-colors duration-500 font-sans ${
      theme === 'gold' ? 'bg-[#050505] text-[#f4ebd0]' :
      theme === 'emerald' ? 'bg-[#010503] text-emerald-100' :
      theme === 'rose' ? 'bg-[#050104] text-rose-100' :
      theme === 'ruby' ? 'bg-[#050000] text-red-100' :
      theme === 'nebula' ? 'bg-[#010105] text-indigo-100' :
      'bg-[#020205] text-slate-100'
    }`}>
      
      {/* 3D WEBGL GALAXY BACKDROP */}
      <div className="absolute inset-0 w-full h-full z-0">
        <GalaxyCanvas
          selectedId={selectedName ? selectedName.id : null}
          onSelectName={(item) => {
            setSelectedName(item);
            audio.playNameAudio(item.transliteration, item.name, item.id);
            audio.playSparkle('click');
          }}
          favorites={favorites}
          completed={completed}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          filterMode={filterMode}
          visualizationType={visualizationType}
          theme={theme}
        />
      </div>

      {/* FLOATING RIGHT SIDE CONTROLS (CELESTIAL CONTROL DECK) */}
      <div className="absolute right-6 bottom-[240px] z-30 flex flex-col gap-3 items-end pointer-events-none">
        
        {/* 1. CELESTIAL ARCHITECTURE SWITCHER */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className={`flex items-center gap-1.5 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform-gpu ${
            activeRightMenu === 'architecture' 
              ? 'translate-x-0 opacity-100 scale-100 pointer-events-auto' 
              : 'translate-x-12 opacity-0 scale-95 pointer-events-none'
          } ${
            theme === 'gold' ? 'gold-glass-panel border-amber-500/30' :
            theme === 'emerald' ? 'emerald-glass-panel border-emerald-500/30' :
            theme === 'rose' ? 'rose-glass-panel border-fuchsia-500/30' :
            theme === 'ruby' ? 'ruby-glass-panel border-red-500/30' :
            theme === 'nebula' ? 'nebula-glass-panel border-violet-500/30' :
            'glass-panel border-white/10'
          }`}>
            {[
              { id: 'spiral', name: 'Spiral', icon: '🌀' },
              { id: 'nebula', name: 'Nebula', icon: '⭕' },
              { id: 'cluster', name: 'Cluster', icon: '🌌' },
              { id: 'wave', name: 'Wave', icon: '🌊' },
              { id: 'supernova', name: 'Supernova', icon: '💥' },
              { id: 'infinity', name: 'Infinity', icon: '♾️' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  setVisualizationType(opt.id as any);
                  audio.playSparkle('click');
                  setActiveRightMenu(null); // slide back to right
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono tracking-wider transition-all border shrink-0 ${
                  visualizationType === opt.id
                    ? theme === 'gold' ? 'bg-amber-500/25 border-amber-500/60 text-amber-200' :
                      theme === 'emerald' ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-200' :
                      theme === 'rose' ? 'bg-fuchsia-500/25 border-fuchsia-500/60 text-fuchsia-200' :
                      theme === 'ruby' ? 'bg-red-500/25 border-red-500/60 text-red-200' :
                      theme === 'nebula' ? 'bg-violet-500/25 border-violet-500/60 text-violet-200' :
                      'bg-sky-500/25 border-sky-500/60 text-sky-200'
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setActiveRightMenu(activeRightMenu === 'architecture' ? null : 'architecture');
              audio.playSparkle('click');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 ${
              activeRightMenu === 'architecture'
                ? theme === 'gold' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                  theme === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                  theme === 'rose' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.3)]' :
                  theme === 'ruby' ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                  theme === 'nebula' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]' :
                  'bg-sky-500/20 text-sky-400 border border-sky-400/40 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                : theme === 'gold' ? 'gold-glass-panel text-amber-200 hover:border-amber-500/30' :
                  theme === 'emerald' ? 'emerald-glass-panel text-emerald-200 hover:border-emerald-500/30' :
                  theme === 'rose' ? 'rose-glass-panel text-fuchsia-200 hover:border-fuchsia-500/30' :
                  theme === 'ruby' ? 'ruby-glass-panel text-red-200 hover:border-red-500/30' :
                  theme === 'nebula' ? 'nebula-glass-panel text-violet-200 hover:border-violet-500/30' :
                  'glass-panel text-slate-300 hover:border-white/20'
            }`}
            title="Celestial Architecture Configuration"
          >
            <Grid size={16} />
          </button>
        </div>

        {/* 2. CELESTIAL THEME SWITCHER */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className={`flex items-center gap-1.5 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform-gpu ${
            activeRightMenu === 'theme' 
              ? 'translate-x-0 opacity-100 scale-100 pointer-events-auto' 
              : 'translate-x-12 opacity-0 scale-95 pointer-events-none'
          } ${
            theme === 'gold' ? 'gold-glass-panel border-amber-500/30' :
            theme === 'emerald' ? 'emerald-glass-panel border-emerald-500/30' :
            theme === 'rose' ? 'rose-glass-panel border-fuchsia-500/30' :
            theme === 'ruby' ? 'ruby-glass-panel border-red-500/30' :
            theme === 'nebula' ? 'nebula-glass-panel border-violet-500/30' :
            'glass-panel border-white/10'
          }`}>
            {[
              { id: 'slate', name: 'Slate', dot: 'bg-sky-500 shadow-sky-500/40' },
              { id: 'gold', name: 'Gold', dot: 'bg-amber-500 shadow-amber-500/40' },
              { id: 'emerald', name: 'Emerald', dot: 'bg-emerald-500 shadow-emerald-500/40' },
              { id: 'rose', name: 'Rose', dot: 'bg-fuchsia-400 shadow-fuchsia-400/40' },
              { id: 'ruby', name: 'Ruby', dot: 'bg-red-500 shadow-red-500/40' },
              { id: 'nebula', name: 'Nebula', dot: 'bg-violet-500 shadow-violet-500/40' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id as any);
                  audio.playSparkle('click');
                  setActiveRightMenu(null); // slide back to right
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[10px] font-mono tracking-wider transition-all border shrink-0 ${
                  theme === t.id
                    ? 'bg-white/10 border-white/30 text-white font-medium'
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${t.dot}`} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setActiveRightMenu(activeRightMenu === 'theme' ? null : 'theme');
              audio.playSparkle('click');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 ${
              activeRightMenu === 'theme'
                ? theme === 'gold' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                  theme === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                  theme === 'rose' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.3)]' :
                  theme === 'ruby' ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                  theme === 'nebula' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]' :
                  'bg-sky-500/20 text-sky-400 border border-sky-400/40 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                : theme === 'gold' ? 'gold-glass-panel text-amber-200 hover:border-amber-500/30' :
                  theme === 'emerald' ? 'emerald-glass-panel text-emerald-200 hover:border-emerald-500/30' :
                  theme === 'rose' ? 'rose-glass-panel text-fuchsia-200 hover:border-fuchsia-500/30' :
                  theme === 'ruby' ? 'ruby-glass-panel text-red-200 hover:border-red-500/30' :
                  theme === 'nebula' ? 'nebula-glass-panel text-violet-200 hover:border-violet-500/30' :
                  'glass-panel text-slate-300 hover:border-white/20'
            }`}
            title="Celestial Theme Aesthetics"
          >
            <Palette size={16} />
          </button>
        </div>

        {/* 3. CONSTELLATION EXPLORATION GUIDE */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              setForceShowTutorial(true);
              audio.playSparkle('click');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 ${
              theme === 'gold' ? 'gold-glass-panel text-amber-200 hover:border-amber-500/30' :
              theme === 'emerald' ? 'emerald-glass-panel text-emerald-200 hover:border-emerald-500/30' :
              theme === 'rose' ? 'rose-glass-panel text-fuchsia-200 hover:border-fuchsia-500/30' :
              theme === 'ruby' ? 'ruby-glass-panel text-red-200 hover:border-red-500/30' :
              theme === 'nebula' ? 'nebula-glass-panel text-violet-200 hover:border-violet-500/30' :
              'glass-panel text-slate-300 hover:border-white/20'
            }`}
            title="3D Constellation Exploration Guide"
          >
            <HelpCircle size={16} />
          </button>
        </div>

      </div>



      {/* STARFIELD BACKGROUND LAYER */}
      <div className="absolute inset-0 opacity-40 pointer-events-none z-1">
        <div className="absolute w-2 h-2 bg-white rounded-full top-[15%] left-[20%] blur-[1px]"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[45%] left-[70%] blur-[0.5px]"></div>
        <div className="absolute w-3 h-3 bg-blue-300 rounded-full top-[80%] left-[35%] blur-[2px] opacity-60"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[25%] left-[85%]"></div>
        <div className="absolute w-2 h-2 bg-purple-300 rounded-full top-[60%] left-[10%] blur-[2px]"></div>
      </div>

      {/* ATMOSPHERIC NEBULA GLOWS */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-indigo-900/20 via-transparent to-transparent rounded-full blur-[120px] pointer-events-none z-1"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-amber-900/10 via-transparent to-transparent rounded-full blur-[100px] pointer-events-none z-1"></div>

      {/* TOP HEADS UP DISPLAY / HEADER ACTION BAR */}
      <header className="absolute top-0 inset-x-0 z-40 pointer-events-none flex flex-col sm:flex-row items-center justify-between px-6 py-4 gap-4">
        <div className="pointer-events-auto flex items-center gap-4 bg-black/45 backdrop-blur-md border border-amber-500/20 rounded-full px-5 py-3 select-none shadow-2xl">
          <div className="w-9 h-9 border-2 border-amber-500/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
            <div className="w-5 h-5 border border-amber-400 rounded-sm rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
            </div>
          </div>
          <div>
            <h1 className="text-sm font-light tracking-[0.2em] text-amber-50 uppercase font-display">Al-Asma-ul-Husna</h1>
            <p className="text-[9px] tracking-widest text-amber-500/60 uppercase font-mono">The 99 Beautiful Names</p>
          </div>
          <div className="pl-3.5 ml-1 border-l border-white/10 flex flex-col justify-center">
            <span className="text-[14px] font-bold font-mono text-amber-400 leading-none">{exploredNames.length}</span>
            <span className="text-[8px] font-mono tracking-wider text-slate-400 uppercase mt-0.5 whitespace-nowrap font-semibold">Names Explored</span>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="pointer-events-auto flex items-center gap-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-2xl">
          {/* Offline Ready Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-[9px] text-emerald-400/80 uppercase tracking-widest font-mono pr-2 border-r border-white/10">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Offline Ready</span>
          </div>

          {/* Zen Mode Toggle */}
          <button
            onClick={() => {
              setZenMode(!zenMode);
              audio.playSparkle('click');
              if (!zenMode) {
                triggerToast("Zen Mode activated. Enjoy distraction-free viewing.", "Zen Mode");
              } else {
                triggerToast("Zen Mode deactivated.", "Zen Mode");
              }
            }}
            title={zenMode ? 'Exit Zen Mode' : 'Enter Zen Mode (Hide HUD/Sidebar)'}
            className={`p-1.5 rounded-full transition-all ${
              zenMode 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            {zenMode ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          {/* Audio Controls */}
          <div className="flex items-center gap-2 border-r border-white/5 pr-3">
            <button
              onClick={() => {
                setAudioEnabled(!audioEnabled);
              }}
              title={audioEnabled ? 'Mute Atmospheric Audio' : 'Play Atmospheric Audio'}
              className={`p-1.5 rounded-full transition-all ${
                audioEnabled 
                  ? 'bg-amber-400/20 text-amber-300' 
                  : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {audioEnabled && (
              <>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  title="Sustain Drone Volume"
                />

                {/* Ambient sleep timer cycle button */}
                <button
                  onClick={() => {
                    setSleepTimer(prev => {
                      if (prev === null) return 15;
                      if (prev === 15) return 30;
                      if (prev === 30) return 60;
                      return null;
                    });
                  }}
                  title={sleepTimer ? `Sleep Timer: ${Math.floor(sleepTimeLeft / 60)}m left` : "Set Sleep Timer"}
                  className={`p-1 rounded-full text-[10px] font-mono transition-all flex items-center gap-1 border ${
                    sleepTimer 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse px-2' 
                      : 'hover:bg-white/5 border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock size={12} />
                  {sleepTimer && (
                    <span className="text-[9px] font-bold">
                      {Math.floor(sleepTimeLeft / 60)}:{(sleepTimeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Export Progress Certificate Button */}
          <button
            onClick={() => {
              setShowCertificateModal(true);
              audio.playSparkle('click');
            }}
            title="Export Progress Certificate"
            className="p-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 transition-all flex items-center justify-center animate-pulse"
          >
            <Award size={16} />
          </button>

          {/* Notifications config */}
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowAuth(false);
              setActiveRightMenu(null);
            }}
            title="Notification Scheduling"
            className={`p-1.5 rounded-full transition-all ${
              showNotifications 
                ? 'bg-amber-500/20 text-amber-300' 
                : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell size={16} />
          </button>

          {/* Authentication portal with JD-like avatar style */}
          <button
            onClick={() => {
              setShowAuth(!showAuth);
              setShowNotifications(false);
              setActiveRightMenu(null);
            }}
            title="Spiritual Cloud Sync"
            className="flex items-center gap-2 hover:opacity-90 transition-all"
          >
            {currentUser ? (
              <div className="w-8 h-8 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">
                  {currentUser.email ? currentUser.email.substring(0, 2) : 'JD'}
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center hover:bg-white/10">
                <UserIcon size={12} className="text-slate-400" />
              </div>
            )}
          </button>
        </div>
      </header>

      {/* FLOATING SUB-MODALS (Notification Configuration, Auth Dialog) */}
      {showNotifications && (
        <div className="absolute top-18 right-6 z-50 w-full max-w-sm animate-fade-in">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5"
            >
              <X size={14} />
            </button>
            <NotificationHub onShowToast={(msg, title) => triggerToast(msg, title)} />
          </div>
        </div>
      )}

      {showAuth && (
        <div className="absolute top-18 right-6 z-50 w-full max-w-sm animate-fade-in">
          <div className="relative">
            <button 
              onClick={() => setShowAuth(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5"
            >
              <X size={14} />
            </button>
            <AuthDialog currentUser={currentUser} onClose={() => setShowAuth(false)} />
          </div>
        </div>
      )}

      {/* COLLAPSIBLE SIDEBAR TOGGLE BUTTON */}
      {!zenMode && (
        <button
          onClick={() => {
            setIsSidebarCollapsed(!isSidebarCollapsed);
            audio.playSparkle('click');
          }}
          title={isSidebarCollapsed ? 'Expand Names Directory' : 'Collapse Names Directory'}
          className={`absolute top-[92px] transition-all duration-300 z-40 p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 hover:border-amber-500/50 text-amber-400 hover:text-amber-300 shadow-xl pointer-events-auto flex items-center justify-center ${
            isSidebarCollapsed ? 'left-6' : 'left-[396px] md:left-[396px] left-[calc(100%-60px)]'
          }`}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}

      {/* LEFT SIDE NAVIGATION PANEL (Search, Categories, Names directory list) */}
      <aside className={`relative z-30 transition-all duration-300 ease-in-out flex flex-col border-white/5 shadow-2xl backdrop-blur-lg ${
        (isSidebarCollapsed || zenMode) 
          ? 'w-full h-0 md:h-screen md:w-0 overflow-hidden opacity-0 border-b-0 md:border-r-0 pointer-events-none' 
          : 'w-full h-1/2 md:h-screen md:w-[380px] shrink-0 border-b md:border-b-0 md:border-r'
      } ${
        theme === 'gold' ? 'gold-glass-panel' :
        theme === 'emerald' ? 'emerald-glass-panel' :
        theme === 'rose' ? 'rose-glass-panel' :
        theme === 'ruby' ? 'ruby-glass-panel' :
        theme === 'nebula' ? 'nebula-glass-panel' :
        'glass-panel'
      }`}>
        
        {/* Core title spacing on desktop */}
        <div className="hidden md:block px-6 pt-24 pb-4">
          <h2 className="font-display font-light text-xl text-amber-200 tracking-wider uppercase">Asma-ul-Husna Hub</h2>
          <p className="text-[11px] text-gray-400 leading-relaxed mt-1">Explore the spiritual depths, memorize, and track recitation completion of the 99 divine names.</p>
        </div>

        {/* MEMORIZATION PROGRESS METRIC CARD */}
        <div className="px-5 py-4 border-b border-white/10 flex flex-col gap-3 bg-black/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center text-amber-400 shadow-inner">
                <Award size={20} />
              </div>
              <div>
                <span className="text-xs font-medium block text-amber-50/90 font-display">Memorization Goals</span>
                <span className="font-mono text-[10px] text-gray-450">{completed.length} / 99 completed</span>
              </div>
            </div>

            {/* Radial/Bar Visualizer */}
            <div className="flex flex-col items-end gap-1">
              <div className="w-24 bg-black rounded-full h-1.5 overflow-hidden border border-white/10">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* FILTER & SEARCH SUITE */}
        <div className="p-4 flex flex-col gap-3 border-b border-white/10 bg-black/20">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-8 py-2.5 text-xs text-[#e0e0e0] placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors font-sans"
                placeholder="Search names..."
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                const randomId = Math.floor(Math.random() * 99) + 1;
                const item = namesOfAllah.find(n => n.id === randomId);
                if (item) {
                  setSelectedName(item);
                  audio.playNameAudio(item.transliteration, item.name, item.id);
                  audio.playSparkle('click');
                  triggerToast(`Selected Name #${item.id}: ${item.transliteration}`, "Daily Inspiration");
                }
              }}
              title="Daily Inspiration (Random Reflection)"
              className="px-3 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 flex items-center justify-center gap-1.5 transition-all text-[11px] font-mono tracking-wider active:scale-95 whitespace-nowrap shrink-0"
            >
              <span>🎲</span>
              <span className="hidden sm:inline">Random</span>
            </button>
          </div>

          {/* Category Horizontal scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
            {['All', 'Mercy', 'Majesty', 'Wisdom', 'Power', 'Justice', 'Protection', 'Generosity'].map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  audio.playSparkle('hover');
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-mono tracking-wide capitalize shrink-0 border transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List Display Filter Toggles */}
          <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
            <button
              onClick={() => {
                setFilterMode('all');
                audio.playSparkle('hover');
              }}
              className={`py-1 rounded text-center transition-all ${
                filterMode === 'all' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              All Names
            </button>
            <button
              onClick={() => {
                setFilterMode('favorites');
                audio.playSparkle('hover');
              }}
              className={`py-1 rounded text-center flex items-center justify-center gap-1 transition-all ${
                filterMode === 'favorites' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Star size={10} className="text-amber-400 fill-amber-400" /> ({favorites.length})
            </button>
            <button
              onClick={() => {
                setFilterMode('completed');
                audio.playSparkle('hover');
              }}
              className={`py-1 rounded text-center flex items-center justify-center gap-1 transition-all ${
                filterMode === 'completed' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <CheckSquare size={10} className="text-emerald-400" /> ({completed.length})
            </button>
          </div>
        </div>

        {/* RECENTLY VIEWED SECTION */}
        {recentlyViewed.length > 0 && (
          <div className="px-5 py-3 border-b border-white/10 bg-black/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono tracking-wider text-gray-500 uppercase font-bold flex items-center gap-1.5">
                <Clock size={10} className="text-amber-500" />
                Recently Viewed
              </span>
              <button 
                onClick={() => setRecentlyViewed([])}
                className="text-[8px] font-mono text-gray-500 hover:text-amber-400 uppercase tracking-widest transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
              {recentlyViewed.map(id => {
                const item = namesOfAllah.find(n => n.id === id);
                if (!item) return null;
                const isSelected = selectedName?.id === item.id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedName(item);
                      audio.playNameAudio(item.transliteration, item.name, item.id);
                      audio.playSparkle('click');
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-left border transition-all shrink-0 flex flex-col min-w-[75px] ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                        : 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] font-arabic leading-none mb-1 text-right w-full">{item.name}</span>
                    <span className="text-[8px] font-mono truncate max-w-[70px] leading-none text-slate-400">{item.transliteration}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* RECITATION PLAYLIST PLAYER */}
        <div className="px-5 py-3 border-b border-white/10 bg-black/35 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono tracking-wider text-gray-500 uppercase font-bold flex items-center gap-1.5">
              <Music size={11} className={`text-amber-500 ${isPlaylistPlaying ? 'animate-spin' : 'animate-pulse'}`} />
              Recitation Loop Queue ({playlist.length})
            </span>
            {playlist.length > 0 && (
              <button 
                onClick={() => {
                  setIsPlaylistPlaying(false);
                  setCurrentPlaylistIndex(null);
                  setPlaylist([]);
                  triggerToast("Recitation loop queue cleared.", "Playlist Queue");
                }}
                className="text-[8px] font-mono text-rose-400/70 hover:text-rose-400 uppercase tracking-widest transition-colors"
              >
                Clear Queue
              </button>
            )}
          </div>

          {playlist.length === 0 ? (
            <div className="py-2 px-3 rounded-xl border border-dashed border-white/5 bg-white/5 text-[9px] text-slate-500 text-center font-mono select-none">
              Add names below to start a sequential loop
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Media Controls */}
              <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (currentPlaylistIndex !== null) {
                        const prevIdx = currentPlaylistIndex === 0 ? playlist.length - 1 : currentPlaylistIndex - 1;
                        playPlaylistItem(prevIdx);
                      } else {
                        playPlaylistItem(0);
                      }
                      audio.playSparkle('click');
                    }}
                    className="p-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    title="Previous Recitation"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <button
                    onClick={() => {
                      if (isPlaylistPlaying) {
                        setIsPlaylistPlaying(false);
                        triggerToast("Recitation loop paused.", "Recitation Queue");
                      } else {
                        setIsPlaylistPlaying(true);
                        playPlaylistItem(currentPlaylistIndex !== null ? currentPlaylistIndex : 0);
                        triggerToast("Starting recitation loop...", "Recitation Queue");
                      }
                      audio.playSparkle('click');
                    }}
                    className="p-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all"
                    title={isPlaylistPlaying ? "Pause Loop" : "Play Loop"}
                  >
                    {isPlaylistPlaying ? <Pause size={12} className="fill-amber-300" /> : <Play size={12} className="fill-amber-300" />}
                  </button>

                  <button
                    onClick={() => {
                      if (currentPlaylistIndex !== null) {
                        const nextIdx = currentPlaylistIndex === playlist.length - 1 ? 0 : currentPlaylistIndex + 1;
                        playPlaylistItem(nextIdx);
                      } else {
                        playPlaylistItem(0);
                      }
                      audio.playSparkle('click');
                    }}
                    className="p-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    title="Next Recitation"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Queue status details */}
                <div className="text-right flex flex-col justify-center">
                  <span className="text-[9px] text-slate-500 font-mono leading-none">
                    {currentPlaylistIndex !== null ? `Playing ${currentPlaylistIndex + 1} of ${playlist.length}` : 'Loop Idle'}
                  </span>
                  {currentPlaylistIndex !== null && (
                    <span className="text-[10px] font-bold text-amber-400 font-sans tracking-wide leading-none mt-1 animate-pulse">
                      {namesOfAllah.find(n => n.id === playlist[currentPlaylistIndex])?.transliteration}
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic category-based quick build buttons */}
              <div className="flex flex-col gap-1.5 mt-1 border-t border-white/5 pt-2">
                <span className="text-[8px] font-mono tracking-wider text-gray-500 uppercase font-bold">
                  Queue Category Preset:
                </span>
                <div className="flex flex-wrap gap-1">
                  {['All', 'Mercy', 'Majesty', 'Wisdom', 'Power', 'Justice', 'Protection', 'Generosity', 'Favorites'].map(cat => {
                    const count = cat === 'All' 
                      ? 99 
                      : cat === 'Favorites' 
                        ? favorites.length 
                        : namesOfAllah.filter(n => n.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => queueCategory(cat)}
                        className="px-1.5 py-1 rounded bg-white/5 border border-white/5 hover:border-amber-500/20 hover:bg-amber-500/10 text-[9px] font-mono text-slate-400 hover:text-amber-300 transition-all flex items-center gap-1 active:scale-95 shrink-0"
                      >
                        <span>{cat === 'Favorites' ? '⭐' : cat === 'All' ? '✨' : '🏷️'}</span>
                        <span>{cat}</span>
                        <span className="text-[7px] text-slate-500">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DIRECTORY DIRECT ROUTER DIRECT LIST */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs px-6 text-center gap-2">
              <HelpCircle size={24} />
              <span>No matching divine names found. Clear searches or filter to show more.</span>
            </div>
          ) : (
            filteredList.map(item => {
              const isSelected = selectedName?.id === item.id;
              const isFav = favorites.includes(item.id);
              const isComp = completed.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedName(item);
                    audio.playNameAudio(item.transliteration, item.name, item.id);
                  }}
                  className={`group flex items-center justify-between px-5 py-3.5 border-b border-white/5 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-amber-500/10 border-l-2 border-l-amber-500 shadow-[inset_10px_0_15px_-10px_rgba(245,158,11,0.2)]' 
                      : 'hover:bg-white/5 border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-gray-500 w-5">
                      {String(item.id).padStart(2, '0')}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-amber-50 tracking-wide group-hover:text-amber-300 transition-colors">{item.transliteration}</span>
                      <span className="text-[9px] text-gray-400 font-mono tracking-wider">{item.english}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Visual Calligraphy label */}
                    <span className="font-arabic text-lg text-amber-200/90 tracking-wide">
                      {item.name}
                    </span>

                    {/* Status & Play Icons */}
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlaylist(item.id);
                        }}
                        className={`p-1 rounded-full transition-all border ${
                          playlist.includes(item.id)
                            ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                            : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/10'
                        }`}
                        title={playlist.includes(item.id) ? "Remove from Queue" : "Add to Queue"}
                      >
                        <ListPlus size={10} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          audio.playNameAudio(item.transliteration, item.name, item.id);
                        }}
                        className="p-1 rounded-full bg-amber-500/10 hover:bg-amber-500/35 text-amber-300 hover:text-amber-200 transition-all border border-amber-500/25"
                        title={`Listen to ${item.transliteration}`}
                      >
                        <Play size={10} className="fill-amber-400 text-amber-400" />
                      </button>
                      {isFav && <Star size={9} className="fill-amber-400 text-amber-400" />}
                      {isComp && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" title="Completed" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* FLOAT FLOATING DRAWER PANEL / DETAILED OVERLAY VIEW */}
      {selectedName && (
        <section className={`absolute bottom-0 md:top-0 right-0 z-40 w-full md:w-[480px] h-[55%] md:h-screen border-t md:border-t-0 md:border-l border-white/10 shadow-2xl backdrop-blur-xl flex flex-col transition-all duration-300 ${
          theme === 'gold' ? 'gold-glass-panel' :
          theme === 'emerald' ? 'emerald-glass-panel' :
          theme === 'rose' ? 'rose-glass-panel' :
          theme === 'ruby' ? 'ruby-glass-panel' :
          theme === 'nebula' ? 'nebula-glass-panel' :
          'glass-panel'
        }`}>
          
          {/* Header Action Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-500 tracking-wider">DIVINE REVELATION</span>
              <span className="font-mono text-xs text-amber-500 font-bold tracking-widest">#{selectedName.id} / 99</span>
            </div>

            <button
              onClick={() => {
                setSelectedName(null);
                audio.playSparkle('hover');
              }}
              className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Details Content Container */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {/* Spectacular Central Arabic Text Calligraphy Display Card */}
            <div className="relative bg-black/50 border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center overflow-visible group shadow-2xl">
              <div className="absolute inset-0 bg-amber-500/5 blur-[50px] opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none" />
              
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="font-mono text-[8px] uppercase text-amber-500/70 tracking-[0.2em] font-bold">
                  {selectedName.category}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              </div>

              {/* Glowing Halo backdrop */}
              <div className="absolute -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />

              <h3 className="font-arabic text-6xl md:text-7xl text-white leading-relaxed tracking-widest pt-14 pb-10 drop-shadow-[0_10px_30px_rgba(245,158,11,0.3)] select-all transition-transform duration-500 group-hover:scale-105">
                {selectedName.name}
              </h3>

              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
                <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-amber-500/20 rounded-full px-4 py-1.5">
                  <span className="text-amber-500 text-xs">★</span>
                  <span className="text-xs tracking-[0.25em] uppercase font-semibold text-amber-50 font-display">
                    {selectedName.transliteration}
                  </span>
                  {completed.includes(selectedName.id) && (
                    <div className="w-3.5 h-3.5 border border-emerald-500/50 rounded-full flex items-center justify-center bg-emerald-500/10">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => audio.playNameAudio(selectedName.transliteration, selectedName.name, selectedName.id)}
                  title="Listen to Divine Pronunciation"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/35 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/10 pointer-events-auto text-[10px] uppercase font-mono tracking-wider"
                >
                  <Play size={10} className="fill-amber-300 text-amber-300 animate-pulse" />
                  <span>Listen Audio</span>
                </button>

                <PronunciationGuide 
                  nameId={selectedName.id}
                  transliteration={selectedName.transliteration}
                  arabicName={selectedName.name}
                  onPlayAudio={() => audio.playNameAudio(selectedName.transliteration, selectedName.name, selectedName.id)}
                />
              </div>
            </div>

            {/* TRANSLATIONS SECTION (English, Bengali) */}
            <div className="flex flex-col gap-4 bg-black/40 backdrop-blur-xl p-5 border-l-2 border-amber-500/40 rounded-r-2xl border border-white/5 shadow-lg">
              <div className="flex items-start gap-3">
                <Globe size={18} className="text-amber-500 mt-1 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest leading-none mb-1">English Translation</span>
                  <span className="text-lg font-light text-white tracking-wide">{selectedName.english}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 flex items-start gap-3">
                <BookOpen size={18} className="text-amber-500/80 mt-1 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest leading-none mb-1">Bengali / বাংলা অর্থ</span>
                  <span className="text-lg font-serif text-amber-400 font-light">{selectedName.bengali}</span>
                </div>
              </div>
            </div>

            {/* DEEP THEOLOGICAL EXPLANATION */}
            <div className="flex flex-col gap-1.5">
              <h5 className="font-mono text-[9px] text-gray-500 uppercase tracking-[0.2em]">Theological Depth</h5>
              <p className="text-xs text-gray-400 leading-relaxed font-sans bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
                {selectedName.explanation}
              </p>
            </div>

            {/* RECITATION BENEFITS */}
            <div className="flex flex-col gap-1.5">
              <h5 className="font-mono text-[9px] text-amber-500/60 uppercase tracking-[0.2em]">Spiritual Blessings</h5>
              <div className="flex items-start gap-3 bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-100/90 leading-relaxed shadow-lg">
                <Sparkles size={16} className="mt-0.5 text-amber-400 shrink-0 animate-pulse" />
                <span>{selectedName.benefits}</span>
              </div>
            </div>

            {/* AI MEDITATIVE REFLECTION */}
            <div className="flex flex-col gap-2.5 border border-purple-500/20 bg-purple-950/5 rounded-2xl p-4.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400 animate-pulse" />
                  <h5 className="font-mono text-[9px] text-purple-300 uppercase tracking-[0.2em] font-bold">AI Meditative Reflection</h5>
                </div>
                {meditationText && !meditationLoading && (
                  <button
                    onClick={() => fetchMeditation(selectedName)}
                    className="text-[9px] font-mono text-purple-400 hover:text-purple-300 transition-colors uppercase font-semibold cursor-pointer"
                  >
                    Refresh
                  </button>
                )}
              </div>

              {meditationLoading && (
                <div className="py-4 flex flex-col items-center justify-center gap-2 text-center text-slate-400 font-sans text-xs">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-[10px] tracking-wider text-purple-300 uppercase">Generating Reflection...</span>
                </div>
              )}

              {meditationError && (
                <div className="py-3 text-center text-xs text-red-400 bg-red-950/20 border border-red-900/40 rounded-xl p-3">
                  <p className="mb-2">{meditationError}</p>
                  <button
                    onClick={() => fetchMeditation(selectedName)}
                    className="px-3 py-1 bg-red-500/20 text-red-300 font-mono text-[9px] uppercase tracking-wider rounded-md border border-red-500/30 hover:bg-red-500/30 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!meditationText && !meditationLoading && !meditationError && (
                <div className="py-2 flex flex-col items-center">
                  <button
                    onClick={() => fetchMeditation(selectedName)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-500/35 text-purple-200 hover:text-white font-mono text-[10px] tracking-wider uppercase font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Sparkles size={12} className="text-purple-400" />
                    <span>Generate Meditative thought</span>
                  </button>
                </div>
              )}

              {meditationText && !meditationLoading && (
                <p className="text-xs text-purple-100/90 leading-relaxed font-sans italic pl-3 border-l-2 border-purple-500/40 py-1 bg-purple-500/5 rounded-r-lg p-2.5">
                  "{meditationText}"
                </p>
              )}
            </div>
          </div>

          {/* Action Checkboxes Control Center */}
          <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              {/* Dynamic stats tracker integrated into drawer footer */}
              <div className="flex-1 flex flex-col">
                <p className="text-[9px] text-gray-500 tracking-widest uppercase mb-1 font-mono">Completion</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-light text-white">{completed.length}</span>
                  <span className="text-gray-600 text-xs">/ 99</span>
                </div>
                <div className="w-full h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Elegant circular control buttons */}
              <div className="flex gap-3 items-center shrink-0">
                {/* Playlist queue button */}
                <button
                  onClick={() => togglePlaylist(selectedName.id)}
                  title={playlist.includes(selectedName.id) ? 'Remove from Recitation Loop Queue' : 'Add to Recitation Loop Queue'}
                  className={`w-12 h-12 rounded-full border transition-all flex items-center justify-center ${
                    playlist.includes(selectedName.id)
                      ? 'border-amber-400 bg-amber-400/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'border-white/20 bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <ListPlus size={18} className={playlist.includes(selectedName.id) ? 'text-amber-300 animate-pulse' : ''} />
                </button>

                {/* Favorites button */}
                <button
                  onClick={() => toggleFavorite(selectedName.id)}
                  title={favorites.includes(selectedName.id) ? 'Remove Favorite' : 'Add to Favorites'}
                  className={`w-12 h-12 rounded-full border transition-all flex items-center justify-center ${
                    favorites.includes(selectedName.id)
                      ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'border-white/20 bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Star size={18} className={favorites.includes(selectedName.id) ? 'fill-amber-400 text-amber-400' : ''} />
                </button>

                {/* Recited/Completed button */}
                <button
                  onClick={() => toggleCompleted(selectedName.id)}
                  title={completed.includes(selectedName.id) ? 'Mark Incomplete' : 'Mark Recited & Memorized'}
                  className={`w-12 h-12 rounded-full border transition-all flex items-center justify-center ${
                    completed.includes(selectedName.id)
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                      : 'border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                  }`}
                >
                  <CheckSquare size={18} className={completed.includes(selectedName.id) ? 'text-emerald-400 font-bold' : 'text-amber-500'} />
                </button>
              </div>
            </div>

            {/* Pagination Navigation */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3 font-mono text-[10px] text-slate-400">
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 hover:text-white transition-all bg-black/40 px-3 py-1.5 rounded-lg border border-white/5"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              
              <span className="text-slate-500 tracking-wider">NAME {selectedName.id} / 99</span>

              <button
                onClick={handleNext}
                className="flex items-center gap-1 hover:text-white transition-all bg-black/40 px-3 py-1.5 rounded-lg border border-white/5"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* TOAST SYSTEM ALERTS VIEW STACK */}
      <div id="toast-alerts-stack" className="absolute bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[#050505]/95 border border-amber-500/30 backdrop-blur-md rounded-xl p-3.5 shadow-2xl flex flex-col gap-1 text-slate-100 animate-fade-in-up"
          >
            <div className="flex items-center gap-2 text-amber-300 font-sans font-semibold text-xs">
              <Sparkles size={12} className="animate-pulse" />
              <span>{toast.title}</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* OVERLAY MODALS */}
      <GestureTutorial forceShow={forceShowTutorial} onClose={() => setForceShowTutorial(false)} />
      
      <CertificateModal 
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        completedCount={completed.length}
        favoritesCount={favorites.length}
        userEmail={currentUser ? currentUser.email : null}
      />
    </div>
  );
}
