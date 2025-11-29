CREATE DATABASE conecta_pesquisa_db;
USE conecta_pesquisa_db;

-- 1. Tabela de Usuários (Com deleted_at para Soft Delete)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('docente', 'discente', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 2. Tabela de Perfis (Com telefone, links separados e deleted_at)
CREATE TABLE profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    curso VARCHAR(100),
    campus VARCHAR(100),
    periodo VARCHAR(20),
    telefone VARCHAR(20),
    habilidades TEXT,
    link_lattes VARCHAR(255),
    link_github VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabela de Projetos (Com deleted_at)
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    docente_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    objetivos TEXT,
    requisitos TEXT,
    tipo ENUM('EXTENSAO', 'PESQUISA', 'VOLUNTARIO', 'MONITORIA') DEFAULT 'PESQUISA',
    campus VARCHAR(100),
    carga_horaria INT,
    status ENUM('ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO') DEFAULT 'ABERTO',
    prazo_inscricao DATETIME,
    vagas_totais INT DEFAULT 1,
    vagas_ocupadas INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (docente_id) REFERENCES users(id)
);

-- 4. Tabela de Candidaturas (Com motivo de remoção e deleted_at)
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    discente_id INT NOT NULL,
    mensagem TEXT,
    status ENUM('PENDENTE', 'ACEITA', 'RECUSADA', 'NAO_AVALIADA_ENCERRADA', 'REMOVIDO') DEFAULT 'PENDENTE',
    removal_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (discente_id) REFERENCES users(id)
);