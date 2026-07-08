"use client";

import React from 'react';
import { useApp, RecurringChore } from '../../../context/AppContext';
import { InfoTooltip } from '../../../components/InfoTooltip';
import { Check, Edit3 } from 'lucide-react';

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

  const [editTemplatesMode, setEditTemplatesMode] = React.useState(false);
  // Map of rec.id -> {title, assignedTo, points, daysInterval} for all cards
  const [templateDrafts, setTemplateDrafts] = React.useState<Record<string, { title: string; assignedTo: string; points: number; daysInterval: number }>>({});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
      {/* Left Column: Tasks & Duties List */}
      <div className="space-y-4">
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
                          className="text-[9px] px-2.5 py-1 rounded-lg border font-bold transition-all btn-primary-gold"
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

      {/* Right Column: Recurring Chore Templates */}
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
                // Entering edit mode — seed drafts from current template values
                const seeds: Record<string, { title: string; assignedTo: string; points: number; daysInterval: number }> = {};
                recurringChores.forEach(rec => {
                  seeds[rec.id] = {
                    title: rec.title,
                    assignedTo: rec.assignedTo || '',
                    points: rec.points,
                    daysInterval: rec.daysInterval || 7
                  };
                });
                setTemplateDrafts(seeds);
              } else {
                setTemplateDrafts({});
              }
              setEditTemplatesMode(!editTemplatesMode);
            }}
            className={`text-xs px-3.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${editTemplatesMode
              ? 'bg-amber-400 text-black border-amber-500 font-bold'
              : 'btn-primary-gold'
              }`}
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
                const draft = templateDrafts[rec.id] || { title: rec.title, assignedTo: rec.assignedTo || '', points: rec.points, daysInterval: rec.daysInterval || 7 };
                const setDraft = (patch: Partial<typeof draft>) =>
                  setTemplateDrafts(prev => ({ ...prev, [rec.id]: { ...draft, ...patch } }));

                return (
                  <div key={rec.id} className="p-3.5 bg-[var(--input-bg)] border border-amber-400/40 rounded-2xl flex flex-col gap-2 theme-transition-bg">
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) => setDraft({ title: e.target.value })}
                        placeholder="Chore title..."
                        className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-amber-400"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={draft.assignedTo}
                          onChange={(e) => setDraft({ assignedTo: e.target.value })}
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
                          onChange={(e) => setDraft({ points: parseInt(e.target.value) || 0 })}
                          placeholder="Points..."
                          className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-xs text-[var(--foreground)]"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-[var(--text-muted)] font-semibold">Every:</span>
                          <input
                            type="number"
                            value={draft.daysInterval}
                            onChange={(e) => setDraft({ daysInterval: parseInt(e.target.value) || 7 })}
                            className="w-12 bg-[var(--card-bg)] border border-[var(--border-color)] rounded px-1 py-0.5 text-[9px] text-center text-[var(--foreground)] font-bold"
                          />
                          <span className="text-[9px] text-[var(--text-muted)] font-semibold">days</span>
                        </div>
                        <button
                          onClick={() => {
                            if (!draft.title.trim()) {
                              triggerFeedback('Chore name cannot be empty', 'alert');
                              return;
                            }
                            // Update template
                            setRecurringChores(prev => prev.map(t =>
                              t.id === rec.id
                                ? { ...t, title: draft.title, assignedTo: draft.assignedTo || null, points: draft.points, daysInterval: draft.daysInterval }
                                : t
                            ));
                            // Propagate to matching active chores
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
                  </div>
                );
              }

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
                  }}
                  className="text-[9px] px-3.5 py-1.5 rounded-xl font-bold transition-all btn-primary-gold"
                >
                  Add Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
