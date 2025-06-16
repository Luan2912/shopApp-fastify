const { createHmac } = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config();


const SECRET_KEY = process.env.SECRET_KEY;

const login = async (db, data) => {
  const { email, password } = data;
  const userCollection = db.collection("users");

  const user = await userCollection.findOne({ email });
  if (!user) {
    return { success: false, messageErr: "Email hoặc mật khẩu không đúng" };
  }

  const hmac = createHmac("sha256", user.salt);
  const hashedInputPassword = hmac.update(password).digest("hex");

  if (hashedInputPassword !== user.hpass) {
    return { success: false, messageErr: "Email hoặc mật khẩu không đúng" };
  }

  const role = user.role;
  const token = jwt.sign(
    { id: user._id, role, username: user.username },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  return {
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      role
    },
  };
};


module.exports = { login};
