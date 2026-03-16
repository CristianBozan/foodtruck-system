process.env.JWT_SECRET = 'test_secret_pedidos';
process.env.NODE_ENV = 'test';

const mockAtendente = { findOne: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn(), create: jest.fn() };
jest.mock('../src/models/Atendente', () => mockAtendente);

const mockProduto = { findAll: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn(), create: jest.fn() };
jest.mock('../src/models/Produto', () => mockProduto);

const mockMesa = { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn(), update: jest.fn(), destroy: jest.fn() };
jest.mock('../src/models/Mesa', () => mockMesa);

const mockPedido = { findAll: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn(), create: jest.fn(), update: jest.fn(), destroy: jest.fn(), belongsTo: jest.fn() };
jest.mock('../src/models/Pedido', () => mockPedido);

const mockItemPedido = { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn(), belongsTo: jest.fn() };
jest.mock('../src/models/ItemPedido', () => mockItemPedido);

const mockVenda = { findAll: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn(), create: jest.fn(), destroy: jest.fn(), belongsTo: jest.fn() };
jest.mock('../src/models/Venda', () => mockVenda);

jest.mock('../src/config/database', () => ({ sync: jest.fn(), transaction: jest.fn(), define: jest.fn() }));
jest.mock('../src/middleware/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

function token(tipo = 'atendente') {
  return jwt.sign({ id: 1, login: 'user', tipo_usuario: tipo }, process.env.JWT_SECRET);
}

describe('GET /pedidos', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve retornar 401 sem token', async () => {
    const res = await request(app).get('/pedidos');
    expect(res.status).toBe(401);
  });

  it('deve listar pedidos paginados', async () => {
    mockPedido.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [{ id_pedido: 1, status: 'aberto', total: 30 }]
    });
    const res = await request(app)
      .get('/pedidos')
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
  });

  it('deve filtrar por status', async () => {
    mockPedido.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
    await request(app)
      .get('/pedidos?status=aberto')
      .set('Authorization', `Bearer ${token()}`);
    expect(mockPedido.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'aberto' } })
    );
  });
});

describe('POST /pedidos', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve retornar 422 sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/pedidos')
      .set('Authorization', `Bearer ${token()}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('deve criar pedido e marcar mesa como ocupada', async () => {
    mockPedido.create.mockResolvedValue({ id_pedido: 1, status: 'aberto', id_mesa: 1 });
    mockMesa.update.mockResolvedValue([1]);

    const res = await request(app)
      .post('/pedidos')
      .set('Authorization', `Bearer ${token()}`)
      .send({ id_mesa: 1, id_atendente: 1 });

    expect(res.status).toBe(201);
    expect(mockMesa.update).toHaveBeenCalledWith(
      { status: 'ocupada' },
      { where: { id_mesa: 1 } }
    );
  });
});

describe('PUT /pedidos/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve retornar 404 para pedido inexistente', async () => {
    mockPedido.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .put('/pedidos/999')
      .set('Authorization', `Bearer ${token()}`)
      .send({ status: 'finalizado' });
    expect(res.status).toBe(404);
  });

  it('deve liberar mesa ao finalizar pedido', async () => {
    const mockPedidoInst = { id_mesa: 2, update: jest.fn().mockResolvedValue(true) };
    mockPedido.findByPk.mockResolvedValue(mockPedidoInst);
    mockMesa.update.mockResolvedValue([1]);

    const res = await request(app)
      .put('/pedidos/1')
      .set('Authorization', `Bearer ${token()}`)
      .send({ status: 'finalizado' });

    expect(res.status).toBe(200);
    expect(mockMesa.update).toHaveBeenCalledWith(
      { status: 'livre' },
      { where: { id_mesa: 2 } }
    );
  });

  it('não deve liberar mesa ao atualizar observações', async () => {
    const mockPedidoInst = { id_mesa: 2, update: jest.fn().mockResolvedValue(true) };
    mockPedido.findByPk.mockResolvedValue(mockPedidoInst);

    await request(app)
      .put('/pedidos/1')
      .set('Authorization', `Bearer ${token()}`)
      .send({ observacoes: 'sem cebola' });

    expect(mockMesa.update).not.toHaveBeenCalled();
  });
});

describe('DELETE /pedidos/:id', () => {
  it('deve retornar 403 para atendente', async () => {
    const res = await request(app)
      .delete('/pedidos/1')
      .set('Authorization', `Bearer ${token('atendente')}`);
    expect(res.status).toBe(403);
  });

  it('deve deletar pedido (gerente)', async () => {
    mockPedido.destroy.mockResolvedValue(1);
    const res = await request(app)
      .delete('/pedidos/1')
      .set('Authorization', `Bearer ${token('gerente')}`);
    expect(res.status).toBe(200);
  });

  it('deve retornar 404 para pedido inexistente (gerente)', async () => {
    mockPedido.destroy.mockResolvedValue(0);
    const res = await request(app)
      .delete('/pedidos/999')
      .set('Authorization', `Bearer ${token('gerente')}`);
    expect(res.status).toBe(404);
  });
});
