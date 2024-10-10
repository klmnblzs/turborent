const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');


const app = express();
dotenv.config();

// FONTOS A BODY PARAMOKHOZ!
// CORS POLICY AZ ANGULAR MIATT
app.use(express.json(), (req,res,next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, id");
  
    next();
});

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});


app.listen(3000, (req, res) =>{
    console.log('Server is running on port 3000');
});

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

app.get('/cars', (req, res) => {
    const carId = req.headers['id']

    if(carId){
        pool.query('call GetCarById(?)', [carId], (err, results) => {
            if(err) return res.status(500).json({error: err.message});
            res.json(results[0]);
        })
        return true
    }

    pool.query('call ListCars', (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results[0]);
    })
    
});

app.get('/filter/categories', (req, res) => {
    pool.query('call GetAllCarCategories', (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results[0]);
    })
    
});

app.get('/filter/brands', (req, res) => {
    pool.query('call GetAllCarBrands', (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results[0]);
    })
    
});



