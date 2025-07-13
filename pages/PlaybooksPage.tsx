import React, { useState, useEffect } 
from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ICONS } from '../constants';
import { Playbook, Trade, Concept } from '../types'; 
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { usePlaybooks } from '../hooks/usePlaybooks';
import { useTrades } from '../hooks/useTrades'; 
import { useConcepts } from '../hooks/useConcepts'; 
import PlaybookInlineAnalyticsDisplay from '../components/analytics/PlaybookInlineAnalyticsDisplay';
import Spinner from '../components/ui/Spinner';

const PlaybookForm: React.FC<{ 
    playbook?: Playbook; 
    concepts: Concept[]; 
    onSave: (playbook: Omit<Playbook, 'id' | 'created_at' | 'updated_at' | 'user_id'> | Playbook) => Promise<void>; 
    onClose: () => void;
    isLoadingParent: boolean;
    initialValues?: { name?: string; rules?: string[] }; // For pre-filling from Note
}> = ({ playbook, concepts, onSave, onClose, isLoadingParent, initialValues }) => {
    const [name, setName] = useState(playbook?.name || initialValues?.name || '');
    const [description, setDescription] = useState(playbook?.description || '');
    const [rules, setRules] = useState(playbook?.rules.join('\n') || initialValues?.rules?.join('\n') || '');
    const [keyLearnings, setKeyLearnings] = useState(playbook?.key_learnings?.join('\n') || '');
    const [linkedConceptIds, setLinkedConceptIds] = useState<string[]>(playbook?.linked_concept_ids || []);
    const [formError, setFormError] = useState('');

    const handleToggleConcept = (conceptId: string) => {
        setLinkedConceptIds(prev => 
            prev.includes(conceptId) ? prev.filter(id => id !== conceptId) : [...prev, conceptId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setFormError('Playbook name is required.');
            return;
        }
        if (rules.split('\n').filter(r => r.trim() !== '').length === 0) {
            setFormError('At least one rule is required.');
            return;
        }
        setFormError('');

        const playbookData = {
            ...(playbook ? { ...playbook } : {}), 
            name,
            description,
            rules: rules.split('\n').filter(r => r.trim() !== ''),
            key_learnings: keyLearnings.split('\n').filter(kl => kl.trim() !== ''),
            linked_concept_ids: linkedConceptIds,
        };
        
        if (playbook) {
            await onSave(playbookData as Playbook);
        } else {
            await onSave(playbookData as Omit<Playbook, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
            <Input label="Playbook Name" value={name} onChange={e => setName(e.target.value)} required error={formError && name.trim() === '' ? formError : undefined} />
            <Textarea label="Description (Optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            <Textarea 
                label="Rules (one per line)" 
                value={rules} 
                onChange={e => setRules(e.target.value)} 
                rows={5} 
                placeholder="e.g., Enter on 5min candle close above resistance" 
                required 
                error={formError && rules.split('\n').filter(r => r.trim() !== '').length === 0 ? formError : undefined}
                helperText="Future: Option to link concepts to individual rules for more granular analysis."
            />
            <Textarea 
                label="Key Learnings (one per line, Optional)" 
                value={keyLearnings} 
                onChange={e => setKeyLearnings(e.target.value)} 
                rows={3} 
                placeholder="e.g., Works best in trending markets."
            />
             <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Link Concepts (Optional)</label>
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

            {formError && (name.trim() !== '' && rules.split('\n').filter(r => r.trim() !== '').length > 0) && <p className="text-sm text-danger">{formError}</p> }

            <div className="flex justify-end space-x-2 pt-2 sticky bottom-0 bg-light-card dark:bg-dark-card py-3 z-10">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isLoadingParent}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={isLoadingParent} disabled={isLoadingParent}>
                    {isLoadingParent ? (playbook ? 'Saving...' : 'Creating...') : (playbook ? 'Save Changes' : 'Create Playbook')}
                </Button>
            </div>
        </form>
    );
};


const PlaybookCardDisplay: React.FC<{ 
    playbook: Playbook; 
    concepts: Concept[]; 
    onEdit: (playbook: Playbook) => void; 
    onDelete: (playbookId: string) => Promise<void>; 
    onToggleAnalytics: (playbookId: string) => void; 
    isProcessingDelete: boolean;
    isActive: boolean; 
}> = ({ playbook, concepts, onEdit, onDelete, onToggleAnalytics, isProcessingDelete, isActive }) => {
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const handleDelete = async () => {
        await onDelete(playbook.id);
        setShowConfirmDelete(false);
    };
    
    const linkedConceptsToDisplay = concepts.filter(c => playbook.linked_concept_ids?.includes(c.id));


    return (
        <Card 
            title={playbook.name} 
            titleAction={
                <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onEdit(playbook);}} disabled={isProcessingDelete}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true);}} disabled={isProcessingDelete} isLoading={isProcessingDelete}>Delete</Button>
                </div>
            }
            className={`${isActive ? 'ring-2 ring-primary-DEFAULT shadow-lg dark:shadow-[0_0_15px_2px_rgba(139,92,246,0.4)]' : ''} overflow-hidden`}
            onClick={() => onToggleAnalytics(playbook.id)} 
        >
            <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary ">{playbook.description || "No description."}</p>
                
                <div>
                    <h4 className="text-xs font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary mb-0.5">Rules:</h4>
                    {playbook.rules.length > 0 ? (
                        <ul className="list-disc list-inside text-sm space-y-0.5 text-light-text dark:text-dark-text">
                            {playbook.rules.map((rule, index) => <li key={index} className="truncate" title={rule}>{rule}</li>)}
                        </ul>
                    ) : <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary italic">No rules defined.</p>}
                </div>

                {playbook.key_learnings && playbook.key_learnings.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-light-text-secondary dark:text-dark-text-secondary mb-0.5">Key Learnings:</h4>
                        <ul className="list-disc list-inside text-sm space-y-0.5 text-light-text dark:text-dark-text">
                            {playbook.key_learnings.map((kl, index) => <li key={index} className="truncate" title={kl}>{kl}</li>)}
                        </ul>
                    </div>
                )}

                {linkedConceptsToDisplay.length > 0 && (
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
            </div>
            <div className="flex justify-end items-center text-sm pt-2 border-t border-light-border dark:border-dark-border mt-2">
                 <Button 
                    size="sm" 
                    variant={isActive ? "primary" : "secondary"} 
                    onClick={(e) => { e.stopPropagation(); onToggleAnalytics(playbook.id);}}
                 >
                    {isActive ? 'Hide Analytics' : 'View Analytics'}
                 </Button>
            </div>
            <Modal isOpen={showConfirmDelete} onClose={() => setShowConfirmDelete(false)} title="Confirm Delete">
                <p className="text-light-text dark:text-dark-text">Are you sure you want to delete the playbook "{playbook.name}"?</p>
                <div className="mt-4 flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setShowConfirmDelete(false)} disabled={isProcessingDelete}>Cancel</Button>
                <Button variant="danger" onClick={handleDelete} isLoading={isProcessingDelete} disabled={isProcessingDelete}>Delete</Button>
                </div>
            </Modal>
        </Card>
    );
};

const PlaybooksPage: React.FC = () => {
  const location = useLocation(); // Get location object
  const { playbooks: allPlaybooksFromHook, addPlaybook, updatePlaybook, deletePlaybook, isLoading: playbooksLoading, error: playbooksError } = usePlaybooks(); 
  const { trades: allTrades, isLoading: tradesLoading } = useTrades(); 
  const { concepts, isLoading: conceptsLoading, error: conceptsError } = useConcepts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaybook, setEditingPlaybook] = useState<Playbook | undefined>(undefined);
  
  const [activeAnalyticsPlaybookId, setActiveAnalyticsPlaybookId] = useState<string | null>(null); 
  const [prefillData, setPrefillData] = useState<{ name?: string; rules?: string[] } | undefined>(undefined);


  useEffect(() => {
    // Check for prefill data from location state (e.g., from Learning Hub)
    if (location.state?.noteTitle || location.state?.noteRules) {
        setPrefillData({
            name: location.state.noteTitle,
            rules: location.state.noteRules,
        });
        // Open modal automatically if prefill data exists and no playbook is currently being edited
        if (!editingPlaybook) {
            setIsModalOpen(true);
        }
    }
  }, [location.state, editingPlaybook]);


  const isLoading = playbooksLoading || tradesLoading || conceptsLoading;
  const error = playbooksError || conceptsError; 

  const allPlaybooks = [...allPlaybooksFromHook].sort((a,b) => 
    new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
  );


  const handleOpenModal = (playbook?: Playbook) => {
    setEditingPlaybook(playbook);
    // If not editing an existing playbook, and prefillData exists, use it. Otherwise, clear prefill.
    if (!playbook && prefillData) {
        // PrefillData is already set, modal will use it.
    } else {
        setPrefillData(undefined); // Clear prefill if editing or opening for a generic new playbook
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingPlaybook(undefined);
    setIsModalOpen(false);
    setPrefillData(undefined); // Clear prefill data when modal closes
     // Clear location state after using it
    if (location.state?.noteTitle || location.state?.noteRules) {
        window.history.replaceState({}, document.title) 
    }
  };

  const handleToggleAnalytics = (playbookId: string) => { 
    setActiveAnalyticsPlaybookId(prevId => prevId === playbookId ? null : playbookId);
  };

  const handleSavePlaybook = async (playbookData: Omit<Playbook, 'id' | 'created_at' | 'updated_at' | 'user_id'> | Playbook) => {
    try {
        if ('id' in playbookData) { 
            await updatePlaybook(playbookData as Playbook);
        } else { 
            await addPlaybook(playbookData as Omit<Playbook, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
        }
        handleCloseModal();
    } catch(e) {
        console.error("Failed to save playbook:", e);
    }
  };
  
  const handleDeletePlaybook = async (playbookId: string) => {
    try {
        await deletePlaybook(playbookId);
        if (activeAnalyticsPlaybookId === playbookId) { 
            setActiveAnalyticsPlaybookId(null);
        }
    } catch (e) {
        console.error("Error calling deletePlaybook from page:", e);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">Playbooks</h2>
        <Button variant="primary" onClick={() => handleOpenModal()} leftIcon={<ICONS.PLUS_CIRCLE className="w-5 h-5"/>} disabled={isLoading}>
            Create Playbook
        </Button>
      </div>
      
      {isLoading && <div className="flex justify-center py-8"><Spinner /></div>}
      {error && <p className="text-center py-4 text-danger">{error}</p>}

      {!isLoading && !error && (
          allPlaybooks.length === 0 ? (
            <Card>
                <p className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">No playbooks defined yet. Create your first strategy!</p>
            </Card>
          ) : (
            <div className="space-y-6"> 
                {allPlaybooks.map(pb => (
                    <div key={pb.id}>
                        <PlaybookCardDisplay 
                            playbook={pb} 
                            concepts={concepts}
                            onEdit={handleOpenModal} 
                            onDelete={handleDeletePlaybook}
                            onToggleAnalytics={handleToggleAnalytics} 
                            isProcessingDelete={playbooksLoading} 
                            isActive={activeAnalyticsPlaybookId === pb.id}
                        />
                        {activeAnalyticsPlaybookId === pb.id && (
                            <PlaybookInlineAnalyticsDisplay
                                playbook={pb}
                                allTrades={allTrades}
                            />
                        )}
                    </div>
                ))}
            </div>
          )
      )}

       {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPlaybook ? 'Edit Playbook' : 'Create New Playbook'}>
          <PlaybookForm 
            playbook={editingPlaybook} 
            concepts={concepts}
            onSave={handleSavePlaybook} 
            onClose={handleCloseModal} 
            isLoadingParent={playbooksLoading} 
            initialValues={editingPlaybook ? undefined : prefillData} // Pass prefillData only for new playbooks
          />
        </Modal>
      )}

      <Card className="mt-8 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-light-border dark:border-dark-border">
        <h3 className="text-xl font-semibold mb-2 text-light-text dark:text-dark-text">Playbook System Notes</h3>
        <ul className="list-disc list-inside text-sm text-light-text-secondary dark:text-dark-text-secondary space-y-1">
            <li>Playbook data is now stored in your Supabase database.</li>
            <li>Consider linking concepts to specific rules within playbooks for deeper integration.</li>
            <li>Future: Automated Playbook Adherence Score calculation based on trade execution vs. defined rules.</li>
            <li>Direct linking of trades to playbooks from the 'All Trades' view.</li>
        </ul>
      </Card>
    </div>
  );
};

export default PlaybooksPage;