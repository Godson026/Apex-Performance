
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import { Playbook } from '../types';

export const usePlaybooks = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchPlaybooks = useCallback(async () => {
    if (!currentUser) {
      setPlaybooks([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('playbooks')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('name', { ascending: true });
      
    if (fetchError) {
      console.error("Error fetching playbooks:", fetchError);
      setError(fetchError.message);
      setPlaybooks([]);
    } else {
      setPlaybooks(data as Playbook[]);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchPlaybooks();
  }, [fetchPlaybooks]);


  const getPlaybooks = useCallback((): Playbook[] => {
    return [...playbooks].sort((a,b) => a.name.localeCompare(b.name));
  }, [playbooks]);

  const getPlaybookById = useCallback((playbookId: string): Playbook | undefined => {
    return playbooks.find(p => p.id === playbookId);
  }, [playbooks]);

  const addPlaybook = useCallback(async (newPlaybookData: Omit<Playbook, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!currentUser) {
      setError("You must be logged in to add a playbook.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    
    try {
        const playbookToInsert = { 
            ...newPlaybookData, 
            user_id: currentUser.id,
            key_learnings: newPlaybookData.key_learnings || [],
            linked_concept_ids: newPlaybookData.linked_concept_ids || [],
        };

        const { data, error: insertError } = await supabase
          .from('playbooks')
          .insert([playbookToInsert])
          .select();
        
        if (insertError) throw insertError;

        if (data) {
          const newPlaybook = data[0] as Playbook;
          setPlaybooks(prevPlaybooks => [...prevPlaybooks, newPlaybook].sort((a,b)=> a.name.localeCompare(b.name)));
          return newPlaybook;
        }
        throw new Error("Failed to add playbook: No data returned.");
    } catch (e: any) {
        setError(`Failed to add playbook: ${e.message}`);
        console.error(e);
        throw e;
    } finally {
        setIsLoading(false);
    }
  }, [currentUser]);

  const updatePlaybook = useCallback(async (updatedPlaybookData: Playbook) => {
    if (!currentUser) {
      setError("You must be logged in to update a playbook.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    
    try {
        const finalData = { 
            ...updatedPlaybookData, 
            updated_at: new Date().toISOString(),
            key_learnings: updatedPlaybookData.key_learnings || [],
            linked_concept_ids: updatedPlaybookData.linked_concept_ids || [],
        };

        const { id, user_id, created_at, ...playbookToUpdate } = finalData;
        
        const { data, error: updateError } = await supabase
            .from('playbooks')
            .update(playbookToUpdate)
            .eq('id', id)
            .eq('user_id', currentUser.id)
            .select();

        if (updateError) throw updateError;
        
        if(data) {
          const updatedPlaybook = data[0] as Playbook;
          setPlaybooks(prevPlaybooks => 
              prevPlaybooks.map(pb => pb.id === updatedPlaybook.id ? updatedPlaybook : pb)
                           .sort((a,b) => a.name.localeCompare(b.name))
          );
          return updatedPlaybook;
        }
        throw new Error("Failed to update playbook: No data returned.");

    } catch (e: any) {
        setError(`Failed to update playbook: ${e.message}`);
        console.error(e);
        throw e;
    } finally {
        setIsLoading(false);
    }
  }, [currentUser]);

  const deletePlaybook = useCallback(async (playbookId: string) => {
    if (!currentUser) {
      setError("You must be logged in to delete a playbook.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
        const { error: deleteError } = await supabase
          .from('playbooks')
          .delete()
          .eq('id', playbookId)
          .eq('user_id', currentUser.id);
        
        if (deleteError) throw deleteError;

        setPlaybooks(prevPlaybooks => prevPlaybooks.filter(pb => pb.id !== playbookId));
    } catch (e: any) {
        setError(`Failed to delete playbook: ${e.message}`);
        console.error(e);
        throw e;
    } finally {
        setIsLoading(false);
    }
  }, [currentUser]);

  return { playbooks, getPlaybooks, getPlaybookById, addPlaybook, updatePlaybook, deletePlaybook, isLoading, error };
};
