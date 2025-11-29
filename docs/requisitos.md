# Requisitos do Sistema Conecta Pesquisa

## Requisitos Funcionais

### Requisitos Funcionais — Docente (RF-DOC)

#### RF-DOC-01 — Criar projeto
**Descrição:** Docente cadastra projeto com: título, descrição, objetivos, requisitos, tipo (Extensão/Pesquisa/Voluntário/Monitoria); prazo de inscrição; campus; carga horária; vagas totais.  
**Critérios de aceite:**
- CA1: Não permitir salvar sem preencher os campos obrigatórios (título, prazo, tipo).
- CA2: Ao criar, status inicial do projeto = ABERTO.

---

#### RF-DOC-02 — Editar projeto
**Descrição:** Docente pode alterar campos do projeto enquanto o status não for CONCLUÍDO.  
**Critérios de aceite:**
- CA1: O sistema deve bloquear a edição se o status for CONCLUÍDO.
- CA2: Alteração de prazo só é permitida se a nova data for futura (≥ hoje + 1 dia).

---

#### RF-DOC-04 — Gerenciar participantes (Aba "Minhas Equipes")
**Descrição:** Visualizar e gerenciar alunos aprovados na aba "Minhas Equipes". Permite remover um participante da equipe solicitando um motivo.  
**Critérios de aceite:**
- CA1: Apenas candidaturas com status ACEITA aparecem nesta lista de membros.
- CA2: Ao remover um aluno, o sistema deve exigir a digitação de um motivo (RN-15).

---

#### RF-DOC-05 — Receber e avaliar candidaturas
**Descrição:** Visualizar lista de interessados na aba "Candidaturas", podendo aceitar ou recusar.  
**Critérios de aceite:**
- CA1: A ação altera o status para ACEITA (incrementa vaga) ou RECUSADA.
- CA2: Visualizar nome e curso do aluno antes de decidir.

---

#### RF-DOC-07 — Pesquisar perfis de alunos
**Descrição:** Barra de busca integrada na aba "Minhas Equipes" para localizar alunos por nome.  
**Critérios de aceite:**
- CA1: Exibir lista de resultados com nome, email e competências (tags).
- CA2: Botão "Ver Perfil" abre um modal com detalhes completos (Telefone, Links, Habilidades).

---

#### RF-DOC-08 — Encerrar projeto
**Descrição:** Finalizar o projeto (status CONCLUÍDO) manualmente através do dashboard.  
**Critérios de aceite:**
- CA1: Ao mudar para CONCLUÍDO, todas as candidaturas ainda PENDENTE são automaticamente alteradas para NÃO_AVALIADA_ENCERRADA.

---

## Requisitos Funcionais — Discente (RF-DIS)

#### RF-DIS-01 — Criar/atualizar perfil acadêmico
**Descrição:** Formulário para dados acadêmicos e contato: Curso, Campus, Período, Telefone (WhatsApp), Lista dinâmica de Habilidades e Links específicos (Lattes e GitHub).  
**Critérios de aceite:**
- CA1: Habilidades devem ser adicionadas como tags.
- CA2: Links devem ser validados como URLs válidas.

---

#### RF-DIS-02 — Buscar projetos disponíveis
**Descrição:** Listar projetos com status ABERTO no dashboard.  
**Critérios de aceite:**
- CA1: Exibir contagem de vagas ocupadas/totais.
- CA2: Exibir destaque em vermelho com a contagem regressiva de dias restantes para inscrição (D-1).

---

#### RF-DIS-03 — Ver detalhes do projeto
**Descrição:** Modal "Ver Detalhes" contendo descrição, objetivos, requisitos, carga horária e equipe atual.  
**Critérios de aceite:**
- CA1: Exibir todos os dados públicos do projeto.
- CA2: Botão "Quero Participar" visível apenas se o aluno ainda não se candidatou.

---

#### RF-DIS-04 — Enviar candidatura
**Descrição:** Envio de solicitação com mensagem de motivação.  
**Critérios de aceite:**
- CA1: Bloquear se o perfil mínimo (Curso/Período) não estiver preenchido (RN-06).
- CA2: Impedir candidatura duplicada no mesmo projeto.
- CA3: Status inicial = PENDENTE.

---

#### RF-DIS-05 — Acompanhar status das candidaturas
**Descrição:** Aba "Candidaturas" listando o histórico e estado atual (PENDENTE, ACEITA, RECUSADA, etc.).  
**Critérios de aceite:**
- CA1: Visualização clara do status através de etiquetas coloridas (Badges).

---

#### RF-DIS-07 — Participar de projeto aprovado (Aba "Meus Murais")
**Descrição:** Projetos com status ACEITA aparecem em uma aba exclusiva "Meus Murais" ou "Projetos Ativos".  
**Critérios de aceite:**
- CA1: Exibir cartão de boas-vindas (Mural da Equipe).
- CA2: Exibir dados de contato do docente responsável e lista de membros da equipe.
- CA3: Se o aluno for removido, o projeto desaparece desta aba.

---

# Requisitos Não-Funcionais

## Estados & Transições
- RN-01 (Fluxo do Projeto): ABERTO → CONCLUÍDO (Status EM_ANDAMENTO é implícito quando há vagas preenchidas, mas o controle manual é ABERTO/CONCLUÍDO).
- RN-02 (Prazo de inscrição): O prazo deve ser uma data futura (D+1) em relação ao momento da criação/edição.
- RN-03 (Janela de Candidatura): Permitido apenas se status=ABERTO e data atual ≤ prazo_inscrição.
- RN-04 (Fechamento automático): Ao encerrar projeto, candidaturas pendentes são invalidadas automaticamente.

---

## Capacidade & Duplicidade
- RN-06 (Perfil mínimo): Obrigatório preencher Curso e Período para se candidatar.
- RN-07 (Período): Seleção padronizada via lista (1º ao 10º Período + Finalista).
- RN-08 (Validação de Links): Links de Lattes e GitHub devem ser URLs válidas (http/https).
- RN-09 (Unicidade): Apenas 1 candidatura ativa por projeto por aluno.
- RN-10 (Controle de Vagas): O sistema impede o aceite de novos alunos se vagas_ocupadas >= vagas_totais.

---

## Mensagens & Anexos
- RN-15 (Histórico de Remoção): A remoção de um participante exige um motivo textual, que fica salvo no banco de dados para histórico.

---

## Auditoria & Transparência
- RN-16 (Auditoria): Ações críticas (Login, Cadastro, Criar Projeto, Decisão de Candidatura, Atualização de Perfil) são registradas na tabela audit_logs com ID do usuário e detalhes.

---

## Integridade e Consistência
- RN-20 (Exclusão Lógica): Uso de Soft Delete (deleted_at) para Usuários, Projetos e Candidaturas. Nada é apagado fisicamente do banco.
- RN-21 (Campos obrigatórios do Projeto): Título, Tipo, Prazo, Vagas e Carga Horária são obrigatórios.
