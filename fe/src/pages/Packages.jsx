import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Crown,
    CheckCircle2,
    Clock3,
    ShieldCheck,
    Wallet,
    Sparkles,
    ChevronRight,
    ImageOff
} from 'lucide-react';
import { packageService, subscriptionService, paymentService } from '../services/api';
import { writeCheckoutMeta } from '../utils/checkoutMeta';
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

            const pkg = packages.find((p) => p.id === packageId);
            writeCheckoutMeta({
                flow: 'package',
                subscriptionId: created.data.id,
                packageId,
                packageName: pkg?.name ?? null,
                price: pkg?.price ?? null,
                imageUrl: pkg?.imageUrl || null
            });

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

    const formatMoney = (n) => `${Number(n || 0).toLocaleString('vi-VN')}₫`;
    const formatType = (type) => {
        const map = {
            WEEKLY: 'Theo tuần',
            MONTHLY: 'Theo tháng',
            FLEXIBLE: 'Linh hoạt'
        };
        return map[type] || type || 'Tiêu chuẩn';
    };
    const getCardBadge = (pkg, idx) => {
        if (idx === 0) return 'Phổ biến';
        if (pkg.durationDays >= 30) return 'Tiết kiệm';
        if ((pkg.mealsPerDay || 0) >= 3) return 'Nhiều bữa';
        return 'Đề xuất';
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
            <section className="packages-hero">
                <div className="packages-hero-inner">
                    <div className="packages-hero-copy">
                        <span className="packages-kicker">
                            <Sparkles size={16} />
                            BudgetBites Plans
                        </span>
                        <h1>Chọn gói bữa ăn phù hợp với bạn</h1>
                        <p>
                            Linh hoạt theo lịch học, giá sinh viên, thanh toán online nhanh chóng.
                            Bắt đầu chỉ với vài thao tác.
                        </p>
                        <div className="packages-hero-points">
                            <span>
                                <CheckCircle2 size={16} />
                                Đổi gói dễ dàng
                            </span>
                            <span>
                                <ShieldCheck size={16} />
                                Thanh toán an toàn
                            </span>
                            <span>
                                <Clock3 size={16} />
                                Kích hoạt nhanh
                            </span>
                        </div>
                    </div>
                    <div className="packages-hero-stat">
                        <div className="packages-stat-card">
                            <span className="packages-stat-label">Mức giá từ</span>
                            <strong className="packages-stat-value">
                                {formatMoney(
                                    packages.length > 0
                                        ? Math.min(...packages.map((p) => Number(p.price || 0)))
                                        : 0
                                )}
                            </strong>
                            <span className="packages-stat-sub">Gói ăn cho sinh viên</span>
                        </div>
                    </div>
                </div>
            </section>

            {error && <div className="packages-error">{error}</div>}

            <section className="packages-trust">
                <div className="packages-trust-inner">
                    <div className="packages-trust-item">
                        <Wallet size={20} />
                        <div>
                            <strong>Giá rõ ràng</strong>
                            <span>Không phí ẩn, hiển thị đầy đủ trước khi thanh toán</span>
                        </div>
                    </div>
                    <div className="packages-trust-item">
                        <Crown size={20} />
                        <div>
                            <strong>Ưu đãi thành viên</strong>
                            <span>Nhiều quyền lợi hơn khi duy trì gói dài ngày</span>
                        </div>
                    </div>
                    <div className="packages-trust-item">
                        <ShieldCheck size={20} />
                        <div>
                            <strong>Đảm bảo chất lượng</strong>
                            <span>Quán đối tác được kiểm duyệt trước khi lên hệ thống</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="packages-grid">
                {packages.map((pkg, idx) => {
                    const price = Number(pkg.price || 0);
                    const duration = Number(pkg.durationDays || 0);
                    const mealsPerDay = Number(pkg.mealsPerDay || 0);
                    const totalMeals = duration > 0 && mealsPerDay > 0 ? duration * mealsPerDay : null;
                    const pricePerMeal = totalMeals ? Math.round(price / totalMeals) : null;
                    return (
                    <article key={pkg.id} className="package-card">
                        <span className="package-badge">{getCardBadge(pkg, idx)}</span>
                        <div className="package-card-media">
                            {pkg.imageUrl ? (
                                <img
                                    src={pkg.imageUrl}
                                    alt={pkg.name ? `Ảnh gói: ${pkg.name}` : 'Ảnh gói combo'}
                                    className="package-card-image"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="package-card-image-placeholder">
                                    <ImageOff size={28} strokeWidth={1.5} />
                                </div>
                            )}
                        </div>
                        <header className="package-card-header">
                            <h2 className="package-name">{pkg.name}</h2>
                            <div className="package-price">
                                <span className="price-main">{formatMoney(pkg.price)}</span>
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
                                    <span className="detail-value">{formatType(pkg.packageType)}</span>
                                </p>
                            )}
                            {pkg.partnerName && (
                                <p>
                                    <span className="detail-label">Đối tác chính</span>
                                    <span className="detail-value">{pkg.partnerName}</span>
                                </p>
                            )}
                            {pricePerMeal && (
                                <p>
                                    <span className="detail-label">Ước tính / bữa</span>
                                    <span className="detail-value detail-value-accent">
                                        {formatMoney(pricePerMeal)}
                                    </span>
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => handleSubscribe(pkg.id)}
                            className="subscribe-btn"
                            disabled={busyPackageId === pkg.id}
                        >
                            {busyPackageId === pkg.id ? (
                                'Đang tạo thanh toán...'
                            ) : (
                                <>
                                    Đăng ký gói này <ChevronRight size={16} />
                                </>
                            )}
                        </button>
                    </article>
                );
                })}
            </div>
        </div>
    );
}

export default Packages;
