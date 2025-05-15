import React from "react";
class GioiThieu extends React.Component{
    render(){
        document.title="Giới thiệu";
        return(
            <div id='gioithieu' style={{marginTop:'7%' }}>
                <div className="introduction" >
                    <h1 style={{textAlign:'center'}}>Giới thiệu về PN Thiết Bị Điện Tử</h1>
                    <p >
                    PN Thiết Bị Điện Tử là nhà bán lẻ hàng đầu, chuyên cung cấp các sản phẩm công nghệ chính hãng tại thị trường Việt Nam. Với hơn 20 năm kinh nghiệm, PN Thiết Bị Điện Tử đã trở thành địa chỉ đáng tin cậy của người tiêu dùng Việt. Chúng tôi cam kết mang đến các sản phẩm công nghệ đa dạng và phong phú, đi kèm với mức giá tốt nhất phục vụ nhu cầu của quý khách hàng.
                    </p>
                    <h2 style={{marginLeft:'22%'}}>Những dấu mốc quan trọng</h2>
                    <ul>
                    <li><strong>Năm 1996:</strong> Bắt đầu nghiên cứu và tham gia vào các đơn vị kinh doanh công nghệ.</li>
                    <li><strong>Năm 2004:</strong> Mở cửa hàng điện thoại đầu tiên, tọa lạc trên con phố sầm uất của Thủ đô Hà Nội.</li>
                    <li><strong>Năm 2006:</strong> Cửa hàng phát triển mạnh mẽ và có thêm nhiều chi nhánh mới.</li>
                    <li><strong>Năm 2016:</strong> Khẳng định được chỗ đứng vững chắc trên thị trường.</li>
                    <li><strong>Năm 2019:</strong> Hợp tác với các ông lớn ngành viễn thông mở chuỗi chi nhánh bán hàng liên kết.</li>
                    <li><strong>Năm 2020:</strong> Trở thành nhà bán lẻ ủy quyền chính thức của Apple tại Việt Nam.</li>
                    </ul>
                    <h2 style={{marginLeft:'22%'}}>Tầm nhìn và sứ mệnh</h2>
                    <p>
                    Trong tương lai, PN Thiết Bị Điện Tử sẽ tiếp tục mở rộng hệ thống chi nhánh, hướng tới mục tiêu có mặt tại 63 tỉnh thành trên toàn quốc. Đồng thời, chúng tôi sẽ nâng cao chất lượng dịch vụ, lắng nghe và tiếp thu góp ý của quý khách hàng nhằm đem đến trải nghiệm tốt nhất khi mua sắm tại PN Thiết Bị Điện Tử.
                    </p>
                </div>
               
            </div>
        )
    }
}

export default GioiThieu;