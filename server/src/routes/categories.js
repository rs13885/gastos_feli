const express = require('express');
const router = express.Router();

module.exports = (Category) => {
    router.get('/', async (req, res) => {
        try {
            const categories = await Category.findAll({ order: [['name', 'ASC']] });
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    });

    router.post('/', async (req, res) => {
        try {
            const { name, percentage } = req.body;
            const category = await Category.create({ name, percentage });
            res.json(category);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: 'La categoría ya existe' });
            }
            res.status(500).json({ error: 'Error al crear categoría' });
        }
    });

    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { name, percentage } = req.body;
            const category = await Category.findByPk(id);
            if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
            await category.update({ name, percentage });
            res.json(category);
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar categoría' });
        }
    });

    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            await Category.destroy({ where: { id } });
            res.json({ message: 'Categoría eliminada' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar categoría' });
        }
    });

    return router;
};
