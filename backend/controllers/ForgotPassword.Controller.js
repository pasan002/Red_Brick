import userModel from "../Models/User.Model.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const ForgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { email: user.email },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Create reset link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // Check if email credentials are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("Email credentials not set in environment variables");
      return res.status(500).json({
        message: "Email service not configured",
        error: true,
        success: false
      });
    }

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verify transporter configuration
    transporter.verify(function(error, success) {
      if (error) {
        console.error("Email transporter error:", error);
      } else {
        console.log("Email server is ready to take our messages");
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Click the following link to reset your password: ${resetLink}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Password reset link sent to your email",
      success: true,
      error: false
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({
      message: err.message || "Error sending reset link",
      error: true,
      success: false
    });
  }
};

export default ForgotPasswordController; 