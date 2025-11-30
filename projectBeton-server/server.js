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

// 1. GET /api/services - Получить все услуги (существующий маршрут)
app.get('/api/services', (req, res) => {
    Service.find().sort({ name: 1 })
        .then(services => res.json(services))
        .catch(err => {
            console.error('Ошибка при получении услуг:', err);
            res.status(500).json({ error: 'Внутренняя ошибка сервера при получении списка услуг.' });
        });
});

// 2. POST /api/services - Создать новую услугу
app.post('/api/services', (req, res) => {
    const { name, price } = req.body;

    if (!name || typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: 'Требуется непустое название и положительная цена для создания услуги.' });
    }

    const newService = new Service({ name, price });

    newService.save()
        .then(service => res.status(201).json(service))
        .catch(err => {
            console.error('Ошибка при создании услуги:', err);
            res.status(500).json({ error: 'Внутренняя ошибка сервера при создании услуги.' });
        });
});

// 3. PUT /api/services/:id - Обновить существующую услугу
app.put('/api/services/:id', (req, res) => {
    const id = req.params.id;
    const { name, price } = req.body;

    if (!name || typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: 'Требуется непустое название и положительная цена для обновления услуги.' });
    }

    Service.findByIdAndUpdate(
        id, 
        { name, price }, 
        { new: true, runValidators: true } // new: true возвращает обновленный документ; runValidators: true проверяет схему
    )
    .then(updatedService => {
        if (!updatedService) {
            return res.status(404).json({ error: `Услуга с ID ${id} не найдена.` });
        }
        res.json(updatedService);
    })
    .catch(err => {
        console.error('Ошибка при обновлении услуги:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера при обновлении услуги.' });
    });
});

// 4. DELETE /api/services/:id - Удалить услугу
app.delete('/api/services/:id', (req, res) => {
    const id = req.params.id;

    Service.findByIdAndDelete(id)
        .then(deletedService => {
            if (!deletedService) {
                return res.status(404).json({ error: `Услуга с ID ${id} не найдена.` });
            }
            // 204 No Content - успешное удаление
            res.status(204).send();
        })
        .catch(err => {
            console.error('Ошибка при удалении услуги:', err);
            res.status(500).json({ error: 'Внутренняя ошибка сервера при удалении услуги.' });
        });
});

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