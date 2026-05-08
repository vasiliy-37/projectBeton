const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    category: {
        type: String,
        required: true,
        trim: true,
        default: 'Общие услуги'
    },
    groupSubtitle: {
        type: String,
        trim: true,
        default: ''
    },
    name: {
        type: String,
         required: true
    },
    price: {
        type: Number,
         required: true
    },
    unit: {
        type: String,
        required: true
    }
}, {collection: 'Service'});

module.exports = mongoose.model('Service', ServiceSchema);