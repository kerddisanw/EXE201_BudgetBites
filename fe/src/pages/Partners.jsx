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
                const list = Array.isArray(res.data) ? res.data : [];
                setPartners(list);
                if (!Array.isArray(res.data)) {
                    setError('Dữ liệu đối tác không hợp lệ. Vui lòng thử lại.');
                }
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

    const partnersList = Array.isArray(partners) ? partners : [];
    const filteredPartners = partnersList
        .filter((p) => p.active === true)
        .filter((p) => {
            if (!search.trim()) return true;
            const term = search.toLowerCase();
            return (
                p.name?.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term)
            );
        });

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

