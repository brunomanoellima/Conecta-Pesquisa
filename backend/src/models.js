import { DataTypes } from 'sequelize';
import { sequelize } from './database.js';

export const User = sequelize.define('user', {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('docente', 'discente', 'admin'), allowNull: false },
}, { 
  underscored: true, // <--- CORREÇÃO AQUI (Força usar created_at e updated_at)
  tableName: 'users' 
});

export const Project = sequelize.define('project', {
  titulo: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO'), defaultValue: 'ABERTO' },
  prazo_inscricao: { type: DataTypes.DATE },
  vagas_totais: { type: DataTypes.INTEGER, defaultValue: 1 },
  vagas_ocupadas: { type: DataTypes.INTEGER, defaultValue: 0 },
  docente_id: { type: DataTypes.INTEGER }
}, { 
  underscored: true, 
  tableName: 'projects' 
});

export const Application = sequelize.define('application', {
  mensagem: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('PENDENTE', 'ACEITA', 'RECUSADA'), defaultValue: 'PENDENTE' },
  project_id: { type: DataTypes.INTEGER },
  discente_id: { type: DataTypes.INTEGER }
}, { 
  underscored: true, 
  tableName: 'applications' 
});

// Associações
User.hasMany(Project, { foreignKey: 'docente_id' });
Project.belongsTo(User, { as: 'docente', foreignKey: 'docente_id' });
Project.hasMany(Application, { foreignKey: 'project_id' });
Application.belongsTo(User, { as: 'discente', foreignKey: 'discente_id' });