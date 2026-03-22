const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BrandSchema = new Schema({
    brand: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        default: 0 
    },
    category: { 
        type: String, 
        required: true,
        index: true // Добавляем индекс для быстрого поиска по категориям
    }
}, { 
    collection: 'AllBrands' // Назовем коллекцию универсально
});

module.exports = mongoose.model('Brand', BrandSchema);