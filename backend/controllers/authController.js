const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { pool } = require('../utils/dbUtils');
const { sendEmail } = require('../utils/emailUtils');
const { generateAccessToken } = require('../utils/generateAccessToken');
const { generateRefreshToken } = require('../utils/generateRefreshToken');

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

async function register(req, res) {
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
                    const emailer = await sendEmail(email, 'TurboRent - Regisztráció', 'register-request')
                
                    if(emailer.accepted.length > 0) {
                        return res.status(200).json({ message: "Register email sent" })
                    } else {
                        return res.status(400).json({ message:"Register email sending failed" })
                    }
                } else {
                    return res.status(500).json({ message: 'Failed to insert user, approval and license pictures' });
                }
            } else {
                console.log('No rows affected, customer not created:', customers);
                return res.status(500).json({ message: 'Failed to register user' });
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Internal server error (első catch)' });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal server error (második catch)' });
    }
}

async function login(req, res) {
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
                req.body.password=hashedPassword
                req.body.isAdmin=user.isAdmin
                req.body.isApproved=user.isApproved

                const accessToken = generateAccessToken(req.body)
                const refreshToken = await generateRefreshToken(user.id)

                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: "/"
                })

                res.status(200).json({ token: accessToken, refreshToken: refreshToken, userid: user.id })
            }
        } else {
            res.status(401).json({ error: "Wrong password" })
        }
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken || refreshToken === undefined)  {
        return res.status(400).json({ message: "Refresh Token is required" });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken.replace(/"/g, "")]);
  
        if (rows.length === 0) {
            return res.status(404).json({ message: "Refresh token was not found in the database" });
        }

        const [result] = await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken.replace(/"/g, "")]);

        if (result.affectedRows > 0) {
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: false,
                sameSite: "Strict",
                path: "/",
            });

            return res.status(200).json({ message: "Logged out!" });
        } else {
            return res.status(500).json({ message: "Token couldn't be deleted" });
        }

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error while logging out." });
    }
}

async function refreshToken(req, res) {
    const refreshToken = res.cookies.refreshToken

    if (!refreshToken) {
        return res.status(400).json({ message: "Provide a refresh token" });
    }

    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            
            const [customerData] = await pool.execute("SELECT * FROM customers WHERE id = ?", [user.userId])
            customer=customerData[0]

            req.body.id=user.userId
            req.body.firstname=customer.first_name
            req.body.lastname=customer.last_name
            req.body.email=customer.email
            req.body.phonenumber=customer.phone_number
            req.body.dateofbirth=customer.date_of_birth
            req.body.postcode=customer.post_code
            req.body.city=customer.city
            req.body.street=customer.street
            req.body.housenumber=customer.house_number
            req.body.password=customer.password
            req.body.isAdmin=customer.isAdmin
            req.body.isApproved=customer.isApproved

            // console.log(req.body)

            if (err) return res.status(403).json({ message: "Érvénytelen refresh token" });

            const [rows] = await pool.execute('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);

            if (rows.length === 0) {
                return res.status(403).json({ message: "Érvénytelen refresh token" });
            }

            await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);

            const newRefreshToken = await generateRefreshToken(user.userId);
            const newAccessToken = generateAccessToken(req.body); 

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "Strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/", 
            });

            res.json({ token: newAccessToken });
        });
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Érvénytelen refresh token" });
        }
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function registerCheckDuplicate(req, res) {
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
}

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  registerCheckDuplicate
};