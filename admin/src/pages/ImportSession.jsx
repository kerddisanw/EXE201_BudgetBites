import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAdminUser } from '../utils/sessionUser';
import '../components/AdminLayout.css';

/**
 * Accepts session from customer app login redirect (query params).
 * Token appears in URL briefly — use HTTPS in production.
 */
const ImportSession = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        const user = {
            id: searchParams.get('id') ? Number(searchParams.get('id')) : undefined,
            email: searchParams.get('email') || '',
            fullName: searchParams.get('fullName') || '',
            role: searchParams.get('role') || ''
        };
        if (!isAdminUser(user)) {
            navigate('/login', { replace: true });
            return;
        }
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/', { replace: true });
    }, [navigate, searchParams]);

    return (
        <div className="admin-loading">
            <div className="admin-spinner" />
        </div>
    );
};

export default ImportSession;
