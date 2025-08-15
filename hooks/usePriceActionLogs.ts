
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import { PriceActionLogEntry } from '../types';

export const usePriceActionLogs = () => {
  const [logs, setLogs] = useState<PriceActionLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchLogs = useCallback(async () => {
    if (!currentUser) {
      setLogs([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from('price_action_logs')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('entry_date', { ascending: false })
      .order('log_date_time', { ascending: false });

    if (fetchError) {
      console.error("Error fetching price action logs:", fetchError);
      setError(fetchError.message);
      setLogs([]);
    } else {
      setLogs(data as PriceActionLogEntry[]);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = useCallback(async (newLogData: Omit<PriceActionLogEntry, 'id' | 'user_id'>) => {
    if (!currentUser) {
      setError("You must be logged in to add a log.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const logToInsert = { ...newLogData, user_id: currentUser.id };
      const { data, error: insertError } = await supabase
        .from('price_action_logs')
        .insert([logToInsert])
        .select();

      if (insertError) throw insertError;
      
      if (data) {
        const newLog = data[0] as PriceActionLogEntry;
        setLogs(prevLogs => [newLog, ...prevLogs].sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime() || new Date(b.log_date_time).getTime() - new Date(a.log_date_time).getTime()));
        return newLog;
      }
      throw new Error("Failed to add price action log: No data returned.");

    } catch (e: any) {
      setError(`Failed to add log: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const deleteLog = useCallback(async (logId: string) => {
    if (!currentUser) {
      setError("You must be logged in to delete a log.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('price_action_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', currentUser.id);

      if (deleteError) throw deleteError;
      
      setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
    } catch (e: any) {
      setError(`Failed to delete log: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  return { logs, addLog, deleteLog, isLoading, error };
};
