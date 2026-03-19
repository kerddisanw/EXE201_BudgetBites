import React, { useEffect, useMemo, useState } from 'react';
import { cartService, packageService, paymentService, subscriptionService } from '../services/api';
import './Cart.css';

const Cart = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
            setError('');
            setLoading(true);

            const [cartRes, subsRes, packagesRes] = await Promise.all([
                cartService.getCart(),
                subscriptionService.getMySubscriptions(),
                packageService.getAllPackages()
            ]);

            setCart(cartRes.data || { items: [], totalItems: 0, totalAmount: 0 });

            const subs = subsRes?.data || [];
            const active = subs.filter((s) => String(s.status || '').toUpperCase() === 'ACTIVE');
            setActiveSubscriptions(active);
            setSelectedSubscriptionId(active[0]?.id || null);

            const pkgs = packagesRes?.data || [];
            setPackages(pkgs);
            // Default to "Không" (auto-pick first package) so the option is visible immediately.
            setSelectedPackageId(null);
        } catch (err) {
            setError(
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
            setError('');

            // Case 1: user chose a specific ACTIVE subscription -> pay with that subscription.
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

            // Case 2: user chose "Không" (no subscription / no package) -> pay with cart total only.
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

            // Case 3: no ACTIVE subscription selected, but user chose a package -> create subscription from that package.
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
            setError(msg);
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

    if (error) {
        return <div className="cart-page cart-page-error">{error}</div>;
    }

    const items = cart?.items || [];

    return (
        <div className="cart-page">
            {toast ? <div className="cart-toast">{toast}</div> : null}

            <div className="cart-header">
                <div>
                    <h1>Giỏ hàng</h1>
                    <p>Kiểm tra các bữa ăn đã chọn trước khi thanh toán.</p>
                </div>

                <div className="cart-actions">
                    <button
                        type="button"
                        className="cart-btn cart-btn-ghost"
                        onClick={handleClear}
                        disabled={items.length === 0 || busyId === 'clear'}
                    >
                        Xóa tất cả
                    </button>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="cart-empty">
                    <div className="cart-empty-card">
                        <div className="cart-empty-title">Giỏ hàng đang trống</div>
                        <div className="cart-empty-sub">
                            Hãy quay lại mục “Đặt bữa ăn” để chọn món nhé.
                        </div>
                    </div>
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-list">
                        {items.map((it) => (
                            <div key={it.id} className="cart-item">
                                <div className="cart-item-main">
                                    <div className="cart-item-title">{it.itemName}</div>
                                    <div className="cart-item-meta">
                                        <span className="cart-chip">{it.partnerName}</span>
                                        <span className="cart-dot">•</span>
                                        <span className="cart-chip">
                                            {it.dayOfWeek} {it.mealType ? `(${it.mealType})` : ''}
                                        </span>
                                        <span className="cart-dot">•</span>
                                        <span className="cart-chip">Ngày ăn: {it.orderDate}</span>
                                        {it.withTray ? (
                                            <>
                                                <span className="cart-dot">•</span>
                                                <span className="cart-chip">Có khay</span>
                                            </>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="cart-item-right">
                                    <div className="cart-item-price">
                                        {fmtMoney(it.priceOriginal)}
                                    </div>
                                    <button
                                        type="button"
                                        className="cart-btn cart-btn-danger"
                                        onClick={() => handleRemove(it.id)}
                                        disabled={busyId === it.id}
                                    >
                                        {busyId === it.id ? '...' : 'Xóa'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <aside className="cart-summary">
                        <div className="cart-summary-card">
                            <div className="cart-summary-title">Tóm tắt</div>
                            <div className="cart-summary-row">
                                <span>Tổng món</span>
                                <span className="cart-summary-strong">
                                    {cart.totalItems || items.length}
                                </span>
                            </div>
                            <div className="cart-summary-row">
                                <span>Tạm tính</span>
                                <span className="cart-summary-strong">
                                    {fmtMoney(cart.totalAmount)}
                                </span>
                            </div>

                            <div className="cart-summary-note">
                                Bạn có thể thanh toán với gói ACTIVE hiện có hoặc đăng ký gói mới để hệ thống tạo các món ăn trong tuần.
                            </div>

                            <div className="cart-payment-section">
                                {activeSubscriptions.length > 0 ? (
                                    <>
                                        <div className="cart-payment-label">Chọn gói của bạn</div>
                                        <select
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
                                        <div className="cart-payment-label">Chọn gói để đăng ký</div>
                                        <select
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
                                        <div className="cart-payment-hint">
                                            Hệ thống sẽ tạo subscription mới và chuyển bạn đến trang thanh toán.
                                        </div>
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
                                    {payBusy ? 'Đang mở thanh toán...' : 'Thanh toán'}
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default Cart;

