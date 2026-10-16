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

// Função para inserir uma nova instituição no banco de dados
const insertInstituicao = async function (instituicao) {

    try {

        const sql = `
            CALL proccadastrarinstituicao(
                ?, ?, ?, ?, ?,
                ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?
            )
        `

        const valores = [
            instituicao.nome,
            instituicao.cnpj,
            instituicao.email,
            instituicao.foto ?? null,
            instituicao.id_coleta,
            instituicao.telefone,
            instituicao.logradouro,
            instituicao.cep,
            instituicao.bairro,
            instituicao.numero,
            instituicao.complemento,
            instituicao.latitude,
            instituicao.longitude,
            instituicao.cidade,
            instituicao.sigla_estado,
            ...instituicao.horarios.flatMap(h => [h.dia, h.abre, h.fecha]),
            instituicao.funcionario.nome,
            instituicao.funcionario.cpf,
            instituicao.funcionario.data_nascimento,
            instituicao.funcionario.email,
            instituicao.funcionario.senha,
            instituicao.funcionario.sal,
            instituicao.funcionario.telefone
        ]

        const [resultado] = await knexConection.raw(sql, valores)
        return resultado[0][0]

    } catch (error) {
        console.error('Erro ao inserir instituição:', error)
        return false
    }
}

module.exports = {
    insertInstituicao
}