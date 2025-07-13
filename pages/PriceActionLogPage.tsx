import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { ICONS, TRADING_SESSION_OPTIONS, BIAS_OPTIONS, YES_NO_NEUTRAL_OPTIONS, EMOTION_DISCIPLINE_RATING_OPTIONS, getValueColorClasses } from '../constants';
import { PriceActionLogEntry, PreTradingLogEntry, PostTradingLogEntry, TradingSession, Bias, YesNoNeutral, EmotionDisciplineScore } from '../types';
import Spinner from '../components/ui/Spinner';
import { usePriceActionLogs } from '../hooks/usePriceActionLogs';

const PriceActionLogPage: React.FC = () => {
  const { logs, addLog, isLoading: isLoadingStorage, error } = usePriceActionLogs();
  const [activeTab, setActiveTab] = useState<'pre' | 'post'>('pre');
  const [selectedDateForDisplay, setSelectedDateForDisplay] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentConfluence, setCurrentConfluence] = useState('');


  // Pre-Trading Log State
  const [preLogInputs, setPreLogInputs] = useState<Omit<PreTradingLogEntry, 'id' | 'log_date_time' | 'type'>>({
    entry_date: new Date().toISOString().split('T')[0],
    tradeable_asset: '',
    trading_session: TRADING_SESSION_OPTIONS[0],
    bias: BIAS_OPTIONS[0],
    key_htf_narrative: '',
    intraday_plan: '',
    key_levels_to_watch: '',
    expected_liquidity: '',
    confluences: [],
    news_events_to_consider: '',
    mindset_intentions: '',
    screenshot_url: '',
  });

  // Post-Trading Log State
  const [postLogInputs, setPostLogInputs] = useState<Omit<PostTradingLogEntry, 'id' | 'log_date_time' | 'type'>>({
    entry_date: new Date().toISOString().split('T')[0],
    tradeable_asset: '',
    trading_session: TRADING_SESSION_OPTIONS[0],
    price_behavior_summary: '',
    was_bias_accurate: YES_NO_NEUTRAL_OPTIONS[0],
    missed_opportunities: false,
    missed_opportunities_details: '',
    did_follow_plan: YES_NO_NEUTRAL_OPTIONS[0],
    plan_deviation_details: '',
    trades_taken_summary: '',
    emotion_discipline_rating: 3,
    trade_execution_score: 3,
    what_you_did_well: '',
    what_to_improve: '',
    screenshot_url_post: '',
  });


  const handlePreLogInputChange = (field: keyof typeof preLogInputs, value: any) => {
    setPreLogInputs(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddConfluence = () => {
    const newConfluence = currentConfluence.trim();
    if (newConfluence && !preLogInputs.confluences.includes(newConfluence)) {
      setPreLogInputs(prev => ({
        ...prev,
        confluences: [...prev.confluences, newConfluence],
      }));
    }
    setCurrentConfluence('');
  };

  const handleRemoveConfluence = (confluenceToRemove: string) => {
    setPreLogInputs(prev => ({
      ...prev,
      confluences: prev.confluences.filter(c => c !== confluenceToRemove),
    }));
  };

  const handlePreLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preLogInputs.tradeable_asset.trim() || !preLogInputs.entry_date) {
        alert("Asset and Date are required for Pre-Trading Log.");
        return;
    }
    const newLog: Omit<PreTradingLogEntry, 'id'> = {
      log_date_time: new Date().toISOString(),
      type: 'pre',
      ...preLogInputs,
      tradeable_asset: preLogInputs.tradeable_asset.toUpperCase().trim(),
    };
    await addLog(newLog);
    setPreLogInputs({
        entry_date: new Date().toISOString().split('T')[0], tradeable_asset: '', trading_session: TRADING_SESSION_OPTIONS[0], bias: BIAS_OPTIONS[0], key_htf_narrative: '', intraday_plan: '', key_levels_to_watch: '', expected_liquidity: '', confluences: [], news_events_to_consider: '', mindset_intentions: '', screenshot_url: '',
    });
    setCurrentConfluence('');
  };

  const handlePostLogInputChange = (field: keyof typeof postLogInputs, value: any) => {
    setPostLogInputs(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePostLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!postLogInputs.tradeable_asset.trim() || !postLogInputs.entry_date) {
        alert("Asset and Date are required for Post-Trading Log.");
        return;
    }
    const newLog: Omit<PostTradingLogEntry, 'id'> = {
      log_date_time: new Date().toISOString(),
      type: 'post',
      ...postLogInputs,
      tradeable_asset: postLogInputs.tradeable_asset.toUpperCase().trim(),
    };
    await addLog(newLog);
     setPostLogInputs({
        entry_date: new Date().toISOString().split('T')[0], tradeable_asset: '', trading_session: TRADING_SESSION_OPTIONS[0], price_behavior_summary: '', was_bias_accurate: YES_NO_NEUTRAL_OPTIONS[0], missed_opportunities: false, missed_opportunities_details: '', did_follow_plan: YES_NO_NEUTRAL_OPTIONS[0], plan_deviation_details: '', trades_taken_summary: '', emotion_discipline_rating: 3, trade_execution_score: 3, what_you_did_well: '', what_to_improve: '', screenshot_url_post: '',
    });
  };

  const logsForSelectedDate = useMemo(() => {
    return logs.filter(log => log.entry_date === selectedDateForDisplay);
  }, [logs, selectedDateForDisplay]);

  const uniqueLogDates = useMemo(() => {
    const dates = new Set(logs.map(log => log.entry_date));
    return Array.from(dates).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
  }, [logs]);

  const renderLogEntry = (log: PriceActionLogEntry) => {
    const isPreLog = log.type === 'pre';
    const commonDetails = (
        <>
            <p><span className="font-semibold">Asset:</span> {log.tradeable_asset}</p>
            <p><span className="font-semibold">Session:</span> {log.trading_session}</p>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Logged: {new Date(log.log_date_time).toLocaleString()}</p>
        </>
    );

    if (isPreLog) {
      const pre = log as PreTradingLogEntry;
      return (
        <Card title={`Pre-Trading Log: ${pre.tradeable_asset} (${pre.entry_date})`} className="mb-4 break-inside-avoid">
          {commonDetails}
          <p><span className="font-semibold">Bias:</span> {pre.bias}</p>
          <p><span className="font-semibold">Key HTF Narrative:</span> {pre.key_htf_narrative}</p>
          <p><span className="font-semibold">Intraday Plan:</span> {pre.intraday_plan}</p>
          <p><span className="font-semibold">Key Levels:</span> {pre.key_levels_to_watch}</p>
          <p><span className="font-semibold">Expected Liquidity:</span> {pre.expected_liquidity}</p>
          {pre.confluences && pre.confluences.length > 0 && <p><span className="font-semibold">Confluences:</span> {pre.confluences.join(', ')}</p>}
          {pre.news_events_to_consider && <p><span className="font-semibold">News/Events:</span> {pre.news_events_to_consider}</p>}
          <p><span className="font-semibold">Mindset/Intentions:</span> {pre.mindset_intentions}</p>
          {pre.screenshot_url && <a href={pre.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-primary-DEFAULT hover:underline">View Screenshot</a>}
        </Card>
      );
    } else {
      const post = log as PostTradingLogEntry;
      return (
        <Card title={`Post-Trading Log: ${post.tradeable_asset} (${post.entry_date})`} className="mb-4 break-inside-avoid">
          {commonDetails}
          <p><span className="font-semibold">Price Behavior:</span> {post.price_behavior_summary}</p>
          <p><span className="font-semibold">Bias Accurate?:</span> {post.was_bias_accurate}</p>
          <p><span className="font-semibold">Missed Opportunities?:</span> {post.missed_opportunities ? 'Yes' : 'No'} {post.missed_opportunities_details ? `(${post.missed_opportunities_details})` : ''}</p>
          <p><span className="font-semibold">Followed Plan?:</span> {post.did_follow_plan} {post.plan_deviation_details ? `(${post.plan_deviation_details})` : ''}</p>
          <p><span className="font-semibold">Trades Summary:</span> {post.trades_taken_summary}</p>
          <p><span className="font-semibold">Emotion/Discipline Rating:</span> {post.emotion_discipline_rating}/5</p>
          <p><span className="font-semibold">Trade Execution Score:</span> {post.trade_execution_score}/5</p>
          <p><span className="font-semibold">Did Well:</span> {post.what_you_did_well}</p>
          <p><span className="font-semibold">To Improve:</span> {post.what_to_improve}</p>
          {post.screenshot_url_post && <a href={post.screenshot_url_post} target="_blank" rel="noopener noreferrer" className="text-primary-DEFAULT hover:underline">View Screenshot</a>}
        </Card>
      );
    }
  };

  const biasAccuracyRate = useMemo(() => {
        const postLogsWithBias = logs.filter(log => log.type === 'post' && (log as PostTradingLogEntry).was_bias_accurate) as PostTradingLogEntry[];
        if (postLogsWithBias.length === 0) return 0;
        const accurateBiasCount = postLogsWithBias.filter(log => log.was_bias_accurate === YesNoNeutral.YES).length;
        return (accurateBiasCount / postLogsWithBias.length) * 100;
    }, [logs]);

    const planFollowingScore = useMemo(() => {
        const postLogsWithPlan = logs.filter(log => log.type === 'post' && (log as PostTradingLogEntry).did_follow_plan) as PostTradingLogEntry[];
        if (postLogsWithPlan.length === 0) return 0;
        const followedPlanCount = postLogsWithPlan.filter(log => log.did_follow_plan === YesNoNeutral.YES).length;
        return (followedPlanCount / postLogsWithPlan.length) * 100;
    }, [logs]);
    
    const avgTradeExecutionScore = useMemo(() => {
        const postLogsWithExecution = logs.filter(log => log.type === 'post' && typeof (log as PostTradingLogEntry).trade_execution_score === 'number') as PostTradingLogEntry[];
        if (postLogsWithExecution.length === 0) return 0;
        const totalScore = postLogsWithExecution.reduce((sum, log) => sum + (log.trade_execution_score || 0), 0);
        return totalScore / postLogsWithExecution.length;
    }, [logs]);

    const avgDailyDisciplineRating = useMemo(() => {
        const postLogsWithDiscipline = logs.filter(log => log.type === 'post' && typeof (log as PostTradingLogEntry).emotion_discipline_rating === 'number') as PostTradingLogEntry[];
        if (postLogsWithDiscipline.length === 0) return 0;
        const totalRating = postLogsWithDiscipline.reduce((sum, log) => sum + (log.emotion_discipline_rating || 0), 0);
        return totalRating / postLogsWithDiscipline.length;
    }, [logs]);
    
    const sessionPerformance = useMemo(() => {
        const performance: Record<string, { accurate: number; total: number }> = {};
        TRADING_SESSION_OPTIONS.forEach(session => performance[session] = { accurate: 0, total: 0 });

        logs.forEach(log => {
            if (log.type === 'post') {
                const postLog = log as PostTradingLogEntry;
                if (postLog.trading_session && postLog.was_bias_accurate) {
                    performance[postLog.trading_session].total++;
                    if (postLog.was_bias_accurate === YesNoNeutral.YES) {
                        performance[postLog.trading_session].accurate++;
                    }
                }
            }
        });
        return Object.entries(performance)
            .filter(([, data]) => data.total > 0)
            .map(([session, data]) => ({
                session,
                accuracy: (data.accurate / data.total) * 100,
                days: data.total
            }));
    }, [logs]);

    const StatCard: React.FC<{ title: string; value: string | number; unit?: string; description?: string, icon?: React.ReactNode }> = ({ title, value, unit, description, icon }) => {
        const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace('%', ''));
        const colorClass = getValueColorClasses(numericValue > 75 ? 1 : numericValue > 50 ? 0 : -1); // Simple mapping for color

        return (
            <Card className="text-center">
                {icon && <div className="text-2xl mb-1 text-primary-DEFAULT mx-auto w-fit">{icon}</div>}
                <h4 className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">{title}</h4>
                <p className={`text-2xl font-bold ${colorClass}`}>
                    {typeof value === 'number' && !isNaN(value) ? value.toFixed(1) : value}
                    {unit && <span className="text-lg ml-0.5">{unit}</span>}
                </p>
                {description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>}
            </Card>
        );
    };

  if (isLoadingStorage) {
    return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">Daily Price Action Log</h2>

      <Card>
        <div className="flex border-b border-light-border dark:border-dark-border">
          <button
            onClick={() => setActiveTab('pre')}
            className={`py-3 px-6 font-medium transition-colors ${activeTab === 'pre' ? 'text-primary-DEFAULT border-b-2 border-primary-DEFAULT' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-light'}`}
          >
            Pre-Trading Log
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`py-3 px-6 font-medium transition-colors ${activeTab === 'post' ? 'text-primary-DEFAULT border-b-2 border-primary-DEFAULT' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-light'}`}
          >
            Post-Trading Log
          </button>
        </div>

        <div className="p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {activeTab === 'pre' && (
            <form onSubmit={handlePreLogSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Date" type="date" value={preLogInputs.entry_date} onChange={e => handlePreLogInputChange('entry_date', e.target.value)} required />
                <Input 
                    label="Tradeable Asset" 
                    type="text" 
                    value={preLogInputs.tradeable_asset} 
                    onChange={e => handlePreLogInputChange('tradeable_asset', e.target.value)} 
                    placeholder="e.g., ES, EURUSD, BTC" 
                    required 
                />
                <Select label="Session Planning For" value={preLogInputs.trading_session} onChange={e => handlePreLogInputChange('trading_session', e.target.value as TradingSession)} options={TRADING_SESSION_OPTIONS.map(s => ({ value: s, label: s }))} required />
              </div>
              <Select label="Bias" value={preLogInputs.bias} onChange={e => handlePreLogInputChange('bias', e.target.value as Bias)} options={BIAS_OPTIONS.map(b => ({ value: b, label: b }))} required />
              <Textarea label="Key HTF Narrative (Daily/4H context, Liquidity/OB)" value={preLogInputs.key_htf_narrative} onChange={e => handlePreLogInputChange('key_htf_narrative', e.target.value)} rows={3} />
              <Textarea label="Intraday Plan (Specific setup idea)" value={preLogInputs.intraday_plan} onChange={e => handlePreLogInputChange('intraday_plan', e.target.value)} rows={3} />
              <Input label="Key Levels to Watch" value={preLogInputs.key_levels_to_watch} onChange={e => handlePreLogInputChange('key_levels_to_watch', e.target.value)} placeholder="e.g., 1.0735, 1.0700 (comma-separated)" />
              <Input label="Expected Liquidity (Where is it resting?)" value={preLogInputs.expected_liquidity} onChange={e => handlePreLogInputChange('expected_liquidity', e.target.value)} />
              
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Confluences</label>
                <div className="flex items-center gap-2 mb-2">
                    <Input 
                        wrapperClassName="flex-grow mb-0"
                        value={currentConfluence} 
                        onChange={e => setCurrentConfluence(e.target.value)} 
                        placeholder="Type confluence and press Enter or Add"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddConfluence();}}}
                    />
                    <Button type="button" onClick={handleAddConfluence} size="sm" variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {preLogInputs.confluences.map(confluence => (
                        <span key={confluence} className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded-full flex items-center">
                            {confluence}
                            <button type="button" onClick={() => handleRemoveConfluence(confluence)} className="ml-1.5 text-red-500 hover:text-red-700 text-sm">&times;</button>
                        </span>
                    ))}
                </div>
              </div>

              <Input label="News/Events to Consider (Optional)" value={preLogInputs.news_events_to_consider} onChange={e => handlePreLogInputChange('news_events_to_consider', e.target.value)} />
              <Textarea label="Mindset / Intention (Mood, sleep, focus, etc.)" value={preLogInputs.mindset_intentions} onChange={e => handlePreLogInputChange('mindset_intentions', e.target.value)} rows={3} />
              <Input label="Screenshot URL (Optional)" type="url" value={preLogInputs.screenshot_url} onChange={e => handlePreLogInputChange('screenshot_url', e.target.value)} placeholder="https://example.com/chart_pre.png" />
              <Button type="submit" variant="primary" isLoading={isLoadingStorage}>Save Pre-Trading Log</Button>
            </form>
          )}

          {activeTab === 'post' && (
            <form onSubmit={handlePostLogSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Date" type="date" value={postLogInputs.entry_date} onChange={e => handlePostLogInputChange('entry_date', e.target.value)} required />
                 <Input 
                    label="Tradeable Asset" 
                    type="text" 
                    value={postLogInputs.tradeable_asset} 
                    onChange={e => handlePostLogInputChange('tradeable_asset', e.target.value)} 
                    placeholder="e.g., ES, EURUSD, BTC" 
                    required 
                />
                <Select label="Trading Session Logged" value={postLogInputs.trading_session} onChange={e => handlePostLogInputChange('trading_session', e.target.value as TradingSession)} options={TRADING_SESSION_OPTIONS.map(s => ({ value: s, label: s }))} required />
              </div>
              <Textarea label="Price Behavior Summary (What actually happened)" value={postLogInputs.price_behavior_summary} onChange={e => handlePostLogInputChange('price_behavior_summary', e.target.value)} rows={3} required />
              <Select label="Was Pre-Session Bias Accurate?" value={postLogInputs.was_bias_accurate} onChange={e => handlePostLogInputChange('was_bias_accurate', e.target.value as YesNoNeutral)} options={YES_NO_NEUTRAL_OPTIONS.map(o => ({ value: o, label: o }))} required />
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-light-text dark:text-dark-text">Missed Opportunities?</label>
                <Select value={String(postLogInputs.missed_opportunities)} onChange={e => handlePostLogInputChange('missed_opportunities', e.target.value === 'true')} options={[{value: 'true', label: 'Yes'}, {value: 'false', label: 'No'}]} wrapperClassName="mb-0"/>
              </div>
              {postLogInputs.missed_opportunities && <Textarea label="Details on Missed Opportunities" value={postLogInputs.missed_opportunities_details} onChange={e => handlePostLogInputChange('missed_opportunities_details', e.target.value)} rows={2} />}
              <Select label="Did You Follow Your Plan?" value={postLogInputs.did_follow_plan} onChange={e => handlePostLogInputChange('did_follow_plan', e.target.value as YesNoNeutral)} options={YES_NO_NEUTRAL_OPTIONS.map(o => ({ value: o, label: o }))} required />
              {postLogInputs.did_follow_plan !== YesNoNeutral.YES && <Textarea label="Explain Deviations (If any)" value={postLogInputs.plan_deviation_details} onChange={e => handlePostLogInputChange('plan_deviation_details', e.target.value)} rows={2} />}
              <Textarea label="Trades Taken Summary (Entries, SL, TP, outcome)" value={postLogInputs.trades_taken_summary} onChange={e => handlePostLogInputChange('trades_taken_summary', e.target.value)} rows={3} />
              <Select label="Emotion & Discipline Rating (1-5, 5=Best)" value={postLogInputs.emotion_discipline_rating} onChange={e => handlePostLogInputChange('emotion_discipline_rating', parseInt(e.target.value) as EmotionDisciplineScore)} options={EMOTION_DISCIPLINE_RATING_OPTIONS.map(s => ({ value: s, label: String(s) }))} required />
              <Select label="Trade Execution Score (1-5, 5=Best)" value={postLogInputs.trade_execution_score} onChange={e => handlePostLogInputChange('trade_execution_score', parseInt(e.target.value) as EmotionDisciplineScore)} options={EMOTION_DISCIPLINE_RATING_OPTIONS.map(s => ({ value: s, label: String(s) }))} required />
              <Textarea label="What You Did Well" value={postLogInputs.what_you_did_well} onChange={e => handlePostLogInputChange('what_you_did_well', e.target.value)} rows={3} />
              <Textarea label="What You Can Improve" value={postLogInputs.what_to_improve} onChange={e => handlePostLogInputChange('what_to_improve', e.target.value)} rows={3} />
              <Input label="Screenshot URL (Post-Action, Optional)" type="url" value={postLogInputs.screenshot_url_post} onChange={e => handlePostLogInputChange('screenshot_url_post', e.target.value)} placeholder="https://example.com/chart_post.png" />
              <Button type="submit" variant="primary" isLoading={isLoadingStorage}>Save Post-Trading Log</Button>
            </form>
          )}
        </div>
      </Card>
      
      <Card title="Key Metrics from Your Logs" className="mt-6">
        {logs.filter(log => log.type === 'post').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Bias Accuracy" value={biasAccuracyRate} unit="%" icon={<ICONS.TARGET_ICON />} description={`${(logs.filter(l => l.type === 'post') as PostTradingLogEntry[]).filter(l => l.was_bias_accurate === YesNoNeutral.YES).length} / ${(logs.filter(l => l.type === 'post') as PostTradingLogEntry[]).length} days`} />
                <StatCard title="Plan Following" value={planFollowingScore} unit="%" icon={<ICONS.CHECK_SQUARE_FILLED />} description={`${(logs.filter(l => l.type === 'post') as PostTradingLogEntry[]).filter(l => l.did_follow_plan === YesNoNeutral.YES).length} / ${(logs.filter(l => l.type === 'post') as PostTradingLogEntry[]).length} days`} />
                <StatCard title="Avg. Execution" value={avgTradeExecutionScore} unit="/5" icon={<ICONS.PLAYBOOKS />} />
                <StatCard title="Avg. Discipline" value={avgDailyDisciplineRating} unit="/5" icon={<ICONS.BRAIN />} />
                {sessionPerformance.map(s => (
                     <StatCard key={s.session} title={`${s.session} Bias Acc.`} value={s.accuracy} unit="%" description={`${s.days} days logged`}/>
                ))}
            </div>
        ) : (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Log post-trading entries to see calculated metrics here.</p>
        )}
      </Card>
      
      <Card title="Further Manual Analysis Guide" className="mt-6">
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
              Use your logged data to manually track and reflect on these key areas over time. Consistent logging and review is key!
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-light-text dark:text-dark-text">
              <li><strong>Mindset Impact:</strong> Correlate your Mindset/Intention notes (mood, sleep, focus) with your bias accuracy and actual trading performance for the day.</li>
              <li><strong>Most Frequent Confluences on Winning Days:</strong> Review your Pre-Trading logs for days you had successful outcomes. Which confluences did you list most often? This helps identify your A+ setups.</li>
              <li><strong>Common Reasons for Losing Days/Deviations:</strong> When your bias was wrong, or you deviated from your plan, what were the common themes? (e.g., revenge trading, early entry, ignoring HTF narrative). Review 'What to Improve' and 'Plan Deviation Details'.</li>
              <li><strong>Liquidity Mistakes:</strong> Tag or note entries where you realize you were on the wrong side of a liquidity grab. Learn to identify these traps better by reviewing your 'Expected Liquidity' vs 'Price Behavior Summary'.</li>
          </ul>
      </Card>

      <Card title="View Logs" className="mt-6">
        <div className="mb-4">
          <Select
            label="Select Date to View Logs"
            value={selectedDateForDisplay}
            onChange={e => setSelectedDateForDisplay(e.target.value)}
            options={uniqueLogDates.length > 0 ? uniqueLogDates.map(date => ({ value: date, label: date })) : [{value: '', label: 'No logs yet'}]}
            disabled={uniqueLogDates.length === 0}
          />
        </div>
        {logsForSelectedDate.length > 0 ? (
          <div className="space-y-4 md:columns-2 md:gap-4 xl:columns-3">
            {logsForSelectedDate.map(renderLogEntry)}
          </div>
        ) : (
          <p className="text-light-text-secondary dark:text-dark-text-secondary">No logs found for {selectedDateForDisplay}.</p>
        )}
      </Card>
    </div>
  );
};

export default PriceActionLogPage;