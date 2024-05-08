import jwt from 'jsonwebtoken';
import Post from '../models/postmodel.js';
import User from '../models/usermodel.js';

export const createPost = async (req, res) => {
  try {
    const { text, img } = req.body;
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!text) {
      return res.status(400).json({ message: 'Text field is required' });
    }

    const maxLength = 500;
    if (text.length > maxLength) {
      return res.status(400).json({ message: `Text should be less than ${maxLength} characters` });
    }

    const newPost = new Post({
      postedBy: userId, // Use the authenticated user's ID as the postedBy field
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
};

export const getPosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    await Post.findByIdAndDelete(req.params.id); // Corrected line

    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
};

export const likePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Toggle like status using $addToSet and $pull
    if (post.likes.includes(userId)) {
      await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
    } else {
      await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });
    }

    res.status(200).json({ message: 'Like updated successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ error: error.message });
    console.error(error);
  }
};

export const replyToPost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { text } = req.body;

    // Ensure req.user is populated with user data (e.g., profilePic, username)
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!text) {
      return res.status(400).json({ message: 'Text field is required' });
    }
    const newReply = {
      userId,
      text,
      userProfilePic,
      username
    };
    post.replies.push(newReply);
    await post.save();

    res.status(201).json({ message: 'Reply added successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ error: error.message });
    console.error(error);
  }
};
export const getPostfeed = async (req, res) => {
  try{
    const userId = req.user._id;
    const user = await User.findById(userId);
    if(!user){
      return res.status(400).json({message:"User not found"});
    }
    const following = user.following;
    const feedPosts= await Post.find({postedBy:{$in:[...following,userId]}}).sort({createdAt:-1});
    res.status(200).json(feedPosts);
  }
  catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  } 
}