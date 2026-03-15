import React, { useEffect, useMemo, useState } from 'react';
import { cartService } from '../services/api';
import './Cart.css';

const Cart = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
    const [busyId, setBusyId] = useState(null);
    const [toast, setToast] = useState('');

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
            const res = await cartService.getCart();
            setCart(res.data || { items: [], totalItems: 0, totalAmount: 0 });
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

    if (loading) {
        return <div className="cart-page cart-page-loading">Đang tải giỏ hàng...</div>;
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
                                Thanh toán sẽ được thực hiện ở bước tiếp theo (Subscription /
                                Checkout).
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default Cart;

