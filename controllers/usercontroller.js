import generateJwtToken from "../helper/genratetoken.js";
import User from "../models/usermodel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const signupUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      generateJwtToken(user._id, res);
      return res.status(400).json({ message: "User already exists" }); 
    }
    const hashedPassword = await bcryptjs.hash(password, 12);
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    if (newUser) {
      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "User not created" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (passwordMatch) {
      generateJwtToken(user._id, res);
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profilePic: user.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const followUnFollowUser = async (req, res) => {
  try {
    const token = req.cookies.jwt;

if (!token) {
  return res.status(401).json({ message: "Unauthorized" });
}

const decoded = jwt.verify(token, process.env.JWT_SECRET);

console.log("Decoded user ID:", decoded.id);

const currentUser = await User.findById(decoded.userId);
const userToModify = await User.findById(req.params.id);


    console.log("Current user:", currentUser);
    console.log("User to modify:", userToModify);

    if (!currentUser || !userToModify) {
      return res.status(404).json({ error: "User not found" });
    }

    if (currentUser._id.toString() === userToModify._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });
    }

    const isFollowing = currentUser.following.includes(userToModify._id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(userToModify._id, {
        $pull: { followers: currentUser._id },
      });
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: userToModify._id },
      });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow user
      await User.findByIdAndUpdate(userToModify._id, {
        $push: { followers: currentUser._id },
      });
      await User.findByIdAndUpdate(currentUser._id, {
        $push: { following: userToModify._id },
      });
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};
export const updateUser = async (req, res) => {
	const { name, email, username, password, bio ,profilePic } = req.body;

	try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (req.params.id !== userId.toString()) {
      return res.status(400).json({ error: "You cannot update other user's profile" });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.profilePic = profilePic || user.profilePic;
    user = await user.save();
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
    
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in updateUser: ", err.message);
	}
};

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password").select("-email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
