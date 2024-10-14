const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const cors=require('cors')
const multer = require('multer')

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

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/customers/register', upload.fields([ { name:'licensePictureFront' }, { name: 'licensePictureBack' } ]), async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        phone_number,
        date_of_birth,
        post_code,
        city,
        street,
        house_number,
        password,
      } = req.body;

    if (!first_name) return res.status(400).json({ message: 'First name is required' });
    if (!last_name) return res.status(400).json({ message: 'Last name is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!phone_number) return res.status(400).json({ message: 'Phone number is required' });
    if (!date_of_birth) return res.status(400).json({ message: 'Date of birth is required' });
    if (!post_code) return res.status(400).json({ message: 'Post code is required' });
    if (!city) return res.status(400).json({ message: 'City is required' });
    if (!street) return res.status(400).json({ message: 'Street is required' });
    if (!house_number) return res.status(400).json({ message: 'House number is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
  

      // Ellenőrizzük, hogy a képek feltöltésre kerültek-e
    const frontImage = req.files['licensePictureFront'][0].buffer;
    const backImage = req.files['licensePictureBack'][0].buffer;

    console.log('Uploaded files:', req.files);

    if (!frontImage) return res.status(400).json({ message: 'Driver license front picture is required' });
    if (!backImage) return res.status(400).json({ message: 'Driver license back picture is required' });

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            const [customers] = await pool.execute('CALL RegisterCustomers(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                first_name,
                last_name,
                email,
                phone_number,
                date_of_birth,
                post_code,
                city,
                street,
                house_number,
                hashedPassword,
              ]);

            console.log(customers)
            

            if (customers.length > 0 && customers[0].length > 0) {
                const customerId = customers[0][0]['LAST_INSERT_ID()'];
                const [pictures] = await pool.execute(
                    'INSERT INTO driver_license_pictures (customer_id, picture_front, picture_back) VALUES (?, ?, ?)',
                    [customerId, frontImage, backImage]
                );

                if (pictures.affectedRows > 0) {
                    return res.status(201).json({ message: 'User and license pictures registered successfully' });
                } else {
                    return res.status(500).json({ message: 'Failed to insert license pictures' });
                }
            } else {
                console.error('No rows affected, customer not created:', customers);
                return res.status(500).json({ message: 'Failed to register user' });
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Internal server error (első catch) ' });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal server error (második catch)' });
    }
})

app.post('/customers/login', async (req,res) => {
    const { email, password } = req.body

    if (!email) return res.status(400).json({ message: 'A valid email is required' });
    if (!password) return res.status(400).json({ message: 'A valid password is required' });

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
