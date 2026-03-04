import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { menuService, partnerService } from '../services/api';
import './Partners.css';

const PartnerMeals = () => {
    const { id } = useParams();
    const partnerId = Number(id);

    const [partner, setPartner] = useState(null);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [partnerRes, menusRes] = await Promise.all([
                    partnerService.getPartnerById(partnerId),
                    menuService.getAllMenus()
                ]);

                if (!isMounted) return;

                setPartner(partnerRes.data);
                const allMenus = menusRes.data || [];
                const filteredMenus = allMenus.filter(
                    (m) => m.partnerId === partnerId || m.partnerName === partnerRes.data.name
                );
                setMenus(filteredMenus);
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

    const allItems = useMemo(
        () =>
            menus.flatMap((menu) =>
                (menu.items || []).map((item) => ({
                    ...item,
                    dayOfWeek: item.dayOfWeek,
                    mealType: item.mealType,
                    menuId: menu.id,
                    weekStartDate: menu.weekStartDate
                }))
            ),
        [menus]
    );

    if (loading) {
        return <div className="partners-page partners-page-loading">Đang tải thực đơn...</div>;
    }

    if (error) {
        return <div className="partners-page partners-page-error">{error}</div>;
    }

    return (
        <div className="partners-page">
            <div className="partners-header">
                <h1>Thực đơn của {partner?.name}</h1>
                <p>
                    Các bữa ăn được cung cấp bởi đối tác trong từng ngày và khung giờ. Giá có thể
                    thay đổi tuỳ chương trình khuyến mãi.
                </p>
            </div>

            {allItems.length === 0 ? (
                <div className="partners-placeholder">
                    Đối tác hiện chưa có thực đơn khả dụng.
                </div>
            ) : (
                <div className="meals-grid">
                    {allItems.map((item) => (
                        <div key={`${item.menuId}-${item.id}`} className="meal-card">
                            <div className="meal-header-row">
                                <span className="meal-name">{item.itemName}</span>
                                <span className="meal-price">
                                    {item.priceOriginal?.toLocaleString('vi-VN')}₫
                                </span>
                            </div>
                            <p className="meal-meta">
                                <span>{item.dayOfWeek}</span>
                                <span className="partner-dot">•</span>
                                <span>{item.mealType}</span>
                                {item.calories && (
                                    <>
                                        <span className="partner-dot">•</span>
                                        <span>{item.calories} kcal</span>
                                    </>
                                )}
                            </p>
                            {item.imageUrl && (
                                <div className="meal-image-wrapper">
                                    <img src={item.imageUrl} alt={item.itemName} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PartnerMeals;

