const Joi = require('joi');

const loginSchema = Joi.object({
  login: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Login deve ter pelo menos 3 caracteres',
    'any.required': 'Login é obrigatório'
  }),
  senha: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  })
});

module.exports = { loginSchema };
