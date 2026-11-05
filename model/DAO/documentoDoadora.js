const knex = require("knex")
const knexDatabaseConfig = require("../database_config/knexConfig.js")

const knexConection = knex(knexDatabaseConfig.development)

const insertDocumentoDoadora = async function (documentoDoadora) {
    try {
        return await knexConection.transaction(async trx => {
            const [jornadas] = await trx.raw(`
                SELECT etapa.is_solicita_arquivo, etapa.is_precisa_aprovacao
                FROM tbl_jornada_doacao AS jornada_doacao
                INNER JOIN tbl_etapa AS etapa
                    ON etapa.id = jornada_doacao.id_etapa
                WHERE jornada_doacao.id = ?
                  AND jornada_doacao.id_doadora = ?
                FOR UPDATE
            `, [documentoDoadora.id_jornada_doacao, documentoDoadora.id_doadora])

            if (jornadas.length == 0) {
                return {
                    erro: true,
                    sqlState: "45000",
                    mensagem: "Vinculo nao encontrado."
                }
            }

            if (!jornadas[0].is_solicita_arquivo) {
                return {
                    erro: true,
                    sqlState: "45000",
                    mensagem: "Esta etapa nao solicita arquivo."
                }
            }

            const idStatus = jornadas[0].is_precisa_aprovacao ? 1 : 2
            const [documentos] = await trx.raw(`
                SELECT id
                FROM tbl_documento_doadora
                WHERE id_jornada_doacao = ?
                FOR UPDATE
            `, [documentoDoadora.id_jornada_doacao])

            if (documentos.length > 0) {
                await trx.raw(`
                    UPDATE tbl_documento_doadora
                    SET documento = ?, motivo_recusa = '', id_status_documento = ?
                    WHERE id = ?
                `, [documentoDoadora.documento, idStatus, documentos[0].id])

                return {
                    id_documento: documentos[0].id,
                    id_status_documento: idStatus,
                    substituido: true
                }
            }

            const [result] = await trx.raw(`
                INSERT INTO tbl_documento_doadora
                    (documento, motivo_recusa, id_status_documento, id_jornada_doacao, id_doadora)
                VALUES (?, '', ?, ?, ?)
            `, [
                documentoDoadora.documento,
                idStatus,
                documentoDoadora.id_jornada_doacao,
                documentoDoadora.id_doadora
            ])

            return {
                id_documento: result.insertId,
                id_status_documento: idStatus,
                substituido: false
            }
        })
    } catch (error) {
        console.error("Erro ao inserir documento da doadora:", error)
        return {
            erro: true,
            sqlState: error.sqlState,
            mensagem: error.sqlMessage || error.message
        }
    }
}

const selectDocumentosPorJornadaDoacao = async function (idJornadaDoacao) {
    try {
        const [documentos] = await knexConection.raw(`
            SELECT
                documento.id AS id_documento,
                documento.documento,
                documento.motivo_recusa,
                documento.id_status_documento,
                status_documento.status,
                jornada_doacao.id AS id_jornada_doacao,
                jornada_doacao.id_doadora,
                doadora.nome AS nome_doadora,
                etapa.id AS id_etapa,
                etapa.titulo AS etapa,
                etapa.documento AS documento_solicitado,
                etapa.is_obrigatorio,
                etapa.is_solicita_arquivo,
                etapa.is_precisa_aprovacao
            FROM tbl_documento_doadora AS documento
            INNER JOIN tbl_status_documento_doadora AS status_documento
                ON status_documento.id = documento.id_status_documento
            INNER JOIN tbl_jornada_doacao AS jornada_doacao
                ON jornada_doacao.id = documento.id_jornada_doacao
            INNER JOIN tbl_etapa AS etapa
                ON etapa.id = jornada_doacao.id_etapa
            INNER JOIN tbl_doadora AS doadora
                ON doadora.id = jornada_doacao.id_doadora
            WHERE documento.id_jornada_doacao = ?
        `, [idJornadaDoacao])

        return documentos
    } catch (error) {
        console.error("Erro ao buscar documentos da jornada de doação:", error)
        return false
    }
}

const selectDocumentosPorInstituicao = async function (idInstituicao) {
    try {
        const [documentos] = await knexConection.raw(`
            SELECT
                documento.id AS id_documento,
                documento.documento,
                documento.motivo_recusa,
                documento.id_status_documento,
                status_documento.status,
                jornada_doacao.id AS id_jornada_doacao,
                jornada_doacao.id_doadora,
                doadora.nome AS nome_doadora,
                jornada.id_instituicao,
                etapa.id AS id_etapa,
                etapa.titulo AS etapa,
                etapa.documento AS documento_solicitado,
                etapa.is_obrigatorio,
                etapa.is_solicita_arquivo,
                etapa.is_precisa_aprovacao
            FROM tbl_documento_doadora AS documento
            INNER JOIN tbl_status_documento_doadora AS status_documento
                ON status_documento.id = documento.id_status_documento
            INNER JOIN tbl_jornada_doacao AS jornada_doacao
                ON jornada_doacao.id = documento.id_jornada_doacao
            INNER JOIN tbl_etapa AS etapa
                ON etapa.id = jornada_doacao.id_etapa
            INNER JOIN tbl_doadora AS doadora
                ON doadora.id = jornada_doacao.id_doadora
            INNER JOIN tbl_jornada AS jornada
                ON jornada.id = etapa.id_jornada
            WHERE jornada.id_instituicao = ?
            ORDER BY documento.id_status_documento, documento.id DESC
        `, [idInstituicao])

        return documentos
    } catch (error) {
        console.error("Erro ao buscar documentos da instituição:", error)
        return false
    }
}

const updateStatusDocumento = async function (idDocumento, idStatus, motivoRecusa) {
    try {
        await knexConection.raw(
            "CALL procatualizardocumentodoadora(?, ?, ?)",
            [idDocumento, idStatus, motivoRecusa || ""]
        )

        return true
    } catch (error) {
        console.error("Erro ao atualizar status do documento:", error)
        return {
            erro: true,
            sqlState: error.sqlState,
            mensagem: error.sqlMessage || error.message
        }
    }
}

module.exports = {
    insertDocumentoDoadora,
    selectDocumentosPorJornadaDoacao,
    selectDocumentosPorInstituicao,
    updateStatusDocumento
}
