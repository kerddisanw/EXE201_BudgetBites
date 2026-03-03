import React from 'react';
import './AuthFooter.css';

const AuthFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="auth-footer">
            <div className="auth-footer-top">
                <div className="auth-footer-follow">
                    <p className="auth-footer-label">Theo dõi chúng tôi tại</p>
                    <p className="auth-footer-social-main">
                        FACEBOOK
                        <br />
                        INSTAGRAM
                    </p>
                    <p className="auth-footer-handle">@BudgetBitesofficialVN</p>
                </div>

                <div className="auth-footer-contact">
                    <p className="auth-footer-heading">Liên hệ</p>
                    <p>Email: BudgetBitesVN@gmail.com</p>
                    <p>Điện thoại: 0913569066</p>
                    <p>Địa chỉ: 14.5 Nam Thiên, Phường Tân Phú, Thành Phố Hồ Chí Minh</p>
                </div>

                <div className="auth-footer-partner">
                    <p className="auth-footer-heading">Đối tác</p>
                    <p>Coming soon</p>
                </div>
            </div>
            <div className="auth-footer-bottom">
                COPYRIGHT © BudgetBites {currentYear}
            </div>
        </footer>
    );
};

export default AuthFooter;

