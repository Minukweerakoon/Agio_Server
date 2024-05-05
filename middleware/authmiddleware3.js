const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
    try {
        // Extract JWT from Authorization header
        const token = req.headers['authorization'].split(" ")[1];
        
        // Verify JWT
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "Auth failed",
                    success: false
                });
            } else {
                // Check if the decoded JWT payload contains empid
                if (!decoded.empid) {
                    return res.status(401).send({
                        message: "Invalid token: empid not found",
                        success: false
                    });
                }
                
                // Add empid to the request object
                req.body.employeeId = decoded.empid;
                next();
            }
        });
    } catch (error) {
        return res.status(401).send({
            message: "Auth failed",
            success: false
        });
    }
};