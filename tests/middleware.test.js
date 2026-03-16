const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_secret_middleware';

const { authMiddleware, requireRole } = require('../src/middleware/auth');
const validate = require('../src/middleware/validate');
const Joi = require('joi');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  it('deve retornar 401 sem header Authorization', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 com token inválido', () => {
    const req = { headers: { authorization: 'Bearer token_invalido' } };
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('deve chamar next() com token válido', () => {
    const token = jwt.sign({ id: 1, tipo_usuario: 'gerente' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(1);
  });
});

describe('requireRole', () => {
  it('deve retornar 403 com perfil errado', () => {
    const req = { user: { tipo_usuario: 'atendente' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole('gerente')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('deve chamar next() com perfil correto', () => {
    const req = { user: { tipo_usuario: 'gerente' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole('gerente')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('validate middleware', () => {
  const schema = Joi.object({ nome: Joi.string().required() });

  it('deve retornar 422 com dados inválidos', () => {
    const req = { body: {} };
    const res = mockRes();
    const next = jest.fn();
    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() com dados válidos', () => {
    const req = { body: { nome: 'Produto A' } };
    const res = mockRes();
    const next = jest.fn();
    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
