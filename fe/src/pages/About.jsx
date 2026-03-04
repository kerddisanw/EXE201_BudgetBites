import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <section className="about-hero">
                <div className="about-hero-inner">
                    <h1>Về BudgetBites</h1>
                    <p>
                        Nền tảng đặt bữa ăn dành cho sinh viên, kết nối bạn với những quán ăn chất
                        lượng.
                    </p>
                </div>
            </section>

            <section className="about-section">
                <div className="about-section-inner">
                    <h2>Câu chuyện của chúng tôi</h2>
                    <p>
                        BudgetBites được thành lập với mong muốn giải quyết vấn đề ăn uống hàng
                        ngày của sinh viên. Chúng tôi hiểu rằng việc tìm kiếm bữa ăn ngon, giá cả
                        phải chăng và tiện lợi là một thách thức đối với nhiều bạn sinh viên, đặc
                        biệt là những bạn ở xa nhà.
                    </p>
                    <p>
                        Vậy thì phải làm gì? Với BudgetBites, bạn có thể lên kế hoạch ăn uống cho
                        cả tuần một cách dễ dàng. Chúng tôi hợp tác với các quán ăn địa phương chất
                        lượng, đảm bảo bữa ăn đều được chuẩn bị tươi ngon và giao đúng giờ.
                    </p>
                    <p>
                        Với hơn 50 quán ăn đối tác và phục vụ hàng nghìn bữa ăn mỗi ngày, BudgetBites
                        tự hào là người bạn đồng hành đáng tin cậy trong hành trình học tập của các
                        bạn sinh viên.
                    </p>
                </div>
            </section>

            <section className="about-section about-section-alt">
                <div className="about-section-inner">
                    <h2>Giá trị cốt lõi</h2>
                    <p className="about-subtitle">
                        Những giá trị định hướng hoạt động của chúng tôi.
                    </p>
                    <div className="about-values-grid">
                        <div className="about-value-card">
                            <div className="about-value-header">
                                <span className="about-value-icon">
                                    {/* community icon */}
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle cx="9" cy="8" r="3.2" stroke="white" strokeWidth="1.6" />
                                        <circle cx="17" cy="9.5" r="2.6" stroke="white" strokeWidth="1.6" />
                                        <path
                                            d="M4.5 17.5C4.9 14.8 6.7 13 9 13C11.3 13 13.1 14.8 13.5 17.5"
                                            stroke="white"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M14.5 17.5C14.8 15.6 15.9 14.4 17.4 14.4C18.9 14.4 20 15.6 20.3 17.5"
                                            stroke="white"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                                <h3>Cộng đồng sinh viên</h3>
                            </div>
                            <p>
                                Thấu hiểu nhu cầu và khó khăn của sinh viên trong việc tiết kiệm bữa
                                ăn nhưng vẫn đảm bảo chất lượng và trải nghiệm tốt.
                            </p>
                        </div>
                        <div className="about-value-card">
                            <div className="about-value-header">
                                <span className="about-value-icon">
                                    {/* target/mission icon */}
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle cx="12" cy="12" r="6.5" stroke="white" strokeWidth="1.6" />
                                        <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.6" />
                                        <path
                                            d="M12 2V5"
                                            stroke="white"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M20 12H17"
                                            stroke="white"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                                <h3>Sứ mệnh</h3>
                            </div>
                            <p>
                                Kết nối sinh viên với các quán ăn địa phương, tạo ra giải pháp ăn
                                uống tiện lợi và tiết kiệm.
                            </p>
                        </div>
                        <div className="about-value-card">
                            <div className="about-value-header">
                                <span className="about-value-icon">
                                    {/* responsibility/check icon */}
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect
                                            x="4"
                                            y="4"
                                            width="16"
                                            height="16"
                                            rx="3"
                                            stroke="white"
                                            strokeWidth="1.6"
                                        />
                                        <path
                                            d="M8 12.5L10.5 15L16 9.5"
                                            stroke="white"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                                <h3>Trách nhiệm</h3>
                            </div>
                            <p>
                                Cam kết về chất lượng, vệ sinh an toàn thực phẩm và sự tin tưởng mà
                                khách hàng dành cho chúng tôi.
                            </p>
                        </div>
                        <div className="about-value-card">
                            <div className="about-value-header">
                                <span className="about-value-icon">
                                    {/* star/trust icon */}
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M12 4.5L13.9 8.3L18.1 8.9L15.05 11.8L15.8 15.9L12 13.9L8.2 15.9L8.95 11.8L5.9 8.9L10.1 8.3L12 4.5Z"
                                            stroke="white"
                                            strokeWidth="1.6"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                                <h3>Uy tín</h3>
                            </div>
                            <p>
                                Đồng hành lâu dài cùng các đối tác và sinh viên, không ngừng cải
                                thiện để phục vụ tốt hơn mỗi ngày.
                            </p>
                        </div>
                    </div>

                    <div className="about-stats">
                        <div className="about-stat">
                            <span className="about-stat-number">50+</span>
                            <span className="about-stat-label">Quán ăn đối tác</span>
                        </div>
                        <div className="about-stat">
                            <span className="about-stat-number">5000+</span>
                            <span className="about-stat-label">Sinh viên tin dùng</span>
                        </div>
                        <div className="about-stat">
                            <span className="about-stat-number">10000+</span>
                            <span className="about-stat-label">Bữa ăn mỗi tuần</span>
                        </div>
                        <div className="about-stat">
                            <span className="about-stat-number">4.8/5</span>
                            <span className="about-stat-label">Đánh giá trung bình</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;

