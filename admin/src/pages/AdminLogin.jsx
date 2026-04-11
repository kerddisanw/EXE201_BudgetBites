import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { CUSTOMER_APP_URL } from '../config/config';
import './AdminLogin.css';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await authService.login({
                email: formData.email,
                password: formData.password
            });
            if (response.data.role !== 'ADMIN') {
                setError('Tài khoản không có quyền quản trị.');
                return;
            }
            localStorage.setItem('token', response.data.token);
            localStorage.setItem(
                'user',
                JSON.stringify({
                    id: response.data.id,
                    email: response.data.email,
                    fullName: response.data.fullName,
                    role: response.data.role
                })
            );
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const customerLoginUrl = `${CUSTOMER_APP_URL}/login`;

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <h1 className="admin-login-title">BudgetBites Quản trị</h1>
                <p className="admin-login-sub">Đăng nhập bằng tài khoản admin.</p>
                {error ? <div className="admin-login-error">{error}</div> : null}
                <form className="admin-login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="admin-email">Email</label>
                        <input
                            id="admin-email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="admin-password">Mật khẩu</label>
                        <input
                            id="admin-password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button className="admin-login-submit" type="submit" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
                <a className="admin-login-back" href={customerLoginUrl}>
                    ← Về đăng nhập khách hàng
                </a>
            </div>
        </div>
    );
};

export default AdminLogin;
