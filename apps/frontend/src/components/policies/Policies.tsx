import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Shield, Lock, Users, Download, Filter, ChevronDown, X } from 'lucide-react';

interface Policy {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  status: 'active' | 'draft' | 'archived';
  description: string;
  fileUrl: string;
  requiresAcknowledgment: boolean;
  acknowledged?: boolean;
}

const Policies: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching policies from an API
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch this from your API
        // const response = await fetch('/api/policies');
        // const data = await response.json();
        
        // Simulated data
        const mockPolicies: Policy[] = [
          {
            id: '1',
            title: 'Acceptable Use Policy',
            category: 'Security',
            lastUpdated: '2023-10-15',
            status: 'active',
            description: 'Guidelines for the appropriate use of company IT resources and data.',
            fileUrl: '/policies/acceptable-use-policy.pdf',
            requiresAcknowledgment: true,
            acknowledged: true,
          },
          {
            id: '2',
            title: 'Password Policy',
            category: 'Security',
            lastUpdated: '2023-09-28',
            status: 'active',
            description: 'Requirements for creating and managing strong passwords.',
            fileUrl: '/policies/password-policy.pdf',
            requiresAcknowledgment: true,
            acknowledged: true,
          },
          {
            id: '3',
            title: 'Remote Work Policy',
            category: 'HR',
            lastUpdated: '2023-10-05',
            status: 'active',
            description: 'Guidelines and expectations for employees working remotely.',
            fileUrl: '/policies/remote-work-policy.pdf',
            requiresAcknowledgment: true,
            acknowledged: false,
          },
          {
            id: '4',
            title: 'Data Protection Policy',
            category: 'Compliance',
            lastUpdated: '2023-09-15',
            status: 'active',
            description: 'Procedures for protecting sensitive company and customer data.',
            fileUrl: '/policies/data-protection-policy.pdf',
            requiresAcknowledgment: true,
            acknowledged: true,
          },
          {
            id: '5',
            title: 'Social Media Policy',
            category: 'HR',
            lastUpdated: '2023-08-20',
            status: 'active',
            description: 'Guidelines for appropriate use of social media in a professional context.',
            fileUrl: '/policies/social-media-policy.pdf',
            requiresAcknowledgment: true,
            acknowledged: false,
          },
        ];
        
        setPolicies(mockPolicies);
        setError(null);
      } catch (err) {
        console.error('Error fetching policies:', err);
        setError('Failed to load policies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const categories = ['All', 'Security', 'HR', 'Compliance', 'IT', 'Operations'];
  
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || 
                           policy.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAcknowledge = async (policyId: string) => {
    try {
      // In a real app, you would make an API call to acknowledge the policy
      // await fetch(`/api/policies/${policyId}/acknowledge`, { method: 'POST' });
      
      // Update local state
      setPolicies(policies.map(policy => 
        policy.id === policyId ? { ...policy, acknowledged: true } : policy
      ));
    } catch (err) {
      console.error('Error acknowledging policy:', err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'HR':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'Compliance':
        return <FileText className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading policies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Policies</h1>
          <p className="text-gray-600">Review and acknowledge important company policies</p>
        </div>

        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
                </button>
                
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <label key={category} className="flex items-center">
                            <input
                              type="radio"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              checked={selectedCategory === category || (!selectedCategory && category === 'All')}
                              onChange={() => {
                                setSelectedCategory(category === 'All' ? null : category);
                                setShowFilters(false);
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-700">{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 text-right">
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setSelectedCategory(null);
                          setSearchQuery('');
                          setShowFilters(false);
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {selectedCategory && (
            <div className="mt-3 flex items-center">
              <span className="text-sm text-gray-500 mr-2">Filtered by:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {selectedCategory}
                <button
                  type="button"
                  className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300 focus:outline-none"
                  onClick={() => setSelectedCategory(null)}
                >
                  <span className="sr-only">Remove filter</span>
                  <X className="h-3 w-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {filteredPolicies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No policies found</h3>
            <p className="mt-1 text-gray-500">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'There are no policies available at the moment.'}
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
              >
                {searchQuery || selectedCategory ? 'Clear search' : 'Refresh'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredPolicies.map((policy) => (
                <li key={policy.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getCategoryIcon(policy.category)}
                        <p className="ml-2 text-sm font-medium text-blue-600 truncate">
                          {policy.category}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-800 font-medium">
                          {policy.title}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span>Last updated {policy.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {policy.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex space-x-3">
                        <a
                          href={policy.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </a>
                        <a
                          href={policy.fileUrl}
                          download
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </div>
                      {policy.requiresAcknowledgment && (
                        <div>
                          {policy.acknowledged ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Acknowledged
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAcknowledge(policy.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              About Company Policies
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              All employees are required to review and acknowledge these policies.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Policies
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {policies.length}
                </dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Acknowledged
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  {policies.filter(p => p.acknowledged).length}
                </dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending Review
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                  {policies.filter(p => p.requiresAcknowledgment && !p.acknowledged).length}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;
