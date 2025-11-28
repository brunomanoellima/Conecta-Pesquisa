# Requisitos

## Requisitos Funcionais

### Requisitos Funcionais — Docente (RF-DOS)

#### RF-DOC-01 — Criar projeto
**Descrição:** Docente cadastra projeto com: título, descrição, objetivos, requisitos, tipo (Extensão/Voluntário/); prazo de inscrição; campus/instituição; carga horária; vagas.  
**Critérios de aceite:**
- CA1: Não permitir salvar sem titulo.
- CA3: Ao criar, status inicial do projeto = ABERTO (ver RN-01).

---

#### RF-DOC-02 — Editar projeto
**Descrição:** Docente pode alterar campos do projeto enquanto não estiver CONCLUÍDO.  
**Critérios de aceite:**
- CA1: so pode editar quando projeto tiver com status != CONCLUIDO 
- CA2: Alterar prazo só se prazo novo ≥ hoje (RN-02).

---

#### RF-DOC-04 — Gerenciar participantes
**Descrição:** Adicionar/remover discentes participantes aprovados.  
**Critérios de aceite:**
- CA1: Só candidaturas ACEITA podem virar “participantes”.

---

#### RF-DOC-05 — Receber e avaliar candidaturas
**Descrição:** Visualizar lista, aceitar ou recusar.  
**Critérios de aceite:**
- CA1: A ação define status da candidatura para ACEITA ou RECUSADA.

---

#### RF-DOC-07 — Pesquisar perfis de alunos
**Descrição:** apenas pesquisar nome de perfil de alunos

---

#### RF-DOC-08 — Encerrar projeto
**Descrição:** Finalizar (CONCLUÍDO) e impedir novas candidaturas.  
**Critérios de aceite:**
- CA1: Ao CONCLUÍDO, candidaturas pendentes mudam para NÃO_AVALIADA_ENCERRADA.

---

## Requisitos Funcionais — Discente (RF-DIS)

#### RF-DIS-01 — Criar/atualizar perfil acadêmico
**Descrição:** Curso, campus, período, áreas de interesse, habilidades, links (Lattes, GitHub, portfólio).  
**Critérios de aceite:**

---

#### RF-DIS-02 — Buscar projetos disponíveis
**Descrição:** Listar projetos ABERTO.  
**Critérios de aceite:**
- CA2: Exibir contagem de vagas e prazo restante (D-1) (RN-03).

---

#### RF-DIS-03 — Ver detalhes do projeto
**Descrição:** Abrir página com todos os requisitos, descrição sobre o projeto e equipe atual.  
**Critérios de aceite:**
- CA1: Mostrar status, vagas, prazo, requisitos, docente responsável, modalidade.

---

#### RF-DIS-04 — Enviar candidatura
**Descrição:** Botão “Quero participar”, mensagem de motivação e envio.  
**Critérios de aceite:**
- CA2: Impedir candidatura duplicada no mesmo projeto (RN-09).
- CA3: Status inicial da candidatura = PENDENTE.

---

#### RF-DIS-05 — Acompanhar status das candidaturas
**Descrição:** acompanar status PENDENTE, ACEITA, RECUSADA, NÃO_AVALIADA_ENCERRADA.  
**Critérios de aceite:**
- CA1: Status possíveis: PENDENTE, ACEITA, RECUSADA, NÃO_AVALIADA_ENCERRADA.

---

#### RF-DIS-07 — Participar de projeto aprovado
**Descrição:** Ao ACEITA, discente passa a ver atualizações e equipe.  
**Critérios de aceite:**
- CA1: Acesso a mural
- CA2: Se removido do projeto o projeto sumira da lista;

---

# Requisitos Não-Funcionais

## Estados & Transições
- RN-01 (Projeto): Estados = ABERTO → EM_ANDAMENTO → CONCLUÍDO.
- RN-02 (Prazo de inscrição): prazo_inscrição deve ser ≥ D+1 (não pode ser data passada/hoje após 23:59 do fuso padrão).
- RN-03 (Candidaturas após prazo): Candidatar só é permitido se estado=ABERTO e agora ≤ prazo_inscrição.
- RN-04 (Fechamento automático): Ao CONCLUÍDO, candidaturas PENDENTE viram NÃO_AVALIADA_ENCERRADA e comunicação é bloqueada.

---

## Capacidade & Duplicidade
- RN-06 (Perfil mínimo): Para se candidatar, discente deve ter: curso, período.
- RN-07 (Período): Formato 1º a 12º (ou equivalente).
- RN-08 (Links): Validar URL (http/https) e máximo 5 links públicos.
- RN-09 (Candidatura única): 1 candidatura ativa por projeto por discente.
- RN-10 (Vagas): Ao aceitar uma candidatura, vagas ocupadas++ e, se vagas_ocupadas = vagas_totais, bloqueia novas aceitações.

---

## Mensagens & Anexos
- RN-15 (Remoção do participante): Ao remover participante, o sistema registra motivo e mantém histórico de participação (não apaga timeline).

---

## Auditoria & Transparência
- RN-16 (Trilha de auditoria): Todas as ações de criação/edição/decisão ficam registradas (quem, quando, o quê).

---

## Integridade e Consistência
- RN-20 (Exclusão lógica): Exclusões de projetos e candidaturas são lógicas.
- RN-21 (Campos obrigatórios): Projeto: título, tipo, prazo.
