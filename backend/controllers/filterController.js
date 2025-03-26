const { pool } = require('../utils/dbUtils');

async function categories(req, res) {
    const [results] = await pool.query("CALL GetAllCarCategories")
    res.json(results[0])
}

async function brands(req, res) {
    const [results] = await pool.query("CALL GetAllCarBrands")
    res.json(results[0])
}

module.exports = {
    categories,
    brands
}