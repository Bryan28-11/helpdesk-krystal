import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
    return (
        <div className="app">
            <Sidebar />
            <div className="main-wrap">
                {children}
            </div>
        </div>
    );
}