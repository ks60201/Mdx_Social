import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js';

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    req.user = user; // Attach user data to the request object
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error('Error in protectRoute:', err.message);
  }
};

export default protectRoute;
