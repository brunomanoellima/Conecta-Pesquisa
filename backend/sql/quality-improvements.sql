-- Melhorias do checklist de implementação do Conecta Pesquisa
-- Implementa índices, views e stored procedures para otimização e modularidade.

-- =========================
-- Índices
-- =========================
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_profiles_user_id ON profiles (user_id);
CREATE INDEX idx_projects_docente_id ON projects (docente_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_tipo ON projects (tipo);
CREATE INDEX idx_projects_prazo ON projects (prazo_inscricao);
CREATE INDEX idx_applications_project_status ON applications (project_id, status);
CREATE INDEX idx_applications_discente_status ON applications (discente_id, status);
CREATE INDEX idx_mural_posts_project_created ON mural_posts (project_id, created_at);
CREATE INDEX idx_audit_logs_user_created ON audit_logs (user_id, created_at);

-- =========================
-- Views
-- =========================
CREATE OR REPLACE VIEW vw_open_projects AS
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
  AND p.deleted_at IS NULL;

CREATE OR REPLACE VIEW vw_application_summary AS
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
WHERE a.deleted_at IS NULL;

-- =========================
-- Stored procedures
-- =========================
DROP PROCEDURE IF EXISTS sp_count_applications_by_project;
DELIMITER $$
CREATE PROCEDURE sp_count_applications_by_project(IN p_project_id INT)
BEGIN
  SELECT status, COUNT(*) AS total
  FROM applications
  WHERE project_id = p_project_id
    AND deleted_at IS NULL
  GROUP BY status;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_list_open_projects;
DELIMITER $$
CREATE PROCEDURE sp_list_open_projects()
BEGIN
  SELECT *
  FROM vw_open_projects
  ORDER BY prazo_inscricao ASC;
END $$
DELIMITER ;
