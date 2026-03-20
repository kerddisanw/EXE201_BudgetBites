import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { subscriptionService } from '../services/api';
import './Subscriptions.css';

function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await subscriptionService.getMySubscriptions();
            const list = Array.isArray(response.data) ? response.data : [];
            list.sort((a, b) => {
                const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return db - da; // latest first
            });
            setSubscriptions(list);
            if (!Array.isArray(response.data)) {
                setError('Dữ liệu gói đăng ký không hợp lệ. Vui lòng thử lại.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách gói đăng ký.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        return `status-badge status-${status.toLowerCase()}`;
    };

    const formatDate = (value) => {
        if (!value) return '-';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleDateString('vi-VN');
    };

    const formatMoney = (value) => {
        if (value == null) return '0₫';
        const n = Number(value);
        if (!Number.isFinite(n)) return `${value}₫`;
        return `${n.toLocaleString('vi-VN')}₫`;
    };

    const canCancel = (status) => {
        const s = (status || '').toUpperCase();
        return s === 'PENDING' || s === 'ACTIVE';
    };

    const handleCancel = async (sub) => {
        if (!canCancel(sub.status)) return;
        if (!window.confirm(`Bạn có chắc muốn hủy gói "${sub.packageName}"?`)) return;

        setCancellingId(sub.id);
        setError('');
        try {
            await subscriptionService.cancelSubscription(sub.id);
            await fetchSubscriptions();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể hủy gói đăng ký.');
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) {
        return (
            <div className="subscriptions-page subscriptions-page-loading bb-page-loading">
                <div className="bb-spinner" />
            </div>
        );
    }

    return (
        <div className="subscriptions-page">
            <section className="subscriptions-header">
                <div>
                    <h1>Gói đăng ký của bạn</h1>
                    <p>
                        Xem nhanh các gói BudgetBites hiện tại, trạng thái và thời gian hiệu lực. Bạn
                        có thể đăng ký thêm gói mới bất kỳ lúc nào.
                    </p>
                </div>
                <button
                    type="button"
                    className="subscriptions-new-btn"
                    onClick={() => navigate('/packages')}
                >
                    + Đăng ký gói mới
                </button>
            </section>

            {error && <div className="subscriptions-error">{error}</div>}

            {subscriptions.length === 0 ? (
                <div className="no-subscriptions">
                    <div className="no-subscriptions-card">
                        <div className="no-subscriptions-title">Bạn chưa có gói đăng ký nào</div>
                        <div className="no-subscriptions-sub">
                            Hãy bắt đầu bằng cách chọn một gói phù hợp với lịch học và ngân sách.
                        </div>
                        <Link to="/packages" className="browse-btn">
                            Chọn gói bữa ăn
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="subscriptions-list">
                    {subscriptions.map((sub) => (
                        <article key={sub.id} className="subscription-card">
                            <header className="subscription-header">
                                <div>
                                    <h2 className="subscription-name">{sub.packageName}</h2>
                                    <div className="subscription-dates">
                                        <span>
                                            {formatDate(sub.startDate)} → {formatDate(sub.endDate)}
                                        </span>
                                    </div>
                                </div>
                                <span className={getStatusClass(sub.status || '')}>
                                    {sub.status}
                                </span>
                            </header>

                            <div className="subscription-body">
                                <div className="subscription-row">
                                    <span className="label">Tổng chi phí</span>
                                    <span className="value">{formatMoney(sub.totalAmount)}</span>
                                </div>
                                {sub.notes ? (
                                    <div className="subscription-notes">
                                        <span className="label">Ghi chú</span>
                                        <span className="value">{sub.notes}</span>
                                    </div>
                                ) : null}
                                <div className="subscription-footer">
                                    <span className="created-at">
                                        Tạo lúc: {formatDate(sub.createdAt)}
                                    </span>
                                    {canCancel(sub.status) && (
                                        <button
                                            type="button"
                                            className="subscription-cancel-btn"
                                            onClick={() => handleCancel(sub)}
                                            disabled={cancellingId === sub.id}
                                        >
                                            <X size={16} />
                                            {cancellingId === sub.id ? 'Đang hủy...' : 'Hủy gói'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Subscriptions;
