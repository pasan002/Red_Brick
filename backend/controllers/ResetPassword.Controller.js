import userModel from "../Models/User.Model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
dotenv.config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

const ResetPasswordController = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    if (!decoded) {
      return res.status(400).json({
        message: "Invalid or expired token",
        error: true,
        success: false
      });
    }

    // Find user
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false
      });
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashPwd = bcrypt.hashSync(password, salt);

    // Update password
    user.pwd = hashPwd;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
      success: true,
      error: false
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Error resetting password",
      error: true,
      success: false
    });
  }
};

export default ResetPasswordController; 