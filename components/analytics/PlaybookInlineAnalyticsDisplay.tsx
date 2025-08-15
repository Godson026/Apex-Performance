

import React, { useMemo } from 'react';
import Card from '../ui/Card';
import { 
    Playbook, Trade, TradeOutcome, MarketEnvironment, TradingSession, 
    PerformanceMetrics, TradeDurationDetails, EmotionalState,
    PlaybookPsychologicalProfile, PlaybookEnvPerformance, RollingPerformanceDataPoint
} from '../../types';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { ICONS, getValueColorClasses } from '../../constants';
import { MARKET_ENVIRONMENT_OPTIONS, TRADING_SESSION_OPTIONS } from '../../constants';


// --- Performance Metrics Calculation ---
const calculatePlaybookPerformanceMetrics = (trades: Trade[]): PerformanceMetrics & { playbook_expectancy_r?: number } => {
    const total_trades = trades.length;
    if (total_trades === 0) {
        return { 
            total_trades: 0, win_rate: 0, loss_rate: 0, breakeven_rate: 0, avg_r: 0, total_r: 0, profit_factor: 0, expectancy: 0,
            avg_win_r: 0, avg_loss_r: 0, gross_profit_r: 0, gross_loss_r: 0, max_drawdown_r: 0, longest_win_streak: 0, longest_loss_streak: 0,
            avg_rule_adherence: 0, avg_exit_efficiency: 0, playbook_expectancy_r: 0
        };
    }

    const winningTrades = trades.filter(t => t.outcome === TradeOutcome.WIN);
    const losingTrades = trades.filter(t => t.outcome === TradeOutcome.LOSS);
    
    const win_rate = (winningTrades.length / total_trades) * 100;
    const loss_rate = (losingTrades.length / total_trades) * 100;
    const breakeven_rate = 100 - win_rate - loss_rate;

    const total_r = trades.reduce((sum, t) => sum + (t.r_multiple || 0), 0);
    const avg_r = total_r / total_trades;

    const gross_profit_r = winningTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0);
    const gross_loss_r = Math.abs(losingTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0));
    const profit_factor = gross_loss_r > 0 ? gross_profit_r / gross_loss_r : (gross_profit_r > 0 ? Infinity : 0);

    const avg_win_r = winningTrades.length > 0 ? gross_profit_r / winningTrades.length : 0;
    const avg_loss_r = losingTrades.length > 0 ? gross_loss_r / losingTrades.length : 0;
    // This is the generic expectancy, we'll calculate specific playbook expectancy below
    const expectancy = (win_rate / 100 * avg_win_r) - (loss_rate / 100 * avg_loss_r); 
    
    const playbook_expectancy_r = expectancy; // Same calculation for this context

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

    let longest_win_streak = 0, currentWinStreak = 0, longest_loss_streak = 0, currentLossStreak = 0;
    trades.slice().sort((a,b) => new Date(a.entry_timestamp).getTime() - new Date(b.entry_timestamp).getTime())
      .forEach(trade => {
        if (trade.outcome === TradeOutcome.WIN) { currentWinStreak++; currentLossStreak = 0; if (currentWinStreak > longest_win_streak) longest_win_streak = currentWinStreak;}
        else if (trade.outcome === TradeOutcome.LOSS) { currentLossStreak++; currentWinStreak = 0; if (currentLossStreak > longest_loss_streak) longest_loss_streak = currentLossStreak;}
        else { currentWinStreak = 0; currentLossStreak = 0; }
    });
    
    const ruleAdherenceScores = trades.map(t => t.rule_adherence_score).filter(s => s !== undefined) as number[];
    const avg_rule_adherence = ruleAdherenceScores.length > 0 ? ruleAdherenceScores.reduce((a,b) => a+b, 0) / ruleAdherenceScores.length : 0;

    const winningTradesWithMFE = winningTrades.filter(t => t.mfe !== undefined && t.mfe > 0 && t.r_multiple !== undefined);
    const exitEfficiencies = winningTradesWithMFE.map(t => ((t.r_multiple! / t.mfe!) * 100));
    const avg_exit_efficiency = exitEfficiencies.length > 0 ? exitEfficiencies.reduce((a,b) => a+b, 0) / exitEfficiencies.length : 0;

    return { 
        total_trades, win_rate, loss_rate, breakeven_rate, avg_r, total_r, profit_factor, expectancy, 
        avg_win_r, avg_loss_r, gross_profit_r, gross_loss_r, max_drawdown_r, longest_win_streak, longest_loss_streak, 
        avg_rule_adherence, avg_exit_efficiency, playbook_expectancy_r
    };
};

const formatDuration = (ms: number | undefined): string => {
    if (ms === undefined || ms < 0 || isNaN(ms)) return 'N/A';
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    hours = hours % 24;
    minutes = minutes % 60;
    seconds = seconds % 60;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    if (seconds >= 0) return `${seconds}s`; 
    return '0s';
};

const calculateTradeDurationDetails = (trades: Trade[]): TradeDurationDetails => {
    const durationsMs = trades.map(t => t.trade_duration_ms).filter(d => d !== undefined && d >= 0) as number[];
    if (durationsMs.length === 0) return { avg_ms: 0, min_ms: 0, max_ms: 0, avg_formatted: 'N/A', min_formatted: 'N/A', max_formatted: 'N/A' };
    
    const avg_ms = durationsMs.reduce((sum, d) => sum + d, 0) / durationsMs.length;
    const min_ms = Math.min(...durationsMs);
    const max_ms = Math.max(...durationsMs);

    return {
        avg_ms, min_ms, max_ms,
        avg_formatted: formatDuration(avg_ms),
        min_formatted: formatDuration(min_ms),
        max_formatted: formatDuration(max_ms),
    };
};

const calculateRollingMetric = (
    trades: Trade[], 
    windowSize: number, 
    metricCalculator: (windowTrades: Trade[]) => number | undefined
): RollingPerformanceDataPoint[] => {
    const sortedTrades = [...trades].sort((a, b) => new Date(a.entry_timestamp).getTime() - new Date(b.entry_timestamp).getTime());
    const rollingData: RollingPerformanceDataPoint[] = [];

    if (sortedTrades.length === 0) return [];
    
    // Calculate for the whole set if less than windowSize
    if (sortedTrades.length < windowSize && sortedTrades.length > 0) {
        const metric = metricCalculator(sortedTrades);
        if (metric !== undefined) {
             rollingData.push({ trade_count: sortedTrades.length, value: isFinite(metric) ? metric : (metric > 0 ? 50 : 0) }); // Use 50 for Infinity for PF
        }
        return rollingData;
    }
    
    if (sortedTrades.length < windowSize) return []; // Not enough data for a single window

    for (let i = 0; i <= sortedTrades.length - windowSize; i++) {
        const windowTrades = sortedTrades.slice(i, i + windowSize);
        const metric = metricCalculator(windowTrades);
        if (metric !== undefined) {
            rollingData.push({ trade_count: i + windowSize, value: isFinite(metric) ? parseFloat(metric.toFixed(2)) : (metric > 0 ? 50 : 0) });
        }
    }
    return rollingData;
};


interface PlaybookInlineAnalyticsDisplayProps {
  playbook: Playbook;
  allTrades: Trade[];
}

const PlaybookInlineAnalyticsDisplay: React.FC<PlaybookInlineAnalyticsDisplayProps> = ({ playbook, allTrades }) => {
  const playbookTrades = useMemo(() => {
    return allTrades.filter(trade => trade.playbook_id === playbook.id);
  }, [playbook.id, allTrades]);

  const performance = useMemo(() => calculatePlaybookPerformanceMetrics(playbookTrades), [playbookTrades]);
  const tradeDurations = useMemo(() => calculateTradeDurationDetails(playbookTrades), [playbookTrades]);

  const advancedAnalytics = useMemo(() => {
    if (playbookTrades.length === 0) {
      return {
        avgMFE: 0, avgMAE: 0, psychologicalProfile: { common_moods: [], common_mistakes: [] },
        performanceByMarketEnv: [], performanceBySession: [], rollingExpectancy: [],
      };
    }
    
    const tradesWithMfe = playbookTrades.filter(t => typeof t.mfe === 'number');
    const avgMFE = tradesWithMfe.length > 0 ? tradesWithMfe.reduce((sum, t) => sum + (t.mfe || 0), 0) / tradesWithMfe.length : 0;
    
    const tradesWithMae = playbookTrades.filter(t => typeof t.mae === 'number');
    const avgMAE = tradesWithMae.length > 0 ? tradesWithMae.reduce((sum, t) => sum + (t.mae || 0), 0) / tradesWithMae.length : 0;

    const moodCounts: { [key in EmotionalState]?: number } = {};
    const mistakeCounts: { [key: string]: number } = {};
    playbookTrades.forEach(t => {
      if (t.emotion_pre_trade) moodCounts[t.emotion_pre_trade] = (moodCounts[t.emotion_pre_trade] || 0) + 1;
      if (t.mistake_rule_broken) mistakeCounts[t.mistake_rule_broken] = (mistakeCounts[t.mistake_rule_broken] || 0) + 1;
    });
    const psychologicalProfile: PlaybookPsychologicalProfile = {
      common_moods: Object.entries(moodCounts).map(([mood, count]) => ({ mood: mood as EmotionalState, count })).sort((a,b) => b.count - a.count).slice(0,3),
      common_mistakes: Object.entries(mistakeCounts).map(([mistake, count]) => ({ mistake, count })).sort((a,b) => b.count - a.count).slice(0,3),
    };

    const calculateEnvPerf = (trades: Trade[], key: keyof Trade, options: readonly string[]): PlaybookEnvPerformance[] => {
      return options.map(optionValue => {
        const tradesInEnv = trades.filter(t => t[key] === optionValue);
        const metrics = calculatePlaybookPerformanceMetrics(tradesInEnv);
        return {
          environment: optionValue as MarketEnvironment | TradingSession,
          profit_factor: isFinite(metrics.profit_factor) ? metrics.profit_factor : 0,
          expectancy: metrics.playbook_expectancy_r || 0,
          trade_count: metrics.total_trades,
          avg_r: metrics.avg_r,
          win_rate: metrics.win_rate,
        };
      }).filter(item => item.trade_count > 0);
    };
    
    const performanceByMarketEnv = calculateEnvPerf(playbookTrades, 'market_environment', MARKET_ENVIRONMENT_OPTIONS);
    const performanceBySession = calculateEnvPerf(playbookTrades, 'time_of_day_session', TRADING_SESSION_OPTIONS);
    
    const rollingExpectancy = calculateRollingMetric(playbookTrades, 10, (tradesWindow) => calculatePlaybookPerformanceMetrics(tradesWindow).playbook_expectancy_r);

    return { avgMFE, avgMAE, psychologicalProfile, performanceByMarketEnv, performanceBySession, rollingExpectancy };
  }, [playbookTrades]);

  const MetricDisplay: React.FC<{
    label: string; value: string | number; unit?: string; description?: string;
    icon?: React.ReactNode; iconClassName?: string; explicitValueClassName?: string;
  }> = ({label, value, unit, description, icon, iconClassName, explicitValueClassName}) => (
    <div className="text-center p-2 bg-slate-100 dark:bg-dark-card rounded-lg shadow-sm h-full flex flex-col justify-center">
        <div>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase flex items-center justify-center">
              {icon && <span className={`mr-1 ${iconClassName || ''}`}>{icon}</span>}
              {label}
            </p>
            <p className={`text-lg font-semibold ${explicitValueClassName || getValueColorClasses(value)}`}>{typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : value}{unit || ''}</p>
        </div>
        {description && <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">{description}</p>}
    </div>
  );

  const ChartCard: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({title, children, className}) => (
    <Card title={title} className={`bg-light-card dark:bg-dark-card ${className || ''}`}>
      <div className="h-72">{children}</div>
    </Card>
  );

  return (
    <Card className="mt-1 border-t-2 border-primary-DEFAULT dark:border-primary-light bg-slate-50 dark:bg-slate-800/30" title={`Analytics Details: ${playbook.name}`}>
      <div className="space-y-6">
        {playbookTrades.length === 0 ? (
          <p className="text-center text-light-text-secondary dark:text-dark-text-secondary py-8">No trades found for this playbook.</p>
        ) : (
          <>
            {/* A. Core Playbook Performance Metrics */}
            <Card title="Core Performance Metrics" className="bg-light-card dark:bg-dark-card">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <MetricDisplay label="Playbook Expectancy" value={performance.playbook_expectancy_r || 0} unit="R" 
                    icon={<ICONS.INSIGHTS className="w-3 h-3"/>}
                    explicitValueClassName={getValueColorClasses(performance.playbook_expectancy_r)}
                />
                <MetricDisplay label="Profit Factor" value={isFinite(performance.profit_factor) ? performance.profit_factor : 'N/A'} 
                    icon={<ICONS.SCALE_ICON className="w-3 h-3"/>}
                    explicitValueClassName={performance.profit_factor >= 1.75 ? 'text-success' : performance.profit_factor >=1 ? 'text-warning' : 'text-danger'}
                />
                <MetricDisplay label="Adherence Score" value={performance.avg_rule_adherence || 0} unit="/10" 
                    icon={<ICONS.TARGET_ICON className="w-3 h-3"/>}
                    explicitValueClassName={(performance.avg_rule_adherence || 0) >= 8 ? 'text-success' : (performance.avg_rule_adherence || 0) >= 5 ? 'text-warning' : 'text-danger'}
                />
                <MetricDisplay label="Trade Frequency" value={performance.total_trades} unit=" trades"
                    icon={<ICONS.TRADES_LIST className="w-3 h-3"/>}
                />
                <MetricDisplay label="Avg. Holding Time" value={tradeDurations.avg_formatted} />
              </div>
            </Card>

            {/* B. Advanced Playbook "Deep Dive" Analytics */}
            <Card title="MFE/MAE Optimization" className="bg-light-card dark:bg-dark-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <MetricDisplay label="Avg. MFE" value={advancedAnalytics.avgMFE} unit="R" explicitValueClassName={getValueColorClasses(advancedAnalytics.avgMFE)} />
                    <MetricDisplay label="Avg. MAE" value={advancedAnalytics.avgMAE} unit="R" explicitValueClassName={getValueColorClasses(advancedAnalytics.avgMAE * -1)} />
                </div>
                 <p className="text-xs text-center mt-3 text-light-text-secondary dark:text-dark-text-secondary">
                    Use MFE (Max Favorable Excursion) to assess if targets are optimal. Use MAE (Max Adverse Excursion) to fine-tune stop-loss placement for this playbook.
                 </p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Performance by Market Environment (Profit Factor)">
                    {advancedAnalytics.performanceByMarketEnv.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={advancedAnalytics.performanceByMarketEnv} layout="vertical" margin={{left:100, right:20}}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                                <XAxis type="number" tick={{fontSize:10}} domain={[0, 'auto']}/>
                                <YAxis dataKey="environment" type="category" tick={{fontSize:9}} width={100} interval={0}/>
                                <Tooltip formatter={(value) => (value as number).toFixed(2)}/>
                                <Legend iconSize={10} wrapperStyle={{fontSize:"11px"}}/>
                                <Bar dataKey="profit_factor" name="Profit Factor" fill="#8884d8" barSize={15}/>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary text-xs">No data by environment.</p>}
                </ChartCard>
                 <ChartCard title="Performance by Session (Expectancy R)">
                     {advancedAnalytics.performanceBySession.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={advancedAnalytics.performanceBySession} layout="vertical" margin={{left:100, right:20}}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                                <XAxis type="number" tick={{fontSize:10}} domain={['auto', 'auto']}/>
                                <YAxis dataKey="environment" type="category" tick={{fontSize:9}} width={100} interval={0}/>
                                <Tooltip formatter={(value) => `${(value as number).toFixed(2)}R`}/>
                                <Legend iconSize={10} wrapperStyle={{fontSize:"11px"}}/>
                                <Bar dataKey="expectancy" name="Expectancy (R)" barSize={15}>
                                    {advancedAnalytics.performanceBySession.map(entry => <Cell key={entry.environment} fill={entry.expectancy >=0 ? '#10B981':'#EF4444'}/>)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary text-xs">No data by session.</p>}
                </ChartCard>
            </div>
            
            <Card title="Psychological Profile" className="bg-light-card dark:bg-dark-card">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-semibold mb-1 text-light-text dark:text-dark-text">Common Moods (Pre-Trade):</h4>
                        {advancedAnalytics.psychologicalProfile.common_moods.length > 0 ? (
                            <ul className="list-disc list-inside text-xs text-light-text dark:text-dark-text">{advancedAnalytics.psychologicalProfile.common_moods.map(m => <li key={m.mood}>{m.mood}: {m.count}</li>)}</ul>
                        ) : <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">No mood data.</p>}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-1 text-light-text dark:text-dark-text">Common Mistakes:</h4>
                        {advancedAnalytics.psychologicalProfile.common_mistakes.length > 0 ? (
                            <ul className="list-disc list-inside text-xs text-light-text dark:text-dark-text">{advancedAnalytics.psychologicalProfile.common_mistakes.map(m => <li key={m.mistake}>{m.mistake}: {m.count}</li>)}</ul>
                        ) : <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">No mistake data.</p>}
                    </div>
                 </div>
            </Card>

            <ChartCard title="Rolling Expectancy Curve (Last 10 Trades Window)">
                {advancedAnalytics.rollingExpectancy.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={advancedAnalytics.rollingExpectancy}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                            <XAxis dataKey="trade_count" name="Trade #" tick={{fontSize:10}}/>
                            <YAxis tick={{fontSize:10}} domain={['auto', 'auto']} label={{ value: 'Expectancy (R)', angle: -90, position: 'insideLeft', fontSize: 10, offset: -2 }}/>
                            <Tooltip formatter={(value) => `${(value as number).toFixed(2)}R`}/>
                            <Legend iconSize={10} wrapperStyle={{fontSize:"11px"}}/>
                            <Line type="monotone" dataKey="value" name="Rolling Expectancy" stroke="#0EA5E9" strokeWidth={2} dot={{r:2}} activeDot={{r:4}}/>
                        </LineChart>
                    </ResponsiveContainer>
                ) : <p className="flex items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary text-xs">Not enough data for rolling expectancy.</p>}
            </ChartCard>
            
             <p className="text-xs text-center mt-4 text-light-text-secondary dark:text-dark-text-secondary">
                Additional analytics like Performance by Asset, Day of Week, and more detailed Mistake Trends for this playbook can be explored in the main Insights page with filters.
            </p>
          </>
        )}
      </div>
    </Card>
  );
};

export default PlaybookInlineAnalyticsDisplay;
