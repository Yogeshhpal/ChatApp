const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function userDetails(req, res) {
    try {
        const token = req.cookies.token || "";

        if (!token) {
            return res.status(401).json({
                message: "Authentication token is missing",
                error: true
            });
        }

        const user = await getUserDetailsFromToken(token);

        return res.status(200).json({
            message: "User details retrieved successfully",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "An unexpected error occurred",
            error: true
        });
    }
}

module.exports = userDetails;
