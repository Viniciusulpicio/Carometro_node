// Importando dependencias 
const express = require('express');
const mysql = require('mysql2');
const cors = require ('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
require ('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
if(err){
    console.error(
        "Erro ao conectar com banco de dados (gui devito mandou escrever essas coisas estranhas aqui na linha 25 do server.js)",err)
    return;
}
console.log('Conectado com banco de dados (não vou ler isso pq se conectou vou ignorar o console)');
});

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

const authenticationSession=(req, res, next) => {
    if(!req.session.userID) {
        return res.status(401).send('Acesso negado, faça login para continuar.');
    }
    next();    
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta${PORT} (só abrimos o console qnd da erro, ent fds)`));

app.post('/login', (req, res) => {
    const{cpf, senha} = req.body;

    db.query('SELECT * FROM usuarios WHERE cpf = ?', [cpf], async (err, results) => {
        if(err) return res.status(500). send('Server com erro');
        if(results.length === 0) return res.status(500).send('Cpf ou senha incorretos')

            const usuario = results[0];
            const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
            if(!senhaCorreta) return res.status(500).send('Cpf ou senha incorretos');

                req.session.userID = usuario.idUsuarios;
                console.log('idUsuario')
                res.json({message: 'Login bem-sucedido'});
    });
})