
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import { Trade, TradeOutcome, TradeDirection } from '../types';

const calculateTradeDuration = (entryTimestamp: string, exitTimestamp?: string): { durationString?: string, durationMs?: number } => {
  if (!exitTimestamp) return { durationString: undefined, durationMs: undefined };
  const entryTime = new Date(entryTimestamp).getTime();
  const exitTime = new Date(exitTimestamp).getTime();
  if (isNaN(entryTime) || isNaN(exitTime) || exitTime < entryTime) return { durationString: undefined, durationMs: undefined };

  let diffMs = exitTime - entryTime;
  const totalMs = diffMs;
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  diffMs -= days * (1000 * 60 * 60 * 24);

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hours * (1000 * 60 * 60);

  const minutes = Math.floor(diffMs / (1000 * 60));
  
  let durationString = "";
  if (days > 0) durationString += `${days}d `;
  if (hours > 0) durationString += `${hours}h `;
  if (minutes > 0 || durationString === "") durationString += `${minutes}m`;
  
  return { durationString: durationString.trim(), durationMs: totalMs };
};

export const useTrades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchTrades = useCallback(async () => {
    if (!currentUser) {
      setTrades([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('entry_timestamp', { ascending: false });

    if (fetchError) {
      console.error("Error fetching trades:", fetchError);
      setError(fetchError.message);
      setTrades([]);
    } else {
      setTrades(data as Trade[]);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const addTrade = useCallback(async (newTradeData: Omit<Trade, 'id' | 'direction' | 'outcome' | 'r_multiple' | 'trade_duration' | 'trade_duration_ms' | 'cost_of_discretion_r' | 'user_id'>) => {
    if (!currentUser) {
      setError("You must be logged in to add a trade.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      let direction = newTradeData.entry_price < (newTradeData.exit_price || newTradeData.entry_price) ? TradeDirection.LONG : TradeDirection.SHORT;
      if (!newTradeData.exit_price && newTradeData.stop_loss_price) { 
        if (newTradeData.stop_loss_price < newTradeData.entry_price) direction = TradeDirection.LONG;
        else direction = TradeDirection.SHORT;
      }
      
      let outcome: TradeOutcome | undefined = undefined;
      let r_multiple: number | undefined = undefined;

      if (newTradeData.exit_price !== undefined && newTradeData.exit_timestamp && newTradeData.stop_loss_price) { 
        const pnlPerShare = newTradeData.exit_price - newTradeData.entry_price;
        const riskPerShare = Math.abs(newTradeData.entry_price - newTradeData.stop_loss_price); 
        
        if (riskPerShare === 0) { 
            outcome = TradeOutcome.BREAKEVEN; 
            r_multiple = 0;
        } else {
            if (direction === TradeDirection.LONG) {
                r_multiple = pnlPerShare / riskPerShare;
            } else { // SHORT
                r_multiple = -pnlPerShare / riskPerShare; 
            }

            if (r_multiple > 0.05) outcome = TradeOutcome.WIN;
            else if (r_multiple < -0.05) outcome = TradeOutcome.LOSS;
            else outcome = TradeOutcome.BREAKEVEN;
        }
        r_multiple = parseFloat(r_multiple.toFixed(2));
      }

      let cost_of_discretion_r: number | undefined = undefined;
      if (newTradeData.system_pnl_r !== undefined && r_multiple !== undefined) {
        cost_of_discretion_r = parseFloat((newTradeData.system_pnl_r - r_multiple).toFixed(2));
      }
      
      const durationInfo = calculateTradeDuration(newTradeData.entry_timestamp, newTradeData.exit_timestamp);
      
      const newTrade: Omit<Trade, 'id'> = {
        ...newTradeData,
        user_id: currentUser.id,
        direction,
        outcome,
        r_multiple,
        cost_of_discretion_r,
        trade_duration: durationInfo.durationString,
        trade_duration_ms: durationInfo.durationMs,
        position_size: newTradeData.position_size || 100, // Default or pass through
        mfe: newTradeData.mfe !== undefined ? newTradeData.mfe : (r_multiple && r_multiple > 0 ? parseFloat((r_multiple + Math.random() * 0.5).toFixed(2)) : parseFloat((Math.random()*0.5).toFixed(2))), 
        mae: newTradeData.mae !== undefined ? newTradeData.mae : (r_multiple && r_multiple < 0 ? parseFloat((Math.abs(r_multiple) + Math.random() * 0.5).toFixed(2)) : parseFloat((Math.random()*0.5).toFixed(2))), 
        linked_concept_ids: newTradeData.linked_concept_ids || [],
      };
      
      const { data, error: insertError } = await supabase
        .from('trades')
        .insert([newTrade]) // Use 'as any' to bypass strict TS check if it persists after fixes
        .select();

      if (insertError) {
        console.error("Error adding trade:", insertError);
        setError(insertError.message);
      } else if (data) {
        setTrades(prevTrades => [data[0] as Trade, ...prevTrades].sort((a,b) => new Date(b.entry_timestamp).getTime() - new Date(a.entry_timestamp).getTime()));
      }
    } catch (e: any) {
        setError("Failed to process and add trade.");
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }, [currentUser]);

  const updateTrade = useCallback(async (updatedTrade: Trade) => {
    if (!currentUser) {
      setError("You must be logged in to update a trade.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      let r_multiple = updatedTrade.r_multiple;
      if (updatedTrade.exit_price !== undefined && updatedTrade.exit_timestamp && updatedTrade.stop_loss_price) {
          const pnlPerShare = updatedTrade.exit_price - updatedTrade.entry_price;
          const riskPerShare = Math.abs(updatedTrade.entry_price - updatedTrade.stop_loss_price);
          if (riskPerShare === 0) {
              r_multiple = 0;
          } else {
              if (updatedTrade.direction === TradeDirection.LONG) {
                  r_multiple = pnlPerShare / riskPerShare;
              } else {
                  r_multiple = -pnlPerShare / riskPerShare;
              }
          }
          r_multiple = parseFloat(r_multiple.toFixed(2));
      }

      let cost_of_discretion_r: number | undefined = updatedTrade.cost_of_discretion_r;
      if (updatedTrade.system_pnl_r !== undefined && r_multiple !== undefined) {
        cost_of_discretion_r = parseFloat((updatedTrade.system_pnl_r - r_multiple).toFixed(2));
      }
      
      const durationInfo = calculateTradeDuration(updatedTrade.entry_timestamp, updatedTrade.exit_timestamp);

      const tradeWithRecalcs = {
        ...updatedTrade,
        r_multiple, 
        cost_of_discretion_r,
        trade_duration: durationInfo.durationString,
        trade_duration_ms: durationInfo.durationMs,
        linked_concept_ids: updatedTrade.linked_concept_ids || [],
      };

      const { id, user_id, ...tradeToUpdate } = tradeWithRecalcs;

      const { data, error: updateError } = await supabase
        .from('trades')
        .update(tradeToUpdate) // Use 'as any' to bypass strict TS check
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select();

      if (updateError) {
        throw updateError;
      }
      
      if (data) {
          setTrades(prevTrades => prevTrades.map(t => t.id === updatedTrade.id ? data[0] as Trade : t)
                                            .sort((a,b) => new Date(b.entry_timestamp).getTime() - new Date(a.entry_timestamp).getTime()));
      }

    } catch (e: any) {
      setError(`Failed to update trade: ${e.message}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const deleteTrade = useCallback(async (tradeId: string) => {
    if (!currentUser) {
      setError("You must be logged in to delete a trade.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)
        .eq('user_id', currentUser.id);

      if (deleteError) throw deleteError;
      
      setTrades(prevTrades => prevTrades.filter(t => t.id !== tradeId));
    } catch (e: any) {
      setError(`Failed to delete trade: ${e.message}`);
      console.error(e);
    } finally {
        setIsLoading(false);
    }
  }, [currentUser]);
  
  const getTradeById = useCallback((tradeId: string): Trade | undefined => {
    return trades.find(t => t.id === tradeId);
  }, [trades]);

  return { trades, addTrade, updateTrade, deleteTrade, getTradeById, isLoading, error };
};
