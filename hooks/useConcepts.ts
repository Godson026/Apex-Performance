

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import { Concept } from '../types';

export const useConcepts = () => {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchConcepts = useCallback(async () => {
    if (!currentUser) {
      setConcepts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from('concepts')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('name', { ascending: true });
      
    if (fetchError) {
      console.error("Error fetching concepts:", fetchError);
      setError(fetchError.message);
      setConcepts([]);
    } else {
      setConcepts(data as Concept[]);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchConcepts();
  }, [fetchConcepts]);

  const getConcepts = useCallback((): Concept[] => {
    return [...concepts].sort((a,b) => a.name.localeCompare(b.name));
  }, [concepts]);

  const getConceptById = useCallback((conceptId: string): Concept | undefined => {
    return concepts.find(c => c.id === conceptId);
  }, [concepts]);

  const addConcept = useCallback(async (newConceptData: Omit<Concept, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!currentUser) {
      setError("You must be logged in to add a concept.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
      const conceptToInsert = {
        ...newConceptData,
        user_id: currentUser.id,
      };

      const { data, error: insertError } = await supabase
        .from('concepts')
        .insert([conceptToInsert])
        .select();

      if (insertError) throw insertError;

      if (data) {
        const newConcept = data[0] as Concept;
        setConcepts(prevConcepts => [...prevConcepts, newConcept].sort((a,b)=> a.name.localeCompare(b.name)));
        return newConcept;
      }
      throw new Error("Failed to add concept: No data returned.");
    } catch (e: any) {
      setError(`Failed to add concept: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const updateConcept = useCallback(async (updatedConceptData: Concept) => {
    if (!currentUser) {
      setError("You must be logged in to update a concept.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
      const finalConcept = { 
        ...updatedConceptData, 
        updated_at: new Date().toISOString(),
      };

      const { id, user_id, created_at, ...conceptToUpdate } = finalConcept;

      const { data, error: updateError } = await supabase
        .from('concepts')
        .update(conceptToUpdate)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select();

      if (updateError) throw updateError;
      
      if (data) {
        const updatedConcept = data[0] as Concept;
        setConcepts(prevConcepts => 
          prevConcepts.map(c => c.id === updatedConcept.id ? updatedConcept : c)
                       .sort((a,b) => a.name.localeCompare(b.name))
        );
        return updatedConcept;
      }
      throw new Error("Failed to update concept: No data returned.");
    } catch (e: any) {
      setError(`Failed to update concept: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const deleteConcept = useCallback(async (conceptId: string) => {
    if (!currentUser) {
      setError("You must be logged in to delete a concept.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('concepts')
        .delete()
        .eq('id', conceptId)
        .eq('user_id', currentUser.id);

      if (deleteError) throw deleteError;

      setConcepts(prevConcepts => prevConcepts.filter(c => c.id !== conceptId));
    } catch (e: any) {
      setError(`Failed to delete concept: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  return { 
    concepts, getConcepts, getConceptById, addConcept, updateConcept, deleteConcept, 
    isLoading, error 
  };
};