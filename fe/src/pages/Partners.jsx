import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { partnerService } from '../services/api';
import './Partners.css';

const Partners = () => {
    const [partners, setPartners] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await partnerService.getAllPartners();
                setPartners(res.data || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        'Không thể tải danh sách đối tác. Vui lòng thử lại.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    const handlePartnerClick = (id) => {
        navigate(`/partners/${id}`);
    };

    const filteredPartners = partners.filter((p) => {
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        return (
            p.name?.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term)
        );
    });

    if (loading) {
        return <div className="partners-page partners-page-loading">Đang tải đối tác...</div>;
    }

    if (error) {
        return <div className="partners-page partners-page-error">{error}</div>;
    }

    return (
        <div className="partners-page">
            <div className="partners-steps">
                <div className="partners-step partners-step-active">
                    <span className="partners-step-number">1</span>
                    <span className="partners-step-label">Chọn quán ăn đối tác</span>
                </div>
                <div className="partners-step">
                    <span className="partners-step-number">2</span>
                    <span className="partners-step-label">Chọn bữa ăn</span>
                </div>
                <div className="partners-step">
                    <span className="partners-step-number">3</span>
                    <span className="partners-step-label">Thanh toán</span>
                </div>
                <div className="partners-step">
                    <span className="partners-step-number">4</span>
                    <span className="partners-step-label">Hoàn tất đặt bữa ăn</span>
                </div>
            </div>

            <div className="partners-header">
                <h1>Chọn quán ăn đối tác</h1>
            </div>

            <div className="partners-toolbar">
                <input
                    className="partners-search"
                    type="text"
                    placeholder="Tìm kiếm quán ăn, món ăn..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="button" className="partners-filter-btn">
                    Bộ lọc
                </button>
            </div>

            <div className="partners-grid">
                {filteredPartners.map((partner) => (
                    <button
                        key={partner.id}
                        className="partner-card partner-card-simple"
                        type="button"
                        onClick={() => handlePartnerClick(partner.id)}
                    >
                        {partner.imageUrl && (
                            <div className="partner-image-wrapper">
                                <img src={partner.imageUrl} alt={partner.name} />
                                {partner.discountRate > 0 && (
                                    <span className="partner-badge">Khuyến mãi</span>
                                )}
                            </div>
                        )}
                        <div className="partner-card-body">
                            <div className="partner-name-row">
                                <span className="partner-name">{partner.name}</span>
                            </div>
                            <div className="partner-meta">
                                <span>{partner.address}</span>
                                {partner.phoneNumber && (
                                    <>
                                        <span className="partner-dot">•</span>
                                        <span>{partner.phoneNumber}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Partners;

