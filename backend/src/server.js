import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { sequelize } from './database.js';
import { User, Project, Application, Profile, AuditLog, MuralPost } from './models.js';

/*
  Carrega as variáveis de ambiente do arquivo .env.
  Essas variáveis são usadas para conexão com banco, JWT, porta do servidor etc.
*/
dotenv.config();

/*
  Cria a aplicação Express.
  A variável app concentra as configurações, middlewares e rotas da API.
*/
const app = express();

/*
  Configuração de CORS.

  O CORS define quais frontends podem acessar este backend.
  Aqui são liberadas:
  - A URL de produção da Vercel;
  - URLs locais usadas durante desenvolvimento.
*/
app.use(cors({
  origin: [
    'https://conecta-pesquisa.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true
}));

/*
  Middleware para permitir que o backend leia JSON enviado pelo frontend.
  Sem isso, req.body viria vazio nas requisições POST e PUT.
*/
app.use(express.json());

// --- ROTAS DE TESTE DE SAÚDE ---

/*
  Rota raiz usada para verificar se o backend está online.
*/
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend Conecta Pesquisa online'
  });
});

/*
  Rota de health check da API.
  Pode ser usada no Render ou manualmente para testar se a API está funcionando.
*/
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API funcionando'
  });
});

// --- LOGS ---

/*
  Registra ações importantes dos usuários na tabela de auditoria.
  Essa função ajuda a rastrear login, cadastro, criação, edição e exclusão de projetos.
*/
const logAction = async (userId, action, details) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      details: JSON.stringify(details)
    });
  } catch (e) {
    console.error('Erro auditoria:', e);
  }
};

// --- AUTH MIDDLEWARE ---

/*
  Middleware de autenticação e autorização.

  Ele verifica:
  1. Se o usuário enviou token JWT;
  2. Se o token é válido;
  3. Se o usuário possui a permissão exigida pela rota.

  O parâmetro roles permite restringir uma rota a tipos específicos de usuário,
  como docente, discente ou admin.
*/
const auth = (roles = []) => (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token necessário' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, dec) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    if (roles.length && !roles.includes(dec.role)) {
      return res.status(403).json({ error: 'Proibido' });
    }

    req.userId = dec.id;
    req.userRole = dec.role;
    next();
  });
};

/*
  Normaliza o tipo de usuário recebido do frontend.

  Isso evita erro caso o frontend envie textos diferentes, como:
  - "Sou Aluno"
  - "aluno"
  - "discente"

  Todos são convertidos para o valor padrão usado no banco.
*/
const normalizeRole = (role) => {
  const value = String(role || '').toLowerCase().trim();

  if (value === 'aluno') return 'discente';
  if (value === 'sou aluno') return 'discente';
  if (value === 'discente') return 'discente';

  if (value === 'professor') return 'docente';
  if (value === 'sou professor') return 'docente';
  if (value === 'docente') return 'docente';

  if (value === 'admin') return 'admin';

  return value;
};

// --- ROTAS DE AUTENTICAÇÃO ---

/*
  Rota de login.

  Recebe email e senha, verifica se o usuário existe,
  compara a senha criptografada e retorna um token JWT.
*/
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Erro login' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAction(user.id, 'LOGIN', { ip: req.ip });

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });
  } catch (e) {
    console.error('Erro completo no login:', e);
    res.status(500).json({
      error: 'Erro login',
      details: e.message
    });
  }
});

/*
  Rota de cadastro.

  Cria um novo usuário no sistema.
  Antes de salvar, valida os campos obrigatórios, verifica se o e-mail já existe
  e criptografa a senha.
*/
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, password } = req.body;
    const role = normalizeRole(req.body.role);

    if (!nome || !email || !password || !role) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        details: 'nome, email, password e role são obrigatórios'
      });
    }

    if (!['discente', 'docente', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Tipo de usuário inválido',
        details: `Role recebido: ${req.body.role}`
      });
    }

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: 'Email já existe' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      nome,
      email,
      role,
      password_hash: hash
    });

    /*
      Quando o usuário é discente, cria automaticamente um perfil acadêmico.
      Esse perfil pode armazenar dados complementares do aluno.
    */
    if (role === 'discente') {
      await Profile.create({ user_id: user.id });
    }

    await logAction(user.id, 'REGISTER', { email: user.email });

    res.json({
      message: 'Usuário cadastrado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });
  } catch (e) {
    console.error('Erro completo no cadastro:', e);

    res.status(400).json({
      error: 'Erro registro',
      details: e.message
    });
  }
});

// --- PERFIL ---

/*
  Busca o perfil do usuário autenticado.
  Caso ainda não exista perfil, retorna um objeto vazio.
*/
app.get('/api/profile', auth(), async (req, res) => {
  try {
    const p = await Profile.findOne({ where: { user_id: req.userId } });
    res.json(p || {});
  } catch (e) {
    console.error('Erro ao buscar perfil:', e);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

/*
  Atualiza o perfil do discente autenticado.
  Apenas usuários do tipo discente podem alterar perfil acadêmico.
*/
app.put('/api/profile', auth(['discente']), async (req, res) => {
  try {
    let p = await Profile.findOne({ where: { user_id: req.userId } });

    if (!p) {
      p = await Profile.create({ user_id: req.userId });
    }

    await p.update(req.body);
    await logAction(req.userId, 'UPDATE_PROFILE', {});

    res.json(p);
  } catch (e) {
    console.error('Erro ao atualizar perfil:', e);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// --- PROJETOS ---

/*
  Lista projetos.

  Para docente:
  - Retorna apenas os projetos criados por ele.

  Para discente:
  - Retorna apenas projetos com status ABERTO.
*/
app.get('/api/projects', auth(), async (req, res) => {
  try {
    const where =
      req.userRole === 'docente'
        ? { docente_id: req.userId }
        : { status: 'ABERTO' };

    const projects = await Project.findAll({
      where,
      include: [
        {
          model: User,
          as: 'docente',
          attributes: ['nome']
        },
        {
          model: Application,
          where: { status: 'ACEITA' },
          required: false,
          include: [
            {
              model: User,
              as: 'discente',
              attributes: ['id', 'nome', 'email'],
              include: [Profile]
            }
          ]
        },
        {
          model: MuralPost,
          separate: true,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    res.json(projects);
  } catch (e) {
    console.error('Erro ao listar projetos:', e);
    res.status(500).json({ error: 'Erro ao listar projetos' });
  }
});

/*
  Cria um novo projeto acadêmico.
  Apenas docentes podem criar projetos.
*/
app.post('/api/projects', auth(['docente']), async (req, res) => {
  const { titulo, tipo, prazo_inscricao } = req.body;

  if (!titulo || !tipo || !prazo_inscricao) {
    return res.status(400).json({ error: 'Campos obrigatórios' });
  }

  try {
    const p = await Project.create({
      ...req.body,
      docente_id: req.userId,
      status: 'ABERTO'
    });

    await logAction(req.userId, 'CREATE_PROJECT', { projectId: p.id });

    res.json(p);
  } catch (e) {
    console.error('Erro ao criar projeto:', e);
    res.status(400).json({
      error: 'Erro criar',
      details: e.message
    });
  }
});

/*
  Edita um projeto existente.

  A edição só é permitida se:
  - O projeto existir;
  - O usuário autenticado for o docente dono do projeto.
*/
app.put('/api/projects/:id', auth(['docente']), async (req, res) => {
  try {
    const p = await Project.findByPk(req.params.id);

    if (!p) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    if (p.docente_id !== req.userId) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    await p.update(req.body);
    await logAction(req.userId, 'EDIT_PROJECT', { projectId: p.id });

    res.json(p);
  } catch (e) {
    console.error('Erro ao editar projeto:', e);
    res.status(500).json({ error: 'Erro ao editar' });
  }
});

/*
  Exclui um projeto.

  A exclusão só pode ser feita pelo docente responsável pelo projeto.
*/
app.delete('/api/projects/:id', auth(['docente']), async (req, res) => {
  try {
    const p = await Project.findByPk(req.params.id);

    if (!p) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    if (p.docente_id !== req.userId) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    await p.destroy();
    await logAction(req.userId, 'DELETE_PROJECT', { projectId: p.id });

    res.json({ message: 'Projeto excluído' });
  } catch (e) {
    console.error('Erro ao excluir projeto:', e);
    res.status(500).json({ error: 'Erro ao excluir' });
  }
});

/*
  Encerra um projeto.

  Ao encerrar o projeto:
  - O status do projeto muda para CONCLUIDO;
  - Candidaturas pendentes são marcadas como não avaliadas por encerramento.
*/
app.post('/api/projects/:id/close', auth(['docente']), async (req, res) => {
  try {
    const p = await Project.findByPk(req.params.id);

    if (!p) {
      return res.status(404).json({ error: 'Não encontrado' });
    }

    await p.update({ status: 'CONCLUIDO' });

    await Application.update(
      { status: 'NAO_AVALIADA_ENCERRADA' },
      {
        where: {
          project_id: p.id,
          status: 'PENDENTE'
        }
      }
    );

    res.json({ msg: 'Fechado' });
  } catch (e) {
    console.error('Erro ao fechar projeto:', e);
    res.status(500).json({ error: 'Erro ao fechar projeto' });
  }
});

// --- MURAL ---

/*
  Cria uma publicação no mural de um projeto.
  Apenas docentes podem publicar no mural.
*/
app.post('/api/projects/:id/mural', auth(['docente']), async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Vazio' });
    }

    const post = await MuralPost.create({
      project_id: req.params.id,
      user_id: req.userId,
      content
    });

    res.json(post);
  } catch (e) {
    console.error('Erro no mural:', e);
    res.status(500).json({ error: 'Erro' });
  }
});

// --- CANDIDATURAS ---

/*
  Permite que um discente se candidate a um projeto.

  A candidatura só é criada se:
  - O projeto existir;
  - O projeto estiver aberto;
  - O discente ainda não tiver se candidatado ao mesmo projeto.
*/
app.post('/api/projects/:id/apply', auth(['discente']), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    if (project.status !== 'ABERTO') {
      return res.status(400).json({ error: 'Fechado' });
    }

    const exists = await Application.findOne({
      where: {
        project_id: req.params.id,
        discente_id: req.userId
      }
    });

    if (exists) {
      return res.status(400).json({ error: 'Já candidatou' });
    }

    const appCreated = await Application.create({
      project_id: req.params.id,
      discente_id: req.userId,
      mensagem: req.body.mensagem
    });

    res.json(appCreated);
  } catch (e) {
    console.error('Erro ao candidatar:', e);
    res.status(500).json({ error: 'Erro ao candidatar' });
  }
});

/*
  Lista candidaturas.

  Para discente:
  - Retorna as próprias candidaturas.

  Para docente:
  - Retorna candidaturas dos projetos criados por ele.
*/
app.get('/api/applications', auth(), async (req, res) => {
  try {
    if (req.userRole === 'discente') {
      const apps = await Application.findAll({
        where: { discente_id: req.userId },
        include: [
          {
            model: Project,
            include: [
              { model: User, as: 'docente' },
              {
                model: MuralPost,
                separate: true,
                order: [['created_at', 'DESC']]
              }
            ]
          }
        ]
      });

      return res.json(apps);
    }

    const projects = await Project.findAll({
      where: { docente_id: req.userId },
      attributes: ['id']
    });

    const apps = await Application.findAll({
      where: {
        project_id: projects.map((p) => p.id)
      },
      include: [
        {
          model: User,
          as: 'discente',
          include: [Profile]
        },
        {
          model: Project
        }
      ]
    });

    res.json(apps);
  } catch (e) {
    console.error('Erro ao listar candidaturas:', e);
    res.status(500).json({ error: 'Erro ao listar candidaturas' });
  }
});

/*
  Atualiza o status de uma candidatura.

  O docente pode:
  - Aceitar;
  - Recusar;
  - Remover.

  Ao aceitar, o sistema verifica se ainda há vagas disponíveis.
*/
app.put('/api/applications/:id', auth(['docente']), async (req, res) => {
  try {
    const { status, reason } = req.body;

    const appFound = await Application.findByPk(req.params.id);

    if (!appFound) {
      return res.status(404).json({ error: 'Candidatura não encontrada' });
    }

    const project = await Project.findByPk(appFound.project_id);

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    if (status === 'ACEITA') {
      if (project.vagas_ocupadas >= project.vagas_totais) {
        return res.status(400).json({ error: 'Lotado' });
      }

      project.vagas_ocupadas++;
      await project.save();
    }

    /*
      Quando uma candidatura aceita é recusada ou removida,
      a quantidade de vagas ocupadas do projeto é reduzida.
    */
    if (
      (status === 'RECUSADA' || status === 'REMOVIDO') &&
      appFound.status === 'ACEITA'
    ) {
      project.vagas_ocupadas--;
      await project.save();
    }

    if (reason) {
      appFound.removal_reason = reason;
    }

    appFound.status = status;

    await appFound.save();

    res.json(appFound);
  } catch (e) {
    console.error('Erro ao atualizar candidatura:', e);
    res.status(500).json({ error: 'Erro ao atualizar candidatura' });
  }
});

/*
  Busca discentes pelo nome.

  Essa rota é usada pelo docente para localizar alunos cadastrados.
*/
app.get('/api/users/search', auth(['docente']), async (req, res) => {
  try {
    const { nome } = req.query;

    if (!nome) {
      return res.json([]);
    }

    const users = await User.findAll({
      where: {
        role: 'discente',
        nome: {
          [Op.like]: `%${nome}%`
        }
      },
      include: [{ model: Profile }]
    });

    res.json(users);
  } catch (e) {
    console.error('Erro ao buscar usuários:', e);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

/*
  Define a porta do servidor.

  Em produção, o Render define process.env.PORT automaticamente.
  Em desenvolvimento local, usa a porta 3000.
*/
const PORT = process.env.PORT || 3000;

/*
  Sincroniza os modelos Sequelize com o banco de dados e inicia o servidor.

  Se a conexão com o banco falhar, o erro é exibido no console
  e a aplicação é encerrada para evitar execução inconsistente.
*/
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
      console.log('Servidor rodando com CORS configurado corretamente!');
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar/sincronizar com o banco:', error);
    process.exit(1);
  });