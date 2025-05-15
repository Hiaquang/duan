import {Routes,Route, Link } from "react-router-dom";
import Footer from "./footer";
import logo from "./img/logo.png"
import PageHome from "./Page_Home";
import Menu from "./Menu";
import GioiThieu from "./Page_GioiThieu";
import ProductDetail from "./Page_Product_Detail";
import ShowProductOneKind from "./Page_Show_Product_Kind";
import NotFound from "./NotFound";
import ShowCart from "./showCart";
import ThanhToan from "./ThanhToan";
import CamOn from "./camon";
import AdminProduct from "./admin_product";


function Customer() {
    return(
        <div className='container-fulid'>
      
        <header id="header">
            {/* <div className="marquee"><Marquee>CHÀO MỪNG BẠN ĐẾN VỚI WEBSITE CỦA CHÚNG TÔI!</Marquee></div> */}
            <nav id="navv" className="navbar navbar-expand-lg bg-body-tertiary nav_menu" >
              <div className="container-fluid ">
                <img className="logo" src={logo} alt={logo}/>
                <button className="navbar-toggler" style={{outline:'none',border:'none',padding:'0px'}} type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                      <i style={{fontSize:'30px'}} class="bi bi-list"></i>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <Menu/>
                </div>
              </div>
            </nav>
          
  
        </header>
        
        {/* Box cho nút tìm kiếm */}
            <div style={{marginTop:'8%'}} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
              <div className="modal-dialog modal-xl">
                <div className="modal-content">
                  <div className="modal-header" >
                    <i style={{fontSize:'25px'}} className="bi bi-search"></i>
                    <input style={{border:'none',padding: '5px', fontSize: '20px', width: '100%',outline:'none',paddingLeft:'20px'}}  type="search" placeholder="Tìm kiếm sản phẩm..." aria-label="Search"></input>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body" style={{}}>
                  adsscxscsxcsscscc
                  </div>
              
                </div>
              </div>
            </div>
        {/* Box cho nút giỏ hàng Page_Home */}
        <div style={{zIndex:'2001'}} className="offcanvas offcanvas-end" data-bs-scroll="true" tabindex="-1" id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
            <div className="offcanvas-header">
              <h5 style={{fontWeight:"700"}} className="offcanvas-title" id="offcanvasWithBothOptionsLabel">Giỏ hàng</h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body" style={{textDecoration:'none'}}>
            <li style={{listStyle:'none'}}><Link to= "/showcart" > <button style={{background:'#fff'}} type="button " className="btn btn-outline-info" data-bs-dismiss="offcanvas" aria-label="Close">Xem giỏ hàng</button> </Link> </li>
            </div>
        </div>
        <main>
            <Routes>
                 <Route path="/" exact element={<PageHome/>}/>
                 <Route path="/gioithieu" exact element={<GioiThieu/>} />
                 <Route path='/sanpham/:id/:id_loai' exact element={<ProductDetail/>} />
                 <Route path='/loai/:id' exact element={<ShowProductOneKind/>}/>
                 <Route path='/showcart' exact element={<ShowCart/>}/>
                 <Route path="/thanhtoan/" element={<ThanhToan/>} />
                 <Route path="/thanks" exact element={<CamOn/>}/>
                 <Route path="/admin" exact element={<AdminProduct/>}/>
                 <Route path="*" element={<NotFound/>}/>
            </Routes>
        </main>
        <footer className="footer">
           <Footer/>
        </footer>
  
      </div>
    )
}

export default Customer;