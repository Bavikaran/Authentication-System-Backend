import CustomError from '../utils/customError.js';


const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.userType;  

  
    if (!allowedRoles.includes(userRole)) {
      return next(new CustomError(403, 'Access denied. Insufficient role.'));
    }

    next(); 
  };
};

export default checkRole;