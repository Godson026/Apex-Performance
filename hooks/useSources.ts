
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import { Source } from '../types';

export const useSources = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchSources = useCallback(async () => {
    if (!currentUser) {
      setSources([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from('sources')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('name', { ascending: true });
      
    if (fetchError) {
      console.error("Error fetching sources:", fetchError);
      setError(fetchError.message);
      setSources([]);
    } else {
      setSources(data as Source[]);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);


  const getSources = useCallback((): Source[] => {
    return [...sources].sort((a, b) => a.name.localeCompare(b.name));
  }, [sources]);

  const getSourceById = useCallback((sourceId: string): Source | undefined => {
    return sources.find(s => s.id === sourceId);
  }, [sources]);

  const addSource = useCallback(async (newSourceData: Omit<Source, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!currentUser) {
      setError("You must be logged in to add a source.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
      const sourceToInsert = { ...newSourceData, user_id: currentUser.id };
      const { data, error: insertError } = await supabase
        .from('sources')
        .insert([sourceToInsert])
        .select();
        
      if (insertError) throw insertError;

      if (data) {
        const newSource = data[0] as Source;
        setSources(prevSources => [...prevSources, newSource].sort((a, b) => a.name.localeCompare(b.name)));
        return newSource;
      }
      throw new Error("Failed to add source: No data returned.");
    } catch (e: any) {
      setError(`Failed to add source: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const updateSource = useCallback(async (updatedSourceData: Source) => {
    if (!currentUser) {
      setError("You must be logged in to update a source.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
      const { id, user_id, created_at, ...sourceToUpdate } = { ...updatedSourceData, updated_at: new Date().toISOString() };
      const { data, error: updateError } = await supabase
        .from('sources')
        .update(sourceToUpdate)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select();

      if (updateError) throw updateError;
      
      if (data) {
        const updatedSource = data[0] as Source;
        setSources(prevSources =>
          prevSources.map(s => (s.id === updatedSource.id ? updatedSource : s)).sort((a, b) => a.name.localeCompare(b.name))
        );
        return updatedSource;
      }
      throw new Error("Failed to update source: No data returned.");
    } catch (e: any) {
      setError(`Failed to update source: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const deleteSource = useCallback(async (sourceId: string) => {
    if (!currentUser) {
      setError("You must be logged in to delete a source.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('sources')
        .delete()
        .eq('id', sourceId)
        .eq('user_id', currentUser.id);

      if (deleteError) throw deleteError;

      setSources(prevSources => prevSources.filter(s => s.id !== sourceId));
      // In a real app with foreign key constraints, you might want to handle notes
      // associated with this source (e.g., set their source_id to null).
    } catch (e: any) {
      setError(`Failed to delete source: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  return { sources, getSources, getSourceById, addSource, updateSource, deleteSource, isLoading, error };
};
