import React, { useEffect, useState } from 'react';
import { adminSubscriptionService } from '../services/adminApi';
import { formatMoneyVnd } from '../utils/formatMoney';
import '../components/AdminLayout.css';

const STATUSES = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

const AdminSubscriptions = () => {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);

    const load = async () => {
        setError('');
        try {
            const res = await adminSubscriptionService.getAllSubscriptions();
            setRows(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Không tải được danh sách đăng ký.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const changeStatus = async (id, status) => {
        setBusyId(id);
        setError('');
        try {
            const res = await adminSubscriptionService.updateSubscriptionStatus(id, status);
            const updated = res.data;
            setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
        } catch (err) {
            setError(err.response?.data?.message || 'Không cập nhật được trạng thái.');
        } finally {
            setBusyId(null);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-spinner" />
            </div>
        );
    }

    return (
        <>
            <h2 className="admin-page-title">Gói đăng ký</h2>
            <p className="admin-page-desc">
                Chỉ hiển thị đăng ký gói bữa ăn (partner). Không hiển thị thanh toán giỏ món lẻ (không chọn gói).
            </p>
            {error ? <div className="admin-error">{error}</div> : null}
            <div className="admin-panel">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Khách</th>
                                <th>Gói</th>
                                <th>Bắt đầu</th>
                                <th>Kết thúc</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--bb-muted)' }}>
                                        Chưa có đăng ký.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((s) => (
                                    <tr key={s.id}>
                                        <td>{s.id}</td>
                                        <td>{s.customerName || s.customerId}</td>
                                        <td>{s.packageName || s.packageId}</td>
                                        <td>{s.startDate || '—'}</td>
                                        <td>{s.endDate || '—'}</td>
                                        <td>{formatMoneyVnd(s.totalAmount)}</td>
                                        <td>
                                            <select
                                                className="admin-select-sm"
                                                value={s.status || 'PENDING'}
                                                disabled={busyId === s.id}
                                                onChange={(e) => changeStatus(s.id, e.target.value)}
                                            >
                                                {STATUSES.map((st) => (
                                                    <option key={st} value={st}>
                                                        {st}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminSubscriptions;
