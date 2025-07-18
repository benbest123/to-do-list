import { createApp } from "./app";

const PORT = 8000;

const app = createApp();

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
