const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeliveryCitySchema = new Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        cityPrepositional: {
            type: String,
            required: true,
            trim: true
        },
        district: {
            type: String,
            required: true,
            trim: true
        },
        pricePerM3: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        collection: 'deliveryCities'
    }
);

module.exports = mongoose.model('DeliveryCity', DeliveryCitySchema);
