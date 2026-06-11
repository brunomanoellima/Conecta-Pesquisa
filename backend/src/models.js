import { DataTypes } from 'sequelize';
import { sequelize } from './database.js';

// Opções padrão: nomes de colunas em snake_case, timestamps automáticos e exclusão lógica.
const defaultOptions = { underscored: true, paranoid: true, timestamps: true };

export const User = sequelize.define('user', {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('docente', 'discente', 'admin'), allowNull: false },
}, {
  ...defaultOptions,
  tableName: 'users',
  indexes: [
    { name: 'idx_users_email', fields: ['email'] },
    { name: 'idx_users_role', fields: ['role'] }
  ]
});

export const Profile = sequelize.define('profile', {
  curso: { type: DataTypes.STRING },
  campus: { type: DataTypes.STRING },
  periodo: { type: DataTypes.STRING },
  telefone: { type: DataTypes.STRING },
  habilidades: { type: DataTypes.TEXT },
  link_lattes: { type: DataTypes.STRING },
  link_github: { type: DataTypes.STRING }
}, {
  ...defaultOptions,
  tableName: 'profiles',
  indexes: [
    { name: 'idx_profiles_user_id', fields: ['user_id'] }
  ]
});

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
}, {
  ...defaultOptions,
  tableName: 'projects',
  indexes: [
    { name: 'idx_projects_docente_id', fields: ['docente_id'] },
    { name: 'idx_projects_status', fields: ['status'] },
    { name: 'idx_projects_tipo', fields: ['tipo'] },
    { name: 'idx_projects_prazo', fields: ['prazo_inscricao'] }
  ]
});

export const Application = sequelize.define('application', {
  mensagem: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('PENDENTE', 'ACEITA', 'RECUSADA', 'NAO_AVALIADA_ENCERRADA', 'REMOVIDO'), defaultValue: 'PENDENTE' },
  removal_reason: { type: DataTypes.TEXT },
  project_id: { type: DataTypes.INTEGER },
  discente_id: { type: DataTypes.INTEGER }
}, {
  ...defaultOptions,
  tableName: 'applications',
  updatedAt: false,
  indexes: [
    { name: 'idx_applications_project_status', fields: ['project_id', 'status'] },
    { name: 'idx_applications_discente_status', fields: ['discente_id', 'status'] }
  ]
});

// --- NOVO MODELO: MURAL POST ---
export const MuralPost = sequelize.define('mural_post', {
  content: { type: DataTypes.TEXT, allowNull: false },
  user_id: { type: DataTypes.INTEGER },
  project_id: { type: DataTypes.INTEGER }
}, {
  ...defaultOptions,
  tableName: 'mural_posts',
  paranoid: false,
  indexes: [
    { name: 'idx_mural_posts_project_created', fields: ['project_id', 'created_at'] }
  ]
}); // Mural não precisa de soft delete por enquanto

export const AuditLog = sequelize.define('audit_log', {
  user_id: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING },
  details: { type: DataTypes.TEXT }
}, {
  underscored: true,
  tableName: 'audit_logs',
  updatedAt: false,
  paranoid: false,
  createdAt: 'created_at',
  indexes: [
    { name: 'idx_audit_logs_user_created', fields: ['user_id', 'created_at'] }
  ]
});

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