const UserModel = require('../Models/userModel');
async function searchUser(req, res) {
    try {
        const { search } = req.body;

        const query = new RegExp(search, 'i', 'g');

        const user = await UserModel.find({
            "$or": [
                { name: query },
                { email: query }
            ]
        }).select("-password")

        return res.status(200).json({
            message: 'User found',
            error: false,
            success: true,
            data: user
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message,
            error: true,
            success: false
        })
    }
}

module.exports = searchUser;