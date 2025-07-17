import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Announcement } from '../../types';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { Icons } from '../../constants';

const AdminAnnouncementsPage: React.FC = () => {
  const { announcements, interns, batches, getBatchById, createAnnouncement, addNotification } = useData();
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);

  // Announcement State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'specific' | 'batch'>('all');
  const [selectedInternsForAnn, setSelectedInternsForAnn] = useState<string[]>([]);
  const [selectedBatchesForAnn, setSelectedBatchesForAnn] = useState<string[]>([]);
  const [internSearchTerm, setInternSearchTerm] = useState('');


  // Ping State
  const [pingMessage, setPingMessage] = useState('');
  const [pingAudienceType, setPingAudienceType] = useState<'all' | 'batch' | 'specific'>('all');
  const [selectedBatchForPing, setSelectedBatchForPing] = useState<string>('');
  const [selectedInternsForPing, setSelectedInternsForPing] = useState<string[]>([]);
  const [pingSearchTerm, setPingSearchTerm] = useState('');
  
  const resetAnnouncementForm = () => {
    setAnnTitle('');
    setAnnContent('');
    setRecipientType('all');
    setSelectedInternsForAnn([]);
    setSelectedBatchesForAnn([]);
    setInternSearchTerm('');
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalAudience: 'all' | string[] = 'all';

    if (recipientType === 'specific') {
        if (selectedInternsForAnn.length === 0) {
            addNotification({message: "Please select at least one intern.", type: 'warning'});
            return;
        }
        finalAudience = selectedInternsForAnn;
    } else if (recipientType === 'batch') {
        if (selectedBatchesForAnn.length === 0) {
            addNotification({message: "Please select at least one batch.", type: 'warning'});
            return;
        }
        const internIdsInBatches = interns
            .filter(i => i.batchId && selectedBatchesForAnn.includes(i.batchId))
            .map(i => i.id);
        
        if (internIdsInBatches.length === 0) {
            addNotification({message: "The selected batches have no interns.", type: 'warning'});
            return;
        }
        finalAudience = [...new Set(internIdsInBatches)];
    }

    const newAnn = await createAnnouncement({ title: annTitle, content: annContent, audience: finalAudience });
    if (newAnn) {
      addNotification({message: "Announcement posted successfully.", type: 'success'});
      setIsAnnModalOpen(false);
      resetAnnouncementForm();
    } else {
      addNotification({message: "Failed to post announcement.", type: 'error'});
    }
  };

  const handleSendPing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pingMessage.trim()) {
      addNotification({message: "Ping message cannot be empty.", type: 'warning'});
      return;
    }

    let targets: string[] = [];
    let targetDescription = "";

    switch (pingAudienceType) {
        case 'all':
            targets = interns.map(i => i.id);
            targetDescription = "all interns";
            break;
        case 'batch':
            if (!selectedBatchForPing) {
                 addNotification({message: "Please select a batch.", type: 'warning'});
                 return;
            }
            targets = interns.filter(i => i.batchId === selectedBatchForPing).map(i => i.id);
            const batch = getBatchById(selectedBatchForPing);
            targetDescription = `interns in batch "${batch?.name}"`;
            break;
        case 'specific':
            targets = selectedInternsForPing;
            targetDescription = `${targets.length} intern(s)`;
            break;
    }
    
    if (targets.length === 0) {
        addNotification({message: "No interns selected for ping.", type: 'warning'});
        return;
    }

    targets.forEach(internId => {
      addNotification({ message: pingMessage, type: 'ping', targetUser: internId });
    });

    addNotification({message: `Ping sent to ${targetDescription}.`, type: 'success'});
    setIsPingModalOpen(false);
    setPingMessage('');
    setPingAudienceType('all');
    setSelectedInternsForPing([]);
    setSelectedBatchForPing('');
  };

  const handleToggleInternSelection = (internId: string) => {
    setSelectedInternsForAnn(prev => prev.includes(internId) ? prev.filter(id => id !== internId) : [...prev, internId]);
  };
  
  const handleToggleBatchSelection = (batchId: string) => {
    setSelectedBatchesForAnn(prev => prev.includes(batchId) ? prev.filter(id => id !== batchId) : [...prev, batchId]);
  }

  const handleTogglePingInternSelection = (internId: string) => {
    setSelectedInternsForPing(prev => prev.includes(internId) ? prev.filter(id => id !== internId) : [...prev, internId]);
  };
  
  const filteredPingInterns = useMemo(() => {
    return interns.filter(i => i.name.toLowerCase().includes(pingSearchTerm.toLowerCase()));
  }, [interns, pingSearchTerm]);
  
  const filteredAnnInterns = useMemo(() => {
    return interns.filter(i => i.name.toLowerCase().includes(internSearchTerm.toLowerCase()));
  }, [interns, internSearchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-800">Communications</h2>
        <div className="space-x-2">
            <Button onClick={() => setIsPingModalOpen(true)} leftIcon={Icons.Announcements} variant='secondary'>Ping Interns</Button>
            <Button onClick={() => setIsAnnModalOpen(true)} leftIcon={Icons.PlusCircle}>New Announcement</Button>
        </div>
      </div>

      <Card title="Posted Announcements">
        {announcements.length > 0 ? (
          <ul className="space-y-4">
            {announcements.map(ann => (
              <li key={ann.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-primary-700">{ann.title}</h3>
                <p className="text-gray-700 mt-1">{ann.content}</p>
                <div className="text-xs text-gray-500 mt-2">
                  <span>Posted: {new Date(ann.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span> | 
                  <span> Audience: {ann.audience === 'all' ? 'All Interns' : `${(ann.audience as string[]).length} Specific Intern(s)`}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No announcements posted yet.</p>
        )}
      </Card>

      {/* New Announcement Modal */}
      <Modal isOpen={isAnnModalOpen} onClose={() => {setIsAnnModalOpen(false); resetAnnouncementForm();}} title="Create New Announcement" size="md">
        <form onSubmit={handleCreateAnnouncement} className="space-y-6">
          <div>
            <label htmlFor="annTitle" className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" id="annTitle" value={annTitle} onChange={e => setAnnTitle(e.target.value)} required className="input-field-light mt-1"/>
          </div>
          <div>
            <label htmlFor="annContent" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea id="annContent" value={annContent} onChange={e => setAnnContent(e.target.value)} rows={5} required className="input-field-light mt-1"/>
          </div>
          
          {/* Recipient Selection */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">Recipients</legend>
            <div className="grid grid-cols-3 gap-1 bg-gray-200 p-1 rounded-lg">
                {(['all', 'specific', 'batch'] as const).map(type => (
                    <button
                        type="button"
                        key={type}
                        onClick={() => setRecipientType(type)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition capitalize ${recipientType === type ? 'bg-white text-primary-600 shadow' : 'text-gray-600 hover:bg-gray-300/50'}`}
                    >
                        {type === 'all' ? 'All Interns' : type}
                    </button>
                ))}
            </div>
          </fieldset>

          {/* Conditional Inputs */}
          {recipientType === 'specific' && (
            <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
              <input 
                type="search" 
                value={internSearchTerm} 
                onChange={(e) => setInternSearchTerm(e.target.value)}
                placeholder="Search interns by name..."
                className="input-field-light w-full"
              />
              <div className="max-h-40 overflow-y-auto space-y-1 p-1 border-t">
                {filteredAnnInterns.map(intern => (
                  <label key={intern.id} className="flex items-center p-2 rounded-md hover:bg-gray-200 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedInternsForAnn.includes(intern.id)} 
                      onChange={() => handleToggleInternSelection(intern.id)}
                      className="form-checkbox h-4 w-4 text-primary-600"
                    />
                    <img src={intern.avatarUrl} alt={intern.name} className="w-6 h-6 rounded-full mx-2" />
                    <span className="text-sm font-medium text-gray-700">{intern.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {recipientType === 'batch' && (
            <div className="p-3 border rounded-lg bg-gray-50">
              <div className="max-h-40 overflow-y-auto space-y-1 p-1">
                {batches.map(batch => (
                   <label key={batch.id} className="flex items-center p-2 rounded-md hover:bg-gray-200 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedBatchesForAnn.includes(batch.id)} 
                      onChange={() => handleToggleBatchSelection(batch.id)}
                      className="form-checkbox h-4 w-4 text-primary-600"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">{batch.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => {setIsAnnModalOpen(false); resetAnnouncementForm();}}>Cancel</Button>
            <Button type="submit">Post Announcement</Button>
          </div>
        </form>
      </Modal>
      
      {/* Redesigned Ping Interns Modal */}
      <Modal isOpen={isPingModalOpen} onClose={() => setIsPingModalOpen(false)} title="Ping Interns" size="md">
        <form onSubmit={handleSendPing} className="space-y-4">
          <div>
            <textarea 
              id="pingMessage" 
              value={pingMessage} 
              onChange={e => setPingMessage(e.target.value)} 
              rows={3} required 
              placeholder="Short message for screen pop-up..." 
              className="w-full p-3 bg-gray-800 text-gray-200 rounded-lg border-2 border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <div className="grid grid-cols-3 gap-1 bg-gray-200 p-1 rounded-lg">
                {(['all', 'batch', 'specific'] as const).map(type => (
                    <button
                        type="button"
                        key={type}
                        onClick={() => setPingAudienceType(type)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition capitalize ${pingAudienceType === type ? 'bg-white text-primary-600 shadow' : 'text-gray-600 hover:bg-gray-300/50'}`}
                    >
                        {type === 'all' ? 'All Interns' : type}
                    </button>
                ))}
            </div>
          </div>
          
          {pingAudienceType === 'batch' && (
            <div className="p-2 bg-gray-50 rounded-lg">
                <label htmlFor="batch-select" className="sr-only">Select Batch</label>
                <select id="batch-select" value={selectedBatchForPing} onChange={e => setSelectedBatchForPing(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                    <option value="">-- Select a batch --</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>
          )}

          {pingAudienceType === 'specific' && (
            <div className="p-2 bg-gray-50 rounded-lg space-y-2">
                <input 
                    type="search"
                    value={pingSearchTerm}
                    onChange={(e) => setPingSearchTerm(e.target.value)}
                    placeholder="Search interns..."
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                <div className="max-h-40 overflow-y-auto space-y-1 p-1">
                    {filteredPingInterns.map(intern => (
                        <label key={intern.id} className="flex items-center p-2 rounded-md hover:bg-gray-200 cursor-pointer">
                            <input type="checkbox" checked={selectedInternsForPing.includes(intern.id)} onChange={() => handleTogglePingInternSelection(intern.id)} className="form-checkbox h-4 w-4 text-primary-600"/>
                            <img src={intern.avatarUrl || `https://ui-avatars.com/api/?name=${intern.name}&background=random`} alt={intern.name} className="w-6 h-6 rounded-full mx-2" />
                            <span className="ml-2 text-sm font-medium text-gray-700">{intern.name}</span>
                        </label>
                    ))}
                </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsPingModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Send Ping</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAnnouncementsPage;