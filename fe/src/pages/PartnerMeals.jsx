import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cartService, menuService, partnerService } from '../services/api';
import './Partners.css';

const PartnerMeals = () => {
    const { id } = useParams();
    const partnerId = Number(id);

    const [partner, setPartner] = useState(null);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMealKey, setSelectedMealKey] = useState(null);
    const [addingMealId, setAddingMealId] = useState(null);
    const [addMessage, setAddMessage] = useState('');

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
                const data = menusRes.data || [];
                setMenus(data);
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
                orderDate: formatLocalDate(new Date()),
                withTray: true
            });
            setAddMessage('Đã thêm vào giỏ hàng.');
            window.dispatchEvent(new Event('bb-cart-updated'));
            window.setTimeout(() => setAddMessage(''), 1600);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                'Không thể thêm vào giỏ hàng. Vui lòng thử lại.';
            setAddMessage(msg);
            window.setTimeout(() => setAddMessage(''), 2200);
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

        const orderDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
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
                        items: byMeal.get(m)
                    }));
                return {
                    key: d,
                    label: dayLabel(d),
                    periods
                };
            });
    }, [menus]);

    if (loading) {
        return (
            <div className="partners-page partners-page-loading bb-page-loading">
                <div className="bb-spinner" />
            </div>
        );
    }

    if (error) {
        return <div className="partners-page partners-page-error">{error}</div>;
    }

    return (
        <div className="partners-page">
            <div className="partners-header">
                <h1>Chọn lịch ăn uống</h1>
                <p>Thực đơn của {partner?.name} theo từng ngày và khung giờ.</p>
            </div>

            {addMessage ? <div className="cart-toast">{addMessage}</div> : null}

            {groupedByDayAndMealType.length === 0 ? (
                <div className="partners-placeholder">
                    Đối tác hiện chưa có thực đơn khả dụng.
                </div>
            ) : (
                <div className="meals-schedule">
                    {groupedByDayAndMealType.map((day) => (
                        <div key={day.key} className="meals-day">
                            <h2 className="meals-day-title">{day.label}</h2>
                            {day.periods.map((period) => (
                                <div key={period.key} className="meals-period">
                                    <h3 className="meals-period-title">{period.label}</h3>
                                    <div className="meals-row">
                                        {period.items.map((item) => {
                                            const mealKey = `${item.menuId}-${item.id}`;
                                            const isSelected = selectedMealKey === mealKey;
                                            return (
                                                <button
                                                    key={mealKey}
                                                    type="button"
                                                    className={
                                                        'meal-card' +
                                                        (isSelected ? ' meal-card-selected' : '')
                                                    }
                                                    onClick={() => setSelectedMealKey(mealKey)}
                                                >
                                                    {item.imageUrl && (
                                                        <div className="meal-image-wrapper">
                                                            <img src={item.imageUrl} alt={item.itemName} />
                                                        </div>
                                                    )}
                                                    <div className="meal-card-body">
                                                        <button
                                                            type="button"
                                                            className="meal-add-btn"
                                                            onClick={(e) => handleAddToCart(e, item)}
                                                            disabled={addingMealId === item.id}
                                                            aria-label="Thêm vào giỏ hàng"
                                                            title="Thêm vào giỏ hàng"
                                                        >
                                                            {addingMealId === item.id ? (
                                                                <span className="meal-add-spinner" />
                                                            ) : (
                                                                <svg
                                                                    width="18"
                                                                    height="18"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        d="M12 5v14M5 12h14"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2.5"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <div className="meal-header-row">
                                                            <span className="meal-name">
                                                                {item.itemName}
                                                            </span>
                                                            <span className="meal-price">
                                                                {item.priceOriginal?.toLocaleString(
                                                                    'vi-VN'
                                                                )}
                                                                ₫
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PartnerMeals;

