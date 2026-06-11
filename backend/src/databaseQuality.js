import { sequelize } from './database.js';

// --- OBJETOS DE QUALIDADE DO BANCO DE DADOS ---
// Este módulo atende ao checklist de verificação: índices, views e stored procedures.
// A criação é feita de forma segura: erros de duplicidade ou falta de privilégio são
// registrados no console, mas não impedem o backend de iniciar em serviços gratuitos.

const duplicateIndexCodes = ['ER_DUP_KEYNAME'];
const optionalObjectCodes = [
  'ER_DBACCESS_DENIED_ERROR',
  'ER_PROCACCESS_DENIED_ERROR',
  'ER_TABLEACCESS_DENIED_ERROR',
  'ER_SPECIFIC_ACCESS_DENIED_ERROR',
  'ER_ACCESS_DENIED_ERROR'
];

const safeQuery = async (label, sql, ignoredCodes = []) => {
  try {
    await sequelize.query(sql);
    console.log(`Objeto de banco verificado/criado: ${label}`);
  } catch (error) {
    const code = error?.original?.code || error?.parent?.code || error?.code;
    const errno = error?.original?.errno || error?.parent?.errno;

    if (ignoredCodes.includes(code) || errno === 1061) {
      console.log(`Objeto de banco já existente: ${label}`);
      return;
    }

    // Views e procedures podem exigir privilégios que alguns bancos gratuitos não liberam.
    console.warn(`Aviso ao criar ${label}:`, error.message);
  }
};

const createIndexes = async () => {
  // Índices voltados para os campos mais usados em login, filtros, vínculos e auditoria.
  const indexes = [
    ['idx_users_email', 'CREATE INDEX idx_users_email ON users (email)'],
    ['idx_users_role', 'CREATE INDEX idx_users_role ON users (role)'],
    ['idx_profiles_user_id', 'CREATE INDEX idx_profiles_user_id ON profiles (user_id)'],
    ['idx_projects_docente_id', 'CREATE INDEX idx_projects_docente_id ON projects (docente_id)'],
    ['idx_projects_status', 'CREATE INDEX idx_projects_status ON projects (status)'],
    ['idx_projects_tipo', 'CREATE INDEX idx_projects_tipo ON projects (tipo)'],
    ['idx_projects_prazo', 'CREATE INDEX idx_projects_prazo ON projects (prazo_inscricao)'],
    ['idx_applications_project_status', 'CREATE INDEX idx_applications_project_status ON applications (project_id, status)'],
    ['idx_applications_discente_status', 'CREATE INDEX idx_applications_discente_status ON applications (discente_id, status)'],
    ['idx_mural_posts_project_created', 'CREATE INDEX idx_mural_posts_project_created ON mural_posts (project_id, created_at)'],
    ['idx_audit_logs_user_created', 'CREATE INDEX idx_audit_logs_user_created ON audit_logs (user_id, created_at)']
  ];

  for (const [label, sql] of indexes) {
    await safeQuery(label, sql, duplicateIndexCodes);
  }
};

const createViews = async () => {
  // View para listar oportunidades abertas com dados básicos do docente.
  await safeQuery(
    'vw_open_projects',
    `CREATE OR REPLACE VIEW vw_open_projects AS
      SELECT
        p.id,
        p.titulo,
        p.tipo,
        p.campus,
        p.status,
        p.prazo_inscricao,
        p.vagas_totais,
        p.vagas_ocupadas,
        u.nome AS docente_nome,
        u.email AS docente_email
      FROM projects p
      LEFT JOIN users u ON u.id = p.docente_id
      WHERE p.status = 'ABERTO'
        AND p.deleted_at IS NULL`,
    optionalObjectCodes
  );

  // View para acompanhamento das candidaturas com informações do aluno e do projeto.
  await safeQuery(
    'vw_application_summary',
    `CREATE OR REPLACE VIEW vw_application_summary AS
      SELECT
        a.id,
        a.project_id,
        p.titulo AS projeto_titulo,
        a.discente_id,
        u.nome AS discente_nome,
        u.email AS discente_email,
        a.status,
        a.created_at
      FROM applications a
      INNER JOIN projects p ON p.id = a.project_id
      INNER JOIN users u ON u.id = a.discente_id
      WHERE a.deleted_at IS NULL`,
    optionalObjectCodes
  );
};

const createProcedures = async () => {
  await safeQuery('drop_sp_count_applications_by_project', 'DROP PROCEDURE IF EXISTS sp_count_applications_by_project', optionalObjectCodes);
  await safeQuery(
    'sp_count_applications_by_project',
    `CREATE PROCEDURE sp_count_applications_by_project(IN p_project_id INT)
      BEGIN
        SELECT status, COUNT(*) AS total
        FROM applications
        WHERE project_id = p_project_id
          AND deleted_at IS NULL
        GROUP BY status;
      END`,
    optionalObjectCodes
  );

  await safeQuery('drop_sp_list_open_projects', 'DROP PROCEDURE IF EXISTS sp_list_open_projects', optionalObjectCodes);
  await safeQuery(
    'sp_list_open_projects',
    `CREATE PROCEDURE sp_list_open_projects()
      BEGIN
        SELECT *
        FROM vw_open_projects
        ORDER BY prazo_inscricao ASC;
      END`,
    optionalObjectCodes
  );
};

export const ensureDatabaseQualityObjects = async () => {
  await createIndexes();
  await createViews();
  await createProcedures();
};
