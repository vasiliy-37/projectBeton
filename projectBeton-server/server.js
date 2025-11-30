const express = require('express');
const mongoose = require('mongoose');

const app = express();

const PORT = process.env.PORT || 3000;

const Product = require('./models/product');
const sandBrands = require('./models/sandBrands');
const Service = require('./models/Service');
const Contact = require('./models/contacts.js');
const DB_URL = 'mongodb://localhost:27017/projectBeton';

mongoose.connect(DB_URL)
    .then(() => console.log('MongoDB successfully connected locally'))
    .catch(err => console.error('MongoDB connection error:', err));

const Brand = require('./models/product');

app.use(express.json());

app.get('/api/brands', (req, res) => {
    Brand.find() // Mongoose найдет все документы в коллекции 'brands'
        .sort({ name: 1 })
        .then(brands => res.json(brands)) // И вернет их в формате JSON
        .catch(err => res.status(404).json({ nobrandsfound: 'Марок не найдено' }));
});

app.get('/api/sandbrands', (req, res) => {
    sandBrands.find().sort({ brand: 1 })
        .then(brands => res.json(brands))
        .catch(err => res.status(404).json({ nobrandsfound: 'Пескобетона не найдено' }));
});

app.get('/api/services', (req, res) => {
    Service.find().sort({ name: 1 })
        .then(services => res.json(services))
        .catch(err => res.status(404).json({ noservicesfound: 'Услуг не найдено' }));
});

app.get('/api/get-phone-number', (req, res) => {
    // Вместо await Contact.findOne({}), используем Contact.findOne({}) без await
    Contact.findOne({}).then(mainContact => {
            if (mainContact && mainContact.phoneNumber) { 
                res.json({ 
                    phoneNumber: mainContact.phoneNumber, // Используем phoneNumber из БД
                    phoneHref: `tel:${mainContact.phoneNumber.replace(/\s/g, '')}` 
                });
            } else {
                res.status(404).json({ error: 'Phone number not found in DB.' });
            }
        }).catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error while fetching phone number.' });
        });
});

app.post('/api/set-phone-number', (req, res) => {
    const { phoneNumber } = req.body;

    // Update the phone number in the database
    Contact.findOneAndUpdate({}, { phoneNumber }, { new: true, upsert: true })
        .then(updatedContact => {
            res.json({
                message: 'Phone number updated successfully.',
                phoneNumber: updatedContact.phoneNumber
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error while updating phone number.' });
        });
});

app.post('/api/update-price', (req, res) => {
    const { _id, type, price } = req.body;
    let Model; 

    if (type === 'Бетон') {
        Model = Product;
    } else if (type === 'Пескобетон') {
        Model = sandBrands;
    } else {
        return res.status(400).json({ error: 'Неизвестный тип продукта. Обновление невозможно.' });
    }

    Model.findByIdAndUpdate(
        _id, 
        { price: price }, 
        { new: true } 
    )
    .then(updatedDoc => {
        if (!updatedDoc) {
            return res.status(404).json({ error: 'Документ для обновления не найден.' });
        }
        res.json({
            message: `Цена для ${updatedDoc.brand || updatedDoc.name} успешно обновлена.`,
            newPrice: updatedDoc.price
        });
    })
    .catch(err => {
        console.error('Ошибка при обновлении цены:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера при обновлении цены.' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});