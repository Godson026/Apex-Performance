
import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useTrades } from '../hooks/useTrades';
import { useAccounts } from '../hooks/useAccounts';
import { usePlaybooks } from '../hooks/usePlaybooks';
import {
    Trade, TradeOutcome, EmotionalState, ReasonForExit, Playbook,
    MarketEnvironment, TradingSession, PerformanceMetrics
} from '../types';
import { TIME_RANGES, EMOTIONAL_STATE_OPTIONS, REASON_FOR_EXIT_OPTIONS, MARKET_ENVIRONMENT_OPTIONS, TRADING_SESSION_OPTIONS, DAYS_OF_WEEK, getValueColorClasses, ICONS } from '../constants';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const calculatePerformanceMetrics = (trades: Trade[]): PerformanceMetrics => {
    const total_trades = trades.length;
    if (total_trades === 0) {
        return {
            total_trades: 0, win_rate: 0, loss_rate: 0, breakeven_rate: 0, avg_r: 0, total_r: 0, profit_factor: 0, expectancy: 0,
            avg_win_r: 0, avg_loss_r: 0, gross_profit_r: 0, gross_loss_r: 0, max_drawdown_r: 0, longest_win_streak: 0, longest_loss_streak: 0,
            avg_rule_adherence: 0, avg_exit_efficiency: 0,
        };
    }

    const winningTrades = trades.filter(t => t.outcome === TradeOutcome.WIN);
    const losingTrades = trades.filter(t => t.outcome === TradeOutcome.LOSS);
    const breakevenTrades = trades.filter(t => t.outcome === TradeOutcome.BREAKEVEN);

    const win_rate = (winningTrades.length / total_trades) * 100;
    const loss_rate = (losingTrades.length / total_trades) * 100;
    const breakeven_rate = (breakevenTrades.length / total_trades) * 100;

    const total_r = trades.reduce((sum, t) => sum + (t.r_multiple || 0), 0);
    const avg_r = total_trades > 0 ? total_r / total_trades : 0;

    const gross_profit_r = winningTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0);
    const gross_loss_r = Math.abs(losingTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0));
    const profit_factor = gross_loss_r > 0 ? gross_profit_r / gross_loss_r : (gross_profit_r > 0 ? Infinity : 0);

    const avg_win_r = winningTrades.length > 0 ? gross_profit_r / winningTrades.length : 0;
    const avg_loss_r = losingTrades.length > 0 ? gross_loss_r / losingTrades.length : 0;
    const expectancy = total_trades > 0 ? (win_rate / 100 * avg_win_r) - (loss_rate / 100 * avg_loss_r) : 0;

    let cumulativeR = 0;
    let peakR = 0;
    let max_drawdown_r = 0;
    trades.slice().sort((a, b) => new Date(a.entry_timestamp).getTime() - new Date(b.entry_timestamp).getTime())
        .forEach(trade => {
            cumulativeR += trade.r_multiple || 0;
            if (cumulativeR > peakR) peakR = cumulativeR;
            const drawdown = peakR > 0 ? ((peakR - cumulativeR) / peakR) * 100 : 0;
            if (drawdown > max_drawdown_r) max_drawdown_r = drawdown;
        });

    let longest_win_streak = 0, currentWinStreak = 0, longest_loss_streak = 0, currentLossStreak = 0;
    trades.slice().sort((a, b) => new Date(a.entry_timestamp).getTime() - new Date(b.entry_timestamp).getTime())
        .forEach(trade => {
            if (trade.outcome === TradeOutcome.WIN) { currentWinStreak++; currentLossStreak = 0; if (currentWinStreak > longest_win_streak) longest_win_streak = currentWinStreak; }
            else if (trade.outcome === TradeOutcome.LOSS) { currentLossStreak++; currentWinStreak = 0; if (currentLossStreak > longest_loss_streak) longest_loss_streak = currentLossStreak; }
            else { currentWinStreak = 0; currentLossStreak = 0; }
        });

    const ruleAdherenceScores = trades.map(t => t.rule_adherence_score).filter(s => s !== undefined) as number[];
    const avg_rule_adherence = ruleAdherenceScores.length > 0 ? ruleAdherenceScores.reduce((a, b) => a + b, 0) / ruleAdherenceScores.length : 0;

    const winningTradesWithMFE = winningTrades.filter(t => t.mfe !== undefined && t.mfe > 0 && t.r_multiple !== undefined && t.r_multiple > 0);
    const exitEfficiencies = winningTradesWithMFE.map(t => ((t.r_multiple! / t.mfe!) * 100));
    const avg_exit_efficiency = exitEfficiencies.length > 0 ? exitEfficiencies.reduce((a, b) => a + b, 0) / exitEfficiencies.length : 0;

    return {
        total_trades, win_rate, loss_rate, breakeven_rate, avg_r, total_r, profit_factor, expectancy,
        avg_win_r, avg_loss_r, gross_profit_r, gross_loss_r, max_drawdown_r, longest_win_streak, longest_loss_streak,
        avg_rule_adherence, avg_exit_efficiency,
    };
};

const KeyMetricCard: React.FC<{ title: string; value: string | number; unit?: string; icon?: React.ReactNode; trend?: 'up' | 'down' | 'neutral', explicitValueClassName?: string }> = ({ title, value, unit, icon, trend, explicitValueClassName }) => {
    const trendColor = trend === 'up' 
        ? 'text-success' 
        : trend === 'down' 
        ? 'text-danger'
        : 'text-light-text-secondary dark:text-dark-text-secondary';
    const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';
    return (
        <Card className="text-center">
            <div className="flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary text-sm mb-1">
                {icon && <span className="mr-2">{icon}</span>}
                {title}
            </div>
            <p className={`text-2xl font-semibold ${explicitValueClassName || getValueColorClasses(value)}`}>{value}{unit && <span className="text-lg">{unit}</span>}</p>
            {trend && <p className={`text-xs ${trendColor}`}>{trendIcon}</p>}
        </Card>
    );
};

const getHeatmapColor = (value: number, minR: number, maxR: number): string => {
    if (value === 0) return 'bg-slate-100 dark:bg-slate-800/30'; 
    
    const range = Math.max(Math.abs(minR), Math.abs(maxR));
    if (range === 0) return 'bg-slate-100 dark:bg-slate-800/30';

    const intensity = Math.min(Math.abs(value) / (range * 0.75), 1); 

    if (value > 0) { 
        if (intensity > 0.8) return 'bg-emerald-500/70 dark:bg-emerald-600/60';
        if (intensity > 0.5) return 'bg-emerald-400/60 dark:bg-emerald-500/50';
        if (intensity > 0.2) return 'bg-emerald-300/50 dark:bg-emerald-400/40';
        return 'bg-emerald-200/40 dark:bg-emerald-300/30';
    } else { // value < 0
        if (intensity > 0.8) return 'bg-red-500/70 dark:bg-red-600/60';
        if (intensity > 0.5) return 'bg-red-400/60 dark:bg-red-500/50';
        if (intensity > 0.2) return 'bg-red-300/50 dark:bg-red-400/40';
        return 'bg-red-200/40 dark:bg-red-300/30';
    }
};

const InsightsPage: React.FC = () => {
    const { trades, isLoading: tradesLoading } = useTrades();
    const { getActiveAccounts, isLoading: accountsLoading } = useAccounts();
    const { getPlaybooks, isLoading: playbooksLoading } = usePlaybooks();

    const [timeRange, setTimeRange] = useState<string>(TIME_RANGES[5]); // 'All Time'
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>('');

    const [aiInsight, setAiInsight] = useState<string>('');
    const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
    
    const availableAccountsOptions = useMemo(() => {
        const activeAccounts = getActiveAccounts();
        return [{ value: '', label: 'All Accounts' }, ...activeAccounts.map(acc => ({ value: acc.id, label: acc.name }))];
    }, [getActiveAccounts]);

    const availablePlaybooksOptions = useMemo(() => {
        const playbooks = getPlaybooks();
        return [{ value: '', label: 'All Playbooks' }, ...playbooks.map(pb => ({ value: pb.id, label: pb.name }))];
    }, [getPlaybooks]);

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
            (selectedPlaybookId === '' || trade.playbook_id === selectedPlaybookId) &&
            (new Date(trade.entry_timestamp) >= startDate)
        );
    }, [trades, selectedAccountId, selectedPlaybookId, timeRange]);

    const metrics = useMemo(() => calculatePerformanceMetrics(filteredTrades), [filteredTrades]);
    
    const performanceByDay = useMemo(() => {
        const data: { [key: string]: { totalR: number; count: number } } = {};
        DAYS_OF_WEEK.forEach(day => data[day] = { totalR: 0, count: 0 });
        filteredTrades.forEach(trade => {
            const dayOfWeek = DAYS_OF_WEEK[new Date(trade.entry_timestamp).getDay()];
            data[dayOfWeek].totalR += trade.r_multiple || 0;
            data[dayOfWeek].count++;
        });
        return DAYS_OF_WEEK.map(day => ({
            name: day,
            avgR: data[day].count > 0 ? data[day].totalR / data[day].count : 0,
            tradeCount: data[day].count,
        }));
    }, [filteredTrades]);

    const performanceByEmotion = useMemo(() => {
        const data: { [key: string]: { totalR: number, count: number } } = {};
        EMOTIONAL_STATE_OPTIONS.forEach(e => data[e] = { totalR: 0, count: 0});
        filteredTrades.forEach(t => {
            if(t.emotion_pre_trade){
                data[t.emotion_pre_trade].totalR += t.r_multiple || 0;
                data[t.emotion_pre_trade].count++;
            }
        });
        return Object.entries(data).filter(([,val]) => val.count > 0).map(([name, val]) => ({
            name,
            avgR: val.count > 0 ? val.totalR / val.count : 0
        }));
    }, [filteredTrades]);

    const handleGenerateInsight = async () => {
        if (!metrics || metrics.total_trades === 0) {
            setAiInsight(JSON.stringify({ error: "Not enough trade data to generate insights." }));
            return;
        }
        setIsGeneratingInsight(true);
        setAiInsight('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const prompt = `You are a professional trading coach. Based on the following performance metrics, identify the top 3 areas for improvement. For each area, provide one specific, actionable suggestion. Metrics: ${JSON.stringify(metrics, null, 2)}`;
            
            const schema = {
                type: Type.OBJECT,
                properties: {
                    insights: {
                        type: Type.ARRAY,
                        description: "A list of actionable insights.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                area: { type: Type.STRING, description: "The area of improvement (e.g., 'Risk Management')." },
                                suggestion: { type: Type.STRING, description: "A concise, actionable suggestion." }
                            },
                            required: ["area", "suggestion"]
                        }
                    }
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.5,
                }
            });

            const text = response.text;
            if (text) {
                setAiInsight(text);
            }

        } catch(err: any) {
            console.error(err);
            setAiInsight(JSON.stringify({ error: `Failed to generate insights: ${err.message}` }));
        } finally {
            setIsGeneratingInsight(false);
        }
    };

    const parsedInsights = useMemo(() => {
        if (!aiInsight) return null;
        try {
            const data = JSON.parse(aiInsight);
            if(data.error) return { error: data.error };
            if(data.insights && Array.isArray(data.insights)) return data.insights;
            return null;
        } catch(e) {
            return { error: "Failed to parse AI response." };
        }
    }, [aiInsight]);
    
    const isLoading = tradesLoading || accountsLoading || playbooksLoading;

    if (isLoading) {
      return <div className="flex h-64 items-center justify-center"><Spinner size="lg"/></div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">Performance Insights</h2>
            
            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 items-end">
                    <Select label="Time Range" options={TIME_RANGES.map(r => ({value: r, label: r}))} value={timeRange} onChange={e => setTimeRange(e.target.value)} wrapperClassName="mb-0"/>
                    <Select label="Account" options={availableAccountsOptions} value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} wrapperClassName="mb-0" disabled={accountsLoading}/>
                    <Select label="Playbook" options={availablePlaybooksOptions} value={selectedPlaybookId} onChange={e => setSelectedPlaybookId(e.target.value)} wrapperClassName="mb-0" disabled={playbooksLoading}/>
                </div>
            </Card>

            {filteredTrades.length > 0 ? (
            <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <KeyMetricCard title="Win Rate" value={`${metrics.win_rate.toFixed(1)}`} unit="%" trend={metrics.win_rate > 55 ? 'up' : metrics.win_rate < 45 ? 'down' : 'neutral'} explicitValueClassName={metrics.win_rate >= 55 ? 'text-success' : metrics.win_rate >=45 ? 'text-warning':'text-danger'}/>
                    <KeyMetricCard title="Profit Factor" value={isFinite(metrics.profit_factor) ? metrics.profit_factor.toFixed(2) : 'N/A'} trend={metrics.profit_factor > 1.75 ? 'up' : metrics.profit_factor < 1 ? 'down' : 'neutral'} explicitValueClassName={metrics.profit_factor >= 1.75 ? 'text-success' : metrics.profit_factor >=1 ? 'text-warning':'text-danger'}/>
                    <KeyMetricCard title="Expectancy" value={`${metrics.expectancy.toFixed(2)}`} unit="R" trend={metrics.expectancy > 0 ? 'up' : 'down'} />
                    <KeyMetricCard title="Total R" value={`${metrics.total_r.toFixed(2)}`} unit="R" trend={metrics.total_r > 0 ? 'up' : 'down'} />
                    <KeyMetricCard title="Trades" value={metrics.total_trades}/>
                </div>
                
                <Card title="AI Performance Coach" titleAction={
                    <Button onClick={handleGenerateInsight} isLoading={isGeneratingInsight} disabled={isGeneratingInsight} size="sm" leftIcon={<ICONS.SPARKLES className="w-4 h-4" />}>
                        {isGeneratingInsight ? 'Analyzing...' : 'Get Insights'}
                    </Button>}>
                    {isGeneratingInsight && <div className="flex justify-center py-4"><Spinner /></div>}
                    {!isGeneratingInsight && parsedInsights && (
                        Array.isArray(parsedInsights) ? (
                            <ul className="space-y-3">
                                {parsedInsights.map((insight, index) => (
                                    <li key={index} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-light-border dark:border-dark-border">
                                        <h4 className="font-semibold text-primary-dark dark:text-primary-light">{insight.area}</h4>
                                        <p className="text-sm text-light-text dark:text-dark-text">{insight.suggestion}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-danger text-sm">{parsedInsights.error}</p>
                        )
                    )}
                     {!isGeneratingInsight && !parsedInsights && (
                        <p className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary py-4">Click "Get Insights" for an AI-powered analysis of your filtered trade data.</p>
                    )}
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Avg. R-Multiple by Day of Week">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={performanceByDay}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                                <XAxis dataKey="name" tick={{fontSize: 12}}/>
                                <YAxis tick={{fontSize: 10}}/>
                                <Tooltip />
                                <Bar dataKey="avgR" name="Avg R">
                                    {performanceByDay.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.avgR >= 0 ? '#10B981' : '#EF4444'} />))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card title="Avg. R-Multiple by Emotion (Pre-Trade)">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={performanceByEmotion} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                                <XAxis type="number" tick={{fontSize: 10}}/>
                                <YAxis dataKey="name" type="category" tick={{fontSize: 9}} width={80}/>
                                <Tooltip />
                                <Bar dataKey="avgR" name="Avg R">
                                   {performanceByEmotion.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.avgR >= 0 ? '#8884d8' : '#e57373'} />))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            </>
            ) : (
                <Card className="text-center py-12">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">No trades found for the selected filters. Please adjust your filters or log new trades.</p>
                </Card>
            )}
        </div>
    );
};

export default InsightsPage;
