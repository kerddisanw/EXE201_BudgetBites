import React from 'react';

const Account = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div style={{ padding: '24px' }}>
            <h1>Tài Khoản</h1>
            <p>Họ tên: {user.fullName}</p>
            <p>Email: {user.email}</p>
            <p>Vai trò: {user.role}</p>
        </div>
    );
};

export default Account;

