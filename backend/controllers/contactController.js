const { pool } = require('../utils/dbUtils');
const { sendEmail } = require('../utils/emailUtils');

async function contact(req, res) {
    const {
        email,
        name,
        subject,
        message
    } = req.body

    try {
        const emailer = await sendEmail("tuborentradnoti@gmail.com", 'TurboRent - Kapcsolat', 'contact', {
            email: email,
            name: name,
            subject: subject,
            message: message 
        })
    
        if(emailer.accepted.length > 0) {
            return res.status(200).json({ message: "Contact email sent" })
        } else {
            return res.status(400).json({ message:"Contact email sending failed" })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports = {
    contact
}