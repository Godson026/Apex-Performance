
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import { Note } from '../types';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (!currentUser) {
      setNotes([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('updated_at', { ascending: false });
      
    if (fetchError) {
      console.error("Error fetching notes:", fetchError);
      setError(fetchError.message);
      setNotes([]);
    } else {
      setNotes(data as Note[]);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(async (newNoteData: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!currentUser) {
      setError("You must be logged in to add a note.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
      const noteToInsert: Omit<Note, 'id' | 'created_at' | 'updated_at'> = {
        ...newNoteData,
        user_id: currentUser.id,
        tags: newNoteData.tags || [],
        key_takeaways: newNoteData.key_takeaways || [],
        actionable_rules: newNoteData.actionable_rules || [],
        linked_concept_ids: newNoteData.linked_concept_ids || [],
        chart_screenshot_url: newNoteData.chart_screenshot_url || undefined,
        youtube_timestamp_link: newNoteData.youtube_timestamp_link || undefined,
      };

      const { data, error: insertError } = await supabase
        .from('notes')
        .insert([noteToInsert])
        .select();

      if (insertError) throw insertError;
      
      if (data) {
        const newNote = data[0] as Note;
        setNotes(prevNotes => [newNote, ...prevNotes].sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
        return newNote;
      }
      throw new Error("Failed to add note: No data returned.");
    } catch (e: any) {
      setError(`Failed to add note: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const updateNote = useCallback(async (updatedNoteData: Note) => {
    if (!currentUser) {
      setError("You must be logged in to update a note.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
      const finalNote = { 
        ...updatedNoteData, 
        updated_at: new Date().toISOString(),
        tags: updatedNoteData.tags || [],
        key_takeaways: updatedNoteData.key_takeaways || [],
        actionable_rules: updatedNoteData.actionable_rules || [],
        linked_concept_ids: updatedNoteData.linked_concept_ids || [],
        chart_screenshot_url: updatedNoteData.chart_screenshot_url || undefined,
        youtube_timestamp_link: updatedNoteData.youtube_timestamp_link || undefined,
      };

      const { id, user_id, created_at, ...noteToUpdate } = finalNote;
      
      const { data, error: updateError } = await supabase
        .from('notes')
        .update(noteToUpdate)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select();

      if (updateError) throw updateError;
      
      if (data) {
        const updatedNote = data[0] as Note;
        setNotes(prevNotes => prevNotes.map(n => n.id === updatedNote.id ? updatedNote : n).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
        return updatedNote;
      }
      throw new Error("Failed to update note: No data returned.");
    } catch (e: any) {
      setError(`Failed to update note: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);
  
  const deleteNote = useCallback(async (noteId: string) => {
    if (!currentUser) {
      setError("You must be logged in to delete a note.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', currentUser.id);

      if (deleteError) throw deleteError;
      
      setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
    } catch (e: any) {
      setError(`Failed to delete note: ${e.message}`);
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const getNoteById = useCallback((noteId: string): Note | undefined => {
    return notes.find(n => n.id === noteId);
  }, [notes]);
  
  const getNotesBySourceAndCollection = useCallback((sourceId: string, contentCollectionName: string): Note[] => {
    return notes.filter(note => note.source_id === sourceId && note.content_collection_name === contentCollectionName)
                .sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [notes]);
  
  const getContentCollectionsForSource = useCallback((sourceId: string): string[] => {
    const collections = new Set<string>();
    notes.forEach(note => {
        if (note.source_id === sourceId) {
            collections.add(note.content_collection_name);
        }
    });
    return Array.from(collections).sort();
  }, [notes]);

  return { 
    notes, addNote, updateNote, deleteNote, getNoteById, 
    getNotesBySourceAndCollection, getContentCollectionsForSource,
    isLoading, error 
  };
};
