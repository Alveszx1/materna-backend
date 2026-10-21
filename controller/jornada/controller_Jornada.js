/****************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento , manipulação de dados para realizar o CRUD de jornada
 * Data: 09/10/2026
 * Autor: Bruno Haddad Alves
 * Versão: 1.0
 */

//Import de configurações do arquivo de mensagens do projeto
const configMessages = require("../module/configMessage.js")

const jornadaDAO = require("../../model/DAO/jornada.js")

const validarDados = async function (jornada) {

    let customMessage = JSON.parse(JSON.stringify(configMessages))

    if (jornada == undefined || jornada == null) {
        customMessage.ERROR_BAD_REQUEST.field = "[JORNADA] INVÁLIDA"
        return customMessage.ERROR_BAD_REQUEST

    } else if (jornada.nome == undefined || jornada.nome == "" || jornada.nome == null || jornada.nome.length > 50) {
        customMessage.ERROR_BAD_REQUEST.field = "[NOME] INVÁLIDO (obrigatório, até 50 caracteres)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (jornada.descricao == undefined || jornada.descricao == "" || jornada.descricao == null) {
        customMessage.ERROR_BAD_REQUEST.field = "[DESCRICAO] INVÁLIDA"
        return customMessage.ERROR_BAD_REQUEST

    } else if (jornada.is_ativo == undefined || jornada.is_ativo == null || typeof jornada.is_ativo != "boolean") {
        customMessage.ERROR_BAD_REQUEST.field = "[IS_ATIVO] INVÁLIDO (deve ser true ou false)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (!Number.isInteger(jornada.id_instituicao) || jornada.id_instituicao <= 0) {
        customMessage.ERROR_BAD_REQUEST.field = "[ID_INSTITUICAO] INVÁLIDO (deve ser um número inteiro maior que 0)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (!Array.isArray(jornada.etapas) || jornada.etapas.length == 0) {
        customMessage.ERROR_BAD_REQUEST.field = "[ETAPAS] INVÁLIDAS (informe ao menos uma etapa)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (jornada.etapas.some(e => e == undefined || e == null || e.titulo == undefined || e.titulo == "" || e.titulo == null || e.titulo.length > 100)) {
        customMessage.ERROR_BAD_REQUEST.field = "[ETAPAS] TITULO INVÁLIDO (obrigatório, até 100 caracteres)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (jornada.etapas.some(e => e.descricao == undefined || e.descricao == "" || e.descricao == null)) {
        customMessage.ERROR_BAD_REQUEST.field = "[ETAPAS] DESCRICAO INVÁLIDA"
        return customMessage.ERROR_BAD_REQUEST

    } else if (jornada.etapas.some(e => e.ordem == undefined || e.ordem == null || !Number.isInteger(e.ordem) || e.ordem <= 0)) {
        customMessage.ERROR_BAD_REQUEST.field = "[ETAPAS] ORDEM INVÁLIDA (obrigatória, número inteiro maior que 0)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (new Set(jornada.etapas.map(e => e.ordem)).size != jornada.etapas.length) {
        customMessage.ERROR_BAD_REQUEST.field = "[ETAPAS] ORDEM REPETIDA"
        return customMessage.ERROR_BAD_REQUEST

    } else if (jornada.etapas.some(e => e.documento != undefined && e.documento != null && e.documento != "" && e.documento.length > 255)) {
        // documento é opcional: só valida se vier preenchido
        customMessage.ERROR_BAD_REQUEST.field = "[ETAPAS] DOCUMENTO INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (jornada.etapas.some(e => [e.is_repetivel, e.is_agendavel, e.is_obrigatorio, e.is_solicita_arquivo, e.is_precisa_aprovacao].some(v => v !== 0 && v !== 1))) {
        customMessage.ERROR_BAD_REQUEST.field = "[ETAPAS] CAMPOS is_* OBRIGATÓRIOS (devem ser 0 ou 1)"
        return customMessage.ERROR_BAD_REQUEST

    } else {
        return false
    }
}


const inserirNovaJornada = async function (jornada, contentType) {
 
    let customMessage = JSON.parse(JSON.stringify(configMessages))
 
    try {
 
        if (String(contentType).toUpperCase() == "APPLICATION/JSON") {
 
            let validar = await validarDados(jornada)
 
            if (validar) {
                return validar
            } else {
 
                let result = await jornadaDAO.insertJornada(await tratarDados(jornada))
 
                if (result && result.codigo == 200) {
 
                    customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_CREATED_ITEM.status
                    customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_CREATED_ITEM.status_code
                    customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_CREATED_ITEM.message
                    customMessage.DEFAULT_MESSAGE.response = {
                        ...result.jornada,
                        etapas: result.etapas
                    }
 
                    return customMessage.DEFAULT_MESSAGE
 
                } else if (result && result.codigo == 404) {
                    customMessage.ERROR_NOT_FOUND.field = "[ID_INSTITUICAO] INSTITUIÇÃO NÃO ENCONTRADA"
                    return customMessage.ERROR_NOT_FOUND
 
                } else if (result && result.codigo == 400) {
                    customMessage.ERROR_BAD_REQUEST.field = result.mensagem || "DADOS INVÁLIDOS"
                    return customMessage.ERROR_BAD_REQUEST
 
                } else {
                    return customMessage.ERROR_INTERNAL_SERVER_MODEL
                }
            }
        } else {
            return customMessage.ERROR_CONTENT_TYPE
        }
    } catch (error) {
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const tratarDados = async function (jornada) {

    jornada.nome = jornada.nome.replaceAll("'", "")
    jornada.descricao = jornada.descricao.replaceAll("'", "")

    for (const etapa of jornada.etapas) {
        etapa.titulo = etapa.titulo.replaceAll("'", "")
        etapa.descricao = etapa.descricao.replaceAll("'", "")
        etapa.documento = etapa.documento ? etapa.documento.replaceAll("'", "") : null
    }

    return jornada
}


module.exports = {
    inserirNovaJornada
}