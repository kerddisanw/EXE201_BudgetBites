import React, { useCallback, useEffect, useState } from 'react';
import { adminDiscountService } from '../services/adminApi';
import '../components/AdminLayout.css';
import './AdminFormShared.css';

const emptyForm = () => ({
    code: '',
    discountPercent: '',
    validFrom: '',
    validTo: '',
    maxUsage: '100',
    status: 'ACTIVE'
});

const toInputDate = (value) => {
    if (value == null || value === '') return '';
    if (typeof value === 'string') return value.length >= 10 ? value.slice(0, 10) : value;
    if (Array.isArray(value) && value.length >= 3) {
        const [y, m, d] = value;
        return `${String(y)}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return '';
};

const statusLabel = (s) => {
    const u = String(s || '').toUpperCase();
    if (u === 'ACTIVE') return 'Đang dùng';
    if (u === 'INACTIVE') return 'Tắt';
    if (u === 'EXPIRED') return 'Hết hạn';
    return s || '—';
};

const AdminDiscountCodes = () => {
    const [rows, setRows] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        setError('');
        try {
            const res = await adminDiscountService.getAllDiscounts();
            const list = Array.isArray(res.data) ? res.data : [];
            list.sort((a, b) => Number(b.id) - Number(a.id));
            setRows(list);
        } catch (err) {
            setError(err.response?.data?.message || 'Không tải được mã giảm giá (cần quyền quản trị).');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const startEdit = (row) => {
        setEditingId(row.id);
        setSuccess('');
        setError('');
        setForm({
            code: row.code || '',
            discountPercent: row.discountPercent != null ? String(row.discountPercent) : '',
            validFrom: toInputDate(row.validFrom),
            validTo: toInputDate(row.validTo),
            maxUsage: row.maxUsage != null ? String(row.maxUsage) : '0',
            status: String(row.status || 'ACTIVE').toUpperCase()
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(emptyForm());
        setError('');
    };

    const parseBody = () => {
        const code = String(form.code || '').trim();
        const pct = Number(String(form.discountPercent).replace(',', '.'));
        const maxUsage = parseInt(String(form.maxUsage).trim(), 10);
        if (!code) {
            return { error: 'Nhập mã giảm giá.' };
        }
        if (!Number.isFinite(pct) || pct <= 0) {
            return { error: 'Phần trăm giảm phải là số dương.' };
        }
        if (!form.validFrom || !form.validTo) {
            return { error: 'Chọn đủ ngày bắt đầu và kết thúc.' };
        }
        if (!Number.isFinite(maxUsage) || maxUsage < 0) {
            return { error: 'Số lần dùng tối đa phải ≥ 0.' };
        }
        return {
            body: {
                code,
                discountPercent: pct,
                validFrom: form.validFrom,
                validTo: form.validTo,
                maxUsage
            }
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const parsed = parseBody();
        if (parsed.error) {
            setError(parsed.error);
            return;
        }
        setSubmitting(true);
        try {
            if (editingId != null) {
                await adminDiscountService.updateDiscount(editingId, {
                    ...parsed.body,
                    status: form.status
                });
                setSuccess('Đã cập nhật mã giảm giá.');
                cancelEdit();
            } else {
                await adminDiscountService.createDiscount(parsed.body);
                setSuccess('Đã tạo mã giảm giá mới.');
                setForm(emptyForm());
            }
            await load();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    (typeof err.response?.data === 'string' ? err.response.data : null) ||
                    'Thao tác thất bại. Kiểm tra dữ liệu và thử lại.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (row, next) => {
        setError('');
        setBusyId(row.id);
        try {
            await adminDiscountService.setDiscountStatus(row.id, next);
            setSuccess(next === 'ACTIVE' ? 'Đã kích hoạt mã.' : 'Đã vô hiệu hóa mã.');
            await load();
        } catch (err) {
            setError(err.response?.data?.message || 'Không đổi được trạng thái.');
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
            <h2 className="admin-page-title">Mã giảm giá</h2>
            <p className="admin-page-desc">
                Tạo và chỉnh sửa mã áp dụng ở trang thanh toán giỏ hàng khách. Mã phải còn lượt dùng, trong
                khoảng ngày hiệu lực và trạng thái Đang dùng thì khách mới áp dụng được.
            </p>
            {error ? <div className="admin-error">{error}</div> : null}

            <div className="admin-panel admin-form-block" style={{ padding: '22px' }}>
                <h3>{editingId != null ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá mới'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="admin-form-grid">
                        <div className="admin-form-field">
                            <label htmlFor="dc-code">Mã *</label>
                            <input
                                id="dc-code"
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                required
                                placeholder="VD: HSSV2026"
                                autoComplete="off"
                            />
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="dc-pct">Giảm % *</label>
                            <input
                                id="dc-pct"
                                name="discountPercent"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.discountPercent}
                                onChange={handleChange}
                                required
                                placeholder="10"
                            />
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="dc-from">Hiệu lực từ *</label>
                            <input
                                id="dc-from"
                                name="validFrom"
                                type="date"
                                value={form.validFrom}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="dc-to">Hiệu lực đến *</label>
                            <input
                                id="dc-to"
                                name="validTo"
                                type="date"
                                value={form.validTo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="dc-max">Lượt dùng tối đa *</label>
                            <input
                                id="dc-max"
                                name="maxUsage"
                                type="number"
                                min="0"
                                step="1"
                                value={form.maxUsage}
                                onChange={handleChange}
                                required
                                placeholder="100"
                            />
                        </div>
                        {editingId != null ? (
                            <div className="admin-form-field">
                                <label htmlFor="dc-status">Trạng thái *</label>
                                <select
                                    id="dc-status"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="ACTIVE">Đang dùng</option>
                                    <option value="INACTIVE">Tắt</option>
                                    <option value="EXPIRED">Hết hạn</option>
                                </select>
                            </div>
                        ) : null}
                    </div>
                    <div className="admin-form-actions">
                        <button type="submit" className="admin-btn-primary" disabled={submitting}>
                            {submitting ? 'Đang lưu…' : editingId != null ? 'Cập nhật' : 'Tạo mã'}
                        </button>
                        {editingId != null ? (
                            <button
                                type="button"
                                className="admin-btn-secondary"
                                onClick={cancelEdit}
                                disabled={submitting}
                            >
                                Hủy sửa
                            </button>
                        ) : null}
                    </div>
                    {success ? <div className="admin-form-success">{success}</div> : null}
                </form>
            </div>

            <div className="admin-panel" style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Giảm %</th>
                                <th>Từ — Đến</th>
                                <th>Lượt còn</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--bb-muted)' }}>
                                        Chưa có mã giảm giá.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((r) => {
                                    const st = String(r.status || '').toUpperCase();
                                    const badgeOn = st === 'ACTIVE';
                                    return (
                                        <tr key={r.id}>
                                            <td>
                                                <strong>{r.code}</strong>
                                            </td>
                                            <td>{r.discountPercent != null ? `${r.discountPercent}%` : '—'}</td>
                                            <td style={{ fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                                                {toInputDate(r.validFrom)} → {toInputDate(r.validTo)}
                                            </td>
                                            <td>{r.maxUsage != null ? r.maxUsage : '—'}</td>
                                            <td>
                                                <span
                                                    className={
                                                        'admin-badge ' +
                                                        (badgeOn ? 'admin-badge-on' : 'admin-badge-off')
                                                    }
                                                >
                                                    {statusLabel(r.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                    <button
                                                        type="button"
                                                        className="admin-btn-link"
                                                        onClick={() => startEdit(r)}
                                                        disabled={busyId === r.id}
                                                    >
                                                        Sửa
                                                    </button>
                                                    {st === 'ACTIVE' ? (
                                                        <button
                                                            type="button"
                                                            className="admin-btn-link"
                                                            onClick={() => handleToggleStatus(r, 'INACTIVE')}
                                                            disabled={busyId === r.id}
                                                        >
                                                            Tắt
                                                        </button>
                                                    ) : null}
                                                    {st === 'INACTIVE' || st === 'EXPIRED' ? (
                                                        <button
                                                            type="button"
                                                            className="admin-btn-link"
                                                            onClick={() => handleToggleStatus(r, 'ACTIVE')}
                                                            disabled={busyId === r.id}
                                                        >
                                                            Bật
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminDiscountCodes;
