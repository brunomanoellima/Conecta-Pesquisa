import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { sequelize } from './database.js';
import { User, Project, Application, Profile, AuditLog, MuralPost } from './models.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- LOGS ---
const logAction = async (userId, action, details) => {
  try { await AuditLog.create({ user_id: userId, action, details: JSON.stringify(details) }); } 
  catch (e) { console.error("Erro auditoria:", e); }
};

// --- AUTH ---
const auth = (roles = []) => (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token necessário' });
  jwt.verify(token, process.env.JWT_SECRET, (err, dec) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    if (roles.length && !roles.includes(dec.role)) return res.status(403).json({ error: 'Proibido' });
    req.userId = dec.id; req.userRole = dec.role; next();
  });
};

// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Erro login' });
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  await logAction(user.id, 'LOGIN', { ip: req.ip });
  res.json({ token, user: { id: user.id, nome: user.nome, role: user.role } });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const userExists = await User.findOne({ where: { email: req.body.email } });
    if(userExists) return res.status(400).json({error: 'Email já existe'});
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ ...req.body, password_hash: hash });
    if (req.body.role === 'discente') await Profile.create({ user_id: user.id });
    await logAction(user.id, 'REGISTER', { email: user.email });
    res.json(user);
  } catch (e) { res.status(400).json({ error: 'Erro registro' }); }
});

// --- PERFIL ---
app.get('/api/profile', auth(), async (req, res) => {
  const p = await Profile.findOne({ where: { user_id: req.userId } });
  res.json(p || {});
});
app.put('/api/profile', auth(['discente']), async (req, res) => {
  let p = await Profile.findOne({ where: { user_id: req.userId } });
  if (!p) p = await Profile.create({ user_id: req.userId });
  await p.update(req.body);
  await logAction(req.userId, 'UPDATE_PROFILE', {});
  res.json(p);
});

// --- PROJETOS ---
app.get('/api/projects', auth(), async (req, res) => {
  const where = req.userRole === 'docente' ? { docente_id: req.userId } : { status: 'ABERTO' };
  const projects = await Project.findAll({ 
    where, 
    include: [
      { model: User, as: 'docente', attributes: ['nome'] },
      { 
        model: Application, 
        where: { status: 'ACEITA' }, 
        required: false, 
        include: [{ model: User, as: 'discente', attributes: ['id', 'nome', 'email'], include: [Profile] }] 
      },
      { model: MuralPost, separate: true, order: [['created_at', 'DESC']] }
    ] 
  });
  res.json(projects);
});

app.post('/api/projects', auth(['docente']), async (req, res) => {
  const { titulo, tipo, prazo_inscricao } = req.body;
  if (!titulo || !tipo || !prazo_inscricao) return res.status(400).json({ error: 'Campos obrigatórios' });
  try {
    const p = await Project.create({ ...req.body, docente_id: req.userId, status: 'ABERTO' });
    await logAction(req.userId, 'CREATE_PROJECT', { projectId: p.id });
    res.json(p);
  } catch (e) { res.status(400).json({ error: 'Erro criar' }); }
});

// --- ROTA DE EDIÇÃO (PUT) - AQUI ESTAVA O ERRO ---
app.put('/api/projects/:id', auth(['docente']), async (req, res) => {
    try {
      const p = await Project.findByPk(req.params.id);
      if (!p) return res.status(404).json({error: 'Projeto não encontrado'});
      
      // Verifica se o projeto pertence ao professor logado
      if (p.docente_id !== req.userId) return res.status(403).json({error: 'Sem permissão'});

      await p.update(req.body);
      await logAction(req.userId, 'EDIT_PROJECT', { projectId: p.id });
      res.json(p);
    } catch(e) {
      console.error(e);
      res.status(500).json({error: 'Erro ao editar'});
    }
});

// --- ROTA DE EXCLUSÃO (DELETE) ---
app.delete('/api/projects/:id', auth(['docente']), async (req, res) => {
    try {
      const p = await Project.findByPk(req.params.id);
      if (!p) return res.status(404).json({error: 'Projeto não encontrado'});
      
      if (p.docente_id !== req.userId) return res.status(403).json({error: 'Sem permissão'});

      await p.destroy(); // Soft delete
      await logAction(req.userId, 'DELETE_PROJECT', { projectId: p.id });
      res.json({ message: 'Projeto excluído' });
    } catch(e) {
      res.status(500).json({error: 'Erro ao excluir'});
    }
});

app.post('/api/projects/:id/close', auth(['docente']), async (req, res) => {
    const p = await Project.findByPk(req.params.id);
    if (!p) return res.status(404).json({error: 'Não encontrado'});
    await p.update({ status: 'CONCLUIDO' });
    await Application.update({ status: 'NAO_AVALIADA_ENCERRADA' }, { where: { project_id: p.id, status: 'PENDENTE' } });
    res.json({ msg: 'Fechado' });
});

// --- MURAL ---
app.post('/api/projects/:id/mural', auth(['docente']), async (req, res) => {
  try {
    const { content } = req.body;
    if(!content) return res.status(400).json({error: "Vazio"});
    const post = await MuralPost.create({ project_id: req.params.id, user_id: req.userId, content });
    res.json(post);
  } catch (e) { res.status(500).json({ error: "Erro" }); }
});

// --- CANDIDATURAS ---
app.post('/api/projects/:id/apply', auth(['discente']), async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (project.status !== 'ABERTO') return res.status(400).json({ error: 'Fechado' });
  const exists = await Application.findOne({ where: { project_id: req.params.id, discente_id: req.userId }});
  if(exists) return res.status(400).json({ error: 'Já candidatou' });
  const app = await Application.create({ project_id: req.params.id, discente_id: req.userId, mensagem: req.body.mensagem });
  res.json(app);
});

app.get('/api/applications', auth(), async (req, res) => {
  if (req.userRole === 'discente') {
    const apps = await Application.findAll({ 
      where: { discente_id: req.userId }, 
      include: [{ 
        model: Project, 
        include: [{ model: User, as: 'docente' }, { model: MuralPost, separate: true, order: [['created_at', 'DESC']] }] 
      }] 
    });
    res.json(apps);
  } else {
    const projects = await Project.findAll({ where: { docente_id: req.userId }, attributes: ['id'] });
    const apps = await Application.findAll({
      where: { project_id: projects.map(p=>p.id) },
      include: [{ model: User, as: 'discente', include: [Profile] }, { model: Project }]
    });
    res.json(apps);
  }
});

app.put('/api/applications/:id', auth(['docente']), async (req, res) => {
  const { status, reason } = req.body; 
  const app = await Application.findByPk(req.params.id);
  const project = await Project.findByPk(app.project_id);
  if (status === 'ACEITA') {
    if (project.vagas_ocupadas >= project.vagas_totais) return res.status(400).json({ error: 'Lotado' });
    project.vagas_ocupadas++;
    await project.save();
  }
  if ((status === 'RECUSADA' || status === 'REMOVIDO') && app.status === 'ACEITA') {
    project.vagas_ocupadas--;
    await project.save();
  }
  if(reason) app.removal_reason = reason;
  app.status = status;
  await app.save();
  res.json(app);
});

app.get('/api/users/search', auth(['docente']), async (req, res) => {
  const { nome } = req.query;
  if (!nome) return res.json([]);
  const users = await User.findAll({ where: { role: 'discente', nome: { [Op.like]: `%${nome}%` } }, include: [{ model: Profile }] });
  res.json(users);
});

const PORT = 3000;
sequelize.sync().then(() => app.listen(PORT, () => console.log('Backend running on 3000')));