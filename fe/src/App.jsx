import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Subscriptions from './pages/Subscriptions';
import Faqs from './pages/Faqs';
import About from './pages/About';
import Support from './pages/Support';
import Account from './pages/Account';
import AppLayout from './components/AppLayout';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <AppLayout>
                            <Login />
                        </AppLayout>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <AppLayout>
                            <Register />
                        </AppLayout>
                    }
                />
                <Route
                    path="/mainpage"
                    element={
                        <PrivateRoute>
                            <AppLayout>
                                <Dashboard />
                            </AppLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={<Navigate to="/mainpage" />}
                />
                <Route
                    path="/packages"
                    element={
                        <PrivateRoute>
                            <AppLayout>
                                <Packages />
                            </AppLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/subscriptions"
                    element={
                        <PrivateRoute>
                            <AppLayout>
                                <Subscriptions />
                            </AppLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/faqs"
                    element={
                        <PrivateRoute>
                            <AppLayout>
                                <Faqs />
                            </AppLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/about"
                    element={
                        <PrivateRoute>
                            <AppLayout>
                                <About />
                            </AppLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/support"
                    element={
                        <PrivateRoute>
                            <AppLayout>
                                <Support />
                            </AppLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/account"
                    element={
                        <PrivateRoute>
                            <AppLayout>
                                <Account />
                            </AppLayout>
                        </PrivateRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
