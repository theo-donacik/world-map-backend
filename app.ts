import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const CONNECTION_STRING =
  process.env.DB_CONNECTION_STRING || "mongodb://localhost:27017/map";
mongoose.connect(CONNECTION_STRING);


import loginRouter from './src/pages/login'
import areaRouter from './src/pages/area'
import timerRouter from './src/pages/timer'

// Create express app
const app = express();

// Middleware
app.use(cors(
    {
        origin: 'http://localhost:3000'
    }
));
app.use('/login', loginRouter);
app.use('/area', areaRouter);
app.use('/timer', timerRouter);
// app.use('/available', availableRouter);
// app.use('/books', bookRouter);
// app.use('/authors', authorRouter);
// app.use('/book_dtls', bookDetailsRouter);
// app.use('/newbook', createBookRouter);

// Start server only if not in test environment
if (process.env.NODE_ENV !== "test") {
    const port = 8000;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

    // Connect to MongoDB only in non-test environments
    // const mongoDB = 'mongodb://127.0.0.1:27017/my_library_db';
    // mongoose.connect(mongoDB);
    // const db = mongoose.connection;

    // db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    // db.on('connected', () => {
    //     console.log('Connected to database');
    // });
}

export default app; // Export only the Express app