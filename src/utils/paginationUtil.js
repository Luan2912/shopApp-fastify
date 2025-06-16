/**
 * Tính toán thông tin phân trang dựa trên tổng số tài liệu, trang hiện tại và số lượng mỗi trang.
 * 
 * @param {number} totalDocs - Tổng số tài liệu trong collection.
 * @param {number} page - Trang hiện tại được yêu cầu (số nguyên >= 1).
 * @param {number} limit - Số tài liệu trên mỗi trang (số nguyên >= 1).
 * 
 * @returns {{
 *   skip: number, // Số lượng tài liệu cần bỏ qua để lấy dữ liệu cho trang hiện tại (dùng trong .skip()).
 *   limitDoc: number, // Số lượng tài liệu cần lấy (dùng trong .limit()).
 *   pagination: {
 *     currentPage: number, // Trang hiện tại (sau khi được giới hạn nằm trong khoảng [1, totalPage]).
 *     limit: number, // Số lượng tài liệu mỗi trang (limitDoc).
 *     totalDocs: number, // Tổng số tài liệu.
 *     totalPage: number, // Tổng số trang.
 *     nextPage: number|null, // Số trang tiếp theo nếu có, nếu không thì null.
 *     prevPage: number|null // Số trang trước nếu có, nếu không thì null.
 *   }
 * }}
 */


function getPaginationInfo(totalDocs, page, limit) {
    const totalPage = Math.ceil(totalDocs / limit) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPage));
    const nextPage = currentPage < totalPage ? currentPage + 1 : null;
    const prevPage = currentPage > 1 ? currentPage - 1 : null;

    const skip = (currentPage - 1) * limit;
    const limitDoc = Math.min(limit, totalDocs || limit);

    return {
        skip,
        limitDoc,
        pagination: {
            currentPage,
            limit: limitDoc,
            totalDocs,
            totalPage,
            nextPage,
            prevPage
        }
    };
}

module.exports = {
    getPaginationInfo
};
