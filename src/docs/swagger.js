const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Food Truck System API',
      version: '2.0.0',
      description: `
API REST para gerenciamento de food truck. Inclui autenticação JWT, controle de estoque,
gestão de pedidos, mesas, atendentes e relatórios gerenciais.

## Autenticação
Use \`POST /auth/login\` para obter um token JWT.
Inclua o token no header: \`Authorization: Bearer <token>\`

## Perfis
- **gerente**: acesso total (CRUD completo, relatórios, gestão de atendentes)
- **atendente**: criação e acompanhamento de pedidos, consulta de produtos e mesas
      `
    },
    servers: [{ url: 'http://localhost:3000', description: 'Desenvolvimento' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Erro: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Mensagem de erro' }
          }
        },
        Paginacao: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            pagina: { type: 'integer' },
            totalPaginas: { type: 'integer' },
            dados: { type: 'array', items: {} }
          }
        },
        Atendente: {
          type: 'object',
          properties: {
            id_atendente: { type: 'integer' },
            nome: { type: 'string' },
            cpf: { type: 'string' },
            telefone: { type: 'string' },
            login: { type: 'string' },
            tipo_usuario: { type: 'string', enum: ['gerente', 'atendente'] }
          }
        },
        Produto: {
          type: 'object',
          properties: {
            id_produto: { type: 'integer' },
            nome: { type: 'string' },
            descricao: { type: 'string' },
            preco: { type: 'number', format: 'decimal' },
            categoria: { type: 'string' },
            quantidade_estoque: { type: 'integer' },
            status: { type: 'string', enum: ['ativo', 'inativo'] },
            estoque_baixo: { type: 'boolean' }
          }
        },
        Mesa: {
          type: 'object',
          properties: {
            id_mesa: { type: 'integer' },
            numero_mesa: { type: 'integer' },
            status: { type: 'string', enum: ['livre', 'ocupada'] }
          }
        },
        Pedido: {
          type: 'object',
          properties: {
            id_pedido: { type: 'integer' },
            data_hora: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['aberto', 'finalizado', 'pago', 'cancelado'] },
            total: { type: 'number' },
            observacoes: { type: 'string' }
          }
        }
      }
    },
    security: [{ BearerAuth: [] }],
    paths: {
      '/auth/login': {
        post: {
          tags: ['Autenticação'],
          summary: 'Login',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['login', 'senha'],
                  properties: {
                    login: { type: 'string', example: 'admin' },
                    senha: { type: 'string', example: 'senha123' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Token JWT gerado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string' },
                      tipo_usuario: { type: 'string' },
                      nome: { type: 'string' }
                    }
                  }
                }
              }
            },
            401: { description: 'Credenciais inválidas', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Erro' } } } },
            422: { description: 'Dados inválidos', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Erro' } } } }
          }
        }
      },
      '/auth/me': {
        get: {
          tags: ['Autenticação'],
          summary: 'Dados do usuário autenticado',
          responses: {
            200: { description: 'Dados do usuário logado' },
            401: { description: 'Não autenticado' }
          }
        }
      },
      '/produtos': {
        get: {
          tags: ['Produtos'],
          summary: 'Listar produtos',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
            { in: 'query', name: 'categoria', schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['ativo', 'inativo'] } }
          ],
          responses: { 200: { description: 'Lista paginada de produtos' } }
        },
        post: {
          tags: ['Produtos'],
          summary: 'Criar produto (gerente)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nome', 'preco'],
                  properties: {
                    nome: { type: 'string' },
                    preco: { type: 'number' },
                    descricao: { type: 'string' },
                    categoria: { type: 'string' },
                    quantidade_estoque: { type: 'integer' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Produto criado' },
            403: { description: 'Acesso negado (requer gerente)' },
            422: { description: 'Dados inválidos' }
          }
        }
      },
      '/pedidos': {
        get: {
          tags: ['Pedidos'],
          summary: 'Listar pedidos',
          parameters: [
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['aberto', 'finalizado', 'pago', 'cancelado'] } },
            { in: 'query', name: 'page', schema: { type: 'integer' } }
          ],
          responses: { 200: { description: 'Lista paginada de pedidos' } }
        },
        post: {
          tags: ['Pedidos'],
          summary: 'Criar pedido',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['id_mesa', 'id_atendente'],
                  properties: {
                    id_mesa: { type: 'integer' },
                    id_atendente: { type: 'integer' },
                    observacoes: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Pedido criado, mesa marcada como ocupada' } }
        }
      },
      '/itens-pedido': {
        post: {
          tags: ['Itens de Pedido'],
          summary: 'Adicionar item ao pedido (desconta estoque atomicamente)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['id_pedido', 'id_produto', 'quantidade'],
                  properties: {
                    id_pedido: { type: 'integer' },
                    id_produto: { type: 'integer' },
                    quantidade: { type: 'integer', minimum: 1 }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Item adicionado, estoque descontado' },
            409: { description: 'Estoque insuficiente ou pedido não aberto' }
          }
        }
      },
      '/vendas': {
        post: {
          tags: ['Vendas'],
          summary: 'Registrar pagamento (transação atômica: venda + pedido pago + mesa livre)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['id_pedido', 'forma_pagamento', 'valor_total'],
                  properties: {
                    id_pedido: { type: 'integer' },
                    forma_pagamento: { type: 'string', enum: ['pix', 'credito', 'debito', 'dinheiro', 'mix'] },
                    valor_total: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Venda registrada' } }
        }
      },
      '/relatorios/resumo': {
        get: {
          tags: ['Relatórios'],
          summary: 'Resumo geral de vendas (gerente)',
          responses: { 200: { description: 'Estatísticas: total, faturamento, ticket médio, maior e menor venda' } }
        }
      },
      '/relatorios/estoque-baixo': {
        get: {
          tags: ['Relatórios'],
          summary: 'Produtos com estoque abaixo do limite',
          parameters: [
            { in: 'query', name: 'limite', schema: { type: 'integer', default: 5 } }
          ],
          responses: { 200: { description: 'Lista de produtos com estoque baixo' } }
        }
      },
      '/health': {
        get: {
          tags: ['Sistema'],
          summary: 'Health check',
          security: [],
          responses: { 200: { description: 'API funcionando' } }
        }
      }
    }
  },
  apis: []
};

module.exports = swaggerJsdoc(options);
