import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminDashboardService, adminPartnerService } from '../services/adminApi';
import './AdminPartnerRatings.css';

function formatFeedbackDate(iso) {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return String(iso);
        return d.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return String(iso);
    }
}

function Stars({ value, size = 'md' }) {
    const n = Math.min(5, Math.max(0, Number(value) || 0));
    const className = size === 'sm' ? 'admin-partner-ratings-stars admin-partner-ratings-stars--sm' : 'admin-partner-ratings-stars';
    return (
        <span className={className} aria-label={`${n} trên 5 sao`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={'star' + (i <= n ? ' is-on' : '')}>
                    ★
                </span>
            ))}
        </span>
    );
}

const AdminPartnerRatings = () => {
    const { partnerId } = useParams();
    const id = Number(partnerId);

    const [partnerName, setPartnerName] = useState('');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        if (!Number.isFinite(id) || id <= 0) {
            setError('ID đối tác không hợp lệ.');
            setLoading(false);
            return;
        }
        setError('');
        setLoading(true);
        try {
            const [pRes, fRes] = await Promise.all([
                adminPartnerService.getPartnerById(id),
                adminDashboardService.getPartnerFeedbacks(id)
            ]);
            setPartnerName(pRes.data?.name || `Đối tác #${id}`);
            setRows(Array.isArray(fRes.data) ? fRes.data : []);
        } catch (err) {
            setPartnerName('');
            setRows([]);
            setError(
                err.response?.data?.message ||
                    (typeof err.response?.data === 'string' ? err.response.data : null) ||
                    'Không tải được đánh giá.'
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    const summary = useMemo(() => {
        const nums = rows.map((r) => Number(r.rating)).filter((x) => Number.isFinite(x) && x >= 1 && x <= 5);
        if (nums.length === 0) return { avg: null, count: 0 };
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        return { avg, count: nums.length };
    }, [rows]);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-spinner" />
            </div>
        );
    }

    return (
        <div className="admin-partner-ratings-page">
            <Link className="admin-partner-ratings-back" to="/partners">
                ← Quay lại đối tác
            </Link>

            <header className="admin-partner-ratings-hero">
                <p className="admin-partner-ratings-kicker">Đánh giá từ khách hàng</p>
                <h2 className="admin-partner-ratings-title">{partnerName || 'Đối tác'}</h2>
                <div className="admin-partner-ratings-summary">
                    {summary.avg != null ? (
                        <>
                            <div className="admin-partner-ratings-score">
                                {summary.avg.toFixed(1)} <span>/ 5</span>
                            </div>
                            <Stars value={Math.round(summary.avg)} />
                            <span className="admin-partner-ratings-count">
                                {summary.count} đánh giá (trung bình)
                            </span>
                        </>
                    ) : (
                        <span className="admin-partner-ratings-count">Chưa có đánh giá nào.</span>
                    )}
                </div>
            </header>

            {error ? <div className="admin-error">{error}</div> : null}

            <div className="admin-panel">
                <div className="admin-partner-ratings-table-wrap">
                    <table className="admin-partner-ratings-table">
                        <thead>
                            <tr>
                                <th>Khách</th>
                                <th>Số sao</th>
                                <th>Nhận xét</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="admin-partner-ratings-empty">
                                            Chưa có đánh giá cho đối tác này.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rows.map((f) => (
                                    <tr key={f.id}>
                                        <td>
                                            <strong>{f.customerName || f.customerId || '—'}</strong>
                                        </td>
                                        <td>
                                            <Stars value={f.rating} size="sm" />
                                            <span style={{ marginLeft: 8, color: 'var(--bb-muted)', fontSize: '0.85rem' }}>
                                                {f.rating ?? '—'}/5
                                            </span>
                                        </td>
                                        <td className="admin-partner-ratings-comment">{f.comment || '—'}</td>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--bb-muted)' }}>
                                            {formatFeedbackDate(f.createdAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPartnerRatings;
