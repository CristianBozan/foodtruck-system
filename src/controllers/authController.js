const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Atendente = require('../models/Atendente');
const logger = require('../middleware/logger');

module.exports = {
  async login(req, res, next) {
    try {
      const { login, senha } = req.body;

      const atendente = await Atendente.findOne({ where: { login } });
      if (!atendente) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const senhaCorreta = await bcrypt.compare(senha, atendente.senha);
      if (!senhaCorreta) {
        logger.warn(`Tentativa de login falhou para: ${login}`);
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        {
          id: atendente.id_atendente,
          login: atendente.login,
          tipo_usuario: atendente.tipo_usuario
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      logger.info(`Login bem-sucedido: ${login}`);
      res.json({
        token,
        tipo_usuario: atendente.tipo_usuario,
        nome: atendente.nome
      });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res) {
    res.json({
      id: req.user.id,
      login: req.user.login,
      tipo_usuario: req.user.tipo_usuario
    });
  }
};
