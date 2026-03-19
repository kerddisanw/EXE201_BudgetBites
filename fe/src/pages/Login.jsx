import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { authService } from '../services/api';
import './Auth.css';
import AuthFooter from '../components/AuthFooter';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function Login({ initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode === 'register' ? 'register' : 'login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mode === 'register') {
            if (formData.password !== formData.confirmPassword) {
                setError('Mật khẩu và xác nhận mật khẩu không khớp.');
                return;
            }
        }

        setLoading(true);

        try {
            if (mode === 'login') {
                const response = await authService.login({
                    email: formData.email,
                    password: formData.password
                });
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data));
                navigate('/mainpage');
            } else {
                const payload = {
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    studentId: `STD-${Date.now()}`,
                    phoneNumber: formData.phoneNumber || '',
                    address: '',
                    university: 'FPT UNI'
                };
                const response = await authService.register(payload);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data));
                navigate('/mainpage');
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    (mode === 'login'
                        ? 'Login thất bại. Vui lòng thử lại.'
                        : 'Registration failed. Please try again.')
            );
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
            navigate('/mainpage');
        } catch (err) {
            setError(err.response?.data?.message || 'Google login thất bại.');
        }
    };

    const handleGoogleError = () => {
        setError('Google login thất bại. Vui lòng thử lại.');
    };

    return (
        <>
            <div className="auth-page">
                <div className="auth-hero">
                    <div className="auth-hero-badge">BudgetBites</div>
                    <h1 className="auth-hero-title">Bữa ăn sinh viên thông minh mỗi ngày</h1>
                    <p className="auth-hero-subtitle">
                        Lên lịch bữa ăn tuần, chọn đối tác yêu thích và tối ưu chi tiêu mà vẫn đầy đủ
                        dinh dưỡng.
                    </p>
                    <ul className="auth-hero-list">
                        <li>• Theo dõi chi phí bữa ăn theo tuần / tháng</li>
                        <li>• Chọn quán ăn đối tác gần bạn</li>
                        <li>• Đặt trước để luôn có suất ăn đúng giờ</li>
                    </ul>
                </div>

                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <div className="auth-header-title">
                                {mode === 'login' ? 'Chào mừng trở lại' : 'Đăng ký tài khoản'}
                            </div>
                            <div className="auth-header-subtitle">
                                {mode === 'login'
                                    ? 'Đăng nhập để tiếp tục quản lý bữa ăn của bạn.'
                                    : 'Chỉ mất chưa đến 1 phút để hoàn tất.'}
                            </div>

                            <div className="auth-tabs">
                                <button
                                    className={
                                        'auth-tab' + (mode === 'login' ? ' auth-tab-active' : '')
                                    }
                                    type="button"
                                    onClick={() => setMode('login')}
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    className={
                                        'auth-tab' + (mode === 'register' ? ' auth-tab-active' : '')
                                    }
                                    type="button"
                                    onClick={() => setMode('register')}
                                >
                                    Đăng ký
                                </button>
                            </div>
                        </div>

                        <div className="auth-card-inner" key={mode}>
                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            {mode === 'register' && (
                                <div className="form-group">
                                    <label>Họ và tên</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}
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
                                <label>Mật khẩu</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={mode === 'register' ? 6 : undefined}
                                />
                            </div>
                            {mode === 'register' && (
                                <>
                                    <div className="form-group">
                                        <label>Xác nhận mật khẩu</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </>
                            )}
                            <button type="submit" disabled={loading}>
                                {loading
                                    ? mode === 'login'
                                        ? 'Đang đăng nhập...'
                                        : 'Đang đăng ký...'
                                    : mode === 'login'
                                      ? 'Đăng nhập'
                                      : 'Đăng ký'}
                            </button>
                        </form>

                        {mode === 'login' && (
                            <>
                                <div className="divider">
                                    <span>hoặc</span>
                                </div>

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
                                ) : null}
                            </>
                        )}
                        </div>
                    </div>
                </div>
            </div>
            <AuthFooter />
        </>
    );
}

export default Login;
