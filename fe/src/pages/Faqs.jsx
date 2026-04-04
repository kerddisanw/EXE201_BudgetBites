import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, MessageCircle, Search } from 'lucide-react';
import './Faqs.css';

const CATEGORIES = [
    { id: 'all', label: 'Tất cả' },
    { id: 'general', label: 'Chung' },
    { id: 'payment', label: 'Thanh toán' },
    { id: 'orders', label: 'Đơn hàng & giao' },
    { id: 'vip', label: 'VIP & tích điểm' }
];

const FAQ_ITEMS = [
    {
        id: 1,
        category: 'general',
        question: 'BudgetBites là gì?',
        answer:
            'BudgetBites là nền tảng đặt bữa ăn trực tuyến dành cho sinh viên, kết nối bạn với các quán ăn địa phương chất lượng, giúp bạn lên kế hoạch bữa ăn cho cả tuần với giá cả hợp lý và tiện lợi.'
    },
    {
        id: 2,
        category: 'general',
        question: 'BudgetBites hoạt động trong khung giờ nào?',
        answer:
            'Chúng tôi phục vụ 2 bữa chính hàng ngày: bữa trưa (11:00 - 13:00) và bữa tối (17:00 - 19:00) từ Thứ 2 đến Thứ 6. Bạn có thể đặt trước bữa ăn cho cả tuần.'
    },
    {
        id: 3,
        category: 'payment',
        question: 'Tôi có thể thanh toán bằng tiền mặt không?',
        answer:
            'Hiện tại BudgetBites hỗ trợ thanh toán online qua thẻ ATM/visa, chuyển khoản ngân hàng, và các ví điện tử như MoMo, ZaloPay, ShopeePay. Điều này giúp việc thanh toán nhanh chóng và an toàn hơn.'
    },
    {
        id: 4,
        category: 'payment',
        question: 'Tôi có thể thanh toán bằng MoMo, ZaloPay, ShopeePay không?',
        answer:
            'Có. Bạn chỉ cần liên kết ví điện tử với tài khoản của mình trong phần Tài khoản > Liên kết thanh toán là có thể sử dụng ngay.'
    },
    {
        id: 5,
        category: 'orders',
        question: 'Làm sao tôi có thể biết tiến trình bữa ăn hiện tại của mình?',
        answer:
            'Bạn có thể theo dõi tiến trình đơn hàng trong phần "Theo dõi đơn hàng". Từ lúc đơn được xác nhận, đang chuẩn bị, shipper đang giao, và sắp đến nơi, tất cả đều được cập nhật theo thời gian thực.'
    },
    {
        id: 6,
        category: 'orders',
        question: 'Chi phí giao đồ ăn sẽ được tính như thế nào?',
        answer:
            'Phí giao hàng được minh bạch theo từng đơn hàng. Đối với thành viên VIP, đôi với một số khu vực gần trường học, phí giao hàng đang dao động từ 5.000đ - 15.000đ tuỳ theo khoảng cách. Đơn hàng đặt theo tuần được giảm 50% phí ship.'
    },
    {
        id: 7,
        category: 'orders',
        question: 'Làm sao để tôi trả lại khay đồ ăn?',
        answer:
            'Bạn có thể hoàn trả khay tại các điểm thu hồi khay ở ký túc xá hoặc quầy thu gom tại trường. Trong tương lai, BudgetBites sẽ triển khai thu hồi khay trực tiếp khi giao đơn mới.'
    },
    {
        id: 8,
        category: 'general',
        question: 'Những nhà hàng nào, quán ăn nào tôi sẽ được đặt qua BudgetBites?',
        answer:
            'BudgetBites hợp tác với hơn 50 quán ăn địa phương được lựa chọn kỹ càng quanh các khu vực trường học, bao gồm Phở Gia Truyền, Cơm Tấm Sài Gòn, Bún Chả Hà Nội, Bánh Mì Hội An và nhiều quán khác. Tất cả đều được kiểm duyệt kỹ về chất lượng.'
    },
    {
        id: 9,
        category: 'vip',
        question: 'BudgetBites VIP là gì?',
        answer:
            'BudgetBites VIP là gói thành viên cao cấp với nhiều quyền lợi: miễn phí giao hàng, ưu tiên giao nhanh, tích điểm x2, voucher độc quyền hàng tháng và hỗ trợ khách hàng ưu tiên. Chỉ 30.000đ/tháng!'
    },
    {
        id: 10,
        category: 'vip',
        question: 'Làm sao để tích điểm và đổi quà?',
        answer:
            'Mỗi đơn hàng bạn đặt sẽ được tích điểm (1.000đ = 1 điểm, thành viên VIP x2). Điểm có thể đổi thành voucher giảm giá hoặc bữa ăn miễn phí trong phần Tài khoản > Điểm tích luỹ.'
    }
];

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

const Faqs = () => {
    const [openId, setOpenId] = useState(FAQ_ITEMS[0].id);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    const filtered = useMemo(() => {
        const q = normalize(search.trim());
        return FAQ_ITEMS.filter((item) => {
            if (category !== 'all' && item.category !== category) return false;
            if (!q) return true;
            const hay = normalize(`${item.question} ${item.answer}`);
            return hay.includes(q);
        });
    }, [search, category]);

    useEffect(() => {
        setOpenId((current) =>
            filtered.some((i) => i.id === current) ? current : filtered[0]?.id ?? null
        );
    }, [filtered]);

    const toggle = (id) => {
        setOpenId((current) => (current === id ? null : id));
    };

    return (
        <div className="faqs-page">
            <section className="faqs-hero" aria-labelledby="faqs-title">
                <div className="faqs-hero-inner">
                    <span className="faqs-hero-badge" aria-hidden>
                        <HelpCircle size={18} strokeWidth={2} />
                        Trợ giúp
                    </span>
                    <h1 id="faqs-title">Câu hỏi thường gặp</h1>
                    <p className="faqs-hero-lead">
                        Tìm nhanh câu trả lời về đặt món, thanh toán, giao hàng và gói VIP.
                    </p>
                </div>
            </section>

            <div className="faqs-body">
                <div className="faqs-inner">
                    <div className="faqs-toolbar">
                        <label className="faqs-search" htmlFor="faqs-search-input">
                            <Search size={18} className="faqs-search-icon" aria-hidden />
                            <input
                                id="faqs-search-input"
                                type="search"
                                placeholder="Tìm theo từ khóa…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoComplete="off"
                            />
                        </label>
                        <div className="faqs-chips" role="tablist" aria-label="Lọc theo chủ đề">
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={category === c.id}
                                    className={`faqs-chip${category === c.id ? ' faqs-chip-active' : ''}`}
                                    onClick={() => setCategory(c.id)}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <p className="faqs-empty">
                            Không có câu hỏi phù hợp. Thử từ khóa khác hoặc chọn &quot;Tất cả&quot;.
                        </p>
                    ) : (
                        <ul className="faqs-list">
                            {filtered.map((item) => {
                                const isOpen = item.id === openId;
                                const panelId = `faq-panel-${item.id}`;
                                return (
                                    <li key={item.id} className="faqs-list-item">
                                        <div
                                            className={`faq-card${isOpen ? ' faq-card-open' : ''}`}
                                        >
                                            <button
                                                type="button"
                                                id={`faq-trigger-${item.id}`}
                                                className="faq-question"
                                                aria-expanded={isOpen}
                                                aria-controls={panelId}
                                                onClick={() => toggle(item.id)}
                                            >
                                                <span className="faq-question-text">
                                                    {item.question}
                                                </span>
                                                <ChevronDown
                                                    size={20}
                                                    strokeWidth={2}
                                                    className={`faq-chevron${isOpen ? ' faq-chevron-open' : ''}`}
                                                    aria-hidden
                                                />
                                            </button>
                                            <div
                                                id={panelId}
                                                role="region"
                                                aria-labelledby={`faq-trigger-${item.id}`}
                                                className={`faq-answer-shell${isOpen ? ' faq-answer-shell-open' : ''}`}
                                            >
                                                <div className="faq-answer-measure">
                                                    <p className="faq-answer">{item.answer}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <aside className="faqs-cta">
                        <div className="faqs-cta-icon" aria-hidden>
                            <MessageCircle size={22} strokeWidth={2} />
                        </div>
                        <div className="faqs-cta-text">
                            <strong>Chưa giải đáp được thắc mắc?</strong>
                            <span>Đội ngũ hỗ trợ sẵn sàng trả lời bạn.</span>
                        </div>
                        <Link to="/support" className="faqs-cta-link">
                            Liên hệ hỗ trợ
                        </Link>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Faqs;
