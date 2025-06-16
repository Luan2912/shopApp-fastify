// middlewares/optionalAuth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

function optionalAuth(req, reply, done) {
  const token = req.cookies?.token;
  if (token) {
    try {
      const user = jwt.verify(token, process.env.SECRET_KEY);
      req.user = user;
    } catch (err) {
       if (err.name === "TokenExpiredError") {
      // Token hết hạn -> cho qua nhưng không gán user
      req.user = null;
      done();
    } else {
      // Token lỗi -> xử lý tùy ý (cho qua hoặc báo lỗi)
      reply.code(401).send("Token không hợp lệ.");
    }
    }
  }
  done(); // luôn gọi done() dù có token hay không
}

module.exports = optionalAuth;
