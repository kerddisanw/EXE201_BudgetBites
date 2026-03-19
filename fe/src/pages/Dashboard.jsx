import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="dashboard-page">
            <section className="dashboard-hero">
                <div>
                    <h1 className="dashboard-title">
                        Xin chào, {user.fullName || 'bạn'} 👋
                    </h1>
                    <p className="dashboard-subtitle">
                        Đây là trung tâm bữa ăn của bạn. Xem nhanh lịch ăn, gói đang sử dụng và bắt
                        đầu đặt bữa cho tuần tới.
                    </p>
                </div>
                <div className="dashboard-hero-chip">
                    <span className="chip-label">Tài khoản</span>
                    <span className="chip-value">{user.email}</span>
                </div>
            </section>

            <section className="dashboard-main-grid">
                <div className="dashboard-primary">
                    <div className="dashboard-card dashboard-card-accent">
                        <h2>Đặt bữa ăn trong tuần</h2>
                        <p>
                            Chọn gói bữa ăn phù hợp với lịch học và ngân sách. Bạn có thể thay đổi
                            bất kỳ lúc nào.
                        </p>
                        <Link to="/packages" className="card-button">
                            Xem gói bữa ăn
                        </Link>
                    </div>

                    <div className="dashboard-card">
                        <h3>Đối tác & quán ăn</h3>
                        <p>Khám phá các quán ăn đối tác gần bạn và đặt món yêu thích.</p>
                        <Link to="/partners" className="card-link">
                            Xem danh sách đối tác →
                        </Link>
                    </div>

                    <div className="dashboard-card">
                        <h3>Giỏ hàng hiện tại</h3>
                        <p>
                            Kiểm tra nhanh các bữa ăn đã chọn trước khi hoàn tất đăng ký gói hoặc
                            thanh toán.
                        </p>
                        <Link to="/cart" className="card-link">
                            Đi đến giỏ hàng →
                        </Link>
                    </div>
                </div>

                <aside className="dashboard-sidebar">
                    <div className="dashboard-card">
                        <h3>Gói đăng ký của bạn</h3>
                        <p>
                            Xem và quản lý các gói BudgetBites đang hoạt động, thay đổi tần suất hoặc
                            tạm dừng khi cần.
                        </p>
                        <Link to="/subscriptions" className="card-link">
                            Quản lý gói đăng ký →
                        </Link>
                    </div>

                    <div className="dashboard-card">
                        <h3>Thông tin tài khoản</h3>
                        <p className="dashboard-meta">
                            <span>{user.fullName}</span>
                            <span>{user.role}</span>
                        </p>
                        <Link to="/account" className="card-link">
                            Cập nhật thông tin cá nhân →
                        </Link>
                    </div>
                </aside>
            </section>
        </div>
    );
}

export default Dashboard;
