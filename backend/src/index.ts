import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { authRouter } from "./routes/auth.js";
import { tripsRouter } from "./routes/trips.js";
import { citiesRouter } from "./routes/cities.js";
import { activitiesRouter } from "./routes/activities.js";
import { usersRouter } from "./routes/users.js";
import { adminRouter } from "./routes/admin.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "globetrotter-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/trips", tripsRouter);
app.use("/api/cities", citiesRouter);
app.use("/api/activities", activitiesRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin", adminRouter);

app.listen(port, () => {
  console.log(`GlobeTrotter API running on http://localhost:${port}`);
});
