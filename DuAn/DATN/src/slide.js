import banner1 from './img/banner1.png';
import banner_2 from './img/banner6.jpg'
import banner5 from './img/banner5.webp'
import banner6 from './img/banner6.png'
function slide() {
    return(
        <div className="banner_box">
             <div className='banner1'>
                <div id="carouselExample" className="carousel slide">
                <div className="carousel-inner">
                  <div className="carousel-item active bann">
                    <img src={banner1} className="d-block w-100 image" alt={banner1}/>
                  </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
             </div>
             <div className='banner2'>
                <div id="carouselExamplee" className="carousel slide">
                <div className="carousel-inner">
                  <div className="carousel-item active bann">
                    <img src={banner_2} className="d-block w-100 imagee" alt={banner_2}/>
                  </div>
                  <div className="carousel-item active bann">
                    <img src={banner5} className="d-block w-100 imagee" alt={banner5}/>
                  </div>
                  <div className="carousel-item active bann">
                    <img src={banner6} className="d-block w-100 imagee" alt={banner6}/>
                  </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExamplee" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExamplee" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
             </div>
      </div>
    )
}

export default slide;