import xss from 'xss'; 

const sanitizeInput = (req, res, next) => {
    for (let key in req.body) {
        if (req.body.hasOwnProperty(key) && typeof req.body[key] === 'string') {
            req.body[key] = xss(req.body[key]);
        }
    }
    next();
 };

 export default sanitizeInput;