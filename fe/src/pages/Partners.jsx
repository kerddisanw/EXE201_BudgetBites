import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Store, MapPin, Phone, ChevronRight } from 'lucide-react';
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

    useEffect(() => {
        try {
            const q = sessionStorage.getItem('bb_partner_search');
            if (q) {
                setSearch(q);
                sessionStorage.removeItem('bb_partner_search');
            }
        } catch {
            /* ignore */
        }
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
            <section className="partners-hero">
                <div className="partners-hero-inner">
                    <div className="partners-header">
                        <span className="partners-kicker">
                            <Store size={15} />
                            Đối tác BudgetBites
                        </span>
                        <h1>Chọn quán ăn đối tác</h1>
                        <p>
                            Khám phá các quán ăn chất lượng, giá sinh viên, giao đúng giờ cho lịch học
                            bận rộn.
                        </p>
                    </div>
                </div>
            </section>

            <div className="partners-toolbar">
                <div className="partners-search-wrap">
                    <Search size={18} />
                    <input
                        className="partners-search"
                        type="text"
                        placeholder="Tìm kiếm quán ăn hoặc mô tả..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    type="button"
                    className="partners-filter-btn"
                    onClick={() => setSearch('')}
                    disabled={!search}
                >
                    Xóa tìm kiếm
                </button>
            </div>

            <div className="partners-grid">
                {filteredPartners.length === 0 ? (
                    <div className="partners-empty">
                        <h3>Không tìm thấy quán phù hợp</h3>
                        <p>Thử từ khóa khác hoặc xóa tìm kiếm để xem tất cả đối tác.</p>
                    </div>
                ) : (
                    filteredPartners.map((partner) => (
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
                                        <span className="partner-badge">
                                            -{partner.discountRate}% khuyến mãi
                                        </span>
                                    )}
                                    <span className="partner-open-cta">
                                        Xem thực đơn <ChevronRight size={14} />
                                    </span>
                                </div>
                            )}
                            <div className="partner-card-body">
                                <div className="partner-name-row">
                                    <span className="partner-name">{partner.name}</span>
                                </div>
                                <div className="partner-meta">
                                    <MapPin size={14} />
                                    <span>{partner.address || 'TP.HCM'}</span>
                                </div>
                                {partner.phoneNumber && (
                                    <div className="partner-meta">
                                        <Phone size={14} />
                                        <span>{partner.phoneNumber}</span>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default Partners;

