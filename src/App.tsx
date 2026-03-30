/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  PieChart as PieChartIcon, 
  History, 
  Settings,
  Trash2,
  TrendingUp,
  TrendingDown,
  X
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Transaction, TransactionType, CATEGORIES, Budget } from './types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#71717a'];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('spendwise_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('spendwise_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Budget form state
  const [budgetCategory, setBudgetCategory] = useState(CATEGORIES.expense[0]);
  const [budgetLimit, setBudgetLimit] = useState('');

  useEffect(() => {
    localStorage.setItem('spendwise_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('spendwise_budgets', JSON.stringify(budgets));
  }, [budgets]);

  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      balance: income - expenses,
      income,
      expenses
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(now, i);
      return format(d, 'MMM');
    }).reverse();

    return last6Months.map(month => {
      const monthTransactions = transactions.filter(t => format(parseISO(t.date), 'MMM') === month);
      const inc = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const exp = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      return { name: month, income: inc, expense: exp };
    });
  }, [transactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: Number(amount),
      category,
      description,
      date,
      type
    };

    setTransactions([newTransaction, ...transactions]);
    setIsModalOpen(false);
    setAmount('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetLimit || isNaN(Number(budgetLimit))) return;

    const existingIndex = budgets.findIndex(b => b.category === budgetCategory);
    if (existingIndex > -1) {
      const newBudgets = [...budgets];
      newBudgets[existingIndex] = { ...newBudgets[existingIndex], limit: Number(budgetLimit) };
      setBudgets(newBudgets);
    } else {
      setBudgets([...budgets, { id: crypto.randomUUID(), category: budgetCategory, limit: Number(budgetLimit) }]);
    }
    setIsBudgetModalOpen(false);
    setBudgetLimit('');
  };

  const budgetProgress = useMemo(() => {
    const currentMonth = startOfMonth(new Date());
    const endOfCurrentMonth = endOfMonth(new Date());

    return budgets.map(budget => {
      const spent = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.category === budget.category &&
          isWithinInterval(parseISO(t.date), { start: currentMonth, end: endOfCurrentMonth })
        )
        .reduce((acc, t) => acc + t.amount, 0);
      
      return {
        ...budget,
        spent,
        percentage: Math.min((spent / budget.limit) * 100, 100)
      };
    });
  }, [transactions, budgets]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Wallet size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">SpendWise</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsBudgetModalOpen(true)}
                className="text-slate-600 hover:text-blue-600 px-4 py-2 rounded-full flex items-center gap-2 transition-all"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Set Budgets</span>
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <PlusCircle size={18} />
                <span className="hidden sm:inline">Add Transaction</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Balance</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Wallet size={20} />
              </div>
            </div>
            <h2 className={cn(
              "text-3xl font-light",
              stats.balance >= 0 ? "text-slate-900" : "text-red-600"
            )}>
              ₹{stats.balance.toLocaleString()}
            </h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Income</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp size={20} />
              </div>
            </div>
            <h2 className="text-3xl font-light text-emerald-600">
              +₹{stats.income.toLocaleString()}
            </h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Expenses</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <TrendingDown size={20} />
              </div>
            </div>
            <h2 className="text-3xl font-light text-rose-600">
              -₹{stats.expenses.toLocaleString()}
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Budget Progress */}
            {budgetProgress.length > 0 && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  Monthly Budgets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {budgetProgress.map(budget => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{budget.category}</span>
                        <span className="text-slate-500">₹{budget.spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${budget.percentage}%` }}
                          className={cn(
                            "h-full rounded-full transition-all",
                            budget.percentage > 90 ? "bg-rose-500" : budget.percentage > 70 ? "bg-amber-500" : "bg-blue-500"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                Monthly Overview
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <PieChartIcon size={20} className="text-blue-600" />
                Expenses by Category
              </h3>
              <div className="h-[300px] w-full">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 italic">
                    No expense data to visualize
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-fit">
            <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={20} className="text-blue-600" />
                Recent History
              </div>
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p>No transactions yet.</p>
                    <p className="text-sm">Start by adding one!</p>
                  </div>
                ) : (
                  transactions.map((t) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 group hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-xl",
                          t.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                        )}>
                          {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{t.description || t.category}</p>
                          <p className="text-xs text-slate-500">{format(parseISO(t.date), 'MMM dd, yyyy')} • {t.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "font-semibold",
                          t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </span>
                        <button 
                          onClick={() => deleteTransaction(t.id)}
                          className="text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold">Add Transaction</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddTransaction} className="p-6 space-y-6">
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => { setType('expense'); setCategory(CATEGORIES.expense[0]); }}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                      type === 'expense' ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); }}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                      type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Income
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                      <input
                        autoFocus
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-lg font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      {CATEGORIES[type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What was this for?"
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={cn(
                    "w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all active:scale-[0.98]",
                    type === 'expense' ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                  )}
                >
                  Add {type === 'expense' ? 'Expense' : 'Income'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Budget Modal */}
      <AnimatePresence>
        {isBudgetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBudgetModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold">Set Category Budget</h3>
                <button onClick={() => setIsBudgetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddBudget} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={budgetCategory}
                      onChange={(e) => setBudgetCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      {CATEGORIES.expense.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Monthly Limit</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                      <input
                        autoFocus
                        type="number"
                        step="0.01"
                        required
                        value={budgetLimit}
                        onChange={(e) => setBudgetLimit(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-lg font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                >
                  Save Budget
                </button>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700">Existing Budgets</h4>
                  {budgets.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No budgets set yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {budgets.map(b => (
                        <div key={b.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                          <span className="font-medium">{b.category}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600">₹{b.limit.toLocaleString()}</span>
                            <button 
                              type="button"
                              onClick={() => setBudgets(budgets.filter(x => x.id !== b.id))}
                              className="text-slate-300 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
