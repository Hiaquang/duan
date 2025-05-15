import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './admin_css/admin_user.css';

function AdminUsersThem({ setRefresh }) {
    const [us, setUs] = useState({
        name: "",
        email: "",
        password: "",
        dia_chi: "",
        dien_thoai: "",
        hinh: "",
        role: 0,
    });

    const navigate = useNavigate();

    const xuliInput = (e) => {
        const { name, value } = e.target;
        setUs({ ...us, [name]: value });
    };

    const submitDuLieu = async () => {
        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(us),
            });
            if (!response.ok) throw new Error("Lỗi khi thêm người dùng");
            setRefresh((prev) => !prev);
            navigate("/users");
        } catch (error) {
            console.error("Lỗi khi thêm người dùng:", error);
        }
    };

    return (
        <div className="admin_users_them">
            <h1>Thêm tài khoản</h1>
            <form>
                <input type="text" name="name" placeholder="Tên" onChange={xuliInput} />
                <input type="email" name="email" placeholder="Email" onChange={xuliInput} />
                <input type="password" name="password" placeholder="Mật khẩu" onChange={xuliInput} />
                <input type="text" name="dia_chi" placeholder="Địa chỉ" onChange={xuliInput} />
                <input type="text" name="dien_thoai" placeholder="Điện thoại" onChange={xuliInput} />
                <button type="button" onClick={submitDuLieu}>
                    Thêm
                </button>
            </form>
        </div>
    );
}

export default AdminUsersThem;
