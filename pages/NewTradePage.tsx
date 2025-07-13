import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import { useTrades } from '../hooks/useTrades';
import { useAccounts } from '../hooks/useAccounts'; 
import { usePlaybooks } from '../hooks/usePlaybooks'; 
import { useConcepts } from '../hooks/useConcepts'; 
import { Trade, ConfidenceScore, RuleAdherenceScore, EmotionalState, ReasonForExit, MarketEnvironment, TradingSession, TradeManagementAction, TradeManagementActionType, CorrelatedAssetBehavior, Concept, Playbook } from '../types';
import { 
  CONFIDENCE_SCORES,
  RULE_ADHERENCE_SCORES,
  EMOTIONAL_STATE_OPTIONS,
  REASON_FOR_EXIT_OPTIONS,
  MARKET_ENVIRONMENT_OPTIONS,
  TRADING_SESSION_OPTIONS,
  TRADE_MANAGEMENT_ACTION_TYPE_OPTIONS,
  CORRELATED_ASSET_BEHAVIOR_OPTIONS,
  ICONS,
} from '../constants'; 

const toSelectOptions = (arr: ReadonlyArray<string | number>) => arr.map(item => ({ value: item, label: String(item) }));
const booleanOptions = [ {value: 'true', label: 'Yes'}, {value: 'false', label: 'No'}];


const NewTradePage: React.FC = () => {
  const navigate = useNavigate();
  const { addTrade, isLoading: tradesLoading, error: apiError } = useTrades();
  const { getActiveAccounts, isLoading: accountsLoading } = useAccounts(); 
  const { getPlaybooks, getPlaybookById, isLoading: playbooksLoading } = usePlaybooks();
  const { concepts, isLoading: conceptsHookLoading } = useConcepts(); 
  
  const [availableAccounts, setAvailableAccounts] = useState<{ value: string; label: string }[]>([]);
  const [availablePlaybooks, setAvailablePlaybooks] = useState<{ value: string; label: string }[]>([]);
  const [selectedPlaybookDetails, setSelectedPlaybookDetails] = useState<Playbook | null>(null);


  useEffect(() => {
    const activeAccounts = getActiveAccounts();
    if (activeAccounts.length > 0) {
      setAvailableAccounts(activeAccounts.map(acc => ({ value: acc.id, label: acc.name })));
      setCoreInfo(prev => ({
        ...prev,
        account_id: prev.account_id && activeAccounts.some(a => a.id === prev.account_id) ? prev.account_id : activeAccounts[0].id
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getActiveAccounts, accountsLoading]); 

  useEffect(() => {
    const playbooks = getPlaybooks();
    setAvailablePlaybooks(playbooks.map(pb => ({ value: pb.id, label: pb.name })));
  }, [getPlaybooks, playbooksLoading]);


  // Group state by sections
  const [coreInfo, setCoreInfo] = useState({
    asset: '', account_id: '', risk_percentage: 1.0,
    entry_timestamp: new Date().toISOString().slice(0, 16),
    entry_price: '', stop_loss_price: '', exit_timestamp: '', exit_price: '',
  });

  const [strategySetup, setStrategySetup] = useState({
    setup_name: '', playbook_id: '', confidence_score: '' as ConfidenceScore | '',
    timeframes_used: '', linked_concept_ids: [] as string[], 
  });

  const [psychologyBehavior, setPsychologyBehavior] = useState({
    rule_adherence_score: '' as RuleAdherenceScore | '', emotion_pre_trade: '' as EmotionalState | '',
    emotion_during_trade: '' as EmotionalState | '', emotion_post_trade: '' as EmotionalState | '',
    reason_for_exit: '' as ReasonForExit | '', impulse_log: '',
    post_trade_contamination: '', post_trade_contamination_notes: '',
  });

  const [marketConditions, setMarketConditions] = useState({
    market_environment: '' as MarketEnvironment | '', time_of_day_session: '' as TradingSession | '',
    news_event_driver: '', news_event_details: '', atr_at_entry: '',
    correlated_asset_ticker: '', correlated_asset_behavior: '' as CorrelatedAssetBehavior | '',
  });

  const [managementAndReview, setManagementAndReview] = useState({
    management_actions_notes: '', system_pnl_r: '', mfeR: '', maeR: '',
    lessons_learned: '', mistake_rule_broken: '', mistake_reason: '',
    chart_image_url: '', tags: '', 
  });
  
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Trade | string, string>>>({});
  
  const showMistakeAnalysis = psychologyBehavior.rule_adherence_score !== '' && psychologyBehavior.rule_adherence_score < 7;

  useEffect(() => {
    if (!showMistakeAnalysis) {
      setManagementAndReview(prev => ({ ...prev, mistake_rule_broken: '', mistake_reason: '' }));
    }
  }, [showMistakeAnalysis]);

  useEffect(() => {
    if (strategySetup.playbook_id) {
      const pb = getPlaybookById(strategySetup.playbook_id);
      setSelectedPlaybookDetails(pb || null);
    } else {
      setSelectedPlaybookDetails(null);
    }
  }, [strategySetup.playbook_id, getPlaybookById]);


  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof Trade | string, string>> = {};
    if (!coreInfo.asset.trim()) errors.asset = 'Asset ticker is required.';
    if (!coreInfo.account_id) errors.account_id = 'Account selection is required.';
    if (isNaN(coreInfo.risk_percentage) || coreInfo.risk_percentage <= 0 || coreInfo.risk_percentage > 100) errors.risk_percentage = 'Valid risk percentage (0-100) is required.';
    if (!coreInfo.entry_timestamp) errors.entry_timestamp = 'Entry timestamp is required.';
    if (!coreInfo.entry_price || isNaN(parseFloat(coreInfo.entry_price)) || parseFloat(coreInfo.entry_price) <= 0) errors.entry_price = 'Valid entry price is required.';
    if (!coreInfo.stop_loss_price || isNaN(parseFloat(coreInfo.stop_loss_price)) || parseFloat(coreInfo.stop_loss_price) <= 0) errors.stop_loss_price = 'Valid stop loss price is required.';
    if (coreInfo.exit_timestamp && (!coreInfo.exit_price || isNaN(parseFloat(coreInfo.exit_price)) || parseFloat(coreInfo.exit_price) < 0)) errors.exit_price = 'If exit timestamp is set, a valid exit price is required.';
    if (coreInfo.exit_price && !coreInfo.exit_timestamp) errors.exit_timestamp = 'If exit price is set, an exit timestamp is required.';
    if (psychologyBehavior.post_trade_contamination === 'true' && !psychologyBehavior.post_trade_contamination_notes.trim()) errors.post_trade_contamination_notes = 'Details are required if post-trade contamination occurred.';
    if (marketConditions.news_event_driver === 'true' && !marketConditions.news_event_details.trim()) errors.news_event_details = 'Details are required if trade was news-driven.';
    if (showMistakeAnalysis && !managementAndReview.mistake_rule_broken.trim()) errors.mistake_rule_broken = "Rule broken details are required due to low adherence score.";
    if (showMistakeAnalysis && !managementAndReview.mistake_reason.trim()) errors.mistake_reason = "Reason for breaking rule is required.";
    if (!managementAndReview.lessons_learned.trim()) errors.lessons_learned = "Key lesson learned is a required field for reflection.";
    if (marketConditions.atr_at_entry && (isNaN(parseFloat(marketConditions.atr_at_entry)) || parseFloat(marketConditions.atr_at_entry) < 0)) errors.atr_at_entry = "ATR at Entry must be a positive number.";
    if (managementAndReview.system_pnl_r && isNaN(parseFloat(managementAndReview.system_pnl_r))) errors.system_pnl_r = "System P&L (R) must be a number.";
    if (managementAndReview.mfeR && (isNaN(parseFloat(managementAndReview.mfeR)) || parseFloat(managementAndReview.mfeR) < 0)) errors.mfeR = "MFE (R) must be a positive number.";
    if (managementAndReview.maeR && (isNaN(parseFloat(managementAndReview.maeR)) || parseFloat(managementAndReview.maeR) < 0)) errors.maeR = "MAE (R) must be a positive number.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const management_actions: TradeManagementAction[] = managementAndReview.management_actions_notes.split('\n')
      .filter(line => line.trim() !== '')
      .map((line, index) => ({
        id: `mact-${Date.now()}-${index}`,
        timestamp: coreInfo.entry_timestamp, 
        action_type: TradeManagementActionType.OTHER, 
        notes: line.trim(),
      }));

    const tradeData = {
      asset: coreInfo.asset.toUpperCase(),
      account_id: coreInfo.account_id, 
      risk_percentage: parseFloat(String(coreInfo.risk_percentage)),
      entry_timestamp: coreInfo.entry_timestamp,
      entry_price: parseFloat(coreInfo.entry_price),
      stop_loss_price: parseFloat(coreInfo.stop_loss_price),
      ...(coreInfo.exit_timestamp && { exit_timestamp: coreInfo.exit_timestamp }),
      ...(coreInfo.exit_price && { exit_price: parseFloat(coreInfo.exit_price) }),
      ...(strategySetup.setup_name.trim() && { setup_name: strategySetup.setup_name.trim() }),
      ...(strategySetup.playbook_id.trim() && { playbook_id: strategySetup.playbook_id.trim() }),
      ...(strategySetup.confidence_score !== '' && { confidence_score: strategySetup.confidence_score }),
      ...(strategySetup.timeframes_used.trim() && { timeframes_used: strategySetup.timeframes_used.trim() }),
      linked_concept_ids: strategySetup.linked_concept_ids, 
      ...(psychologyBehavior.rule_adherence_score !== '' && { rule_adherence_score: psychologyBehavior.rule_adherence_score }),
      ...(psychologyBehavior.emotion_pre_trade !== '' && { emotion_pre_trade: psychologyBehavior.emotion_pre_trade }),
      ...(psychologyBehavior.emotion_during_trade !== '' && { emotion_during_trade: psychologyBehavior.emotion_during_trade }),
      ...(psychologyBehavior.emotion_post_trade !== '' && { emotion_post_trade: psychologyBehavior.emotion_post_trade }),
      ...(psychologyBehavior.reason_for_exit !== '' && { reason_for_exit: psychologyBehavior.reason_for_exit }),
      ...(psychologyBehavior.impulse_log.trim() && { impulse_log: psychologyBehavior.impulse_log.trim() }),
      ...(psychologyBehavior.post_trade_contamination !== '' && { post_trade_contamination: psychologyBehavior.post_trade_contamination === 'true' }),
      ...(psychologyBehavior.post_trade_contamination === 'true' && psychologyBehavior.post_trade_contamination_notes.trim() && { post_trade_contamination_notes: psychologyBehavior.post_trade_contamination_notes.trim() }),
      ...(marketConditions.market_environment !== '' && { market_environment: marketConditions.market_environment }),
      ...(marketConditions.time_of_day_session !== '' && { time_of_day_session: marketConditions.time_of_day_session }),
      ...(marketConditions.news_event_driver !== '' && { news_event_driver: marketConditions.news_event_driver === 'true' }),
      ...(marketConditions.news_event_driver === 'true' && marketConditions.news_event_details.trim() && { news_event_details: marketConditions.news_event_details.trim() }),
      ...(marketConditions.atr_at_entry && { atr_at_entry: parseFloat(marketConditions.atr_at_entry) }),
      ...(marketConditions.correlated_asset_ticker.trim() && { correlated_asset_ticker: marketConditions.correlated_asset_ticker.trim() }),
      ...(marketConditions.correlated_asset_behavior !== '' && { correlated_asset_behavior: marketConditions.correlated_asset_behavior }),
      management_actions: management_actions.length > 0 ? management_actions : undefined,
      ...(managementAndReview.system_pnl_r && { system_pnl_r: parseFloat(managementAndReview.system_pnl_r) }),
      mfe: managementAndReview.mfeR ? parseFloat(managementAndReview.mfeR) : undefined,
      mae: managementAndReview.maeR ? parseFloat(managementAndReview.maeR) : undefined,
      lessons_learned: managementAndReview.lessons_learned.trim(),
      ...(showMistakeAnalysis && managementAndReview.mistake_rule_broken.trim() && { mistake_rule_broken: managementAndReview.mistake_rule_broken.trim() }),
      ...(showMistakeAnalysis && managementAndReview.mistake_reason.trim() && { mistake_reason: managementAndReview.mistake_reason.trim() }),
      ...(managementAndReview.chart_image_url.trim() && { chart_image_url: managementAndReview.chart_image_url.trim() }),
      tags: managementAndReview.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      notes: '', 
    };
    
    await addTrade(tradeData);
    if (!apiError && !tradesLoading) { 
      navigate('/trades'); 
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    switch(section) {
        case 'coreInfo': setCoreInfo(prev => ({ ...prev, [field]: value })); break;
        case 'strategySetup': setStrategySetup(prev => ({ ...prev, [field]: value })); break;
        case 'psychologyBehavior': setPsychologyBehavior(prev => ({ ...prev, [field]: value })); break;
        case 'marketConditions': setMarketConditions(prev => ({ ...prev, [field]: value })); break;
        case 'managementAndReview': setManagementAndReview(prev => ({ ...prev, [field]: value })); break;
    }
  };
  
  const handleToggleConcept = (conceptId: string) => {
    setStrategySetup(prev => ({
        ...prev,
        linked_concept_ids: prev.linked_concept_ids.includes(conceptId) 
            ? prev.linked_concept_ids.filter(id => id !== conceptId) 
            : [...prev.linked_concept_ids, conceptId]
    }));
  };
  
  const isLoading = tradesLoading || accountsLoading || playbooksLoading || conceptsHookLoading;


  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text mb-6">Log New Trade</h2>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <fieldset className="space-y-6">
            <legend className="text-xl font-semibold text-primary-DEFAULT mb-4 pb-2 border-b border-light-border dark:border-dark-border w-full">Core Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Input label="Asset (Ticker)" id="asset" value={coreInfo.asset} onChange={(e) => handleInputChange('coreInfo', 'asset', e.target.value)} placeholder="e.g., AAPL, BTC-USD" error={formErrors.asset} required />
              <Select 
                label="Account" id="account_id" value={coreInfo.account_id} 
                onChange={(e) => handleInputChange('coreInfo', 'account_id', e.target.value)} 
                options={availableAccounts} error={formErrors.account_id as string} required 
                disabled={accountsLoading || availableAccounts.length === 0}
                placeholder={accountsLoading ? "Loading accounts..." : "Select Account"}
              />
              <Input label="Risk Percentage (%)" id="risk_percentage" type="number" value={coreInfo.risk_percentage} onChange={(e) => handleInputChange('coreInfo', 'risk_percentage', parseFloat(e.target.value))} step="0.1" min="0.01" max="100" error={formErrors.risk_percentage} required />
              <Input label="Initial Stop-Loss Price" id="stop_loss_price" type="number" value={coreInfo.stop_loss_price} onChange={(e) => handleInputChange('coreInfo', 'stop_loss_price', e.target.value)} step="any" placeholder="e.g., 148.50" error={formErrors.stop_loss_price} required />
            </div>
            <h3 className="text-lg font-medium text-light-text dark:text-dark-text pt-2">Entry Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Input label="Entry Timestamp" id="entry_timestamp" type="datetime-local" value={coreInfo.entry_timestamp} onChange={(e) => handleInputChange('coreInfo', 'entry_timestamp', e.target.value)} error={formErrors.entry_timestamp} required />
              <Input label="Entry Price" id="entry_price" type="number" value={coreInfo.entry_price} onChange={(e) => handleInputChange('coreInfo', 'entry_price', e.target.value)} step="any" placeholder="e.g., 150.00" error={formErrors.entry_price} required />
            </div>
            <h3 className="text-lg font-medium text-light-text dark:text-dark-text pt-2">Exit Details (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Input label="Exit Timestamp" id="exit_timestamp" type="datetime-local" value={coreInfo.exit_timestamp} onChange={(e) => handleInputChange('coreInfo', 'exit_timestamp', e.target.value)} error={formErrors.exit_timestamp} />
              <Input label="Exit Price" id="exit_price" type="number" value={coreInfo.exit_price} onChange={(e) => handleInputChange('coreInfo', 'exit_price', e.target.value)} step="any" placeholder="e.g., 155.00" error={formErrors.exit_price} />
            </div>
          </fieldset>

          <fieldset className="space-y-6">
            <legend className="text-xl font-semibold text-primary-DEFAULT mb-4 pb-2 pt-4 border-b border-light-border dark:border-dark-border w-full">Strategy & Setup</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Input label="Setup Name / Type" id="setup_name" value={strategySetup.setup_name} onChange={(e) => handleInputChange('strategySetup', 'setup_name', e.target.value)} placeholder="e.g., H&S, RSI Divergence" />
              <Select 
                label="Playbook (Optional)" id="playbook_id" value={strategySetup.playbook_id} 
                onChange={(e) => handleInputChange('strategySetup', 'playbook_id', e.target.value)}
                options={[{value: '', label: 'None'}, ...availablePlaybooks]} 
                disabled={playbooksLoading}
                placeholder={playbooksLoading ? "Loading playbooks..." : "Select Playbook"}
              />
            </div>
            {selectedPlaybookDetails && (
                <Card className="mt-2 bg-slate-50 dark:bg-slate-900/50 p-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Selected Playbook: {selectedPlaybookDetails.name}</h4>
                    <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary space-y-1">
                        <p><strong>Rules:</strong></p>
                        <ul className="list-disc list-inside pl-2">
                            {selectedPlaybookDetails.rules.map((rule, i) => <li key={i}>{rule}</li>)}
                        </ul>
                        {selectedPlaybookDetails.key_learnings && selectedPlaybookDetails.key_learnings.length > 0 && (
                            <>
                                <p className="mt-1"><strong>Key Learnings:</strong></p>
                                <ul className="list-disc list-inside pl-2">
                                    {selectedPlaybookDetails.key_learnings.map((kl, i) => <li key={i}>{kl}</li>)}
                                </ul>
                            </>
                        )}
                    </div>
                </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Select label="Confidence Score (Pre-Trade)" id="confidence_score" value={strategySetup.confidence_score} onChange={(e) => handleInputChange('strategySetup', 'confidence_score', e.target.value as ConfidenceScore | '')} options={toSelectOptions(CONFIDENCE_SCORES)} placeholder="Select Score (1-5)" />
              <Input label="Timeframe(s) Used" id="timeframes_used" value={strategySetup.timeframes_used} onChange={(e) => handleInputChange('strategySetup', 'timeframes_used', e.target.value)} placeholder="e.g., D, 4H, 15M" />
            </div>
             <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Link Concepts (Optional)</label>
                <div className="max-h-40 overflow-y-auto border border-light-border dark:border-dark-border rounded-md p-2 space-y-1 bg-light-card dark:bg-dark-card">
                    {conceptsHookLoading ? <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Loading concepts...</p> : 
                     concepts.length > 0 ? concepts.map(concept => (
                        <label key={concept.id} className="flex items-center space-x-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs">
                            <input 
                                type="checkbox" 
                                checked={strategySetup.linked_concept_ids.includes(concept.id)} 
                                onChange={() => handleToggleConcept(concept.id)}
                                className="form-checkbox h-3 w-3 text-primary-DEFAULT rounded border-gray-300 dark:border-slate-500 focus:ring-primary-light"
                            />
                            <span className="text-light-text dark:text-dark-text">{concept.name} <span className="text-light-text-secondary dark:text-dark-text-secondary text-xxs">({concept.understanding_level})</span></span>
                        </label>
                    )) : <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">No concepts available to link.</p>}
                </div>
            </div>
          </fieldset>
          
          <fieldset className="space-y-6">
            <legend className="text-xl font-semibold text-primary-DEFAULT mb-4 pb-2 pt-4 border-b border-light-border dark:border-dark-border w-full">Market Conditions & Nuance</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <Select label="Market Environment" id="market_environment" value={marketConditions.market_environment} onChange={(e) => handleInputChange('marketConditions', 'market_environment', e.target.value as MarketEnvironment | '')} options={toSelectOptions(MARKET_ENVIRONMENT_OPTIONS)} placeholder="Select Environment"/>
                <Select label="Time of Day / Session" id="time_of_day_session" value={marketConditions.time_of_day_session} onChange={(e) => handleInputChange('marketConditions', 'time_of_day_session', e.target.value as TradingSession | '')} options={toSelectOptions(TRADING_SESSION_OPTIONS)} placeholder="Select Session" />
                 <Input label="ATR at Entry (Volatility)" id="atr_at_entry" type="number" value={marketConditions.atr_at_entry} onChange={(e) => handleInputChange('marketConditions', 'atr_at_entry', e.target.value)} step="any" placeholder="e.g., 1.25" error={formErrors.atr_at_entry} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Select label="News/Event Driver?" id="news_event_driver" value={marketConditions.news_event_driver} onChange={(e) => handleInputChange('marketConditions', 'news_event_driver', e.target.value)} options={booleanOptions} placeholder="Select Yes/No" />
                <Input label="News Event Details" id="news_event_details" value={marketConditions.news_event_details} onChange={(e) => handleInputChange('marketConditions', 'news_event_details', e.target.value)} placeholder="e.g., CPI, FOMC" disabled={marketConditions.news_event_driver !== 'true'} error={formErrors.news_event_details} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Input label="Correlated Asset Ticker" id="correlated_asset_ticker" value={marketConditions.correlated_asset_ticker} onChange={(e) => handleInputChange('marketConditions', 'correlated_asset_ticker', e.target.value)} placeholder="e.g., SPY, DXY" />
                <Select label="Correlated Asset Behavior" id="correlated_asset_behavior" value={marketConditions.correlated_asset_behavior} onChange={(e) => handleInputChange('marketConditions', 'correlated_asset_behavior', e.target.value as CorrelatedAssetBehavior | '')} options={toSelectOptions(CORRELATED_ASSET_BEHAVIOR_OPTIONS)} placeholder="Select Behavior" />
            </div>
          </fieldset>

          <fieldset className="space-y-6">
            <legend className="text-xl font-semibold text-primary-DEFAULT mb-4 pb-2 pt-4 border-b border-light-border dark:border-dark-border w-full">Psychology & Behavior</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <Select label="Rule Adherence Score" id="rule_adherence_score" value={psychologyBehavior.rule_adherence_score} onChange={(e) => handleInputChange('psychologyBehavior', 'rule_adherence_score', e.target.value as RuleAdherenceScore | '')} options={toSelectOptions(RULE_ADHERENCE_SCORES)} placeholder="Select Score (1-10)" />
              <Select label="Pre-Trade Emotion" id="emotion_pre_trade" value={psychologyBehavior.emotion_pre_trade} onChange={(e) => handleInputChange('psychologyBehavior', 'emotion_pre_trade', e.target.value as EmotionalState | '')} options={toSelectOptions(EMOTIONAL_STATE_OPTIONS)} placeholder="Select Emotion" />
              <Select label="During-Trade Emotion" id="emotion_during_trade" value={psychologyBehavior.emotion_during_trade} onChange={(e) => handleInputChange('psychologyBehavior', 'emotion_during_trade', e.target.value as EmotionalState | '')} options={toSelectOptions(EMOTIONAL_STATE_OPTIONS)} placeholder="Select Emotion" />
              <Select label="Post-Trade Emotion" id="emotion_post_trade" value={psychologyBehavior.emotion_post_trade} onChange={(e) => handleInputChange('psychologyBehavior', 'emotion_post_trade', e.target.value as EmotionalState | '')} options={toSelectOptions(EMOTIONAL_STATE_OPTIONS)} placeholder="Select Emotion" />
              <Select label="Reason for Exit" id="reason_for_exit" value={psychologyBehavior.reason_for_exit} onChange={(e) => handleInputChange('psychologyBehavior', 'reason_for_exit', e.target.value as ReasonForExit | '')} options={toSelectOptions(REASON_FOR_EXIT_OPTIONS)} placeholder="Select Reason" disabled={!coreInfo.exit_timestamp} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Select label="Post-Trade Contamination?" id="post_trade_contamination" value={psychologyBehavior.post_trade_contamination} onChange={(e) => handleInputChange('psychologyBehavior', 'post_trade_contamination', e.target.value)} options={booleanOptions} placeholder="Select Yes/No" />
                <Textarea label="Contamination Notes" id="post_trade_contamination_notes" value={psychologyBehavior.post_trade_contamination_notes} onChange={(e) => handleInputChange('psychologyBehavior', 'post_trade_contamination_notes', e.target.value)} placeholder="Details if contaminated..." rows={2} disabled={psychologyBehavior.post_trade_contamination !== 'true'} error={formErrors.post_trade_contamination_notes} />
            </div>
            <Textarea label="Impulse Log" id="impulse_log" value={psychologyBehavior.impulse_log} onChange={(e) => handleInputChange('psychologyBehavior', 'impulse_log', e.target.value)} placeholder="Urges to break rules, etc." rows={3} wrapperClassName="md:col-span-2" />
          </fieldset>
          
          <fieldset className="space-y-6">
            <legend className="text-xl font-semibold text-primary-DEFAULT mb-4 pb-2 pt-4 border-b border-light-border dark:border-dark-border w-full">In-Trade Management & Post-Trade Review</legend>
            <Textarea
                label="Trade Management Actions (Notes - one action per line)" id="management_actions_notes"
                value={managementAndReview.management_actions_notes}
                onChange={(e) => handleInputChange('managementAndReview', 'management_actions_notes', e.target.value)}
                placeholder="e.g., Moved SL to B/E at 10:30 AM at $150.50 due to 1R move.&#10;Took 50% partial profit at $152.00 (Target 1)."
                rows={4} helperText="Detail actions like moving stop, taking partials. Future update will allow structured entries." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                <Input label="System P&L (R)" id="system_pnl_r" type="number" value={managementAndReview.system_pnl_r} onChange={(e) => handleInputChange('managementAndReview', 'system_pnl_r', e.target.value)} step="any" placeholder="e.g., 2.5" helperText="If rules followed perfectly" error={formErrors.system_pnl_r} />
                <Input label="MFE (R) (Optional)" id="mfeR" type="number" value={managementAndReview.mfeR} onChange={(e) => handleInputChange('managementAndReview', 'mfeR', e.target.value)} step="any" placeholder="e.g., 3.1" helperText="Max Favorable Excursion in R" error={formErrors.mfeR} />
                <Input label="MAE (R) (Optional)" id="maeR" type="number" value={managementAndReview.maeR} onChange={(e) => handleInputChange('managementAndReview', 'maeR', e.target.value)} step="any" placeholder="e.g., 0.8" helperText="Max Adverse Excursion in R" error={formErrors.maeR} />
            </div>
             <Textarea label="Key Lesson Learned (Required)" id="lessons_learned" value={managementAndReview.lessons_learned} onChange={(e) => handleInputChange('managementAndReview', 'lessons_learned', e.target.value)} placeholder="What is the single most important takeaway from this trade?" rows={3} required error={formErrors.lessons_learned} />
            {showMistakeAnalysis && (
                <>
                    <Textarea label="Which rule did I break? (Required for low adherence)" id="mistake_rule_broken" value={managementAndReview.mistake_rule_broken} onChange={(e) => handleInputChange('managementAndReview', 'mistake_rule_broken', e.target.value)} rows={2} required={showMistakeAnalysis} error={formErrors.mistake_rule_broken} />
                    <Textarea label="Why did I break it? (Required for low adherence)" id="mistake_reason" value={managementAndReview.mistake_reason} onChange={(e) => handleInputChange('managementAndReview', 'mistake_reason', e.target.value)} rows={2} required={showMistakeAnalysis} error={formErrors.mistake_reason} />
                </>
            )}
          </fieldset>

           <fieldset className="space-y-6">
             <legend className="text-xl font-semibold text-primary-DEFAULT mb-4 pb-2 pt-4 border-b border-light-border dark:border-dark-border w-full">Attachments & Tags</legend>
             <Input label="Chart Image URL (Optional)" id="chart_image_url" type="url" value={managementAndReview.chart_image_url} onChange={(e) => handleInputChange('managementAndReview', 'chart_image_url', e.target.value)} placeholder="https://example.com/mychart.png" />
             <Input label="Tags (Comma-separated)" id="tags" value={managementAndReview.tags} onChange={(e) => handleInputChange('managementAndReview', 'tags', e.target.value)} placeholder="e.g., ORB, FOMO, NewsPlay" />
          </fieldset>
          
          {apiError && <p className="text-sm text-danger text-center py-2">{apiError}</p>}

          <div className="pt-6 border-t border-light-border dark:border-dark-border flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || availableAccounts.length === 0}>
              {isLoading ? 'Saving Trade...' : 'Save Trade'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewTradePage;