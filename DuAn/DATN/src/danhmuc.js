import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

function Danhmuc() {
    const [listLoai, ganListLoai] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3000/loai")
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    ganListLoai(data);
                } else {
                    ganListLoai([]);
                }
            })
            .catch(err => {
                console.error('Error fetching categories:', err);
                setError(err.message);
                ganListLoai([]);
            });
    }, []);

    if (error) {
        return <div>Error loading categories: {error}</div>;
    }

    return (
        <div className="box_Danhmuc_SP">
            <div style={{ fontSize: '20px', fontWeight: '700', color:'white' }} className="box_danhmuc_img_text">
                <Link to="/laptop">Tất cả</Link>
            </div>
            {Array.isArray(listLoai) && listLoai.slice(0, 10).map((sp, i) => (
                <div key={i} className="box_danhmuc_img_text">
                    <Link to={`/loai/${sp.id}`}>
                        <div className="Danhmuc_Text">{sp.ten_loai}</div>
                    </Link>
                </div>
            ))}
        </div>
    );
}

export default Danhmuc;


