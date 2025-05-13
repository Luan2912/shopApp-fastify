
const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');
const crypto = require('crypto');

/**
 * Middleware upload ảnh
 * - Chỉ cho phép upload file ảnh (jpeg, png, gif)
 * - Đặt tên file duy nhất
 * - Giới hạn kích thước ảnh
 * - Lưu ảnh vào thư mục chỉ định
 */

// const imageUpload = async (req, rep, folder) => {
//     try {   
//         const data = await req.file({
//             limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn file 5MB
//         });

//         const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
//         if (!allowedTypes.includes(data.mimetype)) {
//             return rep.status(400).send({ message: 'Chỉ được upload ảnh (jpeg, png, gif).' });
//         }

//         const uniqueName = crypto.randomUUID() + path.extname(data.filename);
//         const uploadDir = path.join(__dirname, '..', `uploads/${folder}`);

//         fs.mkdirSync(uploadDir, { recursive: true });

//         const filePath = path.join(uploadDir, uniqueName);
//         await pipeline(data.file, fs.createWriteStream(filePath));

//         if (data.file.truncated) {
//             fs.unlinkSync(filePath);
//             return rep.status(400).send({ message: 'Kích thước ảnh vượt quá giới hạn 5MB.' });
//         }

//         return filePath;
//     } catch (error) {
//         rep.status(500).send({ message: 'Lỗi khi xử lý file.', error: error.message });
//     }
// };

const imageUpload = async (part, folder) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(part.mimetype)) {
        throw new Error('Chỉ được upload ảnh (jpeg, png, gif).');
    }

    const uniqueName = crypto.randomUUID() + path.extname(part.filename);
    const uploadDir = path.join(__dirname, '..','public', 'uploads',`${folder}`);

    fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await pipeline(part.file, fs.createWriteStream(filePath));

    return filePath;
};

module.exports = imageUpload;
