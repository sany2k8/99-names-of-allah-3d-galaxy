import React, { useState, useEffect } from 'react';
import { Bell, BellOff, MessageSquare, AlertCircle, Sparkles, Check } from 'lucide-react';
import { audio } from '../audio';

interface NotificationHubProps {
  onShowToast: (message: string, title?: string) => void;
}

export const NotificationHub: React.FC<NotificationHubProps> = ({ onShowToast }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enableDailyAlerts, setEnableDailyAlerts] = useState(true);
  const [enableMessages, setEnableMessages] = useState(true);
  const [alertInterval, setAlertInterval] = useState('60'); // minutes
  const [scheduledCount, setScheduledCount] = useState(0);

  const spiritualQuotes = [
    { title: "Divine Remembrance", text: "Verily, in the remembrance of Allah do hearts find rest. (Quran 13:28)" },
    { title: "Name of Mercy", text: "Call upon Allah or call upon the Most Merciful; whichever name you call, to Him belong the best names." },
    { title: "Reflective Moment", text: "And to Allah belong the best names, so invoke Him by them. (Quran 7:180)" },
    { title: "Daily Remembrance", text: "Keep your tongue wet with the remembrance of Allah throughout the day." },
    { title: "Pondering Asma-ul-Husna", text: "He is Allah, the Creator, the Inventor, the Fashioner; to Him belong the best names." },
  ];

  const taskReminders = [
    "Recitation Alert: Take a deep breath and recite 'Ar-Rahman' (The Beneficent) 3 times.",
    "Memorization Check: Can you recall the translation of 'Al-Malik' (The Sovereign)?",
    "Spiritual Reflection: Ponder on 'As-Salam' to welcome divine peace into your home.",
    "Recitation Goal: You are making beautiful progress. Review your completed checklist today!",
    "Spiritual Guard: Recite 'Al-Hafiz' (The Guardian) for safety and serenity in your endeavors."
  ];

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    audio.playSparkle('click');
    if (!('Notification' in window)) {
      onShowToast('Desktop notifications are not supported in this browser.', 'Browser Limit');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        onShowToast('Push Notifications successfully activated!', 'Notifications Active');
      } else {
        onShowToast('Notification permission was denied. We will use in-app alerts.', 'Permission Status');
      }
    } catch (err) {
      console.error(err);
      onShowToast('In-app alerts are active for your spiritual journey.', 'Offline Mode');
    }
  };

  // Automated scheduling simulator for New Message Alerts and Task Reminders
  useEffect(() => {
    if (!enableDailyAlerts && !enableMessages) return;

    // Simulate scheduling by triggering a gentle notification 5 seconds after mount, and periodically thereafter
    const triggerSimulatedAlert = () => {
      const randType = Math.random() > 0.5 ? 'message' : 'reminder';
      
      if (randType === 'message' && enableMessages) {
        const quote = spiritualQuotes[Math.floor(Math.random() * spiritualQuotes.length)];
        
        // Show HTML Web Notification if permitted
        if (permission === 'granted') {
          new Notification(quote.title, { body: quote.text, icon: '/favicon.ico' });
        }
        
        // Always display in-app toast for full visual feedback
        onShowToast(quote.text, quote.title);
        audio.playSparkle('favorite');
      } 
      else if (randType === 'reminder' && enableDailyAlerts) {
        const text = taskReminders[Math.floor(Math.random() * taskReminders.length)];
        
        if (permission === 'granted') {
          new Notification("Recitation Goal Reminder", { body: text });
        }
        
        onShowToast(text, "Spiritual Practice Goal");
        audio.playSparkle('click');
      }
      
      setScheduledCount(prev => prev + 1);
    };

    // First simulated reminder in 25 seconds (gentle introduction)
    const initialTimer = setTimeout(triggerSimulatedAlert, 25000);

    // Regular interval mapping (converted to seconds for demonstration / rapid interaction feedback)
    const intervalTime = parseInt(alertInterval, 10) * 1000; 
    const intervalTimer = setInterval(triggerSimulatedAlert, Math.max(15000, intervalTime));

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [enableDailyAlerts, enableMessages, alertInterval, permission]);

  const triggerInstantMock = () => {
    audio.playSparkle('complete');
    const quote = spiritualQuotes[Math.floor(Math.random() * spiritualQuotes.length)];
    onShowToast(quote.text, `✨ Instant Alert: ${quote.title}`);
  };

  return (
    <div id="notifications-panel" className="bg-[#0b0f19]/95 border border-white/5 backdrop-blur-md rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <Bell size={16} />
          </div>
          <div>
            <h4 className="font-sans font-medium text-sm leading-tight text-amber-200">Interactive Push Hub</h4>
            <p className="font-mono text-[9px] text-slate-400">Offline scheduler active</p>
          </div>
        </div>

        {permission === 'granted' ? (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <Check size={10} /> Native Active
          </span>
        ) : (
          <button
            onClick={requestPermission}
            className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-mono bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all"
          >
            Request Native
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* Toggle 1: New message alerts */}
        <div className="flex items-start justify-between bg-slate-950/40 border border-white/5 p-3 rounded-xl gap-2">
          <div className="flex items-start gap-2">
            <MessageSquare size={16} className="text-sky-400 mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-medium font-sans">New Spiritual Messages</span>
              <span className="text-[10px] text-slate-400 leading-tight">Receive periodic Quranic reflections and beautiful spiritual advice.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={enableMessages}
            onChange={(e) => {
              setEnableMessages(e.target.checked);
              audio.playSparkle('click');
            }}
            className="w-4 h-4 text-amber-500 accent-amber-500 bg-slate-950 border-white/10 rounded cursor-pointer mt-1"
          />
        </div>

        {/* Toggle 2: Task reminders */}
        <div className="flex items-start justify-between bg-slate-950/40 border border-white/5 p-3 rounded-xl gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-medium font-sans">Practice Goal Reminders</span>
              <span className="text-[10px] text-slate-400 leading-tight">Get automated task notifications to memorize and recite Asma-ul-Husna.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={enableDailyAlerts}
            onChange={(e) => {
              setEnableDailyAlerts(e.target.checked);
              audio.playSparkle('click');
            }}
            className="w-4 h-4 text-amber-500 accent-amber-500 bg-slate-950 border-white/10 rounded cursor-pointer mt-1"
          />
        </div>
      </div>

      {/* Interval Selector */}
      <div className="flex items-center justify-between bg-slate-950/20 border border-white/5 px-3 py-2 rounded-xl text-xs">
        <span className="text-slate-400 font-mono">Reminder Frequency</span>
        <select
          value={alertInterval}
          onChange={(e) => {
            setAlertInterval(e.target.value);
            audio.playSparkle('click');
          }}
          className="bg-slate-950 border border-white/5 rounded-md px-2 py-1 text-xs text-amber-400 focus:outline-none focus:border-amber-400/40"
        >
          <option value="15">Fast (15s Loop)</option>
          <option value="30">Quick (30s Loop)</option>
          <option value="60">Hourly (1m Loop)</option>
          <option value="180">Relaxed (3m Loop)</option>
        </select>
      </div>

      <button
        onClick={triggerInstantMock}
        className="w-full flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-white/5 hover:border-amber-500/30 text-slate-300 hover:text-amber-300 py-2 rounded-xl font-mono text-[10px] tracking-widest uppercase transition-all duration-200"
      >
        <Sparkles size={12} className="text-amber-400" />
        Trigger Sample Notification Now
      </button>

      <div className="font-mono text-[9px] text-slate-500 text-center">
        {scheduledCount > 0 ? `Simulated ${scheduledCount} active spiritual reminders` : 'Waiting for scheduled events...'}
      </div>
    </div>
  );
};
