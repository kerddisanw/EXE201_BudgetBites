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
import { cartService, discountService, paymentService, subscriptionService } from '../services/api';
import { writeCheckoutMeta } from '../utils/checkoutMeta';
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
    const [payBusy, setPayBusy] = useState(false);
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponBusy, setCouponBusy] = useState(false);
    const [couponFieldError, setCouponFieldError] = useState('');

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

    const cartSubtotalNum = useMemo(() => {
        const v = cart?.totalAmount;
        const n = typeof v === 'number' ? v : Number(v);
        return Number.isFinite(n) ? n : 0;
    }, [cart?.totalAmount]);

    const couponDiscountNum = useMemo(() => {
        if (!appliedCoupon) return 0;
        const pct = Number(appliedCoupon.discountPercent);
        if (!Number.isFinite(pct) || pct <= 0) return 0;
        const raw = (cartSubtotalNum * pct) / 100;
        return Math.round(raw * 100) / 100;
    }, [cartSubtotalNum, appliedCoupon]);

    const payableNum = useMemo(() => {
        return Math.max(0, cartSubtotalNum - couponDiscountNum);
    }, [cartSubtotalNum, couponDiscountNum]);

    const showCouponUi = useMemo(
        () => activeSubscriptions.length === 0 || !selectedSubscriptionId,
        [activeSubscriptions.length, selectedSubscriptionId]
    );

    useEffect(() => {
        if (!showCouponUi) {
            setAppliedCoupon(null);
            setCouponInput('');
            setCouponFieldError('');
        }
    }, [showCouponUi]);

    const load = async () => {
        try {
            setLoadError('');
            setLoading(true);

            const [cartRes, subsRes] = await Promise.all([
                cartService.getCart(),
                subscriptionService.getMySubscriptions()
            ]);

            setCart(cartRes.data || { items: [], totalItems: 0, totalAmount: 0 });

            const subsList = Array.isArray(subsRes?.data) ? subsRes.data : [];
            const active = subsList.filter((s) => String(s.status || '').toUpperCase() === 'ACTIVE');
            setActiveSubscriptions(active);
            setSelectedSubscriptionId(active[0]?.id || null);
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

    const handleApplyCoupon = async () => {
        const raw = String(couponInput || '').trim();
        setCouponFieldError('');
        if (!raw) {
            setCouponFieldError('Nhập mã giảm giá.');
            return;
        }
        try {
            setCouponBusy(true);
            const res = await discountService.previewDiscount(raw);
            const d = res?.data;
            if (!d?.code) {
                throw new Error('Mã không hợp lệ.');
            }
            setAppliedCoupon({
                code: d.code,
                discountPercent: Number(d.discountPercent)
            });
            showToast('Đã áp dụng mã giảm giá.', 1800);
        } catch (err) {
            setAppliedCoupon(null);
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
            setCouponFieldError(msg);
            showToast(msg, 2400);
        } finally {
            setCouponBusy(false);
        }
    };

    const handlePayWithPayOS = async () => {
        try {
            setPayBusy(true);
            setPayError('');

            if (activeSubscriptions.length > 0 && selectedSubscriptionId) {
                localStorage.setItem('bb_checkout_subscription_id', String(selectedSubscriptionId));
                const sub = activeSubscriptions.find((s) => s.id === selectedSubscriptionId);
                writeCheckoutMeta({
                    flow: 'cart_subscription',
                    subscriptionId: selectedSubscriptionId,
                    packageId: sub?.packageId ?? null,
                    packageName: sub?.packageName ?? null,
                    price: sub?.totalAmount ?? null,
                    imageUrl: null
                });

                const checkoutRes = await paymentService.createPayOSCheckout(selectedSubscriptionId);
                const checkoutUrl = checkoutRes.data?.checkoutUrl;

                if (!checkoutUrl) {
                    throw new Error('Không thể tạo link thanh toán.');
                }

                window.location.href = checkoutUrl;
                return;
            }

            const cartDiscountCode =
                appliedCoupon?.code && String(appliedCoupon.code).trim()
                    ? String(appliedCoupon.code).trim()
                    : undefined;
            const res = await paymentService.createCartPayOSCheckout(cartDiscountCode);
            const { checkoutUrl, subscriptionId } = res.data || {};

            if (!checkoutUrl) {
                throw new Error('Không thể tạo link thanh toán từ giỏ hàng.');
            }

            if (subscriptionId) {
                localStorage.setItem('bb_checkout_subscription_id', String(subscriptionId));
            }

            writeCheckoutMeta({
                flow: 'cart',
                cartTotal: payableNum,
                itemCount: cart.totalItems ?? 0
            });

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
                                <strong>{fmtMoney(cartSubtotalNum)}</strong>
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
                                        <p className="cart-summary-lead">PayOS · mã giảm giá khi thanh toán giỏ</p>
                                    </div>
                                </div>

                                <div className="cart-summary-rows">
                                    <div className="cart-summary-row">
                                        <span>Tổng món</span>
                                        <span className="cart-summary-strong">{totalCount}</span>
                                    </div>
                                    <div className="cart-summary-row cart-summary-row-total">
                                        <span>Tạm tính</span>
                                        <span className="cart-summary-amount">{fmtMoney(cartSubtotalNum)}</span>
                                    </div>
                                    {appliedCoupon && showCouponUi ? (
                                        <>
                                            <div className="cart-summary-row cart-summary-row-discount">
                                                <span>
                                                    Giảm giá ({appliedCoupon.discountPercent}%)
                                                </span>
                                                <span className="cart-summary-discount">
                                                    −{fmtMoney(couponDiscountNum)}
                                                </span>
                                            </div>
                                            <div className="cart-summary-row cart-summary-row-payable">
                                                <span>Tổng thanh toán</span>
                                                <span className="cart-summary-amount">{fmtMoney(payableNum)}</span>
                                            </div>
                                        </>
                                    ) : null}
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
                                    ) : null}

                                    {showCouponUi ? (
                                        <div className="cart-coupon-block">
                                            <label className="cart-payment-label" htmlFor="cart-coupon-input">
                                                Mã giảm giá
                                            </label>
                                            <div className="cart-coupon-row">
                                                <input
                                                    id="cart-coupon-input"
                                                    type="text"
                                                    className="cart-coupon-input"
                                                    placeholder="Nhập mã"
                                                    value={couponInput}
                                                    onChange={(e) => {
                                                        setCouponInput(e.target.value);
                                                        setCouponFieldError('');
                                                    }}
                                                    disabled={payBusy || couponBusy}
                                                    autoComplete="off"
                                                />
                                                <button
                                                    type="button"
                                                    className="cart-btn cart-coupon-apply"
                                                    onClick={handleApplyCoupon}
                                                    disabled={payBusy || couponBusy}
                                                >
                                                    {couponBusy ? '...' : 'Áp dụng'}
                                                </button>
                                            </div>
                                            {couponFieldError ? (
                                                <p className="cart-coupon-error" role="alert">
                                                    {couponFieldError}
                                                </p>
                                            ) : null}
                                            {appliedCoupon ? (
                                                <p className="cart-coupon-ok">
                                                    Đang dùng mã <strong>{appliedCoupon.code}</strong>
                                                    {appliedCoupon.discountPercent != null
                                                        ? ` · ${appliedCoupon.discountPercent}%`
                                                        : ''}
                                                    <button
                                                        type="button"
                                                        className="cart-coupon-remove"
                                                        onClick={() => {
                                                            setAppliedCoupon(null);
                                                            setCouponInput('');
                                                            setCouponFieldError('');
                                                        }}
                                                        disabled={payBusy}
                                                    >
                                                        Bỏ mã
                                                    </button>
                                                </p>
                                            ) : null}
                                        </div>
                                    ) : null}

                                    <button
                                        type="button"
                                        className="cart-btn cart-pay-btn"
                                        onClick={handlePayWithPayOS}
                                        disabled={payBusy || items.length === 0}
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
