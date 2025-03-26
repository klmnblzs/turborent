const bcrypt = require('bcrypt');
const { pool } = require('../utils/dbUtils');
const crypto = require('crypto');

const { sendEmail } = require('../utils/emailUtils');

// JELSZÓ VISSZAÁLLÍTÁSA
async function request_reset_password(req, res) {
    const { email } = req.body;

    try {
        const [results] = await pool.query('SELECT id FROM customers WHERE email = ?', [email] )
        if(results.length > 0) {
            const customerId = results[0].id;

            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 3600000); // 1 ÓRA

            const [saveToken] = await pool.query('CALL SaveResetToken(?, ?, ?)', [customerId, token, expiresAt])

            if(saveToken.affectedRows > 0) {
                const emailer = await sendEmail(email, 'TurboRent - Jelszó visszaállítása', 'reset-password', {
                    reset_link: "http://localhost:4200/reset-password?token=" + token
                })
                
                if(emailer.accepted.length > 0) {
                    return res.status(200).json({ message: "Reset password eail sent" })
                } else {
                    return res.status(400).json({ message:"Reset password email sending failed" })
                }
            } else {
                return res.status(500).json({ message: 'Error saving reset token' });
            }
        } else {
            return res.status(401).json({ message: "User not found" });
        }
    } catch(err) {
        console.log(err)
        res.status(500).json({ message:"Internal server error" })
    }
}

async function validate_reset_token(req, res) {
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
                return res.send({ token_id, customer_id });
            }
        } else {
            return res.status(401).json({ message: "Token invalid" });
        }
    } catch(err) {
        console.log(err)
        res.status(500).json({ message:"Internal server error" })
    }
}

async function reset_password(req, res) {
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
                return res.status(200).json({ message: "Password reset!" })
            }
        } else {
            return res.status(401).json({ message: "Password update failed" });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message:"Internal server error" })
    }
}

// BÉRLÉS

async function rent(req, res) {
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
            const emailer = await sendEmail(email, 'TurboRent - Bérelési kérelem', 'rent-reassure')
            
            if(emailer.accepted.length > 0) {
                return res.status(200).json({ message: "Renting email sent" })
            } else {
                return res.status(400).json({ message:"Renting email sending failed" })
            }
        } else {
            return res.status(400).json({message:"Request creation failed"})
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

// FELHASZNÁLÓI ADATOk

async function getUserData(req, res) {
    const userid = req.params.id

    try {
        const [results] = await pool.execute('CALL GetCustomerById(?)', [ userid ])
        res.send(results[0][0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

async function getRentHistory(req, res) {
    const userid = req.params.id
    
    try {
        const [results] = await pool.execute('CALL GetRentHistory(?)', [ userid ])
        res.send(results[0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }

}

async function editUserData(req, res) {
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
}

async function editUserPassword(req, res) {
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
}

module.exports = {
    request_reset_password,
    reset_password,
    validate_reset_token,
    rent,

    getUserData,
    getRentHistory,
    editUserData,
    editUserPassword
}