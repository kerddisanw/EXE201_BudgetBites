import { Navigate } from 'react-router-dom';
import { getStoredUser, isAdminUser } from './utils/sessionUser';

export function AdminRoute({ children }) {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    const user = getStoredUser();
    if (!isAdminUser(user)) return <Navigate to="/login" replace />;
    return children;
}
