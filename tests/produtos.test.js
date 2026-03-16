process.env.JWT_SECRET = 'test_secret_produtos';
process.env.NODE_ENV = 'test';

const mockAtendente = { findOne: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn(), create: jest.fn(), update: jest.fn(), destroy: jest.fn() };
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

jest.mock('../src/config/database', () => ({ sync: jest.fn(), transaction: jest.fn(), define: jest.fn() }));
jest.mock('../src/middleware/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

function token(tipo = 'atendente') {
  return jwt.sign({ id: 1, login: 'user', tipo_usuario: tipo }, process.env.JWT_SECRET);
}

describe('GET /produtos', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app).get('/produtos');
    expect(res.status).toBe(401);
  });

  it('deve listar produtos paginados com flag estoque_baixo', async () => {
    mockProduto.findAndCountAll.mockResolvedValue({
      count: 2,
      rows: [
        { quantidade_estoque: 10, toJSON: () => ({ id_produto: 1, nome: 'X-Burguer', preco: 15.0, quantidade_estoque: 10 }) },
        { quantidade_estoque: 3, toJSON: () => ({ id_produto: 2, nome: 'Hot Dog', preco: 8.0, quantidade_estoque: 3 }) }
      ]
    });

    const res = await request(app)
      .get('/produtos')
      .set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.dados).toHaveLength(2);
    expect(res.body.dados[0].estoque_baixo).toBe(false);
    expect(res.body.dados[1].estoque_baixo).toBe(true);
  });

  it('deve suportar filtro por categoria', async () => {
    mockProduto.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
    const res = await request(app)
      .get('/produtos?categoria=lanches&page=1&limit=10')
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(200);
    expect(mockProduto.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { categoria: 'lanches' } })
    );
  });
});

describe('POST /produtos', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve retornar 403 para atendente', async () => {
    const res = await request(app)
      .post('/produtos')
      .set('Authorization', `Bearer ${token('atendente')}`)
      .send({ nome: 'Novo', preco: 10 });
    expect(res.status).toBe(403);
  });

  it('deve retornar 422 com nome muito curto', async () => {
    const res = await request(app)
      .post('/produtos')
      .set('Authorization', `Bearer ${token('gerente')}`)
      .send({ nome: 'A', preco: 10 });
    expect(res.status).toBe(422);
  });

  it('deve retornar 422 com preço negativo', async () => {
    const res = await request(app)
      .post('/produtos')
      .set('Authorization', `Bearer ${token('gerente')}`)
      .send({ nome: 'Produto', preco: -5 });
    expect(res.status).toBe(422);
  });

  it('deve criar produto válido (gerente)', async () => {
    mockProduto.create.mockResolvedValue({ id_produto: 1, nome: 'X-Burguer', preco: 15.0 });
    const res = await request(app)
      .post('/produtos')
      .set('Authorization', `Bearer ${token('gerente')}`)
      .send({ nome: 'X-Burguer', preco: 15.0, quantidade_estoque: 20 });
    expect(res.status).toBe(201);
  });
});

describe('GET /produtos/:id', () => {
  it('deve retornar 404 para produto inexistente', async () => {
    mockProduto.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .get('/produtos/999')
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(404);
  });

  it('deve retornar produto existente com estoque_baixo', async () => {
    mockProduto.findByPk.mockResolvedValue({
      toJSON: () => ({ id_produto: 1, nome: 'X-Burguer', preco: 15.0, quantidade_estoque: 2 }),
      quantidade_estoque: 2
    });
    const res = await request(app)
      .get('/produtos/1')
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(200);
    expect(res.body.estoque_baixo).toBe(true);
  });
});
