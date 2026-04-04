import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    Headphones,
    Loader2,
    Mail,
    Phone,
    Send
} from 'lucide-react';
import AuthFooter from '../components/AuthFooter';
import './Support.css';

const CONTACTS = [
    {
        id: 'email',
        title: 'Email',
        value: 'support@budgetbites.vn',
        href: 'mailto:support@budgetbites.vn',
        icon: Mail
    },
    {
        id: 'hotline',
        title: 'Hotline',
        value: '1900 1234 (8:00 - 22:00)',
        href: 'tel:19001234',
        icon: Phone
    }
];

const Support = () => {
    const [form, setForm] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        address: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        // Placeholder: In a real app we would POST this data to a support endpoint.
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
        }, 800);
    };

    return (
        <>
            <div className="support-page">
                <section className="support-hero" aria-labelledby="support-title">
                    <div className="support-hero-inner">
                        <span className="support-hero-badge" aria-hidden>
                            <Headphones size={18} strokeWidth={2} />
                            Hỗ trợ khách hàng
                        </span>
                        <h1 id="support-title">Chúng tôi có thể giúp gì cho bạn?</h1>
                        <p className="support-hero-lead">
                            Gửi yêu cầu qua biểu mẫu hoặc liên hệ trực tiếp — đội ngũ BudgetBites
                            luôn sẵn sàng đồng hành cùng bạn.
                        </p>
                    </div>
                </section>

                <div className="support-body">
                    <div className="support-inner">
                        <div className="support-layout">
                            <aside className="support-aside" aria-label="Kênh liên hệ">
                                <div className="support-aside-intro">
                                    <Clock size={20} strokeWidth={2} className="support-aside-intro-icon" />
                                    <p>
                                        <strong>Thời gian phản hồi</strong>
                                        <span>Chúng tôi trả lời yêu cầu qua form trong vòng 24 giờ làm việc.</span>
                                    </p>
                                </div>

                                <ul className="support-contact-list">
                                    {CONTACTS.map((c) => {
                                        const Icon = c.icon;
                                        return (
                                            <li key={c.id}>
                                                <a href={c.href} className="support-contact-tile">
                                                    <span className="support-contact-icon" aria-hidden>
                                                        <Icon size={20} strokeWidth={2} />
                                                    </span>
                                                    <span className="support-contact-body">
                                                        <span className="support-contact-label">{c.title}</span>
                                                        <span className="support-contact-value">{c.value}</span>
                                                    </span>
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <Link to="/faqs" className="support-faq-link">
                                    <span>Xem câu hỏi thường gặp</span>
                                    <ArrowRight size={18} strokeWidth={2} aria-hidden />
                                </Link>
                            </aside>

                            <div className="support-form-panel">
                                <div className="support-form-card">
                                    <h2 className="support-form-heading">Gửi yêu cầu hỗ trợ</h2>
                                    <p className="support-form-hint">
                                        Vui lòng điền thông tin chính xác để chúng tôi hỗ trợ nhanh hơn.
                                    </p>

                                    {submitted ? (
                                        <div className="support-success-block" role="status">
                                            <CheckCircle2
                                                size={40}
                                                strokeWidth={2}
                                                className="support-success-icon"
                                                aria-hidden
                                            />
                                            <h3 className="support-success-title">Đã ghi nhận yêu cầu</h3>
                                            <p className="support-success-text">
                                                Cảm ơn bạn! Chúng tôi sẽ liên hệ qua email hoặc điện thoại trong
                                                thời gian sớm nhất.
                                            </p>
                                            <button
                                                type="button"
                                                className="support-reset-btn"
                                                onClick={() => {
                                                    setSubmitted(false);
                                                    setForm({
                                                        fullName: '',
                                                        phoneNumber: '',
                                                        email: '',
                                                        address: '',
                                                        message: ''
                                                    });
                                                }}
                                            >
                                                Gửi yêu cầu khác
                                            </button>
                                        </div>
                                    ) : (
                                        <form className="support-form" onSubmit={handleSubmit} noValidate>
                                            <div className="support-grid">
                                                <div className="support-field">
                                                    <label htmlFor="support-fullName">Họ và tên</label>
                                                    <input
                                                        id="support-fullName"
                                                        type="text"
                                                        name="fullName"
                                                        value={form.fullName}
                                                        onChange={handleChange}
                                                        placeholder="Nguyễn Văn A"
                                                        required
                                                        autoComplete="name"
                                                    />
                                                </div>
                                                <div className="support-field">
                                                    <label htmlFor="support-phone">Số điện thoại</label>
                                                    <input
                                                        id="support-phone"
                                                        type="tel"
                                                        name="phoneNumber"
                                                        value={form.phoneNumber}
                                                        onChange={handleChange}
                                                        placeholder="0912345678"
                                                        autoComplete="tel"
                                                    />
                                                </div>
                                            </div>
                                            <div className="support-field">
                                                <label htmlFor="support-email">Email</label>
                                                <input
                                                    id="support-email"
                                                    type="email"
                                                    name="email"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    placeholder="example@email.com"
                                                    required
                                                    autoComplete="email"
                                                />
                                            </div>
                                            <div className="support-field">
                                                <label htmlFor="support-address">Địa chỉ</label>
                                                <input
                                                    id="support-address"
                                                    type="text"
                                                    name="address"
                                                    value={form.address}
                                                    onChange={handleChange}
                                                    placeholder="Ký túc xá, tòa nhà, hoặc khu vực giao hàng"
                                                    autoComplete="street-address"
                                                />
                                            </div>
                                            <div className="support-field">
                                                <label htmlFor="support-message">Nội dung</label>
                                                <textarea
                                                    id="support-message"
                                                    name="message"
                                                    rows={5}
                                                    value={form.message}
                                                    onChange={handleChange}
                                                    placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn…"
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="support-submit" disabled={submitting}>
                                                {submitting ? (
                                                    <>
                                                        <Loader2 size={20} className="support-submit-spinner" />
                                                        Đang gửi…
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={18} strokeWidth={2} aria-hidden />
                                                        Gửi yêu cầu
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AuthFooter />
        </>
    );
};

export default Support;
