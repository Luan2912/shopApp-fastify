const userService = require('../services/userService');

const handleUserPage = async (request, reply) => {
    try {
        const db = request.db;
        const users = await userService.getAllUsers(db); // Lấy danh sách người dùng từ DB
        return reply.render('userView', {users}); // Render trang userView và truyền danh sách người dùng
    } catch (error) {
        console.error('>>> Lỗi khi lấy danh sách người dùng:', error);
        return reply.render('userView', {
            users: [],
            message: 'Có lỗi xảy ra khi tải danh sách người dùng!',
            type: 'danger'
        });
    }
};

const handleCreateUser = async (request, reply) => {
    try {
        const {email, username, password} = request.body;
        const db = request.db;

        const result = await userService.createNewUser(db, {email, username, password});
        return reply.redirect('/user'); // Sau khi tạo xong, redirect về trang /user để hiển thị lại danh sách người dùng
    } catch (error) {
        console.error('>>> Lỗi khi tạo người dùng:', error);
        return reply.render('userView', {
            message: 'Lỗi khi tạo người dùng.',
            type: 'danger'
        });
    }
};

// Hiển thị form cập nhật người dùng
const handleUpdateUserPage = async (request, reply) => {
    try {
        const db = request.db;
        const userId = request.params.id;
        const user = await userService.getUserById(db, userId);

        if (!user) {
            return reply.render("updateUserView", {
                user: null,
                message: 'Người dùng không tồn tại.',
                type: 'warning'
            });
        }

        return reply.render('updateUserView', {user});
    } catch (error) {
        console.error('>>> Lỗi khi hiển thị form cập nhật:', error);
        return reply.render('updateUserView', {
            user: null,
            message: 'Lỗi khi hiển thị form cập nhật.',
            type: 'danger'
        });
    }
};

// Cập nhật người dùng
const handleUpdateUser = async (request, reply) => {
    try {
        const db = request.db;
        const userId = request.params.id;
        const {email, username} = request.body;

        const existingUser = await userService.getUserById(db, userId);
        if (!existingUser) {
            return reply.render('updateUserView', {
                user: null,
                message: 'Người dùng không tồn tại hoặc đã bị xóa.',
                type: 'danger'
            });
        }

        await userService.updateUser(db, userId, {email, username});
        return reply.redirect('/user');
    } catch (error) {
        console.error('>>> Lỗi khi cập nhật người dùng:', error);
        return reply.render('updateUserView', {
            user: null,
            message: 'Lỗi khi cập nhật người dùng.',
            type: 'danger'
        });
    }
};

const handleDeleteUser = async (req, rep) => {
    try {
        const db = req.db;
        const userId = req.params.id;
        const user = await userService.getUserById(db,userId)

        if (!user) {
            return rep.send(
                {user: null, message: 'Người dùng không tồn tại.', type: 'warning'}
            );
        }

        await userService.deleteUser(db, userId);
        return rep.redirect('/user');
    } catch (error) {
        console.error(">>>Lỗi xóa người dùng", error);
        throw error;
    }
}

module.exports = {
    handleUserPage,
    handleCreateUser,
    handleUpdateUserPage,
    handleUpdateUser,
    handleDeleteUser
};
