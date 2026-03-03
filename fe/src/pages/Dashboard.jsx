import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <h1>Welcome, {user.fullName}!</h1>
                <div className="dashboard-cards">
                    <div className="dashboard-card">
                        <h3>Browse Meal Packages</h3>
                        <p>Explore our variety of meal packages designed for students</p>
                        <Link to="/packages" className="card-button">View Packages</Link>
                    </div>
                    <div className="dashboard-card">
                        <h3>My Subscriptions</h3>
                        <p>Manage your active meal subscriptions</p>
                        <Link to="/subscriptions" className="card-button">View Subscriptions</Link>
                    </div>
                    <div className="dashboard-card">
                        <h3>Account Info</h3>
                        <p>Email: {user.email}</p>
                        <p>Role: {user.role}</p>
                        <button
                            onClick={handleLogout}
                            className="logout-btn"
                            style={{ marginTop: '12px' }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
