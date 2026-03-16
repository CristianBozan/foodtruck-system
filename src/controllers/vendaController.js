const sequelize = require('../config/database');
const Venda = require('../models/Venda');
const Pedido = require('../models/Pedido');
const Mesa = require('../models/Mesa');

module.exports = {
  async listar(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, parseInt(req.query.limit) || 20);
      const offset = (page - 1) * limit;

      const { count, rows } = await Venda.findAndCountAll({
        include: [Pedido],
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
      const venda = await Venda.findByPk(req.params.id, { include: [Pedido] });
      if (!venda) return res.status(404).json({ error: 'Venda não encontrada' });
      res.json(venda);
    } catch (err) {
      next(err);
    }
  },

  async criar(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { id_pedido, forma_pagamento, valor_total } = req.body;

      const pedido = await Pedido.findByPk(id_pedido, { transaction: t });
      if (!pedido) {
        await t.rollback();
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      if (pedido.status === 'pago') {
        await t.rollback();
        return res.status(409).json({ error: 'Pedido já foi pago' });
      }

      // Cria a venda e atualiza pedido + mesa atomicamente
      const nova = await Venda.create(
        { id_pedido, forma_pagamento, valor_total },
        { transaction: t }
      );

      await pedido.update({ status: 'pago' }, { transaction: t });
      await Mesa.update({ status: 'livre' }, { where: { id_mesa: pedido.id_mesa }, transaction: t });

      await t.commit();
      res.status(201).json(nova);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await Venda.destroy({ where: { id_venda: id } });
      if (!deletado) return res.status(404).json({ error: 'Venda não encontrada' });
      res.json({ message: 'Venda removida com sucesso' });
    } catch (err) {
      next(err);
    }
  }
};

