import express from "express";
import dotenv from "dotenv";
import database from "./db/database.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/PostRoute.js";


dotenv.config();

const app = express();

database;
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(PORT, () =>
  console.log(`server is running on http://localhost:${PORT}`)
);
