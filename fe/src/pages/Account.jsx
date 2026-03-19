import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, subscriptionService } from '../services/api';
import './Profile.css';

const Account = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [subs, setSubs] = useState([]);
    const [subsError, setSubsError] = useState('');
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            try {
                const [profileRes, subsRes] = await Promise.all([
                    authService.getProfile(),
                    subscriptionService.getMySubscriptions().catch((err) => {
                        setSubsError(
                            err.response?.data?.message ||
                                'Không thể tải gói đăng ký. Bạn có thể thử lại sau.'
                        );
                        return { data: [] };
                    })
                ]);

                if (!isMounted) return;
                setProfile(profileRes.data);
                setSubs(subsRes.data || []);
            } catch (err) {
                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                            'Không thể tải thông tin tài khoản. Vui lòng thử lại.'
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, []);

    const latestSub = subs[0];

    const formatDate = (v) => {
        if (!v) return '-';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return v;
        return d.toLocaleDateString('vi-VN');
    };

    const formatMoney = (value) => {
        if (value == null) return '0₫';
        const n = Number(value);
        if (!Number.isFinite(n)) return `${value}₫`;
        return `${n.toLocaleString('vi-VN')}₫`;
    };

    if (loading) {
        return (
            <div className="profile-page bb-page-loading">
                <div className="bb-spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <div className="profile-card profile-card-error">{error}</div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profile.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h1 className="profile-name">{profile.fullName}</h1>
                        <p className="profile-role">
                            {profile.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="profile-logout-btn"
                        onClick={handleLogout}
                    >
                        Đăng xuất
                    </button>
                </div>

                <div className="profile-section">
                    <h2 className="profile-section-title">Thông tin cá nhân</h2>
                    <div className="profile-grid">
                        <div className="profile-field">
                            <span className="profile-label">Email</span>
                            <span className="profile-value">{profile.email}</span>
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">Số điện thoại</span>
                            <span className="profile-value">
                                {profile.phoneNumber || 'Chưa cập nhật'}
                            </span>
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">Mã sinh viên</span>
                            <span className="profile-value">
                                {profile.studentId || 'Chưa cập nhật'}
                            </span>
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">Trường</span>
                            <span className="profile-value">
                                {profile.university || 'Chưa cập nhật'}
                            </span>
                        </div>
                        <div className="profile-field profile-field-full">
                            <span className="profile-label">Địa chỉ</span>
                            <span className="profile-value">
                                {profile.address || 'Chưa cập nhật'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h2 className="profile-section-title">Gói đăng ký hiện tại</h2>
                    {subsError && <div className="profile-subs-error">{subsError}</div>}
                    {!subsError && !latestSub && (
                        <div className="profile-subs-empty">
                            <div>Hiện bạn chưa có gói BudgetBites nào.</div>
                            <button
                                type="button"
                                className="profile-subs-btn"
                                onClick={() => navigate('/packages')}
                            >
                                Chọn gói bữa ăn
                            </button>
                        </div>
                    )}
                    {!subsError && latestSub && (
                        <div className="profile-subs-card">
                            <div className="profile-subs-header">
                                <div>
                                    <div className="profile-subs-name">
                                        {latestSub.packageName || 'Gói BudgetBites'}
                                    </div>
                                    <div className="profile-subs-dates">
                                        {formatDate(latestSub.startDate)} →{' '}
                                        {formatDate(latestSub.endDate)}
                                    </div>
                                </div>
                                <span
                                    className={
                                        'profile-subs-status status-badge status-' +
                                        (latestSub.status || '').toLowerCase()
                                    }
                                >
                                    {latestSub.status}
                                </span>
                            </div>
                            <div className="profile-subs-body">
                                <div className="profile-subs-row">
                                    <span className="label">Tổng chi phí</span>
                                    <span className="value">
                                        {formatMoney(latestSub.totalAmount)}
                                    </span>
                                </div>
                                <div className="profile-subs-row">
                                    <span className="label">Tạo lúc</span>
                                    <span className="value">{formatDate(latestSub.createdAt)}</span>
                                </div>
                            </div>
                            <div className="profile-subs-footer">
                                <button
                                    type="button"
                                    className="profile-subs-link"
                                    onClick={() => navigate('/subscriptions')}
                                >
                                    Xem tất cả gói đăng ký →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Account;

