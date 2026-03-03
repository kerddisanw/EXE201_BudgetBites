import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navLinkClass = ({ isActive }) =>
        'bb-nav-link' + (isActive ? ' bb-nav-link-active' : '');

    return (
        <header className="bb-header">
            <div className="bb-header-inner">
                <div className="bb-logo">
                    <span className="bb-logo-primary">Budget</span>
                    <span className="bb-logo-accent">Bites</span>
                </div>
                <nav className="bb-nav">
                    <NavLink to="/mainpage" className={navLinkClass}>
                        Trang chủ
                    </NavLink>
                    <NavLink to="/packages" className={navLinkClass}>
                        Đặt bữa ăn
                    </NavLink>
                    <NavLink to="/faqs" className={navLinkClass}>
                        FAQs
                    </NavLink>
                    <NavLink to="/about" className={navLinkClass}>
                        Giới thiệu
                    </NavLink>
                    <NavLink to="/support" className={navLinkClass}>
                        Trung tâm hỗ trợ
                    </NavLink>
                </nav>
                <NavLink to="/account" className="bb-account-btn">
                    Tài Khoản
                </NavLink>
            </div>
        </header>
    );
};

export default Header;

