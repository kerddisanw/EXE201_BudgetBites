import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Package, ShoppingBag, Sparkles, XCircle } from 'lucide-react';
import { packageService } from '../services/api';
import { readCheckoutMeta, clearCheckoutMeta } from '../utils/checkoutMeta';
import './PaymentResult.css';

function formatMoney(n) {
    const v = typeof n === 'string' ? Number(n) : n;
    if (v == null || !Number.isFinite(Number(v))) return null;
    return `${Number(v).toLocaleString('vi-VN')}₫`;
}

function previewLabel(meta) {
    if (meta?.flow === 'cart') return 'Giỏ hàng chưa thanh toán';
    if (meta?.flow === 'cart_subscription') return 'Gói bạn chọn';
    if (meta?.flow === 'package') return 'Gói bạn chưa hoàn tất';
    return 'Tiếp tục đặt bữa';
}

function PaymentCancel() {
    const meta = useMemo(() => readCheckoutMeta(), []);
    const [extraImageUrl, setExtraImageUrl] = useState(null);

    useEffect(() => {
        localStorage.removeItem('bb_checkout_subscription_id');
        return () => clearCheckoutMeta();
    }, []);

    useEffect(() => {
        let cancelled = false;
        const pid = meta?.packageId;
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
    }, [meta?.packageId, meta?.imageUrl]);

    const previewImage = meta?.imageUrl || extraImageUrl || null;
    const previewName =
        meta?.packageName || (meta?.flow === 'cart' ? 'Giỏ hàng của bạn' : 'Gói BudgetBites');

    const previewPrice =
        meta?.price != null ? meta.price : meta?.flow === 'cart' ? meta.cartTotal : null;

    const priceStr = formatMoney(previewPrice);
    const cartHint =
        meta?.flow === 'cart' && meta.itemCount != null
            ? `${meta.itemCount} món trong giỏ${priceStr ? ` · ${priceStr}` : ''}`
            : null;

    const PreviewVisualIcon =
        meta?.flow === 'cart' && !previewImage ? ShoppingBag : Package;

    return (
        <div className="payment-result-page payment-result-page--cancel">
            <header className="payment-result-hero">
                <div className="payment-result-hero-inner">
                    <span className="payment-result-kicker">
                        <Sparkles size={15} />
                        PayOS · Giao dịch chưa hoàn tất
                    </span>
                    <h1>Thanh toán đã bị hủy</h1>
                    <p>
                        Bạn đã thoát hoặc hủy trên cổng thanh toán. Chưa có khoản phí nào được trừ. Hãy chọn
                        lại gói hoặc mở giỏ hàng để thử PayOS một lần nữa.
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
                            <div className="payment-result-preview-label">{previewLabel(meta)}</div>
                            <h2 className="payment-result-preview-title">{previewName}</h2>
                            {cartHint ? (
                                <p className="payment-result-preview-meta">{cartHint}</p>
                            ) : (
                                <p className="payment-result-preview-meta">
                                    Thanh toán chưa xong — gói vẫn có thể chọn lại bất cứ lúc nào.
                                </p>
                            )}
                            {priceStr ? <div className="payment-result-preview-price">{priceStr}</div> : null}
                        </div>
                    </aside>

                    <div className="payment-result-main">
                        <div className="payment-result-card">
                            <div className="payment-result-card-head">
                                <div className="payment-result-icon-wrap" aria-hidden>
                                    <XCircle size={26} strokeWidth={2.2} />
                                </div>
                                <div>
                                    <h2>Thanh toán không hoàn tất</h2>
                                    <p className="payment-result-lead">
                                        Không có giao dịch thành công. Giỏ hàng và gói vẫn được giữ (nếu bạn
                                        chưa xóa) — chỉ cần bấm thanh toán lại.
                                    </p>
                                </div>
                            </div>

                            <div className="payment-result-status-block" role="status">
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <AlertCircle
                                        size={20}
                                        style={{ flexShrink: 0, marginTop: 2 }}
                                        aria-hidden
                                    />
                                    <span>
                                        Nếu bạn gặp lỗi từ ngân hàng hoặc ví, đợi vài phút rồi thử lại. Cần
                                        hỗ trợ, mở{' '}
                                        <Link className="payment-result-link-inline" to="/support">
                                            Trung tâm hỗ trợ
                                        </Link>
                                        .
                                    </span>
                                </div>
                            </div>

                            <div className="payment-result-actions">
                                <Link to="/subscriptions" className="payment-result-btn payment-result-btn--ghost">
                                    Xem gói đăng ký
                                </Link>
                                <Link
                                    to={meta?.flow === 'cart' ? '/cart' : '/packages'}
                                    className="payment-result-btn payment-result-btn--primary"
                                >
                                    {meta?.flow === 'cart'
                                        ? 'Về giỏ hàng & thanh toán'
                                        : 'Chọn lại gói & thanh toán'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentCancel;
