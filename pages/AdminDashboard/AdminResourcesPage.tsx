
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Resource, ResourceType } from '../../types';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { Icons } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';


const AdminResourcesPage: React.FC = () => {
  const { resources, addNotification, addResource } = useData();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState<ResourceType>(ResourceType.GUIDE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!title || (type === ResourceType.GUIDE && !link)) {
        addNotification({message: "Title and link (for Guide type) are required.", type: 'warning'});
        return;
    }

    const newResourceData: Omit<Resource, 'id' | 'uploadedBy'> = { title, description, link: type === ResourceType.GUIDE ? link : undefined, type };
    const newResource = await addResource(newResourceData);

    if (newResource) {
        addNotification({message: `Resource "${title}" added.`, type: 'success'});
        setIsModalOpen(false);
        setTitle(''); setDescription(''); setLink(''); setType(ResourceType.GUIDE);
    } else {
        addNotification({message: `Failed to add resource.`, type: 'error'});
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h2 className="text-3xl font-semibold text-gray-800">Resources & Tools</h2>
            <Button onClick={() => setIsModalOpen(true)} leftIcon={Icons.PlusCircle}>Add Resource</Button>
       </div>

      <Card title="Available Resources">
        {resources.length > 0 ? (
          <ul className="space-y-3">
            {resources.map(res => (
              <li key={res.id} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-lg font-semibold text-secondary-700">{res.title}</h4>
                        <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{res.type}</span>
                    </div>
                    {/* Actions like Edit/Delete */}
                </div>
                {res.description && <p className="text-sm text-gray-600 mt-1">{res.description}</p>}
                {res.type === ResourceType.GUIDE && res.link && (
                  <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline mt-1 block">
                    {res.link} <Icons.Logout className="w-3 h-3 inline transform rotate-[135deg]"/>
                  </a>
                )}
                {res.fileName && <p className="text-sm text-gray-600 mt-1">File: {res.fileName}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No resources added yet.</p>
        )}
      </Card>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Resource">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="resTitle" className="block text-sm font-medium">Title</label>
                <input type="text" id="resTitle" value={title} onChange={e => setTitle(e.target.value)} required className="input-field-light"/>
            </div>
            <div>
                <label htmlFor="resDesc" className="block text-sm font-medium">Description (Optional)</label>
                <textarea id="resDesc" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="input-field-light"/>
            </div>
             <div>
                <label htmlFor="resType" className="block text-sm font-medium">Type</label>
                <select id="resType" value={type} onChange={e => setType(e.target.value as ResourceType)} className="input-field-light">
                    {Object.values(ResourceType).map(rt => <option key={rt} value={rt}>{rt}</option>)}
                </select>
            </div>
            {type === ResourceType.GUIDE && (
                <div>
                    <label htmlFor="resLink" className="block text-sm font-medium">Link URL</label>
                    <input type="url" id="resLink" value={link} onChange={e => setLink(e.target.value)} required={type === ResourceType.GUIDE} className="input-field-light"/>
                </div>
            )}
            {(type === ResourceType.TEMPLATE || type === ResourceType.TOOL) && (
                 <div>
                    <label htmlFor="resFile" className="block text-sm font-medium">Upload File (Not Implemented)</label>
                    <input type="file" id="resFile" disabled className="input-field-light opacity-50"/>
                    <p className="text-xs text-gray-500">File upload functionality is a placeholder.</p>
                </div>
            )}
            <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Resource</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminResourcesPage;