import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./Components/Navbar/Navbar";
import MiningResourceManager from "./Components/MiningResourceManager/MiningResourceManager";
import MiningInventoryManager from "./Components/MiningInventoryManager/MiningInventoryManager";

import './App.css';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/inventory-manager" />} />
        <Route path="/resource-manager" element={<MiningResourceManager />} />

        <Route 
          path="/inventory-manager" 
          element={<Navigate to="/inventory-manager/location-total" />} 
        />

        <Route path="/inventory-manager" element={<MiningInventoryManager />} />
        <Route path="/inventory-manager/:location" element={<MiningInventoryManager />} />

      </Routes>
    </Router>
  );
};

export default App;
