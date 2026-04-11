import React, { useEffect, useState } from 'react';
import { adminDashboardService } from '../services/adminApi';
import '../components/AdminLayout.css';

const AdminCustomers = () => {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);

    const load = async () => {
        setError('');
        try {
            const res = await adminDashboardService.getCustomers();
            const list = Array.isArray(res.data) ? res.data : [];
            setRows(list);
        } catch (err) {
            setError(err.response?.data?.message || 'Không tải được danh sách khách hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const toggle = async (id) => {
        setBusyId(id);
        setError('');
        try {
            const res = await adminDashboardService.toggleCustomerActive(id);
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
            <h2 className="admin-page-title">Khách hàng</h2>
            <p className="admin-page-desc">Bật/tắt tài khoản khách hàng trên hệ thống.</p>
            {error ? <div className="admin-error">{error}</div> : null}
            <div className="admin-panel">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Họ tên</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--bb-muted)' }}>
                                        Chưa có dữ liệu.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.id}</td>
                                        <td>{c.email}</td>
                                        <td>{c.fullName}</td>
                                        <td>{c.role}</td>
                                        <td>
                                            <span
                                                className={
                                                    'admin-badge ' +
                                                    (c.active ? 'admin-badge-on' : 'admin-badge-off')
                                                }
                                            >
                                                {c.active ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="admin-btn-sm"
                                                disabled={busyId === c.id}
                                                onClick={() => toggle(c.id)}
                                            >
                                                {busyId === c.id
                                                    ? '...'
                                                    : c.active
                                                      ? 'Khóa'
                                                      : 'Mở khóa'}
                                            </button>
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

export default AdminCustomers;
