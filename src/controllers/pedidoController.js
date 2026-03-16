const Pedido = require('../models/Pedido');
const Mesa = require('../models/Mesa');
const Atendente = require('../models/Atendente');
const ItemPedido = require('../models/ItemPedido');
const Produto = require('../models/Produto');

module.exports = {
  async listar(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, parseInt(req.query.limit) || 20);
      const offset = (page - 1) * limit;

      const where = {};
      if (req.query.status) where.status = req.query.status;

      const { count, rows } = await Pedido.findAndCountAll({
        where,
        include: [
          { model: Mesa },
          { model: Atendente, attributes: { exclude: ['senha'] } }
        ],
        limit,
        offset,
        order: [['data_hora', 'DESC']]
      });

      res.json({
        total: count,
        pagina: page,
        totalPaginas: Math.ceil(count / limit),
        dados: rows
      });
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const pedido = await Pedido.findByPk(req.params.id, {
        include: [
          { model: Mesa },
          { model: Atendente, attributes: { exclude: ['senha'] } },
          { model: ItemPedido, include: [Produto] }
        ]
      });
      if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
      res.json(pedido);
    } catch (err) {
      next(err);
    }
  },

  async criar(req, res, next) {
    try {
      const novo = await Pedido.create(req.body);
      // Marcar mesa como ocupada
      await Mesa.update({ status: 'ocupada' }, { where: { id_mesa: req.body.id_mesa } });
      res.status(201).json(novo);
    } catch (err) {
      next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const pedido = await Pedido.findByPk(id);
      if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
      await pedido.update(req.body);

      // Se finalizou/cancelou, libera a mesa
      if (['finalizado', 'pago', 'cancelado'].includes(req.body.status)) {
        await Mesa.update({ status: 'livre' }, { where: { id_mesa: pedido.id_mesa } });
      }

      res.json({ message: 'Pedido atualizado com sucesso' });
    } catch (err) {
      next(err);
    }
  },

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await Pedido.destroy({ where: { id_pedido: id } });
      if (!deletado) return res.status(404).json({ error: 'Pedido não encontrado' });
      res.json({ message: 'Pedido removido com sucesso' });
    } catch (err) {
      next(err);
    }
  }
};
