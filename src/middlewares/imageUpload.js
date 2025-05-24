
const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');
const crypto = require('crypto');

/**
 * Middleware upload ảnh:
 * - Chỉ cho phép upload file ảnh (jpeg, png, gif)
 * - Đặt tên file duy nhất
 * - Giới hạn kích thước ảnh
 * - Lưu ảnh vào thư mục chỉ định
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

module.exports = imageUpload;



