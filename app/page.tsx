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
  UserCheck
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

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null); // null represents the login screen
  const [activeTab, setActiveTab] = useState<'dashboard' | 'supplies' | 'accountability' | 'settings'>('dashboard');

  // Accessibility & Settings states
  const [accessibilityMode, setAccessibilityMode] = useState<'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'high-contrast'>('none');
  const [busyWeekMode, setBusyWeekMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  // App core data state
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Input states
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpensePaidBy, setNewExpensePaidBy] = useState('jane');
  const [newSupplyName, setNewSupplyName] = useState('');
  const [choreFilter, setChoreFilter] = useState<'all' | 'mine' | 'pool'>('all');
  const [activeChoreDetails, setActiveChoreDetails] = useState<string | null>(null);

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
    const storedAccessibility = localStorage.getItem('rk_accessibility_v2');
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

    if (storedAccessibility) setAccessibilityMode(storedAccessibility as any);
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
    localStorage.setItem('rk_accessibility_v2', accessibilityMode);
  }, [accessibilityMode, mounted]);

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

  // Reset to Baseline state
  const handleResetData = () => {
    setRoommates(defaultRoommates);
    setChores(defaultChores);
    setSupplies(defaultSupplies);
    setExpenses(defaultExpenses);
    setNotifications(defaultNotifications);
    setBusyWeekMode(false);
    setAccessibilityMode('none');
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
    setSupplies(prev => prev.map(s => {
      if (s.id === supplyId) {
        const nextStatus = s.status === 'stocked' ? 'low' : s.status === 'low' ? 'out' : 'stocked';
        return { ...s, status: nextStatus, assignedBuyer: nextStatus === 'stocked' ? null : s.assignedBuyer };
      }
      return s;
    }));
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

    const newNotif: AppNotification = {
      id: `not-${Date.now()}`,
      text: `${assignee.name} was auto-assigned to buy "${supply.name}" (Lowest expenditure: $${assignee.expensesSpent.toFixed(2)}).`,
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
      text: `Alert: Structured chore reminder sent to ${nudgee.name} for task "${choreTitle}".`,
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

    setRoommates(prev => prev.map(r => {
      if (r.id === chore.assignedTo) {
        const nextCount = r.choresCompleted + 1;
        return {
          ...r,
          choresCompleted: nextCount,
          score: Math.min(100, r.score + 5)
        };
      }
      return r;
    }));

    const assigneeName = roommates.find(r => r.id === chore.assignedTo)?.name || 'Someone';
    const newNotif: AppNotification = {
      id: `not-${Date.now()}`,
      text: `${assigneeName} submitted chore: "${chore.title}".`,
      type: 'success',
      timestamp: 'Just now',
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    triggerFeedback(`Chore "${chore.title}" submitted!`, 'success');
  };

  const handleClaimChore = (choreId: string) => {
    setChores(prev => prev.map(c => {
      if (c.id === choreId) {
        return { ...c, assignedTo: activeUserId };
      }
      return c;
    }));
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

    setExpenses(prev => [newExpense, ...prev]);

    // Recalculate roommate spending index
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
    setNewSupplyName('');
    triggerFeedback(`Added "${newSupplyName}" to stock list`, 'success');
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
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Abstract Gold Background Glow elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full bg-[#111115] border border-neutral-800/80 p-8 rounded-3xl relative z-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-wider text-white">
              ROOM<span className="text-amber-400">KNIGHTS</span>
            </h1>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              UCF Roommate Portal for Chores, Joint Purchases, and Task Accountability.
            </p>
          </div>

          <div className="space-y-4">
            <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest text-center">
              Select Profile to Log In
            </span>

            <div className="space-y-2.5">
              {defaultRoommates.map((rm) => (
                <button
                  key={rm.id}
                  onClick={() => handleLogin(rm.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-amber-400/60 hover:bg-neutral-850 hover:shadow-[0_0_15px_rgba(245,158,11,0.06)] transition-all duration-200 group text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Circle Avatar Initials instead of Emojis */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rm.avatarColor} flex items-center justify-center font-bold text-sm text-white shadow-inner`}>
                      {rm.initials}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {rm.name}
                      </h3>
                      <span className="text-[10px] text-neutral-500 block mt-0.5">
                        {rm.role}
                      </span>
                    </div>
                  </div>
                  <UserCheck size={16} className="text-neutral-600 group-hover:text-amber-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
            <span className="text-[10px] text-neutral-500">CAP 3104 Project Simulation</span>
            <button
              onClick={handleResetData}
              className="text-[10px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
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
    <div className="flex-1 flex flex-col md:flex-row">

      {/* Left Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-[#111115] border-b md:border-b-0 md:border-r border-neutral-800/80 flex flex-col shrink-0">

        {/* Header Brand - EMOJIS & CAP3104 TEXT REMOVED */}
        <div className="p-6 border-b border-neutral-800/80">
          <span className="font-black text-xl tracking-wider text-white block">
            ROOM<span className="text-amber-400">KNIGHTS</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5">
          <button
            onClick={() => { setActiveTab('dashboard'); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${activeTab === 'dashboard'
                ? `bg-neutral-800/80 text-white border-l-4 border-amber-400`
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
          >
            <CheckSquare size={16} className={activeTab === 'dashboard' ? 'text-amber-400' : ''} />
            <span>Dashboard</span>
            {userChores.length > 0 && (
              <span className="ml-auto bg-amber-400/10 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {userChores.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('supplies'); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${activeTab === 'supplies'
                ? `bg-neutral-800/80 text-white border-l-4 border-amber-400`
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
          >
            <ShoppingCart size={16} className={activeTab === 'supplies' ? 'text-amber-400' : ''} />
            <span>Supplies & Expenses</span>
            {supplies.filter(s => s.status !== 'stocked').length > 0 && (
              <span className="ml-auto bg-rose-500/10 text-rose-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {supplies.filter(s => s.status !== 'stocked').length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('accountability'); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${activeTab === 'accountability'
                ? `bg-neutral-800/80 text-white border-l-4 border-amber-400`
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
          >
            <ShieldAlert size={16} className={activeTab === 'accountability' ? 'text-amber-400' : ''} />
            <span>Accountability Hub</span>
          </button>

          <button
            onClick={() => { setActiveTab('settings'); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${activeTab === 'settings'
                ? `bg-neutral-800/80 text-white border-l-4 border-amber-400`
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
          >
            <SettingsIcon size={16} className={activeTab === 'settings' ? 'text-amber-400' : ''} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar Logged-in User Profile & Log Out block */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/20 space-y-3">
          <div className="flex items-center gap-3">
            {/* Initials Avatar */}
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activeUserObj?.avatarColor} flex items-center justify-center font-bold text-xs text-white`}>
              {activeUserObj?.initials}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-white truncate">{activeUserObj?.name}</span>
              <span className="block text-[10px] text-neutral-400 truncate">{activeUserObj?.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 rounded-xl border border-neutral-800 hover:border-rose-500/30 hover:bg-rose-950/10 text-neutral-400 hover:text-rose-400 text-xs font-medium transition-all duration-150 flex items-center justify-center gap-2"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0d0d0f]">

        {/* Sticky top sub-header panel */}
        <header className="h-16 border-b border-neutral-800/80 bg-[#111115]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <span className="text-xs text-neutral-400 uppercase tracking-widest font-semibold block">CURRENT WORKSPACE</span>
            <span className="text-sm font-bold text-white">UCF Knights Shared Suite</span>
          </div>

          {/* Right Header Navigation Accessories */}
          <div className="flex items-center gap-4">

            {/* Accessibility dropdown */}
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl">
              <Eye size={14} className="text-amber-400" />
              <select
                value={accessibilityMode}
                onChange={(e) => {
                  setAccessibilityMode(e.target.value as any);
                  triggerFeedback(`Accessibility set to: ${e.target.value}`, 'info');
                }}
                className="bg-transparent text-xs text-neutral-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="none" className="bg-neutral-900">Normal Contrast</option>
                <option value="deuteranopia" className="bg-neutral-900">Deuteranopia Adjustment</option>
                <option value="protanopia" className="bg-neutral-900">Protanopia Adjustment</option>
                <option value="tritanopia" className="bg-neutral-900">Tritanopia Adjustment</option>
                <option value="high-contrast" className="bg-neutral-900">High Contrast Override</option>
              </select>
            </div>

            {/* Notification alert log */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-900 border border-neutral-800 transition-colors"
              >
                <Bell size={16} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] flex items-center justify-center font-bold">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#16161c] border border-neutral-800/90 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Notifications Log</span>
                    <button
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        triggerFeedback('All logs read', 'info');
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                    >
                      Clear unread
                    </button>
                  </div>
                  <div className="divide-y divide-neutral-800 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-neutral-500">
                        Log is empty
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-3.5 transition-colors ${n.read ? 'opacity-65' : 'bg-neutral-900/30'}`}>
                          <p className="text-xs text-neutral-200 leading-relaxed font-semibold">{n.text}</p>
                          <span className="text-[9px] text-neutral-500 block mt-1">{n.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Tab View Container */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">

          {/* Non-intrusive Inline success/information alert box (replaces bouncing top-right toast) */}
          {inlineNotification && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all duration-300 animate-fadeIn ${inlineNotification.type === 'alert'
                ? 'bg-rose-950/20 border-rose-500/40 text-rose-100'
                : 'bg-amber-950/20 border-amber-500/40 text-amber-100'
              }`}>
              <AlertTriangle className={inlineNotification.type === 'alert' ? 'text-rose-400' : 'text-amber-400'} size={18} />
              <span className="text-xs font-semibold">{inlineNotification.text}</span>
            </div>
          )}

          {/* Tab Content: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">

              {/* Supply inventory alert warning */}
              {supplies.some(s => s.status === 'out') && (
                <div className="bg-rose-950/10 border border-rose-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-rose-400 shrink-0" size={18} />
                    <div>
                      <span className="font-bold text-xs text-white">Inventory Warning</span>
                      <p className="text-[11px] text-rose-300 mt-0.5">
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
                <div className={`p-5 rounded-2xl bg-[#111115]/60 border border-neutral-800/80 flex items-center justify-between transition-all duration-300 ${theme.hoverGlow}`}>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Chore Completion</span>
                    <span className="text-2xl font-black text-white font-mono">{householdScore}%</span>
                  </div>
                  <div className="relative w-12 h-12">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="transparent" stroke="#1f1f23" strokeWidth="4" />
                      <circle cx="24" cy="24" r="20" fill="transparent" stroke={accessibilityMode === 'high-contrast' ? '#ffffff' : '#fbbf24'} strokeWidth="4"
                        strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * householdScore) / 100} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                      {totalCompletedChores}/{chores.length}
                    </div>
                  </div>
                </div>

                {/* Stats 2: Expenditure Balance */}
                <div className={`p-5 rounded-2xl bg-[#111115]/60 border border-neutral-800/80 flex items-center justify-between transition-all duration-300 ${theme.hoverGlow}`}>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Budget Status</span>
                    <span className="text-2xl font-black text-white font-mono">
                      ${(activeUserObj!.expensesSpent - avgHouseholdSpent) >= 0 ? '+' : ''}{(activeUserObj!.expensesSpent - avgHouseholdSpent).toFixed(2)}
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(activeUserObj!.expensesSpent - avgHouseholdSpent) >= 0 ? theme.successBadge : theme.alertBadge
                    }`}>
                    <DollarSign size={18} />
                  </div>
                </div>

                {/* Stats 3: Tasks count */}
                <div className={`p-5 rounded-2xl bg-[#111115]/60 border border-neutral-800/80 flex items-center justify-between transition-all duration-300 ${theme.hoverGlow}`}>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Your Pending Chores</span>
                    <span className="text-2xl font-black text-white font-mono">{userChores.length}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
                    <CheckSquare size={18} />
                  </div>
                </div>

              </div>

              {/* Chores Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left side: Chores List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-extrabold text-sm text-white uppercase tracking-wider">
                      Tasks & Duties
                    </h2>
                    {/* Filters */}
                    <div className="bg-neutral-900 p-1 rounded-xl border border-neutral-800 flex text-[10px] font-bold">
                      <button
                        onClick={() => setChoreFilter('all')}
                        className={`px-3 py-1 rounded-lg transition-all ${choreFilter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setChoreFilter('mine')}
                        className={`px-3 py-1 rounded-lg transition-all ${choreFilter === 'mine' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
                      >
                        Assigned to Me
                      </button>
                      <button
                        onClick={() => setChoreFilter('pool')}
                        className={`px-3 py-1 rounded-lg transition-all ${choreFilter === 'pool' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
                      >
                        Unassigned
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
                            className={`rounded-2xl border transition-all duration-200 ${chore.completed
                                ? 'bg-[#111115]/30 border-neutral-900 opacity-60'
                                : chore.missed
                                  ? 'bg-rose-950/5 border-rose-900/40'
                                  : isExpanded
                                    ? 'bg-neutral-900/90 border-neutral-700'
                                    : 'bg-[#111115]/70 border-neutral-800/80 hover:border-neutral-700'
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
                                  <h3 className={`text-xs font-bold text-white truncate ${chore.completed ? 'line-through text-neutral-500' : ''}`}>
                                    {chore.title}
                                  </h3>
                                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                                    Due: {chore.dueDate}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[9px] bg-neutral-900 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-full font-mono">
                                  +{chore.points} pts
                                </span>

                                {chore.assignedTo ? (
                                  <div className="flex items-center gap-1.5 bg-[#16161c] px-2.5 py-1 rounded-full text-[10px] text-neutral-300 border border-neutral-800">
                                    {/* Initials Avatar */}
                                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${assignee?.avatarColor} flex items-center justify-center font-bold text-[8px] text-white shrink-0`}>
                                      {assignee?.initials}
                                    </div>
                                    <span className="max-w-[60px] truncate">{assignee?.name.split(' ')[0]}</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClaimChore(chore.id);
                                    }}
                                    className={`text-[9px] px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${theme.gold}`}
                                  >
                                    Claim
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Subchecklist expansion */}
                            {isExpanded && !chore.completed && (
                              <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/40 space-y-4">
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Subtask Checklist:</span>
                                  <div className="space-y-1.5">
                                    {chore.checklist.map((sub, idx) => (
                                      <div
                                        key={idx}
                                        onClick={() => handleToggleSubtask(chore.id, idx)}
                                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-900/60 cursor-pointer transition-colors"
                                      >
                                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${sub.done ? 'bg-amber-400 border-amber-400 text-black' : 'border-neutral-600'
                                          }`}>
                                          {sub.done && <Check size={8} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-xs ${sub.done ? 'line-through text-neutral-500' : 'text-neutral-300'}`}>
                                          {sub.text}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                  <span className="text-[10px] text-neutral-500">
                                    {chore.checklist.filter(s => s.done).length} of {chore.checklist.length} done
                                  </span>
                                  <button
                                    onClick={() => handleSubmitChore(chore.id)}
                                    disabled={!chore.checklist.every(s => s.done) && chore.assignedTo === activeUserId}
                                    className={`text-xs px-4 py-2 rounded-xl transition-all ${chore.checklist.every(s => s.done)
                                        ? theme.gold
                                        : 'bg-neutral-850 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                                      }`}
                                  >
                                    Submit Chore
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Right side: Roommates Contribution board */}
                <div className="space-y-4">
                  <h2 className="font-extrabold text-sm text-white uppercase tracking-wider">
                    Roommate Standings
                  </h2>
                  <div className="space-y-2.5">
                    {roommates.map((rm) => (
                      <div
                        key={rm.id}
                        className={`p-3.5 rounded-2xl bg-[#111115]/60 border border-neutral-800/80 flex items-center justify-between ${rm.id === activeUserId ? 'ring-1 ring-amber-400/50' : ''
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Initials Avatar */}
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${rm.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0`}>
                            {rm.initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className="truncate">{rm.name.split(' ')[0]}</span>
                              {rm.isGroupLeader && (
                                <span className="text-[8px] bg-amber-400/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded shrink-0">
                                  Lead
                                </span>
                              )}
                            </h3>
                            <span className="text-[10px] text-neutral-500 block mt-0.5">
                              {rm.choresCompleted} tasks complete
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] text-neutral-400 block">Score</span>
                          <span className={`text-xs font-mono font-bold ${rm.score > 70 ? 'text-amber-400' : 'text-neutral-400'
                            }`}>
                            {rm.score} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab Content: Supplies & Bills */}
          {activeTab === 'supplies' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Supplies Management List */}
                <div className="bg-[#111115]/60 border border-neutral-800/80 p-5 rounded-3xl space-y-4">
                  <h2 className="font-extrabold text-sm text-white uppercase tracking-wider">
                    Supplies & Stock Log
                  </h2>

                  <form onSubmit={handleAddSupply} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add stock item (e.g. toilet paper)..."
                      value={newSupplyName}
                      onChange={(e) => setNewSupplyName(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
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
                          className="p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-white truncate">{supply.name}</h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <button
                                onClick={() => handleReportLowSupply(supply.id)}
                                className={`text-[8px] px-2 py-0.5 rounded font-mono uppercase font-bold border ${supply.status === 'stocked'
                                    ? 'bg-neutral-800 text-neutral-300 border-neutral-700'
                                    : supply.status === 'low'
                                      ? 'bg-amber-950/30 text-amber-400 border-amber-500/20'
                                      : 'bg-rose-950/30 text-rose-400 border-rose-500/20 animate-pulse'
                                  }`}
                              >
                                {supply.status}
                              </button>

                              {buyer && (
                                <span className="text-[10px] text-neutral-400">
                                  Assigned Buyer: {buyer.name.split(' ')[0]}
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
                              onClick={() => {
                                setSupplies(prev => prev.map(s => {
                                  if (s.id === supply.id) {
                                    const nextStatus = s.status === 'stocked' ? 'low' : s.status === 'low' ? 'out' : 'stocked';
                                    return { ...s, status: nextStatus, assignedBuyer: nextStatus === 'stocked' ? null : s.assignedBuyer };
                                  }
                                  return s;
                                }));
                                triggerFeedback('Supply status updated', 'info');
                              }}
                              className="text-neutral-400 hover:text-white p-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[10px]"
                            >
                              Cycle Level
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expense Splits */}
                <div className="space-y-6">
                  {/* Split calculator form */}
                  <div className="bg-[#111115]/60 border border-neutral-800/80 p-5 rounded-3xl space-y-4">
                    <h2 className="font-extrabold text-sm text-white uppercase tracking-wider">
                      Log Bill & Split
                    </h2>

                    <form onSubmit={handleAddExpense} className="space-y-3.5">
                      <div>
                        <label className="block text-[9px] text-neutral-400 mb-1 font-bold uppercase tracking-widest">Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Bought cleaning products"
                          value={newExpenseDesc}
                          onChange={(e) => setNewExpenseDesc(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] text-neutral-400 mb-1 font-bold uppercase tracking-widest">Amount ($)</label>
                          <input
                            type="text"
                            placeholder="0.00"
                            value={newExpenseAmount}
                            onChange={(e) => setNewExpenseAmount(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-neutral-400 mb-1 font-bold uppercase tracking-widest">Payer</label>
                          <select
                            value={newExpensePaidBy}
                            onChange={(e) => setNewExpensePaidBy(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            {roommates.map(r => (
                              <option key={r.id} value={r.id} className="bg-neutral-900">{r.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 text-[10px] text-neutral-400 leading-relaxed">
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

                  {/* Bill logs */}
                  <div className="bg-[#111115]/60 border border-neutral-800/80 p-5 rounded-3xl space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Purchase History</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {expenses.map((exp) => {
                        const payer = roommates.find(r => r.id === exp.paidBy);
                        return (
                          <div
                            key={exp.id}
                            className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/60 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-neutral-200">{exp.description}</span>
                              <div className="text-[9px] text-neutral-500 mt-0.5">
                                Paid by {payer?.name.split(' ')[0]} • {exp.date}
                              </div>
                            </div>
                            <span className="font-bold text-white font-mono">${exp.amount.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab Content: Accountability Hub */}
          {activeTab === 'accountability' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Leaderboard */}
                <div className="bg-[#111115]/60 border border-neutral-800/80 p-5 rounded-3xl space-y-4">
                  <h2 className="font-extrabold text-sm text-white uppercase tracking-wider">
                    Score Standings
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Gamified points based on task completion (+5 per chore) and supply log purchases.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {[...roommates]
                      .sort((a, b) => b.score - a.score)
                      .map((rm, idx) => (
                        <div
                          key={rm.id}
                          className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-850 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-neutral-500 w-4">
                              #{idx + 1}
                            </span>
                            {/* Initials Avatar */}
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${rm.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0`}>
                              {rm.initials}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{rm.name.split(' ')[0]}</h4>
                              <span className="text-[10px] text-neutral-500">
                                {rm.choresCompleted} complete
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {idx === 0 && <Award size={14} className="text-amber-400" />}
                            <span className="text-xs font-bold font-mono text-amber-400 bg-amber-400/5 border border-amber-400/10 px-2.5 py-0.5 rounded-full">
                              {rm.score} pts
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Overdue alert and nudges */}
                <div className="lg:col-span-2 bg-[#111115]/60 border border-neutral-800/80 p-5 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-extrabold text-sm text-white uppercase tracking-wider">
                      Accountability Panel
                    </h2>
                    <div className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-xl">
                      Leader: <strong className="text-amber-400">{roommates.find(r => r.isGroupLeader)?.name.split(' ')[0] || 'None'}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400">
                    Send structured nudges for overdue tasks to avoid arguments.
                  </p>

                  <div className="space-y-3">
                    {roommates
                      .filter(r => r.id !== activeUserId)
                      .map((rm) => {
                        const rmChores = chores.filter(c => c.assignedTo === rm.id && !c.completed);
                        const isOverdue = rmChores.some(c => c.missed);

                        return (
                          <div
                            key={rm.id}
                            className={`p-4 rounded-2xl bg-neutral-900/60 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isOverdue ? 'border-rose-900/60 bg-rose-950/5' : 'border-neutral-850'
                              }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              {/* Initials Avatar */}
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${rm.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0 mt-1`}>
                                {rm.initials}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                  <span className="truncate">{rm.name}</span>
                                  {isOverdue && (
                                    <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 animate-pulse">
                                      Overdue
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[10px] text-neutral-400 mt-0.5">
                                  {rmChores.length === 0 ? 'All tasks complete' : `${rmChores.length} pending`}
                                </p>
                                {rmChores.length > 0 && (
                                  <div className="text-[9px] text-neutral-500 font-mono mt-1 truncate">
                                    Active: {rmChores.map(c => `"${c.title}"`).join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              {activeUserObj!.isGroupLeader && (
                                <button
                                  onClick={() => handleToggleGroupLeader(rm.id)}
                                  className="text-[10px] bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-neutral-750 px-2.5 py-1.5 rounded-xl transition-all"
                                >
                                  Make Leader
                                </button>
                              )}

                              {rmChores.length > 0 && (
                                <button
                                  onClick={() => handleNudgeRoommate(rm.id, rmChores[0].title)}
                                  className={`text-[10px] px-3.5 py-1.5 rounded-xl font-bold transition-all ${isOverdue ? theme.gold : 'bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-750'
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
            </div>
          )}

          {/* Tab Content: Settings */}
          {activeTab === 'settings' && (
            <div className="bg-[#111115]/60 border border-neutral-800/80 p-6 rounded-3xl max-w-2xl mx-auto space-y-6 animate-fadeIn">
              <h2 className="font-extrabold text-sm text-white uppercase tracking-wider">
                System Options
              </h2>

              <div className="space-y-4 divide-y divide-neutral-800/50">
                {/* Setting 1: Busy Week Mode */}
                <div className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                  <div className="max-w-md">
                    <h3 className="text-xs font-bold text-white">Busy Week Mode (Alex's Scenario)</h3>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Mutes non-essential notifications during exams. Reallocates tasks dynamically.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setBusyWeekMode(!busyWeekMode);
                      triggerFeedback(busyWeekMode ? 'Snooze deactivated' : 'Snooze activated', 'info');
                    }}
                    className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0 ${busyWeekMode ? 'bg-amber-400' : 'bg-neutral-800 border border-neutral-750'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${busyWeekMode ? 'transform translate-x-4' : ''
                      }`} />
                  </button>
                </div>

                {/* Setting 2: Colorblind options */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <h3 className="text-xs font-bold text-white">Colorblind Filters (Req 10)</h3>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Modifies highlight overlays and adds explicit symbols/icons to indicators to support colorblind conditions.
                    </p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl shrink-0">
                    <select
                      value={accessibilityMode}
                      onChange={(e) => {
                        setAccessibilityMode(e.target.value as any);
                        triggerFeedback(`Accessibility set to: ${e.target.value}`, 'info');
                      }}
                      className="bg-transparent text-xs text-neutral-200 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="none" className="bg-neutral-900">None (UCF Gold)</option>
                      <option value="deuteranopia" className="bg-neutral-900">Deuteranopia</option>
                      <option value="protanopia" className="bg-neutral-900">Protanopia</option>
                      <option value="tritanopia" className="bg-neutral-900">Tritanopia</option>
                      <option value="high-contrast" className="bg-neutral-900">High Contrast</option>
                    </select>
                  </div>
                </div>

                {/* Setting 3: Audio Feedbacks */}
                <div className="pt-4 flex items-start justify-between gap-4">
                  <div className="max-w-md">
                    <h3 className="text-xs font-bold text-white">Oscillating Tone Feedback</h3>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Plays responsive audio signals representing completed/warning states for multimodal accessibility.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      triggerFeedback(soundEnabled ? 'Audio tones off' : 'Audio tones on', 'info');
                    }}
                    className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0 ${soundEnabled ? 'bg-amber-400' : 'bg-neutral-800 border border-neutral-750'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${soundEnabled ? 'transform translate-x-4' : ''
                      }`} />
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-800/80 flex items-center justify-between gap-4 flex-wrap">
                <span className="text-[9px] text-neutral-500">
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

        </div>
      </main>

    </div>
  );
}
