"use client";

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  ShoppingCart,
  ShieldAlert,
  Settings as SettingsIcon,
  User,
  Bell,
  Check,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Plus,
  VolumeX,
  Volume2,
  Eye,
  LogOut,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  ChevronRight,
  UserCheck,
  Trash2,
  Edit3
} from 'lucide-react';

// Types
interface Roommate {
  id: string;
  name: string;
  initials: string;
  avatarColor: string; // Tailwind color class
  role: string;
  choresCompleted: number;
  expensesSpent: number;
  isGroupLeader: boolean;
  score: number; // contribution score
}

interface ChoreChecklistItem {
  text: string;
  done: boolean;
}

interface Chore {
  id: string;
  title: string;
  assignedTo: string | null; // Roommate ID or null for unassigned
  dueDate: string;
  completed: boolean;
  checklist: ChoreChecklistItem[];
  missed: boolean;
  points: number;
  category: string;
}

interface SupplyItem {
  id: string;
  name: string;
  status: 'stocked' | 'low' | 'out';
  assignedBuyer: string | null; // Roommate ID
  lastBoughtBy: string | null;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // Roommate ID
  date: string;
}

interface AppNotification {
  id: string;
  text: string;
  type: 'info' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
}

interface AuditLogEntry {
  id: string;
  actionType: 'chore' | 'supply' | 'expense';
  text: string;
  timestamp: string;
}

interface RecurringChore {
  id: string;
  title: string;
  assignedTo: string | null;
  frequencyType: 'days' | 'weekdays';
  daysInterval?: number;
  weekdays?: string[];
  points: number;
}

const InfoTooltip = ({ text, direction = 'up' }: { text: string; direction?: 'up' | 'down' }) => {
  return (
    <span className="group relative inline-flex items-center shrink-0 cursor-help normal-case font-sans">
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-[var(--text-muted)] text-[9px] font-bold text-[var(--text-muted)] hover:text-amber-400 hover:border-amber-400 transition-colors ml-1.5 select-none">
        i
      </span>
      <span className={`absolute left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] text-[10px] font-semibold rounded-xl shadow-2xl z-50 text-center leading-normal tracking-normal theme-transition-bg ${
        direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
      }`}>
        {text}
        {direction === 'up' ? (
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--card-bg)] border-r border-b border-[var(--border-color)] rotate-45 -mt-[3px]" />
        ) : (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--card-bg)] border-l border-t border-[var(--border-color)] rotate-45 -mb-[3px]" />
        )}
      </span>
    </span>
  );
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null); // null represents the login screen
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chores' | 'supplies' | 'accountability' | 'settings'>('dashboard');

  // Accessibility & Settings states
  const [accessibilityMode, setAccessibilityMode] = useState<'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'high-contrast'>('none');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [busyWeekMode, setBusyWeekMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  // App core data state
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [recurringChores, setRecurringChores] = useState<RecurringChore[]>([]);

  // Input states
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpensePaidBy, setNewExpensePaidBy] = useState('jane');
  const [newSupplyName, setNewSupplyName] = useState('');
  const [choreFilter, setChoreFilter] = useState<'all' | 'mine' | 'pool'>('all');
  const [activeChoreDetails, setActiveChoreDetails] = useState<string | null>(null);

  // Edit Mode & Settlement Inputs
  const [editSuppliesMode, setEditSuppliesMode] = useState<boolean>(false);
  const [settlePayer, setSettlePayer] = useState<string>('jane');
  const [settleReceiver, setSettleReceiver] = useState<string>('john');
  const [settleAmount, setSettleAmount] = useState<string>('');

  // Inline feedback state (instead of blocking bouncing top-right toasts)
  const [inlineNotification, setInlineNotification] = useState<{ text: string; type: 'success' | 'info' | 'alert' } | null>(null);

  // Default Mock Data using styled initials instead of emojis
  const defaultRoommates: Roommate[] = [
    { id: 'jane', name: 'Jane Human', initials: 'JH', avatarColor: 'from-amber-500 to-yellow-600', role: 'Biology Major', choresCompleted: 14, expensesSpent: 85.50, isGroupLeader: true, score: 78 },
    { id: 'john', name: 'John Computer', initials: 'JC', avatarColor: 'from-zinc-600 to-zinc-800', role: 'Engineering Major', choresCompleted: 8, expensesSpent: 20.00, isGroupLeader: false, score: 45 },
    { id: 'alex', name: 'Alex Chen', initials: 'AC', avatarColor: 'from-yellow-700 to-amber-900', role: 'Psychology Major', choresCompleted: 11, expensesSpent: 65.00, isGroupLeader: false, score: 65 },
    { id: 'knightro', name: 'Knightro', initials: 'KN', avatarColor: 'from-amber-400 to-yellow-500', role: 'UCF Mascot', choresCompleted: 12, expensesSpent: 55.00, isGroupLeader: false, score: 70 }
  ];

  const defaultChores: Chore[] = [
    {
      id: 'chore-1',
      title: 'Take out Trash & Recycling',
      assignedTo: 'john',
      dueDate: 'Today (Overdue by 2 days)',
      completed: false,
      checklist: [
        { text: 'Empty kitchen bin', done: false },
        { text: 'Empty recycling bin', done: false },
        { text: 'Take bags to complex dumpster', done: false }
      ],
      missed: true,
      points: 15,
      category: 'Cleaning'
    },
    {
      id: 'chore-2',
      title: 'Vacuum Living Room & Hallway',
      assignedTo: 'john',
      dueDate: 'Today',
      completed: false,
      checklist: [
        { text: 'Clear floor clutter', done: false },
        { text: 'Vacuum entire rug area', done: false },
        { text: 'Empty vacuum canister', done: false }
      ],
      missed: false,
      points: 20,
      category: 'Cleaning'
    },
    {
      id: 'chore-3',
      title: 'Wipe Kitchen Counters & Sink',
      assignedTo: 'alex',
      dueDate: 'Tomorrow',
      completed: false,
      checklist: [
        { text: 'Remove dirty dishes', done: false },
        { text: 'Wipe with disinfectant spray', done: false },
        { text: 'Clean drain guard', done: false }
      ],
      missed: false,
      points: 10,
      category: 'Kitchen'
    },
    {
      id: 'chore-4',
      title: 'Clean Shared Bathroom Sink & Mirror',
      assignedTo: null,
      dueDate: 'In 2 Days',
      completed: false,
      checklist: [
        { text: 'Wipe sink basin', done: false },
        { text: 'Spray mirror and wipe down', done: false }
      ],
      missed: false,
      points: 25,
      category: 'Bathroom'
    },
    {
      id: 'chore-5',
      title: 'Mop Common Hardwood Floors',
      assignedTo: 'jane',
      dueDate: 'In 3 Days',
      completed: false,
      checklist: [
        { text: 'Sweep dust first', done: false },
        { text: 'Mop floor using floor cleaner', done: false }
      ],
      missed: false,
      points: 30,
      category: 'Cleaning'
    }
  ];

  const defaultSupplies: SupplyItem[] = [
    { id: 'supply-1', name: 'Heavy Duty Trash Bags', status: 'low', assignedBuyer: null, lastBoughtBy: 'jane' },
    { id: 'supply-2', name: 'Dishwasher Pods', status: 'stocked', assignedBuyer: null, lastBoughtBy: 'alex' },
    { id: 'supply-3', name: 'Paper Towels (6 pack)', status: 'stocked', assignedBuyer: null, lastBoughtBy: 'knightro' },
    { id: 'supply-4', name: 'Hand Soap Refill', status: 'out', assignedBuyer: null, lastBoughtBy: 'jane' }
  ];

  const defaultExpenses: Expense[] = [
    { id: 'exp-1', description: 'Toilet Paper & Sponge pack', amount: 24.00, paidBy: 'jane', date: '2026-07-05' },
    { id: 'exp-2', description: 'Dishwasher detergent pods', amount: 18.50, paidBy: 'alex', date: '2026-07-06' },
    { id: 'exp-3', description: 'UCF Homecoming cleaning spray', amount: 15.00, paidBy: 'knightro', date: '2026-07-07' }
  ];

  const defaultNotifications: AppNotification[] = [
    { id: 'not-1', text: 'Trash Bags are running low! Assign a buyer.', type: 'alert', timestamp: '2 hours ago', read: false },
    { id: 'not-2', text: 'John Computer missed task "Take out Trash" (due 2 days ago).', type: 'alert', timestamp: '1 day ago', read: false },
    { id: 'not-3', text: 'Jane Human validated Knightro\'s vacuuming chore.', type: 'success', timestamp: 'Yesterday', read: true }
  ];

  const defaultAuditLogs: AuditLogEntry[] = [
    { id: 'aud-1', actionType: 'chore', text: "Chore completed: Clean Kitchen & Dishwasher by Jane Human [+20 pts]", timestamp: "2 hours ago" },
    { id: 'aud-2', actionType: 'supply', text: "Supply status changed: Hand Soap Refill marked OUT by John Computer", timestamp: "5 hours ago" },
    { id: 'aud-3', actionType: 'expense', text: "Bill split: Toilet Paper & Sponge pack ($24.00) split by Jane Human", timestamp: "1 day ago" }
  ];

  const defaultRecurringChores: RecurringChore[] = [
    { id: 'rec-1', title: 'Vacuum Living Room & Hallway', assignedTo: 'john', frequencyType: 'days', daysInterval: 7, points: 15 },
    { id: 'rec-2', title: 'Clean Kitchen & Dishwasher', assignedTo: 'jane', frequencyType: 'weekdays', weekdays: ['Mon', 'Wed', 'Fri'], points: 20 },
    { id: 'rec-3', title: 'Take out Trash & Recycling', assignedTo: 'alex', frequencyType: 'weekdays', weekdays: ['Tue', 'Thu', 'Sat'], points: 10 }
  ];

  // Helper trigger to show inline non-obtrusive feedback messages
  const triggerFeedback = (text: string, type: 'success' | 'info' | 'alert' = 'success') => {
    setInlineNotification({ text, type });
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);

        if (type === 'success') {
          osc.frequency.setValueAtTime(587.33, context.currentTime); // D5
          osc.frequency.setValueAtTime(880, context.currentTime + 0.1); // A5
          gain.gain.setValueAtTime(0.05, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.005, context.currentTime + 0.35);
          osc.start();
          osc.stop(context.currentTime + 0.35);
        } else if (type === 'alert') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, context.currentTime);
          osc.frequency.setValueAtTime(180, context.currentTime + 0.15);
          gain.gain.setValueAtTime(0.05, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.005, context.currentTime + 0.3);
          osc.start();
          osc.stop(context.currentTime + 0.3);
        }
      } catch (e) {
        // Audio block bypass
      }
    }
  };

  // Load state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const storedRoommates = localStorage.getItem('rk_roommates_v2');
    const storedChores = localStorage.getItem('rk_chores_v2');
    const storedSupplies = localStorage.getItem('rk_supplies_v2');
    const storedExpenses = localStorage.getItem('rk_expenses_v2');
    const storedNotifications = localStorage.getItem('rk_notifications_v2');
    const storedAuditLogs = localStorage.getItem('rk_audit_logs_v2');
    const storedRecurring = localStorage.getItem('rk_recurring_chores_v2');
    const storedAccessibility = localStorage.getItem('rk_accessibility_v2');
    const storedTheme = localStorage.getItem('rk_theme_v2');
    const storedBusyMode = localStorage.getItem('rk_busy_mode_v2');
    const storedUser = localStorage.getItem('rk_active_user_v2');

    if (storedRoommates) setRoommates(JSON.parse(storedRoommates));
    else setRoommates(defaultRoommates);

    if (storedChores) setChores(JSON.parse(storedChores));
    else setChores(defaultChores);

    if (storedSupplies) setSupplies(JSON.parse(storedSupplies));
    else setSupplies(defaultSupplies);

    if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
    else setExpenses(defaultExpenses);

    if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
    else setNotifications(defaultNotifications);

    if (storedAuditLogs) setAuditLogs(JSON.parse(storedAuditLogs));
    else setAuditLogs(defaultAuditLogs);

    if (storedRecurring) setRecurringChores(JSON.parse(storedRecurring));
    else setRecurringChores(defaultRecurringChores);

    if (storedAccessibility) setAccessibilityMode(storedAccessibility as any);
    if (storedTheme) setThemeMode(storedTheme as any);
    if (storedBusyMode) setBusyWeekMode(JSON.parse(storedBusyMode));
    if (storedUser) setActiveUserId(storedUser);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('rk_roommates_v2', JSON.stringify(roommates));
  }, [roommates, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('rk_chores_v2', JSON.stringify(chores));
  }, [chores, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('rk_supplies_v2', JSON.stringify(supplies));
  }, [supplies, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('rk_expenses_v2', JSON.stringify(expenses));
  }, [expenses, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('rk_notifications_v2', JSON.stringify(notifications));
  }, [notifications, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('rk_audit_logs_v2', JSON.stringify(auditLogs));
  }, [auditLogs, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('rk_recurring_chores_v2', JSON.stringify(recurringChores));
  }, [recurringChores, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('rk_accessibility_v2', accessibilityMode);
  }, [accessibilityMode, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('rk_theme_v2', themeMode);
  }, [themeMode, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('rk_busy_mode_v2', JSON.stringify(busyWeekMode));
  }, [busyWeekMode, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (activeUserId) localStorage.setItem('rk_active_user_v2', activeUserId);
    else localStorage.removeItem('rk_active_user_v2');
  }, [activeUserId, mounted]);

  // Clear feedback notification timer
  useEffect(() => {
    if (inlineNotification) {
      const timer = setTimeout(() => setInlineNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [inlineNotification]);

  // Accessibility Color theme calculations (No blue in UCF colors)
  const getThemeColors = () => {
    switch (accessibilityMode) {
      case 'deuteranopia': // optimized for red-green colorblindness (uses amber/yellow & grayscale contrast)
        return {
          gold: 'bg-yellow-500 border-yellow-600 text-black hover:bg-yellow-600',
          goldText: 'text-yellow-400',
          goldBorder: 'border-yellow-500/30',
          successBadge: 'bg-zinc-800 text-yellow-300 border border-zinc-700',
          alertBadge: 'bg-zinc-900 text-neutral-400 border border-neutral-700',
          progressGold: 'bg-yellow-400',
          hoverGlow: 'hover:border-yellow-500/50'
        };
      case 'protanopia':
        return {
          gold: 'bg-yellow-500 border-yellow-600 text-black hover:bg-yellow-600',
          goldText: 'text-yellow-400',
          goldBorder: 'border-yellow-500/30',
          successBadge: 'bg-zinc-800 text-yellow-300 border border-zinc-700',
          alertBadge: 'bg-zinc-900 text-neutral-400 border border-neutral-700',
          progressGold: 'bg-yellow-400',
          hoverGlow: 'hover:border-yellow-500/50'
        };
      case 'tritanopia':
        return {
          gold: 'bg-amber-400 border-amber-500 text-black hover:bg-amber-500',
          goldText: 'text-amber-400',
          goldBorder: 'border-amber-500/30',
          successBadge: 'bg-[#1a1c23] text-emerald-400 border border-emerald-500/20',
          alertBadge: 'bg-[#2a1b1b] text-rose-400 border border-rose-500/20',
          progressGold: 'bg-amber-400',
          hoverGlow: 'hover:border-amber-500/40'
        };
      case 'high-contrast':
        return {
          gold: 'bg-white border-2 border-white text-black hover:bg-neutral-200 font-bold',
          goldText: 'text-white font-bold underline decoration-white decoration-2',
          goldBorder: 'border-2 border-white',
          successBadge: 'bg-black text-white border-2 border-white font-bold',
          alertBadge: 'bg-black text-white border-2 border-dashed border-white font-bold',
          progressGold: 'bg-white',
          hoverGlow: 'hover:border-white'
        };
      default: // Pure UCF Branding (Black, Dark Gray, UCF Gold, White)
        return {
          gold: 'bg-amber-400 border-amber-500 text-black hover:bg-amber-500 font-medium',
          goldText: 'text-amber-400',
          goldBorder: 'border-amber-500/30',
          successBadge: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
          alertBadge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          progressGold: 'bg-amber-400',
          hoverGlow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.08)] hover:border-amber-500/40'
        };
    }
  };

  const theme = getThemeColors();

  // Helper to add audit logs
  const addAuditLog = (actionType: 'chore' | 'supply' | 'expense', text: string) => {
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      actionType,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Reset to Baseline state
  const handleResetData = () => {
    setRoommates(defaultRoommates);
    setChores(defaultChores);
    setSupplies(defaultSupplies);
    setExpenses(defaultExpenses);
    setNotifications(defaultNotifications);
    setAuditLogs(defaultAuditLogs);
    setRecurringChores(defaultRecurringChores);
    setBusyWeekMode(false);
    setAccessibilityMode('none');
    setThemeMode('dark');
    setEditSuppliesMode(false);
    triggerFeedback('Prototype data reset to baseline!', 'info');
  };

  // Login handler
  const handleLogin = (userId: string) => {
    setActiveUserId(userId);
    const userObj = roommates.find(r => r.id === userId);
    triggerFeedback(`Welcome, ${userObj?.name}!`, 'success');
  };

  const handleLogout = () => {
    setActiveUserId(null);
    triggerFeedback('Logged out successfully', 'info');
  };

  // Scenario A Actions: supply modifications & nudge
  const handleReportLowSupply = (supplyId: string) => {
    let itemName = '';
    let nextStatusVal = '';
    setSupplies(prev => prev.map(s => {
      if (s.id === supplyId) {
        const nextStatus = s.status === 'stocked' ? 'low' : s.status === 'low' ? 'out' : 'stocked';
        itemName = s.name;
        nextStatusVal = nextStatus;
        return { ...s, status: nextStatus, assignedBuyer: nextStatus === 'stocked' ? null : s.assignedBuyer };
      }
      return s;
    }));
    const userName = roommates.find(r => r.id === activeUserId)?.name || 'Someone';
    addAuditLog('supply', `Supply status changed: "${itemName}" marked ${nextStatusVal.toUpperCase()} by ${userName}`);
    triggerFeedback('Supply status updated', 'info');
  };

  const handleAutoAssignBuyer = (supplyId: string) => {
    const supply = supplies.find(s => s.id === supplyId);
    if (!supply) return;

    // Pick roommate with the lowest total spent to balance contributions fairly
    const sorted = [...roommates].sort((a, b) => a.expensesSpent - b.expensesSpent);
    const assignee = sorted[0]; // John Computer in baseline

    setSupplies(prev => prev.map(s => {
      if (s.id === supplyId) {
        return { ...s, assignedBuyer: assignee.id };
      }
      return s;
    }));

    const userName = roommates.find(r => r.id === activeUserId)?.name || 'Someone';
    addAuditLog('supply', `Supply auto-assignment: "${supply.name}" buyer assigned to ${assignee.name} by ${userName}`);

    const newNotif: AppNotification = {
      id: `not-${Date.now()}`,
      text: `${assignee.name} was auto-assigned to buy "${supply.name}".`,
      type: 'info',
      timestamp: 'Just now',
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    triggerFeedback(`Auto-assigned ${supply.name} to ${assignee.name}!`, 'success');
  };

  const handleNudgeRoommate = (nudgeeId: string, choreTitle: string) => {
    const nudgee = roommates.find(r => r.id === nudgeeId);
    if (!nudgee) return;

    const newNotif: AppNotification = {
      id: `not-${Date.now()}`,
      text: `Alert: Structured reminder sent to ${nudgee.name} for task "${choreTitle}".`,
      type: 'alert',
      timestamp: 'Just now',
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    triggerFeedback(`Nudged ${nudgee.name} about "${choreTitle}"`, 'alert');
  };

  // Scenario B Actions: task completion checklist & add split expense
  const handleToggleSubtask = (choreId: string, subtaskIndex: number) => {
    setChores(prev => prev.map(c => {
      if (c.id === choreId) {
        const updatedChecklist = [...c.checklist];
        updatedChecklist[subtaskIndex] = {
          ...updatedChecklist[subtaskIndex],
          done: !updatedChecklist[subtaskIndex].done
        };
        return { ...c, checklist: updatedChecklist };
      }
      return c;
    }));
  };

  const handleSubmitChore = (choreId: string) => {
    const chore = chores.find(c => c.id === choreId);
    if (!chore) return;

    setChores(prev => prev.map(c => {
      if (c.id === choreId) {
        return { ...c, completed: true, missed: false };
      }
      return c;
    }));

    // "if you complete someone else's chores, you claim the points for that assigned chore"
    // Award points to activeUserId!
    setRoommates(prev => prev.map(r => {
      if (r.id === activeUserId) {
        const nextCount = r.choresCompleted + 1;
        return {
          ...r,
          choresCompleted: nextCount,
          score: Math.min(100, r.score + chore.points)
        };
      }
      return r;
    }));

    const completerName = roommates.find(r => r.id === activeUserId)?.name || 'Someone';
    const assigneeName = roommates.find(r => r.id === chore.assignedTo)?.name || 'Unassigned';
    addAuditLog('chore', `Chore completed: "${chore.title}" completed by ${completerName} (originally assigned to ${assigneeName}) [+${chore.points} pts]`);

    const newNotif: AppNotification = {
      id: `not-${Date.now()}`,
      text: `${completerName} completed task "${chore.title}".`,
      type: 'success',
      timestamp: 'Just now',
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    triggerFeedback(`Chore "${chore.title}" submitted!`, 'success');
  };

  const handleClaimChore = (choreId: string) => {
    const chore = chores.find(c => c.id === choreId);
    if (!chore) return;
    setChores(prev => prev.map(c => {
      if (c.id === choreId) {
        return { ...c, assignedTo: activeUserId };
      }
      return c;
    }));
    const userName = roommates.find(r => r.id === activeUserId)?.name || 'Someone';
    addAuditLog('chore', `Chore claimed: "${chore.title}" claimed by ${userName}`);
    triggerFeedback('Chore claimed successfully!', 'success');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseDesc.trim() || !newExpenseAmount || isNaN(parseFloat(newExpenseAmount))) {
      triggerFeedback('Please enter a valid description and amount', 'alert');
      return;
    }

    const amountNum = parseFloat(newExpenseAmount);

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      description: newExpenseDesc,
      amount: amountNum,
      paidBy: newExpensePaidBy,
      date: new Date().toISOString().split('T')[0]
    };

    // Cap expenses at 50 history entries
    setExpenses(prev => [newExpense, ...prev].slice(0, 50));

    setRoommates(prev => prev.map(r => {
      if (r.id === newExpensePaidBy) {
        return {
          ...r,
          expensesSpent: r.expensesSpent + amountNum,
          score: Math.min(100, r.score + Math.round(amountNum / 2))
        };
      }
      return r;
    }));

    const payerName = roommates.find(r => r.id === newExpensePaidBy)?.name || 'Someone';
    addAuditLog('expense', `Bill split: "${newExpenseDesc}" ($${amountNum.toFixed(2)}) split by ${payerName}`);

    const newNotif: AppNotification = {
      id: `not-${Date.now()}`,
      text: `${payerName} split bill "${newExpenseDesc}" ($${amountNum.toFixed(2)}).`,
      type: 'success',
      timestamp: 'Just now',
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    setNewExpenseDesc('');
    setNewExpenseAmount('');
    triggerFeedback('Expense logged and balanced!', 'success');
  };

  const handleAddSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplyName.trim()) return;

    const newSupply: SupplyItem = {
      id: `supply-${Date.now()}`,
      name: newSupplyName,
      status: 'stocked',
      assignedBuyer: null,
      lastBoughtBy: null
    };

    setSupplies(prev => [...prev, newSupply]);
    const userName = roommates.find(r => r.id === activeUserId)?.name || 'Someone';
    addAuditLog('supply', `Supply added: "${newSupplyName}" created by ${userName}`);
    setNewSupplyName('');
    triggerFeedback(`Added "${newSupplyName}" to stock list`, 'success');
  };

  const handleSettleBalances = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleAmount || isNaN(parseFloat(settleAmount)) || parseFloat(settleAmount) <= 0) {
      triggerFeedback('Please enter a valid settle amount', 'alert');
      return;
    }
    if (settlePayer === settleReceiver) {
      triggerFeedback('Payer and receiver cannot be the same roommate', 'alert');
      return;
    }

    const amountNum = parseFloat(settleAmount);

    // Payer pays Receiver direct money.
    // To balance their contributions, we add amountNum to Payer's expensesSpent, and subtract amountNum from Receiver's expensesSpent.
    setRoommates(prev => prev.map(r => {
      if (r.id === settlePayer) {
        return { ...r, expensesSpent: r.expensesSpent + amountNum };
      }
      if (r.id === settleReceiver) {
        return { ...r, expensesSpent: r.expensesSpent - amountNum };
      }
      return r;
    }));

    const payerName = roommates.find(r => r.id === settlePayer)?.name || 'Someone';
    const receiverName = roommates.find(r => r.id === settleReceiver)?.name || 'Someone';

    // Record special settlement in expenses log, capped at 50
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      description: `Repayment: ${payerName.split(' ')[0]} paid ${receiverName.split(' ')[0]}`,
      amount: amountNum,
      paidBy: settlePayer,
      date: new Date().toISOString().split('T')[0]
    };
    setExpenses(prev => [newExpense, ...prev].slice(0, 50));

    addAuditLog('expense', `Repayment settle: ${payerName} paid ${receiverName} $${amountNum.toFixed(2)}`);

    const newNotif: AppNotification = {
      id: `not-${Date.now()}`,
      text: `Repayment: ${payerName} settled $${amountNum.toFixed(2)} with ${receiverName}.`,
      type: 'success',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    setSettleAmount('');
    triggerFeedback(`Recorded settlement: $${amountNum.toFixed(2)} transferred!`, 'success');
  };

  const handleRenameSupply = (supplyId: string, newName: string) => {
    setSupplies(prev => prev.map(s => {
      if (s.id === supplyId) {
        return { ...s, name: newName };
      }
      return s;
    }));
  };

  const handleRemoveSupply = (supplyId: string) => {
    const target = supplies.find(s => s.id === supplyId);
    if (!target) return;
    setSupplies(prev => prev.filter(s => s.id !== supplyId));
    const userName = roommates.find(r => r.id === activeUserId)?.name || 'Someone';
    addAuditLog('supply', `Supply removed: "${target.name}" deleted by ${userName}`);
    triggerFeedback(`Removed "${target.name}" from stock list`, 'info');
  };

  const handleToggleGroupLeader = (roommateId: string) => {
    setRoommates(prev => prev.map(r => ({
      ...r,
      isGroupLeader: r.id === roommateId
    })));
    const target = roommates.find(r => r.id === roommateId);
    triggerFeedback(`${target?.name} is now the designated leader`, 'info');
  };

  // Calculations
  const activeUserObj = roommates.find(r => r.id === activeUserId);
  const userChores = chores.filter(c => c.assignedTo === activeUserId && !c.completed);
  const poolChores = chores.filter(c => c.assignedTo === null && !c.completed);
  const totalCompletedChores = chores.filter(c => c.completed).length;
  const householdScore = Math.round((totalCompletedChores / (chores.length || 1)) * 100);

  const totalHouseholdSpent = roommates.reduce((acc, curr) => acc + curr.expensesSpent, 0);
  const avgHouseholdSpent = totalHouseholdSpent / (roommates.length || 1);

  // Loading indicator
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-amber-400 font-mono">
        <RefreshCw className="animate-spin mr-2" size={18} />
        <span>LOADING ROOMKNIGHTS SYSTEM...</span>
      </div>
    );
  }

  // 1. Realistic Login/Landing Screen (Required if activeUserId is null)
  if (!activeUserId) {
    return (
      <div className={`min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-6 relative overflow-hidden ${themeMode === 'light' ? 'theme-light' : ''} theme-transition-bg`}>
        {/* Abstract Gold Background Glow elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl relative z-10 shadow-2xl space-y-6 theme-transition-bg">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-wider text-[var(--foreground)]">
              ROOM<span className="text-amber-400">KNIGHTS</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
              UCF Roommate Portal for Chores, Joint Purchases, and Task Accountability.
            </p>
          </div>

          <div className="space-y-4">
            <span className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest text-center">
              Select Profile to Log In
            </span>

            <div className="space-y-2.5">
              {defaultRoommates.map((rm) => (
                <button
                  key={rm.id}
                  onClick={() => handleLogin(rm.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-color)] hover:border-amber-400/60 hover:bg-[var(--background)] hover:shadow-[0_0_15px_rgba(245,158,11,0.06)] transition-all duration-200 group text-left theme-transition-bg"
                >
                  <div className="flex items-center gap-3">
                    {/* Circle Avatar Initials instead of Emojis */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rm.avatarColor} flex items-center justify-center font-bold text-sm text-white shadow-inner`}>
                      {rm.initials}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[var(--foreground)] group-hover:text-amber-400 transition-colors">
                        {rm.name}
                      </h3>
                      <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                        {rm.role}
                      </span>
                    </div>
                  </div>
                  <UserCheck size={16} className="text-neutral-600 group-hover:text-amber-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-muted)]">CAP 3104 Project Simulation</span>
            <button
              onClick={handleResetData}
              className="text-[10px] text-[var(--text-muted)] hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={10} /> Reset Data State
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Portal Application Dashboard View (Jane/John/Alex authenticated)
  return (
    <div className={`min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col ${themeMode === 'light' ? 'theme-light' : ''} theme-transition-bg`}>
      {/* Top Header Navigation Bar (Centered like portfolio header) */}
      <header className="sticky top-0 z-30 w-full bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border-color)] py-4 px-4 sm:px-6 theme-transition-bg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="shrink-0">
            <span className="font-black text-lg tracking-wider text-[var(--foreground)]">
              ROOM<span className="text-amber-400">KNIGHTS</span>
            </span>
          </div>

          {/* Navigation Tabs - Centered on Desktop (Settings removed) */}
          <nav className="hidden md:flex items-center gap-1 bg-[var(--input-bg)]/80 p-1.5 rounded-2xl border border-[var(--border-color)] theme-transition-bg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-amber-400 text-black shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('chores')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'chores' ? 'bg-amber-400 text-black shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
            >
              Chores
            </button>
            <button
              onClick={() => setActiveTab('supplies')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'supplies' ? 'bg-amber-400 text-black shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
            >
              Supplies & Expenses
            </button>
            <button
              onClick={() => setActiveTab('accountability')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'accountability' ? 'bg-amber-400 text-black shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
            >
              Accountability Logs
            </button>
          </nav>

          {/* Right Accessories */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification alert bells */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--foreground)] rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] transition-colors theme-transition-bg"
              >
                <Bell size={14} />
                {notifications.filter(n => !n.read && n.type === 'alert').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 text-white rounded-full text-[7px] flex items-center justify-center font-bold animate-pulse">
                    {notifications.filter(n => !n.read && n.type === 'alert').length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden z-50 theme-transition-bg">
                  <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--foreground)]">Alerts & Nudges</span>
                    <button
                      onClick={() => {
                        setNotifications(prev => prev.map(n => n.type === 'alert' ? { ...n, read: true } : n));
                        triggerFeedback('All alerts cleared', 'info');
                      }}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Clear unread
                    </button>
                  </div>
                  <div className="divide-y divide-[var(--border-color)] max-h-60 overflow-y-auto">
                    {notifications.filter(n => n.type === 'alert').length === 0 ? (
                      <div className="p-6 text-center text-xs text-[var(--text-muted)] font-medium">
                        No active alerts or nudges
                      </div>
                    ) : (
                      notifications.filter(n => n.type === 'alert').map((n) => (
                        <div key={n.id} className={`p-3 transition-colors ${n.read ? 'opacity-60' : 'bg-rose-500/5'}`}>
                          <p className="text-[11px] text-[var(--foreground)] leading-relaxed font-semibold">{n.text}</p>
                          <span className="text-[8px] text-[var(--text-muted)] block mt-1">{n.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dedicated Settings Gear Button between notifications and profile */}
            <button
              onClick={() => {
                setActiveTab('settings');
                triggerFeedback('Settings opened', 'info');
              }}
              className={`p-1.5 rounded-lg border transition-colors theme-transition-bg ${activeTab === 'settings'
                ? 'bg-amber-400 text-black border-amber-500 shadow-md animate-pulse'
                : 'text-[var(--text-muted)] hover:text-[var(--foreground)] bg-[var(--input-bg)] border border-[var(--border-color)]'
                }`}
              title="Settings Options"
            >
              <SettingsIcon size={14} />
            </button>

            {/* Initials Avatar */}
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activeUserObj?.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm`}>
              {activeUserObj?.initials}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] transition-colors theme-transition-bg"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar - visible only on mobile screens (Settings removed) */}
        <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--card-bg)] p-2 flex justify-around text-xs font-semibold theme-transition-bg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center ${activeTab === 'dashboard' ? 'bg-amber-400 text-black shadow-md' : 'text-[var(--text-muted)]'
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('chores')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center ${activeTab === 'chores' ? 'bg-amber-400 text-black shadow-md' : 'text-[var(--text-muted)]'
              }`}
          >
            Chores
          </button>
          <button
            onClick={() => setActiveTab('supplies')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center ${activeTab === 'supplies' ? 'bg-amber-400 text-black shadow-md' : 'text-[var(--text-muted)]'
              }`}
          >
            Supplies
          </button>
          <button
            onClick={() => setActiveTab('accountability')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center ${activeTab === 'accountability' ? 'bg-amber-400 text-black shadow-md' : 'text-[var(--text-muted)]'
              }`}
          >
            Accountability
          </button>
        </div>
      </header>

      {/* Main Content Area - Centered like the portfolio content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Non-intrusive Inline success/information alert box (replaces bouncing top-right toast) */}
        {inlineNotification && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all duration-300 animate-fadeIn theme-transition-bg ${inlineNotification.type === 'alert'
            ? (themeMode === 'light' ? 'bg-rose-500/10 border-rose-500/20 text-rose-800' : 'bg-rose-950/20 border-rose-500/40 text-rose-100')
            : (themeMode === 'light' ? 'bg-amber-500/10 border-amber-500/20 text-amber-900' : 'bg-amber-950/20 border-amber-500/40 text-amber-100')
            }`}>
            <AlertTriangle className={inlineNotification.type === 'alert' ? 'text-rose-500' : 'text-amber-500'} size={18} />
            <span className="text-xs font-semibold">{inlineNotification.text}</span>
          </div>
        )}

        {/* Tab Content: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Supply inventory alert warning */}
            {supplies.some(s => s.status === 'out') && (
              <div className={`p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border theme-transition-bg ${themeMode === 'light' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-950/10 border-rose-500/30'
                }`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-rose-500 shrink-0" size={18} />
                  <div>
                    <span className="font-bold text-xs text-[var(--foreground)]">Inventory Warning</span>
                    <p className={`text-[11px] mt-0.5 ${themeMode === 'light' ? 'text-rose-700' : 'text-rose-300'}`}>
                      Supply item "{supplies.find(s => s.status === 'out')?.name}" is out of stock. Assign buyer to restock.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('supplies')}
                  className={`text-[10px] px-3.5 py-1.5 rounded-xl font-bold transition-all ${theme.gold}`}
                >
                  Manage Inventory
                </button>
              </div>
            )}

            {/* Stats Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

              {/* Stats 1: Cleanliness progress */}
              <div className={`p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between transition-all duration-300 theme-transition-bg ${theme.hoverGlow}`}>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Chore Completion</span>
                  <span className="text-2xl font-black text-[var(--foreground)] font-mono">{householdScore}%</span>
                </div>
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="transparent" stroke={themeMode === 'light' ? '#e4e4e7' : '#1f1f23'} strokeWidth="4" />
                    <circle cx="24" cy="24" r="20" fill="transparent" stroke={accessibilityMode === 'high-contrast' ? (themeMode === 'light' ? '#000000' : '#ffffff') : '#fbbf24'} strokeWidth="4"
                      strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * householdScore) / 100} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--foreground)]">
                    {totalCompletedChores}/{chores.length}
                  </div>
                </div>
              </div>

              {/* Stats 2: Expenditure Balance */}
              <div className={`p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between transition-all duration-300 theme-transition-bg ${theme.hoverGlow}`}>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Budget Status</span>
                  <span className="text-2xl font-black text-[var(--foreground)] font-mono block">
                    ${(activeUserObj!.expensesSpent - avgHouseholdSpent) >= 0 ? '+' : ''}{(activeUserObj!.expensesSpent - avgHouseholdSpent).toFixed(2)}
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${(activeUserObj!.expensesSpent - avgHouseholdSpent) >= 0 ? theme.successBadge : theme.alertBadge
                  }`}>
                  <DollarSign size={18} />
                </div>
              </div>

              {/* Stats 3: Tasks count */}
              <div className={`p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between transition-all duration-300 theme-transition-bg ${theme.hoverGlow}`}>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Your Pending Chores</span>
                  <span className="text-2xl font-black text-[var(--foreground)] font-mono">{userChores.length}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center text-amber-400 theme-transition-bg">
                  <CheckSquare size={18} />
                </div>
              </div>

            </div>

            {/* Roommate Standings & Contribution Board */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl space-y-4 theme-transition-bg">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-extrabold text-sm text-[var(--foreground)] uppercase tracking-wider flex items-center">
                  Roommate Standings
                  <InfoTooltip text="Gamified leaderboard tracking roommates by completed chores and household expenditures." direction="down" />
                </h2>
                <div className="text-xs text-[var(--text-muted)] bg-[var(--input-bg)] border border-[var(--border-color)] px-3 py-1.5 rounded-xl theme-transition-bg shrink-0">
                  Leader: <strong className="text-amber-400">{roommates.find(r => r.isGroupLeader)?.name.split(' ')[0] || 'None'}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roommates.map((rm) => (
                  <div
                    key={rm.id}
                    className={`p-4 rounded-2xl bg-[var(--card-bg)]/40 border border-[var(--border-color)]/60 flex items-center justify-between theme-transition-bg ${rm.id === activeUserId ? 'ring-1 ring-amber-400/50 bg-[var(--input-bg)]/10' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Initials Avatar */}
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${rm.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm`}>
                        {rm.initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                          <span className="truncate">{rm.name}</span>
                          {rm.isGroupLeader && (
                            <span className="text-[8px] bg-amber-400/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.2 rounded shrink-0">
                              Lead
                            </span>
                          )}
                        </h3>
                        <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                          {rm.choresCompleted} tasks complete • Spent ${rm.expensesSpent.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-[var(--text-muted)] block">Score</span>
                      <span className={`text-xs font-mono font-bold ${rm.score > 70 ? 'text-amber-400' : 'text-[var(--text-muted)]'}`}>
                        {rm.score} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Chores */}
        {activeTab === 'chores' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">

            {/* Left Column: Tasks & Duties List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-extrabold text-sm text-[var(--foreground)] uppercase tracking-wider flex items-center">
                  Active Chores & Duties
                  <InfoTooltip text="List of current household chores. Expand to check off tasks, claim pool duties, or track points." direction="down" />
                </h2>

                {/* Filters */}
                <div className="bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border-color)] flex text-[10px] font-bold theme-transition-bg shrink-0">
                  <button
                    onClick={() => setChoreFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${choreFilter === 'all' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--text-muted)]'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setChoreFilter('mine')}
                    className={`px-3 py-1 rounded-lg transition-all ${choreFilter === 'mine' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--text-muted)]'}`}
                  >
                    My Tasks
                  </button>
                  <button
                    onClick={() => setChoreFilter('pool')}
                    className={`px-3 py-1 rounded-lg transition-all ${choreFilter === 'pool' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--text-muted)]'}`}
                  >
                    Pool
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {chores
                  .filter(c => {
                    if (choreFilter === 'mine') return c.assignedTo === activeUserId && !c.completed;
                    if (choreFilter === 'pool') return c.assignedTo === null && !c.completed;
                    return true;
                  })
                  .map((chore) => {
                    const assignee = roommates.find(r => r.id === chore.assignedTo);
                    const isExpanded = activeChoreDetails === chore.id;

                    return (
                      <div
                        key={chore.id}
                        className={`rounded-2xl border transition-all duration-200 theme-transition-bg ${chore.completed
                          ? 'bg-[var(--card-bg)]/30 border-[var(--border-color)]/40 opacity-60'
                          : chore.missed
                            ? 'bg-rose-950/5 border-rose-900/40'
                            : isExpanded
                              ? 'bg-[var(--input-bg)] border-[var(--border-color)] shadow-md'
                              : 'bg-[var(--card-bg)] border-[var(--border-color)] hover:border-amber-400/40'
                          }`}
                      >
                        <div
                          onClick={() => !chore.completed && setActiveChoreDetails(isExpanded ? null : chore.id)}
                          className="p-4 flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${chore.completed
                              ? 'bg-amber-400 border-amber-400 text-black'
                              : chore.missed
                                ? 'border-rose-500'
                                : 'border-neutral-600'
                              }`}>
                              {chore.completed && <Check size={10} strokeWidth={4} />}
                            </div>
                            <div className="min-w-0">
                              <h3 className={`text-xs font-bold text-[var(--foreground)] truncate ${chore.completed ? 'line-through text-[var(--text-muted)]' : ''}`}>
                                {chore.title}
                              </h3>
                              <span className={`text-[9px] block mt-0.5 font-semibold ${chore.completed ? 'text-[var(--text-muted)]' : chore.missed ? 'text-rose-400' : 'text-[var(--text-muted)]'}`}>
                                Due: {chore.dueDate}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {/* Points badge */}
                            <span className="text-[9px] font-mono font-bold bg-[var(--input-bg)] border border-[var(--border-color)] px-2.5 py-0.5 rounded-full text-amber-400 theme-transition-bg">
                              {chore.points} pts
                            </span>

                            {assignee ? (
                              <div className="flex items-center gap-1.5 bg-[var(--input-bg)] px-2.5 py-1 rounded-full text-[10px] text-[var(--foreground)] border border-[var(--border-color)] theme-transition-bg">
                                <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${assignee.avatarColor} flex items-center justify-center font-bold text-[8px] text-white shrink-0 shadow-sm`}>
                                  {assignee.initials}
                                </div>
                                <span className="text-[10px] font-bold text-[var(--foreground)] hidden sm:inline">{assignee.name.split(' ')[0]}</span>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClaimChore(chore.id);
                                }}
                                className={`text-[9px] px-2.5 py-1 rounded-lg border font-bold transition-all ${theme.gold}`}
                              >
                                Claim
                              </button>
                            )}
                          </div>
                        </div>

                        {isExpanded && !chore.completed && (
                          <div className="px-4 pb-4 border-t border-[var(--border-color)]/60 pt-3 space-y-3">
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Subtask Checklist:</span>
                              <div className="space-y-1.5">
                                {chore.checklist.map((sub, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handleToggleSubtask(chore.id, idx)}
                                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--input-bg)]/80 cursor-pointer transition-colors"
                                  >
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${sub.done ? 'bg-amber-400 border-amber-400 text-black' : 'border-neutral-600'
                                      }`}>
                                      {sub.done && <Check size={8} strokeWidth={4} />}
                                    </div>
                                    <span className={`text-xs ${sub.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--foreground)]'}`}>
                                      {sub.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {chore.checklist.filter(s => s.done).length} of {chore.checklist.length} done
                              </span>
                              <button
                                onClick={() => handleSubmitChore(chore.id)}
                                disabled={!chore.checklist.every(s => s.done)}
                                className={`text-xs px-4 py-2 rounded-xl transition-all ${chore.checklist.every(s => s.done)
                                  ? theme.gold
                                  : 'bg-[var(--input-bg)] text-[var(--text-muted)] border border-[var(--border-color)] cursor-not-allowed theme-transition-bg'
                                  }`}
                              >
                                Complete Chore
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right Column: Recurring Chore Templates */}
            <div className="space-y-4">
              <h2 className="font-extrabold text-sm text-[var(--foreground)] uppercase tracking-wider flex items-center">
                Recurring Chore Templates
                <InfoTooltip text="Templates that automatically schedule recurring household chores on custom intervals or weekdays." direction="down" />
              </h2>

              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-3xl space-y-4 theme-transition-bg">

                <div className="space-y-3.5">
                  {recurringChores.map((rec) => {
                    const assignee = roommates.find(r => r.id === rec.assignedTo);
                    return (
                      <div key={rec.id} className="p-3.5 bg-[var(--input-bg)]/60 border border-[var(--border-color)]/60 rounded-2xl flex flex-col gap-2 theme-transition-bg">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[var(--foreground)]">{rec.title}</span>
                          <span className="text-[9px] font-mono font-bold bg-[var(--card-bg)] px-2 py-0.5 border border-[var(--border-color)] rounded-full text-amber-400 shrink-0">
                            {rec.points} pts
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mt-1 gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="shrink-0 font-semibold">Auto:</span>
                            {assignee ? (
                              <div className="flex items-center gap-1 min-w-0">
                                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${assignee.avatarColor} flex items-center justify-center font-bold text-[8px] text-white shrink-0 shadow-sm`}>
                                  {assignee.initials}
                                </div>
                                <span className="truncate text-[9px] font-bold text-[var(--foreground)]">{assignee.name.split(' ')[0]}</span>
                              </div>
                            ) : (
                              <span className="text-[9px] italic text-[var(--text-muted)]">Unassigned pool</span>
                            )}
                          </div>

                          <span className="shrink-0 font-bold bg-[var(--card-bg)] px-2 py-0.5 rounded border border-[var(--border-color)] text-[8px] text-[var(--foreground)]">
                            {rec.frequencyType === 'days' ? `Every ${rec.daysInterval} days` : rec.weekdays?.join(', ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Create Template Form */}
                <div className="pt-4 border-t border-[var(--border-color)] space-y-3">
                  <span className="text-[10px] font-bold text-[var(--foreground)] uppercase block">Create Template</span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      id="new-rec-title"
                      placeholder="Chore name (e.g. Wipe Counter)..."
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] theme-transition-bg focus:outline-none focus:border-amber-400"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        id="new-rec-assign"
                        className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-2.5 py-2 text-xs text-[var(--foreground)] theme-transition-bg cursor-pointer"
                      >
                        <option value="">Pool (Unassigned)</option>
                        {roommates.map(rm => (
                          <option key={rm.id} value={rm.id}>{rm.name.split(' ')[0]}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        id="new-rec-points"
                        placeholder="Points (e.g. 15)"
                        className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-2.5 py-2 text-xs text-[var(--foreground)] theme-transition-bg"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <span className="text-[9px] text-[var(--text-muted)]">Default: <strong>7 days</strong></span>
                      <button
                        onClick={() => {
                          const titleInput = document.getElementById('new-rec-title') as HTMLInputElement;
                          const assignSelect = document.getElementById('new-rec-assign') as HTMLSelectElement;
                          const pointsInput = document.getElementById('new-rec-points') as HTMLInputElement;
                          if (!titleInput.value.trim()) {
                            triggerFeedback('Please enter a template title', 'alert');
                            return;
                          }
                          const newRec: RecurringChore = {
                            id: `rec-${Date.now()}`,
                            title: titleInput.value,
                            assignedTo: assignSelect.value || null,
                            frequencyType: 'days',
                            daysInterval: 7,
                            points: pointsInput.value ? parseInt(pointsInput.value) : 10
                          };
                          setRecurringChores(prev => [...prev, newRec]);
                          addAuditLog('chore', `Recurring template added: "${titleInput.value}" assigned to ${assignSelect.value ? roommates.find(r => r.id === assignSelect.value)?.name : 'Unassigned'} [${newRec.points} pts]`);
                          titleInput.value = '';
                          pointsInput.value = '';
                          triggerFeedback('Recurring Chore Template added!', 'success');
                        }}
                        className={`text-[9px] px-3.5 py-1.5 rounded-xl font-bold transition-all ${theme.gold}`}
                      >
                        Add Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'supplies' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Supplies Management List */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-3xl space-y-4 theme-transition-bg">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-extrabold text-sm text-[var(--foreground)] uppercase tracking-wider flex items-center">
                    Supplies & Stock Log
                    <InfoTooltip text="Track shared inventory status. Mark items as low or out of stock to request purchase." direction="down" />
                  </h2>

                  <button
                    type="button"
                    onClick={() => {
                      setEditSuppliesMode(!editSuppliesMode);
                      triggerFeedback(editSuppliesMode ? 'Edit mode disabled' : 'Edit mode activated', 'info');
                    }}
                    className={`text-xs px-3.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${editSuppliesMode
                      ? 'bg-amber-400 text-black border-amber-500 font-bold'
                      : 'bg-[var(--input-bg)] text-[var(--text-muted)] border border-[var(--border-color)] theme-transition-bg'
                      }`}
                    title="Edit / Delete supply list"
                  >
                    <Edit3 size={12} /> {editSuppliesMode ? 'Done' : 'Edit List'}
                  </button>
                </div>

                <form onSubmit={handleAddSupply} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add stock item (e.g. toilet paper)..."
                    value={newSupplyName}
                    onChange={(e) => setNewSupplyName(e.target.value)}
                    className="flex-1 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-amber-400 theme-transition-bg"
                  />
                  <button
                    type="submit"
                    className={`text-xs px-4 rounded-xl flex items-center gap-1 transition-all ${theme.gold}`}
                  >
                    <Plus size={14} /> Add
                  </button>
                </form>

                <div className="space-y-2.5">
                  {supplies.map((supply) => {
                    const buyer = roommates.find(r => r.id === supply.assignedBuyer);

                    return (
                      <div
                        key={supply.id}
                        className="p-3.5 rounded-2xl bg-[var(--card-bg)]/40 border border-[var(--border-color)]/60 flex items-center justify-between gap-3 theme-transition-bg"
                      >
                        {editSuppliesMode ? (
                          <div className="flex items-center gap-2.5 w-full">
                            <input
                              type="text"
                              value={supply.name}
                              onChange={(e) => handleRenameSupply(supply.id, e.target.value)}
                              className="flex-1 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--foreground)] theme-transition-bg focus:outline-none focus:border-amber-400"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSupply(supply.id)}
                              className="p-2 text-rose-500 hover:text-rose-400 bg-rose-500/10 rounded-xl transition-colors shrink-0"
                              title="Remove Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="min-w-0">
                              <h3 className="text-xs font-bold text-[var(--foreground)] truncate">{supply.name}</h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <button
                                  onClick={() => handleReportLowSupply(supply.id)}
                                  className={`text-[8px] px-2 py-0.5 rounded font-mono uppercase font-bold border ${supply.status === 'stocked'
                                    ? 'bg-[var(--input-bg)] text-[var(--foreground)] border-[var(--border-color)] theme-transition-bg'
                                    : supply.status === 'low'
                                      ? 'bg-amber-950/30 text-amber-400 border-amber-500/20'
                                      : 'bg-rose-950/30 text-rose-400 border-rose-500/20 animate-pulse'
                                    }`}
                                >
                                  {supply.status}
                                </button>

                                {buyer && (
                                  <span className="text-[10px] text-[var(--text-muted)] font-bold">
                                    Buyer: {buyer.name.split(' ')[0]}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {supply.status !== 'stocked' && !supply.assignedBuyer && (
                                <button
                                  onClick={() => handleAutoAssignBuyer(supply.id)}
                                  className={`text-[9px] px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all ${theme.gold}`}
                                >
                                  Auto-Assign Buyer
                                </button>
                              )}

                              <button
                                onClick={() => handleReportLowSupply(supply.id)}
                                className="text-[var(--text-muted)] hover:text-[var(--foreground)] p-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-[10px] theme-transition-bg"
                              >
                                Cycle Level
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expense Splits & Settlement Ledger Column */}
              <div className="space-y-6">
                {/* Split calculator form */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-3xl space-y-4 theme-transition-bg">
                  <h2 className="font-extrabold text-sm text-[var(--foreground)] uppercase tracking-wider flex items-center">
                    Log Bill & Split
                    <InfoTooltip text="Log a shared receipt or bill. The system will divide the cost equally among roommates." direction="down" />
                  </h2>

                  <form onSubmit={handleAddExpense} className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] text-[var(--text-muted)] mb-1 font-bold uppercase tracking-widest">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Bought cleaning products"
                        value={newExpenseDesc}
                        onChange={(e) => setNewExpenseDesc(e.target.value)}
                        className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-amber-400 theme-transition-bg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] text-[var(--text-muted)] mb-1 font-bold uppercase tracking-widest">Amount ($)</label>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={newExpenseAmount}
                          onChange={(e) => setNewExpenseAmount(e.target.value)}
                          className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--foreground)] font-mono focus:outline-none focus:border-amber-400 theme-transition-bg"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-[var(--text-muted)] mb-1 font-bold uppercase tracking-widest">Payer</label>
                        <select
                          value={newExpensePaidBy}
                          onChange={(e) => setNewExpensePaidBy(e.target.value)}
                          className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-amber-400 cursor-pointer theme-transition-bg"
                        >
                          {roommates.map(r => (
                            <option key={r.id} value={r.id} className="bg-[var(--card-bg)] text-[var(--foreground)]">{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="bg-[var(--input-bg)]/80 p-3 rounded-xl border border-[var(--border-color)] text-[10px] text-[var(--text-muted)] leading-relaxed theme-transition-bg">
                      Costs split equally ($ {(parseFloat(newExpenseAmount || '0') / 4).toFixed(2)} per roommate). Contributions update dynamically.
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${theme.gold}`}
                    >
                      Log split bill
                    </button>
                  </form>
                </div>

                {/* Settle Repayments direct form */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-3xl space-y-4 theme-transition-bg">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-extrabold text-sm text-[var(--foreground)] uppercase tracking-wider flex items-center">
                      Settle Debts & Repayments
                      <InfoTooltip text="Record direct settlements between roommates to clear pending debts and balance the shared budget." />
                    </h2>
                  </div>

                  <form onSubmit={handleSettleBalances} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] text-[var(--text-muted)] mb-1 font-bold uppercase tracking-widest">Who Paid</label>
                        <select
                          value={settlePayer}
                          onChange={(e) => setSettlePayer(e.target.value)}
                          className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none theme-transition-bg cursor-pointer"
                        >
                          {roommates.map((rm) => (
                            <option key={rm.id} value={rm.id} className="bg-[var(--card-bg)] text-[var(--foreground)]">
                              {rm.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] text-[var(--text-muted)] mb-1 font-bold uppercase tracking-widest">Who Received</label>
                        <select
                          value={settleReceiver}
                          onChange={(e) => setSettleReceiver(e.target.value)}
                          className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none theme-transition-bg cursor-pointer"
                        >
                          {roommates.map((rm) => (
                            <option key={rm.id} value={rm.id} className="bg-[var(--card-bg)] text-[var(--foreground)]">
                              {rm.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-[8px] text-[var(--text-muted)] mb-1 font-bold uppercase tracking-widest">Amount ($)</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] font-mono">$</span>
                          <input
                            type="text"
                            placeholder="0.00"
                            value={settleAmount}
                            onChange={(e) => setSettleAmount(e.target.value)}
                            className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl pl-8 pr-4 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-amber-400 font-mono theme-transition-bg"
                          />
                        </div>
                      </div>

                      <div className="shrink-0 pt-4">
                        <button
                          type="submit"
                          className={`text-xs px-4 py-2.5 rounded-xl font-bold transition-all ${theme.gold}`}
                        >
                          Record Settlement
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Purchase History bill logs (max 50) */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-3xl space-y-4 theme-transition-bg">
                  <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center">
                    Purchase History (Max 50)
                    <InfoTooltip text="Historical log of bills, expenses, and roommate settlements capped at the last 50 entries." />
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {expenses.map((exp) => {
                      const payer = roommates.find(r => r.id === exp.paidBy);
                      return (
                        <div
                          key={exp.id}
                          className="p-3 rounded-xl bg-[var(--card-bg)]/40 border border-[var(--border-color)]/60 flex items-center justify-between text-xs theme-transition-bg"
                        >
                          <div>
                            <span className="font-bold text-[var(--foreground)]">{exp.description}</span>
                            <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
                              Paid by {payer?.name.split(' ')[0]} • {exp.date}
                            </div>
                          </div>
                          <span className="font-bold text-[var(--foreground)] font-mono">${exp.amount.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
        {/* Tab Content: Accountability Logs */}
        {activeTab === 'accountability' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Leaderboard */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-3xl space-y-4 theme-transition-bg">
                <h2 className="font-extrabold text-sm text-[var(--foreground)] uppercase tracking-wider flex items-center">
                  Score Standings
                  <InfoTooltip text="Total points accumulated by each roommate from completed chores and shared purchases." direction="down" />
                </h2>

                <div className="space-y-2.5 pt-2">
                  {[...roommates]
                    .sort((a, b) => b.score - a.score)
                    .map((rm, idx) => (
                      <div
                        key={rm.id}
                        className="p-3 rounded-2xl bg-[var(--card-bg)]/60 border border-[var(--border-color)] flex items-center justify-between theme-transition-bg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-[var(--text-muted)] w-4">
                            #{idx + 1}
                          </span>
                          {/* Initials Avatar */}
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${rm.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0`}>
                            {rm.initials}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[var(--foreground)]">{rm.name.split(' ')[0]}</h4>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {rm.choresCompleted} complete
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {idx === 0 && <Award size={14} className="text-amber-400" />}
                          <span className="text-xs font-bold font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                            {rm.score} pts
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Overdue alert and nudges */}
              <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-3xl space-y-4 theme-transition-bg">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-sm text-[var(--foreground)] uppercase tracking-wider flex items-center">
                    Accountability Panel
                    <InfoTooltip text="Enforce chore completion. Roommates can send friendly notifications for overdue duties." direction="down" />
                  </h2>
                  <div className="text-xs text-[var(--text-muted)] bg-[var(--input-bg)] border border-[var(--border-color)] px-3 py-1 rounded-xl theme-transition-bg">
                    Leader: <strong className="text-amber-400">{roommates.find(r => r.isGroupLeader)?.name.split(' ')[0] || 'None'}</strong>
                  </div>
                </div>

                <div className="space-y-3">
                  {roommates
                    .filter(r => r.id !== activeUserId)
                    .map((rm) => {
                      const rmChores = chores.filter(c => c.assignedTo === rm.id && !c.completed);
                      const isOverdue = rmChores.some(c => c.missed);

                      return (
                        <div
                          key={rm.id}
                          className={`p-4 rounded-2xl bg-[var(--card-bg)]/60 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 theme-transition-bg ${isOverdue ? 'border-rose-900/60 bg-rose-950/5' : 'border-[var(--border-color)]'
                            }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Initials Avatar */}
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${rm.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0 mt-1`}>
                              {rm.initials}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
                                <span className="truncate">{rm.name}</span>
                                {isOverdue && (
                                  <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 animate-pulse">
                                    Overdue
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                                {rmChores.length === 0 ? 'All tasks complete' : `${rmChores.length} pending`}
                              </p>
                              {rmChores.length > 0 && (
                                <div className="text-[9px] text-[var(--text-muted)] font-mono mt-1 truncate">
                                  Active: {rmChores.map(c => `"${c.title}"`).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {activeUserObj!.isGroupLeader && (
                              <button
                                onClick={() => handleToggleGroupLeader(rm.id)}
                                className="text-[10px] bg-[var(--input-bg)] hover:bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border-color)] px-2.5 py-1.5 rounded-xl transition-all theme-transition-bg"
                              >
                                Make Leader
                              </button>
                            )}

                            {rmChores.length > 0 && (
                              <button
                                onClick={() => handleNudgeRoommate(rm.id, rmChores[0].title)}
                                className={`text-[10px] px-3.5 py-1.5 rounded-xl font-bold transition-all ${isOverdue ? theme.gold : 'bg-[var(--input-bg)] text-[var(--foreground)] border border-[var(--border-color)] theme-transition-bg'
                                  }`}
                              >
                                Send Nudge
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* Systemic Audit Logs List */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-3xl space-y-4 theme-transition-bg">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-extrabold text-sm text-[var(--foreground)] uppercase tracking-wider flex items-center">
                  Systemic Audit Logs
                  <InfoTooltip text="Transparent audit trail logging all systemic changes, chore actions, and supply logs." />
                </h2>
                <span className="text-[8px] bg-amber-400/10 border border-amber-500/25 text-amber-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest shrink-0">
                  Audit Trail
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-muted)] font-medium">
                    No logs logged yet
                  </div>
                ) : (
                  auditLogs.map((log) => {
                    let badgeColor = 'bg-[var(--input-bg)] text-[var(--foreground)] border border-[var(--border-color)]';
                    if (log.actionType === 'chore') badgeColor = 'bg-amber-400/10 text-amber-400 border border-amber-500/25';
                    else if (log.actionType === 'supply') badgeColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
                    else if (log.actionType === 'expense') badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';

                    return (
                      <div key={log.id} className="p-3 rounded-2xl bg-[var(--card-bg)]/40 border border-[var(--border-color)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs theme-transition-bg">
                        <div className="flex items-center gap-3">
                          <span className={`text-[8px] px-2 py-0.5 rounded uppercase font-bold tracking-wider shrink-0 ${badgeColor}`}>
                            {log.actionType}
                          </span>
                          <span className="font-semibold text-[var(--foreground)]">{log.text}</span>
                        </div>
                        <span className="text-[9px] text-[var(--text-muted)] shrink-0 font-mono font-semibold">{log.timestamp}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Settings */}
        {activeTab === 'settings' && (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl max-w-2xl mx-auto space-y-6 animate-fadeIn theme-transition-bg">
            <h2 className="font-extrabold text-sm text-[var(--foreground)] uppercase tracking-wider flex items-center">
              System Options
              <InfoTooltip text="Configure accessibility preferences, toggle simulation features, or modify room details." direction="down" />
            </h2>

            <div className="space-y-4 divide-y divide-[var(--border-color)]">
              {/* Setting 1: Busy Week Mode */}
              <div className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                <div className="max-w-md">
                  <h3 className="text-xs font-bold text-[var(--foreground)]">Busy Week Mode (Alex's Scenario)</h3>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Mutes non-essential notifications during exams. Reallocates tasks dynamically.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setBusyWeekMode(!busyWeekMode);
                    triggerFeedback(busyWeekMode ? 'Snooze deactivated' : 'Snooze activated', 'info');
                  }}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0 ${busyWeekMode ? 'bg-amber-400' : 'bg-[var(--input-bg)] border border-[var(--border-color)]'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${busyWeekMode ? 'transform translate-x-4' : ''
                    }`} />
                </button>
              </div>

              {/* Setting 2: Colorblind options */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="max-w-md">
                  <h3 className="text-xs font-bold text-[var(--foreground)]">Colorblind Filters (Req 10)</h3>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Modifies highlight overlays and adds explicit symbols/icons to indicators to support colorblind conditions.
                  </p>
                </div>

                <div className="bg-[var(--input-bg)] border border-[var(--border-color)] px-3 py-2 rounded-xl shrink-0 theme-transition-bg">
                  <select
                    value={accessibilityMode}
                    onChange={(e) => {
                      setAccessibilityMode(e.target.value as any);
                      triggerFeedback(`Accessibility set to: ${e.target.value}`, 'info');
                    }}
                    className="bg-transparent text-xs text-[var(--foreground)] font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="none" className="bg-[var(--card-bg)] text-[var(--foreground)]">None (UCF Gold)</option>
                    <option value="deuteranopia" className="bg-[var(--card-bg)] text-[var(--foreground)]">Deuteranopia</option>
                    <option value="protanopia" className="bg-[var(--card-bg)] text-[var(--foreground)]">Protanopia</option>
                    <option value="tritanopia" className="bg-[var(--card-bg)] text-[var(--foreground)]">Tritanopia</option>
                    <option value="high-contrast" className="bg-[var(--card-bg)] text-[var(--foreground)]">High Contrast</option>
                  </select>
                </div>
              </div>

              {/* Setting 3: Audio Feedbacks */}
              <div className="pt-4 flex items-start justify-between gap-4">
                <div className="max-w-md">
                  <h3 className="text-xs font-bold text-[var(--foreground)]">Oscillating Tone Feedback</h3>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Plays responsive audio signals representing completed/warning states for multimodal accessibility.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    triggerFeedback(soundEnabled ? 'Audio tones off' : 'Audio tones on', 'info');
                  }}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0 ${soundEnabled ? 'bg-amber-400' : 'bg-[var(--input-bg)] border border-[var(--border-color)]'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${soundEnabled ? 'transform translate-x-4' : ''
                    }`} />
                </button>
              </div>

              {/* Setting 4: Theme Mode */}
              <div className="pt-4 flex items-start justify-between gap-4">
                <div className="max-w-md">
                  <h3 className="text-xs font-bold text-[var(--foreground)]">Theme Mode (Light / Dark)</h3>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Transitions background and layout colors smoothly over 700ms. Adjust "--theme-transition-speed" in app/globals.css to fine-tune.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
                    setThemeMode(nextTheme);
                    triggerFeedback(`Theme switched to ${nextTheme}`, 'info');
                  }}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0 ${themeMode === 'light' ? 'bg-amber-400' : 'bg-[var(--input-bg)] border border-[var(--border-color)]'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${themeMode === 'light' ? 'transform translate-x-4' : ''
                    }`} />
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between gap-4 flex-wrap">
              <span className="text-[9px] text-[var(--text-muted)]">
                Data caches automatically inside local browser database (localStorage).
              </span>
              <button
                onClick={handleResetData}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold border border-rose-950 px-4 py-2 rounded-xl bg-rose-950/10 transition-colors"
              >
                Clear Caches & Reset
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
