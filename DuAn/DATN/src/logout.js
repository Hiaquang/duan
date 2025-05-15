import { Link, useNavigate } from "react-router-dom";
import './logout.css';
import { useState } from "react";

function Logout() {
    const [dkus, setDkus] = useState({});
    const navigate = useNavigate();
    
    const submitDuLieu = (e) => {
        e.preventDefault(); // Ngăn sự kiện submit mặc định
        let url = `http://localhost:3000/dangky`;
        let otp = {
            method: "post",
            body: JSON.stringify(dkus),
            headers: { 'Content-Type': 'application/json' }
        };
        fetch(url, otp)
            .then(res => res.json())
            .then(data => {
                alert(data.thongbao);
                if (data.id) {
                    navigate('/login');
                }
            });
    };

    const xuliValue = (e) => {
        const { name, value } = e.target;
        setDkus({ ...dkus, [name]: value });
    };

    return (
        <div className="logout">
            <form>
                <div className="box_form" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', height: '500px' }}>
                    <h1>Đăng ký</h1>
                    <div className="inpt">
                        <div><input type="text" id="name" name="name" placeholder="Nhập tên tài khoản" onChange={xuliValue} /></div>
                        <div><i className="fa-solid fa-user"></i></div>
                    </div>
                    <div className="inpt">
                        <div><input type="text" id="hinh" name="hinh" placeholder="Cập nhật avatar..." onChange={xuliValue} /></div>
                        <div><i className="fa-solid fa-user"></i></div>
                    </div>
                    <div className="inpt">
                        <div><input type="text" id="email" name="email" placeholder="...@gmail.com" onChange={xuliValue} /></div>
                        <div><i className="fa-solid fa-user"></i></div>
                    </div>
                    <div className="inpt">
                        <div><input type="password" id="pass" name="password" placeholder="Nhập password" onChange={xuliValue} /></div>
                        <div><i className="fa-solid fa-user"></i></div>
                    </div>
                    <div className="inpt" style={{marginBottom:"10px"}}>
                        <div><input type="text" id="phone" name="dien_thoai" placeholder="Nhập số điện thoại" onChange={xuliValue} /></div>
                        <div><i className="fa-solid fa-user"></i></div><br />
                    </div>
                    <div className="btn">
                        <button onClick={submitDuLieu} className="btn111" type="button">Đăng ký</button>
                    </div>
                    <div className="btn" style={{transform:"translateY(-15px)"}}>
                        <Link to="/#" activeclassname="a"><button className="btn222" type="button">Close</button></Link>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Logout;
