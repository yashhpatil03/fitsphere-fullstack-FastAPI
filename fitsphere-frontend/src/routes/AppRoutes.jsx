import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import AiCoach from "../pages/AiCoach";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<Login />} />
                <Route path="/ai-coach" element={
                    <ProtectedRoute>
                        <AiCoach />
                   </ProtectedRoute>
                   }/>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;