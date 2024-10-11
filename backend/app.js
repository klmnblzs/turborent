const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const cors=require('cors')

const bcrypt=require('bcrypt')

const app = express();

// FONTOS A BODY PARAMOKHOZ!
// CORS POLICY AZ ANGULAR MIATT
app.use(express.json())

app.use(cors({
    origin: '*', // Csak az Angular alkalmazás engedélyezése
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Engedélyezett HTTP-módszerek
    allowedHeaders: ['Content-Type', 'id'], // Engedélyezett fejléc
}));

dotenv.config();

const pool = mysql.createPool({
    connectionLimit: 10,
    queueLimit: 0,
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

app.get('/cars', async (req, res) => {
    const carId = req.headers['id'];

    try {
        if (carId) {
            const [results] = await pool.query('CALL GetCarById(?)', [carId]);
            res.json(results[0]);
        } else {
            const [results] = await pool.query('CALL ListCars()');
            res.json(results[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/customers/register', async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        phone_number,
        driver_license_picture_front,
        driver_license_picture_back,
        date_of_birth,
        post_code,
        city,
        street,
        house_number,
        password,
        isApproved,
        isAdmin
      } = req.body;

      if (!first_name) return res.status(400).json({ message: 'First name is required' });
      if (!last_name) return res.status(400).json({ message: 'Last name is required' });
      if (!email) return res.status(400).json({ message: 'Email is required' });
      if (!phone_number) return res.status(400).json({ message: 'Phone number is required' });
      if (!driver_license_picture_front) return res.status(400).json({ message: 'Driver license front picture is required' });
      if (!driver_license_picture_back) return res.status(400).json({ message: 'Driver license back picture is required' });
      if (!date_of_birth) return res.status(400).json({ message: 'Date of birth is required' });
      if (!post_code) return res.status(400).json({ message: 'Post code is required' });
      if (!city) return res.status(400).json({ message: 'City is required' });
      if (!street) return res.status(400).json({ message: 'Street is required' });
      if (!house_number) return res.status(400).json({ message: 'House number is required' });
      if (!password) return res.status(400).json({ message: 'Password is required' });
      if (isApproved === undefined) return res.status(400).json({ message: 'Approval status (isApproved) is required' });
      if (isAdmin === undefined) return res.status(400).json({ message: 'Admin status (isAdmin) is required' });    

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            const [result] = await pool.execute('CALL RegisterCustomers(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                first_name,
                last_name,
                email,
                phone_number,
                driver_license_picture_front,
                driver_license_picture_back,
                date_of_birth,
                post_code,
                city,
                street,
                house_number,
                hashedPassword,
                isApproved,
                isAdmin
              ])

            if (result.affectedRows > 0) {
                res.status(201).json({ message: 'User registered successfully' });
            } else {
                res.status(500).json({ message: 'Failed to register user' });
            }
        } catch (err) {
            res.status(500).json({ message: 'Internal server error' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
})

app.post('/customers/login', async (req,res) => {
    const {
        email,
        password
    } = req.body

    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });

    try {
        const [hashedPassword] = await pool.query("SELECT password FROM Customers WHERE email = ?", [email])
        const validPassword = hashedPassword[0].password.trim()
        const isPasswordValid = await bcrypt.compare(password, validPassword)

        if(isPasswordValid) {
            try {
                const [results] = await pool.query("CALL LoginCustomer(?, ?)", [ email, validPassword ])
                res.send(results[0])
            } catch (err) {
                res.status(500).json({ error: "Internal server error" })
            }
        } else {
            res.status(401).json({ error: "Wrong password" })
        }
    } catch(err) {
        res.status(500).json({ message: 'Internal server error' });
    }
})

app.post('/customers/login'), async (req,res) => {
    const {
        email,
        password
    } = req.body
    
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });

    try {
        const [hashedPassword] = await pool.query("SELECT password FROM Customers WHERE email = ?", [email])
    } catch(err) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

app.get('/filter/categories', async (req, res) => {
    const [results] = await pool.query("CALL GetAllCarCategories")
    res.json(results[0])
});

app.get('/filter/brands', async (req, res) => {
    const [results] = await pool.query("CALL GetAllCarBrands")
    res.json(results[0])
});
