function authorize(roles = []) {
    return (req, reply, done) => {
        const userRole = req.user?.role;

        if (userRole && roles.includes(userRole)) {
            done();
        } else { 
            reply.redirect(`/login?messageErr=${encodeURIComponent('Bạn không có quyền truy cập vào trang này!')}`);
        }
    };
}

module.exports = authorize;
