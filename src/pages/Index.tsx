
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [idNumber, setIdNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ status: "UNKNOWN", message: "" });
  const { toast } = useToast();

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
    try {
      const response = await fetch("https://app.switchtransact.com/api/1.0/workflow/people/details", {
        method: "POST",
        headers: {
          "Authorization": "e68066d75428a2a405798eef139cc89749c75cda5445d7ac92dbb9e9383bd76b",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id_number: idNumber,
          record: true,
          subscriptions: true,
          bank_accounts: false,
          transactions: false
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setApiStatus({ status: "OK", message: "API responded successfully" });
        // Handle successful response
        console.log("Client data:", data);
      } else {
        setApiStatus({ status: "ERROR", message: data.message || "API request failed" });
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to fetch client details"
        });
      }
    } catch (error) {
      setApiStatus({ status: "ERROR", message: "Network error" });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect to the API"
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
            <div className="text-center text-gray-500">
              Client details will appear here after lookup
            </div>
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
