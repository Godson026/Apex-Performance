
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import { Account } from '../types';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchAccounts = useCallback(async () => {
    if (!currentUser) {
      setAccounts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('name', { ascending: true });
    
    if (fetchError) {
      console.error("Error fetching accounts:", fetchError);
      setError(fetchError.message);
      setAccounts([]);
    } else {
      setAccounts(data as Account[]);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = useCallback(async (newAccountData: Omit<Account, 'id' | 'created_at' | 'user_id'>) => {
    if (!currentUser) {
      setError("You must be logged in to add an account.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const accountToInsert = { ...newAccountData, user_id: currentUser.id };
      const { data, error: insertError } = await supabase
        .from('accounts')
        .insert([accountToInsert])
        .select();

      if (insertError) throw insertError;
      
      if (data) {
        const newAccount = data[0] as Account;
        setAccounts(prevAccounts => [...prevAccounts, newAccount].sort((a,b) => a.name.localeCompare(b.name)));
        return newAccount;
      }
      throw new Error("Failed to add account: No data returned.");

    } catch (e: any) {
      setError(`Failed to add account: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const updateAccount = useCallback(async (updatedAccountData: Account) => {
    if (!currentUser) {
      setError("You must be logged in to update an account.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const { id, user_id, created_at, ...accountToUpdate } = updatedAccountData;
      const { data, error: updateError } = await supabase
        .from('accounts')
        .update(accountToUpdate)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select();

      if (updateError) throw updateError;
      
      if(data) {
        const updatedAccount = data[0] as Account;
        setAccounts(prevAccounts => 
          prevAccounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc)
                      .sort((a,b) => a.name.localeCompare(b.name))
        );
        return updatedAccount;
      }
      throw new Error("Failed to update account: No data returned.");

    } catch (e: any) {
      setError(`Failed to update account: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);
  
  const getAccountById = useCallback((accountId: string): Account | undefined => {
    return accounts.find(acc => acc.id === accountId);
  }, [accounts]);

  const getActiveAccounts = useCallback((): Account[] => {
    return accounts.filter(acc => acc.is_active).sort((a,b) => a.name.localeCompare(b.name));
  }, [accounts]);

  return { accounts, addAccount, updateAccount, getAccountById, getActiveAccounts, isLoading, error };
};
