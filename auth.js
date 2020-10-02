const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();
const accessTokenSecret = "monkeyddragonhasthehighestbountyinonepiece";
const  authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      
      req.user = user;
      console.log(user);
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

const  isAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
    const token = authHeader.split(' ')[1];

    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.send("Not an Admin");
      }
      req.user = user;
      console.log(user.role);
      if(user.role==="admin"){
        next();
      }
      else{
        res.sendStatus(403);
      }
    });
  
  
};
exports.authenticateJWT = authenticateJWT;
exports.isAdmin = isAdmin;