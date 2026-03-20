import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { packageService, subscriptionService, paymentService } from '../services/api';
import './Packages.css';

function Packages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [busyPackageId, setBusyPackageId] = useState(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await packageService.getAllPackages();
            const list = Array.isArray(response.data) ? response.data : [];
            setPackages(list);
            if (!Array.isArray(response.data)) {
                setError('Dữ liệu gói bữa ăn không hợp lệ. Vui lòng thử lại.');
            }
        } catch (err) {
            setError('Failed to load packages');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (packageId) => {
        try {
            setBusyPackageId(packageId);
            const startDate = new Date().toISOString().split('T')[0];
            const created = await subscriptionService.createSubscription({
                packageId,
                startDate,
                notes: ''
            });

            // Redirect to payOS checkout
            const checkoutRes = await paymentService.createPayOSCheckout(created.data.id);
            const checkoutUrl = checkoutRes.data?.checkoutUrl;
            if (!checkoutUrl) {
                throw new Error('Không thể tạo link thanh toán PayOS.');
            }

            window.location.href = checkoutUrl;
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Không thể tạo subscription hoặc link thanh toán. Vui lòng thử lại.';
            alert(msg);
            // fallback to list so user can see subscription state
            navigate('/subscriptions');
        } finally {
            setBusyPackageId(null);
        }
    };

    if (loading) {
        return (
            <div className="packages-page packages-page-loading bb-page-loading">
                <div className="bb-spinner" />
            </div>
        );
    }

    return (
        <div className="packages-page">
            <section className="packages-header">
                <div>
                    <h1>Gói bữa ăn BudgetBites</h1>
                    <p>
                        Chọn gói bữa ăn phù hợp với lịch học và ngân sách. Bạn có thể thay đổi hoặc
                        hủy bất cứ lúc nào.
                    </p>
                </div>
            </section>

            {error && <div className="packages-error">{error}</div>}

            <div className="packages-grid">
                {packages.map((pkg) => (
                    <article key={pkg.id} className="package-card">
                        <header className="package-card-header">
                            <h2 className="package-name">{pkg.name}</h2>
                            <div className="package-price">
                                <span className="price-main">
                                    {pkg.price?.toLocaleString('vi-VN')}₫
                                </span>
                                {pkg.durationDays ? (
                                    <span className="price-sub">
                                        / {pkg.durationDays} ngày
                                    </span>
                                ) : null}
                            </div>
                        </header>

                        <p className="package-description">
                            {pkg.description || 'Gói bữa ăn tiện lợi dành cho sinh viên bận rộn.'}
                        </p>

                        <div className="package-details">
                            {pkg.mealsPerDay != null && (
                                <p>
                                    <span className="detail-label">Số bữa mỗi ngày</span>
                                    <span className="detail-value">{pkg.mealsPerDay}</span>
                                </p>
                            )}
                            {pkg.packageType && (
                                <p>
                                    <span className="detail-label">Loại gói</span>
                                    <span className="detail-value">{pkg.packageType}</span>
                                </p>
                            )}
                            {pkg.partnerName && (
                                <p>
                                    <span className="detail-label">Đối tác chính</span>
                                    <span className="detail-value">{pkg.partnerName}</span>
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => handleSubscribe(pkg.id)}
                            className="subscribe-btn"
                            disabled={busyPackageId === pkg.id}
                        >
                            {busyPackageId === pkg.id ? 'Đang tạo thanh toán...' : 'Đăng ký gói này'}
                        </button>
                    </article>
                ))}
            </div>
        </div>
    );
}

export default Packages;
