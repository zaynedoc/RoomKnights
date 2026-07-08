"use client";

import React from 'react';
import { useApp } from '../../../context/AppContext';
import { InfoTooltip } from '../../../components/InfoTooltip';
import { Edit3, Plus, Trash2, DollarSign } from 'lucide-react';

export default function SuppliesPage() {
  const {
    supplies,
    setSupplies,
    editSuppliesMode,
    setEditSuppliesMode,
    newSupplyName,
    setNewSupplyName,
    roommates,
    activeUserId,
    newExpenseDesc,
    setNewExpenseDesc,
    newExpenseAmount,
    setNewExpenseAmount,
    newExpensePaidBy,
    setNewExpensePaidBy,
    settlePayer,
    setSettlePayer,
    settleReceiver,
    setSettleReceiver,
    settleAmount,
    setSettleAmount,
    expenses,
    handleAddSupply,
    handleRenameSupply,
    handleRemoveSupply,
    handleReportLowSupply,
    handleAutoAssignBuyer,
    handleAddExpense,
    handleSettleBalances,
    triggerFeedback,
    addAuditLog
  } = useApp();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Supplies Management List */}
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">
              Supplies & Stock Log
              <InfoTooltip text="Track shared inventory status. Mark items as low or out of stock to request purchase." direction="down" />
            </h2>

            <button
              type="button"
              onClick={() => {
                setEditSuppliesMode(!editSuppliesMode);
              }}
              className={`text-xs px-3.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${editSuppliesMode
                ? 'text-black font-bold'
                : 'btn-primary-gold'
                }`}
              style={editSuppliesMode ? { backgroundColor: 'var(--gold-bg)', borderColor: 'var(--gold-hover)' } : undefined}
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
              className="flex-1 input-text"
            />
            <button
              type="submit"
              className="text-xs px-4 rounded-xl flex items-center gap-1 transition-all btn-primary-gold"
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
                    <div className="flex items-center gap-2.5 w-full flex-wrap sm:flex-nowrap">
                      <input
                        type="text"
                        value={supply.name}
                        onChange={(e) => handleRenameSupply(supply.id, e.target.value)}
                        className="flex-1 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--foreground)] theme-transition-bg focus:outline-none focus:border-[var(--gold-text)] min-w-[120px]"
                      />

                      <div className="flex items-center gap-1.5 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-2 py-1 text-xs shrink-0 theme-transition-bg">
                        <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Buyer:</span>
                        <select
                          value={supply.assignedBuyer || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSupplies(prev => prev.map(s => {
                              if (s.id === supply.id) {
                                return { ...s, assignedBuyer: val || null };
                              }
                              return s;
                            }));
                            const buyerName = val ? roommates.find(r => r.id === val)?.name : 'Unassigned';
                            addAuditLog('supply', `Supply assignee updated: "${supply.name}" buyer assigned to ${buyerName}`);
                            triggerFeedback('Supply buyer updated', 'info');
                          }}
                          className="bg-transparent text-[11px] font-bold text-[var(--foreground)] focus:outline-none cursor-pointer"
                        >
                          <option value="" className="bg-[var(--card-bg)] text-[var(--foreground)]">Unassigned</option>
                          {roommates.map(rm => (
                            <option key={rm.id} value={rm.id} className="bg-[var(--card-bg)] text-[var(--foreground)]">{rm.name.split(' ')[0]}</option>
                          ))}
                        </select>
                      </div>

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
                                ? 'bg-amber-950/30 accent-text border-amber-500/20'
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
                            className="text-[9px] px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all btn-primary-gold"
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
          <div className="section-card">
            <h2 className="section-card-title">
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
                  className="w-full input-text"
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
                    className="w-full input-text font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-[var(--text-muted)] mb-1 font-bold uppercase tracking-widest">Payer</label>
                  <select
                    value={newExpensePaidBy}
                    onChange={(e) => setNewExpensePaidBy(e.target.value)}
                    className="w-full select-custom"
                  >
                    {roommates.map(r => (
                      <option key={r.id} value={r.id} className="bg-[var(--card-bg)] text-[var(--foreground)]">{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold btn-primary-gold"
              >
                Log split bill
              </button>
            </form>
          </div>

          {/* Settle Repayments direct form */}
          <div className="section-card">
            <h2 className="section-card-title">
              Settle Debts & Repayments
              <InfoTooltip text="Record direct settlements between roommates to clear pending debts and balance the shared budget." />
            </h2>

            <form onSubmit={handleSettleBalances} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] text-[var(--text-muted)] mb-1 font-bold uppercase tracking-widest">Who Paid</label>
                  <select
                    value={settlePayer}
                    onChange={(e) => setSettlePayer(e.target.value)}
                    className="w-full select-custom"
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
                    className="w-full select-custom"
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
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl pl-8 pr-4 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--gold-text)] font-mono theme-transition-bg"
                    />
                  </div>
                </div>

                <div className="shrink-0 pt-4">
                  <button
                    type="submit"
                    className="text-xs px-4 py-2.5 rounded-xl font-bold btn-primary-gold"
                  >
                    Record Settlement
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Purchase History bill logs (max 50) */}
          <div className="section-card">
            <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center">
              Purchase History
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
  );
}
