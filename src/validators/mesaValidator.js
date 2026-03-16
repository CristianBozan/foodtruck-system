const Joi = require('joi');

const criarSchema = Joi.object({
  numero_mesa: Joi.number().integer().positive().required(),
  status: Joi.string().valid('livre', 'ocupada').default('livre')
});

const atualizarSchema = Joi.object({
  numero_mesa: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('livre', 'ocupada').optional()
});

module.exports = { criarSchema, atualizarSchema };
