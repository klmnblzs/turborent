const { pool } = require('../utils/dbUtils');

async function getCars(req, res) {
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
}

async function getCarById(req, res) {
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
}

async function isCarAvailable(req, res) {
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
}

module.exports = {
    getCars,
    getCarById,
    isCarAvailable
}