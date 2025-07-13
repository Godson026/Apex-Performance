

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import { useNotes } from '../hooks/useNotes';
import { Note, Source, SourceType, Concept, UnderstandingLevel, SelfRatedConfidence } from '../types';
import { ICONS, SOURCE_TYPES_ARRAY, PRE_SUGGESTED_TAGS, UNDERSTANDING_LEVELS, SELF_RATED_CONFIDENCE_SCORES } from '../constants';
import { useSources } from '../hooks/useSources';
import { useConcepts } from '../hooks/useConcepts';


const SourceIcon: React.FC<{ sourceType?: SourceType, className?: string }> = ({ sourceType, className = "w-4 h-4" }) => {
    if (!sourceType) { // Handle undefined sourceType gracefully
        return <ICONS.DOCUMENT_TEXT className={`${className} text-light-text-secondary dark:text-dark-text-secondary`} />;
    }
    const IconComponent = 
        sourceType === SourceType.BOOK ? ICONS.BOOK_OPEN :
        sourceType === SourceType.YOUTUBE_CHANNEL ? ICONS.VIDEO_CAMERA :
        sourceType === SourceType.COURSE ? ICONS.VIDEO_CAMERA : 
        sourceType === SourceType.MENTOR ? ICONS.USER_CIRCLE :
        sourceType === SourceType.ARTICLE_WEBSITE ? ICONS.GLOBE_ALT :
        sourceType === SourceType.PODCAST_SERIES ? ICONS.MICROPHONE :
        sourceType === SourceType.PERSONAL_JOURNAL ? ICONS.LIGHTBULB :
        ICONS.DOCUMENT_TEXT; 
    return <IconComponent className={`${className} text-light-text-secondary dark:text-dark-text-secondary`} />;
};


const NoteEditor: React.FC<{ 
    note?: Note; 
    sources: Source[];
    concepts: Concept[];
    onSave: (noteData: Omit<Note, 'id'|'created_at'|'updated_at'> | Note) => Promise<void>; 
    onClose: () => void; 
    isLoadingParent: boolean; 
}> = ({ note, sources, concepts, onSave, onClose, isLoadingParent }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [selectedSourceId, setSelectedSourceId] = useState<string>(note?.source_id || (sources.length > 0 ? sources[0].id : ''));
  const [contentCollectionName, setContentCollectionName] = useState<string>(note?.content_collection_name || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(note?.key_takeaways || []);
  const [actionableRules, setActionableRules] = useState<string[]>(note?.actionable_rules || []);
  const [chartScreenshotUrl, setChartScreenshotUrl] = useState<string>(note?.chart_screenshot_url || '');
  const [youtubeTimestampLink, setYoutubeTimestampLink] = useState<string>(note?.youtube_timestamp_link || '');
  const [linkedConceptIds, setLinkedConceptIds] = useState<string[]>(note?.linked_concept_ids || []);
  
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [formError, setFormError] = useState('');

  const handleAddTag = (tag: string) => {
    const newTag = tag.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setCurrentTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleToggleConcept = (conceptId: string) => {
    setLinkedConceptIds(prev => 
        prev.includes(conceptId) ? prev.filter(id => id !== conceptId) : [...prev, conceptId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedSourceId || !contentCollectionName.trim()) {
      setFormError('Title, Content, Source, and Collection Name are required.');
      return;
    }
    setFormError('');
    const noteData = {
      ...(note ? { ...note, id: note.id, created_at: note.created_at } : {}), 
      title,
      content,
      source_id: selectedSourceId,
      content_collection_name: contentCollectionName,
      tags,
      key_takeaways: keyTakeaways,
      actionable_rules: actionableRules,
      chart_screenshot_url: chartScreenshotUrl || undefined,
      youtube_timestamp_link: youtubeTimestampLink || undefined,
      linked_concept_ids: linkedConceptIds,
    };
    if (note) {
        await onSave(noteData as Note);
    } else {
        await onSave(noteData as Omit<Note, 'id'|'created_at'|'updated_at'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
      <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <Textarea 
        label="Content" 
        value={content} 
        onChange={e => setContent(e.target.value)} 
        rows={6} 
        required 
        helperText="Markdown is supported for formatting (e.g., # H1, *italic*, **bold**, - list item)."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
            label="Source"
            value={selectedSourceId}
            onChange={e => setSelectedSourceId(e.target.value)}
            options={sources.length > 0 ? sources.map(s => ({ value: s.id, label: s.name })) : [{value: '', label: 'No sources available'}]}
            placeholder="Select a Source"
            required
            disabled={sources.length === 0}
        />
        <Input 
            label="Content Collection Name" 
            value={contentCollectionName} 
            onChange={e => setContentCollectionName(e.target.value)} 
            placeholder="e.g., Chapter 3, Video Series Part 1"
            required 
        />
      </div>
      
      <div>
        <Input
            label="Tags (Press Enter or Comma to add)"
            value={currentTagInput}
            onChange={(e) => setCurrentTagInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag(currentTagInput);
                }
            }}
            placeholder="Type a tag and press Enter"
        />
        <div className="my-1 flex flex-wrap gap-1">
            {PRE_SUGGESTED_TAGS.map(sTag => (
                !tags.includes(sTag.name) && (
                    <button key={sTag.name} type="button" onClick={() => handleAddTag(sTag.name)} className="px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-light-text dark:text-dark-text-secondary">
                        {sTag.emoji} {sTag.name}
                    </button>
                )
            ))}
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
            {tags.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs bg-primary-light/70 text-primary-dark dark:bg-primary-DEFAULT/80 dark:text-white rounded-full flex items-center">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 text-sm leading-none hover:text-red-500">&times;</button>
            </span>
            ))}
        </div>
      </div>

      <Textarea label="Key Takeaways (one per line)" value={keyTakeaways.join('\n')} onChange={e => setKeyTakeaways(e.target.value.split('\n').map(s => s.trim()))} rows={3} />
      <Textarea label="Actionable Rules (one per line)" value={actionableRules.join('\n')} onChange={e => setActionableRules(e.target.value.split('\n').map(s => s.trim()))} rows={3} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Chart Screenshot URL (Optional)" type="url" value={chartScreenshotUrl} onChange={e => setChartScreenshotUrl(e.target.value)} placeholder="https://your-image-host.com/chart.png"/>
        <Input label="YouTube Timestamp Link (Optional)" type="url" value={youtubeTimestampLink} onChange={e => setYoutubeTimestampLink(e.target.value)} placeholder="https://youtube.com/watch?v=...&t=120s"/>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Linked Concepts (Optional)</label>
        <div className="max-h-32 overflow-y-auto border border-light-border dark:border-dark-border rounded-md p-2 space-y-1 bg-light-card dark:bg-dark-card">
            {concepts.length > 0 ? concepts.map(concept => (
                <label key={concept.id} className="flex items-center space-x-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs">
                    <input 
                        type="checkbox" 
                        checked={linkedConceptIds.includes(concept.id)} 
                        onChange={() => handleToggleConcept(concept.id)}
                        className="form-checkbox h-3 w-3 text-primary-DEFAULT rounded border-gray-300 dark:border-slate-500 focus:ring-primary-light"
                    />
                    <span className="text-light-text dark:text-dark-text">{concept.name}</span>
                </label>
            )) : <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">No concepts available.</p>}
        </div>
      </div>

      <div className="pt-4 border-t border-light-border dark:border-dark-border mt-4 space-y-3">
        <h4 className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mt-2">Attachments (Future)</h4>
        <Button size="sm" variant="outline" disabled={true} leftIcon={<ICONS.UPLOAD className="w-3 h-3"/>}>Upload Files</Button>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Future: Attach PDFs, images, or other files directly to this note.</p>
      </div>


      {formError && <p className="text-sm text-danger">{formError}</p>}
      <div className="flex justify-end space-x-2 pt-2 sticky bottom-0 bg-light-card dark:bg-dark-card py-3 z-10">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoadingParent}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoadingParent} disabled={isLoadingParent}>
          {isLoadingParent ? (note ? 'Saving...' : 'Adding...') : (note ? 'Save Note' : 'Add Note')}
        </Button>
      </div>
    </form>
  );
};


const NoteCard: React.FC<{ 
    note: Note; 
    source: Source | undefined; 
    concepts: Concept[];
    onEdit: (note: Note) => void; 
    onDelete: (noteId: string) => Promise<void>; 
}> = ({ note, source, concepts, onEdit, onDelete }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    await onDelete(note.id);
    setShowConfirmDelete(false);
  };
  
  const handleCreatePlaybook = () => {
    navigate('/playbooks', { 
        state: { 
            noteTitle: `Playbook: ${note.title}`, 
            noteRules: note.actionable_rules 
        } 
    });
  };

  const linkedConceptsToDisplay = concepts.filter(c => note.linked_concept_ids?.includes(c.id));

  return (
    <Card className="flex flex-col h-full" title={note.title} titleAction={
        <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(note)}>Edit</Button>
            <Button size="sm" variant="danger" onClick={() => setShowConfirmDelete(true)}>Delete</Button>
        </div>
    }>
      <div className="flex-grow overflow-y-auto space-y-3 pr-1">
        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            <div className="flex items-center">
              <SourceIcon sourceType={source?.source_type} className="w-3.5 h-3.5 mr-1.5"/>
              <span>{source?.name || 'N/A'} - <span className="italic">{note.content_collection_name}</span></span>
              {note.youtube_timestamp_link ? (
                <a href={note.youtube_timestamp_link} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary-DEFAULT hover:underline">
                  <ICONS.VIDEO_CAMERA className="inline w-3.5 h-3.5"/> Watch
                </a>
              ) : source?.main_link && (
                <a href={source.main_link} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary-DEFAULT hover:underline">
                  <ICONS.LINK className="inline w-3.5 h-3.5"/> Source Link
                </a>
              )}
            </div>
          <p>Last updated: {new Date(note.updated_at).toLocaleDateString()}</p>
        </div>

        {note.chart_screenshot_url && (
            <div className="my-2">
                <img src={note.chart_screenshot_url} alt="Chart Screenshot" className="max-w-full h-auto rounded-md border border-light-border dark:border-dark-border" />
            </div>
        )}
        
        <div className="prose prose-sm dark:prose-invert max-w-none flex-grow mb-2 max-h-32 overflow-y-auto text-light-text dark:text-dark-text">
          <pre className="whitespace-pre-wrap font-sans text-sm">{note.content.substring(0, 300)}{note.content.length > 300 ? '...' : ''}</pre>
        </div>
        
        { (note.key_takeaways && note.key_takeaways.filter(k => k.trim()).length > 0) && (
          <div>
              <h4 className="text-xs font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary mb-0.5">Key Takeaways:</h4>
              <ul className="list-disc list-inside text-xs max-h-20 overflow-y-auto space-y-0.5 text-light-text dark:text-dark-text">
                  {note.key_takeaways.filter(k => k.trim()).map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
          </div>
        )}
        { (note.actionable_rules && note.actionable_rules.filter(r => r.trim()).length > 0) && (
          <div>
              <h4 className="text-xs font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary mb-0.5">Actionable Rules:</h4>
              <ul className="list-disc list-inside text-xs max-h-20 overflow-y-auto space-y-0.5 text-light-text dark:text-dark-text">
                  {note.actionable_rules.filter(r => r.trim()).map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
          </div>
        )}
         { (linkedConceptsToDisplay && linkedConceptsToDisplay.length > 0) && (
            <div>
                <h4 className="text-xs font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary mb-0.5">Linked Concepts:</h4>
                <div className="flex flex-wrap gap-1">
                    {linkedConceptsToDisplay.map(concept => (
                    <span key={concept.id} className="px-1.5 py-0.5 text-xxs bg-primary-light/50 text-primary-dark dark:bg-primary-dark/50 dark:text-primary-light rounded">
                        {concept.name}
                    </span>
                    ))}
                </div>
            </div>
        )}
        { (note.tags && note.tags.length > 0) && (
           <div>
              <h4 className="text-xs font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary mb-0.5">Tags:</h4>
              <div className="flex flex-wrap gap-1">
                  {note.tags.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 text-xxs bg-slate-200 dark:bg-slate-600 rounded text-light-text-secondary dark:text-dark-text-secondary">
                      {tag}
                  </span>
                  ))}
              </div>
          </div>
        )}
      </div>


      <div className="mt-auto pt-3 border-t border-light-border dark:border-dark-border flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={handleCreatePlaybook} leftIcon={<ICONS.PLAYBOOKS className="w-4 h-4"/>}>
            Create Playbook
        </Button>
      </div>

      <Modal isOpen={showConfirmDelete} onClose={() => setShowConfirmDelete(false)} title="Confirm Delete">
        <p className="text-light-text dark:text-dark-text">Are you sure you want to delete the note titled "{note.title}"?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </Card>
  );
};

// --- Source Form ---
const SourceForm: React.FC<{
    source?: Source;
    onSave: (sourceData: Omit<Source, 'id' | 'created_at' | 'updated_at'> | Source) => Promise<void>;
    onClose: () => void;
    isLoadingParent: boolean;
}> = ({ source, onSave, onClose, isLoadingParent }) => {
    const [name, setName] = useState(source?.name || '');
    const [description, setDescription] = useState(source?.description || '');
    const [sourceType, setSourceType] = useState<SourceType>(source?.source_type || SOURCE_TYPES_ARRAY[0]);
    const [mainLink, setMainLink] = useState(source?.main_link || '');
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !sourceType) {
            setFormError('Source Name and Type are required.');
            return;
        }
        setFormError('');
        const sourceData = {
            ...(source ? { ...source } : {}),
            name, description, source_type: sourceType, main_link: mainLink
        };
        await onSave(sourceData as Omit<Source, 'id' | 'created_at' | 'updated_at'> | Source);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <Input label="Source Name" value={name} onChange={e => setName(e.target.value)} required />
            <Select label="Source Type" value={sourceType} onChange={e => setSourceType(e.target.value as SourceType)} options={SOURCE_TYPES_ARRAY.map(st => ({ value: st, label: st }))} required />
            <Textarea label="Description (Optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            <Input label="Main Link (URL, Optional)" type="url" value={mainLink} onChange={e => setMainLink(e.target.value)} placeholder="https://example.com" />
            {formError && <p className="text-sm text-danger">{formError}</p>}
            <div className="flex justify-end space-x-2 pt-2 sticky bottom-0 bg-light-card dark:bg-dark-card py-3">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isLoadingParent}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={isLoadingParent} disabled={isLoadingParent}>
                    {isLoadingParent ? 'Saving...' : (source ? 'Save Source' : 'Add Source')}
                </Button>
            </div>
        </form>
    );
};

// --- Concept Form ---
const ConceptForm: React.FC<{
    concept?: Concept;
    onSave: (conceptData: Omit<Concept, 'id' | 'created_at' | 'updated_at' | 'user_id'> | Concept) => Promise<void>;
    onClose: () => void;
    isLoadingParent: boolean;
}> = ({ concept, onSave, onClose, isLoadingParent }) => {
    const [name, setName] = useState(concept?.name || '');
    const [description, setDescription] = useState(concept?.description || '');
    const [understandingLevel, setUnderstandingLevel] = useState<UnderstandingLevel>(concept?.understanding_level || UNDERSTANDING_LEVELS[0]);
    const [selfRatedConfidence, setSelfRatedConfidence] = useState<SelfRatedConfidence>(concept?.self_rated_confidence || SELF_RATED_CONFIDENCE_SCORES[2]);
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) {
            setFormError('Concept Name and Description are required.');
            return;
        }
        setFormError('');
        const conceptData = {
            ...(concept ? { ...concept, last_reviewed: new Date().toISOString() } : { last_reviewed: new Date().toISOString() }), // Update last_reviewed on save
            name, description, understanding_level: understandingLevel, self_rated_confidence: selfRatedConfidence
        };
        await onSave(conceptData as Omit<Concept, 'id' | 'created_at' | 'updated_at' | 'user_id'> | Concept);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <Input label="Concept Name" value={name} onChange={e => setName(e.target.value)} required />
            <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
            <Select label="Understanding Level" value={understandingLevel} onChange={e => setUnderstandingLevel(e.target.value as UnderstandingLevel)} options={UNDERSTANDING_LEVELS.map(ul => ({ value: ul, label: ul }))} required />
            <Select label="Self-Rated Confidence (1-5)" value={String(selfRatedConfidence)} onChange={e => setSelfRatedConfidence(Number(e.target.value) as SelfRatedConfidence)} options={SELF_RATED_CONFIDENCE_SCORES.map(src => ({ value: String(src), label: String(src) }))} required />
            {formError && <p className="text-sm text-danger">{formError}</p>}
             <div className="flex justify-end space-x-2 pt-2 sticky bottom-0 bg-light-card dark:bg-dark-card py-3">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isLoadingParent}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={isLoadingParent} disabled={isLoadingParent}>
                    {isLoadingParent ? 'Saving...' : (concept ? 'Save Concept' : 'Add Concept')}
                </Button>
            </div>
        </form>
    );
};


const LearningHubPage: React.FC = () => {
  const { 
    notes, addNote, updateNote, deleteNote, isLoading: notesLoading, error: notesError,
    getNotesBySourceAndCollection, getContentCollectionsForSource 
  } = useNotes();
  const { sources, getSourceById, addSource, updateSource: updateSourceHook, deleteSource: deleteSourceHook, isLoading: sourcesLoading, error: sourcesError } = useSources();
  const { concepts, getConceptById, addConcept, updateConcept: updateConceptHook, deleteConcept: deleteConceptHook, isLoading: conceptsLoading, error: conceptsError } = useConcepts();
  

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | undefined>(undefined);
  
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const [editingConcept, setEditingConcept] = useState<Concept | undefined>(undefined);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSourceType, setFilterSourceType] = useState<string>('');
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  

  const isLoading = notesLoading || sourcesLoading || conceptsLoading;
  const error = notesError || sourcesError || conceptsError;

  useEffect(() => { // Auto-expand sources with notes if filters are not active
    if (sources.length > 0 && !searchTerm && !filterSourceType) {
        const sourcesWithNotes = new Set<string>();
        notes.forEach(note => sourcesWithNotes.add(note.source_id));
        setExpandedSources(sourcesWithNotes);
    } else if (searchTerm || filterSourceType) { // Collapse all if filtering/searching
        setExpandedSources(new Set());
    }
  }, [sources, notes, searchTerm, filterSourceType]);


  const handleOpenNoteModal = (note?: Note) => { setEditingNote(note); setIsNoteModalOpen(true); };
  const handleCloseNoteModal = () => { setEditingNote(undefined); setIsNoteModalOpen(false); };
  const handleSaveNote = async (noteData: Omit<Note, 'id'|'created_at'|'updated_at'> | Note) => {
    try {
      if ('id' in noteData) { await updateNote(noteData as Note); } 
      else { await addNote(noteData as Omit<Note, 'id'|'created_at'|'updated_at'>); }
      handleCloseNoteModal();
    } catch (e) { console.error("Failed to save note:", e); }
  };
  const handleDeleteNote = async (noteId: string) => { try { await deleteNote(noteId); } catch(e) { console.error("Failed to delete note:", e); } };

  const handleOpenSourceModal = (source?: Source) => { setEditingSource(source); setIsSourceModalOpen(true); };
  const handleCloseSourceModal = () => { setEditingSource(undefined); setIsSourceModalOpen(false); };
  const handleSaveSource = async (sourceData: Omit<Source, 'id'|'created_at'|'updated_at'> | Source) => {
    try {
      if ('id' in sourceData) { await updateSourceHook(sourceData as Source); }
      else { await addSource(sourceData as Omit<Source, 'id'|'created_at'|'updated_at'>); }
      handleCloseSourceModal();
    } catch (e) { console.error("Failed to save source:", e); }
  };
  const handleDeleteSource = async (sourceId: string) => { try { await deleteSourceHook(sourceId); } catch(e) { console.error("Failed to delete source:", e); }};

  const handleOpenConceptModal = (concept?: Concept) => { setEditingConcept(concept); setIsConceptModalOpen(true); };
  const handleCloseConceptModal = () => { setEditingConcept(undefined); setIsConceptModalOpen(false); };
  const handleSaveConcept = async (conceptData: Omit<Concept, 'id'|'created_at'|'updated_at' | 'user_id'> | Concept) => {
    try {
      if ('id' in conceptData) { await updateConceptHook(conceptData as Concept); }
      else { await addConcept(conceptData as Omit<Concept, 'id'|'created_at'|'updated_at' | 'user_id'>); }
      handleCloseConceptModal();
    } catch (e) { console.error("Failed to save concept:", e); }
  };
  const handleDeleteConcept = async (conceptId: string) => { try { await deleteConceptHook(conceptId); } catch(e) { console.error("Failed to delete concept:", e); }};


  const toggleSourceExpansion = (sourceId: string) => setExpandedSources(prev => { const next = new Set(prev); if (next.has(sourceId)) next.delete(sourceId); else next.add(sourceId); return next; });
  const toggleCollectionExpansion = (collectionKey: string) => setExpandedCollections(prev => { const next = new Set(prev); if (next.has(collectionKey)) next.delete(collectionKey); else next.add(collectionKey); return next; });
  
  const sortedSources = useMemo(() => [...sources].sort((a,b) => a.name.localeCompare(b.name)), [sources]);
  const sortedConcepts = useMemo(() => [...concepts].sort((a,b) => a.name.localeCompare(b.name)), [concepts]);

  const filteredAndGroupedNotes = useMemo(() => {
    return sortedSources
      .filter(source => 
          (!filterSourceType || source.source_type === filterSourceType) &&
          (!searchTerm || source.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .map(source => {
        const collectionsForSource = getContentCollectionsForSource(source.id);
        const collectionsData = new Map<string, Note[]>();
        
        collectionsForSource.forEach(collectionName => {
            const notesInCollection = getNotesBySourceAndCollection(source.id, collectionName)
                .filter(note => 
                    !searchTerm || 
                    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
                );
            if(notesInCollection.length > 0) {
                 collectionsData.set(collectionName, notesInCollection);
            }
        });
        // If searching, only include source if it has matching collections/notes
        if(searchTerm && collectionsData.size === 0 && !source.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return null;
        }
        return { source, collections: collectionsData };
      }).filter(Boolean) as { source: Source, collections: Map<string, Note[]> }[];
  }, [sortedSources, notes, searchTerm, filterSourceType, getContentCollectionsForSource, getNotesBySourceAndCollection]);


  return (
    <div className="bg-light-background dark:bg-dark-background min-h-screen"> 
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 pt-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">Learning Hub</h2>
        <Button variant="primary" onClick={() => handleOpenNoteModal()} leftIcon={<ICONS.PLUS_CIRCLE className="w-5 h-5"/>} disabled={sourcesLoading || sources.length === 0}>
          {sourcesLoading ? 'Loading...' : (sources.length === 0 ? 'Add a Source First' : 'Add New Note')}
        </Button>
      </div>

      <Card className="mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
            <Input 
                placeholder="Search notes, collections, sources, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                wrapperClassName="mb-0"
            />
            <Select
                value={filterSourceType}
                onChange={(e) => setFilterSourceType(e.target.value)}
                options={[{value: '', label: 'All Source Types'}, ...SOURCE_TYPES_ARRAY.map(st => ({ value: st, label: st }))]}
                wrapperClassName="mb-0"
            />
        </div>
      </Card>
      
      {isLoading && <div className="flex justify-center py-10"><Spinner size="lg"/></div>}
      {!isLoading && error && <p className="text-center py-8 text-danger">{error}</p>}
      
      {!isLoading && !error && (
        <div className="space-y-6">
            {/* Manage Sources Section */}
            <Card title="Manage Learning Sources" titleAction={<Button size="sm" onClick={() => handleOpenSourceModal()} leftIcon={<ICONS.PLUS_CIRCLE className="w-4 h-4"/>}>Add Source</Button>}>
                {sortedSources.length === 0 ? <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No sources created yet. Add books, courses, mentors, etc.</p> :
                 <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {sortedSources.map(s => (
                        <li key={s.id} className="flex justify-between items-center p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50">
                            <div className="flex items-center">
                                <SourceIcon sourceType={s.source_type} className="w-5 h-5 mr-2"/>
                                <div>
                                    <span className="font-medium text-light-text dark:text-dark-text">{s.name}</span>
                                    <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary ml-2">({s.source_type})</span>
                                    {s.main_link && <a href={s.main_link} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary-DEFAULT hover:underline text-xs"><ICONS.LINK className="inline w-3 h-3"/></a>}
                                </div>
                            </div>
                            <div className="space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleOpenSourceModal(s)}>Edit</Button>
                                <Button size="sm" variant="danger" onClick={() => handleDeleteSource(s.id)}>Delete</Button>
                            </div>
                        </li>
                    ))}
                 </ul>
                }
            </Card>

            {/* Manage Concepts Section */}
            <Card title="Manage Key Concepts" titleAction={<Button size="sm" onClick={() => handleOpenConceptModal()} leftIcon={<ICONS.PLUS_CIRCLE className="w-4 h-4"/>}>Add Concept</Button>}>
                {sortedConcepts.length === 0 ? <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No concepts defined yet. Track your understanding of key trading ideas.</p> :
                 <ul className="space-y-2 max-h-72 overflow-y-auto">
                    {sortedConcepts.map(c => (
                        <li key={c.id} className="flex justify-between items-center p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50">
                             <div>
                                <span className="font-medium text-light-text dark:text-dark-text">{c.name}</span>
                                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300">{c.understanding_level}</span>
                                <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300">Conf: {c.self_rated_confidence}/5</span>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">Reviewed: {new Date(c.last_reviewed).toLocaleDateString()}</p>
                            </div>
                            <div className="space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleOpenConceptModal(c)}>Edit</Button>
                                <Button size="sm" variant="danger" onClick={() => handleDeleteConcept(c.id)}>Delete</Button>
                            </div>
                        </li>
                    ))}
                 </ul>
                }
            </Card>

            {/* Notes Listing Section (Existing Logic) */}
            {filteredAndGroupedNotes.length === 0 && (searchTerm || filterSourceType) &&
                <Card className="text-center py-12">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">No notes match your current search or filter.</p>
                </Card>
            }
            {filteredAndGroupedNotes.map(({ source, collections }) => {
              if (collections.size === 0 && searchTerm && !source.name.toLowerCase().includes(searchTerm.toLowerCase())) return null; // Ensure source itself isn't searched if it has no matching notes
              const isSourceExpanded = expandedSources.has(source.id);
              return (
                <Card key={source.id} className="bg-light-card dark:bg-dark-card shadow-md overflow-hidden">
                  <div 
                    className="flex justify-between items-center px-4 py-3 sm:px-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    onClick={() => toggleSourceExpansion(source.id)}
                  >
                    <div className="flex items-center">
                        <SourceIcon sourceType={source.source_type} className="w-5 h-5 mr-2 text-primary-DEFAULT"/>
                        <h3 className="text-lg font-medium text-primary-dark dark:text-primary-light">{source.name}</h3>
                        <span className="ml-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">({source.source_type})</span>
                    </div>
                    <ICONS.CHEVRON_DOWN className={`w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary transform transition-transform ${isSourceExpanded ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {isSourceExpanded && (
                    <div className="px-4 py-2 sm:px-6 space-y-3 border-t border-light-border dark:border-dark-border">
                         {Array.from(collections.entries()).map(([collectionName, notesInCollection]) => {
                            const collectionKey = `${source.id}-${collectionName}`;
                            const isCollectionExpanded = expandedCollections.has(collectionKey) || (collections.size === 1 && notesInCollection.length <=3); 
                            return (
                                <div key={collectionKey} className="ml-2 pl-3 border-l-2 border-light-border dark:border-slate-700">
                                    <div 
                                        className="flex justify-between items-center py-1.5 cursor-pointer hover:text-primary-DEFAULT dark:hover:text-primary-light"
                                        onClick={() => toggleCollectionExpansion(collectionKey)}
                                    >
                                        <h4 className="text-sm font-semibold text-light-text dark:text-dark-text">{collectionName} ({notesInCollection.length})</h4>
                                        <ICONS.CHEVRON_DOWN className={`w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary transform transition-transform ${isCollectionExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                    {isCollectionExpanded && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2 pb-3">
                                            {notesInCollection.map(note => (
                                                <NoteCard 
                                                    key={note.id} 
                                                    note={note} 
                                                    source={source}
                                                    concepts={concepts}
                                                    onEdit={handleOpenNoteModal} 
                                                    onDelete={handleDeleteNote}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                         {collections.size === 0 && <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary py-2">No notes in this source match your search/filter.</p>}
                    </div>
                  )}
                </Card>
              );
            })}
        </div>
      )}

      {isNoteModalOpen && (
        <Modal isOpen={isNoteModalOpen} onClose={handleCloseNoteModal} title={editingNote ? 'Edit Note' : 'Add New Note'} size="xl">
          <NoteEditor note={editingNote} sources={sources} concepts={concepts} onSave={handleSaveNote} onClose={handleCloseNoteModal} isLoadingParent={notesLoading}/>
        </Modal>
      )}
      {isSourceModalOpen && (
          <Modal isOpen={isSourceModalOpen} onClose={handleCloseSourceModal} title={editingSource ? 'Edit Source' : 'Add New Source'} size="lg">
              <SourceForm source={editingSource} onSave={handleSaveSource} onClose={handleCloseSourceModal} isLoadingParent={sourcesLoading} />
          </Modal>
      )}
      {isConceptModalOpen && (
          <Modal isOpen={isConceptModalOpen} onClose={handleCloseConceptModal} title={editingConcept ? 'Edit Concept' : 'Add New Concept'} size="lg">
              <ConceptForm concept={editingConcept} onSave={handleSaveConcept} onClose={handleCloseConceptModal} isLoadingParent={conceptsLoading} />
          </Modal>
      )}
    </div>
  );
};

export default LearningHubPage;