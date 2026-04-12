import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { CUSTOMER_APP_URL } from '../config/config';
import { getStoredUser } from '../utils/sessionUser';
import AdminLogo from './AdminLogo';
import './AdminLayout.css';

const navClass = ({ isActive }) =>
    'admin-nav-item' + (isActive ? ' admin-nav-item-active' : '');

const ADMIN_TITLES = [
    { match: (p) => p === '/', title: 'Tổng quan', sub: 'Số liệu và hoạt động hệ thống' },
    {
        match: (p) => p.startsWith('/customers'),
        title: 'Khách hàng',
        sub: 'Danh sách và trạng thái tài khoản'
    },
    {
        match: (p) => /^\/partners\/\d+\/ratings/.test(p),
        title: 'Đánh giá đối tác',
        sub: 'Nhận xét và sao từ khách hàng'
    },
    {
        match: (p) => /^\/partners\/\d+\/meals/.test(p),
        title: 'Thực đơn tuần',
        sub: 'Món ăn theo ngày cho đối tác'
    },
    {
        match: (p) => p.startsWith('/partners'),
        title: 'Đối tác',
        sub: 'Nhà hàng và điểm phục vụ'
    },
    {
        match: (p) => p.startsWith('/meal-packages'),
        title: 'Gói combo',
        sub: 'Tạo và xem gói ăn theo đối tác'
    },
    {
        match: (p) => p.startsWith('/subscriptions'),
        title: 'Gói đăng ký',
        sub: 'Theo dõi và cập nhật trạng thái'
    },
    {
        match: (p) => p.startsWith('/discount-codes'),
        title: 'Mã giảm giá',
        sub: 'Tạo và quản lý mã khuyến mãi cho khách'
    }
];

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(() => getStoredUser());
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const header =
        ADMIN_TITLES.find((t) => t.match(location.pathname)) ||
        ADMIN_TITLES[0];

    const customerHomeUrl = `${CUSTOMER_APP_URL}/mainpage`;

    useEffect(() => {
        setUser(getStoredUser());
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="admin-app">
            <button
                type="button"
                className="admin-sidebar-toggle"
                aria-label="Mở menu"
                onClick={() => setSidebarOpen((o) => !o)}
            >
                <span />
                <span />
                <span />
            </button>
            {sidebarOpen ? (
                <button
                    type="button"
                    className="admin-sidebar-backdrop"
                    aria-label="Đóng menu"
                    onClick={() => setSidebarOpen(false)}
                />
            ) : null}
            <aside className={'admin-sidebar' + (sidebarOpen ? ' admin-sidebar-open' : '')}>
                <div className="admin-sidebar-brand">
                    <AdminLogo badge="Quản trị" />
                </div>
                <nav className="admin-sidebar-nav">
                    <NavLink
                        to="/"
                        end
                        className={navClass}
                        onClick={() => setSidebarOpen(false)}
                    >
                        Tổng quan
                    </NavLink>
                    <NavLink
                        to="/customers"
                        className={navClass}
                        onClick={() => setSidebarOpen(false)}
                    >
                        Khách hàng
                    </NavLink>
                    <NavLink
                        to="/partners"
                        className={navClass}
                        onClick={() => setSidebarOpen(false)}
                    >
                        Đối tác
                    </NavLink>
                    <NavLink
                        to="/meal-packages"
                        className={navClass}
                        onClick={() => setSidebarOpen(false)}
                    >
                        Gói combo
                    </NavLink>
                    <NavLink
                        to="/subscriptions"
                        className={navClass}
                        onClick={() => setSidebarOpen(false)}
                    >
                        Gói đăng ký
                    </NavLink>
                    <NavLink
                        to="/discount-codes"
                        className={navClass}
                        onClick={() => setSidebarOpen(false)}
                    >
                        Mã giảm giá
                    </NavLink>
                    <a
                        href={customerHomeUrl}
                        className="admin-link-site admin-sidebar-customer-link"
                        onClick={() => setSidebarOpen(false)}
                    >
                        ← Về trang khách
                    </a>
                </nav>
            </aside>
            <div className="admin-main-column">
                <div className="admin-main-wrap">
                    <header className="admin-topbar">
                        <div className="admin-topbar-title">
                            <h1 className="admin-topbar-heading brand-font">{header.title}</h1>
                            <p className="admin-topbar-sub">{header.sub}</p>
                        </div>
                        <div className="admin-topbar-actions">
                            {user?.email ? (
                                <span className="admin-user-email" title={user.fullName || user.email}>
                                    {user.fullName || user.email}
                                </span>
                            ) : null}
                            <button type="button" className="admin-btn-logout" onClick={handleLogout}>
                                Đăng xuất
                            </button>
                        </div>
                    </header>
                    <main className="admin-content">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
