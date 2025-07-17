import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { RecentQuery, QueryStatus } from '../../types';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { QUERY_STATUS_COLORS } from '../../constants';

const AdminQueriesPage: React.FC = () => {
  const { recentQueries, respondToQuery } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const handleRespond = (queryId: string) => {
    respondToQuery(queryId);
  };

  const sortedQueries = [...recentQueries].sort((a, b) => new Date(b.queryDate).getTime() - new Date(a.queryDate).getTime());

  const paginatedQueries = sortedQueries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(sortedQueries.length / itemsPerPage);

  const getAvatarColor = (initials: string) => {
    const colors = ['bg-blue-200 text-blue-800', 'bg-green-200 text-green-800', 'bg-purple-200 text-purple-800', 'bg-pink-200 text-pink-800', 'bg-red-200 text-red-800', 'bg-yellow-200 text-yellow-800'];
    const charCodeSum = initials.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  }

  return (
    <Card>
        <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Recent Queries</h2>
            <Button variant="primary">View All</Button>
        </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedQueries.map((query: RecentQuery) => (
              <tr key={query.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${getAvatarColor(query.internInitial)}`}>
                            {query.internInitial}
                        </div>
                        <span className="font-medium text-gray-900">{query.internName}</span>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{query.department}</td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-800 max-w-xs">{query.query}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${QUERY_STATUS_COLORS[query.status]}`}>
                    {query.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{query.time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {query.status === QueryStatus.PENDING ? (
                    <button onClick={() => handleRespond(query.id)} className="text-primary-600 hover:text-primary-800 font-semibold">
                      Respond
                    </button>
                  ) : (
                    <span className="text-gray-500 font-medium">Responded</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <div className="px-6 py-4 border-t flex justify-between items-center">
            <span className="text-sm text-gray-700">
                Showing {Math.min(paginatedQueries.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(currentPage * itemsPerPage, sortedQueries.length)} of {sortedQueries.length} results
            </span>
            <div className="flex items-center space-x-1">
                <Button size="sm" variant="ghost" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                {[...Array(totalPages).keys()].map(num => (
                    <button key={num + 1} onClick={() => setCurrentPage(num + 1)} className={`px-3 py-1 text-sm rounded-md ${currentPage === num + 1 ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                        {num + 1}
                    </button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
            </div>
        </div>
    </Card>
  );
};

export default AdminQueriesPage;
