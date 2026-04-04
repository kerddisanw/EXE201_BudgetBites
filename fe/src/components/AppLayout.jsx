import React from 'react';
import Header from './Header';
import MealAssistantChat from './MealAssistantChat';

const AppLayout = ({ children }) => {
    return (
        <>
            <Header />
            <main className="bb-main">{children}</main>
            <MealAssistantChat />
        </>
    );
};

export default AppLayout;

