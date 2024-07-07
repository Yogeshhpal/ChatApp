const UserModel = require('../Models/userModel');

async function checkEmail(req, res) {
    try {
        const { email } = req.body;

        // Check if email already exists
        const checkEmail = await UserModel.findOne({ email }).select('-password');
        if (!checkEmail) {
            return res.status(400).json({
                message: "Email not exists",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Email verified successfully",
            error: false,
            success: true,
            data: checkEmail
        });

    } catch (err) {
        console.error('Server Error:', err);
        return res.status(500).json({
            message:   err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = checkEmail;
