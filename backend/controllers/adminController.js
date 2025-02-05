const { pool } = require('../utils/dbUtils');
const { sendEmail } = require('../utils/emailUtils');
const { generateAccessToken } = require('../utils/generateAccessToken');
const { generateRefreshToken } = require('../utils/generateRefreshToken');

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });


async function deleteCar(req, res) {
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
}

async function addCar(req, res) {
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
}

async function listRegistrationApprovals(req, res) {
    const [results] = await pool.query('CALL ListApprovals()');
    res.json(results[0]);
}

async function listRegistrationApprovalById(req, res) {
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
}

async function approveRegistrationRequest(req, res) {
    const { customer_id, admin_id } = req.body;

    try {
        const [results] = await pool.query('CALL ApproveRequest(?, ?)', [ customer_id, admin_id ]);
        const customer=results[0][0]

        if(results.length > 0) {

            const emailer = await sendEmail(customer.email, 'TurboRent - Reigsztráció visszaigazolás', 'registration-approve')
            
            if(emailer.accepted.length > 0) {
                return res.status(200).json({ message: "Approve request email sent" })
            } else {
                return res.status(400).json({ message:"Approve request email sending failed" })
            }
        } else {
            return res.status(400).json({message:"Approve failed"})
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function denyRegistrationRequest(req, res) {
    const { customer_id } = req.body;

    try {
        const [results] = await pool.query('CALL DenyApproveRequest(?)', [ customer_id ]);
        const customer = results[0][0]

        if(results.length > 0) {
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error)
                } else {
                    console.log(info)
                }
                return res.status(200).json({message:"Request Approved"})
            });

            const emailer = await sendEmail(customer.email, 'TurboRent - Reigsztráció visszaigazolás', 'registration-deny')
            
            if(emailer.accepted.length > 0) {
                return res.status(200).json({ message: "Deny request email sent" })
            } else {
                return res.status(400).json({ message:"Deny request email sending failed" })
            }
        } else {
            return res.status(400).json({message:"Deny failed"})
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function listRentingApprovals(req, res) {
    const [results] = await pool.query('CALL ListRentApprovals()');
    res.json(results[0]);
}

async function listRentingApprovalById(req, res) {
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
}

async function approveRentingRequest(req, res) {
    const { rental_id, admin_id } = req.body;

    try {
        const [results] = await pool.query('CALL ApproveRentRequest(?, ?)', [ rental_id, admin_id ]);

        if(results.length > 0) {
            const emailer = await sendEmail(results[0][0].customer_email, 'TurboRent - Bérlési visszaigazolás', 'renting-approve')
            
            if(emailer.accepted.length > 0) {
                return res.status(200).json({message:"Request Approved"})
            } else {
                return res.status(400).json({ message:"Approve request email sending failed" })
            }
        } else {
            return res.status(400).json({message:"Approve failed"})
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
} 

async function denyRentingRequest(req, res) {
    const { rental_id } = req.body;

    try {
        const [results] = await pool.query('CALL DenyRentRequest(?)', [ rental_id ]);

        if(results.length > 0) {
            const emailer = await sendEmail(results[0][0].customer_email, 'TurboRent - Bérlési visszaigazolás', 'renting-deny')
            
            if(emailer.accepted.length > 0) {
                return res.status(200).json({message:"Request Denied"})
            } else {
                return res.status(400).json({ message:"Deny request email sending failed" })
            }
        } else {
            return res.status(400).json({message:"Deny failed"})
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    deleteCar,
    addCar,
    listRegistrationApprovals,
    listRegistrationApprovalById,
    approveRegistrationRequest,
    denyRegistrationRequest,
    listRentingApprovals,
    listRentingApprovalById,
    approveRentingRequest,
    denyRentingRequest
}