const { Op } = require("sequelize");
const db = require("../model/index");

async function createSession({ user_id }) {
  const session = await db.Sessions.create({
    user_id: user_id,
  });
  return session.toJSON();
}

async function updateSession({ login_date, expiry_date, sessions_id }) {
  await db.Sessions.update(
    {
      login_date: login_date,
      expiry_date: expiry_date,
    },
    {
      where: {
        id: sessions_id,
      },
    }
  );
}

async function updateExistingSession({ logout_date, expiry_date, sessions_id }) {
  const [numUpdatedRows] = await db.Sessions.update(
    {
      logout_date: logout_date,
      expiry_date: expiry_date,
    },
    {
      where: {
        id: sessions_id,
      },
    }
  );
  // console.log(numUpdatedRows,"<--- Number of updated rows");
}

async function logoutSession({ date, sessions_id }) {
  const [numUpdatedRows, updatedRows] = await db.Sessions.update(
    { logout_date: date },
    {
      where: {
        id: sessions_id,
      },
    }
  );
  return { numUpdatedRows };
}

async function findSession({ sessions_id }) {
  const session = await db.Sessions.findOne({
    where: {
      id: sessions_id,
    },
    raw: true,
  });
  return session;
}

async function findSessionByUserId({ user_id }) {
  const currentDate = new Date();
  const session = await db.Sessions.findAndCountAll({
    where: {
      user_id: user_id,
      logout_date: null,
      expiry_date: { [Op.gte]: currentDate },
    },
    raw : true
  });
  return session;
}

module.exports = {
  createSession,
  updateSession,
  logoutSession,
  findSession,
  findSessionByUserId,
  updateExistingSession
};
