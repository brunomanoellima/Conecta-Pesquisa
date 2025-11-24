import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sequelize } from './database.js';
import { User, Project, Application } from './models.js';

const app = express();
app.use(cors());
app.use(express.json());

// Middleware Auth (Sem tipagem TS)
const auth = (roles = []) => (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, dec) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    if (roles.length && !roles.includes(dec.role)) return res.status(403).json({ error: 'Forbidden' });
    req.userId = dec.id; 
    req.userRole = dec.role; 
    next();
  });
};

// Rotas Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ ...req.body, password_hash: hash });
    res.json(user);
  } catch (e) { res.status(400).json({ error: 'Erro registro' }); }
});

app.post('/api/auth/login', async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user || !bcrypt.compareSync(req.body.password, user.password_hash)) 
    return res.status(401).json({ error: 'Login falhou' });
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, user: { nome: user.nome, role: user.role } });
});

// Rotas Projetos
app.get('/api/projects', auth(), async (req, res) => {
  const where = req.userRole === 'docente' ? { docente_id: req.userId } : { status: 'ABERTO' };
  res.json(await Project.findAll({ where, include: ['docente'] }));
});

app.post('/api/projects', auth(['docente']), async (req, res) => {
  res.json(await Project.create({ ...req.body, docente_id: req.userId }));
});

app.post('/api/projects/:id/apply', auth(['discente']), async (req, res) => {
  try {
    res.json(await Application.create({ project_id: req.params.id, discente_id: req.userId, mensagem: req.body.mensagem }));
  } catch(e) { res.status(400).json({error: 'Erro candidatura'}); }
});

// Inicialização
sequelize.sync().then(() => app.listen(3000, () => console.log('Backend JS rodando na porta 3000')));