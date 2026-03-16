// Helper: cria um mock padrão de modelo Sequelize
function mockModel(extra = {}) {
  return {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    decrement: jest.fn(),
    increment: jest.fn(),
    belongsTo: jest.fn(),
    hasMany: jest.fn(),
    ...extra
  };
}

module.exports = { mockModel };
