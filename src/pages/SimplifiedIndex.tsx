import React, { useState } from 'react';

// Mock client data for demonstration
const MOCK_CLIENT_DATA = {
  name: "John",
  surname: "Doe",
  id_number: "7608210157080",
  contact_cell: "0821234567",
  email: "john.doe@example.com",
  date_created: "2023-01-15",
  status: "active",
  total_successful_transactions: 18,
  total_failed_transactions: 2,
  subscriptions: [
    {
      date_start: "2023-02-01",
      status: "active",
      products: [
        {
          name: "Basic Plan",
          amount: 199.00
        }
      ]
    }
  ]
};

const SimplifiedIndex = () => {
  const [idNumber, setIdNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Simple function to handle ID number input
  const handleIdNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input
    const value = e.target.value.replace(/[^0-9]/g, '');
    setIdNumber(value);
  };

  // Simple function to handle search
  const handleSearch = () => {
    // Reset state
    setError(null);
    setClientData(null);
    
    // Validate input
    if (!idNumber) {
      setError('Please enter an ID number');
      return;
    }
    
    if (idNumber.length < 10) {
      setError('ID number must be at least 10 digits');
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes, only return data for this specific ID
      if (idNumber === '7608210157080') {
        setClientData(MOCK_CLIENT_DATA);
      } else {
        setError('No client found with this ID number');
      }
    }, 1000);
  };

  // Calculate debit success ratio
  const getDebitSuccessRatio = () => {
    if (!clientData) return 'N/A';
    
    const successful = clientData.total_successful_transactions || 0;
    const failed = clientData.total_failed_transactions || 0;
    const total = successful + failed;
    
    if (total === 0) return 'No transactions';
    
    const ratio = (successful / total * 100).toFixed(1);
    return `${ratio}% (${successful}/${total})`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-white p-4 rounded-lg shadow mb-4">
          <h1 className="text-2xl font-bold text-center">SIG Solutions</h1>
          <p className="text-center text-gray-600">Client Information Portal</p>
          <p className="text-center text-sm text-gray-500 mt-2">Product: DearSA</p>
        </header>

        {/* Search Form */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Client ID Number (try 7608210157080)"
              value={idNumber}
              onChange={handleIdNumberChange}
              className="flex-1 border border-gray-300 rounded px-3 py-2"
              maxLength={13}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && (
            <p className="text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p>Loading...</p>
          </div>
        ) : clientData ? (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Client Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Personal Details</h3>
                <p><span className="font-medium">Name:</span> {clientData.name} {clientData.surname}</p>
                <p><span className="font-medium">ID Number:</span> {clientData.id_number}</p>
                <p><span className="font-medium">Contact:</span> {clientData.contact_cell}</p>
                <p><span className="font-medium">Email:</span> {clientData.email}</p>
                <p><span className="font-medium">Status:</span> {clientData.status}</p>
                <p><span className="font-medium">Debit Success Ratio:</span> {getDebitSuccessRatio()}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Subscription Details</h3>
                {clientData.subscriptions && clientData.subscriptions.length > 0 ? (
                  <>
                    <p><span className="font-medium">Start Date:</span> {clientData.subscriptions[0].date_start}</p>
                    <p><span className="font-medium">Status:</span> {clientData.subscriptions[0].status}</p>
                    <p><span className="font-medium">Product:</span> {clientData.subscriptions[0].products[0].name}</p>
                    <p><span className="font-medium">Amount:</span> R{clientData.subscriptions[0].products[0].amount.toFixed(2)}</p>
                  </>
                ) : (
                  <p>No subscription information available</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-500">Enter an ID number and click "Search" to view client details</p>
            <p className="text-gray-400 text-sm mt-2">Example: 7608210157080</p>
          </div>
        )}

        <footer className="mt-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} SIG Solutions</p>
        </footer>
      </div>
    </div>
  );
};

export default SimplifiedIndex;
