const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const cors=require('cors')
const multer = require('multer')
const jwt = require('jsonwebtoken')

const bcrypt=require('bcrypt')

const app = express();

// FONTOS A BODY PARAMOKHOZ!
// CORS POLICY AZ ANGULAR MIATT
app.use(express.json())

app.use(cors({
    origin: '*', // Csak az Angular alkalmazás engedélyezése
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Engedélyezett HTTP-módszerek
    allowedHeaders: ['Content-Type', 'id', 'authorization'], // Engedélyezett fejléc
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

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];

    if (token == null) { return res.status(401).json({ message: "Token: null" }); }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token: Invalid" });
        }
        req.user = decoded;
        next();
    });
}

function generateAccessToken(data) {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' })
}

async function generateRefreshToken(userId) {
    if (!userId) {
        res.status(500).json({ error: "User id is required!" })
    }

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    if (!refreshToken) {
        res.status(500).json({ error: "Error while generating refresh token!" })
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );

        return refreshToken;
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Couldn't add the refresh token to the database!" })
    }
}



app.get('/cars', async (req, res) => {
    const carId = req.headers['id'];

    try {
        if (carId) {
            const [results] = await pool.query('CALL GetCarById(?)', [carId]);
            const cars = results[0];
            
            for(let car of cars) {
                const [imageResults] = await pool.query('SELECT thumbnail FROM car_pictures WHERE id = ?', [car.car_picture_id]);

                if (imageResults.length > 0) {
                    const base64Image = Buffer.from(imageResults[0].thumbnail).toString('base64');
                    car.thumbnail = `data:image/jpeg;base64,${base64Image}`;
                } else {
                    car.thumbnail = null; 
                }
            }
            
            res.json(cars);
        } else {
            const [results] = await pool.query('CALL ListCars()');
            const cars = results[0]

            for(let car of cars) {
                const [imageResults] = await pool.query('SELECT thumbnail FROM car_pictures WHERE id = ?', [car.car_picture_id]);

                if (imageResults.length > 0) {
                    const base64Image = Buffer.from(imageResults[0].thumbnail).toString('base64');
                    car.thumbnail = `data:image/jpeg;base64,${base64Image}`;
                } else {
                    car.thumbnail = null;
                }
            }

            res.json(cars);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/cars/:id', async (req, res) => {
    const carId = req.params.id
    
    if(!carId) {
        return res.status(400).json({ message: 'Car ID is required' });
    }

    try {
        const [results] = await pool.query('CALL GetCarById(?)', [carId]);
        const cars = results[0];
        
        for(let car of cars) {
            const [imageResults] = await pool.query('SELECT thumbnail FROM car_pictures WHERE id = ?', [car.car_picture_id]);

            if (imageResults.length > 0 && imageResults[0].thumbnail) {
                const base64Image = Buffer.from(imageResults[0].thumbnail).toString('base64');
                car.thumbnail = `data:image/jpeg;base64,${base64Image}`;
            } else {
                car.thumbnail = null; 
            }
        }
        
        res.json(cars);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
    
})

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/auth/register', upload.fields([ { name:'licensePictureFront' }, { name: 'licensePictureBack' } ]), async (req, res) => {
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
  
    const frontImage = req.files['licensePictureFront'][0].buffer;
    const backImage = req.files['licensePictureBack'][0].buffer;

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
                console.log('No rows affected, customer not created:', customers);
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

app.post('/auth/check-duplicate', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const [results] = await pool.execute('SELECT * FROM customers WHERE email = ?', [email]);
        
        if (results.length > 0) {
            return res.status(400).json({ message: "Email is already taken" });
        }

        return res.status(200).json({ message: "Email is available" });

    } catch (err) {
        console.error("Error checking email:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/auth/login', async (req,res) => {
    const { email, password } = req.body

    if (!email) return res.status(400).json({ message: 'A valid email is required' });
    if (!password) return res.status(400).json({ message: 'A valid password is required' });

    try {
        const [hashedPassword] = await pool.query("SELECT password FROM Customers WHERE email = ?", [email])
        const validPassword = hashedPassword[0].password.trim()
        const isPasswordValid = await bcrypt.compare(password, validPassword)

        if(isPasswordValid) {
            const [results] = await pool.query('CALL Login(?, ?)', [ email, validPassword ])
            if(results[0].length == 0) {
                res.status(401).json({ error: "Wrong password"})
            } else {
                const user = results[0][0]; 
                req.body.id=user.id
                req.body.firstname=user.first_name
                req.body.lastname=user.last_name
                const accessToken = generateAccessToken(req.body)
                const refreshToken = await generateRefreshToken(user.id)
                res.status(200).json({ token: accessToken, refreshToken: refreshToken })
            }
        } else {
            res.status(401).json({ error: "Wrong password" })
        }
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: 'Internal server error' });
    }
})

app.post('/auth/logout', async (req, res) => {
    const { refreshToken } = req.body;
    console.log("LEFUTOTT")

    if (!refreshToken) {
        console.log("refresh required")
        return res.status(400).json({ message: "Refresh Token is required" });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken.replace(/"/g, "")]);
  
        if (rows.length === 0) {
            console.log("rows")
            return res.status(404).json({ message: "Refresh token was not found in the database" });
        }

        const [result] = await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken.replace(/"/g, "")]);

        if (result.affectedRows > 0) {
            console.log("result")
            return res.status(200).json({ message: "Logged out!" });
        } else {
            return res.status(500).json({ message: "Token couldn't be deleted" });
        }

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error while logging out." });
    }
});

app.get('/filter/categories', async (req, res) => {
    const [results] = await pool.query("CALL GetAllCarCategories")
    res.json(results[0])
});

app.get('/filter/brands', async (req, res) => {
    const [results] = await pool.query("CALL GetAllCarBrands")
    res.json(results[0])
});
