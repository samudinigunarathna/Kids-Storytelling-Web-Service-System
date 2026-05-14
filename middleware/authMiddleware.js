import jwt from "jsonwebtoken";
import user from "../models/userModel.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by id from token payload
        const currentUser = await user.findById(decoded.id).select("-password");
        
        if (!currentUser) {
            return res.status(401).json({ message: "The user belonging to this token no longer exists" });
        }

        // Grant access to protected route
        req.user = currentUser;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired, please login again" });
        }
        res.status(401).json({ message: "Token is not valid" });
    }
};

export const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied, admin only" });
    }
};
