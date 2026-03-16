const Joi = require('joi');

const criarSchema = Joi.object({
  id_pedido: Joi.number().integer().positive().required(),
  id_produto: Joi.number().integer().positive().required(),
  quantidade: Joi.number().integer().positive().min(1).required()
});

const atualizarSchema = Joi.object({
  id_produto: Joi.number().integer().positive().optional(),
  quantidade: Joi.number().integer().positive().min(1).optional()
});

module.exports = { criarSchema, atualizarSchema };
