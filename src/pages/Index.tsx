
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getApiStatus, getClientDetails } from "@/services/api";

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
    subscriptions?: Subscription[];
    bank_accounts?: BankAccount[];
  };
}

const Index = () => {
  const [idNumber, setIdNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ status: "UNKNOWN", message: "" });
  const [clientData, setClientData] = useState<ClientData | null>(null);
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
    if (!idNumber.trim() || !/^\d+$/.test(idNumber)) {
      toast({
        variant: "destructive",
        title: "Invalid ID number",
        description: "Please enter a valid numeric ID number"
      });
      return;
    }

    setIsLoading(true);
    setClientData(null);

    try {
      const data = await getClientDetails({
        id_number: idNumber,
        record: true,
        subscriptions: true,
        bank_accounts: false,
        transactions: false
      });

      // Update API status
      setApiStatus({ status: "OK", message: "API responded successfully" });

      // Log the actual API response structure
      console.log('API Response:', JSON.stringify(data, null, 2));

      // Set client data
      setClientData(data);

      // Check if data is empty or has no results
      if (!data || (data.status && data.status === 'error')) {
        toast({
          variant: "default",
          title: "No results",
          description: data.message || "No client found with this ID number"
        });
      }
    } catch (error) {
      setApiStatus({ status: "ERROR", message: error instanceof Error ? error.message : "Network error" });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch client details"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SIG Solutions</h1>
          <p className="text-gray-600">Client Information Portal</p>
          <div className="mt-4 inline-block px-4 py-2 bg-white rounded-full shadow-sm">
            <span>API Status: </span>
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


        </header>

        <main>
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Client Lookup</h2>
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter Client ID Number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="flex-1"
                maxLength={13}
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Look Up"}
              </Button>
            </div>

          </div>

          <div className="max-w-2xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-sm">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-gray-600">Loading client details...</p>
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
                                      <li key={idx}>{product.name} - R{(product.amount / 100).toFixed(2)}</li>
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
              <div className="text-center text-gray-500">
                Client details will appear here after lookup
              </div>
            )}
          </div>
        </main>

        <footer className="text-center mt-12 text-gray-600">
          <p>&copy; {new Date().getFullYear()} SIG Solutions - Secure Information Portal</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
