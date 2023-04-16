const passport = require('passport');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

exports.requireAccessToken = async (req, res, next)=>{
  // Check for JWT token in Authorization header
  const cookieAccessToken = req.cookies.access_token;
  // console.log(cookieAccessToken)
  // console.log(req.cookies, "request")
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  // console.log(authHeader)
  // console.log(token, "token")
  if (token && token != "null") {
    try {
      const decodedToken = jwt.verify(token, process.env.API_SECRET);
    //   console.log(process.env.API_SECRET, "secret")
      if ( decodedToken.id !== req.body.userId) {
        return res.status(403).send('Forbidden');
      }
      next();
    } catch (err) {
        console.log(err)
      return res.status(401).json({ message: 'Invalid JWT token' });
    }
  } 
  else if (cookieAccessToken){
      // if (cookieAccessToken) {
      //   passport.authenticate('google', (err, user, info) => {
      //     if (err || !user) {
      //       return res.status(401).json({ message: 'Invalid Google access token' });
      //     }
      //     next();
      //   })(req, res, next);
      // } 
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      try {
        const ticket = await client.verifyIdToken({
          idToken: cookieAccessToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
    
        next();
      } catch (err) {
        console.error(err);
        return res.status(401).json({ message: 'Invalid Google access token' });
      }
    }
  else {
      // If neither JWT nor Google access token is present, send 401 Unauthorized
      res.status(401).json({ message: 'Unauthorized' });
    }
  }


