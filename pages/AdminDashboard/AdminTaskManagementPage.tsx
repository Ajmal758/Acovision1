import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Task, TaskStatus, TaskModule, TaskTemplate } from '../../types';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { TASK_STATUS_COLORS, Icons } from '../../constants';
import { geminiService } from '../../services/geminiService';

const AdminTaskManagementPage: React.FC = () => {
  const { tasks, interns, batches, createTask, assignTaskToIntern, updateTaskStatus, addNotification, projectTags, addProjectTag } = useData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  
  // State for the new create task modal
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newDepartment, setNewDepartment] = useState<TaskModule>(TaskModule.DESIGN);
  const [newDueDate, setNewDueDate] = useState('');
  const [assignToBatchId, setAssignToBatchId] = useState<string>('');
  const [newProjectTag, setNewProjectTag] = useState<string>('');
  
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');

  // State for assignment modal
  const [assignToInternId, setAssignToInternId] = useState<string>('');
  const [selectedTaskIdForAssign, setSelectedTaskIdForAssign] = useState<string>('');
  
  // State for scoring modal
  const [taskToScore, setTaskToScore] = useState<Task | null>(null);
  const [score, setScore] = useState(10);

  const [templateDescForAI, setTemplateDescForAI] = useState('');
  const [aiGeneratedTemplate, setAiGeneratedTemplate] = useState<{title:string, description:string, estimatedDuration:string} | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Filter states
  const [filterBatch, setFilterBatch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
        const intern = interns.find(i => i.id === task.assignedTo);
        const batchMatch = !filterBatch || (intern && intern.batchId === filterBatch);
        const departmentMatch = !filterDepartment || task.module === filterDepartment;
        return batchMatch && departmentMatch;
    });
  }, [tasks, interns, filterBatch, filterDepartment]);
  
  const handleClearFilters = () => {
    setFilterBatch('');
    setFilterDepartment('');
  };


  const resetCreateForm = () => {
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewDepartment(TaskModule.DESIGN);
    setNewDueDate('');
    setAssignToBatchId(batches.length > 0 ? batches[0].id : '');
    setNewProjectTag(projectTags.length > 0 ? projectTags[0] : '');
    setShowNewTagInput(false);
    setNewTagValue('');
  }

  const handleOpenCreateModal = () => {
    resetCreateForm();
    setIsCreateModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignToBatchId) {
        addNotification({message: "Please select a batch to assign the task to.", type: 'warning'});
        return;
    }
    if (!newProjectTag) {
      addNotification({message: "Please select or create a project tag.", type: 'warning'});
      return;
    }
    const deadlineValue = newDueDate || undefined; // If newDueDate is '', it becomes undefined
    const createdTasks = await createTask(
      { title: newTaskTitle, description: newTaskDesc, deadline: deadlineValue, module: newDepartment, projectTag: newProjectTag },
      assignToBatchId
    );
    if (createdTasks && createdTasks.length > 0) {
      addNotification({message: `Task "${createdTasks[0].title}" created and assigned to batch.`, type: 'success'});
      setIsCreateModalOpen(false);
    } else {
      addNotification({message: "Failed to create task.", type: 'error'});
    }
  };
  
  const handleAddNewTag = () => {
    if (newTagValue.trim()) {
      addProjectTag(newTagValue.trim());
      setNewProjectTag(newTagValue.trim());
      setShowNewTagInput(false);
      setNewTagValue('');
    } else {
      addNotification({message: "Project tag name cannot be empty.", type: 'warning'});
    }
  };


  const handleOpenAssignModal = (taskId: string) => {
    setSelectedTaskIdForAssign(taskId);
    setIsAssignModalOpen(true);
  };
  
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskIdForAssign || !assignToInternId) {
        addNotification({message: "Task or Intern not selected for assignment.", type: 'warning'});
        return;
    }
    const success = await assignTaskToIntern(selectedTaskIdForAssign, assignToInternId);
     if (success) {
      addNotification({message: `Task assigned successfully.`, type: 'success'});
      setIsAssignModalOpen(false);
      setAssignToInternId(''); setSelectedTaskIdForAssign('');
    } else {
      addNotification({message: "Failed to assign task.", type: 'error'});
    }
  };
  
  const handleOpenScoreModal = (task: Task) => {
    setTaskToScore(task);
    setScore(task.awardedPoints ?? 10);
    setIsScoreModalOpen(true);
  };

  const handleScoreAndValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!taskToScore) return;

    await updateTaskStatus(taskToScore.id, TaskStatus.VALIDATED, taskToScore.assignedTo, undefined, score);
    addNotification({message: "Task validated and scored!", type: "success"});
    setIsScoreModalOpen(false);
    setTaskToScore(null);
  };


  const handleGenerateTemplateWithAI = async () => {
    if (!templateDescForAI) {
        addNotification({ message: "Please enter a description for AI to generate a template.", type: 'warning' });
        return;
    }
    setAiLoading(true);
    setAiGeneratedTemplate(null);
    try {
        const template = await geminiService.generateTaskTemplate(templateDescForAI);
        setAiGeneratedTemplate(template);
    } catch (e) {
        addNotification({ message: "AI template generation failed.", type: 'error' });
    } finally {
        setAiLoading(false);
    }
  };

  const useAIGeneratedTemplate = () => {
    if (aiGeneratedTemplate) {
        setNewTaskTitle(aiGeneratedTemplate.title);
        setNewTaskDesc(aiGeneratedTemplate.description);
        setIsTemplateModalOpen(false);
        setIsCreateModalOpen(true);
        setAiGeneratedTemplate(null);
        setTemplateDescForAI('');
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-800">Task Management</h2>
        <div className="space-x-2">
            <Button onClick={() => setIsTemplateModalOpen(true)} leftIcon={Icons.Sparkles} variant="secondary">Create with AI</Button>
            <Button onClick={handleOpenCreateModal} leftIcon={Icons.PlusCircle}>Create New Task</Button>
        </div>
      </div>
      
      <Card>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 border-b">
          <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)} className="w-full sm:w-auto form-select rounded-md border-gray-300">
            <option value="">Filter by Batch</option>
            {batches.map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
          </select>
          <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="w-full sm:w-auto form-select rounded-md border-gray-300">
            <option value="">Filter by Department</option>
            {Object.values(TaskModule).map(mod => <option key={mod} value={mod}>{mod}</option>)}
          </select>
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear Filters</Button>
        </div>
      </Card>

      <Card title={`All Tasks (${filteredTasks.length})`}>
        {tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(task => {
                  const intern = interns.find(i => i.id === task.assignedTo);
                  return (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{task.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.module}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{intern?.name || 'Unassigned'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${TASK_STATUS_COLORS[task.status]}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {task.status === TaskStatus.COMPLETED && (
                            <Button size="sm" variant="success" onClick={() => handleOpenScoreModal(task)}>Score & Validate</Button>
                        )}
                         {task.status === TaskStatus.VALIDATED && (
                             <span className="text-sm font-semibold text-green-600">{task.awardedPoints} pts</span>
                         )}
                        <Button size="sm" variant="ghost" onClick={() => handleOpenAssignModal(task.id)} leftIcon={Icons.Pencil}>Re-assign</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 p-4 text-center">No tasks found. Create one to get started or clear your filters!</p>
        )}
      </Card>
      
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-6 p-2">
          <div>
            <label htmlFor="newTaskTitle" className="block text-sm font-medium text-gray-700">Task Title</label>
            <input type="text" id="newTaskTitle" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required placeholder="Enter task title" className="mt-1 input-field"/>
          </div>
          <div>
            <label htmlFor="newTaskDesc" className="block text-sm font-medium text-gray-700">Task Description</label>
            <textarea id="newTaskDesc" value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} rows={3} required placeholder="Enter task description" className="mt-1 input-field"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="newDepartment" className="block text-sm font-medium text-gray-700">Department</label>
              <select id="newDepartment" value={newDepartment} onChange={e => setNewDepartment(e.target.value as TaskModule)} required className="mt-1 input-field appearance-none" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                {Object.values(TaskModule).map(mod => <option key={mod} value={mod}>{mod}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="newDueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" id="newDueDate" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="mt-1 input-field"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="assignToBatchId" className="block text-sm font-medium text-gray-700">Assign to Batch</label>
              <select id="assignToBatchId" value={assignToBatchId} onChange={e => setAssignToBatchId(e.target.value)} required className="mt-1 input-field appearance-none" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                <option value="">Select Batch</option>
                {batches.map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="newProjectTag" className="block text-sm font-medium text-gray-700">Project Tag</label>
                {!showNewTagInput && (
                  <button type="button" onClick={() => setShowNewTagInput(true)} className="text-xs font-semibold text-primary-600 hover:underline">
                    Add New
                  </button>
                )}
              </div>
              {showNewTagInput ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTagValue}
                    onChange={(e) => setNewTagValue(e.target.value)}
                    placeholder="New tag name"
                    className="input-field flex-grow"
                    autoFocus
                  />
                  <Button type="button" size="sm" onClick={handleAddNewTag}>Save</Button>
                  <button type="button" onClick={() => setShowNewTagInput(false)} className="p-2 text-gray-400 hover:text-gray-600">
                      <Icons.XCircle className="w-5 h-5"/>
                  </button>
                </div>
              ) : (
                <select id="newProjectTag" value={newProjectTag} onChange={e => setNewProjectTag(e.target.value)} required className="input-field appearance-none" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                   {projectTags.length === 0 && <option value="">No tags available</option>}
                  {projectTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Task">
        <form onSubmit={handleAssignTask} className="space-y-4">
           <p className="text-sm">Assigning task: <span className="font-semibold">{tasks.find(t=>t.id === selectedTaskIdForAssign)?.title}</span></p>
           <div>
            <label htmlFor="assignToInternIdAssign" className="block text-sm font-medium">Assign To</label>
            <select id="assignToInternIdAssign" value={assignToInternId} onChange={e => setAssignToInternId(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500">
              <option value="">Select Intern</option>
              {interns.map(intern => <option key={intern.id} value={intern.id}>{intern.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button type="submit">Assign Task</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isTemplateModalOpen} onClose={() => {setIsTemplateModalOpen(false); setAiGeneratedTemplate(null); setTemplateDescForAI('');}} title="Generate Task with AI">
        <div className="space-y-4">
            <div>
                <label htmlFor="templateDescForAI" className="block text-sm font-medium">Describe the task for AI</label>
                <textarea id="templateDescForAI" value={templateDescForAI} onChange={e => setTemplateDescForAI(e.target.value)} rows={3} placeholder="e.g., Write a blog post about the importance of backlink diversity for SEO" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
            </div>
            <Button onClick={handleGenerateTemplateWithAI} disabled={aiLoading} leftIcon={Icons.Sparkles}>
                {aiLoading ? "Generating..." : "Generate with AI"}
            </Button>
            {aiLoading && <p className="text-sm text-gray-500">AI is thinking...</p>}
            {aiGeneratedTemplate && (
                <Card title="AI Generated Suggestion" className="mt-4 bg-primary-50">
                    <h4 className="font-semibold">{aiGeneratedTemplate.title}</h4>
                    <p className="text-sm my-1">{aiGeneratedTemplate.description}</p>
                    <p className="text-xs text-gray-600">Est. Duration: {aiGeneratedTemplate.estimatedDuration}</p>
                    <Button onClick={useAIGeneratedTemplate} size="sm" className="mt-2">Use this Template</Button>
                </Card>
            )}
             <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => {setIsTemplateModalOpen(false); setAiGeneratedTemplate(null); setTemplateDescForAI('');}}>Cancel</Button>
             </div>
        </div>
      </Modal>
      
      {taskToScore && (
        <Modal isOpen={isScoreModalOpen} onClose={() => setIsScoreModalOpen(false)} title="Score & Validate Task">
            <form onSubmit={handleScoreAndValidate} className="space-y-4">
                <p>Task: <span className="font-semibold">{taskToScore.title}</span></p>
                <div>
                    <label htmlFor="score" className="block text-sm font-medium text-gray-700">Assign Points (0-10)</label>
                    <input 
                        type="number"
                        id="score"
                        value={score}
                        onChange={(e) => setScore(Math.max(0, Math.min(10, parseInt(e.target.value, 10) || 0)))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        required
                    />
                </div>
                 <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={() => setIsScoreModalOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="success">Submit Score</Button>
                </div>
            </form>
        </Modal>
      )}

    </div>
  );
};

export default AdminTaskManagementPage;
