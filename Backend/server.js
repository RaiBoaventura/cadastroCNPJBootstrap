const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configuração do PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'CNPJ',
    password: 'admin',
    port: 5432,
});

// Testar a conexão com o banco de dados
pool.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao PostgreSQL:', err);
    } else {
        console.log('Conectado ao PostgreSQL com sucesso!');
    }
});
const path = require('path');

// Servir arquivos estáticos da pasta 'Frontend'
app.use(express.static(path.join(__dirname, 'Frontend')));

// Endpoint para buscar dados do CNPJ da ReceitaWS
app.get('/cnpj/:cnpj', async (req, res) => {
    const { cnpj } = req.params;

    try {
        console.log(`Buscando dados para o CNPJ: ${cnpj}`);
        const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`);
        if (!response.ok) throw new Error('Erro ao buscar dados na ReceitaWS');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar dados do CNPJ:', error);
        res.status(500).json({ message: 'Erro ao buscar dados do CNPJ.', error: error.message });
    }
});

// Endpoint genérico para salvar dados
app.post('/salvar', async (req, res) => {
    const { tabela, dados } = req.body;

    const tabelasPermitidas = ['empresa', 'socios', 'referenciasbancarias', 'referenciascomerciais'];
    if (!tabelasPermitidas.includes(tabela.toLowerCase())) {
        return res.status(400).send('Tabela inválida.');
    }

    const campos = Object.keys(dados).join(", ");
    const valores = Object.values(dados);
    const placeholders = valores.map((_, index) => `$${index + 1}`).join(", ");

    const query = `INSERT INTO ${tabela} (${campos}) VALUES (${placeholders})`;

    try {
        await pool.query(query, valores);
        res.send('Dados salvos com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        res.status(500).json({ message: 'Erro ao salvar dados.', error: error.message });
    }
});

// CRUD específico para empresas

// Listar todas as empresas
app.get('/empresa', async (req, res) => {
    try {
        const query = `SELECT * FROM empresa ORDER BY id ASC`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar empresas:', error);
        res.status(500).json({ message: 'Erro ao listar empresas.' });
    }
});
// Endpoint para listar dados da view 'vw_empresa_detalhada'
app.get('/vw_empresa_detalhada', async (req, res) => {
    try {
        const query = `SELECT * FROM vw_empresa_detalhada ORDER BY id_empresa ASC`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar dados da view:', error);
        res.status(500).json({ message: 'Erro ao listar dados da view.' });
    }
});

// Criar uma nova empresa
app.post('/empresa', async (req, res) => {
    const { cnpj, razao_social, telefone } = req.body;

    if (!cnpj || !razao_social) {
        return res.status(400).json({ message: 'CNPJ e Razão Social são obrigatórios.' });
    }

    try {
        // Verificar se o CNPJ já existe
        const checkQuery = `SELECT id FROM empresa WHERE cnpj = $1`;
        const existing = await pool.query(checkQuery, [cnpj]);

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Empresa com este CNPJ já cadastrada.' });
        }

        const query = `
            INSERT INTO empresa (cnpj, razao_social, telefone)
            VALUES ($1, $2, $3)
            RETURNING id;
        `;
        const values = [cnpj, razao_social, telefone];
        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Empresa criada com sucesso.', id: result.rows[0].id });
    } catch (error) {
        console.error('Erro ao criar empresa:', error);
        res.status(500).json({ message: 'Erro ao criar empresa.', error: error.message });
    }
});

// Atualizar uma empresa pelo ID
app.put('/empresa/:id', async (req, res) => {
    const { id } = req.params;
    const { cnpj, razao_social, telefone } = req.body;

    try {
        const query = `
            UPDATE empresa
            SET cnpj = $1, razao_social = $2, telefone = $3
            WHERE id = $4
        `;
        const values = [cnpj, razao_social, telefone, id];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Empresa não encontrada.' });
        }

        res.json({ message: 'Empresa atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar empresa:', error);
        res.status(500).json({ message: 'Erro ao atualizar empresa.', error: error.message });
    }
});

// Deletar uma empresa pelo ID
app.delete('/empresa/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `DELETE FROM empresa WHERE id = $1`;
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Empresa não encontrada.' });
        }

        res.json({ message: 'Empresa deletada com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar empresa:', error);
        res.status(500).json({ message: 'Erro ao deletar empresa.', error: error.message });
    }
});

// Salvar tudo (pessoa jurídica, sócios, referências)
app.post('/salvar-tudo', async (req, res) => {
    const { pessoaJuridica, socios, commercialRefs, bankRefs } = req.body;

    if (!pessoaJuridica || !pessoaJuridica.cnpj) {
        return res.status(400).json({ message: 'Dados da pessoa jurídica são obrigatórios.' });
    }

    const client = await pool.connect();

    try {
        // Inicia uma transação
        await client.query('BEGIN');

        // Verificar se a empresa já existe
        const checkQuery = `SELECT id FROM empresa WHERE cnpj = $1`;
        const existing = await client.query(checkQuery, [pessoaJuridica.cnpj]);

        let pessoaJuridicaId;
        if (existing.rows.length > 0) {
            pessoaJuridicaId = existing.rows[0].id; // Reutilizar ID se a empresa já existir
        } else {
            // Inserir nova empresa
            const pessoaJuridicaQuery = `
                INSERT INTO empresa (
                    cnpj, razao_social, nome_fantasia, inscricao_estadual, ramo_atividade,
                    data_fundacao, capital_social, telefones, conta_bancaria, email, site,
                    contador, telefone_contador, logradouro, numero_complemento, bairro, cidade, uf
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                RETURNING id;
            `;
            const pessoaJuridicaValues = [
                pessoaJuridica.cnpj, pessoaJuridica.razao_social, pessoaJuridica.nome_fantasia,
                pessoaJuridica.inscricao_estadual, pessoaJuridica.ramo_atividade, pessoaJuridica.data_fundacao,
                pessoaJuridica.capital_social, pessoaJuridica.telefones, pessoaJuridica.conta_bancaria,
                pessoaJuridica.email, pessoaJuridica.site, pessoaJuridica.contador,
                pessoaJuridica.telefone_contador, pessoaJuridica.logradouro, pessoaJuridica.numero_complemento,
                pessoaJuridica.bairro, pessoaJuridica.cidade, pessoaJuridica.uf
            ];
            const pessoaJuridicaResult = await client.query(pessoaJuridicaQuery, pessoaJuridicaValues);
            pessoaJuridicaId = pessoaJuridicaResult.rows[0].id;
        }

        // Inserir ou atualizar sócios
        for (const socio of socios) {
            const sociosQuery = `
                INSERT INTO socios (
                    ID_empresa, nome, cep, endereco, numero, bairro, cidade, uf, telefone, email
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (ID_empresa, nome) DO UPDATE SET
                    cep = EXCLUDED.cep,
                    endereco = EXCLUDED.endereco,
                    numero = EXCLUDED.numero,
                    bairro = EXCLUDED.bairro,
                    cidade = EXCLUDED.cidade,
                    uf = EXCLUDED.uf,
                    telefone = EXCLUDED.telefone,
                    email = EXCLUDED.email;
            `;
            const sociosValues = [
                pessoaJuridicaId, socio.nome, socio.cep, socio.endereco, socio.numero,
                socio.bairro, socio.cidade, socio.uf, socio.telefone, socio.email
            ];
            await client.query(sociosQuery, sociosValues);
        }
        

        // Inserir ou atualizar referências comerciais
        for (const ref of commercialRefs) {
            const commercialQuery = `
                INSERT INTO referenciascomerciais (
                    ID_empresa, fornecedor, telefone, ramo_atividade, contato
                ) VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (ID_empresa, fornecedor) DO UPDATE SET
                    telefone = EXCLUDED.telefone,
                    ramo_atividade = EXCLUDED.ramo_atividade,
                    contato = EXCLUDED.contato;
            `;
            const commercialValues = [
                pessoaJuridicaId, ref.fornecedor, ref.telefone, ref.ramo_atividade, ref.contato
            ];
            await client.query(commercialQuery, commercialValues);
        }

        // Inserir ou atualizar referências bancárias
        for (const bankRef of bankRefs) {
            const bankQuery = `
                INSERT INTO referenciasbancarias (
                    ID_empresa, banco, agencia, conta, data_abertura, telefone, gerente, observacoes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (ID_empresa, banco, agencia) DO UPDATE SET
                    conta = EXCLUDED.conta,
                    data_abertura = EXCLUDED.data_abertura,
                    telefone = EXCLUDED.telefone,
                    gerente = EXCLUDED.gerente,
                    observacoes = EXCLUDED.observacoes;
            `;
            const bankValues = [
                pessoaJuridicaId, bankRef.banco, bankRef.agencia, bankRef.conta, bankRef.data_abertura,
                bankRef.telefone, bankRef.gerente, bankRef.observacoes
            ];
            await client.query(bankQuery, bankValues);
        }

        // Confirma a transação
        await client.query('COMMIT');
        res.json({ message: 'Dados salvos com sucesso!' });
    } catch (error) {
        // Reverte a transação em caso de erro
        await client.query('ROLLBACK');
        console.error('Erro ao salvar os dados:', error);
        res.status(500).json({ message: 'Erro ao salvar os dados.', error: error.message });
    } finally {
        client.release();
    }
});

// Servidor rodando na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
