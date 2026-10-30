/**
 * Objetivo: Arquivo responsável pelo CRUD de agendamento do Materna
 * MYSQL
 * Data: 30/10/2026
 * Autor: Bruno Haddad Alves
 * Versão: 1.0
 */

const knex = require("knex");
const knexDatabaseConfig = require("../database_config/knexConfig.js");
const knexConection = knex(knexDatabaseConfig.development);

const insertAgendamento = async function (agendamento) {
    try {

        const idAgendamento = await knexConection.transaction(async trx => {

            await trx.raw("CALL procagendar(?, ?, ?, @id)", [
                agendamento.id_cadastro_horario,
                agendamento.id_jornada_doacao,
                agendamento.id_status_agendamento
            ])

            const [rows] = await trx.raw("SELECT @id AS id_agendamento")

            return rows[0].id_agendamento
        })

        return idAgendamento

    } catch (error) {
        console.error('Erro ao inserir agendamento:', error)

        return {
            erro: true,
            sqlState: error.sqlState,
            mensagem: error.sqlMessage || error.message
        }
    }
}

const updateAgendamento = async function (idAgendamento, idStatus) {
    try {
        await knexConection.raw("CALL procatualizaragendamento(?, ?)", [idAgendamento, idStatus])

        return true

    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error)

        return {
            erro: true,
            sqlState: error.sqlState,
            mensagem: error.sqlMessage || error.message
        }
    }
}

module.exports = {
    insertAgendamento,
    updateAgendamento
}

module.exports = {
    insertAgendamento,
    updateAgendamento
}