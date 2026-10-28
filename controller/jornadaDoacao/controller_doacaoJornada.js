const configMessages = require("../module/configMessage.js")
const EtapaDoadoraDAO = require("../../model/DAO/vinculoEtapaDoadora.js")


const validarDados = async function (vinculo) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    if (vinculo == undefined || vinculo == null) {
        customMessage.ERROR_BAD_REQUEST.field = "[VINCULO] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (vinculo.id_doadora == undefined || vinculo.id_doadora == "" || vinculo.id_doadora == null || isNaN(vinculo.id_doadora) || vinculo.id_doadora < 1) {
        customMessage.ERROR_BAD_REQUEST.field = "[ID_DOADORA] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (vinculo.id_etapa == undefined || vinculo.id_etapa == "" || vinculo.id_etapa == null || isNaN(vinculo.id_etapa) || vinculo.id_etapa < 1) {
        customMessage.ERROR_BAD_REQUEST.field = "[ID_ETAPA] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else {
        return false
    }
}


const tratarDados = async function (vinculo) {

    vinculo.id_doadora = Number(vinculo.id_doadora)
    vinculo.id_etapa = Number(vinculo.id_etapa)

    return vinculo
}


const vincularEtapaDoadora = async function (vinculo, contentType) {

    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {

        if (String(contentType).toUpperCase() == "APPLICATION/JSON") {

            let validar = await validarDados(vinculo)

            if (validar) {
                return validar
            } else {

                let result = await EtapaDoadoraDAO.insertVinculoEtapaDoadora(await tratarDados(vinculo))

                if (result) {

                    if (result.id_jornada_doacao) {

                        vinculo.id = result.id_jornada_doacao

                        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_CREATED_ITEM.status
                        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_CREATED_ITEM.status_code
                        customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_CREATED_ITEM.message
                        customMessage.DEFAULT_MESSAGE.response = vinculo

                        return customMessage.DEFAULT_MESSAGE

                    } else if (result.mensagem) {

                        let mensagem = String(result.mensagem).toLowerCase()

                        if (mensagem.includes("doadora nao encontrada")) {
                            customMessage.ERROR_NOT_FOUND.field = "[ID_DOADORA] DOADORA NÃO ENCONTRADA"
                            return customMessage.ERROR_NOT_FOUND

                        } else if (mensagem.includes("etapa nao encontrada")) {
                            customMessage.ERROR_NOT_FOUND.field = "[ID_ETAPA] ETAPA NÃO ENCONTRADA"
                            return customMessage.ERROR_NOT_FOUND

                        } else {
                            customMessage.ERROR_BAD_REQUEST.field = `[VINCULO] ${result.mensagem}`
                            return customMessage.ERROR_BAD_REQUEST
                        }

                    } else {
                        return customMessage.ERROR_INTERNAL_SERVER_MODEL
                    }

                } else {
                    return customMessage.ERROR_INTERNAL_SERVER_MODEL
                }
            }
        } else {
            return customMessage.ERROR_CONTENT_TYPE
        }
    } catch (error) {
        console.log(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    vincularEtapaDoadora
}