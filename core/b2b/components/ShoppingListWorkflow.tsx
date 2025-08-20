'use client';

import { useState } from 'react';
import { Share, Send, Users, CheckCircle, Clock } from 'lucide-react';

interface ShoppingListWorkflowProps {
  shoppingList: any;
  onUpdate: () => void;
}

export function ShoppingListWorkflow({ shoppingList, onUpdate }: ShoppingListWorkflowProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [approvalMessage, setApprovalMessage] = useState('');

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to share with');
      return;
    }

    try {
      // TODO: Implement share functionality with B2B API
      console.log('Sharing shopping list with users:', selectedUsers);
      alert(`Shopping list shared with ${selectedUsers.length} user(s)`);
      setShowShareModal(false);
      setSelectedUsers([]);
    } catch (error) {
      alert('Failed to share shopping list');
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      // TODO: Implement approval submission with B2B API
      console.log('Submitting for approval with message:', approvalMessage);
      alert('Shopping list submitted for approval');
      setShowApprovalModal(false);
      setApprovalMessage('');
      onUpdate();
    } catch (error) {
      alert('Failed to submit for approval');
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: // approved
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 30: // draft
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft
          </span>
        );
      case 40: // ready for approval
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Approval
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Status and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Status:</span>
          {getStatusBadge(shoppingList.status || 30)}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </button>
          
          {shoppingList.status === 30 && ( // Only show for draft status
            <button
              onClick={() => setShowApprovalModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit for Approval
            </button>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Share Shopping List</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Users to Share With
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {/* Mock users - replace with actual user list from B2B API */}
                    {[
                      { id: '1', name: 'John Smith', email: 'john@company.com', role: 'Senior Buyer' },
                      { id: '2', name: 'Jane Doe', email: 'jane@company.com', role: 'Junior Buyer' },
                      { id: '3', name: 'Bob Wilson', email: 'bob@company.com', role: 'Admin' },
                    ].map((user) => (
                      <label key={user.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email} • {user.role}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Submit for Approval</h2>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="approval-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="approval-message"
                    value={approvalMessage}
                    onChange={(e) => setApprovalMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add a message for the approver..."
                  />
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Approval Required
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          This shopping list will be submitted for approval. You won't be able to modify it until it's approved.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitForApproval}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Submit for Approval
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 