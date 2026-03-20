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
    MapPin
} from 'lucide-react';
import { cartService, menuService, partnerService } from '../services/api';
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
