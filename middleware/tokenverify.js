const { sign, verify } = require("jsonwebtoken");
const sessionServices = require('../services/sessionsServices');

async function userProfile(req, res, next) {
  const header = req.headers["authorization"];
  if(!header){
    return res.json({
      message: `You are not logged in yet`
    })
  }
  const myarray = header.split(" ");
  const data = myarray[1];
  const currentDate = new Date();
  if (data) {
      verify(data, "createJwtToken", async (err, authData) => {
        if (err) {
          res.status(401).json({
            message: "Unauthorized",
          });
          return;
        } else {
          const session = await sessionServices.findSession({
            sessions_id: authData.sessions_id
          })
          // console.log(session, " <<== session details");
          if (session.logout_date == null && session.expiry_date >= currentDate) {
            req.userdata = authData;
            // console.log(req.userdata);
            next();
          } else {
            return res.status(403).json({
              message: `log in to access data`
            })
          }
        }
      });
  } else {
    res.json({
      message: `You are not logged in yet`,
    });
    return;
  }
}

module.exports = {
  userProfile,
};
