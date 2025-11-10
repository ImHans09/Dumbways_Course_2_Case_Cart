import cors from "cors";

const corsMiddleware = cors({
  origin: `http://localhost:${process.env.PORT}`,
  credentials: true
});

export default corsMiddleware;