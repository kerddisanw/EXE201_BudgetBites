import React from 'react';
import './AdminLogo.css';

const AdminLogo = ({ badge }) => {
    return (
        <div className="admin-logo">
            <span className="admin-logo-primary">Budget</span>
            <span className="admin-logo-accent">Bites</span>
            {badge ? <span className="admin-logo-badge">{badge}</span> : null}
        </div>
    );
};

export default AdminLogo;
