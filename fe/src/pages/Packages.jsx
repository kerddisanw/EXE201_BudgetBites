import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { packageService, subscriptionService } from '../services/api';
import { authService } from '../services/api';
import './Packages.css';

function Packages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await packageService.getAllPackages();
            setPackages(response.data);
        } catch (err) {
            setError('Failed to load packages');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (packageId) => {
        try {
            const startDate = new Date().toISOString().split('T')[0];
            await subscriptionService.createSubscription({
                packageId,
                startDate,
                notes: ''
            });
            alert('Subscription created successfully!');
            navigate('/subscriptions');
        } catch (err) {
            alert('Failed to create subscription: ' + (err.response?.data?.message || 'Unknown error'));
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="packages-container">
            <nav className="navbar">
                <div className="nav-brand">Student Meal Combo</div>
                <div className="nav-links">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/packages">Packages</Link>
                    <Link to="/subscriptions">My Subscriptions</Link>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <div className="packages-content">
                <h1>Meal Packages</h1>
                {error && <div className="error-message">{error}</div>}
                <div className="packages-grid">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="package-card">
                            <h3>{pkg.name}</h3>
                            <p className="package-description">{pkg.description}</p>
                            <div className="package-details">
                                <p><strong>Price:</strong> ${pkg.price}</p>
                                <p><strong>Duration:</strong> {pkg.durationDays} days</p>
                                <p><strong>Meals/Day:</strong> {pkg.mealsPerDay}</p>
                                <p><strong>Type:</strong> {pkg.packageType}</p>
                                {pkg.partnerName && <p><strong>Partner:</strong> {pkg.partnerName}</p>}
                            </div>
                            <button
                                onClick={() => handleSubscribe(pkg.id)}
                                className="subscribe-btn"
                            >
                                Subscribe Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Packages;
