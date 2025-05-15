import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Thêm useSelector để lấy thông tin user từ Redux
import { addToCart } from './redux/cartActions';
import './boxPro.css';
import anh4 from './img/anh4.png';
import outdatew from './img/outdated.webp';
import cart from './img/xe.webp';
import phieugiam from './img/phieugiam.webp';
import qua from './img/qua.webp';
import camket from './img/camket.webp';
import nganhang from './img/footer_trustbadge.webp';
import { themSP } from './cartSlice';

// Đổi tên tất cả các biến khi import để tránh xung đột
// import { 
//     cart as cartData, 
//     phieugiam as phieugiamData, 
//     qua as quaData, 
//     camket as camketData 
// } from './data';

function ProductDetail() {
    document.title = "Chi tiết sản phẩm";
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id, id_loai } = useParams();
    const [sp, setSanPham] = useState({});
    const [sanPhamNgauNhien, setSanPhamNgauNhien] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [thongBaoCart, setThongBaoCart] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [commentError, setCommentError] = useState('');
    const [averageRating, setAverageRating] = useState(0);
    // eslint-disable-next-line no-unused-vars
    const [commentPage, setCommentPage] = useState(1);
    const [totalComments, setTotalComments] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState({
        hours: 3,
        minutes: 0,
        seconds: 0
    });

    // Lấy thông tin user và token từ Redux
    const user = useSelector((state) => state.auth.user); // Thay đổi từ userInfo sang user
    const token = useSelector((state) => state.auth.token);
    const daDangNhap = useSelector(state => state.auth.daDangNhap);

    // Lấy chi tiết sản phẩm
    useEffect(() => {
        fetch(`http://localhost:3000/sp/${id}/${id_loai}`)
            .then(res => res.json())
            .then(data => setSanPham(data));
    }, [id, id_loai]);

    // Lấy sản phẩm liên quan
    useEffect(() => {
        fetch(`http://localhost:3000/sptrongloai/${id_loai}`)
            .then(res => res.json())
            .then(data => {
                const randomProducts = [];
                while (randomProducts.length < 4 && data.length > 0) {
                    const index = Math.floor(Math.random() * data.length);
                    const randomProduct = data[index];
                    if (!randomProducts.includes(randomProduct)) {
                        randomProducts.push(randomProduct);
                    }
                }
                setSanPhamNgauNhien(randomProducts);
            });
    }, [id_loai]);

    // Khai báo lại fetchComments để có thể gọi từ handleCommentSubmit
    const fetchComments = async () => {
        try {
            console.log('Fetching comments for product:', id);
            const response = await fetch(`http://localhost:3000/comments/${id}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định từ server' }));
                console.error('API Error:', errorData);
                throw new Error(errorData.thongbao || errorData.message || 'Lỗi khi tải bình luận');
            }

            const data = await response.json();
            console.log('Received data:', data);

            if (data && Array.isArray(data.comments)) {
                 setComments(data.comments);
                 setTotalComments(data.total || 0);
                 const avgRatingValue = parseFloat(data.average_rating);
                 setAverageRating(isNaN(avgRatingValue) ? 0 : avgRatingValue);
            } else {
                console.error('Invalid comments data format:', data);
                setComments([]);
                setTotalComments(0);
                setAverageRating(0); 
            }

        } catch (error) {
            console.error('Error fetching comments:', error);
            setComments([]); 
            setTotalComments(0);
            setAverageRating(0); 
        }
    };

    // Lấy danh sách bình luận của sản phẩm ban đầu
    useEffect(() => {
        if (id) {
            fetchComments();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Chỉ chạy khi id thay đổi

    // Thêm useEffect cho countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
                    clearInterval(timer);
                    return { hours: 3, minutes: 0, seconds: 0 }; // Reset về 3 giờ khi hết thời gian
                }
                if (prev.seconds === 0) {
                    if (prev.minutes === 0) {
                        return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                    }
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                }
                return { ...prev, seconds: prev.seconds - 1 };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

   const xuli = (sanpham) => {
           if (!daDangNhap) {
               if (window.confirm("Đăng nhập để thêm sản phẩm vào giỏ hàng!")) {
                   navigate('/login');
                   return;
               }
           }
           // Format the product with proper structure for the cart
           const cartItem = {
               id_sp: sanpham.id,
               ten_sp: sanpham.ten_sp,
               gia: sanpham.gia,
               gia_km: sanpham.gia_km,
               hinh: sanpham.hinh,
               so_luong: 1
           };
           dispatch(themSP(cartItem));
           setThongBaoCart(true);
           setTimeout(() => {
               setThongBaoCart(false);
           }, 2000);
       };

    // Thêm hàm xử lý submit comment
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            setCommentError('Vui lòng đăng nhập để bình luận');
            return;
        }
        if (!newComment.trim()) {
            setCommentError('Vui lòng nhập nội dung bình luận');
            return;
        }
        if (!rating || rating < 1 || rating > 5) {
            setCommentError('Vui lòng chọn số sao đánh giá từ 1-5');
            return;
        }

        setIsLoading(true);
        setCommentError('');

        try {
            console.log('Sending comment data:', { product_id: parseInt(id), content: newComment.trim(), rating: parseInt(rating) });

            const response = await fetch('http://localhost:3000/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ product_id: parseInt(id), content: newComment.trim(), rating: parseInt(rating) })
            });

            // Không cần đọc response.json() nếu không dùng đến data trả về
            // const data = await response.json(); 
            // console.log('Server response:', data);

            if (!response.ok) {
                // Nếu lỗi, cố gắng đọc lỗi từ server
                const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định từ server' }));
                throw new Error(errorData.thongbao || errorData.message || 'Lỗi khi thêm bình luận');
            }

            // Thành công: Reset form và gọi lại fetchComments để cập nhật list
            setNewComment('');
            setRating(5);
            setCommentError('');
            alert('Đã thêm bình luận thành công!');
            fetchComments(); // Gọi lại để lấy danh sách mới nhất

        } catch (error) {
            console.error('Comment error:', error);
            // Hiển thị lỗi cụ thể hơn nếu có
            setCommentError('Không thể thêm bình luận: ' + error.message); 
        } finally {
            setIsLoading(false);
        }
    };

    // Thêm hàm xử lý phân trang
    const handleLoadMore = () => {
        setCommentPage(prev => prev + 1);
    };

    // Hiển thị sao đánh giá
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={`bi ${i <= rating ? 'bi-star-fill' : 'bi-star'}`}
                    style={{ color: i <= rating ? '#fadb14' : '#d1d5db', fontSize: '20px' }}
                ></i>
            );
        }
        return stars;
    };

    return (
        <>
            <div id="ctsp">
                {thongBaoCart && <div className="thongbao">Sản phẩm đã được thêm vào giỏ hàng!</div>}
                <div style={{ marginBottom: '100px' }}>
                    {/* Breadcrumb */}
                    <div id="productDetail" style={{ display: 'flex', marginTop: '20px', marginLeft: '10px' }}>
                        <a href="/" style={{ fontSize: '17px', color: 'rgb(169, 169, 169)', textDecoration: 'none', marginRight: '10px' }}>Trang chủ /</a>
                        <a href="#/" style={{ fontSize: '17px', color: 'rgb(169, 169, 169)', textDecoration: 'none', marginRight: '10px' }}>Chi tiết sản phẩm /</a>
                        <a href="#/" style={{ fontWeight: '600', fontSize: '17px', color: '#fdb813', textDecoration: 'none' }}>{sp.slug}</a>
                    </div>
                    <br />

                    {/* Main Content */}
                    <div className="box_row">
                        {/* Hình ảnh sản phẩm */}
                        <div className="box_sub sub_row1">
                            <div className="col hinh_img">
                                <img className="img" src={sp.hinh} alt={sp.ten_sp} />
                            </div>
                            <div className="small">
                                <div className="img_small">
                                    <img src={sp.hinh} alt={sp.ten_sp} />
                                    <img src={sp.hinh} alt={sp.ten_sp} />
                                </div>
                            </div>
                            {/* <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                                <div style={{ marginRight: '10px', fontWeight: '600' }}>Chia sẻ:</div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <i style={{ fontSize: '30px', color: '#fff', background: '#4267b2', borderRadius: '50%', padding: '5px' }} className="bi bi-facebook"></i>
                                    <i style={{ fontSize: '30px', color: '#fff', background: '#e60023', borderRadius: '50%', padding: '5px' }} className="bi bi-pinterest"></i>
                                    <i style={{ fontSize: '30px', color: '#fff', background: '#1da1f2', borderRadius: '50%', padding: '5px' }} className="bi bi-twitter"></i>
                                </div>
                            </div> */}
                            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                <h3 style={{ fontSize: '30px' }}>Mô tả chi tiết sản phẩm</h3>
                                <hr style={{ border: '1.5px solid #aeaeae', width: '40%', margin: '10px auto' }} />
                                <p>Bảo hành 24 tháng chính hãng (Máy, Sạc: 24 tháng, Pin: 12 tháng)</p>
                                <p>Đổi mới sản phẩm trong 15 ngày</p>
                                <p>Tình trạng: Mới 100%</p>
                                <p>Nguyên hộp, đầy đủ phụ kiện: Dây nguồn, Sách hướng dẫn, Sạc Laptop</p>
                            </div>
                        </div>

                        {/* Thông tin sản phẩm */}
                        <div className="box_sub sub_row2">
                            <div className="col border_bt">
                                <div className="ten_text">{sp.ten_sp}</div>
                                <div style={{ marginTop: '5px', fontSize: '15px' }}>
                                    Tình trạng: <span style={{ color: '#00a651' }}>Còn hàng</span> | Mã SKU: <span style={{ color: '#666' }}>{sp.sku || 'Đang cập nhật'}</span>
                                </div>
                                <hr className="hr_ct" />
                            </div>
                            <div className="col">
                                <div className="price_content">
                                    <h2>{parseFloat(sp.gia_km).toLocaleString("vi")} VNĐ</h2>
                                    <del>{parseFloat(sp.gia).toLocaleString("vi")} VNĐ</del>
                                    <div className="btn_gg">
                                        <button>-{Math.round(((sp.gia - sp.gia_km) / sp.gia) * 100)}%</button>
                                    </div>
                                </div>
                                <div className="box_banner">
                                    <div className="banner">
                                        <div className="text_ct">
                                            <h4>ƯU ĐÃI HOT, ĐỪNG BỎ LỠ!!</h4>
                                            <p>Sản phẩm sẽ trở về giá gốc khi hết giờ</p>
                                        </div>
                                        <div className="countdown">
                                            <div className="box_cd">
                                                <span>{String(countdown.hours).padStart(2, '0')}</span>
                                                <a href="#/">giờ</a>
                                            </div>
                                            <div className="box_cd">
                                                <span>{String(countdown.minutes).padStart(2, '0')}</span>
                                                <a href="#/">phút</a>
                                            </div>
                                            <div className="box_cd">
                                                <span>{String(countdown.seconds).padStart(2, '0')}</span>
                                                <a href="#/">giây</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tt_sp"><strong>243</strong> sản phẩm đã bán</div>
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill" style={{ width: '50%' }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="chon_sl">
                                    <span className="text_sl">Số lượng:</span>
                                    <button onClick={decreaseQuantity}>-</button>
                                    <span>{quantity}</span>
                                    <button onClick={increaseQuantity}>+</button>
                                </div>
                                <div className="mua_them_btn">
                                    <button className="mt_btn1">Mua Ngay</button>
                                    <div className="cart_icon_detail">
                                        <button className="mt_btn2" onClick={() => xuli(sp)}>
                                            <i className="bi bi-bag-plus-fill"></i>
                                            Thêm vào giỏ hàng
                                        </button>
                                    </div>
                                </div>
                                <div style={{ paddingTop: '20px' }}>
                                    <strong style={{ fontSize: '20px' }}>Phương thức thanh toán</strong>
                                    <img src={nganhang} alt="Phương thức thanh toán" style={{ marginTop: '10px', maxWidth: '100%' }} />
                                </div>
                            </div>
                        </div>

                        {/* Khuyến mãi và cấu hình */}
                        <div className="box_sub sub_row3">
                            <div className="bc_phieu">
                                <div className="box_phieu_gg">
                                    <div className="phieu_gg">
                                        <img src={anh4} style={{ width: '60px', height: '50px' }} alt="Phiếu giảm giá" />
                                        <div className="box_content_pgg">
                                            <a href="#/" style={{ color: '#149b9b', fontWeight: '600' }}>NHẬN MÃ: EGA10</a>
                                            <p style={{ fontSize: '13px', color: '#9d9d9d' }}>Mã giảm 10% cho đơn tối thiểu 100k.</p>
                                            <div style={{ display: 'flex', gap: '20px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: '600' }}>
                                                    <p>Mã: EGA10</p>
                                                    <p>HSD: 31/12/2023</p>
                                                </div>
                                                <img src={outdatew} style={{ width: '45px', height: '38px' }} alt="Hết hạn" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 style={{ fontSize: '22px', fontWeight: '600' }}>Cấu hình máy {sp.ten_sp}</h2>
                                <table className="table">
                                    <tbody>
                                        <tr className="table-secondary"><th>Bộ xử lý</th><td></td></tr>
                                        <tr><th>Công nghệ CPU:</th><td>{sp.cpu}</td></tr>
                                        <tr className="table-secondary"><th>Bộ nhớ RAM, Ổ cứng</th><td></td></tr>
                                        <tr><th>RAM:</th><td>{sp.ram}</td></tr>
                                        <tr><th>Ổ cứng:</th><td>{sp.dia_cung}</td></tr>
                                        <tr className="table-secondary"><th>Khối lượng</th><td></td></tr>
                                        <tr><th>Khối lượng:</th><td>{sp.can_nang}kg</td></tr>
                                        <tr className="table-secondary"><th>Ngày</th><td></td></tr>
                                        <tr><th>Ngày sản xuất:</th><td>{new Date(sp.ngay).toLocaleDateString('vi-VN')}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Phần bình luận */}
                <div style={{ margin: '0 20px 50px 20px' }}>
                    <h2 style={{ textAlign: 'center' }}>BÌNH LUẬN SẢN PHẨM</h2>
                    <hr style={{ width: '15%', border: '2px solid #00eaff', margin: '10px auto' }} />

                    {/* Hiển thị rating trung bình */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fdb813' }}>
                            {(averageRating || 0).toFixed(1)} / 5.0
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                            {renderStars(averageRating || 0)}
                        </div>
                        <div style={{ color: '#666', marginTop: '5px' }}>
                            Dựa trên {totalComments || 0} đánh giá
                        </div>
                    </div>

                    {/* Form thêm bình luận */}
                    <div style={{ marginBottom: '30px' }}>
                        <h4>Thêm bình luận của bạn</h4>
                        {commentError && <div style={{ color: 'red', marginBottom: '10px' }}>{commentError}</div>}
                        <form onSubmit={handleCommentSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: '600', marginRight: '10px' }}>Đánh giá:</label>
                                <div style={{ display: 'inline-block' }}>
                                    {[...Array(5)].map((_, index) => (
                                        <i
                                            key={index}
                                            className={`bi ${index < rating ? 'bi-star-fill' : 'bi-star'}`}
                                            style={{ 
                                                color: index < rating ? '#fadb14' : '#d1d5db', 
                                                fontSize: '20px', 
                                                cursor: 'pointer',
                                                transition: 'color 0.2s'
                                            }}
                                            onClick={() => setRating(index + 1)}
                                        ></i>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Nhập bình luận của bạn..."
                                    style={{ 
                                        width: '100%', 
                                        minHeight: '100px', 
                                        padding: '10px', 
                                        borderRadius: '5px', 
                                        border: '1px solid #ccc',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    background: '#fdb813',
                                    color: '#fff',
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                Gửi bình luận
                            </button>
                        </form>
                    </div>

                    {/* Danh sách bình luận */}
                    <div>
                        <h4>Danh sách bình luận ({totalComments || 0})</h4>
                        {isLoading && <div style={{ textAlign: 'center', margin: '20px 0' }}>Đang tải...</div>}
                        {(!comments || comments.length === 0) ? (
                            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                        ) : (
                            <>
                                {comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        style={{
                                            borderBottom: '1px solid #eee',
                                            padding: '15px 0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '5px',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img 
                                                src={comment.user_avatar || 'default-avatar.png'} 
                                                alt="Avatar" 
                                                style={{ 
                                                    width: '40px', 
                                                    height: '40px', 
                                                    borderRadius: '50%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <div>
                                                <strong>{comment.user_name}</strong>
                                                <div>{renderStars(comment.rating)}</div>
                                            </div>
                                        </div>
                                        <p style={{ margin: '10px 0' }}>{comment.content}</p>
                                        <small style={{ color: '#888' }}>
                                            {new Date(comment.created_at).toLocaleString('vi-VN')}
                                        </small>
                                    </div>
                                ))}
                                {comments.length < (totalComments || 0) && (
                                    <button
                                        onClick={handleLoadMore}
                                        style={{
                                            background: '#f5f5f5',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            marginTop: '20px',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        Xem thêm bình luận
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Sản phẩm liên quan */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2>SẢN PHẨM LIÊN QUAN</h2>
                    <hr style={{ width: '15%', border: '2px solid #00eaff', margin: '10px auto' }} />
                    <div className="tong_box_SP">
                        {sanPhamNgauNhien.map((sp, i) => (
                            <div className="box_SP" key={i}>
                                <div className="box_SP_anh">
                                    <Link to={`/sanpham/${sp.id}/${sp.id_loai}`}><img src={sp.hinh} alt={sp.ten_sp} /></Link>
                                </div>
                                <div className="box_SP_tensp"><Link to={`/sanpham/${sp.id}/${sp.id_loai}`}>{sp.ten_sp}</Link></div>
                                <div className="cart_icon" onClick={() => xuli(sp)}><i className="bi bi-bag-plus-fill"></i></div>
                                <div className="box_SP_gia">
                                    <div className="box_SP_gia_km">{parseFloat(sp.gia_km).toLocaleString("vi")} VNĐ</div>
                                    <div className="box_SP_gia_goc"><del>{parseFloat(sp.gia).toLocaleString("vi")} VNĐ</del></div>
                                </div>
                                <div className="box_SP_luot_xem"><p>Lượt xem: {sp.luot_xem}</p></div>
                                <div className="box_SP_icon">
                                    <div className="box_SP_icon_star">
                                        <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star"></i>
                                        <p>(Đánh giá)</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="troVe">
                <a href="#header"><i className="bi bi-arrow-up-short"></i></a>
            </div>
        </>
    );
}

export default ProductDetail;