


import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import { useAccounts } from '../hooks/useAccounts';
import { useTrades } from '../hooks/useTrades';
import { usePlaybooks } from '../hooks/usePlaybooks';
import { Account, AccountCurrency, Trade, PerformanceMetrics, EquityDataPoint, TradeOutcome, EmotionalState, Playbook } from '../types';
import { ICONS, ACCOUNT_CURRENCIES, EMOTIONAL_STATE_OPTIONS, TIME_RANGES, getValueColorClasses } from '../constants';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ComposedChart, PieChart, Pie } from 'recharts';
import Spinner from '../components/ui/Spinner';


const formatCurrency = (amount: number, currencyCode: AccountCurrency) => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  } catch (e) { 
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
};

const AccountForm: React.FC<{
  account?: Account;
  onSave: (accountData: Omit<Account, 'id' | 'created_at'> | Account) => Promise<void>;
  onClose: () => void;
  isLoadingParent: boolean;
}> = ({ account, onSave, onClose, isLoadingParent }) => {
  const [name, setName] = useState(account?.name || '');
  const [broker, setBroker] = useState(account?.broker || '');
  const [initialBalance, setInitialBalance] = useState<string>(account?.initial_balance?.toString() || '');
  const [currentBalance, setCurrentBalance] = useState<string>(account?.current_balance?.toString() || '');
  const [currency, setCurrency] = useState<AccountCurrency>(account?.currency || ACCOUNT_CURRENCIES[0]);
  const [isActive, setIsActive] = useState<boolean>(account ? account.is_active : true);
  const [notes, setNotes] = useState(account?.notes || '');
  const [isPropFirmChallenge, setIsPropFirmChallenge] = useState(account?.is_prop_firm_challenge || false);
  const [propFirmName, setPropFirmName] = useState(account?.prop_firm_name || '');
  const [propFirmProfitTargetPercent, setPropFirmProfitTargetPercent] = useState<string>(account?.prop_firm_profit_target_percent?.toString() || '');
  const [propFirmMaxDailyLossPercent, setPropFirmMaxDailyLossPercent] = useState<string>(account?.prop_firm_max_daily_loss_percent?.toString() || '');
  const [propFirmMaxTotalDrawdownPercent, setPropFirmMaxTotalDrawdownPercent] = useState<string>(account?.prop_firm_max_total_drawdown_percent?.toString() || '');
  const [propFirmChallengeStartDate, setPropFirmChallengeStartDate] = useState(account?.prop_firm_challenge_start_date?.split('T')[0] || '');
  const [propFirmChallengeEndDate, setPropFirmChallengeEndDate] = useState(account?.prop_firm_challenge_end_date?.split('T')[0] || '');

  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !broker.trim() || !initialBalance.trim() || !currentBalance.trim()) {
      setFormError('Name, Broker, Initial Balance and Current Balance are required.');
      return;
    }
    const parsedInitialBalance = parseFloat(initialBalance);
    const parsedCurrentBalance = parseFloat(currentBalance);
    if (isNaN(parsedInitialBalance) || isNaN(parsedCurrentBalance) || parsedInitialBalance < 0 || parsedCurrentBalance < 0) {
        setFormError('Balances must be valid positive numbers.');
        return;
    }

    setFormError('');
    const accountData = {
      ...(account ? { ...account } : {}), 
      name, broker, initial_balance: parsedInitialBalance, current_balance: parsedCurrentBalance,
      currency, is_active: isActive, notes,
      is_prop_firm_challenge: isPropFirmChallenge,
      ...(isPropFirmChallenge ? {
        prop_firm_name: propFirmName.trim(),
        prop_firm_profit_target_percent: propFirmProfitTargetPercent ? parseFloat(propFirmProfitTargetPercent) : undefined,
        prop_firm_max_daily_loss_percent: propFirmMaxDailyLossPercent ? parseFloat(propFirmMaxDailyLossPercent) : undefined,
        prop_firm_max_total_drawdown_percent: propFirmMaxTotalDrawdownPercent ? parseFloat(propFirmMaxTotalDrawdownPercent) : undefined,
        prop_firm_challenge_start_date: propFirmChallengeStartDate || undefined,
        prop_firm_challenge_end_date: propFirmChallengeEndDate || undefined,
      }: {})
    };
    await onSave(accountData as Omit<Account, 'id' | 'created_at'> | Account);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Input label="Account Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Main Trading Account" required />
      <Input label="Broker" type="text" value={broker} onChange={e => setBroker(e.target.value)} placeholder="e.g., Interactive Brokers, Binance" required />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Initial Balance" type="number" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} step="any" min="0" placeholder="e.g., 100000" required />
        <Input label="Current Balance" type="number" value={currentBalance} onChange={e => setCurrentBalance(e.target.value)} step="any" min="0" placeholder="e.g., 105000" helperText="Manually update for now" required />
      </div>
      <Select label="Currency" value={currency} onChange={e => setCurrency(e.target.value as AccountCurrency)} options={ACCOUNT_CURRENCIES.map(c => ({ value: c, label: c }))} required />
      <Textarea label="Notes (Optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
      <ToggleSwitch id="accountActiveToggle" label="Account Active" isOn={isActive} handleToggle={() => setIsActive(!isActive)} />
      
      <div className="pt-4 border-t border-light-border dark:border-dark-border">
        <ToggleSwitch id="propFirmChallengeToggle" label="Is this a Prop Firm Challenge Account?" isOn={isPropFirmChallenge} handleToggle={() => setIsPropFirmChallenge(!isPropFirmChallenge)} />
        {isPropFirmChallenge && (
            <div className="mt-3 space-y-4 pl-2 border-l-2 border-primary-light">
                <Input label="Prop Firm Name" value={propFirmName} onChange={e=>setPropFirmName(e.target.value)} placeholder="e.g., FTMO, MyForexFunds"/>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Profit Target (%)" type="number" value={propFirmProfitTargetPercent} onChange={e=>setPropFirmProfitTargetPercent(e.target.value)} placeholder="e.g., 8"/>
                    <Input label="Max Daily Loss (%)" type="number" value={propFirmMaxDailyLossPercent} onChange={e=>setPropFirmMaxDailyLossPercent(e.target.value)} placeholder="e.g., 5"/>
                    <Input label="Max Total Drawdown (%)" type="number" value={propFirmMaxTotalDrawdownPercent} onChange={e=>setPropFirmMaxTotalDrawdownPercent(e.target.value)} placeholder="e.g., 10"/>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Challenge Start Date" type="date" value={propFirmChallengeStartDate} onChange={e=>setPropFirmChallengeStartDate(e.target.value)}/>
                    <Input label="Challenge End Date" type="date" value={propFirmChallengeEndDate} onChange={e=>setPropFirmChallengeEndDate(e.target.value)}/>
                </div>
            </div>
        )}
      </div>

      {formError && <p className="text-sm text-danger">{formError}</p>}
      <div className="flex justify-end space-x-2 pt-2 sticky bottom-0 bg-light-card dark:bg-dark-card py-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoadingParent}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoadingParent} disabled={isLoadingParent}>
          {isLoadingParent ? (account ? 'Saving...' : 'Adding...') : (account ? 'Save Changes' : 'Add Account')}
        </Button>
      </div>
    </form>
  );
};

const AccountListItem: React.FC<{ 
    account: Account; 
    onEdit: (account: Account) => void; 
    onSelect: (accountId: string) => void;
    isSelected: boolean;
}> = ({ account, onEdit, onSelect, isSelected }) => {
  const selectedClasses = isSelected ? 'ring-2 ring-primary-DEFAULT shadow-xl dark:shadow-[0_0_15px_2px_rgba(139,92,246,0.4)]' : 'hover:shadow-lg';
  const pnl = account.current_balance - account.initial_balance;
  return (
    <Card 
        className={`transition-all duration-200 ${!account.is_active ? 'opacity-60 bg-slate-100 dark:bg-slate-800/50' : ''} ${selectedClasses}`}
        onClick={() => onSelect(account.id)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-semibold ${isSelected ? 'text-primary-dark dark:text-primary-light' : 'text-primary-DEFAULT'}`}>{account.name}</h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{account.broker}</p>
          {!account.is_active && <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">(Inactive)</span>}
          {account.is_prop_firm_challenge && <span className="text-xs font-semibold text-info ml-2">({account.prop_firm_name || 'Prop Challenge'})</span>}
        </div>
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onEdit(account); }}>Edit</Button>
      </div>
      <div className="mt-4 space-y-1 text-sm text-light-text dark:text-dark-text">
        <p><strong>Current Balance:</strong> <span className={getValueColorClasses(pnl)}>{formatCurrency(account.current_balance, account.currency)}</span></p>
        <p><strong>Initial Balance:</strong> {formatCurrency(account.initial_balance, account.currency)}</p>
      </div>
    </Card>
  );
};

const KeyMetricDisplay: React.FC<{
  title: string; value: string | number; unit?: string; description?: string;
  icon?: React.ReactNode; iconClassName?: string; explicitValueClassName?: string;
}> = ({ title, value, unit, description, icon, iconClassName, explicitValueClassName }) => (
  <div className="text-center p-3 bg-light-background dark:bg-dark-sidebar rounded-lg shadow-sm h-full flex flex-col justify-center">
    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase flex items-center justify-center mb-0.5">
      {icon && <span className={`mr-1.5 ${iconClassName || ''}`}>{icon}</span>}
      {title}
    </p>
    <p className={`text-xl font-semibold ${explicitValueClassName || getValueColorClasses(value)}`}>{typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : value}{unit || ''}</p>
    {description && <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>}
  </div>
);

const ChartCardWrapper: React.FC<{title: string; children: React.ReactNode; className?: string; minHeightClass?: string;}> = ({title, children, className, minHeightClass = "h-80"}) => (
    <Card title={title} className={className}> <div className={minHeightClass}>{children}</div> </Card>
);

const calculateAccountPerformanceMetrics = (trades: Trade[], account: Account | null): PerformanceMetrics => {
    const initial_balance = account?.initial_balance || 0;
    const current_balance = account?.current_balance || 0;

    const baseMetrics = calculatePerformanceMetrics(trades); 

    const net_pnl_currency = current_balance - initial_balance;
    
    const monthly_return_percent = undefined; 
    const weekly_return_percent = undefined; 

    let cumulativeR = 0;
    let peakR = 0;
    let max_drawdown_r = 0;
    trades.slice().sort((a,b) => new Date(a.entry_timestamp).getTime() - new Date(b.entry_timestamp).getTime())
      .forEach(trade => {
        cumulativeR += trade.r_multiple || 0;
        if (cumulativeR > peakR) peakR = cumulativeR;
        const drawdown = peakR > 0 ? ((peakR - cumulativeR) / peakR) * 100 : 0;
        if (drawdown > max_drawdown_r) max_drawdown_r = drawdown;
    });

    return { 
        ...baseMetrics,
        net_pnl_currency,
        monthly_return_percent,
        weekly_return_percent,
        max_drawdown_r: max_drawdown_r, 
    };
};

const calculatePerformanceMetrics = (trades: Trade[]): PerformanceMetrics => {
    const total_trades = trades.length;
    if (total_trades === 0) return { total_trades: 0, win_rate: 0, loss_rate: 0, breakeven_rate: 0, avg_r: 0, total_r: 0, profit_factor: 0, expectancy: 0, avg_win_r: 0, avg_loss_r: 0, gross_profit_r: 0, gross_loss_r: 0, max_drawdown_r: 0, longest_win_streak: 0, longest_loss_streak: 0, avg_rule_adherence: 0 };
    const winningTrades = trades.filter(t => t.outcome === TradeOutcome.WIN);
    const losingTrades = trades.filter(t => t.outcome === TradeOutcome.LOSS);
    const breakevenTrades = trades.filter(t => t.outcome === TradeOutcome.BREAKEVEN);
    const win_rate = (winningTrades.length / total_trades) * 100;
    const loss_rate = (losingTrades.length / total_trades) * 100;
    const breakeven_rate = (breakevenTrades.length / total_trades) * 100;
    const total_r = trades.reduce((sum, t) => sum + (t.r_multiple || 0), 0);
    const avg_r = total_r / total_trades;
    const gross_profit_r = winningTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0);
    const gross_loss_r = Math.abs(losingTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0));
    const profit_factor = gross_loss_r > 0 ? gross_profit_r / gross_loss_r : (gross_profit_r > 0 ? Infinity : 0);
    const avg_win_r = winningTrades.length > 0 ? gross_profit_r / winningTrades.length : 0;
    const avg_loss_r = losingTrades.length > 0 ? gross_loss_r / losingTrades.length : 0;
    const expectancy = (win_rate / 100 * avg_win_r) - (loss_rate / 100 * avg_loss_r);
    let cumulativeR = 0, peakR = 0, max_drawdown_r = 0;
    trades.slice().sort((a,b) => new Date(a.entry_timestamp).getTime() - new Date(b.entry_timestamp).getTime())
      .forEach(trade => { cumulativeR += trade.r_multiple || 0; if (cumulativeR > peakR) peakR = cumulativeR; const drawdown = peakR > 0 ? ((peakR - cumulativeR) / peakR) * 100 : 0; if (drawdown > max_drawdown_r) max_drawdown_r = drawdown; });
    let longest_win_streak = 0, currentWinStreak = 0, longest_loss_streak = 0, currentLossStreak = 0;
    trades.slice().sort((a,b) => new Date(a.entry_timestamp).getTime() - new Date(b.entry_timestamp).getTime())
      .forEach(trade => { if (trade.outcome === TradeOutcome.WIN) { currentWinStreak++; currentLossStreak = 0; if (currentWinStreak > longest_win_streak) longest_win_streak = currentWinStreak; } else if (trade.outcome === TradeOutcome.LOSS) { currentLossStreak++; currentWinStreak = 0; if (currentLossStreak > longest_loss_streak) longest_loss_streak = currentLossStreak; } else { currentWinStreak = 0; currentLossStreak = 0; } });
    
    const ruleAdherenceScores = trades.map(t => t.rule_adherence_score).filter(s => s !== undefined) as number[];
    const avg_rule_adherence = ruleAdherenceScores.length > 0 ? ruleAdherenceScores.reduce((a,b) => a+b, 0) / ruleAdherenceScores.length : 0;

    return { total_trades, win_rate, loss_rate, breakeven_rate, avg_r, total_r, profit_factor, expectancy, avg_win_r, avg_loss_r, gross_profit_r, gross_loss_r, max_drawdown_r, longest_win_streak, longest_loss_streak, avg_rule_adherence };
};


const AccountsPage: React.FC = () => {
  const { accounts, addAccount, updateAccount, getAccountById, isLoading: accountsHookLoading, error: accountsError } = useAccounts();
  const { trades: allTrades, isLoading: tradesHookLoading } = useTrades();
  const { getPlaybookById, isLoading: playbooksHookLoading } = usePlaybooks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [equityViewType, setEquityViewType] = useState<'r' | 'currency'>('r'); 

  const isLoading = accountsHookLoading || tradesHookLoading || playbooksHookLoading;
  const error = accountsError; 

  const handleOpenModal = (account?: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setEditingAccount(undefined);
    setIsModalOpen(false);
  };
  const handleSaveAccount = async (accountData: Omit<Account, 'id' | 'created_at'> | Account) => {
    try {
      if ('id' in accountData && accountData.id) { await updateAccount(accountData as Account); } 
      else { await addAccount(accountData as Omit<Account, 'id' | 'created_at'>); }
      handleCloseModal();
    } catch (e) { console.error("Failed to save account:", e); }
  };
  
  const displayedAccounts = accounts.filter(acc => {
    if (filterActive === 'active') return acc.is_active;
    if (filterActive === 'inactive') return !acc.is_active;
    return true; 
  }).sort((a,b) => a.name.localeCompare(b.name));

  const selectedAccount = useMemo(() => {
    if (!selectedAccountId) return null;
    return getAccountById(selectedAccountId);
  }, [selectedAccountId, getAccountById]);

  const accountTrades = useMemo(() => {
    if (!selectedAccountId) return [];
    let tradesForAccount = allTrades.filter(trade => trade.account_id === selectedAccountId);
    if (selectedAccount?.is_prop_firm_challenge && selectedAccount.prop_firm_challenge_start_date) {
        tradesForAccount = tradesForAccount.filter(trade => new Date(trade.entry_timestamp) >= new Date(selectedAccount!.prop_firm_challenge_start_date!));
        if(selectedAccount.prop_firm_challenge_end_date){
             tradesForAccount = tradesForAccount.filter(trade => new Date(trade.entry_timestamp) <= new Date(selectedAccount!.prop_firm_challenge_end_date!));
        }
    }
    return tradesForAccount.sort((a,b) => new Date(a.entry_timestamp).getTime() - new Date(b.entry_timestamp).getTime());
  }, [selectedAccountId, allTrades, selectedAccount]);

  const accountPerformance = useMemo(() => {
    if (!selectedAccount) return null;
    return calculateAccountPerformanceMetrics(accountTrades, selectedAccount);
  }, [accountTrades, selectedAccount]);
  
  const accountEquityCurve: EquityDataPoint[] = useMemo(() => {
    if (!selectedAccount) return [];
    let cumulativeValue = equityViewType === 'currency' ? (selectedAccount.prop_firm_challenge_start_date && selectedAccount.is_prop_firm_challenge ? selectedAccount.initial_balance : selectedAccount.initial_balance) : 0;
    let peakValue = cumulativeValue;

    return accountTrades.map((trade, index) => {
      if (equityViewType === 'currency') {
        const riskAmount = (selectedAccount.initial_balance * (trade.risk_percentage / 100));
        cumulativeValue += (trade.r_multiple || 0) * riskAmount;
      } else { 
        cumulativeValue += trade.r_multiple || 0;
      }
      if (cumulativeValue > peakValue) peakValue = cumulativeValue;
      const drawdownVal = peakValue > (equityViewType === 'currency' ? 0 : -Infinity) ? ((peakValue - cumulativeValue)) : 0; 
      
      return { 
        date: String(index + 1), 
        value: parseFloat(cumulativeValue.toFixed(2)),
        drawdown: parseFloat(drawdownVal.toFixed(2)) * (equityViewType === 'currency' ? 1 : -1), 
        is_currency: equityViewType === 'currency',
      };
    });
  }, [accountTrades, selectedAccount, equityViewType]);
  
  const driverScoreByAccount = useMemo(() => accountPerformance?.avg_rule_adherence, [accountPerformance]);

  const assetConcentration = useMemo(() => {
    if (accountTrades.length === 0) return [];
    const concentration: { [asset: string]: { totalR: number, trades: number } } = {};
    accountTrades.forEach(t => {
      concentration[t.asset] = concentration[t.asset] || { totalR: 0, trades: 0 };
      concentration[t.asset].totalR += t.r_multiple || 0;
      concentration[t.asset].trades++;
    });
    return Object.entries(concentration).map(([name, data]) => ({ name, value: data.totalR, trades: data.trades }))
                   .sort((a,b) => b.value - a.value).slice(0, 7); 
  }, [accountTrades]);

  const playbookConcentration = useMemo(() => {
    if (accountTrades.length === 0) return [];
    const concentration: { [playbookId: string]: { totalR: number, trades: number } } = {};
    accountTrades.forEach(t => {
      const pbId = t.playbook_id || 'N/A';
      concentration[pbId] = concentration[pbId] || { totalR: 0, trades: 0 };
      concentration[pbId].totalR += t.r_multiple || 0;
      concentration[pbId].trades++;
    });
    return Object.entries(concentration).map(([id, data]) => ({ name: getPlaybookById(id)?.name || id, value: data.totalR, trades: data.trades }))
                   .sort((a,b) => b.value - a.value).slice(0, 7);
  }, [accountTrades, getPlaybookById]);


  const propFirmStatus = useMemo(() => {
    if (!selectedAccount || !selectedAccount.is_prop_firm_challenge || !accountPerformance) return null;
    const currentPnl = selectedAccount.current_balance - selectedAccount.initial_balance;
    const currentProfitPercent = (currentPnl / selectedAccount.initial_balance) * 100;
    
    const currentTotalDrawdownPercent = accountPerformance.max_drawdown_r; 

    return {
      currentProfitPercent: parseFloat(currentProfitPercent.toFixed(2)),
      currentTotalDrawdownPercent: parseFloat(currentTotalDrawdownPercent.toFixed(2)),
    };
  }, [selectedAccount, accountPerformance]);

  const allAccountsSummary = useMemo(() => {
    return accounts
        .filter(acc => acc.is_active)
        .map(acc => {
            const tradesForAcc = allTrades.filter(t => t.account_id === acc.id);
            const perf = calculatePerformanceMetrics(tradesForAcc);
            return {
                id: acc.id,
                name: acc.name,
                currency: acc.currency,
                total_r: perf.total_r,
                profit_factor: perf.profit_factor,
                expectancy: perf.expectancy,
                max_drawdown_r: perf.max_drawdown_r,
                driverScore: perf.avg_rule_adherence
            };
        });
  }, [accounts, allTrades]);


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">Trading Accounts</h2>
        <Button variant="primary" onClick={() => handleOpenModal()} leftIcon={<ICONS.PLUS_CIRCLE className="w-5 h-5"/>}>
          Add New Account
        </Button>
      </div>
      
      <Card className="mb-6">
        <div className="p-2 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Select
                label="Filter Status"
                value={filterActive}
                onChange={(e) => { setSelectedAccountId(null); setFilterActive(e.target.value as 'all' | 'active' | 'inactive');}}
                options={[ {value: 'active', label: 'Active Accounts'}, {value: 'inactive', label: 'Inactive Accounts'}, {value: 'all', label: 'All Accounts'}, ]}
                wrapperClassName="mb-0 max-w-xs"
            />
            {isLoading && <Spinner size="sm"/>}
            {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </Card>
      
        {filterActive === 'active' && allAccountsSummary.length > 0 && (
            <Card title="Active Accounts Overview" className="mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-left text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase">
                            <tr>
                                <th className="p-2">Account</th>
                                <th className="p-2 text-right">Total R</th>
                                <th className="p-2 text-right">Profit Factor</th>
                                <th className="p-2 text-right">Expectancy (R)</th>
                                <th className="p-2 text-right">Max DD (R%)</th>
                                <th className="p-2 text-right">Driver Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allAccountsSummary.map(acc => (
                                <tr key={acc.id} className={`border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-slate-100 dark:hover:bg-slate-800/30 ${selectedAccountId === acc.id ? 'bg-primary-light/20 dark:bg-primary-dark/30' : ''}`} onClick={() => setSelectedAccountId(acc.id)}>
                                    <td className="p-2 font-medium text-primary-DEFAULT cursor-pointer">{acc.name}</td>
                                    <td className={`p-2 text-right font-semibold ${getValueColorClasses(acc.total_r)}`}>{acc.total_r.toFixed(2)}R</td>
                                    <td className={`p-2 text-right ${acc.profit_factor >= 1.5 ? 'text-success' : acc.profit_factor >=1 ? 'text-warning':'text-danger'}`}>{isFinite(acc.profit_factor) ? acc.profit_factor.toFixed(2) : 'N/A'}</td>
                                    <td className={`p-2 text-right ${getValueColorClasses(acc.expectancy)}`}>{acc.expectancy.toFixed(2)}R</td>
                                    <td className={`p-2 text-right ${acc.max_drawdown_r > 20 ? 'text-danger': acc.max_drawdown_r > 10 ? 'text-warning' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>{acc.max_drawdown_r.toFixed(2)}%</td>
                                    <td className={`p-2 text-right ${ (acc.driverScore || 0) >= 8 ? 'text-success' : (acc.driverScore || 0) >=5 ? 'text-warning' : 'text-danger' }`}>{(acc.driverScore || 0).toFixed(1)}/10</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        )}


      {!isLoading && !error && (
        displayedAccounts.length === 0 && !selectedAccountId ? ( 
          <Card><p className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">{filterActive === 'active' ? 'No active accounts.' : 'No accounts match filter.'}</p></Card>
        ) : !selectedAccountId && displayedAccounts.length > 0 ? ( 
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedAccounts.map(acc => ( <AccountListItem key={acc.id} account={acc} onEdit={handleOpenModal} onSelect={() => setSelectedAccountId(acc.id === selectedAccountId ? null : acc.id)} isSelected={acc.id === selectedAccountId} /> ))}
            </div>
        ) : null 
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingAccount ? 'Edit Account' : 'Add New Account'} size="xl">
          <AccountForm account={editingAccount} onSave={handleSaveAccount} onClose={handleCloseModal} isLoadingParent={isLoading} />
        </Modal>
      )}

      {selectedAccount && accountPerformance && (
        <div className="mt-10 pt-6 border-t-2 border-primary-DEFAULT/30">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary-DEFAULT">Analytics: {selectedAccount.name}</h3>
                <Button variant="secondary" onClick={() => setSelectedAccountId(null)}>Back to Accounts List</Button>
            </div>
            
            <Card title="Core Account Metrics" className="mb-6">
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <KeyMetricDisplay title="Net P&L" value={formatCurrency(accountPerformance.net_pnl_currency || 0, selectedAccount.currency)} explicitValueClassName={getValueColorClasses(accountPerformance.net_pnl_currency)}/>
                    <KeyMetricDisplay title="Total R (Trades)" value={accountPerformance.total_r} unit="R" explicitValueClassName={getValueColorClasses(accountPerformance.total_r)}/>
                    <KeyMetricDisplay title="Expectancy" value={accountPerformance.expectancy} unit="R" explicitValueClassName={getValueColorClasses(accountPerformance.expectancy)}/>
                    <KeyMetricDisplay title="Profit Factor" value={isFinite(accountPerformance.profit_factor) ? accountPerformance.profit_factor : "N/A"} explicitValueClassName={accountPerformance.profit_factor >= 1.5 ? 'text-success' : accountPerformance.profit_factor >=1 ? 'text-warning':'text-danger'} />
                    <KeyMetricDisplay title="Win Rate" value={accountPerformance.win_rate} unit="%" explicitValueClassName={accountPerformance.win_rate >= 55 ? 'text-success' : accountPerformance.win_rate >=45 ? 'text-warning':'text-danger'}/>
                    <KeyMetricDisplay title="Trades" value={accountPerformance.total_trades} />
                    <KeyMetricDisplay title="Driver Score" value={driverScoreByAccount?.toFixed(1) || 'N/A'} unit="/10" explicitValueClassName={(driverScoreByAccount || 0) >= 8 ? 'text-success' : (driverScoreByAccount || 0) >=5 ? 'text-warning':'text-danger'}/>
                    <KeyMetricDisplay title="Max Drawdown (R)" value={accountPerformance.max_drawdown_r} unit="%" explicitValueClassName={accountPerformance.max_drawdown_r > 20 ? 'text-danger': accountPerformance.max_drawdown_r > 10 ? 'text-warning' : getValueColorClasses(0) }/>
                 </div>
                 <p className="text-xs text-center mt-4 text-light-text-secondary dark:text-dark-text-secondary">(Monthly/Weekly Return % and Currency Max Drawdown are future enhancements requiring detailed balance tracking.)</p>
            </Card>

            {selectedAccount.is_prop_firm_challenge && propFirmStatus && (
                <Card title={`${selectedAccount.prop_firm_name || 'Prop Firm'} Challenge Status`} className="mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KeyMetricDisplay title="Profit Target" value={`${selectedAccount.prop_firm_profit_target_percent || 0}%`} description={`Current: ${propFirmStatus.currentProfitPercent}%`} explicitValueClassName={propFirmStatus.currentProfitPercent >= (selectedAccount.prop_firm_profit_target_percent || 0) ? 'text-success' : 'text-warning'}/>
                        <KeyMetricDisplay title="Max Daily Loss Limit" value={`${selectedAccount.prop_firm_max_daily_loss_percent || 0}%`} description={`Highest Seen: ${selectedAccount.prop_firm_highest_daily_loss_encountered_percent || 0}%`} explicitValueClassName={(selectedAccount.prop_firm_highest_daily_loss_encountered_percent || 0) > (selectedAccount.prop_firm_max_daily_loss_percent || 100) ? 'text-danger': getValueColorClasses(0)} />
                        <KeyMetricDisplay title="Max Total Drawdown Limit" value={`${selectedAccount.prop_firm_max_total_drawdown_percent || 0}%`} description={`Current DD (R-based): ${propFirmStatus.currentTotalDrawdownPercent}%`} explicitValueClassName={propFirmStatus.currentTotalDrawdownPercent > (selectedAccount.prop_firm_max_total_drawdown_percent || 100) ? 'text-danger': getValueColorClasses(0)} />
                         {selectedAccount.prop_firm_challenge_end_date && <KeyMetricDisplay title="Days Remaining" value={Math.max(0, Math.floor((new Date(selectedAccount.prop_firm_challenge_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} unit=" days"/>}
                    </div>
                </Card>
            )}

            <ChartCardWrapper title={`Equity Curve (${equityViewType === 'currency' ? selectedAccount.currency : 'R-Multiple'})`}>
                <div className="flex justify-end mb-2">
                    <Button size="sm" variant={equityViewType === 'r' ? 'primary' : 'secondary'} onClick={() => setEquityViewType('r')} className="mr-2">R-Multiple</Button>
                    <Button size="sm" variant={equityViewType === 'currency' ? 'primary' : 'secondary'} onClick={() => setEquityViewType('currency')}>Currency</Button>
                </div>
                 {accountEquityCurve.length > 1 ? (
                    <ResponsiveContainer width="100%" height="calc(100% - 30px)">
                        <ComposedChart data={accountEquityCurve}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis dataKey="date" name="Trade #" tick={{ fontSize: 10 }} />
                            <YAxis yAxisId="left" tickFormatter={(val) => equityViewType === 'currency' ? formatCurrency(val, selectedAccount.currency) : `${val}R`} tick={{ fontSize: 10 }} domain={['auto', 'auto']} label={{ value: `Cumulative ${equityViewType === 'currency' ? selectedAccount.currency : 'R'}`, angle: -90, position: 'insideLeft', fontSize: 10, offset:-2 }}/>
                            <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => equityViewType === 'currency' ? formatCurrency(val, selectedAccount.currency) : `${val}R`} tick={{ fontSize: 10 }} domain={['auto', 0]} label={{ value: `Drawdown ${equityViewType === 'currency' ? selectedAccount.currency : 'R'}`, angle: 90, position: 'insideRight', fontSize: 10, offset:-2 }}/>
                            <Tooltip formatter={(value: number, name, props) => [`${value.toFixed(2)}${props.payload.is_currency ? selectedAccount.currency : 'R'}`, name]}/>
                            <Legend verticalAlign="top" wrapperStyle={{fontSize: "11px", paddingTop: "5px"}} iconSize={10}/>
                            <Line yAxisId="left" type="monotone" dataKey="value" name="Equity" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 1 }} activeDot={{ r: 4 }} animationDuration={500}/>
                            <Bar yAxisId="right" dataKey="drawdown" name="Drawdown" fill="#EF4444" opacity={0.6} barSize={10} animationDuration={500}/>
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : <p className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary text-sm">Not enough data for equity curve.</p>}
            </ChartCardWrapper>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <ChartCardWrapper title="Asset Concentration (by Total R)">
                     {assetConcentration.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={assetConcentration} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                                    {assetConcentration.map((entry, index) => (<Cell key={`cell-asset-${index}`} fill={ICONS.PIE_COLORS[index % ICONS.PIE_COLORS.length]} />))}
                                </Pie>
                                <Tooltip formatter={(value) => `${(value as number).toFixed(2)}R`}/> <Legend iconSize={10} wrapperStyle={{fontSize:"10px"}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary text-sm">No asset data.</p>}
                </ChartCardWrapper>
                <ChartCardWrapper title="Playbook Concentration (by Total R)">
                     {playbookConcentration.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={playbookConcentration} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                                    {playbookConcentration.map((entry, index) => (<Cell key={`cell-pb-${index}`} fill={ICONS.PIE_COLORS_ALT[index % ICONS.PIE_COLORS_ALT.length]} />))}
                                </Pie>
                                <Tooltip formatter={(value) => `${(value as number).toFixed(2)}R`}/> <Legend iconSize={10} wrapperStyle={{fontSize:"10px"}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary text-sm">No playbook data.</p>}
                </ChartCardWrapper>
            </div>
            
            <Card title="Performance vs. Benchmark (Future)" className="mt-6">
                 <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">This section will compare your account's monthly returns against a benchmark like the S&P 500 (SPY). This feature requires external market data integration and is planned for a future update.</p>
            </Card>

            {selectedAccount.notes && ( <Card title="Account Notes" className="mt-6"> <p className="text-sm whitespace-pre-wrap text-light-text dark:text-dark-text">{selectedAccount.notes}</p> </Card> )}
        </div>
      )}
    </div>
  );
};

export default AccountsPage;