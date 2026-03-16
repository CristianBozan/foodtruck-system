const { Sequelize, Op } = require('sequelize');
const Venda = require('../models/Venda');
const Produto = require('../models/Produto');

module.exports = {
  async vendasPorDia(req, res, next) {
    try {
      const where = {};
      if (req.query.inicio && req.query.fim) {
        where.data_hora = { [Op.between]: [req.query.inicio, req.query.fim] };
      }

      const vendas = await Venda.findAll({
        where,
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('data_hora')), 'data'],
          [Sequelize.fn('SUM', Sequelize.col('valor_total')), 'total_vendas'],
          [Sequelize.fn('COUNT', Sequelize.col('id_venda')), 'quantidade']
        ],
        group: [Sequelize.fn('DATE', Sequelize.col('data_hora'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('data_hora')), 'ASC']]
      });
      res.json(vendas);
    } catch (err) {
      next(err);
    }
  },

  async vendasPorPagamento(req, res, next) {
    try {
      const vendas = await Venda.findAll({
        attributes: [
          'forma_pagamento',
          [Sequelize.fn('SUM', Sequelize.col('valor_total')), 'total_vendas'],
          [Sequelize.fn('COUNT', Sequelize.col('id_venda')), 'quantidade']
        ],
        group: ['forma_pagamento']
      });
      res.json(vendas);
    } catch (err) {
      next(err);
    }
  },

  async resumo(req, res, next) {
    try {
      const resumo = await Venda.findAll({
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('id_venda')), 'quantidade_vendas'],
          [Sequelize.fn('SUM', Sequelize.col('valor_total')), 'faturamento_total'],
          [Sequelize.fn('AVG', Sequelize.col('valor_total')), 'ticket_medio'],
          [Sequelize.fn('MAX', Sequelize.col('valor_total')), 'maior_venda'],
          [Sequelize.fn('MIN', Sequelize.col('valor_total')), 'menor_venda']
        ]
      });
      res.json(resumo[0]);
    } catch (err) {
      next(err);
    }
  },

  async estoqueBaixo(req, res, next) {
    try {
      const limite = parseInt(req.query.limite) || 5;
      const produtos = await Produto.findAll({
        where: {
          quantidade_estoque: { [Op.lte]: limite },
          status: 'ativo'
        },
        order: [['quantidade_estoque', 'ASC']]
      });
      res.json({ limite, produtos });
    } catch (err) {
      next(err);
    }
  }
};
