const express = require('express');
const cors = require('cors');
const path = require('path');

require('./db'); // initialize DB + seed on startup

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/expenses', require('./routes/expenses'));
app.use('/categories', require('./routes/categories'));

// Serve built React app
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));
app.use((req, res) => res.sendFile(path.join(publicDir, 'index.html')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
