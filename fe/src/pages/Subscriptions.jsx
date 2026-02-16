import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { subscriptionService, authService } from '../services/api';
import './Subscriptions.css';

function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await subscriptionService.getMySubscriptions();
            setSubscriptions(response.data);
        } catch (err) {
            setError('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const getStatusClass = (status) => {
        return `status-badge status-${status.toLowerCase()}`;
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="subscriptions-container">
            <nav className="navbar">
                <div className="nav-brand">Student Meal Combo</div>
                <div className="nav-links">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/packages">Packages</Link>
                    <Link to="/subscriptions">My Subscriptions</Link>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <div className="subscriptions-content">
                <h1>My Subscriptions</h1>
                {error && <div className="error-message">{error}</div>}

                {subscriptions.length === 0 ? (
                    <div className="no-subscriptions">
                        <p>You don't have any subscriptions yet.</p>
                        <Link to="/packages" className="browse-btn">Browse Packages</Link>
                    </div>
                ) : (
                    <div className="subscriptions-list">
                        {subscriptions.map((sub) => (
                            <div key={sub.id} className="subscription-card">
                                <div className="subscription-header">
                                    <h3>{sub.packageName}</h3>
                                    <span className={getStatusClass(sub.status)}>{sub.status}</span>
                                </div>
                                <div className="subscription-details">
                                    <p><strong>Start Date:</strong> {new Date(sub.startDate).toLocaleDateString()}</p>
                                    <p><strong>End Date:</strong> {new Date(sub.endDate).toLocaleDateString()}</p>
                                    <p><strong>Total Amount:</strong> ${sub.totalAmount}</p>
                                    {sub.notes && <p><strong>Notes:</strong> {sub.notes}</p>}
                                    <p className="subscription-date">
                                        Created: {new Date(sub.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Subscriptions;
