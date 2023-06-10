const mongoose = require("mongoose");

const DB_CONNECTION = process.env.DB_CONNECTION;

exports.initDB = async () => {
  if (DB_CONNECTION === undefined) return;

  await mongoose
    .connect(DB_CONNECTION)
    .then((v) => {
      console.log("MongoDB connected");
    })
    .catch((e) => {
      console.error(`Connection Error ${e}`);
    });
};
