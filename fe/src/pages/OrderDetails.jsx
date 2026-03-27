import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Box, CalendarDays, Store, UtensilsCrossed } from 'lucide-react';
import { feedbackService, orderService } from '../services/api';
import './OrderDetails.css';

const OrderDetails = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackError, setFeedbackError] = useState('');

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

    const canRate = (order?.status || '').toUpperCase() === 'DELIVERED';

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!canRate || submitting) return;
        if (!comment.trim()) {
            setFeedbackError('Vui lòng nhập nhận xét trước khi gửi.');
            return;
        }
        try {
            setSubmitting(true);
            setFeedbackError('');
            setFeedbackMessage('');
            await feedbackService.createFeedback({
                partnerId: order.partnerId,
                rating,
                comment: comment.trim()
            });
            setFeedbackMessage('Đánh giá đã được gửi. Cảm ơn bạn!');
            setComment('');
            setRating(5);
        } catch (err) {
            setFeedbackError(
                err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.'
            );
        } finally {
            setSubmitting(false);
        }
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

                <div className="order-feedback-card">
                    <h2>Đánh giá bữa ăn</h2>
                    {!canRate ? (
                        <p className="order-feedback-note">
                            Bạn có thể đánh giá khi đơn ở trạng thái Hoàn thành.
                        </p>
                    ) : (
                        <form className="order-feedback-form" onSubmit={handleSubmitFeedback}>
                            <label htmlFor="order-rating">Số sao</label>
                            <select
                                id="order-rating"
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                disabled={submitting}
                            >
                                <option value={5}>5 sao - Rất hài lòng</option>
                                <option value={4}>4 sao - Hài lòng</option>
                                <option value={3}>3 sao - Bình thường</option>
                                <option value={2}>2 sao - Chưa hài lòng</option>
                                <option value={1}>1 sao - Không hài lòng</option>
                            </select>

                            <label htmlFor="order-comment">Nhận xét</label>
                            <textarea
                                id="order-comment"
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm món ăn, đóng gói, thời gian giao..."
                                disabled={submitting}
                            />

                            {feedbackError && (
                                <div className="order-feedback-msg order-feedback-msg-error">
                                    {feedbackError}
                                </div>
                            )}
                            {feedbackMessage && (
                                <div className="order-feedback-msg order-feedback-msg-ok">
                                    {feedbackMessage}
                                </div>
                            )}

                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
