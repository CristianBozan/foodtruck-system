const Mesa = require('../models/Mesa');

module.exports = {
  async listar(req, res, next) {
    try {
      const where = {};
      if (req.query.status) where.status = req.query.status;
      const mesas = await Mesa.findAll({ where });
      res.json(mesas);
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const mesa = await Mesa.findByPk(req.params.id);
      if (!mesa) return res.status(404).json({ error: 'Mesa não encontrada' });
      res.json(mesa);
    } catch (err) {
      next(err);
    }
  },

  async criar(req, res, next) {
    try {
      const nova = await Mesa.create(req.body);
      res.status(201).json(nova);
    } catch (err) {
      next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const mesa = await Mesa.findByPk(id);
      if (!mesa) return res.status(404).json({ error: 'Mesa não encontrada' });
      await mesa.update(req.body);
      res.json({ message: 'Mesa atualizada com sucesso' });
    } catch (err) {
      next(err);
    }
  },

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await Mesa.destroy({ where: { id_mesa: id } });
      if (!deletado) return res.status(404).json({ error: 'Mesa não encontrada' });
      res.json({ message: 'Mesa removida com sucesso' });
    } catch (err) {
      next(err);
    }
  }
};
