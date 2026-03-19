import React, { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

function PaymentCancel() {
    const location = useLocation();

    useEffect(() => {
        // Prevent accidental "create meal orders after payment" if the user cancels.
        localStorage.removeItem('bb_checkout_subscription_id');
    }, []);

    const details = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return {
            orderCode: params.get('orderCode'),
            status: params.get('status'),
            code: params.get('code'),
            desc: params.get('desc'),
        };
    }, [location.search]);

    return (
        <div className="partners-page">
            <div className="partners-header">
                <h1>Thanh toán đã bị hủy</h1>
                <p>
                    {details.orderCode
                        ? `Đơn hàng ${details.orderCode} chưa được thanh toán thành công.`
                        : 'Bạn đã hủy quá trình thanh toán.'}
                </p>
                <p style={{ opacity: 0.8 }}>
                    {details.status ? `Trạng thái: ${details.status}` : ''}
                    {details.desc ? ` - ${details.desc}` : ''}
                </p>
            </div>

            <div
                style={{
                    maxWidth: 620,
                    margin: '24px auto 0',
                    padding: 24,
                    borderRadius: 16,
                    background: '#fff5f5',
                    border: '1px solid #ffc2c2',
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
                            background: '#ffe1e1',
                            color: '#e03131',
                            fontWeight: 800,
                            fontSize: 18,
                            lineHeight: 1,
                        }}
                    >
                        !
                    </span>

                    <div>
                        <h2 style={{ margin: 0, fontSize: 18, color: '#e03131' }}>
                            Thanh toán không hoàn tất
                        </h2>
                        <p style={{ margin: '10px 0 0', color: '#444', lineHeight: 1.6 }}>
                            {details.desc
                                ? details.desc
                                : 'Không có giao dịch thanh toán thành công. Bạn có thể thử lại hoặc chọn gói phù hợp trước khi thanh toán.'}
                        </p>
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
                        to="/subscriptions"
                        style={{
                            padding: '10px 16px',
                            borderRadius: 999,
                            border: '1px solid #ced4da',
                            textDecoration: 'none',
                            color: '#495057',
                            fontSize: 14,
                            fontWeight: 600,
                        }}
                    >
                        Xem gói đăng ký
                    </Link>

                    <Link
                        to="/packages"
                        style={{
                            padding: '10px 18px',
                            borderRadius: 999,
                            textDecoration: 'none',
                            background: '#ff922b',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                            boxShadow: '0 6px 14px rgba(255, 146, 43, 0.35)',
                        }}
                    >
                        Chọn lại gói & thanh toán
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PaymentCancel;

