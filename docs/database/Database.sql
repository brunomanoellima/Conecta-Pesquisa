CREATE DATABASE IF NOT EXISTS conecta_pesquisa_db;
USE conecta_pesquisa_db;

-- Tabela Usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('docente', 'discente', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela Projetos
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    docente_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status ENUM('ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO') DEFAULT 'ABERTO',
    prazo_inscricao DATETIME,
    vagas_totais INT DEFAULT 1,
    vagas_ocupadas INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_id) REFERENCES users(id)
);

-- Tabela Candidaturas (CORRIGIDA COM UPDATED_AT)
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    discente_id INT NOT NULL,
    mensagem TEXT,
    status ENUM('PENDENTE', 'ACEITA', 'RECUSADA') DEFAULT 'PENDENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Adicionado aqui
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (discente_id) REFERENCES users(id)
);