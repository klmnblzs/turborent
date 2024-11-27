const express = require('express');
const cors=require('cors')
const multer = require('multer')

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken')
const bcrypt=require('bcrypt')
const nodemailer = require('nodemailer');
const path = require('path')

const fs = require('fs')
const crypto = require('crypto')

const app = express();

// FONTOS A BODY PARAMOKHOZ!
// CORS POLICY AZ ANGULAR MIATT
app.use(express.json())
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
});

app.use(cors({
    origin: '*', // Csak az Angular alkalmazás engedélyezése
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Engedélyezett HTTP-módszerek
    allowedHeaders: ['Content-Type', 'id', 'authorization'], // Engedélyezett fejléc
}));




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

// JSONWEBTOKEN

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
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
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

// JELSZÓ VISSZAÁLLÍTÁSA

app.post('/user/request-reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        const [results] = await pool.query('SELECT id FROM customers WHERE email = ?', [email] )
        if(results.length > 0) {
            const customerId = results[0].id;

            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 3600000); // 1 ÓRA

            const [saveToken] = await pool.query('CALL SaveResetToken(?, ?, ?)', [customerId, token, expiresAt])

            if(saveToken.affectedRows > 0) {
                const htmlFilePath = path.join(__dirname, 'reset-password.html');
                let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
                htmlContent = htmlContent.replace('{{reset_link}}', "http://localhost:4200/reset-password?token=" + token)

                const mailOptions = {  
                    from: process.env.MAIL_USER,
                    to: email,
                    subject: 'TurboRent - Jelszó visszaállítása',
                    html: htmlContent 
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        return res.status(400).json({ message:"Email sending failed" })
                    } else {
                        console.log(info)
                        return res.status(200).json({ message: "Email sent" })
                    }
                });
            } else {
                res.status(500).json({ message: 'Error saving reset token' });
            }
        } else {
            return res.status(401).json({ message: "User not found" });
        }
    } catch(err) {
        console.log(err)
        res.status(500).json({ message:"Internal server error" })
    }
})

app.get('/user/validate-reset-token', async (req, res) => {
    const { token } = req.query;

    try {
        const [results] = await pool.query('CALL ValidateResetToken(?)', [ token ])
        console.log(results)
        if(results.length > 0) {
            const token_id = results[0][0].reset_token_id;
            const customer_id = results[0][0].token_customer_id

            if (!token_id) {
                return res.status(400).json({ message:'Invalid or expired token.'});
            } else {
                res.send({ token_id, customer_id });
            }
        } else {
            return res.status(401).json({ message: "Token invalid" });
        }
    } catch(err) {
        console.log(err)
        res.status(500).json({ message:"Internal server error" })
    }
});

app.post('/user/reset-password', async (req, res) => {
    const { 
        token,
        customer_id,
        password
    } = req.body

    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        const [results] = await pool.query('UPDATE customers SET password = ? WHERE id = ?', [hashedPassword, customer_id])

        if(results.affectedRows > 0) {
            const [deleteToken] = await pool.query('CALL DeleteResetToken(?)', [token])

            if(deleteToken.affectedRows > 0) {
                res.status(200).json({ message: "Password reset!" })
            }
        } else {
            return res.status(401).json({ message: "Password update failed" });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message:"Internal server error" })
    }
})

// AUTÓK

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

app.post('/cars/is-available', async (req, res) => {
    const { car_id, start_date, end_date } = req.body;

    try {
        const query = `
            SELECT * 
            FROM reservations 
            WHERE car_id = ? 
              AND (
                (start_date <= ? AND end_date >= ?)
                OR
                (start_date >= ? AND start_date <= ?)
            );
        `;
        
        const [results] = await pool.query(query, [car_id, start_date, end_date, start_date, end_date]);

        if (results.length > 0) {
            return res.status(400).json({ message: "The car isn't available" });
        }

        res.status(200).json({ message: "The car is available" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error." });
    }
});

// AUTH

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
                const pictureId = pictures.insertId

                const [approval] = await pool.execute('CALL CreateApproval(?,?)', [customerId, pictureId] )

                if (pictures.affectedRows > 0 && approval.affectedRows > 0) {
                    const htmlFilePath = path.join(__dirname, 'register-request.html');
                    let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
                    // htmlContent = htmlContent.replace('{{reset_link}}', "http://localhost:4200/reset-password?token=" + token)

                    const mailOptions = {  
                        from: process.env.MAIL_USER,
                        to: email,
                        subject: 'TurboRent - Regisztráció',
                        html: htmlContent 
                    };

                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            return res.status(400).json({ message:"Email sending failed" })
                        } else {
                            console.log(info)
                            return res.status(200).json({ message: "Email sent" })
                        }
                    });
                } else {
                    return res.status(500).json({ message: 'Failed to insert user, approval and license pictures' });
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
                req.body.email=user.email
                req.body.phonenumber=user.phone_number
                req.body.dateofbirth=user.date_of_birth
                req.body.postcode=user.post_code
                req.body.city=user.city
                req.body.street=user.street
                req.body.housenumber=user.house_number
                req.body.password=user.password
                req.body.isAdmin=user.isAdmin
                req.body.isApproved=user.isApproved

                const accessToken = generateAccessToken(req.body)
                const refreshToken = await generateRefreshToken(user.id)
                res.status(200).json({ token: accessToken, refreshToken: refreshToken, userid: user.id })
            }
        } else {
            res.status(401).json({ error: "Wrong password" })
        }
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: 'Internal server error' });
    }
})

app.post('/auth/logout', authenticateToken, async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: "Refresh Token is required" });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken.replace(/"/g, "")]);
  
        if (rows.length === 0) {
            return res.status(404).json({ message: "Refresh token was not found in the database" });
        }

        const [result] = await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken.replace(/"/g, "")]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "Logged out!" });
        } else {
            return res.status(500).json({ message: "Token couldn't be deleted" });
        }

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error while logging out." });
    }
});

app.post('/auth/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: "Adj meg egy refresh tokent" });
    }

    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) return res.status(403).json({ message: "Érvénytelen refresh token" });

            const [rows] = await pool.execute('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);

            if (rows.length === 0) {
                return res.status(403).json({ message: "Érvénytelen refresh token" });
            }

            await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);

            const newRefreshToken = await generateRefreshToken(user.userId);
            const newAccessToken = generateAccessToken({ id: user.userId }); 

            res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        });
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Érvénytelen refresh token" });
        }
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ADMIN

app.post('/admin/car/delete', authenticateToken, async (req, res) => {
    const {
        id
    } = req.body

    if(!id) return res.status(400).json({ message: "Car ID is required" })
    
    try {
        const [results] = await pool.execute("CALL DeleteCar(?)", [ id ])

        if(results) {
            res.status(200).json({ message: "Car deleted!" })
        } else {
            res.status(500).json({ error: "Error while deleting car" })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post('/admin/car/add', authenticateToken, upload.fields([ { name: 'thumbnail' } ]), async (req, res) => {
    const {
        brand,
        model,
        cc,
        year,
        licensePlate,
        category,
        available,
        pricePerDay,
        mileage,
        isDiesel,
        lastServiceDate,
        seats,
        doors,
        isManual,
        description,
        equipments,
      } = req.body;
      
    if (!brand) return res.status(400).json({ message: 'Brand is required' });
    if (!model) return res.status(400).json({ message: 'Model is required' });
    if (!cc) return res.status(400).json({ message: 'Engine capacity (cc) is required' });
    if (!year) return res.status(400).json({ message: 'Year is required' });
    if (!licensePlate) return res.status(400).json({ message: 'License plate is required' });
    if (!category) return res.status(400).json({ message: 'Category is required' });
    if (!available) return res.status(400).json({ message: 'Available is required' });
    if (!pricePerDay) return res.status(400).json({ message: 'Price per day is required' });
    if (!mileage) return res.status(400).json({ message: 'Mileage is required' });
    if (!seats) return res.status(400).json({ message: 'Seats is required' });
    if (!doors) return res.status(400).json({ message: 'Doors is required' });
    if (!isDiesel) return res.status(400).json({ message: 'Fuel type (isDiesel) is required' });
    if (!isManual) return res.status(400).json({ message: 'Transmission type (isManual) is required' });
    if (!lastServiceDate) return res.status(400).json({ message: 'Last service type is required' });
    if (!description) return res.status(400).json({ message: 'Description is required' });
    if (!equipments) return res.status(400).json({ message: 'Equipments are required!' });

    const thumbnailImage = req.files['thumbnail'][0].buffer;
    if (!thumbnailImage) return res.status(400).json({ message: 'Thumbnail' });

    try {
        const [pictures] = await pool.execute(
            'INSERT INTO car_pictures (thumbnail) VALUES (?)',
            [thumbnailImage]
        );

        if(pictures.affectedRows > 0) {
            const pictureId = pictures.insertId

            const [results] = await pool.execute('CALL AddCar2(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', 
                [
                    brand,
                    model,
                    cc,
                    year,
                    licensePlate,
                    category,
                    available,
                    pricePerDay,
                    mileage,
                    isDiesel,
                    lastServiceDate,
                    seats,
                    doors,
                    isManual,
                    pictureId
                ])
            
            if(results.length > 0 && results[0].length > 0) {
                const carId = results[0][0]['LAST_INSERT_ID()']

                const [insertDescription] = await pool.execute(
                    'INSERT INTO car_data (car_id, description, equipments) VALUES (?,?,?)',
                    [carId, description, equipments]
                );

                if(insertDescription.affectedRows > 0) {
                    res.status(200).json({ message: "Success!" })
                } else {
                    res.status(500).json({ message: "Error!" })
                }
            } else {
                res.status(500).json({ message: "Error!" })
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
})

// REGISZTRÁCIÓ JÓVÁHAGYÁS

app.get('/admin/registration/approvals', authenticateToken, async (req, res) => {
    const [results] = await pool.query('CALL ListApprovals()');

    res.json(results[0]);
})

app.get('/admin/registration/approvals/:id', authenticateToken, async (req, res) => {
    const id = req.params.id

    try {
        const [results] = await pool.query('CALL GetApprovalById(?)', [ id ]);

        if(results.length > 0) {
            for (let approval of results[0]) {
                const [imageResults] = await pool.query('SELECT picture_front, picture_back FROM driver_license_pictures WHERE id = ?', [approval.picture_set_id]);

                if (imageResults.length > 0) {
                    const frontImageBase64 = Buffer.from(imageResults[0].picture_front).toString('base64');
                    approval.picture_front = `data:image/jpeg;base64,${frontImageBase64}`;

                    const backImageBase64 = Buffer.from(imageResults[0].picture_back).toString('base64');
                    approval.picture_back = `data:image/jpeg;base64,${backImageBase64}`;
                } else {
                    approval.picture_front = null;
                    approval.picture_back = null;
                }
            }
            res.json(results[0]);
        } else {
            res.status(400).json({ message: "Error while fetching approval" });
        }
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" });
    }
})

app.post('/admin/registration/approvals/approve', async (req, res) => {
    const { customer_id, admin_id } = req.body;

    try {
        const [results] = await pool.query('CALL ApproveRequest(?, ?)', [ customer_id, admin_id ]);
        customer=results[0][0]

        const htmlFilePath = path.join(__dirname, 'registration-approve.html');
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

        const mailOptions = {  
            from: process.env.MAIL_USER,
            to: customer.email,
            subject: 'TurboRent - Regisztráció visszaigazolás',
            html: htmlContent 
        };

        if(results.length > 0) {
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    return res.status(400).json({message:"Approve failed"})
                } else {
                    return res.status(200).json({message:"Request Approved"})
                }
            });
        } else {
            return res.status(400).json({message:"Approve failed"})
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
})

app.post('/admin/registration/approvals/deny', async (req, res) => {
    const { customer_id } = req.body;

    try {
        const [results] = await pool.query('CALL DenyApproveRequest(?)', [ customer_id ]);
        const customer = results[0][0]

        const htmlFilePath = path.join(__dirname, 'registration-deny.html');
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

        const mailOptions = {  
            from: process.env.MAIL_USER,
            to: customer.email,
            subject: 'TurboRent - Regisztráció visszaigazolás',
            html: htmlContent 
        };

        if(results.length > 0) {
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error)
                } else {
                    console.log(info)
                }
                return res.status(200).json({message:"Request Approved"})
            });
        } else {
            return res.status(400).json({message:"Approve failed"})
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
})

// BÉRLÉS JÓVÁHAGYÁS

app.get('/admin/renting/approvals', async (req, res) => {
    const [results] = await pool.query('CALL ListRentApprovals()');

    res.json(results[0]);
})

app.get('/admin/renting/approvals/:id', async (req, res) => {
    const rental_id = req.params.id

    try {
        const [results] = await pool.query('CALL GetRentApprovalById(?)', [ rental_id ]);
        if(results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(400).json({ message: "Error while fetching approval" });
        }
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" });
    }
})

app.post('/admin/renting/approvals/approve', async (req, res) => {
    const { rental_id, admin_id } = req.body;

    try {
        const [results] = await pool.query('CALL ApproveRentRequest(?, ?)', [ rental_id, admin_id ]);
        const htmlFilePath = path.join(__dirname, 'renting-approve.html');
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

        const mailOptions = {  
            from: process.env.MAIL_USER,
            to: results[0][0].customer_email,
            subject: 'TurboRent - Bérlési visszaigazolás',
            html: htmlContent 
        };

        if(results.length > 0) {
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error)
                } else {
                    console.log(info)
                }
                return res.status(200).json({message:"Request Approved"})
            });
        } else {
            return res.status(400).json({message:"Approve failed"})
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
})

app.post('/admin/renting/approvals/deny', async (req, res) => {
    const { rental_id } = req.body;

    try {
        const [results] = await pool.query('CALL DenyRentRequest(?)', [ rental_id ]);

        const htmlFilePath = path.join(__dirname, 'renting-approve.html');
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

        const mailOptions = {  
            from: process.env.MAIL_USER,
            to: results[0][0].customer_email,
            subject: 'TurboRent - Bérlési visszaigazolás',
            html: htmlContent 
        };

        if(results.length > 0) {
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error)
                } else {
                    console.log(info)
                }
                return res.status(200).json({message:"Request Approved"})
            });
        } else {
            return res.status(400).json({message:"Approve failed"})
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
})

// BÉRLÉS !!

app.post('/user/rent', async (req, res) => {
    const { 
        car_id,
        customer_id,
        rent_from,
        rent_to
     } = req.body;

    try {
        const [results] = await pool.query('CALL CreateRentApproval(?,?,?,?)', [ car_id, customer_id, rent_from, rent_to ]);
        const email = results[0][0].email
        if(results.length > 0) {

            const htmlFilePath = path.join(__dirname, 'registration-reassure.html');
            let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
            // htmlContent = htmlContent.replace('{{reset_link}}', "http://localhost:4200/reset-password?token=" + token)

            const mailOptions = {  
                from: process.env.MAIL_USER,
                to: email,
                subject: 'TurboRent - Foglalás visszaigazolás',
                html: htmlContent 
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    return res.status(400).json({ message:"Email sending failed" })
                } else {
                    console.log(info)
                    return res.status(200).json({ message: "Email sent" })
                }
            });
        } else {
            return res.status(400).json({message:"Request creation failed"})
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
})


// AUTH

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
        console.log("Error checking email:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/user/data/:id', async (req, res) => {
    const userid = req.params.id

    try {
        const [results] = await pool.execute('CALL GetCustomerById(?)', [ userid ])
        res.send(results[0][0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.get('/user/rent-history/:id', async (req, res) => {
    const userid = req.params.id

    try {
        const [results] = await pool.execute('CALL GetRentHistory(?)', [ userid ])
        res.send(results[0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/user/edit/', authenticateToken, async (req, res) => {
    const {
        firstname,
        lastname,
        postcode,
        city,
        street,
        housenum,
        id
    } = req.body

    try {
        const [results] = await pool.execute('CALL UpdateCustomerPersonalData(?,?,?,?,?,?,?)', [ firstname, lastname, postcode, city, street, housenum, id ])
    
        if(results) {
            return res.status(200).json({ message: "Customer data updated" })
        } else {
            return res.status(500).json({ message: "Error while updating customer's personal data" });

        }
    } catch(err) {
        console.log(err)
        return res.status(500).json({error: "Internal server error"})
    }


})

app.post('/user/edit/password', authenticateToken, async (req, res) => {
    const {
        id,
        oldpassword,
        newpassword
    } = req.body

    
    try {
        [hashedPassword] = await pool.query("SELECT password FROM Customers WHERE id = ?", [id])
        const oldPassword = hashedPassword[0].password.trim()
        const isPasswordValid = await bcrypt.compare(oldpassword, oldPassword)

        try {
            if(isPasswordValid) { 
                const saltRounds = 10;
                const newHashedPassword = await bcrypt.hash(newpassword, saltRounds);

                const [results] = await pool.execute('CALL UpdateCustomerPassword(?,?,?)', [ id, oldPassword, newHashedPassword ])
                console.log(results)

                if (results.affectedRows > 0) {
                    res.status(200).json({ message: "Password updated!" })
                } else {
                    res.status(401).json({message: "Error while updating password"})
                }
                 
            } else {
                return res.status(401).json({error: "Password invalid"})
            }
            

        } catch(err) {
            console.log(err)
            return res.status(500).json({error: "MySQL server error"})
        }
        
    } catch(err) {
        console.log(err)
        return res.status(500).json({error: "Internal server error"})
    }
})

// CONTACT

app.post('/contact', async (req, res) => {
    const {
        email,
        name,
        subject,
        message
    } = req.body

    try {
        const htmlFilePath = path.join(__dirname, 'contact.html');
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
        htmlContent = htmlContent.replace('{{email}}', email)
        htmlContent = htmlContent.replace('{{name}}', name)
        htmlContent = htmlContent.replace('{{subject}}', subject)
        htmlContent = htmlContent.replace('{{message}}', message)

        const mailOptions = {  
            from: process.env.MAIL_USER,
            to: process.env.MAIL_USER,
            subject: 'TurboRent - Kapcsolat',
            html: htmlContent 
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                return res.status(400).json({ message:"Email sending failed" })
            } else {
                console.log(info)
                return res.status(200).json({ message: "Email sent" })
            }
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({error: "Internal server error"})
    }
})

app.get('/filter/categories', async (req, res) => {
    const [results] = await pool.query("CALL GetAllCarCategories")
    res.json(results[0])
});

app.get('/filter/brands', async (req, res) => {
    const [results] = await pool.query("CALL GetAllCarBrands")
    res.json(results[0])
});