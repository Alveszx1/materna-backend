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

const validarDocumento = function (documento) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    if (typeof documento != "string" || documento == "" || documento.length > 255) {
        customMessage.ERROR_BAD_REQUEST.field = "[DOCUMENTO] INVÁLIDO (envie um link de até 255 caracteres)"
        return customMessage.ERROR_BAD_REQUEST
    }

    return false
}


const tratarDados = async function (vinculo) {

    vinculo.id_doadora = Number(vinculo.id_doadora)
    vinculo.id_etapa = Number(vinculo.id_etapa)

    return vinculo
}

const vincularEtapaDoadora = async function (vinculo, contentType) {

    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {

        if (!String(contentType).toUpperCase().includes("APPLICATION/JSON")) {
            return customMessage.ERROR_CONTENT_TYPE
        }

        let validar = await validarDados(vinculo)
        if (validar) {
            return validar
        }

        let result = await EtapaDoadoraDAO.insertVinculoEtapaDoadora(await tratarDados(vinculo))

        if (!result) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL
        }

        if (result.id_jornada_doacao) {
            vinculo.id = result.id_jornada_doacao

            customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_CREATED_ITEM.status
            customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_CREATED_ITEM.status_code
            customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_CREATED_ITEM.message
            customMessage.DEFAULT_MESSAGE.response = vinculo

            return customMessage.DEFAULT_MESSAGE
        }

        if (result.mensagem) {
            if (String(result.mensagem).toLowerCase().includes("nao encontrada")) {
                customMessage.ERROR_NOT_FOUND.field = `[VINCULO] ${result.mensagem}`
                return customMessage.ERROR_NOT_FOUND
            }

            customMessage.ERROR_BAD_REQUEST.field = `[VINCULO] ${result.mensagem}`
            return customMessage.ERROR_BAD_REQUEST
        }

        return customMessage.ERROR_INTERNAL_SERVER_MODEL

    } catch (error) {
        console.log(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}


const atualizarDataConclusao = async function (id, dados, contentType) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))
    const regexData = /^\d{4}-\d{2}-\d{2}$/

    try {
        if (String(contentType).toUpperCase() != "APPLICATION/JSON") {
            return customMessage.ERROR_CONTENT_TYPE
        }

        id = Number(id)

        if (!Number.isInteger(id) || id < 1) {
            customMessage.ERROR_BAD_REQUEST.field = "[ID] INVÁLIDO (deve ser um número inteiro maior que 0)"
            return customMessage.ERROR_BAD_REQUEST
        } else if (dados == undefined || dados == null || dados.data_conclusao === undefined) {
            customMessage.ERROR_BAD_REQUEST.field = "[DATA_CONCLUSAO] INVÁLIDA (use AAAA-MM-DD ou null)"
            return customMessage.ERROR_BAD_REQUEST
        } else if (dados.data_conclusao !== null &&
            (typeof dados.data_conclusao != "string" ||
                !regexData.test(dados.data_conclusao) ||
                isNaN(new Date(dados.data_conclusao)))) {
            customMessage.ERROR_BAD_REQUEST.field = "[DATA_CONCLUSAO] INVÁLIDA (use AAAA-MM-DD ou null)"
            return customMessage.ERROR_BAD_REQUEST
        }

        const dataConclusao = dados.data_conclusao
        const result = await EtapaDoadoraDAO.updateDataConclusaoJornadaDoacao(id, dataConclusao)

        if (!result) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_UPDATE_ITEM.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_UPDATE_ITEM.status_code
        customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_UPDATE_ITEM.message
        customMessage.DEFAULT_MESSAGE.response = {
            id_jornada_doacao: id,
            data_conclusao: dataConclusao
        }

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const enviarDocumento = async function (id, dados, contentType) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        if (String(contentType).toUpperCase() != "APPLICATION/JSON") {
            return customMessage.ERROR_CONTENT_TYPE
        }

        id = Number(id)

        if (!Number.isInteger(id) || id < 1) {
            customMessage.ERROR_BAD_REQUEST.field = "[ID_JORNADA_DOACAO] INVÁLIDO"
            return customMessage.ERROR_BAD_REQUEST
        } else if (dados == undefined || dados == null ||
            !Number.isInteger(dados.id_doadora) || dados.id_doadora < 1) {
            customMessage.ERROR_BAD_REQUEST.field = "[ID_DOADORA] INVÁLIDO"
            return customMessage.ERROR_BAD_REQUEST
        }

        let validar = validarDocumento(dados.documento)
        if (validar) {
            return validar
        }

        let result = await EtapaDoadoraDAO.insertDocumentoDoadora(id, dados.id_doadora, dados.documento)

        if (result === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL
        } else if (result === null) {
            return customMessage.ERROR_NOT_FOUND
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_CREATED_ITEM.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_CREATED_ITEM.status_code
        customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_CREATED_ITEM.message
        customMessage.DEFAULT_MESSAGE.response = {
            id_documento: result,
            id_jornada_doacao: id,
            id_doadora: dados.id_doadora,
            documento: dados.documento
        }

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    vincularEtapaDoadora,
    atualizarDataConclusao,
    enviarDocumento
}