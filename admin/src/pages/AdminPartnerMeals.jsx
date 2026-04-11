import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminMenuService, adminPartnerService } from '../services/adminApi';
import AdminImageField from '../components/AdminImageField';
import { uploadMenuItemImage } from '../services/uploadApi';
import './AdminPartnerMeals.css';

const DAYS = [
    { value: 'MONDAY', label: 'Thứ 2' },
    { value: 'TUESDAY', label: 'Thứ 3' },
    { value: 'WEDNESDAY', label: 'Thứ 4' },
    { value: 'THURSDAY', label: 'Thứ 5' },
    { value: 'FRIDAY', label: 'Thứ 6' },
    { value: 'SATURDAY', label: 'Thứ 7' },
    { value: 'SUNDAY', label: 'Chủ nhật' }
];

const MEAL_TYPES = [
    { value: 'BREAKFAST', label: 'Sáng' },
    { value: 'LUNCH', label: 'Trưa' },
    { value: 'DINNER', label: 'Tối' },
    { value: 'SNACK', label: 'Phụ' }
];

function newClientKey() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `k-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function mondayISO(d = new Date()) {
    const x = new Date(d);
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
    return x.toISOString().slice(0, 10);
}

function formatDateForInput(v) {
    if (!v) return '';
    if (typeof v === 'string') return v.slice(0, 10);
    if (Array.isArray(v) && v.length >= 3) {
        const [y, m, day] = v;
        return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return '';
}

function addDaysISO(iso, n) {
    const d = new Date(`${iso}T12:00:00`);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
}

const emptyRow = () => ({
    clientKey: newClientKey(),
    dayOfWeek: 'MONDAY',
    mealType: 'LUNCH',
    itemName: '',
    priceOriginal: '',
    imageUrl: '',
    calories: ''
});

function dtoItemsToRows(items) {
    if (!Array.isArray(items) || items.length === 0) return [emptyRow()];
    return items.map((it) => ({
        clientKey: newClientKey(),
        dayOfWeek: it.dayOfWeek || 'MONDAY',
        mealType: String(it.mealType || 'LUNCH').toUpperCase(),
        itemName: it.itemName ?? '',
        priceOriginal: it.priceOriginal != null ? String(it.priceOriginal) : '',
        imageUrl: it.imageUrl ?? '',
        calories: it.calories != null ? String(it.calories) : ''
    }));
}

function rowsToPayloadItems(rows) {
    const out = [];
    for (const r of rows) {
        const name = String(r.itemName || '').trim();
        if (!name) continue;
        const price = Number(String(r.priceOriginal).replace(',', '.'));
        if (!Number.isFinite(price) || price < 0) continue;
        const calRaw = String(r.calories ?? '').trim();
        const caloriesParsed = calRaw === '' ? null : parseInt(calRaw, 10);
        out.push({
            dayOfWeek: r.dayOfWeek,
            mealType: String(r.mealType || 'LUNCH').toUpperCase(),
            itemName: name,
            priceOriginal: price,
            imageUrl: String(r.imageUrl || '').trim() || null,
            calories: Number.isFinite(caloriesParsed) ? caloriesParsed : null
        });
    }
    return out;
}

const AdminPartnerMeals = () => {
    const { partnerId } = useParams();
    const partnerNumericId = Number(partnerId);

    const [partnerName, setPartnerName] = useState('');
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [editingMenuId, setEditingMenuId] = useState(null);
    const [weekStartDate, setWeekStartDate] = useState(() => mondayISO());
    const [description, setDescription] = useState('');
    const [itemRows, setItemRows] = useState(() => [emptyRow()]);

    const loadData = useCallback(async () => {
        if (!Number.isFinite(partnerNumericId) || partnerNumericId <= 0) {
            setError('ID đối tác không hợp lệ.');
            setLoading(false);
            return;
        }
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const [pRes, mRes] = await Promise.all([
                adminPartnerService.getPartnerById(partnerNumericId),
                adminMenuService.getMenusByPartner(partnerNumericId)
            ]);
            setPartnerName(pRes.data?.name || `Đối tác #${partnerNumericId}`);
            const list = Array.isArray(mRes.data) ? mRes.data : [];
            setMenus(list);

            if (list.length > 0) {
                const latest = [...list].sort((a, b) =>
                    String(formatDateForInput(b.weekStartDate)).localeCompare(
                        String(formatDateForInput(a.weekStartDate))
                    )
                )[0];
                setEditingMenuId(latest.id);
                setWeekStartDate(formatDateForInput(latest.weekStartDate) || mondayISO());
                setDescription(latest.description || '');
                setItemRows(dtoItemsToRows(latest.items));
            } else {
                setEditingMenuId(null);
                setWeekStartDate(mondayISO());
                setDescription('');
                setItemRows([emptyRow()]);
            }
        } catch (err) {
            setPartnerName('');
            setMenus([]);
            setError(
                err.response?.data?.message ||
                    (typeof err.response?.data === 'string' ? err.response.data : null) ||
                    'Không tải được dữ liệu đối tác / thực đơn.'
            );
        } finally {
            setLoading(false);
        }
    }, [partnerNumericId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const applyMenu = (menu) => {
        setEditingMenuId(menu.id);
        setWeekStartDate(formatDateForInput(menu.weekStartDate) || mondayISO());
        setDescription(menu.description || '');
        setItemRows(dtoItemsToRows(menu.items));
        setError('');
        setSuccess('');
    };

    const onMenuSelectChange = (e) => {
        const v = e.target.value;
        if (v === 'new') {
            setEditingMenuId(null);
            const nextWeek =
                menus.length > 0
                    ? addDaysISO(
                          formatDateForInput(
                              [...menus].sort((a, b) =>
                                  String(formatDateForInput(b.weekStartDate)).localeCompare(
                                      String(formatDateForInput(a.weekStartDate))
                                  )
                              )[0].weekStartDate
                          ),
                          7
                      )
                    : mondayISO();
            setWeekStartDate(nextWeek);
            setDescription('');
            setItemRows([emptyRow()]);
            setError('');
            setSuccess('');
            return;
        }
        const id = Number(v);
        const found = menus.find((m) => m.id === id);
        if (found) applyMenu(found);
    };

    const updateRow = (clientKey, patch) => {
        setItemRows((prev) => prev.map((r) => (r.clientKey === clientKey ? { ...r, ...patch } : r)));
    };

    const addRow = () => setItemRows((prev) => [...prev, emptyRow()]);
    const removeRow = (clientKey) =>
        setItemRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.clientKey !== clientKey)));

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const ws = String(weekStartDate).trim();
        if (!ws) {
            setError('Chọn ngày bắt đầu tuần (thường là thứ 2).');
            return;
        }
        const items = rowsToPayloadItems(itemRows);
        if (items.length === 0) {
            setError('Thêm ít nhất một món có tên và giá hợp lệ.');
            return;
        }
        const body = {
            partnerId: partnerNumericId,
            weekStartDate: ws,
            description: String(description || '').trim() || null,
            items
        };
        setSaving(true);
        try {
            if (editingMenuId != null) {
                await adminMenuService.updateMenu(editingMenuId, body);
                setSuccess('Đã cập nhật thực đơn tuần.');
            } else {
                const res = await adminMenuService.createMenu(body);
                setSuccess('Đã tạo thực đơn tuần mới.');
                if (res.data?.id) setEditingMenuId(res.data.id);
            }
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    (typeof err.response?.data === 'string' ? err.response.data : null) ||
                    'Không lưu được thực đơn.'
            );
        } finally {
            setSaving(false);
        }
    };

    const menuSelectValue = editingMenuId != null ? String(editingMenuId) : 'new';
    const sortedMenus = [...menus].sort((a, b) =>
        String(formatDateForInput(b.weekStartDate)).localeCompare(String(formatDateForInput(a.weekStartDate)))
    );

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-spinner" />
            </div>
        );
    }

    return (
        <div className="admin-partner-meals-page">
            <header className="admin-partner-meals-hero">
                <Link className="admin-partner-meals-back" to="/partners">
                    <span className="admin-partner-meals-back-icon" aria-hidden>
                        ←
                    </span>
                    Quay lại đối tác
                </Link>
                <div className="admin-partner-meals-hero-main">
                    <p className="admin-partner-meals-kicker">Quản lý thực đơn</p>
                    <h2 className="admin-partner-meals-title">
                        <span className="admin-partner-meals-title-accent">Thực đơn tuần</span>
                        <span className="admin-partner-meals-title-sep" aria-hidden>
                            —
                        </span>
                        <span className="admin-partner-meals-title-name">{partnerName || 'Đối tác'}</span>
                    </h2>
                    <p className="admin-partner-meals-lead">
                        Chọn tuần (ngày bắt đầu), thêm món theo ngày và buổi. Mỗi lần lưu sẽ ghi đè toàn bộ danh sách
                        món của thực đơn đó.
                    </p>
                </div>
            </header>

            {error ? <div className="admin-error admin-partner-meals-alert">{error}</div> : null}
            {success ? (
                <div className="admin-form-success admin-partner-meals-alert admin-partner-meals-alert--ok">
                    {success}
                </div>
            ) : null}

            <form className="admin-partner-meals-form" onSubmit={handleSave}>
                <div className="admin-panel admin-partner-meals-card">
                    <div className="admin-partner-meals-card-head">
                        <h3 className="admin-partner-meals-card-title">Tuần &amp; mô tả</h3>
                        <p className="admin-partner-meals-card-hint">Chọn thực đơn có sẵn hoặc tạo tuần mới.</p>
                    </div>
                    <div className="admin-partner-meals-toolbar">
                        <label className="admin-partner-meals-field">
                            <span className="admin-partner-meals-label">Thực đơn</span>
                            <select value={menuSelectValue} onChange={onMenuSelectChange}>
                                <option value="new">Tuần mới (tạo)</option>
                                {sortedMenus.map((m) => (
                                    <option key={m.id} value={String(m.id)}>
                                        Tuần {formatDateForInput(m.weekStartDate) || m.id}
                                        {m.description ? ` — ${m.description}` : ''}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="admin-partner-meals-field">
                            <span className="admin-partner-meals-label">Bắt đầu tuần</span>
                            <input
                                type="date"
                                value={weekStartDate}
                                onChange={(e) => setWeekStartDate(e.target.value)}
                                required
                            />
                        </label>
                        <label className="admin-partner-meals-field admin-partner-meals-field-grow">
                            <span className="admin-partner-meals-label">Mô tả tuần (tuỳ chọn)</span>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="VD: Tuần 15/4"
                            />
                        </label>
                    </div>
                </div>

                <div className="admin-panel admin-partner-meals-card admin-partner-meals-card--table">
                    <div className="admin-partner-meals-card-head admin-partner-meals-card-head--row">
                        <div>
                            <h3 className="admin-partner-meals-card-title">Món theo ngày</h3>
                            <p className="admin-partner-meals-card-hint">Mỗi dòng là một món: ngày, buổi, tên, giá.</p>
                        </div>
                    </div>
                    <div className="admin-meals-table-wrap">
                    <table className="admin-meals-table">
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Buổi</th>
                                <th className="admin-meals-col-name">Tên món</th>
                                <th>Giá</th>
                                <th>Kcal</th>
                                <th className="admin-meals-col-img">Ảnh</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {itemRows.map((row) => (
                                <tr key={row.clientKey}>
                                    <td>
                                        <select
                                            value={row.dayOfWeek}
                                            onChange={(e) => updateRow(row.clientKey, { dayOfWeek: e.target.value })}
                                        >
                                            {DAYS.map((d) => (
                                                <option key={d.value} value={d.value}>
                                                    {d.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={row.mealType}
                                            onChange={(e) => updateRow(row.clientKey, { mealType: e.target.value })}
                                        >
                                            {MEAL_TYPES.map((m) => (
                                                <option key={m.value} value={m.value}>
                                                    {m.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="admin-meals-col-name">
                                        <input
                                            type="text"
                                            value={row.itemName}
                                            onChange={(e) => updateRow(row.clientKey, { itemName: e.target.value })}
                                            placeholder="Tên món"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={row.priceOriginal}
                                            onChange={(e) =>
                                                updateRow(row.clientKey, { priceOriginal: e.target.value })
                                            }
                                            placeholder="0"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={row.calories}
                                            onChange={(e) => updateRow(row.clientKey, { calories: e.target.value })}
                                            placeholder="—"
                                        />
                                    </td>
                                    <td className="admin-meals-col-img">
                                        <AdminImageField
                                            inputId={`mi-${row.clientKey}`}
                                            label=""
                                            value={row.imageUrl}
                                            onChange={(url) => updateRow(row.clientKey, { imageUrl: url })}
                                            uploadFn={uploadMenuItemImage}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="admin-btn-sm"
                                            onClick={() => removeRow(row.clientKey)}
                                        >
                                            Xóa dòng
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>

                <div className="admin-partner-meals-actions admin-form-actions">
                    <button type="button" className="admin-btn-sm admin-partner-meals-btn-secondary" onClick={addRow}>
                        + Thêm dòng
                    </button>
                    <button type="submit" className="admin-btn-primary admin-partner-meals-btn-save" disabled={saving}>
                        {saving ? 'Đang lưu…' : editingMenuId != null ? 'Lưu thực đơn' : 'Tạo thực đơn'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPartnerMeals;
