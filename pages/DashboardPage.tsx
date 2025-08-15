


import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ICONS, TIME_RANGES, getValueColorClasses } from '../constants'; 
import { Link, useNavigate } from 'react-router-dom';
import { useTrades } from '../hooks/useTrades';
import { useAccounts } from '../hooks/useAccounts'; 
import { Trade, TradeOutcome, EquityDataPoint, RollingPerformanceDataPoint, PerformanceGoal } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input'; 

interface DashboardWidgetProps {
  title: string;
  value: string | number;
  description?: string | React.ReactNode; // Allow ReactNode for richer descriptions
  trend?: 'up' | 'down' | 'neutral';
  children?: React.ReactNode;
  className?: string;
  subValue?: string;
  subValueClassName?: string;
  tooltipText?: string; 
  onClick?: () => void; 
  metricIcon?: React.ReactNode;
  metricIconClassName?: string;
  valueClassName?: string;
}

const InfoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary inline-block ml-1.5 align-middle">
    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9Z" clipRule="evenodd" />
  </svg>
);

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ 
  title, value, description, trend, children, className, subValue, subValueClassName, tooltipText, onClick,
  metricIcon, metricIconClassName, valueClassName
}) => {
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-light-text-secondary dark:text-dark-text-secondary';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';

  return (
    <Card 
        className={`flex flex-col ${className || ''} ${onClick ? 'hover:shadow-xl hover:ring-1 hover:ring-primary-DEFAULT/30' : ''}`} 
        onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider flex items-center">
          {metricIcon && <span className={`mr-2 ${metricIconClassName || ''}`}>{metricIcon}</span>}
          {title}
          {tooltipText && (
            <span title={tooltipText} className="cursor-help">
              <InfoIcon />
            </span>
          )}
        </h3>
      </div>
      <div className="mt-1">
        <p className={`text-3xl font-semibold ${valueClassName || getValueColorClasses(value)} ${children ? 'mb-1' : ''}`}>{value}</p>
        {subValue && <p className={`text-xs ${subValueClassName || getValueColorClasses(subValue)} -mt-1 mb-1`}>{subValue}</p>}
        {description && (
          <div className={`text-xs text-light-text-secondary dark:text-dark-text-secondary ${trend ? 'inline-flex items-center' : ''}`}>
            {trend && <span className={`mr-1 font-semibold ${trendColor}`}>{trendIcon}</span>}
            {description}
          </div>
        )}
      </div>
      {children && <div className="mt-auto pt-2">{children}</div>}
    </Card>
  );
};


const calculateMaxDrawdown = (equityData: EquityDataPoint[]): number => {
    if (equityData.length < 2) return 0;
    let maxDrawdown = 0;
    let peak = -Infinity; 

    for (const point of equityData) {
        if (point.value > peak) {
            peak = point.value;
        }
        let drawdown = 0;
        if (peak !== 0) { 
           drawdown = ((peak - point.value) / Math.abs(peak)) * 100;
        } else if (point.value < 0) { 
            drawdown = Infinity; 
        }
        
        if (drawdown > maxDrawdown && peak > 0) { 
            maxDrawdown = drawdown;
        }
    }
    return parseFloat(maxDrawdown.toFixed(2));
};

const calculateRollingProfitFactor = (trades: Trade[], windowSize: number): RollingPerformanceDataPoint[] => {
    const sortedTrades = [...trades].sort((a, b) => new Date(a.entry_timestamp).getTime() - new Date(b.entry_timestamp).getTime());
    const rollingPFData: RollingPerformanceDataPoint[] = [];

    if (sortedTrades.length === 0) return [];
    
    if (sortedTrades.length < windowSize && sortedTrades.length > 0) {
        const grossProfitR = sortedTrades.filter(t => t.outcome === TradeOutcome.WIN).reduce((sum, t) => sum + (t.r_multiple || 0), 0);
        const grossLossR = Math.abs(sortedTrades.filter(t => t.outcome === TradeOutcome.LOSS).reduce((sum, t) => sum + (t.r_multiple || 0), 0));
        const pf = grossLossR > 0 ? parseFloat((grossProfitR / grossLossR).toFixed(2)) : (grossProfitR > 0 ? Infinity : 0);
        rollingPFData.push({ trade_count: sortedTrades.length, value: isFinite(pf) ? pf : (grossProfitR > 0 ? 50 : 0) }); 
        return rollingPFData;
    }
    
    if (sortedTrades.length < windowSize) return []; 

    for (let i = 0; i <= sortedTrades.length - windowSize; i++) {
        const windowTrades = sortedTrades.slice(i, i + windowSize);
        const grossProfitR = windowTrades.filter(t => t.outcome === TradeOutcome.WIN).reduce((sum, t) => sum + (t.r_multiple || 0), 0);
        const grossLossR = Math.abs(windowTrades.filter(t => t.outcome === TradeOutcome.LOSS).reduce((sum, t) => sum + (t.r_multiple || 0), 0));
        let pf = grossLossR > 0 ? grossProfitR / grossLossR : (grossProfitR > 0 ? Infinity : 0);
        pf = isFinite(pf) ? parseFloat(pf.toFixed(2)) : (grossProfitR > 0 ? 50 : 0); 

        rollingPFData.push({ trade_count: i + windowSize, value: pf });
    }
    return rollingPFData;
};


const DashboardPage: React.FC = () => {
  const { trades } = useTrades();
  const { getActiveAccounts, isLoading: accountsLoading } = useAccounts(); 
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<string>(TIME_RANGES[5]); 
  
  const [availableAccountsOptions, setAvailableAccountsOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(''); 
  const [showDisciplineStreakMessage, setShowDisciplineStreakMessage] = useState(false);
  const [performanceGoal, setPerformanceGoal] = useState<PerformanceGoal>({ target_monthly_r_multiple: 20 }); 
  const [goalInput, setGoalInput] = useState<string>(performanceGoal.target_monthly_r_multiple?.toString() || '');
  const [isEditingGoal, setIsEditingGoal] = useState(false);


  useEffect(() => {
    const storedGoal = localStorage.getItem('apex-performance-goal-rmultiple');
    if (storedGoal) {
      const parsedGoal = parseFloat(storedGoal);
      if (!isNaN(parsedGoal)) {
        setPerformanceGoal({ target_monthly_r_multiple: parsedGoal });
        setGoalInput(parsedGoal.toString());
      }
    }
  }, []);

  const handleSaveGoal = () => {
    const newTarget = parseFloat(goalInput);
    if (!isNaN(newTarget) && newTarget > 0) {
      setPerformanceGoal({ target_monthly_r_multiple: newTarget });
      localStorage.setItem('apex-performance-goal-rmultiple', newTarget.toString());
      setIsEditingGoal(false);
    } else {
      setGoalInput(performanceGoal.target_monthly_r_multiple?.toString() || ''); 
    }
  };


  useEffect(() => {
    const activeAccounts = getActiveAccounts();
    const options = activeAccounts.map(acc => ({ value: acc.id, label: acc.name }));
    setAvailableAccountsOptions([{ value: '', label: 'All Accounts' }, ...options]);
  }, [getActiveAccounts]);

  const filteredTrades = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0); 
    if (timeRange === 'Today') startDate = new Date(now.setHours(0,0,0,0));
    else if (timeRange === 'This Week') {
      const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startDate = new Date(firstDayOfWeek.setHours(0,0,0,0));
    }
    else if (timeRange === 'This Month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (timeRange === 'This Quarter') startDate = new Date(now.getFullYear(), Math.floor(now.getMonth()/3)*3, 1);
    else if (timeRange === 'This Year') startDate = new Date(now.getFullYear(), 0, 1);

    return trades.filter(trade => 
        (selectedAccountId === '' || trade.account_id === selectedAccountId) &&
        (new Date(trade.entry_timestamp) >= startDate)
    );
  }, [trades, selectedAccountId, timeRange]);

  useEffect(() => {
    const sortedTradesChronologically = [...filteredTrades].sort((a,b) => new Date(a.entry_timestamp).getTime() - new Date(b.entry_timestamp).getTime());
    const lastNTrades = sortedTradesChronologically.slice(-3); 
    if (lastNTrades.length === 3) {
        const streak = lastNTrades.every(trade => (trade.rule_adherence_score || 0) >= 9);
        setShowDisciplineStreakMessage(streak);
    } else {
        setShowDisciplineStreakMessage(false);
    }
  }, [filteredTrades]);


  const totalTrades = filteredTrades.length;
  const winningTrades = filteredTrades.filter(t => t.outcome === TradeOutcome.WIN).length;
  const losingTrades = filteredTrades.filter(t => t.outcome === TradeOutcome.LOSS).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  const totalR = filteredTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0);
  const avgR = totalTrades > 0 ? totalR / totalTrades : 0;

  const grossProfitR = filteredTrades.filter(t => t.outcome === TradeOutcome.WIN).reduce((sum, t) => sum + (t.r_multiple || 0), 0);
  const grossLossR = Math.abs(filteredTrades.filter(t => t.outcome === TradeOutcome.LOSS).reduce((sum, t) => sum + (t.r_multiple || 0), 0));
  const profitFactor = grossLossR > 0 ? grossProfitR / grossLossR : (grossProfitR > 0 ? Infinity : 0) ;

  const avgWinR = winningTrades > 0 ? grossProfitR / winningTrades : 0;
  const avgLossR = losingTrades > 0 ? grossLossR / losingTrades : 0; 
  const expectancy = totalTrades > 0 ? (winRate/100 * avgWinR) - ((losingTrades/totalTrades) * avgLossR) : 0;

  const [equityView, setEquityView] = useState<'currency' | 'r_multiple'>('r_multiple');
  const equityCurveData: EquityDataPoint[] = useMemo(() => {
    let cumulativeValue = 0;
    return filteredTrades
      .slice() 
      .sort((a,b) => new Date(a.entry_timestamp).getTime() - new Date(b.entry_timestamp).getTime())
      .map((trade, index) => {
      if (equityView === 'currency') {
        const mockAccountBalance = 100000; 
        const riskAmount = mockAccountBalance * (trade.risk_percentage / 100); 
        cumulativeValue += (trade.r_multiple || 0) * riskAmount;
      } else {
        cumulativeValue += trade.r_multiple || 0;
      }
      return {
        date: String(index + 1), 
        value: parseFloat(cumulativeValue.toFixed(2)),
      };
    });
  }, [filteredTrades, equityView]);
  
  const maxDrawdown = useMemo(() => calculateMaxDrawdown(equityCurveData), [equityCurveData]);
  const rollingProfitFactorData = useMemo(() => calculateRollingProfitFactor(filteredTrades, 20), [filteredTrades]);

  const outcomeDistributionData = [
    { name: 'Wins', value: winningTrades, color: '#10B981' },
    { name: 'Losses', value: losingTrades, color: '#EF4444' },
    { name: 'Breakeven', value: totalTrades - winningTrades - losingTrades, color: '#64748B' }, 
  ];

  const currentMonthTotalR = useMemo(() => {
    const now = new Date();
    const currentMonthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    return trades
        .filter(trade => 
            (selectedAccountId === '' || trade.account_id === selectedAccountId) &&
            new Date(trade.entry_timestamp) >= currentMonthStartDate
        )
        .reduce((sum, t) => sum + (t.r_multiple || 0), 0);
  }, [trades, selectedAccountId]);

  const totalCostOfDiscretion = filteredTrades.reduce((sum, t) => sum + (t.cost_of_discretion_r || 0), 0);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">Dashboard</h2>
        <div className="flex gap-2 items-center">
            <Select
                options={availableAccountsOptions}
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                wrapperClassName="mb-0 w-48"
                disabled={accountsLoading}
                placeholder={accountsLoading ? "Loading..." : "Select Account"}
            />
            <Select
                options={TIME_RANGES.map(range => ({ value: range, label: range }))}
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                wrapperClassName="mb-0 w-40"
            />
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">Quick Hub</h3>
            <Link to="/new-trade">
            <Button variant="primary" leftIcon={<ICONS.PLUS_CIRCLE className="w-5 h-5"/>}>
                Add New Trade
            </Button>
            </Link>
        </div>
      </Card>

      {showDisciplineStreakMessage && (
        <Card className="bg-success/10 border border-success/30">
          <div className="flex items-center gap-3">
            <ICONS.SPARKLES className="w-6 h-6 text-success" />
            <p className="text-sm font-medium text-success">
              Discipline Streak! Last 3 trades show excellent rule adherence (9+). Keep up the great work! 🎉
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <DashboardWidget 
            title="Total Trades" 
            value={totalTrades} 
            subValue={`${totalR.toFixed(2)}R Total`} 
            trend={totalTrades > 0 ? (totalR > 0 ? 'up' : 'down') : 'neutral'}
            onClick={() => navigate('/trades')} 
            metricIcon={<ICONS.TRADES_LIST className="w-4 h-4"/>}
            subValueClassName={getValueColorClasses(totalR)}
        />
        <DashboardWidget 
            title="Win Rate" 
            value={`${winRate.toFixed(1)}%`} 
            subValue={`${winningTrades} W / ${losingTrades} L`} 
            description={
              <span>
                Avg Win: <span className={getValueColorClasses(avgWinR)}>{avgWinR.toFixed(2)}R</span>
              </span>
            } 
            trend={winRate === 0 ? 'neutral' : winRate > 50 ? 'up' : winRate < 40 ? 'down' : 'neutral'}
            onClick={() => navigate('/trades', { state: { filterOutcome: TradeOutcome.WIN } })}
            tooltipText="Percentage of trades that were profitable."
            metricIcon={<ICONS.TARGET_ICON className="w-4 h-4" />}
            metricIconClassName={winRate === 0 ? 'text-light-text-secondary dark:text-dark-text-secondary' : winRate > 55 ? 'text-success' : winRate < 45 ? 'text-danger' : 'text-warning'}
            valueClassName={
                winRate === 0 
                ? 'text-light-text dark:text-dark-text' 
                : winRate > 55 
                    ? 'text-success' 
                    : winRate < 45 
                        ? 'text-danger' 
                        : 'text-warning'
            }
        />
        <DashboardWidget 
            title="Avg. R Multiple" 
            value={`${avgR.toFixed(2)}R`} 
            description={avgR > 0 ? 'Positive Expectation' : 'Negative Expectation'} 
            trend={avgR > 0.1 ? 'up' : avgR < -0.1 ? 'down' : 'neutral'} 
            tooltipText="Average R-Multiple per trade. (Total R) / (Total Trades). Positive values indicate profitability per trade on average."
            metricIcon={avgR > 0 ? <ICONS.ARROW_UP_TREND className="w-4 h-4"/> : <ICONS.ARROW_DOWN_TREND className="w-4 h-4"/>}
            metricIconClassName={avgR > 0 ? 'text-success' : 'text-danger'}
            valueClassName={getValueColorClasses(avgR)}
        />
        <DashboardWidget 
            title="Profit Factor" 
            value={isFinite(profitFactor) ? profitFactor.toFixed(2) : 'N/A'} 
            description={profitFactor === 0 || !isFinite(profitFactor) ? 'Neutral' : profitFactor > 1.75 ? 'Excellent' : profitFactor > 1 ? 'Good' : 'Needs Impr.'} 
            trend={profitFactor === 0 || !isFinite(profitFactor) ? 'neutral' : profitFactor > 1.5 ? 'up' : profitFactor < 1 ? 'down' : 'neutral'}
            tooltipText="Gross Profit (R) / Gross Loss (R). Measures how many times your profits exceed your losses. >1 is profitable."
            metricIcon={<ICONS.SCALE_ICON className="w-4 h-4" />}
            metricIconClassName={
                 !isFinite(profitFactor) || profitFactor === 0
                    ? 'text-light-text-secondary dark:text-dark-text-secondary'
                    : profitFactor >= 1.75 
                        ? 'text-success' 
                        : profitFactor >= 1 
                            ? 'text-warning' 
                            : 'text-danger'
            }
            valueClassName={
                !isFinite(profitFactor) || profitFactor === 0
                    ? 'text-light-text dark:text-dark-text'
                    : profitFactor >= 1.75
                        ? 'text-success'
                        : profitFactor >= 1
                            ? 'text-warning'
                            : 'text-danger'
            }
        />
        <DashboardWidget 
            title="Expectancy" 
            value={`${expectancy.toFixed(2)}R`} 
            description="Per trade avg outcome in R-units" 
            trend={expectancy > 0.1 ? 'up' : expectancy < 0 ? 'down' : 'neutral'}
            tooltipText="(Win Rate * Avg Win R) - (Loss Rate * Avg Loss R). The mathematical proof of your edge per trade."
            metricIcon={<ICONS.INSIGHTS className="w-4 h-4" />}
            metricIconClassName={expectancy > 0 ? 'text-success' : 'text-danger'}
            valueClassName={getValueColorClasses(expectancy)}
        />
        <DashboardWidget 
            title="Max Drawdown (R)" 
            value={`${maxDrawdown}%`} 
            description="From R-multiple curve peak" 
            trend={maxDrawdown > 20 ? 'down' : maxDrawdown < 10 ? 'up' : 'neutral'} 
            tooltipText="Largest peak-to-trough percentage decline in your R-Multiple equity curve. Measures strategy volatility."
            metricIcon={<ICONS.WARNING_ALT_ICON className="w-4 h-4" />}
            metricIconClassName={maxDrawdown > 20 ? 'text-danger' : maxDrawdown > 10 ? 'text-warning' : 'text-light-text-secondary dark:text-dark-text-secondary'}
            valueClassName={maxDrawdown > 20 ? 'text-danger' : maxDrawdown > 10 ? 'text-warning' : 'text-light-text dark:text-dark-text'}
        />
        <DashboardWidget 
            title="Cost of Discretion" 
            value={`${totalCostOfDiscretion.toFixed(2)}R`} 
            description="Total R from deviations" 
            // Negative cost is good (green), positive cost is bad (red)
            trend={totalCostOfDiscretion > 0.1 ? 'down' : totalCostOfDiscretion < -0.1 ? 'up' : 'neutral'}
            tooltipText="The cumulative R-multiple difference between your actual P&L and what your system's rules would have achieved. Negative is good (you outperformed or matched), positive means deviations cost you."
            metricIcon={<ICONS.WARNING_ALT_ICON className="w-4 h-4" />}
            metricIconClassName={totalCostOfDiscretion > 0 ? 'text-danger' : totalCostOfDiscretion < 0 ? 'text-success' : 'text-light-text-secondary dark:text-dark-text-secondary'}
            valueClassName={getValueColorClasses(totalCostOfDiscretion * -1)} // Multiply by -1 because negative cost is good
        />
        <Card title="Monthly R-Multiple Goal" className="xl:col-span-1">
          {isEditingGoal ? (
            <div className="space-y-2">
              <Input
                label="Set Target R for Current Month"
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                wrapperClassName="mb-2"
                min="0"
                step="1"
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSaveGoal}>Save</Button>
                <Button size="sm" variant="secondary" onClick={() => { setIsEditingGoal(false); setGoalInput(performanceGoal.target_monthly_r_multiple?.toString() || ''); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              <p className={`text-3xl font-semibold ${getValueColorClasses(currentMonthTotalR)}`}>
                {currentMonthTotalR.toFixed(2)}R
                <span className="text-lg text-light-text-secondary dark:text-dark-text-secondary"> / {performanceGoal.target_monthly_r_multiple || 'N/A'}R</span>
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Current Month Progress</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setIsEditingGoal(true)}>Set Goal</Button>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Equity Curve">
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">
                The R-Multiple curve is the truest measure of skill, independent of position sizing. Use it to analyze performance trends.
            </p>
            <div className="flex justify-end mb-4">
            <Button size="sm" variant={equityView === 'r_multiple' ? 'primary' : 'secondary'} onClick={() => setEquityView('r_multiple')} className="mr-2">R-Multiple</Button>
            <Button size="sm" variant={equityView === 'currency' ? 'primary' : 'secondary'} onClick={() => setEquityView('currency')}>Currency (Example)</Button>
            </div>
            <div className="h-96">
            {equityCurveData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityCurveData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="date" name="Trade #" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip
                    contentStyle={{ 
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF', 
                        borderColor: document.documentElement.classList.contains('dark') ? '#334155' : '#CBD5E1'
                    }}
                    itemStyle={{ color: document.documentElement.classList.contains('dark') ? '#E2E8F0' : '#1E293B' }}
                />
                <Legend wrapperStyle={{fontSize: "11px", paddingTop: "10px"}}/>
                <Line type="monotone" dataKey="value" name={`Equity (${equityView === 'r_multiple' ? 'R' : '$'})`} stroke={"#8B5CF6"} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} animationDuration={500} />
                </LineChart>
            </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Not enough data for equity curve.</p>
                </div>
            )}
            </div>
        </Card>
         <Card title="Rolling Profit Factor (Last 20 Trades)">
            <div className="h-96">
            {rollingProfitFactorData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rollingProfitFactorData}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="trade_count" name="Trade #" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
                    <Tooltip
                        contentStyle={{ 
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF', 
                            borderColor: document.documentElement.classList.contains('dark') ? '#334155' : '#CBD5E1'
                        }}
                        itemStyle={{ color: document.documentElement.classList.contains('dark') ? '#E2E8F0' : '#1E293B' }}
                    />
                    <Legend wrapperStyle={{fontSize: "11px", paddingTop: "10px"}}/>
                    <Line type="monotone" dataKey="value" name="Profit Factor" stroke={"#10B981"} strokeWidth={2} dot={{r:2}} activeDot={{r:5}} animationDuration={500}/>
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Not enough data for rolling profit factor (min. 20 trades).</p>
                </div>
            )}
            </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Trade Outcomes">
            <div className="h-72">
            {totalTrades > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={outcomeDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80} 
                    fill="#8B5CF6" // Primary color
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    fontSize={10}
                >
                    {outcomeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF', 
                        borderColor: document.documentElement.classList.contains('dark') ? '#334155' : '#CBD5E1'
                    }}
                />
                <Legend wrapperStyle={{fontSize: "11px", paddingTop: "10px"}} iconSize={8}/>
                </PieChart>
            </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">No trade data.</p>
                </div>
            )}
            </div>
        </Card>
        <Card title="R-Multiple Distribution">
            <div className="h-72">
            {filteredTrades.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredTrades.map(t => ({ name: t.asset.substring(0,5), r_multiple: t.r_multiple || 0}))}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                <XAxis dataKey="name"  tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50}/>
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF', 
                        borderColor: document.documentElement.classList.contains('dark') ? '#334155' : '#CBD5E1'
                    }}
                 />
                <Bar dataKey="r_multiple" name="R-Multiple" animationDuration={500}>
                    {filteredTrades.map((trade, index) => (
                        <Cell key={`cell-${index}`} fill={ (trade.r_multiple || 0) >= 0 ? '#10B981' : '#EF4444'} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">No trade data.</p>
                </div>
            )}
            </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;