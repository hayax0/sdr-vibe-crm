import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Campaigns } from "@/pages/Campaigns";
import { Dashboard } from "@/pages/Dashboard";
import { Leads } from "@/pages/Leads";
import { Login } from "@/pages/Login";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

export function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />{" "}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/campaigns" element={<Campaigns />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
