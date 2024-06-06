// Importando dependencias 
const express = require('express');
const mysql = require('mysql2');
const cors = require ('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { response } = require('express');
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

app.post('/cadastro', async (req, res) => {
    const {nome, email, cpf, senha, celular, cep, logradouro, bairro, cidade, estado, imagem, Tipos_Usuarios_idTipos_Usuarios} = req.body;

    cep = cep.replace(/-/g,'')

    db.query(
        'SELECT cpf FROM usuarios WHERE cpf = ?,', [cpf], async(err, results) => {
            if(err){
                console.error('Erro ao consultar o CPF:', err);
                
                return res.status(500).json({message: 'Erro ao verificaro CPF'})
            }
        if(results.length > 0){
            return res.status(400).json({message: 'CPF já cadastrado'});
        }
        const senhacripto = await bcrypt.hash(senha, 5);
        // primeiro argumento é variavel a ser cripto
        // segundo argumento é o custo do hash

        db.query ('INSERT INTO usuarios (nome, email, cpf, senha, celular, cep, logradouro, bairro, cidade, estado, imagem, Tipos_Usuarios_idTipos_Usuarios) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
            [nome, email, cpf, senhacripto, celular, cep, logradouro, bairro, cidade, estado, Tipos_Usuarios_idTipos_Usuarios, imagem], (err, results) =>{
                if (err){
                console.error('Erro ao inserir usúario', err);
                return response.status(500).json({mensage: 'Erro ao cadastrar usúario'})
            }
            console.log("Novo usuário inserido com sucesso", result.idUsuarios)
            }
        }
    )
})

app.use(express.static('/src'))
app.use(express.static(__dirname + "/src/"))

// http://localhost:3000/login

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/src/login.html')
})

app.get('/aluno', (req, res) => {
    res.sendFile(__dirname + '/src/aluno.html')
})

app.get('/cadastroTurmas', (req, res) => {
    res.sendFile(__dirname + '/src/cadastroTurmas.html')
})

app.get('/cadastroUsuarios', (req, res) => {
    res.sendFile(__dirname + '/src/cadastroUsuarios.html')
})

app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/src/home.html')
})

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/src/index.html')
})

app.get('/indexPage', (req, res) => {
    res.sendFile(__dirname + '/src/indexPage.html')
})

app.get('/turma', (req, res) => {
    res.sendFile(__dirname + '/src/turma.html')
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta${PORT} (só abrimos o console qnd da erro, ent fds)`));
