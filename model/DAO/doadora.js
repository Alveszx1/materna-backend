/**
 * Objetivo: Arquivo responsável pelo CRUD de doadora do Materna
 * MYSQL
 * Data: 15/04/2026
 * Autor: Bruno Haddad Alves
 * Versão: 1.0
 */

// Faz o import da biblioteca para manipular dados no banco de dados MySQL
const knex = require("knex");

// Import do arquivo de configuração para acesso ao banco de dados
const knexDatabaseConfig = require("../database_config/knexConfig.js");

// Criar a conexão com o BD MySQL conforme o arquivo de configuração
const knexConection = knex(knexDatabaseConfig.development);




// Função para inserir uma nova doadora no banco de dados
    const insertDoadora = async function (doadora) {

        try {

            const sql = `
            CALL proccadastrardoadora(
                ?, ?, ?, ?, ?, ?, ?,
                ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?
            )
        `;

        const valores = [
            doadora.nome,
            doadora.cpf,
            doadora.foto ?? null,
            doadora.data_nascimento,
            doadora.email,
            doadora.senha,
            doadora.sal,

            doadora.telefone,

            doadora.logradouro,
            doadora.cep,
            doadora.bairro,
            doadora.numero,
            doadora.complemento,
            doadora.latitude,
            doadora.longitude,

            doadora.cidade,
            doadora.sigla_estado
        ];

        const [resultado] = await knexConection.raw(sql, valores);

        return resultado[0][0].id_doadora;
            
        } catch (error) {
            console.error('Erro ao inserir doadora:', error)
            return false
        }
        
    };

module.exports = {
    insertDoadora
};