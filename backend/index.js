const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./Config/db');
const path = require('path');
require('dotenv').config();
const { server, app } = require('./socket/index');

// const app = express();
const router = require('./routes');

// Middleware
app.use(cors({
    // origin: "http://localhost:3000",
    origin: "https://omegle-frontend-diex.onrender.com",
    credentials: true
}));

// Handle preflight OPTIONS requests for all routes
app.options('*', cors());

app.use(express.json()); // This should come before routes
app.use(express.urlencoded({ extended: true })); // This should also come before routes
app.use(cookieParser());


// Routes
app.use("/api", router);


const PORT = 8080;
// Connect to Database and Start Server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log("Connected to Database");
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to connect to the database", err);
});

