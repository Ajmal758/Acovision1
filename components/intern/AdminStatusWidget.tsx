import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Card from '../shared/Card';
import Button from '../shared/Button';

const AdminStatusWidget: React.FC = () => {
  const { adminStatus, addNotification } = useData();
  const [queryText, setQueryText] = useState('');

  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) {
      addNotification({ message: 'Query cannot be empty.', type: 'warning' });
      return;
    }
    if (!adminStatus.isAvailableForQueries) {
      addNotification({ message: 'Admin is currently unavailable.', type: 'error' });
      return;
    }
    
    // Mocking submission
    addNotification({ message: 'Your query has been submitted.', type: 'success' });
    console.log('Query submitted:', queryText);
    setQueryText('');
  };

  return (
    <Card className={`border-l-4 ${adminStatus.isAvailableForQueries ? 'border-green-400' : 'border-gray-300'}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Admin Status</h3>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${adminStatus.isAvailableForQueries ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
          {adminStatus.isAvailableForQueries ? 'Available' : 'Busy'}
        </span>
      </div>
      
      <form onSubmit={handleSubmitQuery} className="space-y-4">
        <div>
          <label htmlFor="query-input" className="block text-sm font-medium text-gray-700 mb-1">
            Submit a query
          </label>
          <textarea
            id="query-input"
            rows={3}
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder={adminStatus.isAvailableForQueries ? 'Have a question? Ask the admin...' : 'The admin is currently unavailable for queries.'}
            disabled={!adminStatus.isAvailableForQueries}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          />
        </div>
        <div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={!adminStatus.isAvailableForQueries || !queryText.trim()}
          >
            Submit
          </Button>
        </div>
      </form>

    </Card>
  );
};

export default AdminStatusWidget;