import React, { useState } from 'react';
import './Faqs.css';

const FAQ_ITEMS = [
    {
        id: 1,
        question: 'BudgetBites là gì?',
        answer:
            'BudgetBites là nền tảng đặt bữa ăn trực tuyến dành cho sinh viên, kết nối bạn với các quán ăn địa phương chất lượng, giúp bạn lên kế hoạch bữa ăn cho cả tuần với giá cả hợp lý và tiện lợi.'
    },
    {
        id: 2,
        question: 'BudgetBites hoạt động trong khung giờ nào?',
        answer:
            'Chúng tôi phục vụ 2 bữa chính hàng ngày: bữa trưa (11:00 - 13:00) và bữa tối (17:00 - 19:00) từ Thứ 2 đến Thứ 6. Bạn có thể đặt trước bữa ăn cho cả tuần.'
    },
    {
        id: 3,
        question: 'Tôi có thể thanh toán bằng tiền mặt không?',
        answer:
            'Hiện tại BudgetBites hỗ trợ thanh toán online qua thẻ ATM/visa, chuyển khoản ngân hàng, và các ví điện tử như MoMo, ZaloPay, ShopeePay. Điều này giúp việc thanh toán nhanh chóng và an toàn hơn.'
    },
    {
        id: 4,
        question: 'Tôi có thể thanh toán bằng MoMo, ZaloPay, ShopeePay không?',
        answer:
            'Có. Bạn chỉ cần liên kết ví điện tử với tài khoản của mình trong phần Tài khoản > Liên kết thanh toán là có thể sử dụng ngay.'
    },
    {
        id: 5,
        question: 'Làm sao tôi có thể biết tiến trình bữa ăn hiện tại của mình?',
        answer:
            'Bạn có thể theo dõi tiến trình đơn hàng trong phần "Theo dõi đơn hàng". Từ lúc đơn được xác nhận, đang chuẩn bị, shipper đang giao, và sắp đến nơi, tất cả đều được cập nhật theo thời gian thực.'
    },
    {
        id: 6,
        question: 'Chi phí giao đồ ăn sẽ được tính như thế nào?',
        answer:
            'Phí giao hàng được minh bạch theo từng đơn hàng. Đối với thành viên VIP, đôi với một số khu vực gần trường học, phí giao hàng đang dao động từ 5.000đ - 15.000đ tuỳ theo khoảng cách. Đơn hàng đặt theo tuần được giảm 50% phí ship.'
    },
    {
        id: 7,
        question: 'Làm sao để tôi trả lại khay đồ ăn?',
        answer:
            'Bạn có thể hoàn trả khay tại các điểm thu hồi khay ở ký túc xá hoặc quầy thu gom tại trường. Trong tương lai, BudgetBites sẽ triển khai thu hồi khay trực tiếp khi giao đơn mới.'
    },
    {
        id: 8,
        question: 'Những nhà hàng nào, quán ăn nào tôi sẽ được đặt qua BudgetBites?',
        answer:
            'BudgetBites hợp tác với hơn 50 quán ăn địa phương được lựa chọn kỹ càng quanh các khu vực trường học, bao gồm Phở Gia Truyền, Cơm Tấm Sài Gòn, Bún Chả Hà Nội, Bánh Mì Hội An và nhiều quán khác. Tất cả đều được kiểm duyệt kỹ về chất lượng.'
    },
    {
        id: 9,
        question: 'BudgetBites VIP là gì?',
        answer:
            'BudgetBites VIP là gói thành viên cao cấp với nhiều quyền lợi: miễn phí giao hàng, ưu tiên giao nhanh, tích điểm x2, voucher độc quyền hàng tháng và hỗ trợ khách hàng ưu tiên. Chỉ 30.000đ/tháng!'
    },
    {
        id: 10,
        question: 'Làm sao để tích điểm và đổi quà?',
        answer:
            'Mỗi đơn hàng bạn đặt sẽ được tích điểm (1.000đ = 1 điểm, thành viên VIP x2). Điểm có thể đổi thành voucher giảm giá hoặc bữa ăn miễn phí trong phần Tài khoản > Điểm tích luỹ.'
    }
];

const Faqs = () => {
    const [openId, setOpenId] = useState(FAQ_ITEMS[0].id);

    const toggle = (id) => {
        setOpenId((current) => (current === id ? null : id));
    };

    return (
        <div className="faqs-page">
            <div className="faqs-header">
                <h1>Câu hỏi thường gặp</h1>
                <p>Tìm câu trả lời cho những thắc mắc của bạn</p>
            </div>

            <div className="faqs-list">
                {FAQ_ITEMS.map((item) => {
                    const isOpen = item.id === openId;
                    return (
                        <div
                            key={item.id}
                            className={`faq-item${isOpen ? ' faq-item-open' : ''}`}
                        >
                            <button
                                type="button"
                                className="faq-question"
                                onClick={() => toggle(item.id)}
                            >
                                <span>{item.question}</span>
                                <span className={`faq-icon${isOpen ? ' faq-icon-open' : ''}`}>
                                    ▾
                                </span>
                            </button>
                            <div className={`faq-answer${isOpen ? ' faq-answer-open' : ''}`}>
                                {item.answer}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Faqs;

