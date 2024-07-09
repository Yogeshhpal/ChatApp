const jwt = require('jsonwebtoken')
const UserModel = require('../Models/userModel')

const getUserDetailsFromToken = async (token) => {

    if (!token) {
        return {
            message: "session out",
            logout: true,
        }
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decode.id).select('-password')

    return user
}

module.exports = getUserDetailsFromToken