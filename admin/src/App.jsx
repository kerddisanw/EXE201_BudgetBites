import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import ImportSession from './pages/ImportSession';
import AdminDashboard from './pages/AdminDashboard';
import AdminCustomers from './pages/AdminCustomers';
import AdminPartners from './pages/AdminPartners';
import AdminPartnerMeals from './pages/AdminPartnerMeals';
import AdminPartnerRatings from './pages/AdminPartnerRatings';
import AdminPackages from './pages/AdminPackages';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminDiscountCodes from './pages/AdminDiscountCodes';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/import-session" element={<ImportSession />} />
                <Route
                    path="/"
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="partners" element={<AdminPartners />} />
                    <Route path="partners/:partnerId/ratings" element={<AdminPartnerRatings />} />
                    <Route path="partners/:partnerId/meals" element={<AdminPartnerMeals />} />
                    <Route path="meal-packages" element={<AdminPackages />} />
                    <Route path="subscriptions" element={<AdminSubscriptions />} />
                    <Route path="discount-codes" element={<AdminDiscountCodes />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
