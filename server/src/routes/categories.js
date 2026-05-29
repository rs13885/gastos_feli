const express = require('express');
const router = express.Router();
const db = require('../db');

const now = () => new Date().toISOString();

router.get('/', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM categories ORDER BY name ASC').all());
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, percentage } = req.body;
    const ts = now();
    const { lastInsertRowid } = db.prepare(
      'INSERT INTO categories (name, percentage, createdAt, updatedAt) VALUES (?, ?, ?, ?)'
    ).run(name, percentage, ts, ts);
    res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(lastInsertRowid));
  } catch (e) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'La categoría ya existe' });
    }
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, percentage } = req.body;
    if (!db.prepare('SELECT id FROM categories WHERE id = ?').get(id)) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    db.prepare('UPDATE categories SET name=?, percentage=?, updatedAt=? WHERE id=?').run(name, percentage, now(), id);
    res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(id));
  } catch (e) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Categoría eliminada' });
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

module.exports = router;
