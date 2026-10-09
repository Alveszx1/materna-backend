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



const insertFuncionario = async function (funcionario) {
    try {
        const sql = `
            CALL proccadastrarfuncionario(
                ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        const valores = [
            funcionario.nome,
            funcionario.cpf,
            funcionario.data_nascimento,
            funcionario.email,
            funcionario.adm,
            funcionario.senha,
            funcionario.sal,
            funcionario.telefone,
            funcionario.id_instituicao
        ];

        const [resultado] = await knexConection.raw(sql, valores);

        return resultado[0][0].id_funcionario;

    } catch (error) {
        console.error('Erro ao inserir funcionário:', error);
        return false;
    }
};







module.exports = {
    insertFuncionario
}