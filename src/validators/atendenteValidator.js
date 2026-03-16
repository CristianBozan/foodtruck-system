const Joi = require('joi');

const criarSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  cpf: Joi.string().length(11).pattern(/^\d+$/).required().messages({
    'string.length': 'CPF deve ter 11 dígitos',
    'string.pattern.base': 'CPF deve conter apenas números'
  }),
  telefone: Joi.string().max(20).optional().allow('', null),
  login: Joi.string().min(3).max(50).required(),
  senha: Joi.string().min(6).required(),
  tipo_usuario: Joi.string().valid('gerente', 'atendente').default('atendente')
});

const atualizarSchema = Joi.object({
  nome: Joi.string().min(2).max(100).optional(),
  telefone: Joi.string().max(20).optional().allow('', null),
  login: Joi.string().min(3).max(50).optional(),
  senha: Joi.string().min(6).optional(),
  tipo_usuario: Joi.string().valid('gerente', 'atendente').optional()
});

module.exports = { criarSchema, atualizarSchema };
