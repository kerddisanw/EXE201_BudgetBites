import React from 'react';
import Header from './Header';

const AppLayout = ({ children }) => {
    return (
        <>
            <Header />
            <main className="bb-main">{children}</main>
        </>
    );
};

export default AppLayout;

