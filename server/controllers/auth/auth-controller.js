const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../../models/User");
const { sendEmail } = require("../../helpers/email");

//register
const registerUser = async (req, res) => {
  const { userName, email, password, firstName, lastName, phone } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      firstName,
      lastName,
      phone,
      verificationToken,
    });

    await newUser.save();

    // Send verification email
    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;
    const subject = 'Verify Your Email';
    const html = `<p>Hi ${firstName},</p><p>Please verify your email by clicking the link below:</p><a href="${verificationUrl}">Verify Email</a>`;
    await sendEmail(email, subject, html);

    res.status(200).json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    if (!checkUser.isVerified) {
      return res.json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
        firstName: checkUser.firstName,
        lastName: checkUser.lastName,
        phone: checkUser.phone,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
        firstName: checkUser.firstName,
        lastName: checkUser.lastName,
        phone: checkUser.phone,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//logout
const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//verify email
const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//forget password
const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Password';
    const html = `<p>Hi ${user.firstName},</p><p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetUrl}">Reset Password</a><p>This link will expire in 1 hour.</p>`;
    await sendEmail(email, subject, html);

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//reset password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const hashPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

//update profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, userName, email, phone } = req.body;
    const userId = req.user.id; // Get userId from auth middleware

    // Validate input
    if (!firstName || !lastName || !userName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if username or email already exists for another user
    const existingUser = await User.findOne({
      $or: [
        { userName, _id: { $ne: userId } },
        { email, _id: { $ne: userId } },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, userName, email, phone },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        userName: updatedUser.userName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware, updateProfile, verifyEmail, forgetPassword, resetPassword };
