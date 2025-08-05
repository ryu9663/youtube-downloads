import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("건강검진 하러 오셨습니까");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
