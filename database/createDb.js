// Connect to the desired database
// If 'myNewDatabase' doesn't exist, MongoDB will create it upon the first write operation.
db = db.getSiblingDB('projectBeton');

// Create a collection and insert a document to ensure the database is formally created
db.Brand.insertMany([
    { brand: 'Бетон М100', price: '1500'},
    { brand: 'Бетон М200', price: '2500'},
    { brand: 'Бетон М300', price: '3500'},
    { brand: 'Бетон М400', price: '4500'},
]);

db.Service.insertMany([
    { name: 'Автобетононасос', price: '1000/час (не менее 3 часов)'},
    { name: 'Лоток для бетона', price: '1000 руб'},
    { name: 'Противоморозная добавка', price: '100 руб м3'},
    { name: 'Доставка по городу', price: '1000 руб м3'},
    { name: 'Доставка за город', price: '500 руб м3'},
]);

db.contacts.insertOne({
    phoneNumber: '+7 (999) 999-99-99',
})

db.sandBrand.insertMany([
    { brand: 'П/б М100', price: '1000' },
    { brand: 'П/б М200', price: '1500'},
    { brand: 'П/б М300', price: '2000'},
    { brand: 'П/б М400', price: '2500'},
])

// Optional: Display a message to confirm creation
print("Database 'myNewDatabase' and collection 'myNewCollection' created.");