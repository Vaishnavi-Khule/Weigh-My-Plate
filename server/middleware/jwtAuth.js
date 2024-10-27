const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  
  // Fetching token from request
  const token = req.headers["authorization"];

  // If token not present
  if (!token) {
    return res.status(403).json({
        message : "Invalid Token",
        data : null,
        status : "error"
    });
  }

  const tokenPart = token.split(" ");
  if(tokenPart.length < 2 || tokenPart[0] != "Bearer")
  {
    return res.status(401).json({
        message : "Invalid Token",
        data : null,
        status : "error"
    });
  }

  try {
    //Verifying token
    const decoded = jwt.verify(tokenPart[1], process.env.JWTENCRYPTIONTOKEN);
    // console.log(decoded);

    req.userInfo = decoded;
  } 
  catch (err) {
    return res.status(401).json({
        message : "Invalid Token",
        data : null,
        status : "error"
    });
  }

  // Calling next middelware
  return next();
};

module.exports = verifyToken;