const Atendente = require('../models/Atendente');

module.exports = {
  async listar(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, parseInt(req.query.limit) || 20);
      const offset = (page - 1) * limit;

      const { count, rows } = await Atendente.findAndCountAll({
        limit,
        offset,
        attributes: { exclude: ['senha'] }
      });

      res.json({
        total: count,
        pagina: page,
        totalPaginas: Math.ceil(count / limit),
        dados: rows
      });
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const atendente = await Atendente.findByPk(req.params.id, {
        attributes: { exclude: ['senha'] }
      });
      if (!atendente) return res.status(404).json({ error: 'Atendente não encontrado' });
      res.json(atendente);
    } catch (err) {
      next(err);
    }
  },

  async criar(req, res, next) {
    try {
      const novo = await Atendente.create(req.body);
      const { senha, ...dados } = novo.toJSON();
      res.status(201).json(dados);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Login ou CPF já cadastrado' });
      }
      next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const atendente = await Atendente.findByPk(id);
      if (!atendente) return res.status(404).json({ error: 'Atendente não encontrado' });
      await atendente.update(req.body);
      res.json({ message: 'Atendente atualizado com sucesso' });
    } catch (err) {
      next(err);
    }
  },

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await Atendente.destroy({ where: { id_atendente: id } });
      if (!deletado) return res.status(404).json({ error: 'Atendente não encontrado' });
      res.json({ message: 'Atendente removido com sucesso' });
    } catch (err) {
      next(err);
    }
  }
};
