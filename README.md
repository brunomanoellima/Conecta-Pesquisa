# 🔗 Conecta Pesquisa

Plataforma web para conectar estudantes e docentes de diferentes cursos em projetos de pesquisa, extensão e inovação, formando equipes interdisciplinares com base em interesses e objetivos comuns.

---
# 🐱‍💻 Equipe
**Bruno - Nelio**
# 📌 1) Contexto

A Conecta Pesquisa facilita o encontro entre alunos interessados e professores com projetos ativos, permitindo que iniciativas científicas, tecnológicas e sociais avancem por meio da colaboração organizada e transparente.

---

# 🎯 2) Problema e Público-Alvo

## 💡 O Problema

Na UFAM, muitos alunos desejam participar de pesquisas, mas não sabem por onde começar. Ao mesmo tempo, docentes têm dificuldade para encontrar alunos com o perfil adequado.

Essa falta de conexão torna a pesquisa:

- Centralizada (restrita a grupos pequenos)
- Desmotivadora para iniciantes
- Pouco inovadora, pela falta de interdisciplinaridade

A plataforma Conecta Pesquisa surge para resolver esse cenário, aproximando docentes e discentes através de interesses, objetivos e competências compartilhadas.

## 👥 Público-alvo

### 👩‍🏫 Docentes  
Professores que querem divulgar projetos, acompanhar candidaturas e selecionar alunos qualificados.

### 🎓 Discentes  
Estudantes buscando oportunidades de iniciar sua trajetória científica ou participar de projetos práticos.

---

# ⚙️ 3) Funcionalidades por Tipo de Usuário

## 👩‍🏫 Perfil Docente

- Criar projetos
- Editar e encerrar projetos
- Avaliar candidaturas
- Gerenciar participantes
- Pesquisar perfis de alunos

## 🎓 Perfil Discente

- Criar perfil acadêmico
- Buscar projetos disponíveis
- Ver detalhes e candidatar-se
- Acompanhar status das candidaturas
- Acessar murais dos projetos aprovados

---

# 📋 4) Requisitos Funcionais

## 👩‍🏫 Docente (RF-DOC)

### RF-DOC-01 — Criar projeto
Projeto com título, objetivos, requisitos, tipo, carga horária, vagas e prazo de inscrição.

### RF-DOC-02 — Editar projeto
Permitido apenas enquanto status ≠ CONCLUÍDO.

### RF-DOC-04 — Gerenciar participantes
Remover membros com justificativa obrigatória.

### RF-DOC-05 — Avaliar candidaturas
Aceitar ou recusar solicitações.

### RF-DOC-07 — Pesquisar perfis
Busca por nome com modal detalhado.

### RF-DOC-08 — Encerrar projeto
Candidaturas pendentes viram “NÃO_AVALIADA_ENCERRADA”.

---

## 🎓 Discente (RF-DIS)

### RF-DIS-01 — Criar perfil acadêmico
Curso, período, habilidades (tags), links e contato.

### RF-DIS-02 — Buscar projetos
Exibe apenas projetos ABERTOS.

### RF-DIS-03 — Ver detalhes
Modal com todas as informações.

### RF-DIS-04 — Enviar candidatura
Mensagem + validações de perfil.

### RF-DIS-05 — Acompanhar status
Badges de status.

### RF-DIS-07 — Acessar “Meus Murais”
Projetos aprovados aparecem nesta seção.

---

# 🛡️ 5) Requisitos Não-Funcionais

## Estados & Transições

- RN-01 — Fluxo ABERTO → CONCLUÍDO
- RN-02 — Prazo futuro
- RN-03 — Candidatura permitida apenas se dentro da data
- RN-04 — Fechamento automático

## Capacidade & Duplicidade

- RN-06 — Perfil mínimo obrigatório
- RN-08 — Validação de URLs
- RN-09 — 1 candidatura por projeto
- RN-10 — Controle de vagas

## Mensagens & Anexos

- RN-15 — Histórico de remoção exige motivo

## Auditoria

- RN-16 — Todas ações críticas são logadas

## Integridade

- RN-20 — Soft Delete
- RN-21 — Campos obrigatórios

---

# 🧩 6) Diagramas

## 📘 Diagrama de Classes
![Classes UML](https://drive.google.com/uc?export=view&id=11dxdpWd2tc_8D5jPTsUaVt0aJMB7F3HO)

## 🎭 Casos de Uso
![Casos de Uso](https://drive.google.com/uc?export=view&id=10tHVvIChhB3Eh-NRKNHoiVS0_-ylHpfb)

## 🖥️ Deployment
![Deployment](https://drive.google.com/uc?export=view&id=1_0fqJt2d5U0uLflZyKU7ZjeFxN0musB-)

## 🔄 Sequência
![Sequência](https://drive.google.com/uc?export=view&id=1cEvlkQ2jYkXEr-oDVb7COeLuBhZnATYB)

## 🔁 Fluxo de Atividade
![Fluxo de Atividade](https://drive.google.com/uc?export=view&id=1S-CRRCHF1bK9OsfAtJvZKEouOnDVBweX)

## 🧱 Componentes
![Componente](https://drive.google.com/uc?export=view&id=1zmzR8DfziBgIQmea0hVGICBCn_N4Zs4U)

---

# ✅ Conclusão

O **Conecta Pesquisa** organiza, centraliza e facilita toda a comunicação entre alunos e professores da UFAM, promovendo um ambiente mais colaborativo, acessível e transparente para projetos acadêmicos.

Este README compila toda a visão do sistema — desde o problema até os requisitos e diagramas — permitindo compreender rapidamente o objetivo e o funcionamento da plataforma.

---
