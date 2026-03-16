const sequelize = require('../config/database');
const ItemPedido = require('../models/ItemPedido');
const Produto = require('../models/Produto');
const Pedido = require('../models/Pedido');

module.exports = {
  async listar(req, res, next) {
    try {
      const where = {};
      if (req.query.id_pedido) where.id_pedido = req.query.id_pedido;
      const itens = await ItemPedido.findAll({ where, include: [Produto] });
      res.json(itens);
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const item = await ItemPedido.findByPk(req.params.id, { include: [Produto] });
      if (!item) return res.status(404).json({ error: 'Item não encontrado' });
      res.json(item);
    } catch (err) {
      next(err);
    }
  },

  async criar(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { quantidade, id_pedido, id_produto } = req.body;

      // Verifica pedido existe e está aberto
      const pedido = await Pedido.findByPk(id_pedido, { transaction: t });
      if (!pedido) {
        await t.rollback();
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      if (pedido.status !== 'aberto') {
        await t.rollback();
        return res.status(409).json({ error: 'Pedido não está mais aberto' });
      }

      // Busca produto com lock para evitar race condition de estoque
      const produto = await Produto.findByPk(id_produto, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });
      if (!produto) {
        await t.rollback();
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      if (produto.quantidade_estoque < quantidade) {
        await t.rollback();
        return res.status(409).json({
          error: `Estoque insuficiente. Disponível: ${produto.quantidade_estoque}`
        });
      }

      const preco_unitario = produto.preco;
      const subtotal = quantidade * Number(preco_unitario);

      // Cria item e desconta estoque atomicamente
      const novo = await ItemPedido.create(
        { quantidade, preco_unitario, subtotal, id_pedido, id_produto },
        { transaction: t }
      );

      await produto.decrement('quantidade_estoque', { by: quantidade, transaction: t });

      // Recalcula total do pedido
      const totalAtual = Number(pedido.total) + subtotal;
      await pedido.update({ total: totalAtual }, { transaction: t });

      await t.commit();
      res.status(201).json(novo);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { quantidade, id_produto } = req.body;

      const item = await ItemPedido.findByPk(id);
      if (!item) return res.status(404).json({ error: 'Item não encontrado' });

      const produto = await Produto.findByPk(id_produto || item.id_produto);
      if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });

      const preco_unitario = produto.preco;
      const subtotal = quantidade * Number(preco_unitario);

      await item.update({ quantidade, preco_unitario, subtotal });
      res.json({ message: 'Item atualizado com sucesso' });
    } catch (err) {
      next(err);
    }
  },

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await ItemPedido.destroy({ where: { id_item: id } });
      if (!deletado) return res.status(404).json({ error: 'Item não encontrado' });
      res.json({ message: 'Item removido com sucesso' });
    } catch (err) {
      next(err);
    }
  }
};

