import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth-route";
import connect from "./databse/connect";



dotenv.config();
const port = process.env.PORT || '3000'
const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json()); // for parsing application/json
app.use(cookieParser()); // for parsing cookies

connect();

app.use("/api/auth", authRoutes);

app.listen(port, () => {
    console.log(`server is running on port ${port}`);

})