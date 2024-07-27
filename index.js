import connectDB from "./config/db.config.js";
import {server} from "./server.js";

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    connectDB();
    console.log(`Server is up and running on port ${PORT}`);
})
