const express = require('express');
const redis = require('redis');
const { promisify } = require('util');

const app = express();
const client = redis.createClient();

const listProducts = [
    { id: 1, name: 'Suitcase 250', price: 50, stock: 4 },
    { id: 2, name: 'Suitcase 450', price: 100, stock: 10 },
    { id: 3, name: 'Suitcase 650', price: 350, stock: 2 },
    { id: 4, name: 'Suitcase 1050', price: 550, stock: 5 }
];

// Data access
function getItemById(id) {
    return listProducts.find(product => product.id === id);
}

// Server
app.listen(1245, () => {
    console.log('Server listening on port 1245');
});

// Products
app.get('/list_products', (req, res) => {
    res.json(listProducts.map(product => ({
        itemId: product.id,
        itemName: product.name,
        price: product.price,
        initialAvailableQuantity: product.stock
    })));
});

// In stock in Redis
const reserveStockById = promisify(client.set).bind(client);

async function getCurrentReservedStockById(itemId) {
    const stock = await promisify(client.get).bind(client)(`item.${itemId}`);
    return stock ? parseInt(stock) : 0;
}

// Product detail
app.get('/list_products/:itemId', async (req, res) => {
    const itemId = parseInt(req.params.itemId);
    const product = getItemById(itemId);
    if (product) {
        const currentQuantity = await getCurrentReservedStockById(itemId);
        res.json({
            itemId: product.id,
            itemName: product.name,
            price: product.price,
            initialAvailableQuantity: product.stock,
            currentQuantity
        });
    } else {
        res.json({ status: 'Product not found' });
    }
});

// Reserve a product
app.get('/reserve_product/:itemId', async (req, res) => {
    const itemId = parseInt(req.params.itemId);
    const product = getItemById(itemId);
    if (product) {
        const currentQuantity = await getCurrentReservedStockById(itemId);
        if (currentQuantity < product.stock) {
            await reserveStockById(`item.${itemId}`, currentQuantity + 1);
            res.json({ status: 'Reservation confirmed', itemId: product.id });
        } else {
            res.json({ status: 'Not enough stock available', itemId: product.id });
        }
    } else {
        res.json({ status: 'Product not found' });
    }
});
