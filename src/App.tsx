import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
import { getQuranReferences } from './quranData';
import { SpiritualDashboardModal, FlashcardsModal, BadgesModal } from './components/LearningModules';
import { GalaxyCanvas } from './components/GalaxyCanvas';
import { AuthDialog } from './components/AuthDialog';
import { NotificationHub } from './components/NotificationHub';
import { AudioEqualizer } from './components/AudioEqualizer';
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
  ListPlus,
  Calendar,
  Trophy,
  Layers,
  Square,
  SkipForward,
  SkipBack,
  Headphones,
  Disc,
  Orbit
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
  const [theme, setTheme] = useState<'slate' | 'gold' | 'emerald' | 'rose' | 'ruby' | 'nebula' | 'sapphire' | 'amber' | 'amethyst'>('slate');
  const [activeRightMenu, setActiveRightMenu] = useState<'architecture' | 'theme' | 'galaxy' | null>(null);
  const [galaxyType, setGalaxyType] = useState<'andromeda' | 'milkyway' | 'orion' | 'cosmicweb' | 'blackhole' | 'cluster' | 'pulsar' | 'supernova' | 'solarwind'>('andromeda');
  const galaxyCanvasRef = React.useRef<any>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showAuth, setShowAuth] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [appThemeMode, setAppThemeMode] = useState<'dark' | 'light' | 'midnight' | 'sepia'>('dark');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Filtering and selection states
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'completed'>('all');
  const [visualizationType, setVisualizationType] = useState<'spiral' | 'nebula' | 'cluster' | 'wave' | 'supernova' | 'infinity' | 'galaxy' | 'pulsar' | 'aurora'>('spiral');
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
  const [activeSidebarTab, setActiveSidebarTab] = useState<'directory' | 'dhikr' | 'stats'>('directory');

  // Custom Wird Litany Playlists
  const [customPlaylists, setCustomPlaylists] = useState<Array<{ id: string; name: string; nameIds: number[] }>>([
    {
      id: 'morning_protection',
      name: 'Morning Protection (Daily)',
      nameIds: [1, 2, 4, 5, 23, 24, 62] // Ar-Rahman, Ar-Rahim, Al-Quddus, As-Salam, etc.
    },
    {
      id: 'hardship_relief',
      name: 'Hardship Relief (Litany)',
      nameIds: [12, 22, 29, 30, 31, 32, 33] // Al-Khaliq, Al-Ghaffar, Al-Fattah, etc.
    }
  ]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  // Localization / Translations
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'bengali' | 'urdu' | 'indonesian' | 'turkish' | 'french'>('english');
  const [translationCache, setTranslationCache] = useState<Record<number, Record<string, { meaning: string; explanation: string; benefits: string }>>>({});
  const [translationLoading, setTranslationLoading] = useState(false);

  // Tasbih Digital Counter
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTarget] = useState<number | 'free'>(33);
  const [tasbihParticles, setTasbihParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  // Advanced features states
  const [showDashboardModal, setShowDashboardModal] = useState<boolean>(false);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState<boolean>(false);
  const [showBadgesModal, setShowBadgesModal] = useState<boolean>(false);
  const [qariStyle, setQariStyle] = useState<'studio' | 'ghamdi_echo' | 'sudais_grand' | 'celestial'>('celestial');
  const [dhikrInterval, setDhikrInterval] = useState<number>(0); // Seconds: 0, 1, 3, 5, 10
  const [translationSyncEnabled, setTranslationSyncEnabled] = useState<boolean>(true);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [reflectionInput, setReflectionInput] = useState<string>('');

  // Leitner Flashcard system box tracking: Record<nameId, boxNumber (1-5)>
  const [leitnerBoxes, setLeitnerBoxes] = useState<Record<number, number>>({});
  
  // Reflection journal: Record<nameId, {text: string, timestamp: string}[]>
  const [reflections, setReflections] = useState<Record<number, { text: string; timestamp: string }[]>>({});

  // Spiritual Streaks / History heat-map data: Record<"YYYY-MM-DD", recitationCount>
  const [recitationHistory, setRecitationHistory] = useState<Record<string, number>>({});

  // Detailed recitation logs
  const [recitationLogs, setRecitationLogs] = useState<Array<{ timestamp: string; nameId: number; nameTranslit: string }>>([]);

  // Daily goal and star density states
  const [dailyGoalTarget, setDailyGoalTarget] = useState<number>(() => {
    const cached = localStorage.getItem('allah_names_daily_goal_target');
    return cached ? parseInt(cached, 10) : 5;
  });

  const [starDensity, setStarDensity] = useState<number>(() => {
    const cached = localStorage.getItem('allah_names_star_density');
    return cached ? parseInt(cached, 10) : 9000;
  });

  const [particleSize, setParticleSize] = useState<number>(() => {
    const cached = localStorage.getItem('allah_names_particle_size');
    return cached ? parseFloat(cached) : 0.35;
  });

  const [constellationMode, setConstellationMode] = useState<boolean>(() => {
    const cached = localStorage.getItem('allah_names_constellation_mode');
    return cached !== 'false'; // default true
  });

  const [leitnerRemindersEnabled, setLeitnerRemindersEnabled] = useState<boolean>(() => {
    const cached = localStorage.getItem('allah_names_leitner_reminders');
    return cached === 'true'; // default false
  });

  const [autoPlayOnSelect, setAutoPlayOnSelect] = useState<boolean>(() => {
    const cached = localStorage.getItem('allah_names_autoplay_on_select');
    return cached !== 'false'; // default true
  });

  // Theme helper definitions
  const isLight = appThemeMode === 'light' || appThemeMode === 'sepia';

  const getGlassPanelClass = () => {
    if (appThemeMode === 'light') return 'light-glass-panel text-slate-800 border-black/10';
    if (appThemeMode === 'midnight') return 'midnight-glass-panel text-blue-100 border-blue-500/25';
    if (appThemeMode === 'sepia') return 'sepia-glass-panel text-amber-950 border-amber-800/15';
    
    if (theme === 'gold') return 'gold-glass-panel text-[#f4ebd0] border-amber-500/30';
    if (theme === 'emerald') return 'emerald-glass-panel text-emerald-100 border-emerald-500/30';
    if (theme === 'rose') return 'rose-glass-panel text-rose-100 border-fuchsia-500/30';
    if (theme === 'ruby') return 'ruby-glass-panel text-red-100 border-red-500/30';
    if (theme === 'nebula') return 'nebula-glass-panel text-indigo-100 border-violet-500/30';
    if (theme === 'sapphire') return 'sapphire-glass-panel text-blue-100 border-blue-500/30';
    if (theme === 'amber') return 'amber-glass-panel text-orange-100 border-amber-600/30';
    if (theme === 'amethyst') return 'amethyst-glass-panel text-purple-100 border-purple-500/30';
    return 'glass-panel text-slate-100 border-white/10';
  };

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
    const cachedGalaxyType = localStorage.getItem('allah_names_galaxy_type');
    const cachedLeitner = localStorage.getItem('leitner_boxes');
    const cachedReflections = localStorage.getItem('user_reflections');
    const cachedHistory = localStorage.getItem('recitation_history');
    const cachedLogs = localStorage.getItem('recitation_logs');
    const cachedPlaylists = localStorage.getItem('allah_names_custom_playlists');
    const cachedTranslations = localStorage.getItem('allah_names_translation_cache');

    if (cachedFavs) setFavorites(JSON.parse(cachedFavs));
    if (cachedComp) setCompleted(JSON.parse(cachedComp));
    if (cachedLeitner) setLeitnerBoxes(JSON.parse(cachedLeitner));
    if (cachedReflections) setReflections(JSON.parse(cachedReflections));
    if (cachedHistory) setRecitationHistory(JSON.parse(cachedHistory));
    if (cachedLogs) setRecitationLogs(JSON.parse(cachedLogs));
    if (cachedPlaylists) setCustomPlaylists(JSON.parse(cachedPlaylists));
    if (cachedTranslations) setTranslationCache(JSON.parse(cachedTranslations));
    if (cachedTheme && ['slate', 'gold', 'emerald', 'rose', 'ruby', 'nebula', 'sapphire', 'amber', 'amethyst'].includes(cachedTheme)) {
      setTheme(cachedTheme as any);
    }
    const cachedAppThemeMode = localStorage.getItem('app_theme_mode');
    if (cachedAppThemeMode && ['dark', 'light', 'midnight', 'sepia'].includes(cachedAppThemeMode)) {
      setAppThemeMode(cachedAppThemeMode as any);
    }
    if (cachedGalaxyType) {
      setGalaxyType(cachedGalaxyType as any);
    }
  }, []);

  // 3. Sync theme & galaxyType state
  useEffect(() => {
    localStorage.setItem('allah_names_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app_theme_mode', appThemeMode);
  }, [appThemeMode]);

  useEffect(() => {
    localStorage.setItem('allah_names_galaxy_type', galaxyType);
  }, [galaxyType]);

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

  // On-demand translations fetch & cache effect
  useEffect(() => {
    if (!selectedName || selectedLanguage === 'english' || selectedLanguage === 'bengali') return;

    const cached = translationCache[selectedName.id]?.[selectedLanguage];
    if (cached) return; // Already cached!

    const fetchTranslation = async () => {
      setTranslationLoading(true);
      try {
        const res = await fetch('/api/gemini/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nameId: selectedName.id,
            arabicName: selectedName.name,
            transliteration: selectedName.transliteration,
            english: selectedName.english,
            explanation: selectedName.explanation,
            benefits: selectedName.benefits,
            targetLanguage: selectedLanguage
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.meaning && data.explanation && data.benefits) {
            setTranslationCache(prev => {
              const updated = {
                ...prev,
                [selectedName.id]: {
                  ...(prev[selectedName.id] || {}),
                  [selectedLanguage]: {
                    meaning: data.meaning,
                    explanation: data.explanation,
                    benefits: data.benefits
                  }
                }
              };
              localStorage.setItem('allah_names_translation_cache', JSON.stringify(updated));
              return updated;
            });
            triggerToast(`Translated detail page successfully to ${selectedLanguage.toUpperCase()}!`, 'Dynamic Translation');
          } else {
            console.warn("Invalid translation response body", data);
          }
        } else {
          console.error("Translation request failed status", res.status);
        }
      } catch (err) {
        console.error("Translation fetch error:", err);
      } finally {
        setTranslationLoading(false);
      }
    };

    fetchTranslation();
  }, [selectedName, selectedLanguage]);

  // Word-by-word synced highlighting effect for Studio audio and Simulated speech
  useEffect(() => {
    const vocal = audio.vocalAudio;
    if (!vocal) return;

    const handleTimeUpdate = () => {
      if (!selectedName || !translationSyncEnabled) {
        setActiveWordIndex(-1);
        return;
      }
      const words = selectedName.english.split(' ');
      const duration = vocal.duration || 4.5;
      const currentTime = vocal.currentTime || 0;
      
      if (vocal.paused || currentTime === 0) {
        setActiveWordIndex(-1);
        return;
      }

      const ratio = currentTime / duration;
      const index = Math.floor(ratio * words.length);
      setActiveWordIndex(Math.min(index, words.length - 1));
    };

    const handleEnded = () => {
      setActiveWordIndex(-1);
    };

    vocal.addEventListener('timeupdate', handleTimeUpdate);
    vocal.addEventListener('ended', handleEnded);
    vocal.addEventListener('pause', handleEnded);

    return () => {
      vocal.removeEventListener('timeupdate', handleTimeUpdate);
      vocal.removeEventListener('ended', handleEnded);
      vocal.removeEventListener('pause', handleEnded);
    };
  }, [selectedName, qariStyle, translationSyncEnabled]);

  useEffect(() => {
    if (qariStyle !== 'celestial' || !selectedName || !translationSyncEnabled) {
      setActiveWordIndex(-1);
      return;
    }

    const words = selectedName.english.split(' ');
    const totalDuration = 2500; // 2.5 seconds
    const intervalMs = totalDuration / words.length;

    setActiveWordIndex(0);
    let currentIdx = 0;

    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx < words.length) {
        setActiveWordIndex(currentIdx);
      } else {
        setActiveWordIndex(-1);
        clearInterval(interval);
      }
    }, intervalMs);

    return () => {
      clearInterval(interval);
      setActiveWordIndex(-1);
    };
  }, [selectedName, qariStyle, translationSyncEnabled]);

  // Recitation logging & streak calculation
  const recordRecitation = (id: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetName = namesOfAllah.find(n => n.id === id);
    const nameTranslit = targetName ? targetName.transliteration : `Name #${id}`;

    // 1. Update daily counts mapping
    setRecitationHistory(prev => {
      const currentCount = prev[todayStr] || 0;
      const updated = { ...prev, [todayStr]: currentCount + 1 };
      localStorage.setItem('recitation_history', JSON.stringify(updated));

      if (auth.currentUser) {
        const userDocRef = doc(db, 'user_data', auth.currentUser.uid);
        setDoc(userDocRef, {
          recitationHistory: updated,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => console.error("Cloud history sync error:", err));
      }

      return updated;
    });

    // 2. Update detailed logs array
    setRecitationLogs(prev => {
      const newLog = {
        timestamp: new Date().toISOString(),
        nameId: id,
        nameTranslit: nameTranslit
      };
      const updated = [...prev, newLog].slice(-100); // Keep last 100 entries
      localStorage.setItem('recitation_logs', JSON.stringify(updated));

      if (auth.currentUser) {
        const userDocRef = doc(db, 'user_data', auth.currentUser.uid);
        setDoc(userDocRef, {
          recitationLogs: updated,
        }, { merge: true }).catch(err => console.error("Cloud logs sync error:", err));
      }

      return updated;
    });
  };

  const handleUpdateDailyGoalTarget = (newTarget: number) => {
    const target = Math.max(1, Math.min(99, newTarget));
    setDailyGoalTarget(target);
    localStorage.setItem('allah_names_daily_goal_target', target.toString());

    if (auth.currentUser) {
      const userDocRef = doc(db, 'user_data', auth.currentUser.uid);
      setDoc(userDocRef, {
        dailyGoalTarget: target,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.error("Cloud daily goal target sync error:", err));
    }
  };

  // SPACED REPETITION REMINDERS & NOTIFICATION SYSTEM
  const checkAndNotifyDueLeitner = (forceNotify: boolean = false) => {
    if (!('Notification' in window)) {
      if (forceNotify) {
        triggerToast("Your browser does not support desktop notifications.", "Reminders");
      }
      return;
    }

    // Calculate due cards
    const timestamps = JSON.parse(localStorage.getItem('user_leitner_timestamps') || '{}');
    const boxes = leitnerBoxes;
    const now = Date.now();
    
    let dueBox2 = 0;
    let dueBox3 = 0;

    Object.keys(boxes).forEach((idStr) => {
      const id = parseInt(idStr, 10);
      const box = boxes[id];
      const lastReviewed = timestamps[id] || 0;
      const elapsedMs = now - lastReviewed;

      // Box 2 is due after 48h (2 days = 172800000 ms)
      if (box === 2 && (lastReviewed === 0 || elapsedMs >= 2 * 24 * 3600 * 1000)) {
        dueBox2++;
      }
      // Box 3 is due after 96h (4 days = 345600000 ms)
      if (box === 3 && (lastReviewed === 0 || elapsedMs >= 4 * 24 * 3600 * 1000)) {
        dueBox3++;
      }
    });

    const totalDue = dueBox2 + dueBox3;

    if (totalDue > 0 || forceNotify) {
      if (Notification.permission === 'granted') {
        let title = "Leitner Repetition Review Due";
        let body = "";

        if (dueBox2 > 0 && dueBox3 > 0) {
          body = `You have ${dueBox2} cards in Box 2 and ${dueBox3} cards in Box 3 ready for spaced repetition review!`;
        } else if (dueBox2 > 0) {
          body = `You have ${dueBox2} cards in Box 2 ready for review (48-hour cycle).`;
        } else if (dueBox3 > 0) {
          body = `You have ${dueBox3} cards in Box 3 ready for review (96-hour cycle).`;
        } else {
          body = `All your cards are current! Keep up the daily consistency to build your streak.`;
        }

        new Notification(title, {
          body: body,
          icon: "/icon.png"
        });

        triggerToast(`Sent reminder: ${totalDue} cards due for review!`, "Reminders");
      } else if (forceNotify) {
        triggerToast("Please grant notification permissions to enable reminders.", "Reminders");
      }
    }
  };

  const handleToggleReminders = () => {
    if (!('Notification' in window)) {
      triggerToast("Desktop notifications are not supported in this browser.", "Reminders");
      return;
    }

    if (Notification.permission === 'denied') {
      triggerToast("Notification permission was previously denied. Please reset permissions in your browser address bar.", "Reminders");
      return;
    }

    if (!leitnerRemindersEnabled) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setLeitnerRemindersEnabled(true);
          localStorage.setItem('allah_names_leitner_reminders', 'true');
          triggerToast("Spaced Repetition Reminders Enabled!", "Reminders");
          
          // Send nice confirmation notification immediately
          new Notification("Reminders Subscribed", {
            body: "You will receive timely alerts when Box 2 or Box 3 cards are due for memorization review.",
            icon: "/icon.png"
          });
        } else {
          triggerToast("Notification permission denied.", "Reminders");
        }
      });
    } else {
      setLeitnerRemindersEnabled(false);
      localStorage.setItem('allah_names_leitner_reminders', 'false');
      triggerToast("Reminders Disabled.", "Reminders");
    }
  };

  // Check on load after 5 seconds
  useEffect(() => {
    if (leitnerRemindersEnabled && Notification.permission === 'granted') {
      const delayTimer = setTimeout(() => {
        checkAndNotifyDueLeitner(false);
      }, 5000);
      return () => clearTimeout(delayTimer);
    }
  }, [leitnerRemindersEnabled, leitnerBoxes]);

  // Streak calculators
  const getStreaks = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentStreak = 0;
    let checkDate = new Date();

    if (!recitationHistory[todayStr] && recitationHistory[yesterdayStr]) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Limit to safe iterations
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (recitationHistory[dateStr] && recitationHistory[dateStr] > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    let maxStreak = 0;
    let tempStreak = 0;
    const sortedDates = Object.keys(recitationHistory).sort();
    if (sortedDates.length > 0) {
      let prevDate: Date | null = null;
      sortedDates.forEach(dateStr => {
        const currentDate = new Date(dateStr);
        if (prevDate === null) {
          tempStreak = 1;
        } else {
          const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            maxStreak = Math.max(maxStreak, tempStreak);
            tempStreak = 1;
          }
        }
        prevDate = currentDate;
      });
      maxStreak = Math.max(maxStreak, tempStreak);
    }

    return { 
      current: currentStreak, 
      max: Math.max(maxStreak, currentStreak),
      currentStreak: currentStreak,
      maxStreak: Math.max(maxStreak, currentStreak),
      lastRecitation: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null
    };
  };

  const getNamesStudiedToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const studiedToday = recitationLogs.filter(log => {
      return log.timestamp && log.timestamp.split('T')[0] === todayStr;
    });
    const uniqueIds = new Set(studiedToday.map(log => log.nameId));
    return uniqueIds.size;
  };

  // Save reflection journal entries
  const saveReflection = (text: string) => {
    if (!selectedName || !text.trim()) return;
    const newEntry = {
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    setReflections(prev => {
      const currentList = prev[selectedName.id] || [];
      const updated = { ...prev, [selectedName.id]: [newEntry, ...currentList] };
      localStorage.setItem('user_reflections', JSON.stringify(updated));

      if (auth.currentUser) {
        const userDocRef = doc(db, 'user_data', auth.currentUser.uid);
        setDoc(userDocRef, {
          reflections: updated,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => console.error("Cloud reflection save error:", err));
      }

      return updated;
    });
    triggerToast("Private reflection journal entry saved.", "Journal Entry");
    audio.playSparkle('complete');
  };

  // Custom Wird Litany Playlist Manager Functions
  const saveCurrentQueueAsPlaylist = (name: string) => {
    if (playlist.length === 0) {
      triggerToast("Your recitation queue is currently empty. Add names first!", "Error");
      return;
    }
    const cleanName = name.trim();
    if (!cleanName) {
      triggerToast("Please enter a valid name for your playlist.", "Error");
      return;
    }

    const newWird = {
      id: 'wird_' + Date.now(),
      name: cleanName,
      nameIds: [...playlist]
    };

    setCustomPlaylists(prev => {
      const updated = [...prev, newWird];
      localStorage.setItem('allah_names_custom_playlists', JSON.stringify(updated));

      // Sync to Firestore
      if (auth.currentUser) {
        const userDocRef = doc(db, 'user_data', auth.currentUser.uid);
        setDoc(userDocRef, {
          playlists: updated,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => console.error("Cloud playlist save error:", err));
      }

      return updated;
    });

    triggerToast(`Custom Wird playlist "${cleanName}" created successfully.`, "Wird Saved");
    setNewPlaylistName('');
    setIsCreatingPlaylist(false);
    audio.playSparkle('complete');
  };

  const deleteCustomPlaylist = (id: string) => {
    setCustomPlaylists(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('allah_names_custom_playlists', JSON.stringify(updated));

      // Sync to Firestore
      if (auth.currentUser) {
        const userDocRef = doc(db, 'user_data', auth.currentUser.uid);
        setDoc(userDocRef, {
          playlists: updated,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => console.error("Cloud playlist sync error:", err));
      }

      return updated;
    });
    triggerToast("Custom Wird playlist deleted.", "Wird Deleted");
    audio.playSparkle('click');
  };

  const loadCustomPlaylist = (nameIds: number[], playlistName: string) => {
    setPlaylist(nameIds);
    setIsPlaylistPlaying(true);
    setCurrentPlaylistIndex(0);
    
    const firstId = nameIds[0];
    const item = namesOfAllah.find(n => n.id === firstId);
    if (item) {
      setSelectedName(item);
      audio.playNameAudio(item.transliteration, item.name, item.id, qariStyle);
      recordRecitation(item.id);
    }
    triggerToast(`Loaded "${playlistName}" and started recitation queue!`, "Wird Chanting");
    audio.playSparkle('complete');
  };

  // Tasbih Digital Incrementer
  const incrementTasbih = () => {
    if (!selectedName) return;

    audio.playSparkle('click');
    if (navigator.vibrate) {
      navigator.vibrate(35);
    }

    setTasbihCount(prev => {
      const nextCount = prev + 1;

      // Burst particles locally on screen
      const colors = ['#f59e0b', '#fbbf24', '#fcd34d', '#10b981', '#3b82f6', '#ec4899'];
      const newParticles = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 160,
        y: (Math.random() - 0.5) * 160,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setTasbihParticles(prevP => [...prevP, ...newParticles]);
      setTimeout(() => {
        setTasbihParticles(prevP => prevP.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 1000);

      if (tasbihTarget !== 'free' && nextCount >= tasbihTarget) {
        audio.playSparkle('complete');
        triggerToast(`Completed ${tasbihTarget} recitations of ${selectedName.transliteration}!`, 'Tasbih Complete');
        
        recordRecitation(selectedName.id);
        
        if (!completed.includes(selectedName.id)) {
          setCompleted(c => {
            const up = [...c, selectedName.id];
            localStorage.setItem('allah_names_comp', JSON.stringify(up));
            if (auth.currentUser) {
              const userDocRef = doc(db, 'user_data', auth.currentUser.uid);
              setDoc(userDocRef, {
                completed: up,
                updatedAt: new Date().toISOString()
              }, { merge: true }).catch(err => console.error("Cloud completed save error:", err));
            }
            return up;
          });
        }

        // Auto advance recitation queue if active
        if (isPlaylistPlaying && currentPlaylistIndex !== null) {
          setTimeout(() => {
            const nextIdx = currentPlaylistIndex + 1;
            if (nextIdx < playlist.length) {
              playPlaylistItem(nextIdx);
              triggerToast("Advancing recitation queue to next name...", "Tasbih Queue");
            } else {
              setIsPlaylistPlaying(false);
              setCurrentPlaylistIndex(null);
              triggerToast("Recitation loop queue complete!", "Tasbih Queue");
            }
          }, 1200);
        }

        return 0; // Reset counter on reaching target
      }

      return nextCount;
    });
  };

  // Reset counter when selecting a new name
  useEffect(() => {
    setTasbihCount(0);
  }, [selectedName]);

  // Spacebar event listener for Tasbih
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedName && e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        incrementTasbih();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedName, tasbihTarget, isPlaylistPlaying, currentPlaylistIndex, playlist]);

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
      audio.playNameAudio(item.transliteration, item.name, item.id, qariStyle);
      recordRecitation(item.id);
    }
  };

  useEffect(() => {
    if (!isPlaylistPlaying || currentPlaylistIndex === null) return;

    if (qariStyle === 'studio') {
      const vocal = audio.vocalAudio;
      if (!vocal) return;

      const handleEnded = () => {
        const timer = setTimeout(() => {
          const nextIndex = currentPlaylistIndex + 1;
          playPlaylistItem(nextIndex);
        }, dhikrInterval * 1000);
        return () => clearTimeout(timer);
      };

      vocal.addEventListener('ended', handleEnded);
      return () => vocal.removeEventListener('ended', handleEnded);
    } else {
      const timer = setTimeout(() => {
        const nextIndex = currentPlaylistIndex + 1;
        playPlaylistItem(nextIndex);
      }, 4500 + dhikrInterval * 1000);

      return () => clearTimeout(timer);
    }
  }, [isPlaylistPlaying, currentPlaylistIndex, playlist, qariStyle, dhikrInterval]);

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
            const cloudLeitner = data.leitnerBoxes || {};
            const cloudReflections = data.reflections || {};
            const cloudHistory = data.recitationHistory || {};
            const cloudLogs = data.recitationLogs || [];
            const cloudPlaylists = data.playlists || [];
            const cloudTarget = data.dailyGoalTarget;

            if (cloudTarget) {
              setDailyGoalTarget(cloudTarget);
              localStorage.setItem('allah_names_daily_goal_target', cloudTarget.toString());
            }
            
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
            setLeitnerBoxes(prev => {
              const merged = { ...prev, ...cloudLeitner };
              localStorage.setItem('leitner_boxes', JSON.stringify(merged));
              return merged;
            });
            setReflections(prev => {
              const merged = { ...prev, ...cloudReflections };
              localStorage.setItem('user_reflections', JSON.stringify(merged));
              return merged;
            });
            setRecitationHistory(prev => {
              const merged = { ...prev, ...cloudHistory };
              localStorage.setItem('recitation_history', JSON.stringify(merged));
              return merged;
            });
            setCustomPlaylists(prev => {
              const merged = cloudPlaylists.length > 0 ? cloudPlaylists : prev;
              localStorage.setItem('allah_names_custom_playlists', JSON.stringify(merged));
              return merged;
            });
            setRecitationLogs(prev => {
              const combined = [...prev, ...cloudLogs];
              const uniqueMap = new Map();
              combined.forEach(item => {
                if (item && item.timestamp) {
                  uniqueMap.set(item.timestamp, item);
                }
              });
              const merged = Array.from(uniqueMap.values())
                .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .slice(-100);
              localStorage.setItem('recitation_logs', JSON.stringify(merged));
              return merged as any;
            });
          } else {
            // First time logging in, write current local storage to firestore
            const currentFavs = JSON.parse(localStorage.getItem('allah_names_favs') || '[]');
            const currentComp = JSON.parse(localStorage.getItem('allah_names_comp') || '[]');
            const currentLeitner = JSON.parse(localStorage.getItem('leitner_boxes') || '{}');
            const currentReflections = JSON.parse(localStorage.getItem('user_reflections') || '{}');
            const currentHistory = JSON.parse(localStorage.getItem('recitation_history') || '{}');
            const currentLogs = JSON.parse(localStorage.getItem('recitation_logs') || '[]');
            const currentPlaylists = JSON.parse(localStorage.getItem('allah_names_custom_playlists') || '[]');
            const currentDailyGoalTarget = JSON.parse(localStorage.getItem('allah_names_daily_goal_target') || '5');
            await setDoc(userDocRef, {
              userId: user.uid,
              favorites: currentFavs,
              completed: currentComp,
              leitnerBoxes: currentLeitner,
              reflections: currentReflections,
              recitationHistory: currentHistory,
              recitationLogs: currentLogs,
              playlists: currentPlaylists,
              dailyGoalTarget: currentDailyGoalTarget,
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
      appThemeMode === 'light' ? 'bg-[#f6f5f3] text-slate-800' :
      appThemeMode === 'midnight' ? 'bg-[#030612] text-blue-100' :
      appThemeMode === 'sepia' ? 'bg-[#faf4e6] text-amber-950' :
      theme === 'gold' ? 'bg-[#050503] text-[#f4ebd0]' :
      theme === 'emerald' ? 'bg-[#010503] text-emerald-100' :
      theme === 'rose' ? 'bg-[#050104] text-rose-100' :
      theme === 'ruby' ? 'bg-[#050000] text-red-100' :
      theme === 'nebula' ? 'bg-[#010105] text-indigo-100' :
      theme === 'sapphire' ? 'bg-[#000108] text-blue-100' :
      theme === 'amber' ? 'bg-[#050200] text-orange-100' :
      theme === 'amethyst' ? 'bg-[#030106] text-purple-100' :
      'bg-[#020205] text-slate-100'
    }`}>
      
      {/* 3D WEBGL GALAXY BACKDROP */}
      <div className="absolute inset-0 w-full h-full z-0">
        <GalaxyCanvas
          ref={galaxyCanvasRef}
          selectedId={selectedName ? selectedName.id : null}
          onSelectName={(item) => {
            setSelectedName(item);
            if (autoPlayOnSelect) {
              audio.playNameAudio(item.transliteration, item.name, item.id, qariStyle);
            }
            audio.playSparkle('click');
          }}
          favorites={favorites}
          completed={completed}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          filterMode={filterMode}
          visualizationType={visualizationType}
          theme={theme}
          galaxyType={galaxyType}
          starDensity={starDensity}
          constellationMode={constellationMode}
          particleSize={particleSize}
        />
      </div>

      {/* FLOATING RIGHT SIDE CONTROLS (CELESTIAL CONTROL DECK) */}
      <div className="absolute right-6 bottom-[80px] z-30 flex flex-col gap-3 items-end pointer-events-none">
        
        {/* 1. COSMIC BACKDROP / GALAXY TYPE SWITCHER */}
        <div 
          onMouseEnter={() => {
            setActiveRightMenu('galaxy');
            audio.playSparkle('hover');
          }}
          onMouseLeave={() => {
            setActiveRightMenu(null);
          }}
          className="relative flex items-center gap-2 pointer-events-auto"
        >
          <div className={`absolute right-12 z-50 flex flex-col gap-3 w-[260px] p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform-gpu before:absolute before:inset-y-0 before:-right-4 before:w-4 before:content-[''] ${
            activeRightMenu === 'galaxy' 
              ? 'translate-x-0 opacity-100 scale-100 pointer-events-auto' 
              : 'translate-x-4 opacity-0 scale-95 pointer-events-none'
          } ${
            theme === 'gold' ? 'gold-glass-panel border-amber-500/30' :
            theme === 'emerald' ? 'emerald-glass-panel border-emerald-500/30' :
            theme === 'rose' ? 'rose-glass-panel border-fuchsia-500/30' :
            theme === 'ruby' ? 'ruby-glass-panel border-red-500/30' :
            theme === 'nebula' ? 'nebula-glass-panel border-violet-500/30' :
            theme === 'sapphire' ? 'sapphire-glass-panel border-blue-500/30' :
            theme === 'amber' ? 'amber-glass-panel border-amber-600/30' :
            theme === 'amethyst' ? 'amethyst-glass-panel border-purple-500/30' :
            'glass-panel border-white/10'
          }`}>
            <div className="grid grid-cols-3 gap-1.5 w-full">
              {[
                { id: 'andromeda', name: 'Andromeda', icon: '🌀' },
                { id: 'milkyway', name: 'Milky Way', icon: '🌌' },
                { id: 'orion', name: 'Orion Nebula', icon: '⭕' },
                { id: 'cosmicweb', name: 'Cosmic Web', icon: '🕸️' },
                { id: 'blackhole', name: 'Black Hole', icon: '🕳️' },
                { id: 'cluster', name: 'Star Cluster', icon: '🔮' },
                { id: 'pulsar', name: 'Pulsar Jet', icon: '💫' },
                { id: 'supernova', name: 'Supernova', icon: '💥' },
                { id: 'solarwind', name: 'Solar Wind', icon: '🌊' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setGalaxyType(opt.id as any);
                    audio.playSparkle('click');
                    setActiveRightMenu(null); // slide back to right
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-[9px] font-mono tracking-wider transition-all border text-center cursor-pointer ${
                    galaxyType === opt.id
                      ? theme === 'gold' ? 'bg-amber-500/25 border-amber-500/60 text-amber-200' :
                        theme === 'emerald' ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-200' :
                        theme === 'rose' ? 'bg-fuchsia-500/25 border-fuchsia-500/60 text-fuchsia-200' :
                        theme === 'ruby' ? 'bg-red-500/25 border-red-500/60 text-red-200' :
                        theme === 'nebula' ? 'bg-violet-500/25 border-violet-500/60 text-violet-200' :
                        theme === 'sapphire' ? 'bg-blue-500/25 border-blue-500/60 text-blue-200' :
                        theme === 'amber' ? 'bg-orange-500/25 border-orange-500/60 text-orange-200' :
                        theme === 'amethyst' ? 'bg-purple-500/25 border-purple-500/60 text-purple-200' :
                        'bg-sky-500/25 border-sky-500/60 text-sky-200'
                      : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm">{opt.icon}</span>
                  <span className="text-[8px] leading-tight truncate w-full">{opt.name}</span>
                </button>
              ))}
            </div>

            {/* STAR DENSITY ADJUSTMENT SLIDER */}
            <div className="border-t border-white/10 pt-2.5 flex flex-col gap-1.5 w-full">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-slate-400">
                <span>Star Density</span>
                <span className="text-amber-400 font-bold">{starDensity} stars</span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={starDensity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setStarDensity(val);
                  localStorage.setItem('allah_names_star_density', val.toString());
                }}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* PARTICLE SIZE ADJUSTMENT SLIDER */}
            <div className="border-t border-white/10 pt-2 flex flex-col gap-1.5 w-full">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-slate-400">
                <span>Particle Size</span>
                <span className="text-amber-400 font-bold">{particleSize.toFixed(2)}px</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="1.50"
                step="0.05"
                value={particleSize}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setParticleSize(val);
                  localStorage.setItem('allah_names_particle_size', val.toString());
                }}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* CONSTELLATION MODE TOGGLE */}
            <div className="border-t border-white/10 pt-2 flex items-center justify-between w-full">
              <span className="text-[10px] font-mono tracking-wider text-slate-400">Constellation Mode</span>
              <button
                onClick={() => {
                  setConstellationMode(!constellationMode);
                  audio.playSparkle('click');
                  localStorage.setItem('allah_names_constellation_mode', (!constellationMode).toString());
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  constellationMode ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    constellationMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* AUTOPLAY ON SELECT TOGGLE */}
            <div className="border-t border-white/10 pt-2 flex items-center justify-between w-full">
              <span className="text-[10px] font-mono tracking-wider text-slate-400">Auto-Play on Select</span>
              <button
                onClick={() => {
                  setAutoPlayOnSelect(!autoPlayOnSelect);
                  audio.playSparkle('click');
                  localStorage.setItem('allah_names_autoplay_on_select', (!autoPlayOnSelect).toString());
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoPlayOnSelect ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoPlayOnSelect ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveRightMenu(activeRightMenu === 'galaxy' ? null : 'galaxy');
              audio.playSparkle('click');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 ${
              activeRightMenu === 'galaxy'
                ? theme === 'gold' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                  theme === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                  theme === 'rose' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.3)]' :
                  theme === 'ruby' ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                  theme === 'nebula' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]' :
                  theme === 'sapphire' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                  theme === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                  theme === 'amethyst' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]' :
                  'bg-sky-500/20 text-sky-400 border border-sky-400/40 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                : theme === 'gold' ? 'gold-glass-panel text-amber-200 hover:border-amber-500/30' :
                  theme === 'emerald' ? 'emerald-glass-panel text-emerald-200 hover:border-emerald-500/30' :
                  theme === 'rose' ? 'rose-glass-panel text-fuchsia-200 hover:border-fuchsia-500/30' :
                  theme === 'ruby' ? 'ruby-glass-panel text-red-200 hover:border-red-500/30' :
                  theme === 'nebula' ? 'nebula-glass-panel text-violet-200 hover:border-violet-500/30' :
                  theme === 'sapphire' ? 'sapphire-glass-panel text-blue-200 hover:border-blue-500/30' :
                  theme === 'amber' ? 'amber-glass-panel text-amber-200 hover:border-amber-500/30' :
                  theme === 'amethyst' ? 'amethyst-glass-panel text-purple-200 hover:border-purple-500/30' :
                  'glass-panel text-slate-300 hover:border-white/20'
            }`}
            title="Cosmic Backdrop Aesthetics"
          >
            <Orbit size={16} />
          </button>
        </div>

        {/* 2. CELESTIAL ARCHITECTURE SWITCHER */}
        <div 
          onMouseEnter={() => {
            setActiveRightMenu('architecture');
            audio.playSparkle('hover');
          }}
          onMouseLeave={() => {
            setActiveRightMenu(null);
          }}
          className="relative flex items-center gap-2 pointer-events-auto"
        >
          <div className={`absolute right-12 z-50 grid grid-cols-3 gap-1.5 w-[240px] p-2.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform-gpu before:absolute before:inset-y-0 before:-right-4 before:w-4 before:content-[''] ${
            activeRightMenu === 'architecture' 
              ? 'translate-x-0 opacity-100 scale-100 pointer-events-auto' 
              : 'translate-x-4 opacity-0 scale-95 pointer-events-none'
          } ${
            theme === 'gold' ? 'gold-glass-panel border-amber-500/30' :
            theme === 'emerald' ? 'emerald-glass-panel border-emerald-500/30' :
            theme === 'rose' ? 'rose-glass-panel border-fuchsia-500/30' :
            theme === 'ruby' ? 'ruby-glass-panel border-red-500/30' :
            theme === 'nebula' ? 'nebula-glass-panel border-violet-500/30' :
            theme === 'sapphire' ? 'sapphire-glass-panel border-blue-500/30' :
            theme === 'amber' ? 'amber-glass-panel border-amber-600/30' :
            theme === 'amethyst' ? 'amethyst-glass-panel border-purple-500/30' :
            'glass-panel border-white/10'
          }`}>
            {[
              { id: 'spiral', name: 'Spiral', icon: '🌀' },
              { id: 'nebula', name: 'Nebula', icon: '⭕' },
              { id: 'cluster', name: 'Cluster', icon: '🌌' },
              { id: 'wave', name: 'Wave', icon: '🌊' },
              { id: 'supernova', name: 'Supernova', icon: '💥' },
              { id: 'infinity', name: 'Infinity', icon: '♾️' },
              { id: 'galaxy', name: 'Galaxy', icon: '🪐' },
              { id: 'pulsar', name: 'Pulsar', icon: '💫' },
              { id: 'aurora', name: 'Aurora', icon: '☄️' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  setVisualizationType(opt.id as any);
                  audio.playSparkle('click');
                  setActiveRightMenu(null); // slide back to right
                }}
                className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-[9px] font-mono tracking-wider transition-all border text-center cursor-pointer ${
                  visualizationType === opt.id
                    ? theme === 'gold' ? 'bg-amber-500/25 border-amber-500/60 text-amber-200' :
                      theme === 'emerald' ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-200' :
                      theme === 'rose' ? 'bg-fuchsia-500/25 border-fuchsia-500/60 text-fuchsia-200' :
                      theme === 'ruby' ? 'bg-red-500/25 border-red-500/60 text-red-200' :
                      theme === 'nebula' ? 'bg-violet-500/25 border-violet-500/60 text-violet-200' :
                      theme === 'sapphire' ? 'bg-blue-500/25 border-blue-500/60 text-blue-200' :
                      theme === 'amber' ? 'bg-orange-500/25 border-orange-500/60 text-orange-200' :
                      theme === 'amethyst' ? 'bg-purple-500/25 border-purple-500/60 text-purple-200' :
                      'bg-sky-500/25 border-sky-500/60 text-sky-200'
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-sm">{opt.icon}</span>
                <span className="text-[8px] leading-tight truncate w-full">{opt.name}</span>
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
                  theme === 'sapphire' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                  theme === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                  theme === 'amethyst' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]' :
                  'bg-sky-500/20 text-sky-400 border border-sky-400/40 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                : theme === 'gold' ? 'gold-glass-panel text-amber-200 hover:border-amber-500/30' :
                  theme === 'emerald' ? 'emerald-glass-panel text-emerald-200 hover:border-emerald-500/30' :
                  theme === 'rose' ? 'rose-glass-panel text-fuchsia-200 hover:border-fuchsia-500/30' :
                  theme === 'ruby' ? 'ruby-glass-panel text-red-200 hover:border-red-500/30' :
                  theme === 'nebula' ? 'nebula-glass-panel text-violet-200 hover:border-violet-500/30' :
                  theme === 'sapphire' ? 'sapphire-glass-panel text-blue-200 hover:border-blue-500/30' :
                  theme === 'amber' ? 'amber-glass-panel text-amber-200 hover:border-amber-500/30' :
                  theme === 'amethyst' ? 'amethyst-glass-panel text-purple-200 hover:border-purple-500/30' :
                  'glass-panel text-slate-300 hover:border-white/20'
            }`}
            title="Celestial Architecture Configuration"
          >
            <Grid size={16} />
          </button>
        </div>

        {/* 3. CELESTIAL THEME SWITCHER */}
        <div 
          onMouseEnter={() => {
            setActiveRightMenu('theme');
            audio.playSparkle('hover');
          }}
          onMouseLeave={() => {
            setActiveRightMenu(null);
          }}
          className="relative flex items-center gap-2 pointer-events-auto"
        >
          <div className={`absolute right-12 z-50 grid grid-cols-3 gap-1.5 w-[240px] p-2.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform-gpu before:absolute before:inset-y-0 before:-right-4 before:w-4 before:content-[''] ${
            activeRightMenu === 'theme' 
              ? 'translate-x-0 opacity-100 scale-100 pointer-events-auto' 
              : 'translate-x-4 opacity-0 scale-95 pointer-events-none'
          } ${
            theme === 'gold' ? 'gold-glass-panel border-amber-500/30' :
            theme === 'emerald' ? 'emerald-glass-panel border-emerald-500/30' :
            theme === 'rose' ? 'rose-glass-panel border-fuchsia-500/30' :
            theme === 'ruby' ? 'ruby-glass-panel border-red-500/30' :
            theme === 'nebula' ? 'nebula-glass-panel border-violet-500/30' :
            theme === 'sapphire' ? 'sapphire-glass-panel border-blue-500/30' :
            theme === 'amber' ? 'amber-glass-panel border-amber-600/30' :
            theme === 'amethyst' ? 'amethyst-glass-panel border-purple-500/30' :
            'glass-panel border-white/10'
          }`}>
            {[
              { id: 'slate', name: 'Slate', dot: 'bg-sky-500 shadow-sky-500/40' },
              { id: 'gold', name: 'Gold', dot: 'bg-amber-500 shadow-amber-500/40' },
              { id: 'emerald', name: 'Emerald', dot: 'bg-emerald-500 shadow-emerald-500/40' },
              { id: 'rose', name: 'Rose', dot: 'bg-fuchsia-400 shadow-fuchsia-400/40' },
              { id: 'ruby', name: 'Ruby', dot: 'bg-red-500 shadow-red-500/40' },
              { id: 'nebula', name: 'Nebula', dot: 'bg-violet-500 shadow-violet-500/40' },
              { id: 'sapphire', name: 'Sapphire', dot: 'bg-blue-500 shadow-blue-500/40' },
              { id: 'amber', name: 'Amber', dot: 'bg-orange-500 shadow-orange-500/40' },
              { id: 'amethyst', name: 'Amethyst', dot: 'bg-indigo-500 shadow-indigo-500/40' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id as any);
                  audio.playSparkle('click');
                  setActiveRightMenu(null); // slide back to right
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-[9px] font-mono tracking-wider transition-all border text-center gap-1.5 w-full cursor-pointer ${
                  theme === t.id
                    ? 'bg-white/10 border-white/30 text-white font-medium scale-105 shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10 hover:scale-105 hover:border-white/10'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
                <span className="text-[8px] leading-tight truncate w-full">{t.name}</span>
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
                  theme === 'sapphire' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                  theme === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                  theme === 'amethyst' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]' :
                  'bg-sky-500/20 text-sky-400 border border-sky-400/40 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                : theme === 'gold' ? 'gold-glass-panel text-amber-200 hover:border-amber-500/30' :
                  theme === 'emerald' ? 'emerald-glass-panel text-emerald-200 hover:border-emerald-500/30' :
                  theme === 'rose' ? 'rose-glass-panel text-fuchsia-200 hover:border-fuchsia-500/30' :
                  theme === 'ruby' ? 'ruby-glass-panel text-red-200 hover:border-red-500/30' :
                  theme === 'nebula' ? 'nebula-glass-panel text-violet-200 hover:border-violet-500/30' :
                  theme === 'sapphire' ? 'sapphire-glass-panel text-blue-200 hover:border-blue-500/30' :
                  theme === 'amber' ? 'amber-glass-panel text-amber-200 hover:border-amber-500/30' :
                  theme === 'amethyst' ? 'amethyst-glass-panel text-purple-200 hover:border-purple-500/30' :
                  'glass-panel text-slate-300 hover:border-white/20'
            }`}
            title="Celestial Theme Aesthetics"
          >
            <Palette size={16} />
          </button>
        </div>

        {/* ZOOM IN */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            audio.playSparkle('click');
            galaxyCanvasRef.current?.zoomIn();
          }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 pointer-events-auto font-bold text-lg ${
            theme === 'gold' ? 'gold-glass-panel text-amber-200 hover:border-amber-500/30 hover:text-amber-400' :
            theme === 'emerald' ? 'emerald-glass-panel text-emerald-200 hover:border-emerald-500/30 hover:text-emerald-400' :
            theme === 'rose' ? 'rose-glass-panel text-fuchsia-200 hover:border-fuchsia-500/30 hover:text-fuchsia-400' :
            theme === 'ruby' ? 'ruby-glass-panel text-red-200 hover:border-red-500/30 hover:text-red-400' :
            theme === 'nebula' ? 'nebula-glass-panel text-violet-200 hover:border-violet-500/30 hover:text-violet-400' :
            theme === 'sapphire' ? 'sapphire-glass-panel text-blue-200 hover:border-blue-500/30 hover:text-blue-400' :
            theme === 'amber' ? 'amber-glass-panel text-amber-200 hover:border-amber-500/30 hover:text-amber-400' :
            theme === 'amethyst' ? 'amethyst-glass-panel text-purple-200 hover:border-purple-500/30 hover:text-purple-400' :
            'glass-panel text-slate-300 hover:border-white/20 hover:text-white'
          }`}
          title="Zoom In (＋)"
        >
          ＋
        </button>

        {/* ZOOM OUT */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            audio.playSparkle('click');
            galaxyCanvasRef.current?.zoomOut();
          }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 pointer-events-auto font-bold text-lg ${
            theme === 'gold' ? 'gold-glass-panel text-amber-200 hover:border-amber-500/30 hover:text-amber-400' :
            theme === 'emerald' ? 'emerald-glass-panel text-emerald-200 hover:border-emerald-500/30 hover:text-emerald-400' :
            theme === 'rose' ? 'rose-glass-panel text-fuchsia-200 hover:border-fuchsia-500/30 hover:text-fuchsia-400' :
            theme === 'ruby' ? 'ruby-glass-panel text-red-200 hover:border-red-500/30 hover:text-red-400' :
            theme === 'nebula' ? 'nebula-glass-panel text-violet-200 hover:border-violet-500/30 hover:text-violet-400' :
            theme === 'sapphire' ? 'sapphire-glass-panel text-blue-200 hover:border-blue-500/30 hover:text-blue-400' :
            theme === 'amber' ? 'amber-glass-panel text-amber-200 hover:border-amber-500/30 hover:text-amber-400' :
            theme === 'amethyst' ? 'amethyst-glass-panel text-purple-200 hover:border-purple-500/30 hover:text-purple-400' :
            'glass-panel text-slate-300 hover:border-white/20 hover:text-white'
          }`}
          title="Zoom Out (－)"
        >
          －
        </button>

        {/* RESET VIEW */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            audio.playSparkle('click');
            galaxyCanvasRef.current?.resetZoom();
          }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 pointer-events-auto text-[8px] uppercase tracking-wider font-bold ${
            theme === 'gold' ? 'gold-glass-panel text-amber-200 hover:border-amber-500/30 hover:text-amber-400' :
            theme === 'emerald' ? 'emerald-glass-panel text-emerald-200 hover:border-emerald-500/30 hover:text-emerald-400' :
            theme === 'rose' ? 'rose-glass-panel text-fuchsia-200 hover:border-fuchsia-500/30 hover:text-fuchsia-400' :
            theme === 'ruby' ? 'ruby-glass-panel text-red-200 hover:border-red-500/30 hover:text-red-400' :
            theme === 'nebula' ? 'nebula-glass-panel text-violet-200 hover:border-violet-500/30 hover:text-violet-400' :
            theme === 'sapphire' ? 'sapphire-glass-panel text-blue-200 hover:border-blue-500/30 hover:text-blue-400' :
            theme === 'amber' ? 'amber-glass-panel text-amber-200 hover:border-amber-500/30 hover:text-amber-400' :
            theme === 'amethyst' ? 'amethyst-glass-panel text-purple-200 hover:border-purple-500/30 hover:text-purple-400' :
            'glass-panel text-slate-300 hover:border-white/20 hover:text-white'
          }`}
          title="Reset View"
        >
          Reset
        </button>

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
      <header className="absolute top-0 inset-x-0 z-40 pointer-events-none flex flex-col sm:flex-row items-center justify-between pl-3 sm:pl-4 pr-4 sm:pr-6 py-4 gap-4">
        <div className="pointer-events-auto flex items-center gap-2.5 bg-black/45 backdrop-blur-md border border-amber-500/20 rounded-full pl-3.5 pr-4 py-2 select-none shadow-2xl">
          <div className="w-7 h-7 border-2 border-amber-500/50 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.25)] shrink-0">
            <div className="w-4 h-4 border border-amber-400 rounded-sm rotate-45 flex items-center justify-center">
              <div className="w-1.2 h-1.2 bg-amber-400 rounded-full"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xs sm:text-[12.5px] font-light tracking-[0.18em] text-amber-50 uppercase font-display leading-tight">Al-Asma-ul-Husna</h1>
            <p className="text-[8px] sm:text-[8.5px] tracking-widest text-amber-500/60 uppercase font-mono mt-0.5 leading-none">The 99 Beautiful Names</p>
          </div>
          <div className="pl-2.5 ml-0.5 border-l border-white/10 flex flex-col justify-center">
            <span className="text-xs sm:text-[13px] font-bold font-mono text-amber-400 leading-none">{exploredNames.length}</span>
            <span className="text-[7px] sm:text-[7.5px] font-mono tracking-wider text-slate-400 uppercase mt-0.5 whitespace-nowrap font-semibold leading-none">Names Explored</span>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="pointer-events-auto flex items-center gap-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-2xl">
          {/* Offline Ready Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-[9px] text-emerald-400/80 uppercase tracking-widest font-mono pr-2 border-r border-white/10">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Offline Ready</span>
          </div>

          {/* 3D Constellation Exploration Guide */}
          <button
            onClick={() => {
              setForceShowTutorial(true);
              audio.playSparkle('click');
            }}
            title="3D Constellation Exploration Guide"
            className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center"
          >
            <HelpCircle size={16} className="text-amber-400" />
          </button>

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

            <AudioEqualizer audioEnabled={audioEnabled} theme={theme} />

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

          {/* Global Web Page Theme Switcher Dropdown */}
          <div className="relative pointer-events-auto">
            <button
              onClick={() => {
                setShowThemeDropdown(!showThemeDropdown);
                setShowNotifications(false);
                setShowAuth(false);
                audio.playSparkle('click');
              }}
              title="Global Web Page Theme Switcher"
              className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                showThemeDropdown
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Palette size={16} />
            </button>

            {/* Dropdown Menu */}
            {showThemeDropdown && (
              <div 
                className={`absolute right-0 mt-3.5 z-50 flex flex-col gap-1.5 w-[220px] p-3 rounded-2xl border shadow-2xl backdrop-blur-xl animate-fade-in ${getGlassPanelClass()}`}
              >
                <div className={`text-[10px] font-mono tracking-wider uppercase font-semibold pb-1.5 border-b mb-1 ${isLight ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-white/5'}`}>
                  Web App Theme
                </div>
                {[
                  { id: 'dark', name: 'Cosmic Dark', dot: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]', desc: 'Space dark glass aesthetic', icon: Moon },
                  { id: 'light', name: 'Elegant Light', dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]', desc: 'Clean, high-contrast light', icon: Sun },
                  { id: 'midnight', name: 'Midnight Blue', dot: 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]', desc: 'Deep royal space blue', icon: Orbit },
                  { id: 'sepia', name: 'Warm Sepia', dot: 'bg-orange-700 shadow-[0_0_8px_rgba(194,65,12,0.5)]', desc: 'Warm desert dunes glow', icon: Sparkles },
                ].map(t => {
                  const IconComp = t.icon;
                  const isSelected = appThemeMode === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setAppThemeMode(t.id as any);
                        audio.playSparkle('click');
                        setShowThemeDropdown(false);
                      }}
                      className={`flex items-center gap-3 p-2 rounded-xl text-left transition-all border w-full cursor-pointer group ${
                        isSelected
                          ? isLight
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 font-medium'
                            : 'bg-white/10 border-white/30 text-white font-medium scale-[1.02] shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                          : isLight
                            ? 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected 
                          ? isLight ? 'bg-amber-500/20 text-amber-800' : 'bg-white/15 text-white' 
                          : isLight ? 'bg-slate-100 text-slate-500 group-hover:bg-slate-200' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'
                      }`}>
                        <IconComp size={14} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-sans font-medium tracking-wide leading-none">{t.name}</span>
                        <span className={`text-[8px] font-mono tracking-wide mt-1 leading-none truncate ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{t.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications config */}
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowAuth(false);
              setShowThemeDropdown(false);
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
              setShowThemeDropdown(false);
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
      } ${getGlassPanelClass()}`}>
        
        {/* Core title spacing on desktop */}
        <div className="hidden md:block px-6 pt-24 pb-3">
          <h2 className={`font-display font-light text-xl tracking-wider uppercase ${isLight ? 'text-amber-800' : 'text-amber-200'}`}>Asma-ul-Husna Hub</h2>
          <p className={`text-[11px] leading-relaxed mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Explore the spiritual depths, memorize, and track recitation completion of the 99 divine names.</p>
        </div>

        {/* SIDEBAR TABS NAVIGATOR BAR */}
        <div className={`flex items-center border-b p-1 relative shrink-0 ${isLight ? 'border-slate-200 bg-slate-100' : 'border-white/5 bg-black/35'}`}>
          {[
            { id: 'directory', label: '📖 Directory', count: filteredList.length },
            { id: 'dhikr', label: '🎵 Dhikr Queue', count: playlist.length },
            { id: 'stats', label: '📊 Insights', count: completed.length }
          ].map((tab) => {
            const isActive = activeSidebarTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSidebarTab(tab.id as any);
                  audio.playSparkle('click');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium tracking-wide uppercase transition-all duration-300 relative focus:outline-none cursor-pointer flex flex-col items-center justify-center ${
                  isActive
                    ? isLight
                      ? 'text-amber-800 bg-amber-500/15 border border-amber-500/30 shadow-sm'
                      : theme === 'gold' ? 'text-amber-300 bg-amber-500/10 shadow-[inset_0_0_8px_rgba(245,158,11,0.15)] border border-amber-500/25' :
                        theme === 'emerald' ? 'text-emerald-400 bg-emerald-500/10 shadow-[inset_0_0_8px_rgba(16,185,129,0.15)] border border-emerald-500/25' :
                        theme === 'rose' ? 'text-fuchsia-400 bg-fuchsia-500/10 shadow-[inset_0_0_8px_rgba(217,70,239,0.15)] border border-fuchsia-500/25' :
                        theme === 'ruby' ? 'text-red-400 bg-red-500/10 shadow-[inset_0_0_8px_rgba(239,68,68,0.15)] border border-red-500/25' :
                        theme === 'nebula' ? 'text-violet-400 bg-violet-500/10 shadow-[inset_0_0_8px_rgba(139,92,246,0.15)] border border-violet-500/25' :
                        theme === 'sapphire' ? 'text-blue-400 bg-blue-500/10 shadow-[inset_0_0_8px_rgba(59,130,246,0.15)] border border-blue-500/25' :
                        theme === 'amber' ? 'text-amber-500 bg-amber-500/10 shadow-[inset_0_0_8px_rgba(245,158,11,0.15)] border border-amber-500/25' :
                        theme === 'amethyst' ? 'text-purple-400 bg-purple-500/10 shadow-[inset_0_0_8px_rgba(168,85,247,0.15)] border border-purple-500/25' :
                        'text-sky-400 bg-sky-500/10 shadow-[inset_0_0_8px_rgba(56,189,248,0.15)] border border-sky-500/25'
                    : isLight
                      ? 'text-slate-500 hover:text-slate-800 border border-transparent'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-1 font-display font-medium text-[9px] md:text-[10px] tracking-wider">
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[8px] px-1 rounded-full font-mono font-bold ${
                      isActive 
                        ? isLight ? 'bg-amber-500/20 text-amber-900' : 'bg-amber-400/20 text-amber-200' 
                        : isLight ? 'bg-slate-200 text-slate-500' : 'bg-white/5 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* SLIDING VIEWPORT */}
        <div className="flex-1 overflow-hidden relative w-full min-h-0 flex flex-col">
          <div 
            className="flex-1 flex flex-row transition-transform duration-500 ease-out transform-gpu min-h-0"
            style={{ 
              width: '300%',
              transform: activeSidebarTab === 'directory' ? 'translateX(0%)' : activeSidebarTab === 'dhikr' ? 'translateX(-33.33333%)' : 'translateX(-66.66667%)' 
            }}
          >
            {/* PANE 1: DIRECTORY (Search & Filter + Names list) */}
            <div className="w-[33.33333%] h-full flex flex-col overflow-hidden shrink-0">
              {/* FILTER & SEARCH SUITE */}
              <div className={`p-4 flex flex-col gap-3 border-b shrink-0 ${isLight ? 'border-slate-200 bg-slate-50/70' : 'border-white/5 bg-black/20'}`}>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full border rounded-full pl-9 pr-8 py-2.5 text-xs transition-colors font-sans focus:outline-none ${
                        isLight 
                          ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-amber-600/50 shadow-sm' 
                          : 'bg-white/5 border-white/10 text-[#e0e0e0] placeholder-gray-600 focus:border-amber-500/50'
                      }`}
                      placeholder="Search names..."
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-gray-400 hover:text-white'}`}
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
                    className="px-3 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 flex items-center justify-center gap-1.5 transition-all text-[11px] font-mono tracking-wider active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
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
                      className={`px-3 py-1 rounded-full text-[10px] font-mono tracking-wide capitalize shrink-0 border transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? isLight
                            ? 'bg-amber-600/15 border-amber-500/40 text-amber-800 font-semibold'
                            : 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                          : isLight
                            ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* List Display Filter Toggles */}
                <div className={`grid grid-cols-3 gap-1 p-1 rounded-lg border text-[10px] font-mono ${isLight ? 'bg-slate-100 border-slate-200/80' : 'bg-black/40 border-white/10'}`}>
                  <button
                    onClick={() => {
                      setFilterMode('all');
                      audio.playSparkle('hover');
                    }}
                    className={`py-1 rounded text-center transition-all cursor-pointer ${
                      filterMode === 'all'
                        ? isLight
                          ? 'bg-white text-amber-800 shadow-sm font-bold border border-slate-200'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                        : isLight
                          ? 'text-slate-500 hover:text-slate-800'
                          : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    All Names
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode('favorites');
                      audio.playSparkle('hover');
                    }}
                    className={`py-1 rounded text-center flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      filterMode === 'favorites'
                        ? isLight
                          ? 'bg-white text-amber-800 shadow-sm font-bold border border-slate-200'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                        : isLight
                          ? 'text-slate-500 hover:text-slate-800'
                          : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Star size={10} className="text-amber-400 fill-amber-400" /> ({favorites.length})
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode('completed');
                      audio.playSparkle('hover');
                    }}
                    className={`py-1 rounded text-center flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      filterMode === 'completed'
                        ? isLight
                          ? 'bg-white text-amber-800 shadow-sm font-bold border border-slate-200'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                        : isLight
                          ? 'text-slate-500 hover:text-slate-800'
                          : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <CheckSquare size={10} className="text-emerald-500" /> ({completed.length})
                  </button>
                </div>
              </div>

              {/* DIRECTORY DIRECT ROUTER DIRECT LIST */}
              <div className="flex-1 overflow-y-auto py-2">
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
                        className={`group flex items-center justify-between px-5 py-3.5 border-b cursor-pointer transition-all ${
                          isLight ? 'border-slate-100' : 'border-white/5'
                        } ${
                          isSelected 
                            ? isLight
                              ? 'bg-amber-500/10 border-l-2 border-l-amber-600 shadow-[inset_10px_0_15px_-10px_rgba(245,158,11,0.15)]'
                              : 'bg-amber-500/10 border-l-2 border-l-amber-500 shadow-[inset_10px_0_15px_-10px_rgba(245,158,11,0.2)]' 
                            : isLight
                              ? 'hover:bg-slate-100 border-l-2 border-l-transparent'
                              : 'hover:bg-white/5 border-l-2 border-l-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-mono text-[10px] w-5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            {String(item.id).padStart(2, '0')}
                          </span>
                          <div className="flex flex-col">
                            <span className={`text-xs font-medium tracking-wide transition-colors ${
                              isLight 
                                ? 'text-slate-800 group-hover:text-amber-800' 
                                : 'text-amber-50 group-hover:text-amber-300'
                            }`}>{item.transliteration}</span>
                            <span className={`text-[9px] font-mono tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{item.english}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Visual Calligraphy label */}
                          <span className={`font-arabic text-lg tracking-wide ${isLight ? 'text-amber-800/90' : 'text-amber-200/90'}`}>
                            {item.name}
                          </span>

                          {/* Status & Play Icons */}
                          <div className="flex items-center gap-2 pointer-events-auto">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePlaylist(item.id);
                              }}
                              className={`p-1 rounded-full transition-all border cursor-pointer ${
                                playlist.includes(item.id)
                                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                                  : isLight
                                    ? 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200'
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
                              className={`p-1 rounded-full transition-all border cursor-pointer ${
                                isLight
                                  ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-800'
                                  : 'bg-amber-500/10 hover:bg-amber-500/35 text-amber-300 hover:text-amber-200 border border-amber-500/25'
                              }`}
                              title={`Listen to ${item.transliteration}`}
                            >
                              <Play size={10} className={isLight ? "fill-amber-700 text-amber-700" : "fill-amber-400 text-amber-400"} />
                            </button>
                            {isFav && <Star size={9} className="fill-amber-500 text-amber-500" />}
                            {isComp && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" title="Completed" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* PANE 2: DHIKR LOOP (Queue loop player & Recently viewed) */}
            <div className="w-[33.33333%] h-full flex flex-col overflow-y-auto shrink-0">
              {/* RECITATION PLAYLIST PLAYER */}
              <div className={`px-5 py-4 border-b flex flex-col gap-3 shrink-0 ${isLight ? 'border-slate-200 bg-slate-100/60' : 'border-white/5 bg-black/35'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-display tracking-wider uppercase font-bold flex items-center gap-1.5 ${isLight ? 'text-amber-800' : 'text-amber-200/90'}`}>
                    <Music size={11} className={`text-amber-600 ${isPlaylistPlaying ? 'animate-spin' : 'animate-pulse'}`} />
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
                      className="text-[9px] font-mono text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Clear Queue
                    </button>
                  )}
                </div>

                {playlist.length === 0 ? (
                  <div className={`py-4 px-3 rounded-xl border border-dashed text-[10px] text-center font-mono select-none ${
                    isLight 
                      ? 'border-slate-300 bg-white text-slate-500 shadow-sm' 
                      : 'border-white/10 bg-white/5 text-slate-400'
                  }`}>
                    No names queued. Go to Directory tab to add individual names, or click below to load a category preset.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* Media Controls */}
                    <div className={`flex items-center justify-between rounded-xl p-3 border ${
                      isLight 
                        ? 'bg-white border-slate-200 shadow-sm' 
                        : 'bg-black/50 border-white/5 shadow-inner'
                    }`}>
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
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            isLight 
                              ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800' 
                              : 'hover:bg-white/10 text-slate-400 hover:text-white'
                          }`}
                          title="Previous Recitation"
                        >
                          <ChevronLeft size={16} />
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
                          className={`p-2 rounded-full transition-all cursor-pointer ${
                            isLight
                              ? 'bg-amber-500/10 border border-amber-500/35 text-amber-800 hover:bg-amber-500/20'
                              : 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/35'
                          }`}
                          title={isPlaylistPlaying ? "Pause Loop" : "Play Loop"}
                        >
                          {isPlaylistPlaying ? <Pause size={14} className={isLight ? "fill-amber-700" : "fill-amber-300"} /> : <Play size={14} className={isLight ? "fill-amber-700" : "fill-amber-300"} />}
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
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            isLight 
                              ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800' 
                              : 'hover:bg-white/10 text-slate-400 hover:text-white'
                          }`}
                          title="Next Recitation"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Queue status details */}
                      <div className="text-right flex flex-col justify-center">
                        <span className={`text-[9px] font-mono leading-none ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                          {currentPlaylistIndex !== null ? `Playing ${currentPlaylistIndex + 1} of ${playlist.length}` : 'Loop Idle'}
                        </span>
                        {currentPlaylistIndex !== null && (
                          <span className={`text-[11px] font-bold font-sans tracking-wide leading-none mt-1.5 animate-pulse ${
                            isLight ? 'text-amber-800' : 'text-amber-400'
                          }`}>
                            {namesOfAllah.find(n => n.id === playlist[currentPlaylistIndex])?.transliteration}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dhikr Mode Interval Timer Controls */}
                    <div className={`flex items-center justify-between pt-3.5 text-[10px] font-mono border-t ${isLight ? 'border-slate-200 text-slate-600' : 'border-white/5 text-slate-400'}`}>
                      <span className="uppercase tracking-wider text-[8px] font-bold">Dhikr Chanting Pause:</span>
                      <select
                        value={dhikrInterval}
                        onChange={(e) => {
                          setDhikrInterval(Number(e.target.value));
                          audio.playSparkle('click');
                        }}
                        className={`rounded-md px-2 py-0.5 focus:outline-none cursor-pointer text-[10px] border ${
                          isLight 
                            ? 'bg-white border-slate-300 text-amber-900 focus:border-amber-600/50 shadow-sm' 
                            : 'bg-black/60 border-white/10 text-amber-300 focus:border-amber-500/50'
                        }`}
                      >
                        <option value={0}>Gapless (0s)</option>
                        <option value={1}>1 Second</option>
                        <option value={3}>3 Seconds</option>
                        <option value={5}>5 Seconds</option>
                        <option value={10}>10 Seconds</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Dynamic category-based quick build buttons */}
                <div className={`flex flex-col gap-2 mt-1 pt-3 shrink-0 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                  <span className={`text-[9px] font-mono tracking-wider uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Queue Category Preset:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
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
                          className={`px-2 py-1.5 rounded text-[9px] font-mono transition-all flex items-center gap-1 active:scale-95 shrink-0 cursor-pointer border ${
                            isLight
                              ? 'bg-white border-slate-200 text-slate-600 hover:border-amber-600/30 hover:bg-amber-500/5 hover:text-amber-900 shadow-sm'
                              : 'bg-white/5 border border-white/5 hover:border-amber-500/25 hover:bg-amber-500/10 text-slate-400 hover:text-amber-300'
                          }`}
                        >
                          <span>{cat === 'Favorites' ? '⭐' : cat === 'All' ? '✨' : '🏷️'}</span>
                          <span>{cat}</span>
                          <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* CUSTOM WIRD (LITANY) PLAYLISTS */}
              <div className={`px-5 py-4 border-b flex flex-col gap-3 shrink-0 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-display tracking-wider uppercase font-bold flex items-center gap-1.5 ${isLight ? 'text-amber-800' : 'text-amber-200/90'}`}>
                    <Layers size={11} className="text-amber-500" />
                    Custom Wird (Litanies) ({customPlaylists.length})
                  </span>
                  {!isCreatingPlaylist && playlist.length > 0 && (
                    <button
                      onClick={() => {
                        setIsCreatingPlaylist(true);
                        audio.playSparkle('click');
                      }}
                      className="text-[9px] font-mono text-amber-500 hover:text-amber-600 uppercase tracking-widest font-bold transition-colors cursor-pointer"
                    >
                      + Save Queue
                    </button>
                  )}
                </div>

                {isCreatingPlaylist && (
                  <div className={`p-3 rounded-xl border flex flex-col gap-2 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'
                  }`}>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Name your custom litany:</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Morning Protection"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        className={`flex-1 px-2.5 py-1 text-xs rounded border focus:outline-none ${
                          isLight 
                            ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-500' 
                            : 'bg-black/40 border-white/10 text-white focus:border-amber-500'
                        }`}
                      />
                      <button
                        onClick={() => saveCurrentQueueAsPlaylist(newPlaylistName)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-mono text-[9px] font-bold uppercase rounded cursor-pointer transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsCreatingPlaylist(false);
                          setNewPlaylistName('');
                          audio.playSparkle('click');
                        }}
                        className={`px-2.5 py-1 font-mono text-[9px] uppercase rounded border cursor-pointer ${
                          isLight ? 'border-slate-300 text-slate-600' : 'border-white/10 text-slate-400'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {customPlaylists.map(p => (
                    <div
                      key={p.id}
                      className={`px-3 py-2 rounded-xl border flex items-center justify-between group transition-all ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-amber-600/30 shadow-sm'
                          : 'bg-white/5 border-white/5 hover:border-amber-500/25'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-xs font-semibold leading-tight ${isLight ? 'text-slate-800' : 'text-amber-50'}`}>{p.name}</span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{p.nameIds.length} Divine Names</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => loadCustomPlaylist(p.nameIds, p.name)}
                          className="p-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
                          title="Load and chant this Litany"
                        >
                          <Play size={10} className="fill-amber-500" />
                        </button>
                        {p.id !== 'morning_protection' && p.id !== 'hardship_relief' && (
                          <button
                            onClick={() => deleteCustomPlaylist(p.id)}
                            className="p-1 rounded-full text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete custom litany"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENTLY VIEWED SECTION */}
              {recentlyViewed.length > 0 && (
                <div className={`px-5 py-4 flex flex-col gap-2.5 shrink-0 ${isLight ? 'bg-slate-50' : 'bg-black/15'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-display tracking-wider uppercase font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Clock size={11} className="text-amber-500" />
                      Recently Viewed
                    </span>
                    <button 
                      onClick={() => setRecentlyViewed([])}
                      className="text-[9px] font-mono text-gray-500 hover:text-amber-600 uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
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
                          className={`px-4 py-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? isLight
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-900 font-semibold'
                                : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                              : isLight
                                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
                                : 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-[9px] text-slate-500">#{String(item.id).padStart(2, '0')}</span>
                            <span className="text-xs font-semibold tracking-wide">{item.transliteration}</span>
                          </div>
                          <span className={`font-arabic text-sm ${isLight ? 'text-amber-800/90' : 'text-amber-200/90'}`}>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* PANE 3: INSIGHTS & STATS (Memorization Goal + Streaks + Quick Access) */}
            <div className="w-[33.33333%] h-full flex flex-col overflow-y-auto p-5 gap-4 shrink-0 overflow-x-hidden">
              {/* MEMORIZATION PROGRESS METRIC CARD */}
              <div className={`p-4.5 rounded-2xl border flex flex-col gap-3.5 shadow-lg relative overflow-hidden group ${isLight ? 'border-slate-200 bg-white' : 'border-white/5 bg-black/35'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center text-amber-600 shadow-inner">
                      <Award size={20} />
                    </div>
                    <div>
                      <span className={`text-xs font-semibold font-display ${isLight ? 'text-slate-800' : 'text-amber-50/90'}`}>Memorization Goals</span>
                      <p className={`font-mono text-[9px] mt-0.5 leading-normal ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{completed.length} / 99 completed</p>
                    </div>
                  </div>

                  {/* Radial/Bar Visualizer */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className={`w-20 rounded-full h-1.5 overflow-hidden border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black border-white/10'}`}>
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-emerald-500 font-bold">{progressPercent}%</span>
                  </div>
                </div>
              </div>

              {/* DAILY GOAL PROGRESS METRIC CARD */}
              {(() => {
                const studiedCount = getNamesStudiedToday();
                const targetCount = dailyGoalTarget;
                const percent = targetCount > 0 ? Math.min(100, Math.round((studiedCount / targetCount) * 100)) : 0;
                const radius = 24;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (percent / 100) * circumference;

                return (
                  <div className={`p-4.5 rounded-2xl border flex items-center justify-between shadow-lg relative overflow-hidden group ${isLight ? 'border-slate-200 bg-white' : 'border-white/5 bg-black/35'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-3 z-10">
                      <div className="w-10 h-10 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center text-amber-500 shadow-inner shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <span className={`text-xs font-semibold font-display block ${isLight ? 'text-slate-800' : 'text-amber-50/90'}`}>Daily Study Goal</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-sm font-bold font-mono ${isLight ? 'text-slate-900' : 'text-amber-400'}`}>{studiedCount}</span>
                          <span className="text-[10px] text-slate-500">/</span>
                          <span className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{targetCount} names</span>
                        </div>
                        {/* Goal target adjust controls */}
                        <div className="flex items-center gap-1 mt-2">
                          <button 
                            onClick={() => handleUpdateDailyGoalTarget(targetCount - 1)}
                            className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold border transition-all cursor-pointer ${
                              isLight 
                                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                            title="Decrease Daily Goal"
                          >
                            -
                          </button>
                          <span className="text-[9px] font-mono font-semibold px-1 text-slate-500">Target</span>
                          <button 
                            onClick={() => handleUpdateDailyGoalTarget(targetCount + 1)}
                            className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold border transition-all cursor-pointer ${
                              isLight 
                                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                            title="Increase Daily Goal"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Ring Visualizer */}
                    <div className="relative w-14 h-14 flex items-center justify-center shrink-0 z-10">
                      <svg className="w-14 h-14 transform -rotate-90">
                        {/* Background track */}
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          className={isLight ? 'stroke-slate-100' : 'stroke-white/5'}
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        {/* Glowing active progress */}
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          className="stroke-amber-500 transition-all duration-500"
                          strokeWidth="3.5"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className={`absolute text-[10px] font-mono font-bold ${percent >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Consistency Streak Card */}
              <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden group ${
                isLight ? 'border-slate-200 bg-white' : 'border-white/5 bg-black/25'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center text-amber-500 text-lg">
                    🔥
                  </div>
                  <div>
                    <span className={`text-xs font-semibold font-display ${isLight ? 'text-slate-800' : 'text-amber-50'}`}>Consistent Streak</span>
                    <p className={`text-[10px] font-mono mt-0.5 leading-normal pb-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Track daily recitation Streaks</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-light font-sans ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>{getStreaks().current}</span>
                  <span className="text-[10px] text-gray-500 font-mono block leading-none mt-0.5">Days</span>
                </div>
              </div>

              {/* Leitner Box Statistics */}
              <div className={`border rounded-2xl p-4 flex flex-col gap-3 shadow-lg ${isLight ? 'border-slate-200 bg-white' : 'border-white/5 bg-black/25'}`}>
                <span className={`text-[10px] font-mono tracking-wider uppercase font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Leitner Memorizer Box Status</span>
                <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
                  {[1, 2, 3, 4, 5].map((boxNum) => {
                    const count = Object.values(leitnerBoxes).filter(b => b === boxNum).length;
                    return (
                      <div key={boxNum} className={`border p-2 rounded-lg flex flex-col gap-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'}`}>
                        <span className="text-[9px] text-slate-500">Box {boxNum}</span>
                        <span className={`text-xs font-bold ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className={`border rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg ${isLight ? 'border-slate-200 bg-white' : 'border-white/5 bg-black/25'}`}>
                <span className={`text-[10px] font-mono tracking-wider uppercase font-bold mb-0.5 ${isLight ? 'text-slate-650' : 'text-slate-400'}`}>Spiritual Modules</span>
                
                <button
                  onClick={() => {
                    setShowDashboardModal(true);
                    audio.playSparkle('click');
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-800 hover:text-amber-900 font-mono text-[10px] tracking-wider uppercase font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  📊 Spiritual Dashboard
                </button>

                <button
                  onClick={() => {
                    setShowFlashcardsModal(true);
                    audio.playSparkle('click');
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-700 hover:text-purple-900 font-mono text-[10px] tracking-wider uppercase font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  🗂️ Leitner Flashcards
                </button>

                <button
                  onClick={() => {
                    setShowBadgesModal(true);
                    audio.playSparkle('click');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 hover:text-emerald-900 font-mono text-[10px] tracking-wider uppercase font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  🏅 Spiritual Badges & Milestones
                </button>

                <button
                  onClick={() => {
                    setShowCertificateModal(true);
                    audio.playSparkle('click');
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-800 hover:text-amber-900 font-mono text-[10px] tracking-wider uppercase font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  🎓 Export Certificate
                </button>
              </div>
            </div>
          </div>
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
          theme === 'sapphire' ? 'sapphire-glass-panel' :
          theme === 'amber' ? 'amber-glass-panel' :
          theme === 'amethyst' ? 'amethyst-glass-panel' :
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

            {/* SPECTACULAR DIGITAL TASBIH COUNTER OVERLAY */}
            <div className="bg-gradient-to-b from-black/40 to-black/60 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-4.5 relative overflow-hidden shadow-xl group">
              <div className="absolute inset-0 bg-amber-500/5 opacity-30 group-hover:opacity-40 transition-opacity pointer-events-none" />
              
              {/* Particle sparks container */}
              <div className="absolute inset-0 pointer-events-none">
                {tasbihParticles.map(p => (
                  <span
                    key={p.id}
                    className="absolute w-2 h-2 rounded-full animate-ping animate-duration-1000"
                    style={{
                      left: `calc(50% + ${p.x}px)`,
                      top: `calc(50% + ${p.y}px)`,
                      backgroundColor: p.color,
                      transform: 'translate(-50%, -50%)',
                      boxShadow: `0 0 8px ${p.color}`
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between w-full font-mono text-[10px]">
                <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  📿 Digital Tasbih Counter
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Target:</span>
                  <select
                    value={tasbihTarget}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTasbihTarget(val === 'free' ? 'free' : Number(val));
                      setTasbihCount(0);
                      audio.playSparkle('click');
                    }}
                    className="bg-black/50 border border-white/10 rounded px-1.5 py-0.5 text-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value={33}>33 times</option>
                    <option value={100}>100 times</option>
                    <option value="free">Continuous</option>
                  </select>
                </div>
              </div>

              {/* Central tactile circular trigger */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-36 h-36 border border-amber-500/10 rounded-full animate-ping pointer-events-none duration-1000" />
                <div className="absolute w-32 h-32 border border-amber-500/20 rounded-full animate-pulse pointer-events-none" />
                
                <button
                  onClick={incrementTasbih}
                  className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border-2 border-amber-500/40 hover:border-amber-400 flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all relative z-10 focus:outline-none group/btn"
                >
                  <span className="font-mono text-3xl font-extrabold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                    {tasbihCount}
                  </span>
                  <span className="text-[8px] font-mono tracking-widest text-slate-400 group-hover/btn:text-amber-200 uppercase">
                    {tasbihTarget === 'free' ? 'Free Chant' : `of ${tasbihTarget}`}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between w-full font-mono text-[9px] text-slate-500">
                <span>Tap circle or press [SPACEBAR]</span>
                <button
                  onClick={() => {
                    setTasbihCount(0);
                    audio.playSparkle('hover');
                  }}
                  className="hover:text-rose-400 transition-colors uppercase cursor-pointer"
                >
                  Reset count
                </button>
              </div>
            </div>

            {/* MULTI-LINGUAL LANGUAGE SELECTOR ROW */}
            <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Globe size={13} className="text-amber-500" />
                <span>Tafsir Language:</span>
              </div>
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value as any);
                  audio.playSparkle('click');
                }}
                className="bg-black/65 border border-white/10 rounded px-2.5 py-1 text-xs text-amber-300 focus:border-amber-500/50 focus:outline-none cursor-pointer"
              >
                <option value="english">English (Original)</option>
                <option value="bengali">Bengali / বাংলা</option>
                <option value="urdu">Urdu / اردو</option>
                <option value="indonesian">Indonesian / Bahasa</option>
                <option value="turkish">Turkish / Türkçe</option>
                <option value="french">French / Français</option>
              </select>
            </div>

            {translationLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-center text-slate-400 font-sans text-xs bg-black/40 border border-white/5 rounded-2xl">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="font-mono text-[9px] tracking-wider text-amber-300 uppercase animate-pulse">Translating Tafsir to {selectedLanguage.toUpperCase()}...</span>
              </div>
            ) : (
              <>
                {/* TRANSLATIONS SECTION */}
                <div className="flex flex-col gap-4 bg-black/40 backdrop-blur-xl p-5 border-l-2 border-amber-500/40 rounded-r-2xl border border-white/5 shadow-lg">
                  <div className="flex items-start gap-3">
                    <Globe size={18} className="text-amber-500 mt-1 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest leading-none mb-1">
                        {selectedLanguage === 'english' ? 'English Translation' : `${selectedLanguage.toUpperCase()} Translation`}
                      </span>
                      <div className="text-lg font-light tracking-wide leading-relaxed text-white">
                        {selectedLanguage === 'english' ? (
                          selectedName.english.split(' ').map((word, wordIdx) => {
                            const isWordActive = activeWordIndex === wordIdx;
                            return (
                              <span 
                                key={wordIdx} 
                                className={`inline-block mr-1.5 transition-all duration-200 rounded px-0.5 ${
                                  isWordActive 
                                    ? 'bg-amber-500 text-black font-semibold shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-110' 
                                    : 'text-white'
                                }`}
                              >
                                {word}
                              </span>
                            );
                          })
                        ) : selectedLanguage === 'bengali' ? (
                          selectedName.english
                        ) : (
                          translationCache[selectedName.id]?.[selectedLanguage]?.meaning || selectedName.english
                        )}
                      </div>
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
                  <h5 className="font-mono text-[9px] text-gray-500 uppercase tracking-[0.2em]">Theological Depth ({selectedLanguage.toUpperCase()})</h5>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
                    {selectedLanguage === 'english' 
                      ? selectedName.explanation 
                      : selectedLanguage === 'bengali' 
                        ? `${selectedName.explanation} (বাংলা তফসির চাহিদার ভিত্তিতে লোড করা হচ্ছে)` 
                        : translationCache[selectedName.id]?.[selectedLanguage]?.explanation || selectedName.explanation}
                  </p>
                </div>

                {/* RECITATION BENEFITS */}
                <div className="flex flex-col gap-1.5">
                  <h5 className="font-mono text-[9px] text-amber-500/60 uppercase tracking-[0.2em]">Spiritual Blessings ({selectedLanguage.toUpperCase()})</h5>
                  <div className="flex items-start gap-3 bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-100/90 leading-relaxed shadow-lg">
                    <Sparkles size={16} className="mt-0.5 text-amber-400 shrink-0 animate-pulse" />
                    <span>
                      {selectedLanguage === 'english' 
                        ? selectedName.benefits 
                        : selectedLanguage === 'bengali' 
                          ? selectedName.benefits 
                          : translationCache[selectedName.id]?.[selectedLanguage]?.benefits || selectedName.benefits}
                    </span>
                  </div>
                </div>
              </>
            )}

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

            {/* Audio Customizations & Qari Suite */}
            <div className="grid grid-cols-2 gap-2.5 bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] font-mono">
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-400 uppercase tracking-wider text-[8px] font-bold">Select Qari / Recital</span>
                <select
                  value={qariStyle}
                  onChange={(e) => {
                    setQariStyle(e.target.value as any);
                    audio.playSparkle('click');
                  }}
                  className="bg-black/60 border border-white/10 rounded-lg px-2 py-1.5 text-amber-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                >
                  <option value="celestial">✨ Celestial Chimes</option>
                  <option value="studio">🎙️ Mishary Al-Afasy (Studio)</option>
                  <option value="ghamdi_echo">🕌 Saad Al-Ghamdi (Medina Echo)</option>
                  <option value="sudais_grand">🕋 Abdul Rahman Al-Sudais (Mecca Grand)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-400 uppercase tracking-wider text-[8px] font-bold">Translation Highlight</span>
                <button
                  onClick={() => {
                    setTranslationSyncEnabled(!translationSyncEnabled);
                    audio.playSparkle('click');
                  }}
                  className={`border rounded-lg px-2 py-1.5 text-center transition-all ${
                    translationSyncEnabled 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                      : 'bg-black/40 border-white/10 text-slate-400'
                  }`}
                >
                  {translationSyncEnabled ? '● Synced' : '○ Disabled'}
                </button>
              </div>
            </div>

            {/* QURANIC REFERENCES & TAFSIR PANEL */}
            <div className="flex flex-col gap-3 bg-black/40 border border-white/5 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                <BookOpen size={14} className="text-amber-400" />
                <h5 className="font-mono text-[9px] text-amber-300 uppercase tracking-widest font-bold">Quranic Revelation & Scholarly Tafsir</h5>
              </div>
              
              <div className="flex flex-col gap-4">
                {getQuranReferences(selectedName.id, selectedName.transliteration).map((ref, rIdx) => (
                  <div key={rIdx} className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="font-arabic text-right text-lg text-amber-100/95 leading-relaxed font-light">{ref.verseAr}</span>
                    <p className="text-xs text-slate-200 italic font-light">"{ref.verseEn}"</p>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                      <span className="text-[9px] font-mono text-amber-500/70">{ref.citation}</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Verse context</span>
                    </div>
                    <div className="bg-amber-950/10 border-l-2 border-amber-500/30 pl-2.5 py-1 text-[11px] text-slate-300 leading-relaxed font-sans mt-1.5">
                      <strong className="text-amber-300/80 uppercase tracking-wider text-[8px] block font-mono mb-0.5 font-bold">Scholarly Tafsir:</strong>
                      {ref.tafsir}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PRIVATE REFLECTION JOURNAL SECTION */}
            <div className="flex flex-col gap-3 bg-black/40 border border-white/5 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 justify-between">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-amber-400" />
                  <h5 className="font-mono text-[9px] text-amber-300 uppercase tracking-widest font-bold">Private Spiritual Journal</h5>
                </div>
                <span className="text-[8px] font-mono text-slate-500 uppercase">Synced to Cloud</span>
              </div>

              {/* Reflection Entry Input */}
              <div className="flex flex-col gap-2">
                <textarea
                  placeholder="How does this divine name speak to your heart during this phase of your life? Jot down your spiritual thoughts..."
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 min-h-[75px] resize-none font-sans placeholder-slate-600"
                />
                <button
                  onClick={() => {
                    if (!reflectionInput.trim()) return;
                    saveReflection(reflectionInput);
                    setReflectionInput('');
                  }}
                  disabled={!reflectionInput.trim()}
                  className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 text-amber-300 hover:text-amber-200 disabled:opacity-40 rounded-xl font-mono text-[10px] tracking-wider uppercase font-semibold transition-all cursor-pointer active:scale-95"
                >
                  Save Reflection Note
                </button>
              </div>

              {/* Saved Notes Feed */}
              {reflections[selectedName.id] && reflections[selectedName.id].length > 0 ? (
                <div className="flex flex-col gap-2 mt-2 max-h-[220px] overflow-y-auto no-scrollbar">
                  {reflections[selectedName.id].map((note, nIdx) => (
                    <div key={nIdx} className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5 relative group">
                      <p className="text-xs text-slate-300 leading-relaxed font-sans pr-6">"{note.text}"</p>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
                        <span className="text-[9px] font-mono text-slate-500">
                          {new Date(note.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => {
                            setReflections(prev => {
                              const updatedList = (prev[selectedName.id] || []).filter((_, idx) => idx !== nIdx);
                              const updated = { ...prev, [selectedName.id]: updatedList };
                              localStorage.setItem('user_reflections', JSON.stringify(updated));
                              if (auth.currentUser) {
                                setDoc(doc(db, 'user_data', auth.currentUser.uid), {
                                  reflections: updated,
                                  updatedAt: new Date().toISOString()
                                }, { merge: true });
                              }
                              return updated;
                            });
                            triggerToast("Journal entry deleted.", "Journal Update");
                            audio.playSparkle('click');
                          }}
                          className="text-[8px] font-mono text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] font-mono text-slate-500 text-center py-2 italic">
                  No private reflections recorded for this name yet.
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

      {/* FULL RECITATION PLAYER UI DECK */}
      {playlist.length > 0 && currentPlaylistIndex !== null && (
        <div 
          className={`fixed bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[calc(100%-32px)] rounded-2xl border shadow-2xl backdrop-blur-2xl p-4 transition-all duration-300 transform-gpu animate-fade-in-up ${
            theme === 'gold' ? 'gold-glass-panel border-amber-500/30 text-amber-100' :
            theme === 'emerald' ? 'emerald-glass-panel border-emerald-500/30 text-emerald-100' :
            theme === 'rose' ? 'rose-glass-panel border-fuchsia-500/30 text-rose-100' :
            theme === 'ruby' ? 'ruby-glass-panel border-red-500/30 text-red-100' :
            theme === 'nebula' ? 'nebula-glass-panel border-violet-500/30 text-violet-100' :
            theme === 'sapphire' ? 'sapphire-glass-panel border-blue-500/30 text-blue-100' :
            theme === 'amber' ? 'amber-glass-panel border-amber-500/30 text-amber-100' :
            theme === 'amethyst' ? 'amethyst-glass-panel border-purple-500/30 text-purple-100' :
            'glass-panel border-white/15 text-slate-100'
          }`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg bg-white/5 ${isPlaylistPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
                <Disc size={14} className="text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold">CELESTIAL PLAYER</span>
                <span className="text-[8px] font-mono text-slate-500 -mt-0.5">Active Recitation Queue</span>
              </div>
            </div>

            {/* Loop progress badge */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                {currentPlaylistIndex + 1} of {playlist.length}
              </span>
              <button
                onClick={() => {
                  setIsPlaylistPlaying(false);
                  setCurrentPlaylistIndex(null);
                  triggerToast("Recitation loop stopped.", "Recitation Queue");
                  audio.playSparkle('click');
                }}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Stop Recitation & Exit Player"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body: Arabic calligraphy & details */}
          <div className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-xl p-3 shadow-inner mb-3">
            {/* Arabic Circle */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/5 to-amber-500/20 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 to-transparent animate-pulse" />
              <span className="text-3xl font-bold font-arabic text-amber-350 drop-shadow-[0_0_8px_rgba(245,158,11,0.55)] select-none z-10">
                {namesOfAllah.find(n => n.id === playlist[currentPlaylistIndex])?.name}
              </span>
            </div>

            {/* Text details */}
            <div className="flex-1 min-w-0">
              <span className="text-base font-bold font-display tracking-wide text-amber-50 truncate block leading-tight">
                {namesOfAllah.find(n => n.id === playlist[currentPlaylistIndex])?.transliteration}
              </span>
              <span className="text-xs text-slate-300 font-sans italic truncate block leading-relaxed mt-0.5">
                {namesOfAllah.find(n => n.id === playlist[currentPlaylistIndex])?.english}
              </span>
              <span className="text-[9px] font-mono text-slate-500 mt-1 flex items-center gap-1 uppercase">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {namesOfAllah.find(n => n.id === playlist[currentPlaylistIndex])?.category} Aspect
              </span>
            </div>

            {/* Audio Wave Visualizer */}
            <div className="flex items-end gap-[3px] h-6 shrink-0 pr-1">
              {[1, 2, 3, 4, 5, 6].map((b) => (
                <div
                  key={b}
                  className={`w-[3px] rounded-full bg-amber-400 transition-all duration-300 ${isPlaylistPlaying ? 'animate-pulse' : 'h-1'}`}
                  style={{
                    height: isPlaylistPlaying ? `${Math.sin(b + Date.now() / 120) * 10 + 14}px` : '4px',
                    animationDelay: `${b * 100}ms`,
                    animationDuration: `${0.6 + b * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Playback Progress Bar */}
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-3.5 border border-white/5">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${((currentPlaylistIndex + 1) / playlist.length) * 100}%` }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between gap-4">
            {/* Left: Previous/Play/Stop/Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const prevIdx = currentPlaylistIndex === 0 ? playlist.length - 1 : currentPlaylistIndex - 1;
                  playPlaylistItem(prevIdx);
                  audio.playSparkle('click');
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/10 active:scale-95 transition-all cursor-pointer"
                title="Previous Divine Name"
              >
                <SkipBack size={14} className="fill-current" />
              </button>

              <button
                onClick={() => {
                  if (isPlaylistPlaying) {
                    setIsPlaylistPlaying(false);
                    triggerToast("Recitation loop paused.", "Recitation Queue");
                  } else {
                    setIsPlaylistPlaying(true);
                    playPlaylistItem(currentPlaylistIndex !== null ? currentPlaylistIndex : 0);
                    triggerToast("Resuming recitation loop...", "Recitation Queue");
                  }
                  audio.playSparkle('click');
                }}
                className={`p-3 rounded-full border active:scale-95 transition-all shadow-lg cursor-pointer ${
                  isPlaylistPlaying 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                }`}
                title={isPlaylistPlaying ? "Pause Recitation" : "Resume Recitation"}
              >
                {isPlaylistPlaying ? <Pause size={18} className="fill-amber-300" /> : <Play size={18} className="fill-slate-200" />}
              </button>

              <button
                onClick={() => {
                  setIsPlaylistPlaying(false);
                  setCurrentPlaylistIndex(null);
                  triggerToast("Recitation loop stopped.", "Recitation Queue");
                  audio.playSparkle('click');
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-300 border border-white/5 hover:border-red-500/20 active:scale-95 transition-all cursor-pointer"
                title="Stop Recitation Loop"
              >
                <Square size={14} className="fill-current" />
              </button>

              <button
                onClick={() => {
                  const nextIdx = currentPlaylistIndex === playlist.length - 1 ? 0 : currentPlaylistIndex + 1;
                  playPlaylistItem(nextIdx);
                  audio.playSparkle('click');
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/10 active:scale-95 transition-all cursor-pointer"
                title="Next Divine Name"
              >
                <SkipForward size={14} className="fill-current" />
              </button>
            </div>

            {/* Right Side Settings: dropdown selectors */}
            <div className="flex items-center gap-2 flex-1 max-w-xs justify-end">
              {/* Qari Selection */}
              <select
                value={qariStyle}
                onChange={(e) => {
                  setQariStyle(e.target.value as any);
                  audio.playSparkle('click');
                  let styleName = "Celestial";
                  if (e.target.value === 'studio') styleName = "Studio Mishary";
                  else if (e.target.value === 'ghamdi_echo') styleName = "Saad Al-Ghamdi (Medina Echo)";
                  else if (e.target.value === 'sudais_grand') styleName = "Al-Sudais (Mecca Echo)";
                  triggerToast(`Chant style: ${styleName}`, "Player Style");
                }}
                className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-amber-300 font-mono text-[10px] focus:outline-none focus:border-amber-500/30 cursor-pointer max-w-[130px]"
                title="Recitation Audio Engine Style"
              >
                <option value="celestial">✨ Celestial</option>
                <option value="studio">🎙️ Studio Qari</option>
                <option value="ghamdi_echo">🕌 Saad Al-Ghamdi</option>
                <option value="sudais_grand">🕋 Al-Sudais</option>
              </select>

              {/* Dhikr Interval */}
              <select
                value={dhikrInterval}
                onChange={(e) => {
                  setDhikrInterval(Number(e.target.value));
                  audio.playSparkle('click');
                  triggerToast(`Pause interval: ${e.target.value}s`, "Interval Set");
                }}
                className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-amber-300 font-mono text-[10px] focus:outline-none focus:border-amber-500/30 cursor-pointer max-w-[100px]"
                title="Pause Duration Between Names"
              >
                <option value={0}>Gapless</option>
                <option value={1}>1s Pause</option>
                <option value={3}>3s Pause</option>
                <option value={5}>5s Pause</option>
                <option value={10}>10s Pause</option>
              </select>
            </div>
          </div>
        </div>
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

      {/* Gamified Spaced Learning & Analytics modals */}
      <SpiritualDashboardModal
        isOpen={showDashboardModal}
        onClose={() => setShowDashboardModal(false)}
        recitationHistory={recitationLogs}
        getStreaks={getStreaks}
        completedCount={completed.length}
        favoritesCount={favorites.length}
      />

      <FlashcardsModal
        isOpen={showFlashcardsModal}
        onClose={() => setShowFlashcardsModal(false)}
        leitnerBoxes={leitnerBoxes}
        onUpdateBox={(nameId, targetBox) => {
          setLeitnerBoxes(prev => {
            const updated = { ...prev, [nameId]: targetBox };
            localStorage.setItem('user_leitner_boxes', JSON.stringify(updated));

            // Track review timestamp for Leitner schedule
            const timestamps = JSON.parse(localStorage.getItem('user_leitner_timestamps') || '{}');
            timestamps[nameId] = Date.now();
            localStorage.setItem('user_leitner_timestamps', JSON.stringify(timestamps));

            if (currentUser) {
              setDoc(doc(db, 'user_data', currentUser.uid), {
                leitnerBoxes: updated,
                updatedAt: new Date().toISOString()
              }, { merge: true });
            }
            return updated;
          });
          triggerToast(`Name card relocated to Box ${targetBox}`, "Memorizer Update");
        }}
        namesOfAllah={namesOfAllah}
        remindersEnabled={leitnerRemindersEnabled}
        onToggleReminders={handleToggleReminders}
        onTestReminders={() => checkAndNotifyDueLeitner(true)}
      />

      <BadgesModal
        isOpen={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        completed={completed}
        favorites={favorites}
        getStreaks={getStreaks}
        reflectionsCount={Object.values(reflections).flat().length}
      />
    </div>
  );
}
