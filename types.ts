

export enum TradeDirection {
  LONG = 'Long',
  SHORT = 'Short',
}

export enum TradeOutcome {
  WIN = 'Win',
  LOSS = 'Loss',
  BREAKEVEN = 'Breakeven',
}

export type ConfidenceScore = 1 | 2 | 3 | 4 | 5;
export type RuleAdherenceScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export enum EmotionalState {
  CALM = 'Calm',
  ANXIOUS = 'Anxious',
  FOMO = 'FOMO', // Fear Of Missing Out
  GREEDY = 'Greedy',
  ANGRY = 'Angry',
  HOPEFUL = 'Hopeful',
  DISCIPLINED = 'Disciplined',
  FRUSTRATED = 'Frustrated',
  CONFIDENT = 'Confident',
  UNCERTAIN = 'Uncertain',
  BORED = 'Bored',
}

export enum ReasonForExit {
  TARGET_HIT = 'Target Hit',
  STOP_LOSS_HIT = 'Stop Loss Hit',
  INVALIDATED_SETUP = 'Invalidated Setup',
  TIME_BASED_STOP = 'Time-Based Stop',
  EMOTIONAL_DISCRETIONARY = 'Emotional/Discretionary Exit',
  TRAILING_STOP_HIT = 'Trailing Stop Hit',
  MANUAL_PROFIT_TAKE = 'Manual Profit Take (Pre-Target)',
}

export enum MarketEnvironment {
  TRENDING_UP = 'Trending Up',
  TRENDING_DOWN = 'Trending Down',
  RANGING_CHOPPY = 'Ranging/Choppy',
  VOLATILE_EXPANSION = 'Volatile Expansion',
  LOW_VOLATILITY_COMPRESSION = 'Low Volatility Compression',
}

export enum TradingSession {
    PRE_MARKET = 'Pre-Market',
    LONDON_OPEN = 'London Open',
    LONDON_LUNCH = 'London Lunch',
    NY_OPEN = 'NY Open',
    NY_LUNCH = 'NY Lunch',
    NY_CLOSE = 'NY Close',
    ASIA_SESSION = 'Asia Session',
    OVERNIGHT = 'Overnight/Other',
}

export enum TradeManagementActionType {
  STOP_TO_BREAKEVEN = 'Stop to Breakeven',
  PARTIAL_PROFIT_1 = 'Partial Profit 1',
  PARTIAL_PROFIT_2 = 'Partial Profit 2',
  ADDED_TO_POSITION = 'Added to Position',
  TRAILING_STOP_ACTIVATED = 'Trailing Stop Activated',
  MANUAL_STOP_ADJUSTMENT = 'Manual Stop Adjustment', // e.g. moving SL tighter/wider
  MANUAL_TARGET_ADJUSTMENT = 'Manual Target Adjustment',
  OTHER = 'Other Management Action'
}

export interface TradeManagementAction {
  id: string; // Unique ID for the action
  timestamp: string; // When the action was taken
  action_type: TradeManagementActionType;
  price_level?: number; // e.g., price at which stop was moved to BE, or partial profit taken
  percentage_taken?: number; // For partial profits, e.g., 50 for 50%
  new_stop_loss?: number; // If stop was adjusted
  new_target?: number; // If target was adjusted
  notes?: string;
}

export type CorrelatedAssetBehavior = 'Confirming' | 'Diverging' | 'Neutral';


export interface Trade {
  id?: string;
  user_id?: string;
  asset: string;
  account_id: string; 
  risk_percentage: number; 
  entry_timestamp: string;
  entry_price: number;
  exit_timestamp?: string;
  exit_price?: number;
  stop_loss_price: number; 

  direction?: TradeDirection;
  outcome?: TradeOutcome;
  r_multiple?: number; 
  position_size?: number; 
  mfe?: number; 
  mae?: number; 
  trade_duration?: string; 
  trade_duration_ms?: number; 

  setup_name?: string; 
  playbook_id?: string; 
  confidence_score?: ConfidenceScore; 
  timeframes_used?: string; 
  
  rule_adherence_score?: RuleAdherenceScore; 
  emotion_pre_trade?: EmotionalState;
  emotion_during_trade?: EmotionalState;
  emotion_post_trade?: EmotionalState;
  reason_for_exit?: ReasonForExit;
  impulse_log?: string; 
  post_trade_contamination?: boolean; 
  post_trade_contamination_notes?: string;

  market_environment?: MarketEnvironment;
  time_of_day_session?: TradingSession;
  news_event_driver?: boolean;
  news_event_details?: string;

  management_actions?: TradeManagementAction[]; 
  management_actions_notes?: string; 
  correlated_asset_ticker?: string;
  correlated_asset_behavior?: CorrelatedAssetBehavior;
  atr_at_entry?: number; 

  system_pnl_r?: number; 
  cost_of_discretion_r?: number; 
  chart_image_url?: string; 
  tags?: string[];
  lessons_learned: string; 
  mistake_rule_broken?: string; 
  mistake_reason?: string; 
  notes?: string; 
  linked_concept_ids?: string[];
}

export type AccountCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'BTC' | 'ETH' | 'USDT';

export interface Account {
  id: string;
  user_id?: string;
  name: string;
  broker: string;
  initial_balance: number;
  current_balance: number;
  currency: AccountCurrency;
  created_at: string; // ISO string
  is_active: boolean;
  notes?: string;
  // Prop Firm Fields
  is_prop_firm_challenge?: boolean;
  prop_firm_name?: string; // e.g., FTMO, MyForexFunds
  prop_firm_profit_target_percent?: number; // e.g., 8 for 8%
  prop_firm_max_daily_loss_percent?: number; // e.g., 5 for 5%
  prop_firm_max_total_drawdown_percent?: number; // e.g., 10 for 10%
  prop_firm_current_profit_percent?: number; 
  prop_firm_highest_daily_loss_encountered_percent?: number; 
  prop_firm_current_total_drawdown_percent?: number; 
  prop_firm_challenge_start_date?: string; // ISO string
  prop_firm_challenge_end_date?: string; // ISO string
}

export enum OldNoteSourceType { // Renamed to avoid conflict, will be removed from Note
  MENTOR = 'Mentor',
  YOUTUBE = 'YouTube',
  COURSE = 'Course',
  BOOK = 'Book',
  ARTICLE = 'Article',
  PODCAST = 'Podcast',
  PERSONAL_INSIGHT = 'Personal Insight',
  OTHER = 'Other',
}

export enum SourceType {
  MENTOR = 'Mentor',
  YOUTUBE_CHANNEL = 'YouTube Channel',
  BOOK = 'Book',
  COURSE = 'Course',
  ARTICLE_WEBSITE = 'Article/Website',
  PODCAST_SERIES = 'Podcast Series',
  PERSONAL_JOURNAL = 'Personal Journal', // For personal insights not tied to external source
  OTHER = 'Other',
}

export interface Source {
  id: string;
  user_id?: string;
  name: string; // e.g., "ICT Mentorship", "TraderNick Channel", "Trading in the Zone"
  description?: string;
  source_type: SourceType;
  main_link?: string; // e.g., Channel URL, Book Amazon page
  icon_url?: string; // Optional: for visual flair, e.g., channel logo
  created_at: string;
  updated_at: string;
}
export interface Note {
  id: string;
  user_id?: string;
  title: string;
  content: string; // Markdown supported
  source_id: string; // Links to a Source
  content_collection_name: string; // e.g., "2022 Mentorship Q1", "Chapter 3 - The Nature of Belief"
  tags?: string[];
  key_takeaways?: string[];
  actionable_rules?: string[];
  created_at: string; 
  updated_at: string; 
  linked_playbook_ids?: string[];
  linked_trade_ids?: string[];
  linked_concept_ids?: string[];
  chart_screenshot_url?: string; 
  youtube_timestamp_link?: string; // e.g., https://youtube.com/watch?v=example&t=120s
  // file_attachments: FileAttachment[]; // Future: For PDFs, etc.
}


export interface Playbook {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  rules: string[]; 
  created_at?: string; 
  updated_at?: string; 
  key_learnings?: string[];
  linked_concept_ids?: string[];
}

export interface EquityDataPoint {
  date: string; 
  value: number; 
  drawdown?: number; 
  is_currency?: boolean;
}

export interface RollingPerformanceDataPoint {
    trade_count: number; 
    value: number; 
}

export interface ReviewLogEntry { // This type is for the old ReviewPage, will be replaced.
  id: string;
  review_date: string; 
  period_covered: string; 
  common_mistake: string;
  best_playbook: string;
  psychological_challenge: string;
  improvement_action: string;
  created_at: string; 
}

export interface PerformanceGoal {
    target_monthly_r_multiple?: number;
}

export interface PerformanceMetrics {
    total_trades: number;
    win_rate: number;
    loss_rate: number;
    breakeven_rate: number;
    avg_r: number;
    total_r: number;
    profit_factor: number;
    expectancy: number; 
    avg_win_r: number;
    avg_loss_r: number;
    gross_profit_r: number;
    gross_loss_r: number;
    max_drawdown_r: number; 
    max_drawdown_currency?: number; 
    max_drawdown_percent?: number; 
    longest_win_streak: number;
    longest_loss_streak: number;
    avg_rule_adherence?: number;
    avg_exit_efficiency?: number; 
    net_pnl_currency?: number;
    monthly_return_percent?: number; 
    weekly_return_percent?: number; 
    playbook_expectancy_r?: number;
}

export interface TimePeriodPnlData {
    period: string; 
    total_r: number;
    trade_count: number;
    total_pnl_currency?: number; 
}

export interface TradeDurationDetails {
    avg_ms: number;
    min_ms: number;
    max_ms: number;
    avg_formatted: string;
    min_formatted: string;
    max_formatted: string;
}

export interface PlaybookPsychologicalProfile {
    common_moods: { mood: EmotionalState, count: number }[];
    common_mistakes: { mistake: string, count: number }[];
}

export interface PlaybookEnvPerformance {
    environment: MarketEnvironment | TradingSession | string; 
    profit_factor: number;
    expectancy: number;
    trade_count: number;
    avg_r: number;
    win_rate: number;
}

export type UnderstandingLevel = 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
export type SelfRatedConfidence = 1 | 2 | 3 | 4 | 5;

export interface Concept {
  id: string;
  user_id?: string;
  name: string;
  description: string;
  understanding_level: UnderstandingLevel;
  last_reviewed: string; // ISO date string
  self_rated_confidence: SelfRatedConfidence;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// --- New Types for Daily Price Action Log ---
export enum Bias {
  BULLISH = 'Bullish',
  BEARISH = 'Bearish',
  NEUTRAL = 'Neutral',
}

export enum YesNoNeutral {
  YES = 'Yes',
  NO = 'No',
  NEUTRAL = 'Partially / Neutral',
}

export type EmotionDisciplineScore = 1 | 2 | 3 | 4 | 5;

// DailyLogConfluence enum is removed as confluences are now strings

export interface BasePriceActionLog {
  id: string;
  user_id?: string;
  log_date_time: string; // ISO string for date and time of logging (when the log entry itself was created)
  entry_date: string; // YYYY-MM-DD for the trading day this log refers to
  tradeable_asset: string; // e.g., EUR/USD, ES
  trading_session: TradingSession; // Asia, London, NY
}

export interface PreTradingLogEntry extends BasePriceActionLog {
  type: 'pre';
  bias: Bias;
  key_htf_narrative: string; // Daily/4H context, Liquidity/OB
  intraday_plan: string; // Specific setup idea
  key_levels_to_watch: string; // Manual input
  expected_liquidity: string; // Where is it resting?
  confluences: string[]; // Changed from DailyLogConfluence[]
  news_events_to_consider?: string;
  mindset_intentions: string; // Mood, sleep, focus
  screenshot_url?: string; // URL to the chart screenshot
}

export interface PostTradingLogEntry extends BasePriceActionLog {
  type: 'post';
  price_behavior_summary: string;
  was_bias_accurate: YesNoNeutral;
  missed_opportunities: boolean;
  missed_opportunities_details?: string;
  did_follow_plan: YesNoNeutral;
  plan_deviation_details?: string;
  trades_taken_summary: string; // e.g., "Long EURUSD @ 1.0750, SL 1.0730, TP 1.0790, +2R"
  emotion_discipline_rating: EmotionDisciplineScore;
  trade_execution_score?: EmotionDisciplineScore; // Added for stat card
  what_you_did_well: string;
  what_to_improve: string;
  screenshot_url_post?: string; // URL to the updated chart
}

export type PriceActionLogEntry = PreTradingLogEntry | PostTradingLogEntry;