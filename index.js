import connectDB from "./config/db.config.js";
import {server} from "./server.js";

server.listen(8000, () => {
    connectDB();
    console.log("Server is up and running on port 8000");
})
