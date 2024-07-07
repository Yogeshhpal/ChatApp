const bcrypt = require('bcryptjs');
const UserModel = require('../Models/userModel');

async function registerUser(req, res) {
    try {
        const { name, email, password, profile_pic } = req.body;

        // Check if email already exists
        const checkEmail = await UserModel.findOne({ email });
        if (checkEmail) {
            return res.status(400).json({
                message: "Email already exists",
                error: true,
                success: false
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user payload
        const payload = {
            name,
            email,
            password: hashedPassword,
            profilePic: profile_pic
        };

        // Save the new user to the database
        const user = new UserModel(payload);
        const userSave = await user.save();
        console.log(userSave);
        return res.status(201).json({
            message: "User Registered Successfully",
            error: false,
            success: true,
            data: userSave
        });

    } catch (err) {
        console.error('Server Error:', err); // Log the error for debugging
        return res.status(500).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = registerUser;
