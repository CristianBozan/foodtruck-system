process.env.JWT_SECRET = 'test_secret_auth';
process.env.NODE_ENV = 'test';

// Mocks devem vir ANTES de qualquer require do app
jest.mock('../src/config/database', () => ({
  sync: jest.fn().mockResolvedValue(true),
  transaction: jest.fn(),
  define: jest.fn()
}));

const mockAtendente = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};
jest.mock('../src/models/Atendente', () => mockAtendente);

const mockProduto = { findAll: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn(), create: jest.fn(), update: jest.fn(), destroy: jest.fn() };
jest.mock('../src/models/Produto', () => mockProduto);

const mockMesa = { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn(), update: jest.fn(), destroy: jest.fn() };
jest.mock('../src/models/Mesa', () => mockMesa);

const mockPedido = { findAll: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn(), create: jest.fn(), update: jest.fn(), destroy: jest.fn(), belongsTo: jest.fn() };
jest.mock('../src/models/Pedido', () => mockPedido);

const mockItemPedido = { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn(), update: jest.fn(), destroy: jest.fn(), belongsTo: jest.fn() };
jest.mock('../src/models/ItemPedido', () => mockItemPedido);

const mockVenda = { findAll: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn(), create: jest.fn(), update: jest.fn(), destroy: jest.fn(), belongsTo: jest.fn() };
jest.mock('../src/models/Venda', () => mockVenda);

jest.mock('../src/middleware/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');

describe('POST /auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve retornar 422 com dados inválidos', async () => {
    const res = await request(app).post('/auth/login').send({ login: 'a', senha: '12' });
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('deve retornar 401 com login inexistente', async () => {
    mockAtendente.findOne.mockResolvedValue(null);
    const res = await request(app)
      .post('/auth/login')
      .send({ login: 'naoexiste', senha: 'senha123' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciais inválidas');
  });

  it('deve retornar 401 com senha incorreta', async () => {
    const hash = await bcrypt.hash('correta', 10);
    mockAtendente.findOne.mockResolvedValue({
      senha: hash, login: 'admin', id_atendente: 1, tipo_usuario: 'gerente', nome: 'Admin'
    });
    const res = await request(app)
      .post('/auth/login')
      .send({ login: 'admin', senha: 'errada' });
    expect(res.status).toBe(401);
  });

  it('deve retornar token JWT com credenciais corretas', async () => {
    const hash = await bcrypt.hash('senha123', 10);
    mockAtendente.findOne.mockResolvedValue({
      senha: hash, login: 'admin', id_atendente: 1, tipo_usuario: 'gerente', nome: 'Admin'
    });
    const res = await request(app)
      .post('/auth/login')
      .send({ login: 'admin', senha: 'senha123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.tipo_usuario).toBe('gerente');
    expect(res.body.nome).toBe('Admin');
  });
});

describe('GET /auth/me', () => {
  it('deve retornar 401 sem token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('deve retornar 401 com token inválido', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer token_invalido');
    expect(res.status).toBe(401);
  });
});

describe('GET /health', () => {
  it('deve retornar status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
