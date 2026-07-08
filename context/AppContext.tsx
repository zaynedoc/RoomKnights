"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Roommate {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  role: string;
  choresCompleted: number;
  expensesSpent: number;
  isGroupLeader: boolean;
  score: number;
}

export interface ChoreChecklistItem {
  text: string;
  done: boolean;
}

export interface Chore {
  id: string;
  title: string;
  assignedTo: string | null;
  dueDate: string;
  completed: boolean;
  checklist: ChoreChecklistItem[];
  missed: boolean;
  points: number;
  category: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  status: 'stocked' | 'low' | 'out';
  assignedBuyer: string | null;
  lastBoughtBy: string | null;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
}

export interface AppNotification {
  id: string;
  text: string;
  type: 'info' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
}

export interface AuditLogEntry {
  id: string;
  actionType: 'chore' | 'supply' | 'expense';
  text: string;
  timestamp: string;
}

export interface RecurringChore {
  id: string;
  title: string;
  assignedTo: string | null;
  frequencyType: 'days' | 'weekdays';
  daysInterval?: number;
  weekdays?: string[];
  points: number;
}

interface AppContextType {
  mounted: boolean;
  activeUserId: string | null;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  accessibilityMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'high-contrast';
  setAccessibilityMode: (mode: any) => void;
  themeMode: 'dark' | 'light';
  setThemeMode: (mode: any) => void;
  busyWeekMode: boolean;
  setBusyWeekMode: (busy: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (sound: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;

  roommates: Roommate[];
  setRoommates: React.Dispatch<React.SetStateAction<Roommate[]>>;
  chores: Chore[];
  setChores: React.Dispatch<React.SetStateAction<Chore[]>>;
  supplies: SupplyItem[];
  setSupplies: React.Dispatch<React.SetStateAction<SupplyItem[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  auditLogs: AuditLogEntry[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogEntry[]>>;
  recurringChores: RecurringChore[];
  setRecurringChores: React.Dispatch<React.SetStateAction<RecurringChore[]>>;

  // Form input states
  newExpenseDesc: string;
  setNewExpenseDesc: (val: string) => void;
  newExpenseAmount: string;
  setNewExpenseAmount: (val: string) => void;
  newExpensePaidBy: string;
  setNewExpensePaidBy: (val: string) => void;
  newSupplyName: string;
  setNewSupplyName: (val: string) => void;
  choreFilter: 'all' | 'mine' | 'pool';
  setChoreFilter: (val: 'all' | 'mine' | 'pool') => void;
  activeChoreDetails: string | null;
  setActiveChoreDetails: (val: string | null) => void;
  editSuppliesMode: boolean;
  setEditSuppliesMode: (val: boolean) => void;
  settlePayer: string;
  setSettlePayer: (val: string) => void;
  settleReceiver: string;
  setSettleReceiver: (val: string) => void;
  settleAmount: string;
  setSettleAmount: (val: string) => void;
  inlineNotification: { text: string; type: 'success' | 'info' | 'alert' } | null;
  setInlineNotification: (val: any) => void;

  // Actions
  triggerFeedback: (text: string, type?: 'success' | 'info' | 'alert') => void;
  addAuditLog: (actionType: 'chore' | 'supply' | 'expense', text: string) => void;
  handleResetData: () => void;
  handleLogin: (userId: string) => void;
  handleLogout: () => void;
  handleReportLowSupply: (supplyId: string) => void;
  handleAutoAssignBuyer: (supplyId: string) => void;
  handleNudgeRoommate: (nudgeeId: string, choreTitle: string) => void;
  handleToggleSubtask: (choreId: string, subtaskIndex: number) => void;
  handleSubmitChore: (choreId: string) => void;
  handleClaimChore: (choreId: string) => void;
  handleAddExpense: (e: React.FormEvent) => void;
  handleAddSupply: (e: React.FormEvent) => void;
  handleSettleBalances: (e: React.FormEvent) => void;
  handleRenameSupply: (supplyId: string, newName: string) => void;
  handleRemoveSupply: (supplyId: string) => void;
  handleToggleGroupLeader: (roommateId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chores' | 'supplies' | 'accountability' | 'settings'>('dashboard');

  const [accessibilityMode, setAccessibilityMode] = useState<'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'high-contrast'>('none');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [busyWeekMode, setBusyWeekMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [recurringChores, setRecurringChores] = useState<RecurringChore[]>([]);

  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpensePaidBy, setNewExpensePaidBy] = useState('jane');
  const [newSupplyName, setNewSupplyName] = useState('');
  const [choreFilter, setChoreFilter] = useState<'all' | 'mine' | 'pool'>('all');
  const [activeChoreDetails, setActiveChoreDetails] = useState<string | null>(null);

  const [editSuppliesMode, setEditSuppliesMode] = useState<boolean>(false);
  const [settlePayer, setSettlePayer] = useState<string>('jane');
  const [settleReceiver, setSettleReceiver] = useState<string>('john');
  const [settleAmount, setSettleAmount] = useState<string>('');
  const [inlineNotification, setInlineNotification] = useState<{ text: string; type: 'success' | 'info' | 'alert' } | null>(null);

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
        // Block audio context failure bypass
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

  const addAuditLog = (actionType: 'chore' | 'supply' | 'expense', text: string) => {
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      actionType,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

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

  const handleLogin = (userId: string) => {
    setActiveUserId(userId);
    const userObj = roommates.find(r => r.id === userId);
    triggerFeedback(`Welcome, ${userObj?.name}!`, 'success');
  };

  const handleLogout = () => {
    setActiveUserId(null);
    triggerFeedback('Logged out successfully', 'info');
  };

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
  };

  const handleAutoAssignBuyer = (supplyId: string) => {
    const supply = supplies.find(s => s.id === supplyId);
    if (!supply) return;

    const sorted = [...roommates].sort((a, b) => a.expensesSpent - b.expensesSpent);
    const assignee = sorted[0];

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
  };

  const handleToggleGroupLeader = (roommateId: string) => {
    setRoommates(prev => prev.map(r => ({
      ...r,
      isGroupLeader: r.id === roommateId
    })));
    const target = roommates.find(r => r.id === roommateId);
  };

  return (
    <AppContext.Provider
      value={{
        mounted,
        activeUserId,
        activeTab,
        setActiveTab,
        accessibilityMode,
        setAccessibilityMode,
        themeMode,
        setThemeMode,
        busyWeekMode,
        setBusyWeekMode,
        soundEnabled,
        setSoundEnabled,
        notificationsOpen,
        setNotificationsOpen,

        roommates,
        setRoommates,
        chores,
        setChores,
        supplies,
        setSupplies,
        expenses,
        setExpenses,
        notifications,
        setNotifications,
        auditLogs,
        setAuditLogs,
        recurringChores,
        setRecurringChores,

        newExpenseDesc,
        setNewExpenseDesc,
        newExpenseAmount,
        setNewExpenseAmount,
        newExpensePaidBy,
        setNewExpensePaidBy,
        newSupplyName,
        setNewSupplyName,
        choreFilter,
        setChoreFilter,
        activeChoreDetails,
        setActiveChoreDetails,
        editSuppliesMode,
        setEditSuppliesMode,
        settlePayer,
        setSettlePayer,
        settleReceiver,
        setSettleReceiver,
        settleAmount,
        setSettleAmount,
        inlineNotification,
        setInlineNotification,

        triggerFeedback,
        addAuditLog,
        handleResetData,
        handleLogin,
        handleLogout,
        handleReportLowSupply,
        handleAutoAssignBuyer,
        handleNudgeRoommate,
        handleToggleSubtask,
        handleSubmitChore,
        handleClaimChore,
        handleAddExpense,
        handleAddSupply,
        handleSettleBalances,
        handleRenameSupply,
        handleRemoveSupply,
        handleToggleGroupLeader
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppContextProvider');
  }
  return context;
};
