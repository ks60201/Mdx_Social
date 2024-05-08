import jwt from 'jsonwebtoken';

const generateJwtToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '365d', // Change the expiration time to 365 days
  });
  // Set the JWT token as a cookie in the response
  res.cookie('jwt', token, {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days in milliseconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    sameSite: 'strict',
  });
  return token;
};

export default generateJwtToken;
