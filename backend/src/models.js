import { DataTypes } from 'sequelize';
import { sequelize } from './database.js';

const defaultOptions = { underscored: true, paranoid: true, timestamps: true };

export const User = sequelize.define('user', {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('docente', 'discente', 'admin'), allowNull: false },
}, { ...defaultOptions, tableName: 'users' });

export const Profile = sequelize.define('profile', {
  curso: { type: DataTypes.STRING },
  campus: { type: DataTypes.STRING },
  periodo: { type: DataTypes.STRING },
  telefone: { type: DataTypes.STRING },
  habilidades: { type: DataTypes.TEXT },
  link_lattes: { type: DataTypes.STRING },
  link_github: { type: DataTypes.STRING }
}, { ...defaultOptions, tableName: 'profiles' });

export const Project = sequelize.define('project', {
  titulo: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.TEXT },
  objetivos: { type: DataTypes.TEXT },
  requisitos: { type: DataTypes.TEXT },
  tipo: { type: DataTypes.ENUM('EXTENSAO', 'PESQUISA', 'VOLUNTARIO', 'MONITORIA'), defaultValue: 'PESQUISA' },
  campus: { type: DataTypes.STRING },
  carga_horaria: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO'), defaultValue: 'ABERTO' },
  prazo_inscricao: { type: DataTypes.DATE },
  vagas_totais: { type: DataTypes.INTEGER, defaultValue: 1 },
  vagas_ocupadas: { type: DataTypes.INTEGER, defaultValue: 0 },
  docente_id: { type: DataTypes.INTEGER }
}, { ...defaultOptions, tableName: 'projects' });

export const Application = sequelize.define('application', {
  mensagem: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('PENDENTE', 'ACEITA', 'RECUSADA', 'NAO_AVALIADA_ENCERRADA', 'REMOVIDO'), defaultValue: 'PENDENTE' },
  removal_reason: { type: DataTypes.TEXT },
  project_id: { type: DataTypes.INTEGER },
  discente_id: { type: DataTypes.INTEGER }
}, { ...defaultOptions, tableName: 'applications', updatedAt: false });

// --- NOVO MODELO: MURAL POST ---
export const MuralPost = sequelize.define('mural_post', {
  content: { type: DataTypes.TEXT, allowNull: false },
  user_id: { type: DataTypes.INTEGER },
  project_id: { type: DataTypes.INTEGER }
}, { ...defaultOptions, tableName: 'mural_posts', paranoid: false }); // Mural não precisa de soft delete por enquanto

export const AuditLog = sequelize.define('audit_log', {
  user_id: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING },
  details: { type: DataTypes.TEXT }
}, { underscored: true, tableName: 'audit_logs', updatedAt: false, paranoid: false, createdAt: 'created_at' });

// Associações
User.hasOne(Profile, { foreignKey: 'user_id' });
Profile.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Project, { foreignKey: 'docente_id' });
Project.belongsTo(User, { as: 'docente', foreignKey: 'docente_id' });
Project.hasMany(Application, { foreignKey: 'project_id' });
Application.belongsTo(Project, { foreignKey: 'project_id' });
User.hasMany(Application, { foreignKey: 'discente_id' });
Application.belongsTo(User, { as: 'discente', foreignKey: 'discente_id' });

// Associações do Mural
Project.hasMany(MuralPost, { foreignKey: 'project_id' });
MuralPost.belongsTo(Project, { foreignKey: 'project_id' });
User.hasMany(MuralPost, { foreignKey: 'user_id' });
MuralPost.belongsTo(User, { foreignKey: 'user_id' });