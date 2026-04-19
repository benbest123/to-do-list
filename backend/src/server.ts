import dotenv from "dotenv";
// load env vars first
dotenv.config();

import { createApp } from "./app";

const PORT = process.env.PORT ?? 8000;

const app = createApp();

app.listen(PORT, "127.0.0.1", () => console.log(`listening on port ${PORT}`));
