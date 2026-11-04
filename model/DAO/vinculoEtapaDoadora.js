// ajuste o require do knex igual ao que você já usa nos outros DAOs


const knex = require("knex");

// Import do arquivo de configuração para acesso ao banco de dados
const knexDatabaseConfig = require("../database_config/knexConfig.js");

// Criar a conexão com o BD MySQL conforme o arquivo de configuração
const knexConection = knex(knexDatabaseConfig.development);

const insertVinculoEtapaDoadora = async function (vinculo) {
    try {
        return await knexConection.transaction(async trx => {

            await trx.raw(
                "CALL procvincularetapadoadora(?, ?, ?, ?, @id)",
                [
                    vinculo.id_doadora,
                    vinculo.id_etapa,
                    vinculo.id_instituicao,
                    vinculo.id_jornada
                ]
            )

            const [rows] = await trx.raw(
                "SELECT @id AS id_jornada_doacao"
            )

            return {
                id_jornada_doacao: rows[0].id_jornada_doacao
            }
        })

    } catch (error) {

        if (error.sqlState == "45000") {
            return { mensagem: error.sqlMessage }
        }

        console.log(error)
        return false
    }
}

const updateDataConclusaoJornadaDoacao = async function (id, dataConclusao) {
    try {
        let sql = `
            UPDATE tbl_jornada_doacao
            SET data_conclusao = ?
            WHERE id = ?
        `

        await knexConection.raw(sql, [dataConclusao, id])
        return true
    } catch (error) {
        console.error('Erro ao atualizar data de conclusão da jornada de doação:', error)
        return false
    }
}

const insertDocumentoDoadora = async function (idJornadaDoacao, idDoadora, documento) {
    try {
        let sql = `
            INSERT INTO tbl_documento_doadora
                (documento, motivo_recusa, id_jornada_doacao, id_doadora)
            SELECT ?, '', jd.id, jd.id_doadora
            FROM tbl_jornada_doacao AS jd
            WHERE jd.id = ? AND jd.id_doadora = ?
        `

        let result = await knexConection.raw(sql, [documento, idJornadaDoacao, idDoadora])

        if (result[0].affectedRows > 0) {
            return result[0].insertId
        } else {
            return null
        }
    } catch (error) {
        console.error('Erro ao salvar documento da doadora:', error)
        return false
    }
}

module.exports = {
    insertVinculoEtapaDoadora,
    updateDataConclusaoJornadaDoacao,
    insertDocumentoDoadora
}