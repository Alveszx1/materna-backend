/**
 * Objetivo: Arquivo responsável pelo CRUD de campanha do Materna
 * MYSQL
 * Data: 09/10/2026
 * Autor: Bruno Haddad Alves
 * Versão: 1.0
 */

// Faz o import da biblioteca para manipular dados no banco de dados MySQL
const knex = require("knex");

// Import do arquivo de configuração para acesso ao banco de dados
const knexDatabaseConfig = require("../database_config/knexConfig.js");

// Criar a conexão com o BD MySQL conforme o arquivo de configuração
const knexConection = knex(knexDatabaseConfig.development);




// Função para inserir uma nova campanha no banco de dados
 

const insertCampanha = async function (campanha) {

    try {

        const sql = `
            CALL proccadastrarcampanha(
                ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        const valores = [
            campanha.titulo,
            campanha.descricao,
            campanha.foto ?? null,
            campanha.data_inicio,
            campanha.data_fim,
            campanha.is_ativo,
            campanha.id_instituicao,
            campanha.id_funcionario
        ];

        const [resultado] = await knexConection.raw(sql, valores);

        return resultado[0][0].id_campanha;

    } catch (error) {

        console.error('Erro ao inserir campanha:', error);

        return false;

    }
};

module.exports = {
    insertCampanha
}