import React, { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { adminDashboardService } from '../services/adminApi';
import { formatMoneyVnd } from '../utils/formatMoney';
import '../components/AdminLayout.css';
import './AdminDashboard.css';

const SUBSCRIPTION_STATUS_LABELS = {
    PENDING: 'Chờ xử lý',
    ACTIVE: 'Đang hoạt động',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy'
};

const PIE_COLORS = ['#f97316', '#0ea5e9', '#22c55e', '#94a3b8'];

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await adminDashboardService.getStats();
                if (alive) setStats(res.data || {});
            } catch (err) {
                if (alive) {
                    setError(
                        err.response?.data?.message || 'Không tải được thống kê. Vui lòng thử lại.'
                    );
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const mergedTrend = useMemo(() => {
        const rev = stats?.revenueByMonth;
        const subs = stats?.subscriptionsByMonth;
        const meals = stats?.mealOrdersByMonth;
        if (!Array.isArray(subs)) return [];
        return subs.map((row, i) => ({
            label: row.label ?? rev?.[i]?.label ?? row.month,
            month: row.month,
            count: Number(row.count ?? 0),
            mealCount: Number(Array.isArray(meals) ? meals[i]?.count ?? 0 : 0)
        }));
    }, [stats]);

    const statusBarData = useMemo(() => {
        const m = stats?.subscriptionsByStatus;
        if (!m || typeof m !== 'object') return [];
        return Object.entries(m).map(([key, value]) => ({
            key,
            name: SUBSCRIPTION_STATUS_LABELS[key] || key,
            count: Number(value)
        }));
    }, [stats]);

    const statusPieData = useMemo(
        () => statusBarData.filter((d) => d.count > 0),
        [statusBarData]
    );

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-spinner" />
            </div>
        );
    }

    if (error) {
        return <div className="admin-error">{error}</div>;
    }

    /** True when API is older build (only legacy /stats fields). */
    const extendedStatsMissing =
        stats &&
        Object.prototype.hasOwnProperty.call(stats, 'totalCustomers') &&
        !Object.prototype.hasOwnProperty.call(stats, 'activeCustomers');

    return (
        <>
            <h2 className="admin-page-title">Tổng quan</h2>
            <p className="admin-page-desc">
                Người dùng, đối tác, hợp đồng gói combo, suất món đã đặt, thanh toán và xu hướng 6 tháng gần
                nhất.
            </p>
            {extendedStatsMissing ? (
                <div className="admin-dashboard-api-hint" role="status">
                    Một số ô hiển thị “—” vì máy chủ API chưa trả về chỉ số mở rộng (khách hoạt động, đối tác,
                    v.v.). Hãy <strong>deploy lại backend</strong> bản mới nhất (nhánh có{' '}
                    <code>AdminService.getDashboardStats</code> đầy đủ) hoặc trỏ admin về backend local khi dev.
                </div>
            ) : null}

            <div className="admin-card-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-label">Khách hàng</div>
                    <div className="admin-stat-value">{stats?.totalCustomers ?? '—'}</div>
                    <div className="admin-stat-card-sub">
                        Hoạt động: {stats?.activeCustomers ?? '—'} · Ngưng: {stats?.inactiveCustomers ?? '—'}
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-label">Đối tác</div>
                    <div className="admin-stat-value">{stats?.totalPartners ?? '—'}</div>
                    <div className="admin-stat-card-sub">
                        Đang bật: {stats?.activePartners ?? '—'} · Đã duyệt & bật:{' '}
                        {stats?.approvedActivePartners ?? '—'}
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-label">Hợp đồng gói combo</div>
                    <div className="admin-stat-value">{stats?.totalSubscriptions ?? '—'}</div>
                    <div className="admin-stat-card-sub">
                        Gói đăng kí
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-label">Suất món đã đặt</div>
                    <div className="admin-stat-value">{stats?.totalMealOrders ?? '—'}</div>
                    <div className="admin-stat-card-sub">Từ giỏ hàng / đặt bữa </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-label">Tổng ghi nhận thanh toán</div>
                    <div className="admin-stat-value">{formatMoneyVnd(stats?.totalRevenue)}</div>
                    <div className="admin-stat-card-sub">Mọi trạng thái thanh toán</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-label">Thanh toán chờ / lỗi</div>
                    <div className="admin-stat-value">
                        {stats?.pendingPaymentsCount ?? '—'} / {stats?.failedPaymentsCount ?? '—'}
                    </div>
                    <div className="admin-stat-card-sub">Chờ xử lý · Thất bại</div>
                </div>
            </div>

            <div className="admin-dashboard-charts">
                <div className="admin-panel admin-chart-panel admin-chart-panel-wide">
                    <h3>Hợp đồng gói & suất món theo tháng</h3>

                    {mergedTrend.length === 0 ? (
                        <div className="admin-chart-empty">Chưa có dữ liệu theo tháng.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={mergedTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    width={40}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 8px 24px rgba(15,23,42,0.08)'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    name="Hợp đồng gói mới"
                                    stroke="#0ea5e9"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="mealCount"
                                    name="Suất món"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="admin-panel admin-chart-panel">
                    <h3>Hợp đồng gói theo trạng thái</h3>
                    <p>Chỉ hợp đồng gói combo — không tính phiếu thanh toán giỏ món lẻ.</p>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={statusBarData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} width={36} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 12,
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 8px 24px rgba(15,23,42,0.08)'
                                }}
                            />
                            <Bar dataKey="count" name="Số hợp đồng" fill="#f97316" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="admin-panel admin-chart-panel">
                    <h3>Tỷ lệ trạng thái hợp đồng gói</h3>
                    <p>Chỉ hợp đồng gói combo; trạng thái có ít nhất một bản ghi.</p>
                    {statusPieData.length === 0 ? (
                        <div className="admin-chart-empty">Chưa có hợp đồng gói.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusPieData}
                                    dataKey="count"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={56}
                                    outerRadius={96}
                                    paddingAngle={2}
                                >
                                    {statusPieData.map((d, i) => (
                                        <Cell
                                            key={`${d.name}-${i}`}
                                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
