import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Sun,
    UtensilsCrossed,
    Moon,
    Cookie,
    Plus,
    ShoppingCart,
    MapPin,
    Star
} from 'lucide-react';
import { cartService, feedbackService, menuService, partnerService } from '../services/api';
import './Partners.css';

const MEAL_ICONS = {
    BREAKFAST: Sun,
    LUNCH: UtensilsCrossed,
    DINNER: Moon,
    SNACK: Cookie
};

const PartnerMeals = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const partnerId = Number(id);

    const [partner, setPartner] = useState(null);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDayKey, setSelectedDayKey] = useState(null);
    const [orderDate, setOrderDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [addingMealId, setAddingMealId] = useState(null);
    const [addMessage, setAddMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbackEligibility, setFeedbackEligibility] = useState({
        eligible: false,
        message: ''
    });
    const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
    const [feedbackBusy, setFeedbackBusy] = useState(false);
    const [feedbackError, setFeedbackError] = useState('');
    const [feedbackNotice, setFeedbackNotice] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [partnerRes, menusRes] = await Promise.all([
                    partnerService.getPartnerById(partnerId),
                    menuService.getMenusByPartner(partnerId)
                ]);

                if (!isMounted) return;

                setPartner(partnerRes.data);
                const data = Array.isArray(menusRes.data) ? menusRes.data : [];
                setMenus(data);
                if (!Array.isArray(menusRes.data)) {
                    setError('Dữ liệu thực đơn không hợp lệ. Vui lòng thử lại.');
                }

                const [feedbacksRes, eligibilityRes] = await Promise.all([
                    feedbackService
                        .getFeedbacksByPartner(partnerId)
                        .catch(() => ({ data: [] })),
                    feedbackService
                        .getMyEligibilityForPartner(partnerId)
                        .catch(() => ({
                            data: {
                                eligible: false,
                                message:
                                    'Bạn cần thanh toán thành công ít nhất 1 bữa ăn từ quán này để đánh giá.'
                            }
                        }))
                ]);
                const feedbacksData = Array.isArray(feedbacksRes.data)
                    ? feedbacksRes.data
                    : [];
                feedbacksData.sort((a, b) => {
                    const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return db - da;
                });
                setFeedbacks(feedbacksData);
                setFeedbackEligibility(eligibilityRes.data || { eligible: false, message: '' });
            } catch (err) {
                if (!isMounted) return;
                setError(
                    err.response?.data?.message ||
                        'Không thể tải thực đơn đối tác. Vui lòng thử lại.'
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [partnerId]);

    const reloadFeedbackSection = async () => {
        const [feedbacksRes, eligibilityRes] = await Promise.all([
            feedbackService.getFeedbacksByPartner(partnerId).catch(() => ({ data: [] })),
            feedbackService
                .getMyEligibilityForPartner(partnerId)
                .catch(() => ({ data: { eligible: false, message: '' } }))
        ]);
        const feedbacksData = Array.isArray(feedbacksRes.data) ? feedbacksRes.data : [];
        feedbacksData.sort((a, b) => {
            const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return db - da;
        });
        setFeedbacks(feedbacksData);
        setFeedbackEligibility(eligibilityRes.data || { eligible: false, message: '' });
    };

    const dayLabel = (day) => {
        const map = {
            MONDAY: 'Thứ 2',
            TUESDAY: 'Thứ 3',
            WEDNESDAY: 'Thứ 4',
            THURSDAY: 'Thứ 5',
            FRIDAY: 'Thứ 6',
            SATURDAY: 'Thứ 7',
            SUNDAY: 'Chủ nhật'
        };
        const normalized = day?.toUpperCase();
        return (normalized && map[normalized]) || day || '';
    };

    const mealTypeLabel = (type) => {
        const map = {
            BREAKFAST: 'Buổi sáng',
            Breakfast: 'Buổi sáng',
            LUNCH: 'Buổi trưa',
            Lunch: 'Buổi trưa',
            DINNER: 'Buổi chiều / tối',
            Dinner: 'Buổi chiều / tối',
            SNACK: 'Ăn nhẹ',
            Snack: 'Ăn nhẹ'
        };
        if (!type) return '';
        return map[type] || map[type.toUpperCase()] || type;
    };

    const formatLocalDate = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const formatFeedbackDateTime = (v) => {
        if (!v) return '';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleString('vi-VN');
    };

    const handleAddToCart = async (e, item) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setAddMessage('');
            setAddingMealId(item.id);
            await cartService.addToCart({
                menuItemId: item.id,
                orderDate: orderDate,
                withTray: true
            });
            setAddMessage('Đã thêm vào giỏ hàng');
            setToastType('success');
            window.dispatchEvent(new Event('bb-cart-updated'));
            window.setTimeout(() => setAddMessage(''), 2000);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                'Không thể thêm vào giỏ hàng. Vui lòng thử lại.';
            setAddMessage(msg);
            setToastType('error');
            window.setTimeout(() => setAddMessage(''), 2800);
        } finally {
            setAddingMealId(null);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!feedbackEligibility.eligible || feedbackBusy) return;

        const rating = Number(feedbackForm.rating);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            setFeedbackError('Vui lòng chọn điểm từ 1 đến 5 sao.');
            return;
        }

        const comment = (feedbackForm.comment || '').trim();
        if (!comment) {
            setFeedbackError('Vui lòng nhập nhận xét trước khi gửi.');
            return;
        }

        try {
            setFeedbackBusy(true);
            setFeedbackError('');
            setFeedbackNotice('');
            await feedbackService.createFeedback({
                partnerId,
                rating,
                comment
            });
            setFeedbackForm({ rating: 5, comment: '' });
            setFeedbackNotice('Cảm ơn bạn đã gửi đánh giá cho quán.');
            await reloadFeedbackSection();
        } catch (err) {
            setFeedbackError(
                err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.'
            );
        } finally {
            setFeedbackBusy(false);
        }
    };

    const groupedByDayAndMealType = useMemo(() => {
        const byDay = new Map();

        menus.forEach((menu) => {
            (menu.items || []).forEach((item) => {
                const dKey = (item.dayOfWeek || '').toUpperCase();
                const mKey = (item.mealType || '').toUpperCase();
                if (!dKey || !mKey) return;

                if (!byDay.has(dKey)) {
                    byDay.set(dKey, new Map());
                }
                const byMeal = byDay.get(dKey);
                if (!byMeal.has(mKey)) {
                    byMeal.set(mKey, []);
                }
                byMeal.get(mKey).push({
                    ...item,
                    menuId: menu.id,
                    weekStartDate: menu.weekStartDate
                });
            });
        });

        const orderDays = [
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
            'SUNDAY'
        ];
        const orderMeals = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

        return orderDays
            .filter((d) => byDay.has(d))
            .map((d) => {
                const byMeal = byDay.get(d);
                const periods = orderMeals
                    .filter((m) => byMeal.has(m))
                    .map((m) => ({
                        key: m,
                        label: mealTypeLabel(m),
                        items: byMeal.get(m),
                        Icon: MEAL_ICONS[m] || UtensilsCrossed
                    }));
                return {
                    key: d,
                    label: dayLabel(d),
                    periods
                };
            });
    }, [menus]);

    // Auto-select first day when data loads
    useEffect(() => {
        if (
            groupedByDayAndMealType.length > 0 &&
            (!selectedDayKey || !groupedByDayAndMealType.find((d) => d.key === selectedDayKey))
        ) {
            setSelectedDayKey(groupedByDayAndMealType[0].key);
        }
    }, [groupedByDayAndMealType, selectedDayKey]);

    const currentDay = groupedByDayAndMealType.find((d) => d.key === selectedDayKey);

    if (loading) {
        return (
            <div className="partner-meals-page partner-meals-loading bb-page-loading">
                <div className="bb-spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="partner-meals-page">
                <div className="partner-meals-error-card">
                    <p>{error}</p>
                    <Link to="/partners" className="partner-meals-back-btn">
                        <ArrowLeft size={18} />
                        Quay lại danh sách quán
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="partner-meals-page">
            {/* Partner Hero */}
            <div className="partner-meals-hero">
                <div className="partner-meals-hero-bg" />
                <div className="partner-meals-hero-inner">
                    <Link to="/partners" className="partner-meals-back-link">
                        <ArrowLeft size={18} />
                        <span>Quán ăn</span>
                    </Link>
                    <div className="partner-meals-hero-content">
                        {partner?.imageUrl ? (
                            <div className="partner-meals-hero-image">
                                <img src={partner.imageUrl} alt={partner.name} />
                            </div>
                        ) : (
                            <div className="partner-meals-hero-placeholder">
                                <UtensilsCrossed size={40} />
                            </div>
                        )}
                        <div className="partner-meals-hero-text">
                            <h1>{partner?.name}</h1>
                            {partner?.address && (
                                <p className="partner-meals-hero-address">
                                    <MapPin size={16} />
                                    {partner.address}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Order date & Cart CTA */}
            <div className="partner-meals-toolbar">
                <div className="partner-meals-date-wrap">
                    <label htmlFor="order-date">Ngày đặt bữa:</label>
                    <input
                        id="order-date"
                        type="date"
                        className="partner-meals-date-input"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                    />
                </div>
                <Link to="/cart" className="partner-meals-cart-cta">
                    <ShoppingCart size={20} />
                    <span>Xem giỏ hàng</span>
                </Link>
            </div>

            {/* Toast */}
            {addMessage && (
                <div
                    className={
                        'partner-meals-toast partner-meals-toast-' + toastType
                    }
                >
                    {addMessage}
                </div>
            )}

            <section className="partner-feedback-section">
                <div className="partner-feedback-head">
                    <h2>Đánh giá từ khách hàng</h2>
                    <p>
                        {feedbacks.length > 0
                            ? `${feedbacks.length} đánh giá cho quán ${partner?.name || ''}`
                            : 'Chưa có đánh giá nào cho quán này.'}
                    </p>
                </div>

                <div className="partner-feedback-layout">
                    <div className="partner-feedback-list-card">
                        {feedbacks.length === 0 ? (
                            <div className="partner-feedback-empty">
                                Hãy là người đầu tiên chia sẻ trải nghiệm của bạn.
                            </div>
                        ) : (
                            <div className="partner-feedback-list">
                                {feedbacks.slice(0, 8).map((fb) => (
                                    <article key={fb.id} className="partner-feedback-item">
                                        <div className="partner-feedback-item-head">
                                            <strong>{fb.customerName || 'Khách hàng'}</strong>
                                            <span>{formatFeedbackDateTime(fb.createdAt)}</span>
                                        </div>
                                        <div
                                            className="partner-feedback-stars"
                                            aria-label={`${fb.rating || 0} sao`}
                                        >
                                            {Array.from({ length: 5 }).map((_, idx) => (
                                                <Star
                                                    key={`${fb.id}-star-${idx}`}
                                                    size={16}
                                                    className={
                                                        idx < (fb.rating || 0) ? 'is-on' : 'is-off'
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <p>{fb.comment}</p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="partner-feedback-form-card">
                        <h3>Viết đánh giá</h3>
                        {!feedbackEligibility.eligible && (
                            <div className="partner-feedback-lock">
                                {feedbackEligibility.message ||
                                    'Bạn cần thanh toán thành công ít nhất 1 bữa ăn từ quán này để đánh giá.'}
                            </div>
                        )}
                        {feedbackEligibility.eligible && (
                            <form onSubmit={handleSubmitFeedback} className="partner-feedback-form">
                                <label htmlFor="feedback-rating">Điểm đánh giá</label>
                                <select
                                    id="feedback-rating"
                                    value={feedbackForm.rating}
                                    onChange={(e) =>
                                        setFeedbackForm((prev) => ({
                                            ...prev,
                                            rating: Number(e.target.value)
                                        }))
                                    }
                                    disabled={feedbackBusy}
                                >
                                    <option value={5}>5 sao - Rất hài lòng</option>
                                    <option value={4}>4 sao - Hài lòng</option>
                                    <option value={3}>3 sao - Bình thường</option>
                                    <option value={2}>2 sao - Chưa hài lòng</option>
                                    <option value={1}>1 sao - Không hài lòng</option>
                                </select>

                                <label htmlFor="feedback-comment">Nhận xét</label>
                                <textarea
                                    id="feedback-comment"
                                    rows={4}
                                    placeholder="Món ăn, đóng gói, đúng giờ, chất lượng phục vụ..."
                                    value={feedbackForm.comment}
                                    onChange={(e) =>
                                        setFeedbackForm((prev) => ({
                                            ...prev,
                                            comment: e.target.value
                                        }))
                                    }
                                    disabled={feedbackBusy}
                                />

                                {feedbackError && (
                                    <div className="partner-feedback-msg partner-feedback-msg-error">
                                        {feedbackError}
                                    </div>
                                )}
                                {feedbackNotice && (
                                    <div className="partner-feedback-msg partner-feedback-msg-ok">
                                        {feedbackNotice}
                                    </div>
                                )}

                                <button type="submit" disabled={feedbackBusy}>
                                    {feedbackBusy ? 'Đang gửi...' : 'Gửi đánh giá'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {groupedByDayAndMealType.length === 0 ? (
                <div className="partner-meals-empty">
                    <UtensilsCrossed size={48} strokeWidth={1.5} />
                    <h3>Chưa có thực đơn</h3>
                    <p>Quán {partner?.name} hiện chưa có thực đơn khả dụng.</p>
                    <Link to="/partners" className="partner-meals-back-btn">
                        Chọn quán khác
                    </Link>
                </div>
            ) : (
                <>
                    {/* Day tabs */}
                    <div className="partner-meals-day-tabs">
                        {groupedByDayAndMealType.map((day) => (
                            <button
                                key={day.key}
                                type="button"
                                className={
                                    'partner-meals-day-tab' +
                                    (selectedDayKey === day.key
                                        ? ' partner-meals-day-tab-active'
                                        : '')
                                }
                                onClick={() => setSelectedDayKey(day.key)}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>

                    {/* Meals by day */}
                    <div className="partner-meals-content">
                        {currentDay?.periods.map((period) => (
                            <section
                                key={period.key}
                                className="partner-meals-period"
                            >
                                <h2 className="partner-meals-period-title">
                                    <period.Icon size={20} />
                                    {period.label}
                                </h2>
                                <div className="partner-meals-grid">
                                    {period.items.map((item) => (
                                        <article
                                            key={`${item.menuId}-${item.id}`}
                                            className="partner-meal-card"
                                        >
                                            <div className="partner-meal-card-image">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.itemName}
                                                    />
                                                ) : (
                                                    <div className="partner-meal-card-placeholder">
                                                        <UtensilsCrossed
                                                            size={32}
                                                            strokeWidth={1.2}
                                                        />
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    className="partner-meal-add-btn"
                                                    onClick={(e) =>
                                                        handleAddToCart(e, item)
                                                    }
                                                    disabled={
                                                        addingMealId === item.id
                                                    }
                                                    aria-label="Thêm vào giỏ hàng"
                                                >
                                                    {addingMealId ===
                                                    item.id ? (
                                                        <span className="partner-meal-spinner" />
                                                    ) : (
                                                        <Plus size={20} />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="partner-meal-card-body">
                                                <h3 className="partner-meal-name">
                                                    {item.itemName}
                                                </h3>
                                                <span className="partner-meal-price">
                                                    {(
                                                        item.priceOriginal || 0
                                                    ).toLocaleString('vi-VN')}
                                                    ₫
                                                </span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PartnerMeals;
