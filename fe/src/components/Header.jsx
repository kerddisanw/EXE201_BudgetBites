import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cartService } from '../services/api';
import './Header.css';

const Header = () => {
    const navLinkClass = ({ isActive }) =>
        'bb-nav-link' + (isActive ? ' bb-nav-link-active' : '');

    const token = useMemo(() => localStorage.getItem('token'), []);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        if (!token) return;
        let alive = true;

        const loadCount = async () => {
            try {
                const res = await cartService.getCart();
                if (!alive) return;
                setCartCount(Number(res.data?.totalItems || 0));
            } catch {
                // ignore - badge is optional
            }
        };

        loadCount();
        const onUpdated = () => loadCount();
        window.addEventListener('bb-cart-updated', onUpdated);
        return () => {
            alive = false;
            window.removeEventListener('bb-cart-updated', onUpdated);
        };
    }, [token]);

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
                    <NavLink to="/partners" className={navLinkClass}>
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
                    <NavLink to="/account" className={navLinkClass}>
                        Tài Khoản
                    </NavLink>
                    <NavLink
                        to="/cart"
                        className={({ isActive }) =>
                            'bb-cart-link' + (isActive ? ' bb-cart-link-active' : '')
                        }
                        aria-label="Giỏ hàng"
                        title="Giỏ hàng"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M7 6h15l-2 8H8L7 6Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M7 6 6.4 3.6A1 1 0 0 0 5.43 3H3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M8.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M18.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                        {cartCount > 0 ? (
                            <span className="bb-cart-badge" aria-label={`${cartCount} món`}>
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        ) : null}
                    </NavLink>
                </nav>
            </div>
        </header>
    );
};

export default Header;

