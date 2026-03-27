import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Box, CalendarDays, Store, UtensilsCrossed } from 'lucide-react';
import { orderService } from '../services/api';
import './OrderDetails.css';

const OrderDetails = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        const id = Number(orderId);
        if (!Number.isFinite(id)) {
            setError('Mã đơn hàng không hợp lệ.');
            setLoading(false);
            return;
        }
        if (order && order.id === id) {
            setLoading(false);
            return;
        }
        const load = async () => {
            try {
                setLoading(true);
                const res = await orderService.getOrderById(id);
                if (!mounted) return;
                setOrder(res.data || null);
            } catch (err) {
                if (!mounted) return;
                setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng.');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [orderId, order]);

    const formatMoney = (value) => {
        if (value == null) return '—';
        const n = Number(value);
        if (!Number.isFinite(n)) return '—';
        return `${n.toLocaleString('vi-VN')}₫`;
    };

    const formatDate = (value) => {
        if (!value) return '—';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleDateString('vi-VN');
    };

    const getStatusLabel = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'DELIVERED') return 'Hoàn thành';
        if (s === 'PREPARING') return 'Đang chuẩn bị';
        if (s === 'PENDING') return 'Chờ xử lý';
        if (s === 'CANCELLED') return 'Đã hủy';
        return status || '—';
    };

    if (loading) {
        return (
            <div className="order-details-page order-details-loading bb-page-loading">
                <div className="bb-spinner" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="order-details-page">
                <div className="order-details-error">
                    <p>{error || 'Không tìm thấy đơn hàng.'}</p>
                    <Link to="/account" className="order-details-back">
                        <ArrowLeft size={16} />
                        Quay lại tài khoản
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="order-details-page">
            <div className="order-details-container">
                <Link to="/account" className="order-details-back-link">
                    <ArrowLeft size={16} />
                    Trở về Đơn hàng gần đây
                </Link>

                <div className="order-details-card">
                    <div className="order-details-head">
                        <h1>Chi tiết đơn #{`BB${String(order.id || 0).padStart(6, '0')}`}</h1>
                        <span className="order-details-status">{getStatusLabel(order.status)}</span>
                    </div>

                    <div className="order-details-grid">
                        <div className="order-details-row">
                            <span className="label">
                                <UtensilsCrossed size={16} />
                                Món ăn
                            </span>
                            <span className="value">{order.menuItemName || 'Bữa ăn'}</span>
                        </div>
                        <div className="order-details-row">
                            <span className="label">
                                <Store size={16} />
                                Quán
                            </span>
                            <span className="value">{order.partnerName || '—'}</span>
                        </div>
                        <div className="order-details-row">
                            <span className="label">
                                <CalendarDays size={16} />
                                Ngày ăn
                            </span>
                            <span className="value">{formatDate(order.orderDate)}</span>
                        </div>
                        <div className="order-details-row">
                            <span className="label">
                                <Box size={16} />
                                Loại bữa
                            </span>
                            <span className="value">{order.mealType || '—'}</span>
                        </div>
                        <div className="order-details-row">
                            <span className="label">Khay ăn</span>
                            <span className="value">{order.withTray ? 'Có' : 'Không'}</span>
                        </div>
                        <div className="order-details-row">
                            <span className="label">Giá</span>
                            <span className="value order-details-price">{formatMoney(order.price)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
