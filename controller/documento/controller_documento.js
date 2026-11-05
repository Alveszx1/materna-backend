const configMessages = require("../module/configMessage.js")
const documentoDoadoraDAO = require("../../model/DAO/documentoDoadora.js")

const validarId = function (id, campo = "[ID_DOCUMENTO]") {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    if (id == undefined || id == "" || id == null ||
        !Number.isInteger(Number(id)) || Number(id) <= 0) {
        customMessage.ERROR_BAD_REQUEST.field = `${campo} INVÁLIDO`
        return customMessage.ERROR_BAD_REQUEST
    }

    return false
}

const tratarErroDAO = function (result, customMessage) {
    if (result && result.erro) {
        if (result.sqlState == "45000") {
            if (result.mensagem.includes("nao encontrado")) {
                return customMessage.ERROR_NOT_FOUND
            }

            customMessage.ERROR_BAD_REQUEST.field = result.mensagem
            return customMessage.ERROR_BAD_REQUEST
        }

        return customMessage.ERROR_INTERNAL_SERVER_MODEL_DOCUMENTO_DOADORA
    }

    if (!result) {
        return customMessage.ERROR_INTERNAL_SERVER_MODEL_DOCUMENTO_DOADORA
    }

    return false
}

const enviarDocumento = async function (idJornadaDoacao, dados, contentType) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        if (String(contentType).toUpperCase() != "APPLICATION/JSON") {
            return customMessage.ERROR_CONTENT_TYPE
        }

        let documentoDoadora = {
            ...dados,
            id_jornada_doacao: idJornadaDoacao
        }

        let validar = validarId(idJornadaDoacao, "[ID_JORNADA_DOACAO]")
        if (validar) {
            return validar
        }

        validar = validarId(documentoDoadora.id_doadora, "[ID_DOADORA]")
        if (validar) {
            return validar
        }

        if (typeof documentoDoadora.documento != "string" ||
            documentoDoadora.documento.trim() == "" ||
            documentoDoadora.documento.trim().length > 255) {
            customMessage.ERROR_BAD_REQUEST.field = "[DOCUMENTO] INVÁLIDO (envie um link de até 255 caracteres)"
            return customMessage.ERROR_BAD_REQUEST
        }

        documentoDoadora.id_jornada_doacao = Number(documentoDoadora.id_jornada_doacao)
        documentoDoadora.id_doadora = Number(documentoDoadora.id_doadora)
        documentoDoadora.documento = documentoDoadora.documento.trim()

        let result = await documentoDoadoraDAO.insertDocumentoDoadora(documentoDoadora)
        let erro = tratarErroDAO(result, customMessage)
        if (erro) {
            return erro
        }

        documentoDoadora.id_documento = result.id_documento
        documentoDoadora.id_status_documento = result.id_status_documento
        documentoDoadora.status = result.id_status_documento == 1 ? "Pendente" : "Aceito"

        if (result.substituido) {
            customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_UPDATE_ITEM.status
            customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_UPDATE_ITEM.status_code
            customMessage.DEFAULT_MESSAGE.message = "Documento substituído com sucesso"
        } else {
            customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_CREATED_ITEM.status
            customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_CREATED_ITEM.status_code
            customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_CREATED_ITEM.message
        }

        customMessage.DEFAULT_MESSAGE.response = documentoDoadora
        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarDocumentos = async function (id, campo, consulta) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        let validar = validarId(id, campo)
        if (validar) {
            return validar
        }

        let documentos = await consulta(Number(id))

        if (documentos === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_DOCUMENTO_DOADORA
        }
        if (documentos.length == 0) {
            return customMessage.ERROR_NOT_FOUND
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_RESPONSE.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_RESPONSE.status_code
        customMessage.DEFAULT_MESSAGE.count = documentos.length
        customMessage.DEFAULT_MESSAGE.response = { documentos }
        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarDocumentosPorJornadaDoacao = async function (idJornadaDoacao) {
    return listarDocumentos(
        idJornadaDoacao,
        "[ID_JORNADA_DOACAO]",
        documentoDoadoraDAO.selectDocumentosPorJornadaDoacao
    )
}

const listarDocumentosPorInstituicao = async function (idInstituicao) {
    return listarDocumentos(
        idInstituicao,
        "[ID_INSTITUICAO]",
        documentoDoadoraDAO.selectDocumentosPorInstituicao
    )
}

const atualizarStatusDocumento = async function (idDocumento, idStatus, motivoRecusa) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        let validar = validarId(idDocumento)
        if (validar) {
            return validar
        }

        let result = await documentoDoadoraDAO.updateStatusDocumento(
            Number(idDocumento),
            idStatus,
            motivoRecusa
        )
        let erro = tratarErroDAO(result, customMessage)
        if (erro) {
            return erro
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_UPDATE_ITEM.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_UPDATE_ITEM.status_code
        customMessage.DEFAULT_MESSAGE.message = idStatus == 2
            ? "Documento aceito com sucesso"
            : "Documento recusado com sucesso"
        customMessage.DEFAULT_MESSAGE.response = {
            id_documento: Number(idDocumento),
            id_status_documento: idStatus,
            status: idStatus == 2 ? "Aceito" : "Recusado"
        }
        if (idStatus == 3) {
            customMessage.DEFAULT_MESSAGE.response.motivo_recusa = motivoRecusa
        }

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const aceitarDocumento = async function (idDocumento) {
    return atualizarStatusDocumento(idDocumento, 2, "")
}

const recusarDocumento = async function (idDocumento, dados, contentType) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    if (String(contentType).toUpperCase() != "APPLICATION/JSON") {
        return customMessage.ERROR_CONTENT_TYPE
    }

    if (dados == undefined || dados == null ||
        typeof dados.motivo_recusa != "string" ||
        dados.motivo_recusa.trim() == "" ||
        dados.motivo_recusa.trim().length > 255) {
        customMessage.ERROR_BAD_REQUEST.field = "[MOTIVO_RECUSA] INVÁLIDO (obrigatório, até 255 caracteres)"
        return customMessage.ERROR_BAD_REQUEST
    }

    return atualizarStatusDocumento(
        idDocumento,
        3,
        dados.motivo_recusa.trim()
    )
}

module.exports = {
    enviarDocumento,
    listarDocumentosPorJornadaDoacao,
    listarDocumentosPorInstituicao,
    aceitarDocumento,
    recusarDocumento
}
