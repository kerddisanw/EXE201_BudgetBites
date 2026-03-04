import React, { useEffect, useState } from 'react';
import { authService } from '../services/api';
import './Profile.css';

const Account = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            try {
                const res = await authService.getProfile();
                if (isMounted) {
                    setProfile(res.data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                            'Không thể tải thông tin tài khoản. Vui lòng thử lại.'
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-card profile-card-loading">
                    Đang tải thông tin tài khoản...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <div className="profile-card profile-card-error">{error}</div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profile.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h1 className="profile-name">{profile.fullName}</h1>
                        <p className="profile-role">
                            {profile.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                        </p>
                    </div>
                </div>

                <div className="profile-section">
                    <h2 className="profile-section-title">Thông tin cá nhân</h2>
                    <div className="profile-grid">
                        <div className="profile-field">
                            <span className="profile-label">Email</span>
                            <span className="profile-value">{profile.email}</span>
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">Số điện thoại</span>
                            <span className="profile-value">
                                {profile.phoneNumber || 'Chưa cập nhật'}
                            </span>
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">Mã sinh viên</span>
                            <span className="profile-value">
                                {profile.studentId || 'Chưa cập nhật'}
                            </span>
                        </div>
                        <div className="profile-field">
                            <span className="profile-label">Trường</span>
                            <span className="profile-value">
                                {profile.university || 'Chưa cập nhật'}
                            </span>
                        </div>
                        <div className="profile-field profile-field-full">
                            <span className="profile-label">Địa chỉ</span>
                            <span className="profile-value">
                                {profile.address || 'Chưa cập nhật'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;

