const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoute");
const placementRoutes = require("./routes/placementRoutes");
const eventRoutes = require("./routes/eventRoutes");
const projectRoutes = require("./routes/projectRoute");
const referralRoutes = require("./routes/referralRoutes");
const mentorship = require("./routes/mentorshipRoutes");
const companyRoutes = require("./routes/topCompanyRoute");
const cors = require("cors");
const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

async function connectionToDb() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);
  } catch (error) {
    console.log("connection cannot be established. ", error);
  }
}
connectionToDb();

app.use("/user", userRoutes);

app.use("/admin", adminRoutes);

app.use("/placement", placementRoutes);

app.use("/event", eventRoutes);

app.use("/project", projectRoutes);

app.use("/referral", referralRoutes);

app.use("/mentorship", mentorship);

app.use("/top-companies", companyRoutes);

const PORT = 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
