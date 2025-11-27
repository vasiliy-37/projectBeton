const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BrandSchema = new Schema({
    brand: { 
        type: String,
        required: true,
        unique: true 
    }
}, { 
    collection: 'Brand' 
});

module.exports = Brand = mongoose.model('Brand', BrandSchema);