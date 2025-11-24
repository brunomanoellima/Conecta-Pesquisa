CREATE DATABASE conecta_pesquisa_db;
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

-- Tabela Candidaturas
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    discente_id INT NOT NULL,
    mensagem TEXT,
    status ENUM('PENDENTE', 'ACEITA', 'RECUSADA') DEFAULT 'PENDENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (discente_id) REFERENCES users(id)
);

-- Inserir 1 Docente (senha: 123456) e 1 Discente (senha: 123456)
-- Hash gerado para '123456' é $2a$10$x/.. (exemplo fictício, usaremos bcrypt no código)
INSERT INTO users (nome, email, password_hash, role) VALUES 
('Prof. Bruno', 'docente@teste.com', '$2a$10$EixZaYVK1fsnwKzl.1//oubne/L7qCP.5.D.Z/..ExemploHash', 'docente'),
('Aluno João', 'aluno@teste.com', '$2a$10$EixZaYVK1fsnwKzl.1//oubne/L7qCP.5.D.Z/..ExemploHash', 'discente');