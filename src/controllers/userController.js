const userService = require('../services/userService');
const querystring = require('querystring');
// const {type} = require('os');

const handleUserPage = async (request, reply) => {
    try {
        const {users, pagination} = await userService.getUsers(request);
        return reply.render('pages/userView', {
            title: 'Manage-User',
            users,
            pagination,
            query: request.query
        });
    } catch (error) {
        console.error('>>> Lỗi khi lấy danh sách người dùng:', error);
        return reply.render('pages/userView', {
            title: 'Manage-User',
            users: [],
            pagination: {},
            message: 'Có lỗi xảy ra khi tải danh sách người dùng!',
            type: 'danger'
        });
    }
};

const handleCreateUserPage = async (request, reply) => {
    try {

        const query = querystring.stringify(request.query);
        console.log("query: ", query)
        return reply.render('pages/createUserView', {
            title: 'Create-User',
            data: {},
            messageErr: [],
            query

        })
    } catch (error) {
        console.error('>>>Lỗi tạo trang Create User:', error);
        return reply.send({message: 'Có lỗi xảy ra khi tạo trang tạo người dùng!'})
    }
}

const handleCreateUser = async (req, reply) => {
    try {

        const query = querystring.stringify(req.query);

        const db = req.db;
        const data = req.validatedUserData;
        const messageErr = []
        

        if (req.validationErrors) {
            messageErr.push(...req.validationErrors);
             return reply.render('pages/createUserView', {
                title: 'Create-User',
                messageErr,
                data: data,
                query
            })
        }

        const result = await userService.createNewUser(db, {
            email: data.email,
            username: data.username,
            password: data.password,
            phoneNumber: data.phoneNumber || null,
            age: data.age || null,
            gender: data.gender || null,
            address: data.address || null,
            role: data.role || 'customer',
            avatarPath: data.avatar || null
        });

        if (result.messageErr) {
            messageErr.push(result.messageErr)

        }

        if (messageErr.length > 0) {
            console.log(messageErr, messageErr.length)
            return reply.render('pages/createUserView', {
                title: 'Create-User',
                messageErr,
                data: data,
                query
            })
        }

        return reply.redirect(`/user?${query}`);
    } catch (error) {
        console.error('>>> Lỗi khi tạo người dùng:', error);
    }
};

// Hiển thị form cập nhật người dùng
const handleUpdateUserPage = async (request, reply) => {
    try {
        const db = request.db;
        const userId = request.params.id;
        const result = await userService.getUserById(db, userId);
        const query = querystring.stringify(request.query)
        if (result.success === false) {
            return reply.render("pages/updateUserView", {
                title: 'Profile User',
                user: null,
                messageErr: [result.messageErr],
                query

            });
        }

        return reply.render('pages/updateUserView', {
            title: 'Profile User',
            user: result.userExist,
            query,
            messageErr: [],
            messageSuccess: null
        });
    } catch (error) {
        console.error('>>> Lỗi khi hiển thị form cập nhật:', error);
    }
};

// Cập nhật người dùng
const handleUpdateUser = async (request, reply) => {
    try {
        const db = request.db;
        const userId = request.params.id;
        const query = querystring.stringify(request.query)
        let user = (await userService.getUserById(db, userId)).userExist;
        console.log("USER: ", user)
        const data = request.validatedUserData;
        console.log("DATA", data)
        const updateData = {};
        if (data.avatar) {
            updateData.avatarPath = data.avatar
        }

        const messageErr = []
        let stopUpdateUser = false;

        if (request.validationErrors) {
            messageErr.push(...request.validationErrors);
            console.log(messageErr)
            stopUpdateUser = true
        }

        if (stopUpdateUser) {
            return reply.render('pages/updateUserView', {
                title: 'Update-User',
                user,
                messageErr,
                query,
                type: 'warning',
                messageSuccess: null
            })
        }

        for (const key in data) {
            // So sánh nếu field tồn tại trong user và khác giá trị thì thêm vào updateData
            if (data[key] !== undefined && user[key] !== undefined && data[key] !== user[key]) {
                updateData[key] = data[key];
            }
        }

        if (updateData.avatarPath) {
            userService.deleteAvatar(user.avatarPath);
        }

        if (Object.keys(updateData).length === 0) {
            messageErr.push('Không có thông tin nào được cập nhật');
        }

        console.log("UPDATE DATA: ", updateData)

        const result = await userService.updateUser(db, userId, updateData);

        if (result.messageErr) {
            messageErr.push(result.messageErr)

        }

        if (messageErr.length > 0) {
            console.log(messageErr, messageErr.length)
            return reply.render('pages/updateUserView', {
                title: 'Profile User',
                user,
                messageSuccess: null,
                query,
                messageErr,
                type: 'warning'
            })
        }

        const userUpdated = (await userService.getUserById(db, userId)).userExist;
        console.log("USER UPDATED: ", userUpdated)
        return reply.render('pages/updateUserView', {
            title: 'Profile User',
            user: userUpdated,
            messageSuccess: 'Cập Nhật Ngưởi Dùng Thành Công!',
            query,
            messageErr: [],
            type: 'success'
        })
    } catch (error) {
        console.error('>>> Lỗi khi cập nhật người dùng:', error);
    }
};

const handleDeleteUser = async (req, rep) => {
    try {
        const db = req.db;
        const userId = req.params.id;
        const user = await userService.getUserById(db, userId)

        if (!user) {
            return rep.send(
                {user: null, message: 'Người dùng không tồn tại.', type: 'warning'}
            );
        }

        userService.deleteAvatar(user.userExist.avatarPath);

        await userService.deleteUser(db, userId);
        const query = req.query;

        //  Chuyển thành chuỗi query string
        const qs = querystring.stringify(query);
        // Redirect về trang user kèm query string giữ nguyên
        const redirectUrl = `/user${qs
            ? '?' + qs
            : ''}`;
        return rep.redirect(redirectUrl);
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
    handleDeleteUser,
    handleCreateUserPage
};
