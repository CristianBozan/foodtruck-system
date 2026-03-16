const Joi = require('joi');

const criarSchema = Joi.object({
  id_mesa: Joi.number().integer().positive().required(),
  id_atendente: Joi.number().integer().positive().required(),
  forma_pagamento: Joi.string().valid('pix', 'credito', 'debito', 'dinheiro', 'mix').optional(),
  observacoes: Joi.string().max(500).optional().allow('', null),
  status: Joi.string().valid('aberto', 'finalizado', 'pago').default('aberto')
});

const atualizarSchema = Joi.object({
  forma_pagamento: Joi.string().valid('pix', 'credito', 'debito', 'dinheiro', 'mix').optional(),
  observacoes: Joi.string().max(500).optional().allow('', null),
  status: Joi.string().valid('aberto', 'finalizado', 'pago', 'cancelado').optional()
});

module.exports = { criarSchema, atualizarSchema };
