const Joi = require('joi');

const criarSchema = Joi.object({
  id_pedido: Joi.number().integer().positive().required(),
  forma_pagamento: Joi.string().valid('pix', 'credito', 'debito', 'dinheiro', 'mix').required(),
  valor_total: Joi.number().positive().precision(2).required()
});

module.exports = { criarSchema };
