/**
 * Script de seed: cria o primeiro usuário gerente.
 * Execute UMA VEZ após o deploy: node scripts/seed.js
 */
require('dotenv').config();
const sequelize = require('../src/config/database');
const Atendente = require('../src/models/Atendente');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Banco conectado');

    const existe = await Atendente.findOne({ where: { login: 'admin' } });
    if (existe) {
      console.log('ℹ️  Usuário admin já existe. Nada a fazer.');
      process.exit(0);
    }

    await Atendente.create({
      nome: 'Administrador',
      cpf: '00000000000',
      login: 'admin',
      senha: 'admin123',   // hasheado automaticamente pelo hook beforeCreate
      tipo_usuario: 'gerente'
    });

    console.log('🎉 Admin criado com sucesso!');
    console.log('   Login: admin');
    console.log('   Senha: admin123');
    console.log('⚠️  Altere a senha após o primeiro login!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no seed:', err.message);
    process.exit(1);
  }
}

seed();
