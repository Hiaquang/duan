import React from "react";
import AdminSidebar from "./components/AdminSidebar";

function AdminLayout({ children }) {
    return (
        <div>
            <AdminSidebar />
            <div style={{ marginLeft: 250, padding: '2rem 1rem' }}>
                {children}
            </div>
        </div>
    );
}

export default AdminLayout;
