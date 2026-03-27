import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Box } from 'lucide-react';
import { subscriptionService } from '../services/api';
import { fetchAllMyOrdersFromSubscriptions } from '../utils/orderUtils';
import './OrderHistory.css';
import './Profile.css';

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const subsRes = await subscriptionService.getMySubscriptions();
                const list = Array.isArray(subsRes.data) ? subsRes.data : [];
                list.sort((a, b) => {
                    const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return db - da;
                });
                const all = await fetchAllMyOrdersFromSubscriptions(list);
                if (mounted) setOrders(all);
            } catch (err) {
                if (mounted) {
                    setError(
                        err.response?.data?.message ||
                            'Không thể tải lịch sử đơn hàng. Vui lòng thử lại.'
                    );
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

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

    if (loading) {
        return (
            <div className="order-history-page order-history-loading bb-page-loading">
                <div className="bb-spinner" />
            </div>
        );
    }

    return (
        <div className="order-history-page">
            <div className="order-history-inner">
                <Link to="/account" className="order-history-back">
                    <ArrowLeft size={18} />
                    Tài khoản
                </Link>
                <header className="order-history-header">
                    <h1>Lịch sử đơn hàng</h1>
                    <p>Tất cả bữa ăn bạn đã đặt qua BudgetBites.</p>
                </header>

                {error && <div className="order-history-error">{error}</div>}

                {!error && orders.length === 0 ? (
                    <div className="account-empty-orders order-history-empty">
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
                    !error && (
                        <div className="account-order-list order-history-list">
                            {orders.map((order) => (
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
                                            'account-order-status ' + getStatusClass(order.status)
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
                    )
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
