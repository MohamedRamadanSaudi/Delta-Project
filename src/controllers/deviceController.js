const User = require('../models/userModel');

const registerToken = async (req, res) => {
  try {
    const { userId, token } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Update the user's device token
    user.deviceToken = token;
    await user.save();

    res.status(200).send({ message: 'Token registered successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { registerToken };
