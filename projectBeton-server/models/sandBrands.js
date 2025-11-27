const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SandBrandSchema = new Schema({
    brand: { type: String, required: true, unique: true },
    price: { type: Number }
}, { collection: 'sandBrand' }); 

module.exports = SandBrand = mongoose.model('sandBrand', SandBrandSchema);
