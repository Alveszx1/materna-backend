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

const selectJornadasAtivasPorDoadora = async function (idDoadora) {
    try {
        const sql = `
            SELECT
                doad.id AS id_doadora,
                doad.nome AS nome_doadora,
                COALESCE((
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', jornada.id,
                            'nome', jornada.nome,
                            'descricao', jornada.descricao,
                            'is_ativo', jornada.is_ativo,
                            'instituicao', JSON_OBJECT(
                                'id', instituicao.id,
                                'nome', instituicao.nome
                            ),
                            'etapas_iniciadas', (
                                SELECT COUNT(DISTINCT vinculo.id_etapa)
                                FROM tbl_jornada_doacao AS vinculo
                                WHERE vinculo.id_doadora = doad.id
                                  AND vinculo.id_jornada = jornada.id
                            ),
                            'total_etapas', (
                                SELECT COUNT(*)
                                FROM tbl_etapa AS total_etapa
                                WHERE total_etapa.id_jornada = jornada.id
                            ),
                            'etapas', COALESCE((
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'id', etapa.id,
                                        'titulo', etapa.titulo,
                                        'descricao', etapa.descricao,
                                        'ordem', etapa.ordem,
                                        'documento', etapa.documento,
                                        'is_repetivel', etapa.is_repetivel,
                                        'is_agendavel', etapa.is_agendavel,
                                        'is_obrigatorio', etapa.is_obrigatorio,
                                        'is_solicita_arquivo', etapa.is_solicita_arquivo,
                                        'is_precisa_aprovacao', etapa.is_precisa_aprovacao,
                                        'vinculos', COALESCE((
                                            SELECT JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                    'id', vinculo.id,
                                                    'ciclo', vinculo.ciclo,
                                                    'data_conclusao', vinculo.data_conclusao,
                                                    'encerrado', vinculo.encerrado,
                                                    'status', IF(vinculo.data_conclusao IS NULL, 'em_andamento', 'concluida')
                                                )
                                            )
                                            FROM tbl_jornada_doacao AS vinculo
                                            WHERE vinculo.id_doadora = doad.id
                                              AND vinculo.id_jornada = jornada.id
                                              AND vinculo.id_etapa = etapa.id
                                        ), JSON_ARRAY())
                                    )
                                )
                                FROM tbl_etapa AS etapa
                                WHERE etapa.id_jornada = jornada.id
                            ), JSON_ARRAY())
                        )
                    )
                    FROM tbl_jornada AS jornada
                    INNER JOIN tbl_instituicao AS instituicao
                        ON instituicao.id = jornada.id_instituicao
                    WHERE EXISTS (
                        SELECT 1
                        FROM tbl_jornada_doacao AS jornada_ativa
                        WHERE jornada_ativa.id_doadora = doad.id
                          AND jornada_ativa.id_jornada = jornada.id
                          AND jornada_ativa.encerrado = FALSE
                    )
                ), JSON_ARRAY()) AS jornadas
            FROM tbl_doadora AS doad
            WHERE doad.id = ?
        `

        const [rows] = await knexConection.raw(sql, [idDoadora])
        if (rows.length === 0) {
            return []
        }

        const result = {
            id_doadora: rows[0].id_doadora,
            nome_doadora: rows[0].nome_doadora,
            jornadas: rows[0].jornadas
        }

        if (typeof result.jornadas === "string") {
            result.jornadas = JSON.parse(result.jornadas)
        }

        return result
    } catch (error) {
        console.error("Erro ao buscar jornadas ativas da doadora:", error)
        return false
    }
}

module.exports = {
    insertVinculoEtapaDoadora,
    updateDataConclusaoJornadaDoacao,
    selectJornadasAtivasPorDoadora
}