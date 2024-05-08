import express from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  followUnFollowUser,
  updateUser,
  getUserProfile
} from "../controllers/usercontroller.js";


const router = express.Router();

router.get("/profile/:username", getUserProfile);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", followUnFollowUser);
router.put("/update/:id",updateUser)

export default router;