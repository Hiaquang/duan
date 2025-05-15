import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import banner_n1 from './img/banner_n1.webp';
import banner5 from './img/banner5.jpg';
import { useDispatch, useSelector } from 'react-redux';
import { themSP } from './cartSlice';
import { themVaoSoSanh, xoaKhoiSoSanh } from './compareSlice';
import './home_sosanh.css';

function TitleH2() {
  return (
    <div className="titile_SP">
      <h2>ƯU ĐÃI HOT</h2>
      <hr className="h_r"></hr>
    </div>
  );
}

function SPXemNhieu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const daDangNhap = useSelector(state => state.auth.daDangNhap);
  const danhSachSoSanh = useSelector(state => state.compare.danhSachSoSanh);
  const [listsp, setListSP] = useState([]);
  const [sotin, setXemNhieu] = useState(12);
  const [daSapXep, setDaSapXep] = useState(false);
  const [thongBao, setThongBao] = useState(false);
  const [isCompareBoxVisible, setIsCompareBoxVisible] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/sphot")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setListSP(data);
        } else {
          setListSP([]);
        }
      })
      .catch(error => {
        console.error('Lỗi khi tải sản phẩm hot:', error);
        setListSP([]);
      });
  }, []);

  useEffect(() => {
    const isVisible = localStorage.getItem('isCompareBoxVisible') === 'true';
    setIsCompareBoxVisible(isVisible);
  }, []);

  const showCompareBox = () => {
    setIsCompareBoxVisible(true);
    localStorage.setItem('isCompareBoxVisible', 'true');
  };

  const xuli = (sanpham) => {
    if (!daDangNhap) {
      if (window.confirm("Đăng nhập để thêm sản phẩm vào giỏ hàng!")) {
        navigate('/login');
        return;
      }
    }
    dispatch(themSP(sanpham));
    setThongBao(true);
    setTimeout(() => {
      setThongBao(false);
    }, 2000);
  };

  const themSoSanhVaChuyenTrang = (sanpham) => {
    if (danhSachSoSanh.length >= 3) {
      alert("Bạn chỉ có thể so sánh tối đa 3 sản phẩm!");
      return;
    }
    dispatch(themVaoSoSanh(sanpham));
    setThongBao(true);
    setTimeout(() => {
      setThongBao(false);
      showCompareBox();
    }, 1000);
  };

  const clearCompare = () => {
    danhSachSoSanh.forEach(sp => dispatch(xoaKhoiSoSanh(sp.id)));
    setIsCompareBoxVisible(false);
    localStorage.setItem('isCompareBoxVisible', 'false');
  };

  const handleCompareNow = () => {
    navigate('/so-sanh');
  };

  // Cài đặt cho slideshow
  const slideSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 15px' }}>
      {thongBao && (
        <div className="thongbao">
          Sản phẩm đã được thêm vào so sánh!
        </div>
      )}
      
      <TitleH2 />
      
      {/* Banner thu cũ lên đời */}
      <div style={{ 
        width: '100%', 
        backgroundColor: '#fce83a', 
        borderRadius: '10px',
        marginBottom: '30px',
        padding: '15px',
        textAlign: 'center',
        color: '#ff0000',
        fontSize: '28px',
        fontWeight: 'bold'
      }}>
        THU CŨ LÊN ĐỜI - TRỢ GIÁ ĐẾN 2 TRIỆU
      </div>
      
      {/* Khu vực Thế Giới Di Động (banner và sản phẩm) */}
      <div className="box_Sell" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        width: '100%',
        margin: '20px auto',
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        {/* Banner bên trái */}
        <div className="box_Sell_anh" style={{
          flex: '0 0 350px',
          minWidth: '300px',
          backgroundColor: '#FFF01F',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '450px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <img
            src="https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/71/35/7135f4920503c694c7adac1ba7590bdf.png"
            alt="Banner Thế Giới Di Động"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
        
        {/* Slider sản phẩm bên phải */}
        <div className="box_Sell_sp" style={{
          flex: '1 1 900px',
          minWidth: '0'
        }}>
          <div className="slider-container" style={{ width: '100%' }}>
            <Slider {...slideSettings}>
              {Array.isArray(listsp) && listsp
                .slice(0, 8)
                .map((sp, i) => (
                  <div key={i} style={{ padding: '0 12px' }}>
                    <div style={{
                      backgroundColor: '#fff',
                      borderRadius: '10px',
                      padding: '20px',
                      height: '450px',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      border: '1px solid #eee',
                      boxShadow: '0 3px 7px rgba(0,0,0,0.08)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 7px rgba(0,0,0,0.08)';
                    }}>
                      {/* Tag "Mẫu mới" */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: '#F7941E',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}>
                        Mẫu mới
                      </div>
                      
                      {/* Tag "Trả góm 0%" */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        color: '#999',
                        fontSize: '13px'
                      }}>
                        Trả góp 0%
                      </div>
                      
                      {/* Ảnh sản phẩm */}
                      <div style={{
                        height: '220px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '15px',
                        marginTop: '30px'
                      }}>
                        <Link to={`/sanpham/${sp.id}/${sp.id_loai}`}>
                          <img
                            src={sp.hinh}
                            alt={sp.ten_sp}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '180px',
                              objectFit: 'contain'
                            }}
                          />
                        </Link>
                      </div>
                      
                      {/* Tên sản phẩm */}
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        height: '48px',
                        overflow: 'hidden',
                        marginBottom: '10px',
                        lineHeight: '1.5'
                      }}>
                        <Link to={`/sanpham/${sp.id}/${sp.id_loai}`} style={{
                          color: '#333',
                          textDecoration: 'none'
                        }}>
                          {sp.ten_sp}
                        </Link>
                      </div>
                      
                      {/* Thông tin màn hình */}
                      <div style={{
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '10px',
                        display: 'flex',
                        gap: '15px'
                      }}>
                        <span>Full HD+</span>
                        <span>6.7"</span>
                      </div>
                      
                      {/* Giá */}
                      <div style={{
                        color: '#E71D1D',
                        fontSize: '22px',
                        fontWeight: 'bold',
                        marginBottom: '8px'
                      }}>
                        {parseFloat(sp.gia_km || sp.gia).toLocaleString("vi")}₫
                      </div>
                      
                      {/* Giá gốc */}
                      {sp.gia_km && sp.gia_km !== sp.gia && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            color: '#666',
                            fontSize: '15px',
                            textDecoration: 'line-through'
                          }}>
                            {parseFloat(sp.gia).toLocaleString("vi")}₫
                          </span>
                          <span style={{
                            color: '#666',
                            fontSize: '14px',
                            backgroundColor: '#f1f1f1',
                            padding: '2px 5px',
                            borderRadius: '3px'
                          }}>
                            -{Math.round(((sp.gia - sp.gia_km) / sp.gia) * 100)}%
                          </span>
                        </div>
                      )}
                      
                      {/* Đánh giá */}
                      <div style={{
                        marginTop: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          color: '#FB6E2E'
                        }}>
                          <i className="bi bi-star-fill" style={{fontSize: '18px', marginRight: '2px'}}></i>
                          <i className="bi bi-star-fill" style={{fontSize: '18px', marginRight: '2px'}}></i>
                          <i className="bi bi-star-fill" style={{fontSize: '18px', marginRight: '2px'}}></i>
                          <i className="bi bi-star-fill" style={{fontSize: '18px', marginRight: '2px'}}></i>
                          <i className="bi bi-star-fill" style={{fontSize: '18px', marginRight: '2px'}}></i>
                        </div>
                        <span style={{ marginLeft: '5px' }}>{Math.floor(Math.random() * 300) + 1}</span>
                      </div>
                      
                      {/* Tag đặc quyền */}
                      <div style={{
                        position: 'absolute',
                        bottom: '20px', 
                        left: '20px',
                        backgroundColor: '#000',
                        width: '85px',
                        height: '24px',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          color: '#FFA800',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          Đặc quyền
                        </span>
                      </div>
                      
                      {/* Trả trước bao nhiêu */}
                      <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        backgroundColor: '#fff',
                        borderRadius: '5px',
                        padding: '3px 8px',
                        fontSize: '13px',
                        color: '#E71D1D',
                        border: '1px solid #E71D1D'
                      }}>
                        <i className="bi bi-calendar-check" style={{ marginRight: '5px' }}></i> Trả trước 0đ
                      </div>
                    </div>
                  </div>
                ))}
            </Slider>
          </div>
        </div>
      </div>
      
      {/* Phần box ở dưới tương tự như đã có */}
      <div style={{ marginTop: '40px', marginBottom: '40px' }}>
        <div className="titile_SP">
          <h2>SẢN PHẨM XEM NHIỀU</h2>
          <hr className="h_r"></hr>
        </div>
        
        <div className="tong_box_SP">
          {Array.isArray(listsp) && listsp.map((sp, i) => (
            <div className="box_SP" key={i}>
              {sp.phan_tram_gg && (
                <div className="box_SP_khuyen_mai">
                  Giảm {sp.phan_tram_gg}%
                </div>
              )}
              <div className="box_SP_anh">
                <Link to={`/sanpham/${sp.id}/${sp.id_loai}`}>
                  <img src={sp.hinh} title={sp.ten_sp.toUpperCase()} alt={sp.ten_sp} />
                </Link>
              </div>
              <div className="cart_icon" onClick={() => xuli(sp)}>
                <i className="bi bi-bag-plus-fill"></i>
              </div>
              <div className="box_SP_tensp">
                <Link to={`/sanpham/${sp.id}/${sp.id_loai}`}>{sp.ten_sp}</Link>
              </div>
              <div className="box_SP_RAM_SSD">
                <div><button className="box_SP_RAM">RAM: {sp.ram}</button></div>
                <div><button className="box_SP_SSD">SSD: {sp.dia_cung}</button></div>
              </div>
              <div className="box_SP_gia">
                <div className="box_SP_gia_km" style={{color: '#ff0000', fontWeight: 'bold'}}>
                  {parseFloat(sp.gia_km).toLocaleString("vi")} VNĐ
                </div>
                <div className="box_SP_gia_goc" style={daSapXep ? {color: '#999'} : {}}>
                  <del>{parseFloat(sp.gia).toLocaleString("vi")} VNĐ</del>
                </div>
              </div>
              <div className="box_SP_luot_xem"><p>Lượt xem: {sp.luot_xem}</p></div>
              <div className="box_SP_icon">
                <div className="box_SP_icon_star">
                  <div className="box_SP_icon_star_dam"><i className="bi bi-star-fill"></i></div>
                  <div className="box_SP_icon_star_dam"><i className="bi bi-star-fill"></i></div>
                  <div className="box_SP_icon_star_dam"><i className="bi bi-star-fill"></i></div>
                  <div className="box_SP_icon_star_dam"><i className="bi bi-star-fill"></i></div>
                  <div className="box_SP_icon_star_nhat"><i className="bi bi-star-fill"></i></div>
                  <div className="box_SP_icon_star_dg"><p>(Đánh giá)</p></div>
                </div>
                <div className="so_sanh">
                  <button className="so_sanh_btn" onClick={() => themSoSanhVaChuyenTrang(sp)}>
                    So sánh
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner giống Home.js */}
      <div className="carousel-inner" style={{ padding: '10px', marginTop: '30px' }}>
        <div className="carousel-item active">
          <img src={banner_n1} style={{ width: '100%', height: 'auto', borderRadius: '10px' }} className="d-block w-100" alt="Banner 1" />
        </div>
      </div>

      {/* Compare Box */}
      {isCompareBoxVisible && (
        <div className="stickcompare stickcompare_new cp-desktop spaceInDown">
          <a href="javascript:;" onClick={clearCompare} className="clearall">
            <i className="bi bi-x"></i>Thu gọn
          </a>
          <ul className="listcompare">
            {danhSachSoSanh.map(sp => (
              <li key={sp.id}>
                <span className="remove-ic-compare" onClick={() => dispatch(xoaKhoiSoSanh(sp.id))}>
                  <i className="bi bi-x"></i>
                </span>
                <img src={sp.hinh} alt={sp.ten_sp} />
                <h3>{sp.ten_sp}</h3>
                <div className="product-info">
                  <div>RAM: {sp.ram}</div>
                  <div>SSD: {sp.dia_cung}</div>
                  <div className="price">{parseFloat(sp.gia_km).toLocaleString("vi")}₫</div>
                </div>
              </li>
            ))}
            {danhSachSoSanh.length < 3 && (
              <li className="formsg">
                <div className="cp-plus cp-plus_new">
                  <i className="bi bi-plus-lg"></i>
                  <p>Thêm sản phẩm</p>
                </div>
              </li>
            )}
          </ul>
          <div className="closecompare">
            <a href="javascript:;" onClick={handleCompareNow} className="doss">
              So sánh ngay
            </a>
            <a href="javascript:;" onClick={clearCompare} className="txtremoveall">
              Xóa tất cả
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default SPXemNhieu;