# Food Truck System API

Sistema de gerenciamento para food truck com controle de pedidos, estoque, mesas, atendentes e relatórios.

## Tecnologias

- **Node.js** + **Express 5**
- **MySQL** + **Sequelize ORM**
- **JWT** para autenticação
- **Helmet** + **CORS** + **Rate Limiting** para segurança
- **Joi** para validação de dados
- **Winston** para logging estruturado
- **Swagger/OpenAPI** para documentação
- **Jest** + **Supertest** para testes

## Pré-requisitos

- Node.js >= 18
- MySQL >= 8.0

## Instalação

```bash
# 1. Clonar repositório
git clone <repo-url>
cd foodtruck-system

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais
```

## Configuração (.env)

```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_USER=foodtruck_user
DB_PASS=SUA_SENHA_SEGURA
DB_NAME=sistema_pedidos
DB_PORT=3306

JWT_SECRET=chave_secreta_longa_e_aleatoria_minimo_32_chars
JWT_EXPIRES_IN=8h
NODE_ENV=development
PORT=3000
```

## Executar

```bash
# Desenvolvimento (hot reload)
npm run dev

# Produção
npm start

# Testes
npm test
```

## Documentação da API

Acesse `http://localhost:3000/docs` para a interface Swagger interativa.

## Endpoints

### Autenticação (pública)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Obter token JWT |
| GET | `/auth/me` | Dados do usuário logado |

### Atendentes (requer auth)
| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/atendentes` | Todos | Listar (paginado) |
| GET | `/atendentes/:id` | Todos | Buscar por ID |
| POST | `/atendentes` | Gerente | Criar |
| PUT | `/atendentes/:id` | Gerente | Atualizar |
| DELETE | `/atendentes/:id` | Gerente | Remover |

### Produtos (requer auth)
| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/produtos?categoria=&status=&page=&limit=` | Todos | Listar com filtros |
| GET | `/produtos/:id` | Todos | Buscar por ID |
| POST | `/produtos` | Gerente | Criar |
| PUT | `/produtos/:id` | Gerente | Atualizar |
| DELETE | `/produtos/:id` | Gerente | Remover |

### Mesas
| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/mesas?status=livre` | Todos | Listar mesas |
| PUT | `/mesas/:id` | Todos | Atualizar status |

### Pedidos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/pedidos?status=aberto` | Listar (paginado) |
| POST | `/pedidos` | Criar (marca mesa como ocupada) |
| PUT | `/pedidos/:id` | Atualizar status |

### Itens de Pedido
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/itens-pedido` | Adicionar item (desconta estoque atomicamente, previne race condition) |
| GET | `/itens-pedido?id_pedido=1` | Listar itens de um pedido |

### Vendas
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/vendas` | Registrar pagamento (transação atômica: venda + pedido pago + mesa livre) |
| GET | `/vendas` | Listar (paginado) |

### Relatórios (requer auth)
| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/relatorios/resumo` | Gerente | Faturamento total, ticket médio |
| GET | `/relatorios/vendas-por-dia?inicio=&fim=` | Todos | Vendas por dia |
| GET | `/relatorios/vendas-por-pagamento` | Todos | Vendas por forma de pagamento |
| GET | `/relatorios/estoque-baixo?limite=5` | Todos | Alertas de estoque baixo |

## Segurança implementada

| Vulnerabilidade | Status |
|----------------|--------|
| Autenticação JWT | ✅ Implementado |
| Hashing de senhas (bcrypt, cost 12) | ✅ Implementado |
| RBAC (gerente/atendente) | ✅ Implementado |
| Headers HTTP seguros (Helmet) | ✅ Implementado |
| CORS configurado | ✅ Implementado |
| Rate limiting (200 req/15min, 10 logins/15min) | ✅ Implementado |
| Validação de entrada (Joi) | ✅ Implementado |
| Body size limit (10kb) | ✅ Implementado |
| Stack trace oculto em produção | ✅ Implementado |
| .env no .gitignore | ✅ Implementado |

## Arquitetura

```
src/
├── app.js                  # Entry point, middlewares globais
├── config/
│   └── database.js         # Conexão Sequelize
├── controllers/            # Lógica de negócio
├── docs/
│   └── swagger.js          # Especificação OpenAPI
├── middleware/
│   ├── auth.js             # JWT + RBAC
│   ├── errorHandler.js     # Tratamento centralizado de erros
│   ├── logger.js           # Winston logging
│   └── validate.js         # Joi validation
├── models/                 # Entidades Sequelize
├── routes/                 # Definição de rotas
└── validators/             # Schemas Joi

tests/                      # Jest + Supertest
public/                     # Frontend HTML/CSS/JS
```

## Funcionalidades de negócio

- **Race condition de estoque**: `SELECT FOR UPDATE` ao adicionar itens ao pedido
- **Transações atômicas**: venda cria registro + marca pedido como pago + libera mesa em uma única transação
- **Gestão de mesas**: abertura de pedido ocupa mesa; finalização/pagamento/cancelamento libera
- **Alertas de estoque**: campo `estoque_baixo` em cada produto, endpoint `/relatorios/estoque-baixo`
- **Paginação**: todos os endpoints de listagem suportam `?page=&limit=`
- **Filtros**: produtos por `categoria` e `status`; pedidos por `status`; mesas por `status`

## Testes

```bash
npm test              # Executa todos os testes com cobertura
npm run test:watch    # Modo watch durante desenvolvimento
```

Cobertura mínima: 70% (middleware, controllers, validators).
