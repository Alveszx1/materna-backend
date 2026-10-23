/**
 * Objetivo: Arquivo responsável pelo CRUD de cadastro de horário do Materna
 * MYSQL
 * Data: 23/10/2026
 * Autor: Bruno Haddad Alves
 * Versão: 1.0
 */

// Faz o import da biblioteca para manipular dados no banco de dados MySQL
const knex = require("knex");

// Import do arquivo de configuração para acesso ao banco de dados
const knexDatabaseConfig = require("../database_config/knexConfig.js");

// Criar a conexão com o BD MySQL conforme o arquivo de configuração
const knexConection = knex(knexDatabaseConfig.development);

// Função para inserir um novo horário no banco de dados

const insertHorario = async function (cadastroHorario) {
    try {
        const sql = `
            CALL proccadastrarhorario(?, ?, ?)
        `

        const valores = [
            cadastroHorario.dia,
            cadastroHorario.horario,
            cadastroHorario.id_etapa
        ]

        const [resultado] = await knexConection.raw(sql, valores)

        return resultado[0][0].id_cadastro_horario

    } catch (error) {
        console.error('Erro ao inserir horário:', error)

        return {
            erro: true,
            mensagem: error.sqlMessage || error.message
        }
    }
}


const selectAllHorarios = async function () {
    try {
        // Script SQL para listar todos os horários cadastrados
        let sql = "select * from tbl_cadastro_horario order by id desc"

        // Executa no banco de dados o script e guarda o retorno do banco

        // Pode ser um erro (false) ou um array com os dados
        let result = await knexConection.raw(sql)

        // Validação para verificar se o retorno do BD é um Array ou boolean (false)
        if(Array.isArray(result)){
            return result[0] // retorna somente o indice com a lista de horários
        } else{
            // Return false do banco de dados
            return false
        }
    } catch (error) {
        // return false do JavaScript
        return false
    }
}

const selectByIdHorario = async function (id) {
    try {

        let sql = `SELECT * FROM tbl_cadastro_horario
        WHERE id = ${id};`

        let result = await knexConection.raw(sql)

        if(Array.isArray(result))
            return result[0]
        else
            return false

    } catch (error) {

        return false

    }
}

const updateHorario = async function (cadastroHorario) {
    try {
        let sql = `update tbl_cadastro_horario set
    dia = '${cadastroHorario.dia}',
    horario = '${cadastroHorario.horario}',
    id_etapa = ${cadastroHorario.id_etapa}
    where id = ${cadastroHorario.id};`

        let result = await knexConection.raw(sql)

        if(result)
            return true
        else
            return false

    } catch (error) {

        return false
    }

}

const selectHorariosByInstituicao = async function (idInstituicao) {
    try {
        let sql = `SELECT h.*
        FROM tbl_cadastro_horario h
        INNER JOIN tbl_etapa e ON e.id = h.id_etapa
        INNER JOIN tbl_jornada j ON j.id = e.id_jornada
        WHERE j.id_instituicao = ${idInstituicao}
        ORDER BY h.dia, h.horario;`

        let result = await knexConection.raw(sql)

        if(Array.isArray(result))
            return result[0]
        else
            return false

    } catch (error) {

        return false

    }
}


const selectHorariosByEtapa = async function (idEtapa) {
    try {
        let sql = `
            SELECT *
            FROM tbl_cadastro_horario
            WHERE id_etapa = ${idEtapa}
            ORDER BY dia, horario;
        `

        let result = await knexConection.raw(sql)

        if (Array.isArray(result))
            return result[0]
        else
            return false

    } catch (error) {
        console.error('Erro ao buscar horários por etapa:', error)
        return false
    }
}


const deleteHorario = async function(id){
    try {
        let sql = `DELETE FROM tbl_cadastro_horario WHERE id=${id};`

        let result = await knexConection.raw(sql)
        if(result)
            return true
        else
            return false
    } catch (error) {
        return false
    }
}

module.exports = {
    insertHorario,
    selectAllHorarios,
    selectByIdHorario,
    selectHorariosByEtapa,
    updateHorario,
    selectHorariosByInstituicao,
    deleteHorario
}