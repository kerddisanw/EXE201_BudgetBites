import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { authService } from '../services/api';
import './Auth.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function Login() {
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
            const response = await authService.login(formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        try {
            // credentialResponse.credential chính là Google ID Token (JWT)
            const response = await authService.googleLogin(credentialResponse.credential);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Google login thất bại.');
        }
    };

    const handleGoogleError = () => {
        setError('Google login thất bại. Vui lòng thử lại.');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Student Meal Combo</h1>
                <h2>Login</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Login'}
                    </button>
                </form>

                <div className="divider">
                    <span>hoặc</span>
                </div>

                {/* GoogleOAuthProvider + GoogleLogin component — cách chính thức và đáng tin nhất */}
                {GOOGLE_CLIENT_ID ? (
                    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                        <div className="google-btn-wrapper">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap={false}
                                width="100%"
                                text="signin_with"
                                shape="rectangular"
                                logo_alignment="left"
                            />
                        </div>
                    </GoogleOAuthProvider>
                ) : (
                    <p style={{ color: '#aaa', textAlign: 'center', fontSize: '0.85rem' }}>
                        Google login chưa được cấu hình
                    </p>
                )}

                <p className="auth-link">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
