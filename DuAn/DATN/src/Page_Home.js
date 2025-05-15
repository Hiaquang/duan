
import Home from "./Home";
import SPXemNhieu from "./SPXemNhieu";
import Slide from "./slide";
import Danhmuc from "./danhmuc"; 

// var sotin = 9;

function PageHome() {
    return(
               <div> 
                    <div >
                        <Slide/>
                        <Danhmuc/>
                    </div>
                    <div className="box_as_at">
                            <article >
                                <Home/>
                            </article>
                            
                    </div>
                            <article >
                                 <SPXemNhieu/> 
                            </article>
               </div>
    )
}

export default PageHome;

