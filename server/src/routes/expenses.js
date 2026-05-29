const express = require('express');
const router = express.Router();
const db = require('../db');

const round2 = (n) => Math.round(n * 100) / 100;
const now = () => new Date().toISOString();

router.get('/', (req, res) => {
  try {
    const { month, year } = req.query;
    if (month && year) {
      const m = String(month).padStart(2, '0');
      const start = `${year}-${m}-01`;
      const end = `${year}-${m}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
      return res.json(db.prepare(
        'SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date ASC, category ASC'
      ).all(start, end));
    }
    res.json(db.prepare('SELECT * FROM expenses ORDER BY date ASC, category ASC').all());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', (req, res) => {
  try {
    const { date, category, item, amount, percentage } = req.body;
    const amt = round2(amount);
    const prop = round2(amt * percentage);
    const ts = now();
    const { lastInsertRowid } = db.prepare(
      'INSERT INTO expenses (date, category, item, amount, percentage, proportional, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(date, category, item, amt, percentage, prop, ts, ts);
    res.json(db.prepare('SELECT * FROM expenses WHERE id = ?').get(lastInsertRowid));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error creating expense' });
  }
});

router.post('/copy', (req, res) => {
  try {
    const { sourceMonth, sourceYear, targetMonth, targetYear } = req.body;
    if (!sourceMonth || !sourceYear || !targetMonth || !targetYear) {
      return res.status(400).json({ error: 'Missing source or target date parameters' });
    }
    const sm = String(sourceMonth).padStart(2, '0');
    const start = `${sourceYear}-${sm}-01`;
    const end = `${sourceYear}-${sm}-${String(new Date(sourceYear, sourceMonth, 0).getDate()).padStart(2, '0')}`;
    const targetDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;

    const source = db.prepare('SELECT * FROM expenses WHERE date BETWEEN ? AND ?').all(start, end);
    if (!source.length) return res.json({ message: 'No expenses found to copy', count: 0 });

    const ins = db.prepare(
      'INSERT INTO expenses (date, category, item, amount, percentage, proportional, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const ts = now();
    db.transaction(() => {
      for (const e of source) {
        const amt = round2(e.amount);
        ins.run(targetDate, e.category, e.item, amt, e.percentage, round2(amt * e.percentage), ts, ts);
      }
    })();

    res.json({ message: 'Expenses copied successfully', count: source.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error copying expenses' });
  }
});

router.delete('/month', (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ error: 'Missing month/year' });
    const m = String(parseInt(month, 10)).padStart(2, '0');
    const y = parseInt(year, 10);
    const start = `${y}-${m}-01`;
    const end = `${y}-${m}-${String(new Date(y, month, 0).getDate()).padStart(2, '0')}`;
    const { changes } = db.prepare('DELETE FROM expenses WHERE date BETWEEN ? AND ?').run(start, end);
    res.json({ message: 'Month cleared', count: changes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error clearing month' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    const { date, category, item, amount, percentage } = req.body;
    const amt = amount !== undefined ? round2(amount) : existing.amount;
    const pct = percentage !== undefined ? percentage : existing.percentage;

    db.prepare(
      'UPDATE expenses SET date=?, category=?, item=?, amount=?, percentage=?, proportional=?, updatedAt=? WHERE id=?'
    ).run(
      date ?? existing.date,
      category ?? existing.category,
      item ?? existing.item,
      amt, pct, round2(amt * pct), now(), id
    );
    res.json(db.prepare('SELECT * FROM expenses WHERE id = ?').get(id));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error updating expense' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error deleting expense' });
  }
});

module.exports = router;
