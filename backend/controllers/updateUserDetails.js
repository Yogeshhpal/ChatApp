const UserModel = require("../Models/userModel");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function updateUserDetails(req, res) {
    try {
        const token = req.cookies.token || ""
        const user = await getUserDetailsFromToken(token)
        const { name, email, password, profile_pic } = req.body;
        const updatedUser = await UserModel.findByIdAndUpdate(user._id, {
            name,
            email,
            password,
            profile_pic
        });

        const userInformation=await UserModel.findById(user._id);
        // console.log(userInformation);
        return res.status(200).json({
            message: "User details updated successfully",
            error: false,
            success: true,
            data: userInformation
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = updateUserDetails;