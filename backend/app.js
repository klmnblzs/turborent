const express = require('express');
const cors=require('cors')
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser")

const authRoutes = require('./routes/authRouter');
const userRoutes = require('./routes/userRouter');
const contactRoutes = require('./routes/contactRouter');
const filterRoutes = require('./routes/filterRouter');
const carRoutes = require('./routes/carRouter');
const adminRoutes = require('./routes/adminRouter');

const app = express();

// FONTOS A BODY PARAMOKHOZ!
// CORS POLICY AZ ANGULAR MIATT
app.use(express.json())

// Hogy tudjuk kezelni a refresh tokent, mint cookie
app.use(cookieParser())

// Rejtett adatok elérése
dotenv.config();

app.use(cors({
    origin: 'http://localhost:4200', // Csak az Angular alkalmazás engedélyezése
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Engedélyezett HTTP-módszerek
    allowedHeaders: ['Content-Type', 'id', 'authorization'], // Engedélyezett fejléc
    credentials: true // Engedélyezi a cookie-k használatát
}));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use(contactRoutes);
app.use('/filter', filterRoutes);
app.use('/cars', carRoutes);
app.use('/admin', adminRoutes);

app.listen(3000, (req, res) =>{
    console.log('Server is running on port 3000');
});

module.exports = app;