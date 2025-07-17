import React from 'react';
import { useData } from '../../contexts/DataContext';
import Card from '../../components/shared/Card';
import { Icons } from '../../constants';
import { ResourceType } from '../../types';

const InternResourcesPage: React.FC = () => {
  const { resources } = useData();

  if (!resources) {
    return <div className="text-center p-8">Loading resources...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Learning Resources & Tools</h2>
      <p className="text-gray-600">Here you can find helpful documents, links, and tools shared by your administrator.</p>

      {resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(res => (
            <Card key={res.id} title={res.title} className="hover:shadow-lg transition-shadow duration-300">
              <div className="space-y-2">
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mr-2
                  ${res.type === ResourceType.TEMPLATE ? 'bg-blue-100 text-blue-700' : ''}
                  ${res.type === ResourceType.GUIDE ? 'bg-green-100 text-green-700' : ''}
                  ${res.type === ResourceType.TOOL ? 'bg-purple-100 text-purple-700' : ''}
                `}>
                  {res.type}
                </span>
                 {res.expiryDate && (
                    <span className="text-xs text-red-500">
                        Expires: {new Date(res.expiryDate).toLocaleDateString()}
                    </span>
                )}

                {res.description && <p className="text-sm text-gray-600">{res.description}</p>}
                
                {res.type === ResourceType.GUIDE && res.link && (
                  <a 
                    href={res.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary-600 hover:text-primary-800 hover:underline font-medium text-sm break-all flex items-center"
                    aria-label={`Open link to ${res.title}`}
                  >
                    {res.link}
                    <Icons.Logout className="w-4 h-4 ml-1 transform rotate-[135deg] flex-shrink-0" />
                  </a>
                )}

                {res.fileName && (
                  <p className="text-sm text-gray-700">
                    File: <span className="font-medium">{res.fileName}</span> 
                    {/* Download link/button would go here if file hosting was implemented */}
                     <span className="text-xs text-gray-400"> (Download N/A)</span>
                  </p>
                )}

                {res.usageLimit && (
                  <p className="text-xs text-gray-500">Usage Limit: {res.usageLimit} times</p>
                )}

              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-gray-500 py-8">No resources have been shared yet. Check back later!</p>
        </Card>
      )}
    </div>
  );
};

export default InternResourcesPage;