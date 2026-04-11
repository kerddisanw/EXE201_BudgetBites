import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    CalendarDays,
    CreditCard,
    Package,
    ShoppingBag,
    Store,
    Trash2,
    UtensilsCrossed
} from 'lucide-react';
import { cartService, packageService, paymentService, subscriptionService } from '../services/api';
import './Cart.css';

const Cart = () => {
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [payError, setPayError] = useState('');
    const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
    const [busyId, setBusyId] = useState(null);
    const [toast, setToast] = useState('');
    const [activeSubscriptions, setActiveSubscriptions] = useState([]);
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
    const [packages, setPackages] = useState([]);
    const [selectedPackageId, setSelectedPackageId] = useState(null);
    const [payBusy, setPayBusy] = useState(false);

    const fmtMoney = useMemo(
        () => (value) => {
            if (value === null || value === undefined) return '0₫';
            const n =
                typeof value === 'number'
                    ? value
                    : typeof value === 'string'
                      ? Number(value)
                      : Number(value);
            if (Number.isFinite(n)) return `${n.toLocaleString('vi-VN')}₫`;
            return `${value}₫`;
        },
        []
    );

    const load = async () => {
        try {
            setLoadError('');
            setLoading(true);

            const [cartRes, subsRes, packagesRes] = await Promise.all([
                cartService.getCart(),
                subscriptionService.getMySubscriptions(),
                packageService.getAllPackages()
            ]);

            setCart(cartRes.data || { items: [], totalItems: 0, totalAmount: 0 });

            const subsList = Array.isArray(subsRes?.data) ? subsRes.data : [];
            const active = subsList.filter((s) => String(s.status || '').toUpperCase() === 'ACTIVE');
            setActiveSubscriptions(active);
            setSelectedSubscriptionId(active[0]?.id || null);

            const pkgsList = Array.isArray(packagesRes?.data) ? packagesRes.data : [];
            setPackages(pkgsList);
            setSelectedPackageId(null);
        } catch (err) {
            setLoadError(
                err.response?.data?.message || 'Không thể tải giỏ hàng. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const showToast = (msg, ms = 1600) => {
        setToast(msg);
        window.setTimeout(() => setToast(''), ms);
    };

    const handleRemove = async (itemId) => {
        try {
            setBusyId(itemId);
            await cartService.removeFromCart(itemId);
            showToast('Đã xóa khỏi giỏ hàng.');
            window.dispatchEvent(new Event('bb-cart-updated'));
            await load();
        } catch (err) {
            showToast(
                err.response?.data?.message || 'Không thể xóa món. Vui lòng thử lại.',
                2200
            );
        } finally {
            setBusyId(null);
        }
    };

    const handleClear = async () => {
        try {
            setBusyId('clear');
            await cartService.clearCart();
            showToast('Đã xóa toàn bộ giỏ hàng.');
            window.dispatchEvent(new Event('bb-cart-updated'));
            await load();
        } catch (err) {
            showToast(
                err.response?.data?.message || 'Không thể xóa giỏ hàng. Vui lòng thử lại.',
                2200
            );
        } finally {
            setBusyId(null);
        }
    };

    const handlePayWithPayOS = async () => {
        try {
            setPayBusy(true);
            setPayError('');

            if (activeSubscriptions.length > 0 && selectedSubscriptionId) {
                localStorage.setItem('bb_checkout_subscription_id', String(selectedSubscriptionId));

                const checkoutRes = await paymentService.createPayOSCheckout(selectedSubscriptionId);
                const checkoutUrl = checkoutRes.data?.checkoutUrl;

                if (!checkoutUrl) {
                    throw new Error('Không thể tạo link thanh toán.');
                }

                window.location.href = checkoutUrl;
                return;
            }

            if (!selectedSubscriptionId && !selectedPackageId) {
                const res = await paymentService.createCartPayOSCheckout();
                const { checkoutUrl, subscriptionId } = res.data || {};

                if (!checkoutUrl) {
                    throw new Error('Không thể tạo link thanh toán từ giỏ hàng.');
                }

                if (subscriptionId) {
                    localStorage.setItem('bb_checkout_subscription_id', String(subscriptionId));
                }

                window.location.href = checkoutUrl;
                return;
            }

            const packageIdToUse = selectedPackageId || packages?.[0]?.id;
            if (!packageIdToUse) {
                throw new Error('Vui lòng chọn một gói để thanh toán.');
            }

            const startDate = new Date().toISOString().split('T')[0];
            const created = await subscriptionService.createSubscription({
                packageId: packageIdToUse,
                startDate,
                notes: ''
            });

            const newSubscriptionId = created?.data?.id;
            if (!newSubscriptionId) {
                throw new Error('Không thể tạo subscription mới.');
            }

            localStorage.setItem('bb_checkout_subscription_id', String(newSubscriptionId));

            const checkoutRes = await paymentService.createPayOSCheckout(newSubscriptionId);
            const checkoutUrl = checkoutRes.data?.checkoutUrl;

            if (!checkoutUrl) {
                throw new Error('Không thể tạo link thanh toán.');
            }

            window.location.href = checkoutUrl;
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Không thể chuyển tới thanh toán. Vui lòng thử lại.';
            setPayError(msg);
            showToast(msg, 2400);
        } finally {
            setPayBusy(false);
        }
    };

    if (loading) {
        return (
            <div className="cart-page cart-page-loading bb-page-loading">
                <div className="bb-spinner" />
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="cart-page">
                <div className="cart-fetch-error">
                    <p>{loadError}</p>
                    <button type="button" className="cart-btn cart-btn-primary" onClick={() => load()}>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    const items = cart?.items || [];
    const totalCount = cart.totalItems || items.length;

    return (
        <div className="cart-page">
            {toast ? <div className="cart-toast">{toast}</div> : null}

            <header className="cart-hero">
                <div className="cart-hero-inner">
                    <span className="cart-kicker">
                        <ShoppingBag size={14} aria-hidden />
                        Bước cuối trước khi thanh toán
                    </span>
                    <h1 className="cart-hero-title">Giỏ hàng</h1>
                    <p className="cart-hero-desc">
                        {items.length === 0
                            ? 'Chưa có món nào — hãy chọn bữa ăn từ đối tác để tiếp tục.'
                            : 'Kiểm tra lại món, ngày ăn và đối tác trước khi thanh toán PayOS.'}
                    </p>
                    {items.length > 0 ? (
                        <div className="cart-hero-stats" role="group" aria-label="Tóm tắt nhanh">
                            <div className="cart-stat">
                                <span className="cart-stat-label">Tổng món</span>
                                <strong>{totalCount}</strong>
                            </div>
                            <div className="cart-stat cart-stat-accent">
                                <span className="cart-stat-label">Tạm tính</span>
                                <strong>{fmtMoney(cart.totalAmount)}</strong>
                            </div>
                        </div>
                    ) : null}
                </div>
            </header>

            <div className="cart-shell">
                <div className="cart-toolbar">
                    <div className="cart-toolbar-text">
                        {items.length > 0 ? (
                            <>
                                <span className="cart-toolbar-count">{totalCount} món</span>
                                <span className="cart-toolbar-dot" aria-hidden>
                                    ·
                                </span>
                                <span>Chỉnh sửa hoặc xóa trước khi thanh toán</span>
                            </>
                        ) : (
                            <span>Danh sách trống</span>
                        )}
                    </div>
                    <button
                        type="button"
                        className="cart-btn cart-btn-ghost cart-btn-icon"
                        onClick={handleClear}
                        disabled={items.length === 0 || busyId === 'clear'}
                        title="Xóa tất cả"
                    >
                        <Trash2 size={16} aria-hidden />
                        Xóa tất cả
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="cart-empty">
                        <div className="cart-empty-visual" aria-hidden>
                            <ShoppingBag strokeWidth={1.25} />
                        </div>
                        <h2 className="cart-empty-heading">Giỏ hàng đang trống</h2>
                        <p className="cart-empty-sub">
                            Quay lại bước chọn đối tác và thêm món vào giỏ để đặt bữa ăn.
                        </p>
                        <Link to="/partners" className="cart-empty-cta">
                            Đặt bữa ăn
                            <ArrowRight size={18} aria-hidden />
                        </Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <section className="cart-list" aria-label="Món trong giỏ">
                            {items.map((it, idx) => (
                                <article key={it.id} className="cart-item">
                                    <div className="cart-item-index" aria-hidden>
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>
                                    <div className="cart-item-body">
                                        <h2 className="cart-item-title">{it.itemName}</h2>
                                        <ul className="cart-item-details">
                                            <li>
                                                <Store size={15} aria-hidden />
                                                <span>{it.partnerName}</span>
                                            </li>
                                            <li>
                                                <UtensilsCrossed size={15} aria-hidden />
                                                <span>
                                                    {it.dayOfWeek}
                                                    {it.mealType ? ` · ${it.mealType}` : ''}
                                                </span>
                                            </li>
                                            <li>
                                                <CalendarDays size={15} aria-hidden />
                                                <span>{it.orderDate}</span>
                                            </li>
                                            {it.withTray ? (
                                                <li className="cart-item-tray">
                                                    <Package size={15} aria-hidden />
                                                    <span>Kèm khay</span>
                                                </li>
                                            ) : null}
                                        </ul>
                                    </div>
                                    <div className="cart-item-aside">
                                        <div className="cart-item-price">{fmtMoney(it.priceOriginal)}</div>
                                        <button
                                            type="button"
                                            className="cart-btn cart-btn-danger cart-btn-compact"
                                            onClick={() => handleRemove(it.id)}
                                            disabled={busyId === it.id}
                                        >
                                            {busyId === it.id ? '...' : 'Xóa'}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </section>

                        <aside className="cart-summary">
                            <div className="cart-summary-card">
                                <div className="cart-summary-head">
                                    <CreditCard size={20} aria-hidden />
                                    <div>
                                        <div className="cart-summary-title">Thanh toán</div>
                                        <p className="cart-summary-lead">PayOS · chọn gói nếu cần</p>
                                    </div>
                                </div>

                                <div className="cart-summary-rows">
                                    <div className="cart-summary-row">
                                        <span>Tổng món</span>
                                        <span className="cart-summary-strong">{totalCount}</span>
                                    </div>
                                    <div className="cart-summary-row cart-summary-row-total">
                                        <span>Tạm tính</span>
                                        <span className="cart-summary-amount">{fmtMoney(cart.totalAmount)}</span>
                                    </div>
                                </div>

                                {payError ? <div className="cart-pay-error">{payError}</div> : null}

                                <div className="cart-payment-section">
                                    {activeSubscriptions.length > 0 ? (
                                        <>
                                            <label className="cart-payment-label" htmlFor="cart-sub-select">
                                                Gói đang hoạt động
                                            </label>
                                            <select
                                                id="cart-sub-select"
                                                className="cart-select"
                                                value={selectedSubscriptionId || ''}
                                                onChange={(e) =>
                                                    setSelectedSubscriptionId(
                                                        e.target.value ? Number(e.target.value) : null
                                                    )
                                                }
                                                disabled={payBusy}
                                            >
                                                <option value="">Không</option>
                                                {activeSubscriptions.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.packageName || 'Gói'} ({fmtMoney(s.totalAmount)})
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    ) : (
                                        <>
                                            <label className="cart-payment-label" htmlFor="cart-pkg-select">
                                                Đăng ký gói mới (tùy chọn)
                                            </label>
                                            <select
                                                id="cart-pkg-select"
                                                className="cart-select"
                                                value={selectedPackageId || ''}
                                                onChange={(e) =>
                                                    setSelectedPackageId(
                                                        e.target.value ? Number(e.target.value) : null
                                                    )
                                                }
                                                disabled={payBusy}
                                            >
                                                <option value="">Không</option>
                                                {packages.length === 0 ? (
                                                    <option value="">Đang tải gói...</option>
                                                ) : (
                                                    packages.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name || 'Gói'} ({fmtMoney(p.price)})
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        className="cart-btn cart-pay-btn"
                                        onClick={handlePayWithPayOS}
                                        disabled={
                                            payBusy ||
                                            items.length === 0 ||
                                            (activeSubscriptions.length === 0 && packages.length === 0)
                                        }
                                    >
                                        {payBusy ? 'Đang mở thanh toán...' : 'Thanh toán PayOS'}
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
