const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  updateProfile,
  verifyEmail,
  forgetPassword,
  resetPassword,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/update-profile", authMiddleware, updateProfile);
router.post("/verify-email", verifyEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    },
  });
});

module.exports = router;
