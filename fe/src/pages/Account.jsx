import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink, Link, useLocation, useSearchParams } from 'react-router-dom';
import {
    User,
    Package,
    Gift,
    Star,
    Settings,
    StarIcon,
    LogOut,
    Box,
    ChevronRight,
    X,
    Camera
} from 'lucide-react';
import { authService, subscriptionService } from '../services/api';
import { fetchAllMyOrdersFromSubscriptions } from '../utils/orderUtils';
import { isCartCheckoutNoPackageSubscription } from '../utils/subscriptionUtils';
import './Profile.css';

const Account = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [subs, setSubs] = useState([]);
    const [subsError, setSubsError] = useState('');
    const [orders, setOrders] = useState([]);
    const [cancellingSubId, setCancellingSubId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const isProfileSection =
        location.pathname === '/account' && searchParams.get('section') === 'profile';

    const [profileForm, setProfileForm] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
        university: '',
        studentId: '',
        avatarUrl: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');
    const [profileErr, setProfileErr] = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false);

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
                const list = Array.isArray(subsRes.data) ? subsRes.data : [];
                list.sort((a, b) => {
                    const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return db - da; // latest first
                });
                setSubs(list);

                const allOrders = await fetchAllMyOrdersFromSubscriptions(list);
                setOrders(allOrders);
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

    useEffect(() => {
        if (!profile) return;
        setProfileForm({
            fullName: profile.fullName || '',
            phoneNumber: profile.phoneNumber || '',
            address: profile.address || '',
            university: profile.university || '',
            studentId: profile.studentId || '',
            avatarUrl: profile.avatarUrl || '',
            newPassword: '',
            confirmPassword: ''
        });
    }, [profile]);

    useEffect(() => {
        setProfileMsg('');
        setProfileErr('');
    }, [isProfileSection]);

    const mergeStoredUser = (p) => {
        try {
            const raw = localStorage.getItem('user');
            if (!raw) return;
            const u = JSON.parse(raw);
            if (u && typeof u === 'object') {
                u.fullName = p.fullName;
                u.avatarUrl = p.avatarUrl;
                localStorage.setItem('user', JSON.stringify(u));
            }
        } catch {
            /* ignore */
        }
    };

    const handleAvatarFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setProfileErr('Vui lòng chọn file ảnh.');
            return;
        }
        setProfileErr('');
        setProfileMsg('');
        setAvatarUploading(true);
        try {
            const res = await authService.uploadAvatar(file);
            const url = res.data?.imageUrl;
            if (url) {
                setProfileForm((f) => ({ ...f, avatarUrl: url }));
                setProfileMsg('Đã tải ảnh lên. Nhấn “Lưu hồ sơ” để lưu vào tài khoản.');
            }
        } catch (err) {
            if (err.message === 'FILE_TOO_LARGE') {
                setProfileErr('Ảnh tối đa 10MB.');
            } else {
                setProfileErr(
                    err.response?.data?.message ||
                        'Upload ảnh thất bại. Kiểm tra Cloudinary trên server hoặc dán URL ảnh.'
                );
            }
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileMsg('');
        setProfileErr('');
        if (!profileForm.fullName.trim()) {
            setProfileErr('Nhập họ tên.');
            return;
        }
        if (!profileForm.studentId.trim()) {
            setProfileErr('Nhập mã sinh viên.');
            return;
        }
        if (profileForm.newPassword && profileForm.newPassword.length < 6) {
            setProfileErr('Mật khẩu mới cần ít nhất 6 ký tự.');
            return;
        }
        if (profileForm.newPassword !== profileForm.confirmPassword) {
            setProfileErr('Mật khẩu xác nhận không khớp.');
            return;
        }
        const body = {
            fullName: profileForm.fullName.trim(),
            phoneNumber: profileForm.phoneNumber.trim() || null,
            address: profileForm.address.trim() || null,
            university: profileForm.university.trim() || null,
            studentId: profileForm.studentId.trim(),
            avatarUrl: profileForm.avatarUrl.trim() || null
        };
        if (profileForm.newPassword) {
            body.password = profileForm.newPassword;
        }
        setProfileSaving(true);
        try {
            const res = await authService.updateProfile(body);
            setProfile(res.data);
            setProfileForm((f) => ({ ...f, newPassword: '', confirmPassword: '' }));
            mergeStoredUser(res.data);
            setProfileMsg('Đã lưu hồ sơ.');
        } catch (err) {
            setProfileErr(
                err.response?.data?.message ||
                    (typeof err.response?.data === 'string' ? err.response.data : null) ||
                    'Không lưu được. Thử lại sau.'
            );
        } finally {
            setProfileSaving(false);
        }
    };

    const refetchSubsAndOrders = async () => {
        try {
            const subsRes = await subscriptionService.getMySubscriptions();
            const list = Array.isArray(subsRes.data) ? subsRes.data : [];
            list.sort((a, b) => {
                const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return db - da; // latest first
            });
            setSubs(list);
            setSubsError('');
            const allOrders = await fetchAllMyOrdersFromSubscriptions(list);
            setOrders(allOrders);
        } catch {
            // ignore
        }
    };

    const canCancelSub = (status) => {
        const s = (status || '').toUpperCase();
        return s === 'PENDING' || s === 'ACTIVE';
    };

    const handleCancelSubscription = async () => {
        const sub = subs.filter((s) => !isCartCheckoutNoPackageSubscription(s))[0];
        if (!sub || !canCancelSub(sub.status)) return;
        if (
            !window.confirm(
                `Bạn có chắc muốn hủy gói "${sub.packageName || 'BudgetBites'}"?`
            )
        )
            return;
        setCancellingSubId(sub.id);
        setSubsError('');
        try {
            await subscriptionService.cancelSubscription(sub.id);
            await refetchSubsAndOrders();
        } catch (err) {
            setSubsError(
                err.response?.data?.message || 'Không thể hủy gói đăng ký. Vui lòng thử lại.'
            );
        } finally {
            setCancellingSubId(null);
        }
    };

    const subsForPackages = subs.filter((s) => !isCartCheckoutNoPackageSubscription(s));
    const latestSub = subsForPackages[0];
    const recentOrders = orders.slice(0, 5);
    const totalOrders = orders.length;

    const formatDate = (v) => {
        if (!v) return '-';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return v;
        return d.toLocaleDateString('vi-VN');
    };

    const formatTimeLabel = (v) => {
        if (!v) return '';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return '';
        const today = new Date();
        const isToday =
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
        return isToday ? 'Hôm nay' : formatDate(v);
    };

    const formatMoney = (value) => {
        if (value == null) return '—';
        const n = Number(value);
        if (!Number.isFinite(n)) return '—';
        return `${n.toLocaleString('vi-VN')}₫`;
    };

    const getStatusLabel = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'DELIVERED') return 'Hoàn thành';
        if (s === 'PREPARING') return 'Đang chuẩn bị';
        if (s === 'PENDING') return 'Chờ xử lý';
        if (s === 'CANCELLED') return 'Đã hủy';
        return status || '—';
    };

    const getStatusClass = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'DELIVERED') return 'account-status-completed';
        if (s === 'PREPARING' || s === 'PENDING') return 'account-status-delivering';
        if (s === 'CANCELLED') return 'account-status-cancelled';
        return '';
    };

    // Placeholder for points (no backend yet)
    const points = totalOrders * 100;

    if (loading) {
        return (
            <div className="account-page account-loading">
                <div className="bb-spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="account-page">
                <div className="account-error-card">{error}</div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    const navLinkClass = ({ isActive }) =>
        'account-nav-item' + (isActive ? ' account-nav-active' : '');

    const overviewNavClass =
        'account-nav-item' +
        (location.pathname === '/account' && !isProfileSection ? ' account-nav-active' : '');
    const profileNavClass =
        'account-nav-item' + (isProfileSection ? ' account-nav-active' : '');

    return (
        <div className="account-page">
            <header className="account-hero" aria-labelledby="account-hero-title">
                <div className="account-hero-inner">
                    <span className="account-hero-badge" aria-hidden>
                        <User size={18} strokeWidth={2} />
                        Tài khoản
                    </span>
                    <h1 id="account-hero-title">
                        {isProfileSection ? 'Quản lý hồ sơ' : `Xin chào, ${profile.fullName}!`}
                    </h1>
                    <p className="account-hero-lead">
                        {isProfileSection
                            ? 'Cập nhật thông tin cá nhân và ảnh đại diện.'
                            : 'Theo dõi đơn hàng, điểm thưởng và gói đăng ký tại một nơi.'}
                    </p>
                </div>
            </header>

            <div className="account-body">
                <div className="account-layout">
                    <aside className="account-sidebar">
                        <div className="account-profile-card">
                            <div className="account-avatar">
                                {profile.avatarUrl ? (
                                    <img
                                        src={profile.avatarUrl}
                                        alt=""
                                        className="account-avatar-img"
                                    />
                                ) : (
                                    profile.fullName?.charAt(0)?.toUpperCase() || '?'
                                )}
                            </div>
                            <div className="account-profile-info">
                                <span className="account-user-name">{profile.fullName}</span>
                                {profile.email && (
                                    <span className="account-user-email">{profile.email}</span>
                                )}
                                <span className="account-vip-badge">
                                    <Star size={12} />
                                    Thành viên VIP
                                </span>
                            </div>
                        </div>

                        <nav className="account-nav" aria-label="Menu tài khoản">
                            <Link to="/account" className={overviewNavClass}>
                                <User size={18} />
                                <span>Tổng quan</span>
                            </Link>
                            <NavLink to="/orders" className={navLinkClass}>
                                <Package size={18} />
                                <span>Đơn hàng của bạn</span>
                            </NavLink>
                            <NavLink to="/subscriptions" className={navLinkClass}>
                                <Gift size={18} />
                                <span>Gói đăng ký của tôi</span>
                            </NavLink>
                            <Link to="/account?section=profile" className={profileNavClass}>
                                <Settings size={18} />
                                <span>Quản lý hồ sơ</span>
                            </Link>
                            <NavLink to="/about" className={navLinkClass}>
                                <StarIcon size={18} />
                                <span>Đánh giá chúng tôi</span>
                            </NavLink>
                        </nav>

                        <button
                            type="button"
                            className="account-logout-btn"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} />
                            <span>Đăng xuất</span>
                        </button>
                    </aside>

                    <main className="account-main">
                        {isProfileSection ? (
                            <section className="account-section account-profile-section" id="account-profile">
                                <h2 className="account-section-title">Thông tin của bạn</h2>
                                {profileMsg ? (
                                    <div className="account-profile-banner account-profile-banner--ok" role="status">
                                        {profileMsg}
                                    </div>
                                ) : null}
                                {profileErr ? (
                                    <div className="account-profile-banner account-profile-banner--err" role="alert">
                                        {profileErr}
                                    </div>
                                ) : null}

                                <form className="account-profile-form" onSubmit={handleProfileSave}>
                                    <div className="account-profile-avatar-block">
                                        <div className="account-profile-avatar-preview">
                                            {profileForm.avatarUrl ? (
                                                <img src={profileForm.avatarUrl} alt="" />
                                            ) : (
                                                <span>
                                                    {profileForm.fullName?.charAt(0)?.toUpperCase() ||
                                                        '?'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="account-profile-avatar-side">
                                            <input
                                                id="account-avatar-file"
                                                type="file"
                                                accept="image/*"
                                                className="account-file-input-hidden"
                                                onChange={handleAvatarFile}
                                                disabled={avatarUploading || profileSaving}
                                            />
                                            <label
                                                htmlFor="account-avatar-file"
                                                className={
                                                    'account-profile-upload-btn' +
                                                    (avatarUploading || profileSaving
                                                        ? ' account-profile-upload-btn--disabled'
                                                        : '')
                                                }
                                            >
                                                <Camera size={16} />
                                                {avatarUploading ? 'Đang tải…' : 'Chọn ảnh đại diện'}
                                            </label>
                                            <p className="account-profile-upload-hint">
                                                JPG, PNG, WebP… · tối đa 10MB. Sau khi chọn, bấm{' '}
                                                <strong>Lưu hồ sơ</strong> bên dưới.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="account-profile-fields">
                                        <div className="account-profile-field">
                                            <label htmlFor="pf-email">Email</label>
                                            <input
                                                id="pf-email"
                                                type="email"
                                                value={profile.email || ''}
                                                readOnly
                                                className="account-profile-input account-profile-input--readonly"
                                            />
                                        </div>
                                        <div className="account-profile-field">
                                            <label htmlFor="pf-name">Họ và tên *</label>
                                            <input
                                                id="pf-name"
                                                value={profileForm.fullName}
                                                onChange={(e) =>
                                                    setProfileForm((f) => ({
                                                        ...f,
                                                        fullName: e.target.value
                                                    }))
                                                }
                                                required
                                                className="account-profile-input"
                                            />
                                        </div>
                                        <div className="account-profile-field">
                                            <label htmlFor="pf-phone">Số điện thoại</label>
                                            <input
                                                id="pf-phone"
                                                value={profileForm.phoneNumber}
                                                onChange={(e) =>
                                                    setProfileForm((f) => ({
                                                        ...f,
                                                        phoneNumber: e.target.value
                                                    }))
                                                }
                                                className="account-profile-input"
                                            />
                                        </div>
                                        <div className="account-profile-field">
                                            <label htmlFor="pf-student">Mã sinh viên *</label>
                                            <input
                                                id="pf-student"
                                                value={profileForm.studentId}
                                                onChange={(e) =>
                                                    setProfileForm((f) => ({
                                                        ...f,
                                                        studentId: e.target.value
                                                    }))
                                                }
                                                required
                                                className="account-profile-input"
                                            />
                                        </div>
                                        <div className="account-profile-field account-profile-field--full">
                                            <label htmlFor="pf-uni">Trường / Đại học</label>
                                            <input
                                                id="pf-uni"
                                                value={profileForm.university}
                                                onChange={(e) =>
                                                    setProfileForm((f) => ({
                                                        ...f,
                                                        university: e.target.value
                                                    }))
                                                }
                                                className="account-profile-input"
                                            />
                                        </div>
                                        <div className="account-profile-field account-profile-field--full">
                                            <label htmlFor="pf-address">Địa chỉ</label>
                                            <textarea
                                                id="pf-address"
                                                rows={3}
                                                value={profileForm.address}
                                                onChange={(e) =>
                                                    setProfileForm((f) => ({
                                                        ...f,
                                                        address: e.target.value
                                                    }))
                                                }
                                                className="account-profile-textarea"
                                            />
                                        </div>
                                        <div className="account-profile-field account-profile-field--full">
                                            <label htmlFor="pf-avatar-url">Hoặc dán URL ảnh đại diện</label>
                                            <input
                                                id="pf-avatar-url"
                                                type="url"
                                                value={profileForm.avatarUrl}
                                                onChange={(e) =>
                                                    setProfileForm((f) => ({
                                                        ...f,
                                                        avatarUrl: e.target.value
                                                    }))
                                                }
                                                placeholder="https://…"
                                                className="account-profile-input"
                                            />
                                        </div>
                                        <div className="account-profile-field">
                                            <label htmlFor="pf-pass">Mật khẩu mới (tuỳ chọn)</label>
                                            <input
                                                id="pf-pass"
                                                type="password"
                                                autoComplete="new-password"
                                                value={profileForm.newPassword}
                                                onChange={(e) =>
                                                    setProfileForm((f) => ({
                                                        ...f,
                                                        newPassword: e.target.value
                                                    }))
                                                }
                                                className="account-profile-input"
                                                placeholder="Để trống nếu giữ mật khẩu cũ"
                                            />
                                        </div>
                                        <div className="account-profile-field">
                                            <label htmlFor="pf-pass2">Xác nhận mật khẩu</label>
                                            <input
                                                id="pf-pass2"
                                                type="password"
                                                autoComplete="new-password"
                                                value={profileForm.confirmPassword}
                                                onChange={(e) =>
                                                    setProfileForm((f) => ({
                                                        ...f,
                                                        confirmPassword: e.target.value
                                                    }))
                                                }
                                                className="account-profile-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="account-profile-actions">
                                        <button
                                            type="submit"
                                            className="account-profile-save"
                                            disabled={profileSaving || avatarUploading}
                                        >
                                            {profileSaving ? 'Đang lưu…' : 'Lưu hồ sơ'}
                                        </button>
                                        <button
                                            type="button"
                                            className="account-profile-logout"
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={16} />
                                            Đăng xuất
                                        </button>
                                        <Link to="/account" className="account-profile-cancel">
                                            Quay lại tổng quan
                                        </Link>
                                    </div>
                                </form>
                            </section>
                        ) : (
                            <>
                        <div className="account-stats">
                            <div className="account-stat-card">
                                <div className="account-stat-icon account-stat-orders">
                                    <Box size={24} />
                                </div>
                                <div className="account-stat-content">
                                    <span className="account-stat-value">{totalOrders}</span>
                                    <span className="account-stat-label">Đơn hàng</span>
                                </div>
                            </div>
                            <div className="account-stat-card">
                                <div className="account-stat-icon account-stat-points">
                                    <Star size={24} />
                                </div>
                                <div className="account-stat-content">
                                    <span className="account-stat-value">
                                        {points.toLocaleString('vi-VN')}
                                    </span>
                                    <span className="account-stat-label">Điểm tích lũy</span>
                                </div>
                            </div>
                        </div>

                        <section className="account-section">
                            <div className="account-section-header">
                                <h2>Đơn hàng gần đây</h2>
                                <button
                                    type="button"
                                    className="account-view-all"
                                    onClick={() => navigate('/orders')}
                                >
                                    Xem tất cả <ChevronRight size={16} />
                                </button>
                            </div>

                            {recentOrders.length === 0 ? (
                                <div className="account-empty-orders">
                                    <Box size={40} strokeWidth={1.5} />
                                    <p>Bạn chưa có đơn hàng nào</p>
                                    <button
                                        type="button"
                                        className="account-order-cta"
                                        onClick={() => navigate('/partners')}
                                    >
                                        Đặt bữa ăn ngay
                                    </button>
                                </div>
                            ) : (
                                <div className="account-order-list">
                                    {recentOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="account-order-card"
                                            onClick={() =>
                                                navigate(`/orders/${order.id}`, { state: { order } })
                                            }
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' &&
                                                navigate(`/orders/${order.id}`, { state: { order } })
                                            }
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="account-order-icon">
                                                <Box size={20} />
                                            </div>
                                            <div className="account-order-body">
                                                <span className="account-order-name">
                                                    {order.menuItemName || 'Bữa ăn'}
                                                </span>
                                                <span className="account-order-meta">
                                                    {`#BB${String(order.id || 0).padStart(6, '0')}`} ·{' '}
                                                    {formatTimeLabel(order.orderDate)}
                                                </span>
                                            </div>
                                            <span
                                                className={
                                                    'account-order-status ' +
                                                    getStatusClass(order.status)
                                                }
                                            >
                                                {getStatusLabel(order.status)}
                                            </span>
                                            <span className="account-order-price">
                                                {formatMoney(order.price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {latestSub && (
                            <section className="account-section account-subscription-section">
                                <h2 className="account-section-title">Gói đăng ký hiện tại</h2>
                                {subsError && (
                                    <div className="account-subs-error">{subsError}</div>
                                )}
                                {!subsError && (
                                    <div className="account-subs-card">
                                        <div className="account-subs-header">
                                            <div>
                                                <div className="account-subs-name">
                                                    {latestSub.packageName || 'Gói BudgetBites'}
                                                </div>
                                                <div className="account-subs-dates">
                                                    {formatDate(latestSub.startDate)} →{' '}
                                                    {formatDate(latestSub.endDate)}
                                                </div>
                                            </div>
                                            <span
                                                className={
                                                    'account-subs-status status-' +
                                                    (latestSub.status || '').toLowerCase()
                                                }
                                            >
                                                {latestSub.status}
                                            </span>
                                        </div>
                                        <div className="account-subs-body">
                                            <div className="account-subs-row">
                                                <span className="label">Tổng chi phí</span>
                                                <span className="value">
                                                    {formatMoney(latestSub.totalAmount)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="account-subs-actions">
                                            {canCancelSub(latestSub.status) && (
                                                <button
                                                    type="button"
                                                    className="account-subs-cancel-btn"
                                                    onClick={handleCancelSubscription}
                                                    disabled={cancellingSubId === latestSub.id}
                                                >
                                                    <X size={16} />
                                                    {cancellingSubId === latestSub.id
                                                        ? 'Đang hủy...'
                                                        : 'Hủy gói'}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="account-subs-link"
                                                onClick={() => navigate('/subscriptions')}
                                            >
                                                Xem tất cả gói đăng ký <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Account;
