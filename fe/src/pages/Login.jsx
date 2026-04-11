import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { authService } from '../services/api';
import './Auth.css';
import AuthFooter from '../components/AuthFooter';
import heroImg from '../assets/images/student_meal_hero.png';

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
                if (response.data.role === 'ADMIN') {
                    const adminBase = (
                        import.meta.env.VITE_ADMIN_APP_URL || 'http://localhost:5174'
                    ).replace(/\/$/, '');
                    const u = response.data;
                    const params = new URLSearchParams({
                        token: u.token,
                        email: u.email || '',
                        fullName: u.fullName || '',
                        role: u.role || 'ADMIN',
                        id: String(u.id ?? '')
                    });
                    window.location.href = `${adminBase}/import-session?${params.toString()}`;
                    return;
                }
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
                <div className="auth-hero-section">
                    <img 
                        src={heroImg} 
                        alt="Student Meal Hero" 
                        className="auth-hero-img" 
                    />
                    <div className="auth-hero-overlay"></div>
                    <div className="auth-hero-content">
                        <div className="auth-hero-badge">BudgetBites • Tiết kiệm - Tiết lợi</div>
                        <h1 className="auth-hero-title">Bữa ăn sinh viên thông minh mỗi ngày</h1>
                        <p className="auth-hero-subtitle">
                            Lên lịch bữa ăn tuần, chọn đối tác yêu thích và tối ưu chi tiêu mà vẫn đầy đủ
                            dinh dưỡng. Chúng tôi đồng hành cùng bạn học tập tốt hơn qua từng bữa ăn.
                        </p>
                        <ul className="auth-hero-list">
                            <li>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 13L9 17L19 7" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Theo dõi chi phí bữa ăn linh hoạt
                            </li>
                            <li>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 13L9 17L19 7" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Đối tác ăn uống uy tín & đa dạng
                            </li>
                            <li>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 13L9 17L19 7" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Tiết kiệm thời gian với đặt lịch trước
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="auth-form-section">
                    <div className="auth-card">
                        <div className="auth-header">
                            <h2 className="auth-header-title">
                                {mode === 'login' ? 'Chào mừng trở lại! 👋' : 'Gia nhập BudgetBites'}
                            </h2>
                            <p className="auth-header-subtitle">
                                {mode === 'login'
                                    ? 'Đăng nhập để tiếp tục quản lý bữa ăn của bạn.'
                                    : 'Chỉ mất chưa đến 1 phút để hoàn tất.'}
                            </p>

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
                                            placeholder="Nguyễn Văn A"
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
                                        placeholder="yourname@gmail.com"
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
                                        placeholder="••••••••"
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
                                                placeholder="••••••••"
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
                                                placeholder="0987xxxxxx"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </>
                                )}
                                <button className="auth-submit-btn" type="submit" disabled={loading}>
                                    {loading
                                        ? mode === 'login'
                                            ? 'Đang kết nối...'
                                            : 'Đang khởi tạo...'
                                        : mode === 'login'
                                          ? 'Bắt đầu ngay'
                                          : 'Hoàn tất đăng ký'}
                                </button>
                            </form>

                            {mode === 'login' && (
                                <>
                                    <div className="divider">
                                        <span>Hoặc sử dụng</span>
                                    </div>

                                    {GOOGLE_CLIENT_ID ? (
                                        <div className="google-btn-wrapper">
                                            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                                                <GoogleLogin
                                                    onSuccess={handleGoogleSuccess}
                                                    onError={handleGoogleError}
                                                    useOneTap={false}
                                                    width="100%"
                                                    text="signin_with"
                                                    shape="pill"
                                                    logo_alignment="left"
                                                />
                                            </GoogleOAuthProvider>
                                        </div>
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
