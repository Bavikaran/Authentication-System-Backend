const authorizedRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.userType)) {
            return res.status(403).json({ success: false, message: "Forbidden - You do not have permission to access this resource" });
        }
        next()
    };
};

export default authorizedRoles;   