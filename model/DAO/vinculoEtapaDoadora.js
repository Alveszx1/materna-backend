// ajuste o require do knex igual ao que você já usa nos outros DAOs


const knex = require("knex");

// Import do arquivo de configuração para acesso ao banco de dados
const knexDatabaseConfig = require("../database_config/knexConfig.js");

// Criar a conexão com o BD MySQL conforme o arquivo de configuração
const knexConection = knex(knexDatabaseConfig.development);

const insertVinculoEtapaDoadora = async function (vinculo) {
    try {
        return await knexConection.transaction(async trx => {
            await trx.raw("CALL procvincularetapadoadora(?, ?, @id)", [vinculo.id_doadora, vinculo.id_etapa])

            const [rows] = await trx.raw("SELECT @id AS id_jornada_doacao")

            return { id_jornada_doacao: rows[0].id_jornada_doacao }
        })

    } catch (error) {
        
        if (error.sqlState == "45000") {
            return { mensagem: error.sqlMessage }
        }
        console.log(error)
        return false
    }
}

module.exports = {
    insertVinculoEtapaDoadora
}