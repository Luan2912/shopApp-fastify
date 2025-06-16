
const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');
const crypto = require('crypto');

/**
 * Upload ảnh và lưu vào ổ cứng:
 * @param {object} part - Đối tượng chứa thông tin file (được Fastify hoặc thư viện multipart cung cấp), bao gồm:
 *   - part.file: luồng (stream) dữ liệu của ảnh
 *   - part.mimetype: kiểu MIME của file (vd: 'image/jpeg')
 *   - part.filename: tên gốc của file được upload
 * @param {string} folder - Tên thư mục con bên trong thư mục `public/uploads` để lưu ảnh
 * 
 * @returns {string|null} - Trả về đường dẫn tương đối của ảnh đã lưu (vd: '/uploads/avatar-upload/abc.jpg'), hoặc `null` nếu không có file
 * 
 * Tính năng:
 * - Kiểm tra xem có file upload không. Nếu không có, trả về `null`.
 * - Chỉ cho phép upload ảnh có định dạng jpeg, png, gif. Nếu sai định dạng, ném lỗi.
 * - Tạo tên file duy nhất bằng `crypto.randomUUID()` để tránh trùng lặp file.
 * - Tạo thư mục đích nếu chưa tồn tại (sử dụng `fs.mkdirSync` với `recursive: true`)
 * - Ghi nội dung file upload vào thư mục đích bằng `pipeline` (stream xử lý hiệu quả)
 * - Kiểm tra kích thước ảnh sau khi ghi. Nếu vượt quá 5MB, xóa file và ném lỗi.
 * - Trả về đường dẫn tương đối của file (dễ lưu vào DB hoặc frontend dùng để truy cập).
 * 
 * Ghi chú:
 * - Ảnh được lưu vào thư mục: `public/uploads/<folder>/`
 * - Giới hạn kích thước file là 5MB
 * - Nếu không hợp lệ (định dạng hoặc kích thước), ảnh sẽ không được lưu lại.
 */
const imageUpload = async (part, folder) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (!part || !part.file) {
        return null;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(part.mimetype)) {
        throw new Error('Chỉ được upload ảnh (jpeg, png, gif).');
    }

    const uniqueName = crypto.randomUUID() + path.extname(part.filename);
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads', folder);

    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (error) {
        throw new Error('Không thể tạo thư mục upload.');
    }

    const filePath = path.join(uploadDir, uniqueName);

    await pipeline(part.file, fs.createWriteStream(filePath));

    // Kiểm tra kích thước file (sau khi upload)
    const fileStats = fs.statSync(filePath);
    if (fileStats.size > MAX_SIZE) {
        fs.unlinkSync(filePath);
        throw new Error('Kích thước ảnh vượt quá giới hạn 5MB.');
    }

    return filePath.replace(path.join(__dirname, '..', 'public'), '');
};


/**
 * Xóa ảnh khỏi ổ đĩa
 * 
 * @param {string} imagePath - Đường dẫn tương đối của ảnh (ví dụ: 'avatar-upload/abc.jpg')
 * @returns {object} - Trả về đối tượng gồm `success` (true/false) và `message` mô tả kết quả
 * 
 * Chức năng:
 * - Chuyển đường dẫn tương đối thành đường dẫn tuyệt đối tới thư mục /public/uploads
 * - Kiểm tra file có tồn tại không
 * - Nếu tồn tại thì xóa file khỏi hệ thống
 * - Nếu không tồn tại hoặc có lỗi thì log lỗi và trả về thông báo thất bại
 */
const deleteImageFromDisk = (imagePath)=>{
    try{
        const filePath = path.join(__dirname, '..', 'public', imagePath);
        // console.log(`>>>filePath: ${filePath}`);
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);//Xóa tệp ảnh
            return{
                success: true,
                message: `Xóa ảnh có đường dẫn ${imagePath} thành công!`
            }
        }else{
            console.log(`>>>${imagePath} không tồn tại!`)
            return{
                success: false,
                message: `Xóa ảnh có đường dẫn ${imagePath} thất bại!`
            }
        }
    }catch(error){
        console.log(">>>Xóa ảnh thất bại: ", error);
    }
}

module.exports = {
    imageUpload,
    deleteImageFromDisk

};



