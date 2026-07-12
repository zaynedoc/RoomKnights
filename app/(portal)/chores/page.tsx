"use client";

import React from 'react';
import { useApp, RecurringChore, Chore } from '../../../context/AppContext';
import { InfoTooltip } from '../../../components/InfoTooltip';
import { Check, Edit3, Plus, X } from 'lucide-react';

const WEEKDAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ChoresPage() {
  const {
    chores,
    setChores,
    choreFilter,
    setChoreFilter,
    activeChoreDetails,
    setActiveChoreDetails,
    roommates,
    activeUserId,
    handleClaimChore,
    handleToggleSubtask,
    handleSubmitChore,
    recurringChores,
    setRecurringChores,
    addAuditLog,
    triggerFeedback
  } = useApp();

  // ── Edit Templates ──────────────────────────────────────────────────────────
  const [editTemplatesMode, setEditTemplatesMode] = React.useState(false);
  const [templateDrafts, setTemplateDrafts] = React.useState<Record<string, {
    title: string;
    assignedTo: string;
    points: number;
    frequencyType: 'days' | 'weekdays';
    daysInterval: number;
    weekdays: string[];
  }>>({});

  // ── New Template Form ───────────────────────────────────────────────────────
  const [newRecTitle, setNewRecTitle] = React.useState('');
  const [newRecAssign, setNewRecAssign] = React.useState('');
  const [newRecPoints, setNewRecPoints] = React.useState('');
  const [newRecFreqType, setNewRecFreqType] = React.useState<'days' | 'weekdays'>('days');
  const [newRecDaysInterval, setNewRecDaysInterval] = React.useState(7);
  const [newRecWeekdays, setNewRecWeekdays] = React.useState<string[]>([]);

  // ── Standalone One-Time Chore Form ──────────────────────────────────────────
  const [showAddChore, setShowAddChore] = React.useState(false);
  const [newChoreTitle, setNewChoreTitle] = React.useState('');
  const [newChoreAssign, setNewChoreAssign] = React.useState('');
  const [newChorePoints, setNewChorePoints] = React.useState('');
  const [newChoreDueDate, setNewChoreDueDate] = React.useState('');

  const toggleWeekday = (day: string, list: string[], setList: (d: string[]) => void) => {
    setList(list.includes(day) ? list.filter(d => d !== day) : [...list, day]);
  };

  const handleAddOneTimeChore = () => {
    if (!newChoreTitle.trim()) {
      triggerFeedback('Please enter a chore title', 'alert');
      return;
    }

    // Format the due date for display
    let dueDateDisplay = 'No due date';
    if (newChoreDueDate) {
      const d = new Date(newChoreDueDate + 'T12:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000);
      if (diffDays === 0) dueDateDisplay = 'Today';
      else if (diffDays === 1) dueDateDisplay = 'Tomorrow';
      else if (diffDays < 0) dueDateDisplay = `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
      else dueDateDisplay = `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }

    const newChore: Chore = {
      id: `chore-${Date.now()}`,
      title: newChoreTitle.trim(),
      assignedTo: newChoreAssign || null,
      dueDate: dueDateDisplay,
      completed: false,
      checklist: [],
      missed: false,
      points: newChorePoints ? parseInt(newChorePoints) : 10,
      category: 'One-Time',
    };

    setChores(prev => [...prev, newChore]);
    addAuditLog('chore', `One-time chore added: "${newChore.title}" [${newChore.points} pts]`);
    triggerFeedback(`"${newChore.title}" added!`, 'success');

    // Reset form
    setNewChoreTitle('');
    setNewChoreAssign('');
    setNewChorePoints('');
    setNewChoreDueDate('');
    setShowAddChore(false);
  };

  const handleAddTemplate = () => {
    if (!newRecTitle.trim()) {
      triggerFeedback('Please enter a template title', 'alert');
      return;
    }
    if (newRecFreqType === 'weekdays' && newRecWeekdays.length === 0) {
      triggerFeedback('Select at least one weekday', 'alert');
      return;
    }

    const newRec: RecurringChore = {
      id: `rec-${Date.now()}`,
      title: newRecTitle.trim(),
      assignedTo: newRecAssign || null,
      frequencyType: newRecFreqType,
      daysInterval: newRecFreqType === 'days' ? newRecDaysInterval : undefined,
      weekdays: newRecFreqType === 'weekdays' ? newRecWeekdays : undefined,
      points: newRecPoints ? parseInt(newRecPoints) : 10,
    };

    setRecurringChores(prev => [...prev, newRec]);

    // Spawn a first active chore instance immediately
    const scheduleLabel = newRec.frequencyType === 'days'
      ? (newRec.daysInterval === 1 ? 'Today' : 'Today')
      : 'Today';
    const firstChore: Chore = {
      id: `chore-${Date.now()}`,
      title: newRec.title,
      assignedTo: newRec.assignedTo,
      dueDate: scheduleLabel,
      completed: false,
      checklist: [],
      missed: false,
      points: newRec.points,
      category: 'Recurring',
    };
    setChores(prev => [...prev, firstChore]);

    addAuditLog('chore', `Recurring template added: "${newRec.title}" [${newRec.points} pts]`);
    triggerFeedback(`"${newRec.title}" template created!`, 'success');

    // Reset
    setNewRecTitle('');
    setNewRecAssign('');
    setNewRecPoints('');
    setNewRecFreqType('days');
    setNewRecDaysInterval(7);
    setNewRecWeekdays([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
      {/* ── Left Column: Active Chores ────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-extrabold text-sm text-[var(--foreground)] uppercase tracking-wider flex items-center shrink-0">
            Active Chores &amp; Duties
            <InfoTooltip text="List of current household chores. Expand to check off tasks, claim pool duties, or track points." direction="down" />
          </h2>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Add one-time chore button */}
            <button
              onClick={() => setShowAddChore(v => !v)}
              className={`text-[10px] px-2.5 py-1.5 rounded-xl border font-bold flex items-center gap-1 transition-all whitespace-nowrap ${showAddChore ? 'btn-primary-gold' : 'bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
              title="Add a one-time chore"
            >
              <Plus size={11} />
              <span className="hidden xs:inline">One-Time</span>
            </button>

            {/* Filters */}
            <div className="bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border-color)] flex text-[10px] font-bold theme-transition-bg shrink-0">
              <button
                onClick={() => setChoreFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${choreFilter === 'all' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--text-muted)]'}`}
              >
                All
              </button>
              <button
                onClick={() => setChoreFilter('mine')}
                className={`px-2.5 py-1 rounded-lg transition-all ${choreFilter === 'mine' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--text-muted)]'}`}
              >
                My Tasks
              </button>
              <button
                onClick={() => setChoreFilter('pool')}
                className={`px-2.5 py-1 rounded-lg transition-all ${choreFilter === 'pool' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--text-muted)]'}`}
              >
                Pool
              </button>
            </div>
          </div>
        </div>

        {/* ── Inline One-Time Chore Form ──────────────────────────────────── */}
        {showAddChore && (
          <div className="bg-[var(--card-bg)] border border-amber-400/30 rounded-2xl p-4 space-y-3 animate-fadeIn theme-transition-bg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-wider">New One-Time Chore</span>
              <button onClick={() => setShowAddChore(false)} className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
                <X size={14} />
              </button>
            </div>

            <input
              type="text"
              value={newChoreTitle}
              onChange={e => setNewChoreTitle(e.target.value)}
              placeholder="Chore title (e.g. Fix leaking faucet)..."
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--gold-text)] transition-colors theme-transition-bg"
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={newChoreAssign}
                onChange={e => setNewChoreAssign(e.target.value)}
                className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-2.5 py-2 text-xs text-[var(--foreground)] cursor-pointer theme-transition-bg"
              >
                <option value="">Pool (Unassigned)</option>
                {roommates.map(rm => (
                  <option key={rm.id} value={rm.id}>{rm.name.split(' ')[0]}</option>
                ))}
              </select>
              <input
                type="number"
                value={newChorePoints}
                onChange={e => setNewChorePoints(e.target.value)}
                placeholder="Points (e.g. 15)"
                className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-2.5 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--gold-text)] transition-colors theme-transition-bg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                Due Date <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={newChoreDueDate}
                onChange={e => setNewChoreDueDate(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--gold-text)] transition-colors theme-transition-bg"
              />
            </div>

            <button
              onClick={handleAddOneTimeChore}
              className="w-full text-xs py-2 rounded-xl font-bold transition-all btn-primary-gold"
            >
              Add Chore
            </button>
          </div>
        )}

        {/* ── Chore List ──────────────────────────────────────────────────── */}
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
              const isOneTime = chore.category === 'One-Time';

              return (
                <div
                  key={chore.id}
                  className={`rounded-2xl border transition-all duration-200 theme-transition-bg ${chore.completed
                    ? 'bg-[var(--card-bg)]/30 border-[var(--border-color)]/40 opacity-60'
                    : chore.missed
                      ? 'bg-rose-950/5 border-rose-900/40'
                      : isExpanded
                        ? 'bg-[var(--input-bg)] border-[var(--border-color)] shadow-md'
                        : 'bg-[var(--card-bg)] border-[var(--border-color)] chore-card-hover'
                    }`}
                >
                  <div
                    onClick={() => !chore.completed && setActiveChoreDetails(isExpanded ? null : chore.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${chore.completed
                        ? 'text-black'
                        : chore.missed
                          ? 'border-rose-500'
                          : 'border-neutral-600'
                        }`}
                        style={chore.completed ? { backgroundColor: 'var(--gold-bg)', borderColor: 'var(--gold-bg)' } : undefined}
                      >
                        {chore.completed && <Check size={10} strokeWidth={4} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`text-xs font-bold text-[var(--foreground)] truncate ${chore.completed ? 'line-through text-[var(--text-muted)]' : ''}`}>
                          {chore.title}{isOneTime && <span className="ml-1.5 text-[8px] font-bold align-middle opacity-60">(One-Time)</span>}
                        </h3>
                        <span className={`text-[9px] block mt-0.5 font-semibold truncate ${chore.completed ? 'text-[var(--text-muted)]' : chore.missed ? 'text-rose-400' : 'text-[var(--text-muted)]'}`}>
                          Due: {chore.dueDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="pts-badge theme-transition-bg">
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
                          className="text-[9px] px-2.5 py-1 rounded-lg border font-bold transition-all btn-primary-gold"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && !chore.completed && (
                    <div className="px-4 pb-4 border-t border-[var(--border-color)]/60 pt-3 space-y-3">
                      {chore.checklist.length > 0 ? (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Subtask Checklist:</span>
                          <div className="space-y-1.5">
                            {chore.checklist.map((sub, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleToggleSubtask(chore.id, idx)}
                                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--input-bg)]/80 cursor-pointer transition-colors"
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${sub.done ? 'text-black' : 'border-neutral-600'}`}
                                  style={sub.done ? { backgroundColor: 'var(--gold-bg)', borderColor: 'var(--gold-bg)' } : undefined}
                                >
                                  {sub.done && <Check size={8} strokeWidth={4} />}
                                </div>
                                <span className={`text-xs ${sub.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--foreground)]'}`}>
                                  {sub.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-[var(--text-muted)] italic">No subtasks — mark complete when done.</p>
                      )}

                      <div className="flex items-center justify-end gap-3 pt-2">
                        {chore.checklist.length > 0 && (
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {chore.checklist.filter(s => s.done).length} of {chore.checklist.length} done
                          </span>
                        )}
                        <button
                          onClick={() => handleSubmitChore(chore.id)}
                          disabled={chore.checklist.length > 0 && !chore.checklist.every(s => s.done)}
                          className={`text-xs px-4 py-2 rounded-xl transition-all ${(chore.checklist.length === 0 || chore.checklist.every(s => s.done))
                            ? 'btn-primary-gold'
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

      {/* ── Right Column: Recurring Templates ────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-extrabold text-sm text-[var(--foreground)] uppercase tracking-wider flex items-center">
            Recurring Chores
            <InfoTooltip text="Templates that automatically schedule recurring household chores on custom intervals or weekdays." direction="down" />
          </h2>
          <button
            type="button"
            onClick={() => {
              if (!editTemplatesMode) {
                const seeds: typeof templateDrafts = {};
                recurringChores.forEach(rec => {
                  seeds[rec.id] = {
                    title: rec.title,
                    assignedTo: rec.assignedTo || '',
                    points: rec.points,
                    frequencyType: rec.frequencyType,
                    daysInterval: rec.daysInterval ?? 7,
                    weekdays: rec.weekdays ?? [],
                  };
                });
                setTemplateDrafts(seeds);
              } else {
                setTemplateDrafts({});
              }
              setEditTemplatesMode(!editTemplatesMode);
            }}
            className={`text-xs px-3.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${editTemplatesMode
              ? 'text-black font-bold'
              : 'btn-primary-gold'
              }`}
            style={editTemplatesMode ? { backgroundColor: 'var(--gold-bg)', borderColor: 'var(--gold-hover)' } : undefined}
          >
            <Edit3 size={12} />
            {editTemplatesMode ? 'Done' : 'Edit Templates'}
          </button>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-3xl space-y-4 theme-transition-bg">
          <div className="space-y-3.5">
            {recurringChores.map((rec) => {
              const assignee = roommates.find(r => r.id === rec.assignedTo);

              if (editTemplatesMode) {
                const draft = templateDrafts[rec.id] || {
                  title: rec.title,
                  assignedTo: rec.assignedTo || '',
                  points: rec.points,
                  frequencyType: rec.frequencyType,
                  daysInterval: rec.daysInterval ?? 7,
                  weekdays: rec.weekdays ?? [],
                };
                const setDraft = (patch: Partial<typeof draft>) =>
                  setTemplateDrafts(prev => ({ ...prev, [rec.id]: { ...draft, ...patch } }));

                return (
                  <div key={rec.id} className="p-3.5 bg-[var(--input-bg)] border border-amber-400/40 rounded-2xl flex flex-col gap-2.5 theme-transition-bg">
                    <input
                      type="text"
                      value={draft.title}
                      onChange={e => setDraft({ title: e.target.value })}
                      placeholder="Chore title..."
                      className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--gold-text)]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={draft.assignedTo}
                        onChange={e => setDraft({ assignedTo: e.target.value })}
                        className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-xs text-[var(--foreground)] cursor-pointer"
                      >
                        <option value="">Pool (Unassigned)</option>
                        {roommates.map(rm => (
                          <option key={rm.id} value={rm.id}>{rm.name.split(' ')[0]}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={draft.points}
                        onChange={e => setDraft({ points: parseInt(e.target.value) || 0 })}
                        placeholder="Points..."
                        className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--gold-text)]"
                      />
                    </div>

                    {/* Frequency picker */}
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDraft({ frequencyType: 'days' })}
                          className={`flex-1 text-[9px] py-1 rounded-lg font-bold border transition-all ${draft.frequencyType === 'days' ? 'btn-primary-gold' : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-muted)]'}`}
                        >
                          Every N Days
                        </button>
                        <button
                          onClick={() => setDraft({ frequencyType: 'weekdays' })}
                          className={`flex-1 text-[9px] py-1 rounded-lg font-bold border transition-all ${draft.frequencyType === 'weekdays' ? 'btn-primary-gold' : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-muted)]'}`}
                        >
                          Specific Days
                        </button>
                      </div>

                      {draft.frequencyType === 'days' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-[var(--text-muted)] font-semibold">Every</span>
                          <input
                            type="number"
                            min={1}
                            value={draft.daysInterval}
                            onChange={e => setDraft({ daysInterval: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-14 bg-[var(--card-bg)] border border-[var(--border-color)] rounded px-1.5 py-0.5 text-[9px] text-center text-[var(--foreground)] font-bold focus:outline-none focus:border-[var(--gold-text)]"
                          />
                          <span className="text-[9px] text-[var(--text-muted)] font-semibold">days</span>
                        </div>
                      ) : (
                        <div className="flex gap-1 flex-wrap">
                          {WEEKDAY_OPTIONS.map(day => (
                            <button
                              key={day}
                              onClick={() => setDraft({ weekdays: draft.weekdays.includes(day) ? draft.weekdays.filter(d => d !== day) : [...draft.weekdays, day] })}
                              className={`text-[8px] px-2 py-0.5 rounded font-bold border transition-all ${draft.weekdays.includes(day) ? 'btn-primary-gold' : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-muted)]'}`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => {
                          setRecurringChores(prev => prev.filter(t => t.id !== rec.id));
                          triggerFeedback(`"${rec.title}" template removed`, 'info');
                        }}
                        className="text-[9px] text-rose-400 hover:text-rose-300 font-semibold transition-colors"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => {
                          if (!draft.title.trim()) {
                            triggerFeedback('Chore name cannot be empty', 'alert');
                            return;
                          }
                          if (draft.frequencyType === 'weekdays' && draft.weekdays.length === 0) {
                            triggerFeedback('Select at least one weekday', 'alert');
                            return;
                          }
                          setRecurringChores(prev => prev.map(t =>
                            t.id === rec.id
                              ? {
                                  ...t,
                                  title: draft.title,
                                  assignedTo: draft.assignedTo || null,
                                  points: draft.points,
                                  frequencyType: draft.frequencyType,
                                  daysInterval: draft.frequencyType === 'days' ? draft.daysInterval : undefined,
                                  weekdays: draft.frequencyType === 'weekdays' ? draft.weekdays : undefined,
                                }
                              : t
                          ));
                          setChores(prev => prev.map(c =>
                            (!c.completed && c.title === rec.title)
                              ? { ...c, title: draft.title, assignedTo: draft.assignedTo || null, points: draft.points }
                              : c
                          ));
                          addAuditLog('chore', `Recurring template "${rec.title}" updated to "${draft.title}" [${draft.points} pts]`);
                          triggerFeedback(`"${draft.title}" updated!`, 'success');
                        }}
                        className="text-[9px] px-3.5 py-1 rounded font-bold btn-primary-gold"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={rec.id} className="p-3.5 bg-[var(--input-bg)]/60 border border-[var(--border-color)]/60 rounded-2xl flex flex-col gap-2 theme-transition-bg">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-xs font-bold text-[var(--foreground)] truncate min-w-0">{rec.title}</span>
                    <span className="pts-badge shrink-0">
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
                      {rec.frequencyType === 'days'
                        ? (rec.daysInterval === 1 ? 'Daily' : rec.daysInterval === 7 ? 'Weekly' : rec.daysInterval === 14 ? 'Bi-weekly' : `Every ${rec.daysInterval} days`)
                        : rec.weekdays?.join(', ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Create Template Form ──────────────────────────────────────── */}
          <div className="pt-4 border-t border-[var(--border-color)] space-y-3">
            <span className="text-[10px] font-bold text-[var(--foreground)] uppercase block">Create Template</span>
            <div className="space-y-2">
              <input
                type="text"
                value={newRecTitle}
                onChange={e => setNewRecTitle(e.target.value)}
                placeholder="Chore name (e.g. Wipe Counter)..."
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] theme-transition-bg focus:outline-none focus:border-[var(--gold-text)]"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newRecAssign}
                  onChange={e => setNewRecAssign(e.target.value)}
                  className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-2.5 py-2 text-xs text-[var(--foreground)] theme-transition-bg cursor-pointer"
                >
                  <option value="">Pool (Unassigned)</option>
                  {roommates.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.name.split(' ')[0]}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newRecPoints}
                  onChange={e => setNewRecPoints(e.target.value)}
                  placeholder="Points (e.g. 15)"
                  className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-2.5 py-2 text-xs text-[var(--foreground)] theme-transition-bg focus:outline-none focus:border-[var(--gold-text)]"
                />
              </div>

              {/* Frequency picker */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewRecFreqType('days')}
                    className={`flex-1 text-[9px] py-1.5 rounded-lg font-bold border transition-all ${newRecFreqType === 'days' ? 'btn-primary-gold' : 'bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-muted)]'}`}
                  >
                    Every N Days
                  </button>
                  <button
                    onClick={() => setNewRecFreqType('weekdays')}
                    className={`flex-1 text-[9px] py-1.5 rounded-lg font-bold border transition-all ${newRecFreqType === 'weekdays' ? 'btn-primary-gold' : 'bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-muted)]'}`}
                  >
                    Specific Days
                  </button>
                </div>

                {newRecFreqType === 'days' ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-[var(--text-muted)] font-semibold">Every</span>
                    <input
                      type="number"
                      min={1}
                      value={newRecDaysInterval}
                      onChange={e => setNewRecDaysInterval(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-1.5 py-1 text-[9px] text-center text-[var(--foreground)] font-bold focus:outline-none focus:border-[var(--gold-text)] transition-colors"
                    />
                    <span className="text-[9px] text-[var(--text-muted)] font-semibold">days</span>
                  </div>
                ) : (
                  <div className="flex gap-1 flex-wrap">
                    {WEEKDAY_OPTIONS.map(day => (
                      <button
                        key={day}
                        onClick={() => toggleWeekday(day, newRecWeekdays, setNewRecWeekdays)}
                        className={`text-[8px] px-2.5 py-1 rounded font-bold border transition-all ${newRecWeekdays.includes(day) ? 'btn-primary-gold' : 'bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-muted)]'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleAddTemplate}
                className="w-full text-[9px] py-1.5 rounded-xl font-bold transition-all btn-primary-gold"
              >
                Add Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
