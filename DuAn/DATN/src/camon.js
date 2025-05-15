import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CamOn.css"; // Import file CSS

function CamOn() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5); // Khởi tạo đếm ngược 5 giây

    useEffect(() => {
        document.title = "Thanks"; // Đặt tiêu đề trang

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1); // Giảm thời gian đếm ngược mỗi giây
        }, 1000);

        const redirectTimer = setTimeout(() => {
            navigate("/"); // Tự động quay về trang chủ sau 5 giây
        }, 5000);

        return () => {
            clearInterval(timer); // Dọn dẹp timer đếm ngược
            clearTimeout(redirectTimer); // Dọn dẹp timer chuyển hướng
        };
    }, [navigate]);

    return (
        <div className="camon">
            <h1 className="camon-title">Cảm ơn bạn!</h1>
            <p className="camon-message">
                Bạn sẽ được chuyển về trang chủ sau {countdown} giây...
            </p>
        </div>
    );
}

export default CamOn;