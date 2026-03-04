import React, { useState } from 'react';
import AuthFooter from '../components/AuthFooter';
import './Support.css';

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
                <div className="support-hero">
                    <div className="support-overlay" />
                    <div className="support-content">
                        <div className="support-card">
                            <h1>Tôi có thể giúp gì cho bạn?</h1>
                            <p className="support-subtitle">
                                Đội ngũ hỗ trợ của BudgetBites luôn sẵn sàng lắng nghe và đồng hành
                                cùng bạn.
                            </p>

                            <form className="support-form" onSubmit={handleSubmit}>
                                <div className="support-grid">
                                    <div className="support-field">
                                        <label>Họ và tên</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            placeholder="Nguyễn Văn A"
                                            required
                                        />
                                    </div>
                                    <div className="support-field">
                                        <label>Số điện thoại</label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={form.phoneNumber}
                                            onChange={handleChange}
                                            placeholder="0912345678"
                                        />
                                    </div>
                                </div>
                                <div className="support-field">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="example@email.com"
                                        required
                                    />
                                </div>
                                <div className="support-field">
                                    <label>Địa chỉ</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Ký túc xá hoặc tòa nhà ký hiệu"
                                    />
                                </div>
                                <div className="support-field">
                                    <label>Nội dung</label>
                                    <textarea
                                        name="message"
                                        rows="4"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="Mô tả vấn đề bạn cần hỗ trợ..."
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={submitting}>
                                    {submitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
                                </button>
                                {submitted && (
                                    <p className="support-success">
                                        Cảm ơn bạn! Yêu cầu của bạn đã được ghi nhận. Chúng tôi sẽ
                                        liên hệ trong thời gian sớm nhất.
                                    </p>
                                )}
                            </form>
                        </div>

                        <div className="support-contact-row">
                            <div className="support-contact-card">
                                <h3>Email</h3>
                                <p>support@budgetbites.vn</p>
                            </div>
                            <div className="support-contact-card">
                                <h3>Hotline</h3>
                                <p>1900 1234 (8:00 - 22:00)</p>
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

