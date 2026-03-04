import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { partnerService } from '../services/api';
import './Partners.css';

const Partners = () => {
    const [partners, setPartners] = useState([]);
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

    if (loading) {
        return <div className="partners-page partners-page-loading">Đang tải đối tác...</div>;
    }

    if (error) {
        return <div className="partners-page partners-page-error">{error}</div>;
    }

    return (
        <div className="partners-page">
            <div className="partners-header">
                <h1>Đối tác của BudgetBites</h1>
                <p>
                    Các quán ăn và nhà hàng hợp tác mang đến bữa ăn sinh viên chất lượng, tiện lợi
                    với giá phải chăng.
                </p>
            </div>

            <div className="partners-grid">
                {partners.map((partner) => (
                    <button
                        key={partner.id}
                        className="partner-card"
                        type="button"
                        onClick={() => handlePartnerClick(partner.id)}
                    >
                        <div className="partner-name-row">
                            <span className="partner-name">{partner.name}</span>
                            {partner.active && (
                                <span className="partner-status-badge">Đang hoạt động</span>
                            )}
                        </div>
                        <p className="partner-description">{partner.description}</p>
                        <div className="partner-meta">
                            <span>{partner.address}</span>
                            {partner.phoneNumber && (
                                <span className="partner-dot">•</span>
                            )}
                            {partner.phoneNumber && <span>{partner.phoneNumber}</span>}
                        </div>
                        {partner.email && (
                            <p className="partner-email">{partner.email}</p>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Partners;

