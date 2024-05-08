import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const database = mongoose
  .connect(process.env.DATA_URL)
  .then(() => {
    console.log("database is connected");
  })
  .catch((error) => {
    console.error("database connection error:", error);
  });

export default database;
