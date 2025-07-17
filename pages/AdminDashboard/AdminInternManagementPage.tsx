
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { InternProfile, TaskStatus, Batch, PunchLog } from '../../types';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { Icons } from '../../constants';
import Modal from '../../components/shared/Modal';
import { Link } from 'react-router-dom';

const AddInternModal: React.FC<{onClose: () => void;}> = ({onClose}) => {
    const { batches, createIntern, addNotification } = useData();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [batchId, setBatchId] = useState<string | undefined>(batches[0]?.id || undefined);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState<{ username: string, password?: string } | null>(null);


    const handleAddIntern = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !username || !email) {
            addNotification({type: 'warning', message: 'Please fill all required fields.'});
            return;
        }

        const result = await createIntern({ name, username, email, specialization: "Digital Marketing Generalist", batchId }, password);
        if(result) {
            addNotification({type: 'success', message: `Intern ${name} created successfully.`});
            setSuccessData({ username: result.intern.username, password: result.password });
        } else {
            setError('Username already exists. Please choose a different one.');
            addNotification({type: 'error', message: `Failed to create intern. Username may already exist.`});
        }
    }

    const handleCopyToClipboard = () => {
        if (!successData) return;
        const textToCopy = `Username: ${successData.username}\nPassword: ${successData.password}`;
        navigator.clipboard.writeText(textToCopy);
        addNotification({type: 'info', message: 'Credentials copied to clipboard.'});
    };

    const handleDone = () => {
      setSuccessData(null);
      onClose();
    }

    return (
        <Modal isOpen={true} onClose={handleDone} title={successData ? "Intern Created Successfully" : "Add New Intern"}>
            {successData ? (
                <div className="space-y-4 text-center">
                    <Icons.CheckCircle className="w-16 h-16 mx-auto text-green-500"/>
                    <p className="text-lg">The intern account has been created.</p>
                    <div className="p-4 bg-gray-100 rounded-lg text-left text-sm space-y-2">
                        <div>
                            <span className="font-semibold text-gray-600">Username:</span>
                            <span className="ml-2 font-mono bg-gray-200 px-2 py-1 rounded">{successData.username}</span>
                        </div>
                         <div>
                            <span className="font-semibold text-gray-600">Password:</span>
                            <span className="ml-2 font-mono bg-gray-200 px-2 py-1 rounded">{successData.password}</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Please copy and share these credentials with the intern. They will be required to change their password on first login.</p>
                    <div className="flex justify-center space-x-2 pt-2">
                      <Button variant="ghost" onClick={handleCopyToClipboard}>Copy Credentials</Button>
                      <Button onClick={handleDone}>Done</Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleAddIntern} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 input-field-light" />
                    </div>
                     <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username (for login)</label>
                        <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 input-field-light" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 input-field-light" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Temporary Password</label>
                        <input type="text" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to auto-generate" className="mt-1 input-field-light" />
                    </div>
                    <div>
                        <label htmlFor="batch" className="block text-sm font-medium text-gray-700">Assign to Batch</label>
                        <select id="batch" value={batchId} onChange={e => setBatchId(e.target.value)} className="mt-1 input-field-light">
                            <option value="">(Optional) No initial batch</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Create Intern</Button>
                    </div>
                </form>
            )}
        </Modal>
    )
  }

  const ManageBatchesModal: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { batches, createBatch, addNotification, updateBatchName } = useData();
    const [newBatchName, setNewBatchName] = useState("");
    
    const handleCreateBatch = async () => {
        if (!newBatchName.trim()) return;
        if(batches.length >= 20) {
            addNotification({type: 'warning', message: 'Maximum of 20 batches reached.'});
            return;
        }
        const newBatch = await createBatch(newBatchName);
        if(newBatch) {
            addNotification({type: 'success', message: `Batch "${newBatch.name}" created.`});
            setNewBatchName("");
        } else {
             addNotification({type: 'error', message: `Failed to create batch.`});
        }
    }
    
    const handleEditBatch = (batch: Batch) => {
        const newName = prompt("Enter new name for batch:", batch.name);
        if(newName && newName.trim() !== batch.name) {
            updateBatchName(batch.id, newName.trim());
        }
    }

    return (
        <Modal isOpen={true} onClose={onClose} title="Manage Batches">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">You can create up to 20 batches to group interns. ({batches.length}/20)</p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {batches.map(batch => (
                        <div key={batch.id} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                            <span className="text-gray-800">{batch.name}</span>
                            <button onClick={() => handleEditBatch(batch)} className="text-blue-500 hover:text-blue-700">
                                <Icons.Pencil className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex space-x-2 border-t pt-4">
                    <input 
                        type="text" 
                        value={newBatchName}
                        onChange={e => setNewBatchName(e.target.value)}
                        placeholder="New batch name..."
                        className="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <Button onClick={handleCreateBatch} disabled={batches.length >= 20}>Add Batch</Button>
                </div>
            </div>
        </Modal>
    )
  }

const AdminInternManagementPage: React.FC = () => {
  const { interns, tasks, batches, getBatchById, assignInternToBatch, addNotification, getPunchLogsForIntern } = useData();
  const [filterBatch, setFilterBatch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBatchManagerOpen, setIsBatchManagerOpen] = useState(false);
  const [isAssignBatchOpen, setIsAssignBatchOpen] = useState(false);
  const [isAddInternModalOpen, setIsAddInternModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<InternProfile | null>(null);
  
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedInternForLogs, setSelectedInternForLogs] = useState<InternProfile | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const filteredInterns = interns.filter(intern => 
    (intern.name.toLowerCase().includes(searchTerm.toLowerCase()) || intern.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterBatch ? intern.batchId === filterBatch : true)
  );
  
  const handleAssignBatch = (intern: InternProfile) => {
    setSelectedIntern(intern);
    setIsAssignBatchOpen(true);
  }

  const handleSaveInternBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const select = form.elements.namedItem('batchSelect') as HTMLSelectElement;
    const batchId = select.value;

    if (selectedIntern && batchId) {
        const success = await assignInternToBatch(selectedIntern.id, batchId);
        if (success) {
            addNotification({type: 'success', message: `${selectedIntern.name} assigned to batch.`});
            setIsAssignBatchOpen(false);
            setSelectedIntern(null);
        } else {
            addNotification({type: 'error', message: 'Failed to assign batch.'});
        }
    }
  }

  const handleViewLogs = (intern: InternProfile) => {
      setSelectedInternForLogs(intern);
      setIsLogModalOpen(true);
  };
  
  const groupedLogs = useMemo(() => {
    if (!selectedInternForLogs) return {};
    const logs = getPunchLogsForIntern(selectedInternForLogs.id).reduce((acc, log) => {
        const dateStr = new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(log);
        return acc;
    }, {} as Record<string, PunchLog[]>);
    
    return logs;
  }, [selectedInternForLogs, getPunchLogsForIntern]);

  useEffect(() => {
    if (isLogModalOpen && selectedInternForLogs) {
        const logs = groupedLogs;
        const firstDate = Object.keys(logs)[0];
        if (firstDate) {
            setActiveAccordion(firstDate);
        }
    }
  }, [isLogModalOpen, selectedInternForLogs, groupedLogs]);

  const formatDuration = (minutes?: number) => {
    if (minutes === undefined) return '--';
    if (minutes < 1) return '< 1m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-semibold text-gray-800">Interns & Batches</h2>
        <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddInternModalOpen(true)} leftIcon={Icons.Profile}>Add Intern</Button>
            <Button onClick={() => setIsBatchManagerOpen(true)} leftIcon={Icons.BatchIcon}>Manage Batches</Button>
        </div>
      </div>

      <Card>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b mb-4">
            <input 
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                <option value="">All Batches</option>
                {batches.map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
            </select>
        </div>

        {filteredInterns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInterns.map(intern => {
                  const internTasks = tasks.filter(t => t.assignedTo === intern.id);
                  const completedCount = internTasks.filter(t => t.status === TaskStatus.VALIDATED).length;
                  const progressPercent = internTasks.length > 0 ? (completedCount / internTasks.length) * 100 : 0;
                  const batchName = intern.batchId ? getBatchById(intern.batchId)?.name : 'N/A';

                  return (
                    <tr key={intern.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-10 w-10 rounded-full mr-3" src={intern.avatarUrl || `https://ui-avatars.com/api/?name=${intern.name}&background=random`} alt={intern.name} />
                          <div>
                            <Link to={`/admin/interns/${intern.id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600 hover:underline">{intern.name}</Link>
                            <div className="text-xs text-gray-500">{intern.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button onClick={() => handleAssignBatch(intern)} className="hover:underline hover:text-primary-600">{batchName}</button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progressPercent.toFixed(0)}%` }}></div>
                        </div>
                        <span className="text-xs">{progressPercent.toFixed(0)}% Complete</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleViewLogs(intern)} leftIcon={Icons.Clock}>Logs</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-4 text-center text-gray-500">No interns match your filters.</p>
        )}
      </Card>
      
      {isBatchManagerOpen && <ManageBatchesModal onClose={() => setIsBatchManagerOpen(false)} />}
      {isAddInternModalOpen && <AddInternModal onClose={() => setIsAddInternModalOpen(false)} />}
      
      {isAssignBatchOpen && selectedIntern && (
        <Modal isOpen={true} onClose={() => setIsAssignBatchOpen(false)} title={`Assign Batch for ${selectedIntern.name}`}>
            <form onSubmit={handleSaveInternBatch} className="space-y-4">
                <select name="batchSelect" defaultValue={selectedIntern.batchId} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Select a batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setIsAssignBatchOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
      )}
      
      {selectedInternForLogs && (
        <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title={`Punch Logs for ${selectedInternForLogs.name}`} size="lg">
            {Object.keys(groupedLogs).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(groupedLogs).map(([date, logsForDate]) => (
                      <details key={date} open={date === activeAccordion} onClick={(e) => { e.preventDefault(); setActiveAccordion(activeAccordion === date ? null : date); }} className="group bg-gray-50 rounded-lg">
                          <summary className="flex justify-between items-center p-3 cursor-pointer list-none">
                              <span className="font-semibold text-gray-800">{date}</span>
                              <div className="flex items-center">
                                  <span className="text-sm text-gray-500 mr-2">{logsForDate.length} entries</span>
                                  <Icons.ChevronRight className={`w-5 h-5 text-gray-500 transform transition-transform ${activeAccordion === date ? 'rotate-90' : ''}`} />
                              </div>
                          </summary>
                          <div className="p-4 border-t border-gray-200">
                              <table className="w-full text-left">
                                  <thead>
                                      <tr className="border-b border-gray-200">
                                          <th className="py-2 px-2 text-xs font-medium text-gray-500 uppercase">Punched In</th>
                                          <th className="py-2 px-2 text-xs font-medium text-gray-500 uppercase">Punched Out</th>
                                          <th className="py-2 px-2 text-xs font-medium text-gray-500 uppercase text-right">Duration</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {logsForDate.map(log => (
                                          <tr key={log.id}>
                                              <td className="py-2 px-2 text-sm text-gray-700">{new Date(log.punchInTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</td>
                                              <td className="py-2 px-2 text-sm text-gray-700">{log.punchOutTime ? new Date(log.punchOutTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : <span className="text-green-600 font-semibold">Active</span>}</td>
                                              <td className="py-2 px-2 text-sm font-semibold text-gray-800 text-right">{formatDuration(log.workDurationMinutes)}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </details>
                  ))}
              </div>
            ) : (
                <div className="text-center py-12">
                    <Icons.Clock className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="mt-4 text-gray-500">No punch logs found for this intern.</p>
                </div>
            )}
        </Modal>
      )}

    </div>
  );
};

export default AdminInternManagementPage;