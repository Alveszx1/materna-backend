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

const selectAllInstituicoes = async function () {
    try {
        let sql = `
            select inst.*, tipo.tipo as tipo_coleta, tel.numero as telefone,
                   endereco.logradouro, endereco.cep, endereco.bairro,
                   endereco.numero, endereco.complemento,
                   endereco.latitude, endereco.longitude,
                   cidade.nome as cidade, estado.sigla as sigla_estado
            from tbl_instituicao as inst
            inner join tbl_tipo_coleta as tipo on inst.id_coleta = tipo.id
            inner join tbl_endereco as endereco on inst.id_endereco = endereco.id
            inner join tbl_cidade as cidade on endereco.id_cidade = cidade.id
            inner join tbl_estado as estado on cidade.id_estado = estado.id
            inner join tbl_telefone_instituicao as relacao on inst.id = relacao.id_instituicao
            inner join tbl_telefone as tel on relacao.id_telefone = tel.id
            order by inst.id desc
        `

        let result = await knexConection.raw(sql)

        if (Array.isArray(result)) {
            return result[0]
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

const selectByIdInstituicao = async function (id) {
    try {
        let sql = `
            select inst.*, tipo.tipo as tipo_coleta, tel.numero as telefone,
                   endereco.logradouro, endereco.cep, endereco.bairro,
                   endereco.numero, endereco.complemento,
                   endereco.latitude, endereco.longitude,
                   cidade.nome as cidade, estado.sigla as sigla_estado
            from tbl_instituicao as inst
            inner join tbl_tipo_coleta as tipo on inst.id_coleta = tipo.id
            inner join tbl_endereco as endereco on inst.id_endereco = endereco.id
            inner join tbl_cidade as cidade on endereco.id_cidade = cidade.id
            inner join tbl_estado as estado on cidade.id_estado = estado.id
            inner join tbl_telefone_instituicao as relacao on inst.id = relacao.id_instituicao
            inner join tbl_telefone as tel on relacao.id_telefone = tel.id
            where inst.id = ${id}
        `

        let result = await knexConection.raw(sql)

        if (Array.isArray(result)) {
            return result[0]
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

module.exports = {
    insertInstituicao,
    selectAllInstituicoes,
    selectByIdInstituicao
}