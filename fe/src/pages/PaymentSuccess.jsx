import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle2,
    ClipboardList,
    Package,
    ShoppingBag,
    Sparkles
} from 'lucide-react';
import { cartService, subscriptionService, packageService } from '../services/api';
import { readCheckoutMeta, clearCheckoutMeta } from '../utils/checkoutMeta';
import './PaymentResult.css';

function formatMoney(n) {
    const v = typeof n === 'string' ? Number(n) : n;
    if (v == null || !Number.isFinite(Number(v))) return null;
    return `${Number(v).toLocaleString('vi-VN')}₫`;
}

function previewLabel(meta, hasLiveSub) {
    if (meta?.flow === 'cart') return 'Thanh toán giỏ hàng';
    if (meta?.flow === 'cart_subscription' || hasLiveSub) return 'Gói & thanh toán';
    if (meta?.flow === 'package') return 'Gói bạn vừa chọn';
    return 'Hoàn tất thanh toán';
}

function PaymentSuccess() {
    const [creatingOrders, setCreatingOrders] = useState(false);
    const [ordersCreated, setOrdersCreated] = useState(false);
    const [ordersCount, setOrdersCount] = useState(0);
    const [checkoutError, setCheckoutError] = useState(false);
    const [liveSub, setLiveSub] = useState(null);
    const [extraImageUrl, setExtraImageUrl] = useState(null);

    const meta = useMemo(() => readCheckoutMeta(), []);

    useEffect(() => {
        return () => clearCheckoutMeta();
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const subId =
                localStorage.getItem('bb_checkout_subscription_id') ||
                (meta?.subscriptionId != null ? String(meta.subscriptionId) : null);
            if (!subId) return;
            try {
                const res = await subscriptionService.getSubscriptionById(Number(subId));
                if (!cancelled) setLiveSub(res.data);
            } catch {
                /* optional enrichment */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [meta?.subscriptionId]);

    useEffect(() => {
        let cancelled = false;
        const pid = liveSub?.packageId ?? meta?.packageId;
        if (!pid || meta?.imageUrl) return;
        (async () => {
            try {
                const res = await packageService.getPackageById(pid);
                if (!cancelled && res.data?.imageUrl) setExtraImageUrl(res.data.imageUrl);
            } catch {
                /* ignore */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [liveSub?.packageId, meta?.packageId, meta?.imageUrl]);

    useEffect(() => {
        const subscriptionId = localStorage.getItem('bb_checkout_subscription_id');
        if (!subscriptionId) return;

        let cancelled = false;
        let attempts = 0;

        const attemptCheckout = async () => {
            attempts += 1;
            setCreatingOrders(true);
            setCheckoutError(false);

            try {
                const res = await cartService.checkout(Number(subscriptionId));
                if (cancelled) return;

                const data = res.data || [];
                setOrdersCount(Array.isArray(data) ? data.length : 0);
                setOrdersCreated(true);
                localStorage.removeItem('bb_checkout_subscription_id');
            } catch {
                if (attempts >= 3) {
                    if (!cancelled) {
                        setCheckoutError(true);
                        localStorage.removeItem('bb_checkout_subscription_id');
                    }
                    return;
                }

                if (!cancelled) {
                    setTimeout(attemptCheckout, 2000);
                }
            } finally {
                if (!cancelled) setCreatingOrders(false);
            }
        };

        attemptCheckout();

        return () => {
            cancelled = true;
        };
    }, []);

    const previewImage = meta?.imageUrl || extraImageUrl || null;
    const previewName =
        liveSub?.packageName ||
        meta?.packageName ||
        (meta?.flow === 'cart' ? 'Giỏ hàng của bạn' : null) ||
        'Đăng ký gói BudgetBites';

    const previewPrice =
        liveSub?.totalAmount != null
            ? liveSub.totalAmount
            : meta?.price != null
              ? meta.price
              : meta?.flow === 'cart'
                ? meta.cartTotal
                : null;

    const priceStr = formatMoney(previewPrice);
    const cartHint =
        meta?.flow === 'cart' && meta.itemCount != null
            ? `${meta.itemCount} món · ${priceStr || formatMoney(meta.cartTotal) || '—'}`
            : null;

    const PreviewVisualIcon =
        meta?.flow === 'cart' && !previewImage ? ShoppingBag : Package;

    return (
        <div className="payment-result-page payment-result-page--success">
            <header className="payment-result-hero">
                <div className="payment-result-hero-inner">
                    <span className="payment-result-kicker">
                        <Sparkles size={15} />
                        PayOS · Thanh toán online
                    </span>
                    <h1>Thanh toán thành công</h1>
                    <p>
                        Cảm ơn bạn đã đồng hành cùng BudgetBites. Giao dịch đã được ghi nhận; bạn có thể
                        tiếp tục đặt bữa hoặc xem chi tiết gói trong tài khoản.
                    </p>
                </div>
            </header>

            <div className="payment-result-shell">
                <div className="payment-result-layout">
                    <aside className="payment-result-preview">
                        <div className="payment-result-preview-visual">
                            {previewImage ? (
                                <img src={previewImage} alt="" />
                            ) : (
                                <PreviewVisualIcon size={44} strokeWidth={1.2} aria-hidden />
                            )}
                        </div>
                        <div className="payment-result-preview-body">
                            <div className="payment-result-preview-label">
                                {previewLabel(meta, Boolean(liveSub))}
                            </div>
                            <h2 className="payment-result-preview-title">{previewName}</h2>
                            {cartHint ? (
                                <p className="payment-result-preview-meta">{cartHint}</p>
                            ) : liveSub?.status ? (
                                <p className="payment-result-preview-meta">
                                    Trạng thái: <strong>{liveSub.status}</strong>
                                </p>
                            ) : (
                                <p className="payment-result-preview-meta">
                                    Gói đã được kích hoạt sau khi thanh toán thành công.
                                </p>
                            )}
                            {priceStr ? <div className="payment-result-preview-price">{priceStr}</div> : null}
                        </div>
                    </aside>

                    <div className="payment-result-main">
                        <div className="payment-result-card">
                            <div className="payment-result-card-head">
                                <div className="payment-result-icon-wrap" aria-hidden>
                                    <CheckCircle2 size={26} strokeWidth={2.2} />
                                </div>
                                <div>
                                    <h2>Thanh toán đã được xác nhận</h2>
                                    <p className="payment-result-lead">
                                        Hệ thống đã nhận thanh toán từ PayOS. Nếu bạn vừa thanh toán kèm
                                        giỏ hàng, chúng tôi sẽ tạo các suất ăn tương ứng.
                                    </p>
                                </div>
                            </div>

                            {creatingOrders && (
                                <div className="payment-result-status-block" role="status">
                                    Đang tạo các món bữa ăn từ giỏ hàng của bạn…
                                </div>
                            )}

                            {ordersCreated && (
                                <div className="payment-result-status-block" role="status">
                                    Đã tạo <strong>{ordersCount}</strong> món bữa ăn. Xem trong{' '}
                                    <Link className="payment-result-link-inline" to="/subscriptions">
                                        Gói đăng ký
                                    </Link>{' '}
                                    hoặc{' '}
                                    <Link className="payment-result-link-inline" to="/orders">
                                        Lịch sử đơn
                                    </Link>
                                    .
                                </div>
                            )}

                            {checkoutError && (
                                <div
                                    className="payment-result-status-block payment-result-status-block--warn"
                                    role="alert"
                                >
                                    Thanh toán đã thành công nhưng hệ thống chưa thể tạo tự động các món từ
                                    giỏ hàng. Vui lòng kiểm tra{' '}
                                    <Link className="payment-result-link-inline" to="/account">
                                        Tài khoản
                                    </Link>{' '}
                                    hoặc thử đặt lại.
                                </div>
                            )}

                            <div className="payment-result-steps" aria-label="Gợi ý bước tiếp theo">
                                <div className="payment-result-step">
                                    <ClipboardList size={18} />
                                    <span>
                                        Kiểm tra email / thông báo ngân hàng để đối chiếu giao dịch nếu cần.
                                    </span>
                                </div>
                                <div className="payment-result-step">
                                    <Package size={18} />
                                    <span>
                                        Mở{' '}
                                        <Link className="payment-result-link-inline" to="/subscriptions">
                                            Gói đăng ký
                                        </Link>{' '}
                                        để xem lịch ăn và đối tác.
                                    </span>
                                </div>
                            </div>

                            <div className="payment-result-actions">
                                <Link to="/mainpage" className="payment-result-btn payment-result-btn--ghost">
                                    Về trang chủ
                                </Link>
                                <Link
                                    to="/subscriptions"
                                    className="payment-result-btn payment-result-btn--primary"
                                >
                                    Xem gói & lịch ăn
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccess;
