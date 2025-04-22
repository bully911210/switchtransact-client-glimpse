
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SimplifiedIndex from "./pages/SimplifiedIndex";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/simplified" element={<SimplifiedIndex />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
