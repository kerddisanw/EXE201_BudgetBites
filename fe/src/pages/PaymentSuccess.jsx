import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartService } from '../services/api';

function PaymentSuccess() {
    const [creatingOrders, setCreatingOrders] = useState(false);
    const [ordersCreated, setOrdersCreated] = useState(false);
    const [ordersCount, setOrdersCount] = useState(0);
    const [checkoutError, setCheckoutError] = useState(false);

    useEffect(() => {
        const subscriptionId = localStorage.getItem('bb_checkout_subscription_id');
        if (!subscriptionId) return;

        let cancelled = false;
        let attempts = 0;

        const attemptCheckout = async () => {
            attempts += 1;
            setCreatingOrders(true);
            setCheckoutError('');

            try {
                const res = await cartService.checkout(Number(subscriptionId));
                if (cancelled) return;

                const data = res.data || [];
                setOrdersCount(Array.isArray(data) ? data.length : 0);
                setOrdersCreated(true);
                localStorage.removeItem('bb_checkout_subscription_id');
            } catch (err) {
                if (attempts >= 3) {
                    if (cancelled) return;
                    setCheckoutError(true);
                    localStorage.removeItem('bb_checkout_subscription_id');
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

    return (
        <div className="partners-page">
            <div className="partners-header">
                <h1>Thanh toán thành công</h1>
                <p>Cảm ơn bạn đã thanh toán cùng Budget Bites.</p>
            </div>

            <div
                style={{
                    maxWidth: 640,
                    margin: '24px auto 0',
                    padding: 24,
                    borderRadius: 16,
                    background: '#ecfdf3',
                    border: '1px solid #bbf7d0',
                    boxShadow: '0 10px 26px rgba(0,0,0,0.03)',
                }}
            >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span
                        style={{
                            display: 'inline-flex',
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#dcfce7',
                            color: '#16a34a',
                            fontWeight: 800,
                            fontSize: 18,
                            lineHeight: 1,
                        }}
                    >
                        ✓
                    </span>

                    <div>
                        <h2 style={{ margin: 0, fontSize: 18, color: '#166534' }}>
                            Thanh toán đã được xác nhận
                        </h2>
                        <p style={{ margin: '10px 0 0', color: '#14532d', lineHeight: 1.6 }}>
                            Cảm ơn bạn đã hoàn tất thanh toán. Hệ thống sẽ tự động ghi nhận các bữa ăn từ
                            giỏ hàng của bạn.
                        </p>

                        {creatingOrders && (
                            <p style={{ margin: '10px 0 0', color: '#166534' }}>
                                Đang tạo các món bữa ăn từ giỏ hàng...
                            </p>
                        )}

                        {ordersCreated && (
                            <p style={{ margin: '10px 0 0', color: '#166534', fontWeight: 600 }}>
                                Đã tạo {ordersCount} món bữa ăn thành công. Bạn có thể xem chi tiết trong
                                phần <Link to="/subscriptions">Gói đăng ký</Link> hoặc tiếp tục đặt bữa.
                            </p>
                        )}

                        {checkoutError && (
                            <p style={{ margin: '10px 0 0', color: '#b91c1c', fontWeight: 600 }}>
                                Thanh toán đã thành công nhưng hệ thống chưa thể tạo tự động các món bữa
                                ăn. Bạn vẫn có thể kiểm tra thanh toán trong mục tài khoản và đặt bữa lại
                                nếu cần.
                            </p>
                        )}
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12,
                        marginTop: 22,
                        flexWrap: 'wrap',
                    }}
                >
                    <Link
                        to="/mainpage"
                        style={{
                            padding: '10px 16px',
                            borderRadius: 999,
                            border: '1px solid #d1fae5',
                            textDecoration: 'none',
                            color: '#064e3b',
                            fontSize: 14,
                            fontWeight: 600,
                        }}
                    >
                        Về trang chủ
                    </Link>

                    <Link
                        to="/subscriptions"
                        style={{
                            padding: '10px 18px',
                            borderRadius: 999,
                            textDecoration: 'none',
                            background: '#16a34a',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                            boxShadow: '0 6px 14px rgba(22, 163, 74, 0.35)',
                        }}
                    >
                        Xem gói / lịch ăn
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccess;

