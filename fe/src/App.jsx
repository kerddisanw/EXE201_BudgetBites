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
import Partners from './pages/Partners';
import PartnerMeals from './pages/PartnerMeals';
import Cart from './pages/Cart';
import OrderDetails from './pages/OrderDetails';
import OrderHistory from './pages/OrderHistory';
import AppLayout from './components/AppLayout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

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
                    element={<Login />}
                />
                <Route
                    path="/register"
                    element={<Register />}
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
                    path="/partners"
                    element={
                        <PrivateRoute>
                            <AppLayout>
                                <Partners />
                            </AppLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/partners/:id"
                    element={
                        <PrivateRoute>
                            <AppLayout>
                                <PartnerMeals />
                            </AppLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/payment-success"
                    element={
                        <AppLayout>
                            <PaymentSuccess />
                        </AppLayout>
                    }
                />
                <Route
                    path="/payment-cancel"
                    element={
                        <AppLayout>
                            <PaymentCancel />
                        </AppLayout>
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
                <Route
                    path="/cart"
                    element={
                        <PrivateRoute>
                            <AppLayout>
                                <Cart />
                            </AppLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <PrivateRoute>
                            <AppLayout>
                                <OrderHistory />
                            </AppLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/orders/:orderId"
                    element={
                        <PrivateRoute>
                            <AppLayout>
                                <OrderDetails />
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
