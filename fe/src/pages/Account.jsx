import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import {
    User,
    Package,
    Gift,
    Star,
    Crown,
    CreditCard,
    Bell,
    Settings,
    StarIcon,
    LogOut,
    Box,
    ChevronRight,
    X
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

    return (
        <div className="account-page">
            <header className="account-hero" aria-labelledby="account-hero-title">
                <div className="account-hero-inner">
                    <span className="account-hero-badge" aria-hidden>
                        <User size={18} strokeWidth={2} />
                        Tài khoản
                    </span>
                    <h1 id="account-hero-title">Xin chào, {profile.fullName}!</h1>
                    <p className="account-hero-lead">
                        Theo dõi đơn hàng, điểm thưởng và gói đăng ký tại một nơi.
                    </p>
                </div>
            </header>

            <div className="account-body">
                <div className="account-layout">
                    <aside className="account-sidebar">
                        <div className="account-profile-card">
                            <div className="account-avatar">
                                {profile.fullName?.charAt(0)?.toUpperCase() || '?'}
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
                            <NavLink to="/account" end className={navLinkClass}>
                                <User size={18} />
                                <span>Tổng quan</span>
                            </NavLink>
                            <NavLink to="/orders" className={navLinkClass}>
                                <Package size={18} />
                                <span>Đơn hàng của bạn</span>
                            </NavLink>
                            <NavLink to="/packages" className={navLinkClass}>
                                <Gift size={18} />
                                <span>Khuyến mãi của tôi</span>
                            </NavLink>
                            <Link to="/account" className="account-nav-item">
                                <Star size={18} />
                                <span>Điểm tích lũy</span>
                            </Link>
                            <Link to="/account" className="account-nav-item">
                                <Crown size={18} />
                                <span>BudgetBites VIP</span>
                            </Link>
                            <NavLink to="/subscriptions" className={navLinkClass}>
                                <CreditCard size={18} />
                                <span>Liên kết thanh toán</span>
                            </NavLink>
                            <NavLink to="/support" className={navLinkClass}>
                                <Bell size={18} />
                                <span>Thông báo</span>
                            </NavLink>
                            <Link to="/account" className="account-nav-item">
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
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Account;
