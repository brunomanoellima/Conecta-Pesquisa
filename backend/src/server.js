import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sequelize } from './database.js';
import { User, Project, Application } from './models.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- Middleware de Autenticação ---
const auth = (roles = []) => (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ error: 'Acesso negado para este perfil' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// --- Rota de Registro ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, password, role } = req.body;
    
    // Verifica duplicidade
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ error: 'Email já cadastrado' });

    // Cria usuário
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ nome, email, role, password_hash: hash });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Erro ao registrar' });
  }
});

// --- Rota de Login ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    // Verifica credenciais
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gera Token
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, nome: user.nome, role: user.role } });
  } catch (error) {
    console.error("Erro no Login:", error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// --- Rotas de Projetos ---
app.get('/api/projects', auth(), async (req, res) => {
  try {
    // Docente vê os seus, Discente vê os abertos
    const where = req.userRole === 'docente' ? { docente_id: req.userId } : { status: 'ABERTO' };
    const projects = await Project.findAll({ where, include: ['docente'] });
    res.json(projects);
  } catch (e) { res.status(500).json({ error: 'Erro ao buscar projetos' }); }
});

app.post('/api/projects', auth(['docente']), async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, docente_id: req.userId });
    res.json(project);
  } catch (e) { res.status(400).json({ error: 'Erro ao criar projeto' }); }
});

app.post('/api/projects/:id/apply', auth(['discente']), async (req, res) => {
  try {
    // Verifica se já candidatou
    const exists = await Application.findOne({ where: { project_id: req.params.id, discente_id: req.userId }});
    if(exists) return res.status(400).json({ error: 'Você já se candidatou a este projeto.' });

    // Cria candidatura
    const app = await Application.create({ 
      project_id: req.params.id, 
      discente_id: req.userId, 
      mensagem: req.body.mensagem 
    });
    res.json(app);
  } catch (e) { 
    console.error(e);
    res.status(400).json({error: 'Erro ao realizar candidatura'}); 
  }
});

// --- Rotas de Gerenciamento (Candidaturas) ---
app.get('/api/applications', auth(), async (req, res) => {
  try {
    if (req.userRole === 'discente') {
      // Aluno vê as suas
      const apps = await Application.findAll({ 
        where: { discente_id: req.userId },
        include: [{ model: Project, attributes: ['titulo', 'status'] }]
      });
      return res.json(apps);
    } else if (req.userRole === 'docente') {
      // Docente vê as recebidas
      const projects = await Project.findAll({ where: { docente_id: req.userId }, attributes: ['id'] });
      const projectIds = projects.map(p => p.id);
      
      const apps = await Application.findAll({
        where: { project_id: projectIds },
        include: [
          { model: User, as: 'discente', attributes: ['nome', 'email'] },
          { model: Project, attributes: ['titulo'] }
        ]
      });
      return res.json(apps);
    }
  } catch (e) { res.status(500).json({ error: 'Erro ao buscar candidaturas' }); }
});

app.put('/api/applications/:id', auth(['docente']), async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ error: 'Não encontrado' });
    
    app.status = status;
    await app.save();

    // Lógica de vagas
    if (status === 'ACEITA') {
      const project = await Project.findByPk(app.project_id);
      project.vagas_ocupadas += 1;
      await project.save();
    }
    res.json(app);
  } catch (e) { res.status(400).json({ error: 'Erro ao atualizar' }); }
});

// --- Inicialização ---
const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  console.log('Banco sincronizado!');
  app.listen(PORT, () => console.log(`Backend JS rodando na porta ${PORT}`));
});