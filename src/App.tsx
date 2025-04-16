import { BrowserRouter, Routes, Route } from "react-router-dom";
import SimplifiedIndex from "./pages/SimplifiedIndex";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimplifiedIndex />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
