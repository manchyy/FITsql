import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import AppNavbar from "./components/AppNavbar";
import FlowersPage from "./pages/Flowers";
import CustomersPage from "./pages/Customers";
import OrdersPage from "./pages/Orders";
import ArrangementsPage from "./pages/Arrangements";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <AppNavbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/flowers" element={<FlowersPage />} />
          <Route path="/arrangements" element={<ArrangementsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
