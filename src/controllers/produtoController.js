const { Op } = require('sequelize');
const Produto = require('../models/Produto');

const ESTOQUE_MINIMO = 5;

module.exports = {
  async listar(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, parseInt(req.query.limit) || 20);
      const offset = (page - 1) * limit;

      const where = {};
      if (req.query.categoria) where.categoria = req.query.categoria;
      if (req.query.status) where.status = req.query.status;

      const { count, rows } = await Produto.findAndCountAll({ where, limit, offset });

      const dados = rows.map((p) => ({
        ...p.toJSON(),
        estoque_baixo: p.quantidade_estoque <= ESTOQUE_MINIMO
      }));

      res.json({
        total: count,
        pagina: page,
        totalPaginas: Math.ceil(count / limit),
        dados
      });
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const produto = await Produto.findByPk(req.params.id);
      if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
      res.json({ ...produto.toJSON(), estoque_baixo: produto.quantidade_estoque <= ESTOQUE_MINIMO });
    } catch (err) {
      next(err);
    }
  },

  async criar(req, res, next) {
    try {
      const novo = await Produto.create(req.body);
      res.status(201).json(novo);
    } catch (err) {
      next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const produto = await Produto.findByPk(id);
      if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
      await produto.update(req.body);
      res.json({ message: 'Produto atualizado com sucesso' });
    } catch (err) {
      next(err);
    }
  },

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await Produto.destroy({ where: { id_produto: id } });
      if (!deletado) return res.status(404).json({ error: 'Produto não encontrado' });
      res.json({ message: 'Produto removido com sucesso' });
    } catch (err) {
      next(err);
    }
  }
};
