const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.static('.')); // Статичні файли сайту
app.use(express.json());

// GET — повертає всі товари
app.get('/api/products', (req, res) => {
  const products = JSON.parse(fs.readFileSync('products.json'));
  res.json(products);
});

// POST — додати або оновити товар
app.post('/api/products', (req, res) => {
  const products = JSON.parse(fs.readFileSync('products.json'));
  const newProd = req.body;

  // Перевірка: якщо товар вже існує за ID або SKU — оновлюємо
  const index = products.findIndex(p => p.id === newProd.id || p.sku === newProd.sku);
  if(index !== -1){
    products[index] = newProd; // Оновлюємо існуючий товар
  } else {
    products.push({ id: Date.now(), ...newProd }); // Додаємо новий
  }

  fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
  res.json({ success: true });
});

// DELETE — видалити товар за SKU
app.delete('/api/products', (req, res) => {
  const products = JSON.parse(fs.readFileSync('products.json'));
  const skuToDelete = req.body.sku;

  const index = products.findIndex(p => p.sku === skuToDelete);
  if(index === -1) return res.json({ success: false });

  products.splice(index, 1);
  fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
  res.json({ success: true });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
