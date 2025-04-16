
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getApiStatus, getClientDetails } from "@/services/api";
import ProductSelector from "@/components/ProductSelector";
import { ProductConfig } from "@/config/api-config";
import { logError, getErrorMessage } from "@/utils/errorHandler";

// Define interfaces for API response types
interface Subscription {
  id?: number;
  date_start: string;
  status: string;
  products?: {
    id: number;
    name: string;
    amount: number;
    description?: string;
  }[];
}

interface BankAccount {
  id?: number;
  bank_name: string;
  account_number: string;
  account_type: string;
  status: string;
}

interface ClientData {
  status: 'success' | 'error' | 'not_found';
  message?: string;
  data?: {
    id?: number;
    id_number: string;
    name: string;
    surname: string;
    contact_cell?: string;
    email?: string;
    date_created?: string;
    status?: string;
    total_successful_transactions?: number;
    total_failed_transactions?: number;
    subscriptions?: Subscription[];
    bank_accounts?: BankAccount[];
  };
}

const Index = () => {
  const [idNumber, setIdNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ status: "UNKNOWN", message: "" });
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [currentProduct, setCurrentProduct] = useState<ProductConfig>({
    id: 'dear-sa',
    name: 'DearSA',
    apiKey: 'e68066d75428a2a405798eef139cc89749c75cda5445d7ac92dbb9e9383bd76b',
    description: 'DearSA product configuration'
  });
  const { toast } = useToast();

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const status = await getApiStatus();
        setApiStatus(status);
      } catch (error) {
        console.error('Failed to check API status:', error);
        setApiStatus({ status: 'ERROR', message: 'Failed to check API status' });
      }
    };

    checkApiStatus();
    // Set up interval to periodically check API status
    const intervalId = setInterval(checkApiStatus, 60000); // Check every minute

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  const handleSearch = async () => {
    // Validate ID number - must be numeric and at least 10 digits
    if (!idNumber.trim()) {
      toast({
        variant: "destructive",
        title: "ID number required",
        description: "Please enter an ID number"
      });
      return;
    }

    if (!/^\d+$/.test(idNumber)) {
      toast({
        variant: "destructive",
        title: "Invalid ID number",
        description: "ID number must contain only digits"
      });
      return;
    }

    if (idNumber.length < 10) {
      toast({
        variant: "destructive",
        title: "Invalid ID number",
        description: "ID number must be at least 10 digits"
      });
      return;
    }

    setIsLoading(true);
    setClientData(null);

    try {
      // Log the request for debugging
      console.log(`Searching for client with ID: ${idNumber}`);

      const response = await getClientDetails({
        id_number: idNumber,
        record: true,
        subscriptions: true,
        bank_accounts: false,
        transactions: false
      });

      // Log the actual API response structure
      console.log('API Response:', JSON.stringify(response, null, 2));

      // Set client data - this will be used by the UI to display the appropriate content
      // Cast the response to ClientData to satisfy TypeScript
      setClientData(response as ClientData);

      // Handle different response statuses
      if (!response) {
        // No response at all
        toast({
          variant: "destructive",
          title: "Error",
          description: "No response received from API"
        });
        setApiStatus({ status: "ERROR", message: "No response from API" });
      } else if (response.status === 'error') {
        // Error response
        logError(new Error(response.message || 'Unknown API error'), 'Client Search');
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "An error occurred"
        });
        setApiStatus({ status: "ERROR", message: response.message || "API error" });
      } else if (response.status === 'success') {
        // Success response
        setApiStatus({ status: "OK", message: "API responded successfully" });

        // Check if data exists
        if (!response.data) {
          toast({
            variant: "default",
            title: "No results",
            description: "No client data returned"
          });
        } else if (!response.data.record) {
          toast({
            variant: "default",
            title: "No results",
            description: "No client found with this ID number"
          });
        } else {
          // Success with data
          toast({
            variant: "default",
            title: "Client Found",
            description: "Client details retrieved successfully"
          });
        }
      } else {
        // Unexpected status
        logError(new Error(`Unexpected response status: ${response.status}`), 'Client Search');
        toast({
          variant: "destructive",
          title: "Unexpected Response",
          description: "Received an unexpected response from the API"
        });
        setApiStatus({ status: "ERROR", message: `Unexpected response status: ${response.status}` });
      }
    } catch (error) {
      logError(error, 'Client Search');
      setApiStatus({ status: "ERROR", message: getErrorMessage(error) });
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-2 flex-grow flex flex-col">
        <header className="mb-2">
          <div className="max-w-5xl mx-auto w-full flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
            <div>
              <ProductSelector
                onProductChange={(product) => {
                  setCurrentProduct(product);
                  // Reset client data when product changes
                  setClientData(null);
                  // Check API status for the new product
                  getApiStatus().then(setApiStatus);
                }}
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">SIG Solutions</h1>
              <p className="text-sm text-gray-600">Client Information Portal</p>
            </div>
            <div className="px-3 py-1 bg-gray-50 rounded-full shadow-sm text-sm">
              <span>API: </span>
              <span
                className={`font-semibold ${
                  apiStatus.status === "OK" ? "text-green-600" :
                  apiStatus.status === "ERROR" ? "text-red-600" :
                  "text-gray-600"
                }`}
                title={apiStatus.message}
              >
                {apiStatus.status}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-grow flex flex-col">
          <div className="max-w-5xl mx-auto w-full bg-white p-3 rounded-lg shadow-sm">
            <div className="flex gap-4 items-center">
              <div className="flex items-center">
                <h2 className="text-base font-semibold">Client Lookup:</h2>
                <span className="ml-2 text-xs text-gray-500">({currentProduct.name})</span>
              </div>
              <div className="flex gap-2 flex-grow">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Enter Client ID Number"
                    value={idNumber}
                    onChange={(e) => {
                      try {
                        // Only allow numeric input
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setIdNumber(value);
                      } catch (error) {
                        // Log error but don't crash
                        console.error('Error updating ID number:', error);
                      }
                    }}
                    className="w-full h-8 text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={13}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      handleSearch();
                    } catch (error) {
                      console.error('Error handling search:', error);
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: "An unexpected error occurred. Please try again."
                      });
                    }
                  }}
                  disabled={isLoading}
                  className="h-8 text-xs px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Searching..." : "Look Up"}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto w-full mt-2 bg-white p-3 rounded-lg shadow-sm flex-grow overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-2 text-gray-600">Loading client details...</p>
                </div>
              </div>
            ) : clientData && clientData.status === 'success' && clientData.data ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-gray-900">{clientData.data.name} {clientData.data.surname}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-500">ID Number</p>
                    <p className="text-gray-900">{clientData.data.id_number}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-500">Contact</p>
                    <p className="text-gray-900">{clientData.data.contact_cell || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{clientData.data.email || 'N/A'}</p>
                  </div>
                  {clientData.data.date_created && (
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-500">Date Created</p>
                      <p className="text-gray-900">{clientData.data.date_created}</p>
                    </div>
                  )}
                  {clientData.data.status && (
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-gray-900 capitalize">{clientData.data.status}</p>
                    </div>
                  )}
                  {(clientData.data.total_successful_transactions !== undefined ||
                    clientData.data.total_failed_transactions !== undefined) && (
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-500">Debit Success Ratio</p>
                      <p className="text-gray-900">
                        {(() => {
                          const successful = clientData.data.total_successful_transactions || 0;
                          const failed = clientData.data.total_failed_transactions || 0;
                          const total = successful + failed;
                          if (total === 0) return 'No transactions';
                          const ratio = (successful / total * 100).toFixed(1);
                          return `${ratio}% (${successful}/${total})`;
                        })()}
                      </p>
                    </div>
                  )}
                </div>

                {clientData.data.subscriptions && clientData.data.subscriptions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Subscriptions</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {clientData.data.subscriptions.map((sub: Subscription, index: number) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.date_start}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.status}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {sub.products && sub.products.length > 0 ? (
                                  <ul className="list-disc pl-5">
                                    {sub.products.map((product: any, idx: number) => (
                                      <li key={idx}>{product.name} - R{Number(product.amount).toFixed(2)}</li>
                                    ))}
                                  </ul>
                                ) : 'No products'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {clientData.data.bank_accounts && clientData.data.bank_accounts.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Bank Accounts</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {clientData.data.bank_accounts.map((account: BankAccount, index: number) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.bank_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.account_number}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.account_type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : clientData && clientData.status === 'error' ? (
              <div className="text-center text-red-500 py-8">
                <p className="font-medium">Error</p>
                <p>{clientData.message || 'An error occurred while fetching client details'}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <p className="text-base">Enter an ID number and click "Look Up" to view client details</p>
                  <p className="text-sm mt-2 text-gray-400">Example: 7608210157080</p>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="text-center mt-1 text-gray-600 text-xs py-1">
          <p>&copy; {new Date().getFullYear()} SIG Solutions - Secure Information Portal</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
