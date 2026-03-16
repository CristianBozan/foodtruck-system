const Joi = require('joi');

const criarSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  descricao: Joi.string().max(500).optional().allow('', null),
  preco: Joi.number().positive().precision(2).required(),
  foto: Joi.string().uri().optional().allow('', null),
  categoria: Joi.string().max(50).optional().allow('', null),
  quantidade_estoque: Joi.number().integer().min(0).default(0),
  status: Joi.string().valid('ativo', 'inativo').default('ativo')
});

const atualizarSchema = Joi.object({
  nome: Joi.string().min(2).max(100).optional(),
  descricao: Joi.string().max(500).optional().allow('', null),
  preco: Joi.number().positive().precision(2).optional(),
  foto: Joi.string().uri().optional().allow('', null),
  categoria: Joi.string().max(50).optional().allow('', null),
  quantidade_estoque: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid('ativo', 'inativo').optional()
});

module.exports = { criarSchema, atualizarSchema };
