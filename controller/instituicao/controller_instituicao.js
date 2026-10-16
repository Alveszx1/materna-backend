const configMessages = require("../module/configMessage.js")
const instituicaoDAO = require("../../model/DAO/instituicao.js")
const coordenadas = require("../module/coordenadas.js")
const bcrypt = require("bcrypt")


const validarDados = async function (instituicao) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    const regexCnpj = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
    const regexCpf = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const regexData = /^\d{4}-\d{2}-\d{2}$/
    const regexCep = /^\d{5}-?\d{3}$/
    const regexTelefone = /^\d{10,11}$/
    const regexHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/
    const regexSigla = /^[A-Za-z]{2}$/

    if (instituicao == undefined || instituicao == null) {
        customMessage.ERROR_BAD_REQUEST.field = "[INSTITUICAO] INVÁLIDA"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.nome == undefined || instituicao.nome == "" || instituicao.nome == null || instituicao.nome.length > 100) {
        customMessage.ERROR_BAD_REQUEST.field = "[NOME] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.cnpj == undefined || instituicao.cnpj == "" || instituicao.cnpj == null || !regexCnpj.test(instituicao.cnpj)) {
        customMessage.ERROR_BAD_REQUEST.field = "[CNPJ] INVÁLIDO (formato 00.000.000/0000-00)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.email == undefined || instituicao.email == "" || instituicao.email == null || !regexEmail.test(instituicao.email) || instituicao.email.length > 255) {
        customMessage.ERROR_BAD_REQUEST.field = "[EMAIL] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.foto != undefined && instituicao.foto != null && instituicao.foto != "" && instituicao.foto.length > 255) {
        customMessage.ERROR_BAD_REQUEST.field = "[FOTO] INVÁLIDA"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.id_coleta == undefined || instituicao.id_coleta == "" || instituicao.id_coleta == null || isNaN(instituicao.id_coleta) || instituicao.id_coleta < 1) {
        customMessage.ERROR_BAD_REQUEST.field = "[ID_COLETA] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.telefone == undefined || instituicao.telefone == "" || instituicao.telefone == null || !regexTelefone.test(instituicao.telefone)) {
        customMessage.ERROR_BAD_REQUEST.field = "[TELEFONE] INVÁLIDO (somente números, com DDD)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.cep == undefined || instituicao.cep == "" || instituicao.cep == null || !regexCep.test(instituicao.cep)) {
        customMessage.ERROR_BAD_REQUEST.field = "[CEP] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.sigla_estado == undefined || instituicao.sigla_estado == "" || instituicao.sigla_estado == null || !regexSigla.test(instituicao.sigla_estado)) {
        customMessage.ERROR_BAD_REQUEST.field = "[SIGLA_ESTADO] INVÁLIDA (2 letras, ex.: SP)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.cidade == undefined || instituicao.cidade == "" || instituicao.cidade == null || instituicao.cidade.length > 100) {
        customMessage.ERROR_BAD_REQUEST.field = "[CIDADE] INVÁLIDA"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.logradouro == undefined || instituicao.logradouro == "" || instituicao.logradouro == null || instituicao.logradouro.length > 100) {
        customMessage.ERROR_BAD_REQUEST.field = "[LOGRADOURO] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.bairro == undefined || instituicao.bairro == "" || instituicao.bairro == null || instituicao.bairro.length > 50) {
        customMessage.ERROR_BAD_REQUEST.field = "[BAIRRO] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.numero == undefined || instituicao.numero == "" || instituicao.numero == null || isNaN(instituicao.numero) || instituicao.numero <= 0) {
        customMessage.ERROR_BAD_REQUEST.field = "[NUMERO] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.complemento != undefined && instituicao.complemento != "" && instituicao.complemento != null && instituicao.complemento.length > 50) {
        customMessage.ERROR_BAD_REQUEST.field = "[COMPLEMENTO] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (!Array.isArray(instituicao.horarios) || instituicao.horarios.length != 7) {
        customMessage.ERROR_BAD_REQUEST.field = "[HORARIOS] INVÁLIDO (envie os 7 dias)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (!instituicao.horarios.every(h => h != null && Number.isInteger(Number(h.dia)) && Number(h.dia) >= 1 && Number(h.dia) <= 7)) {
        customMessage.ERROR_BAD_REQUEST.field = "[HORARIOS] DIA INVÁLIDO (1 a 7)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (new Set(instituicao.horarios.map(h => Number(h.dia))).size != instituicao.horarios.length) {
        customMessage.ERROR_BAD_REQUEST.field = "[HORARIOS] DIA REPETIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (!instituicao.horarios.every(h => regexHora.test(h.abre) && regexHora.test(h.fecha))) {
        customMessage.ERROR_BAD_REQUEST.field = "[HORARIOS] HORA INVÁLIDA (formato HH:MM)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (!instituicao.horarios.every(h => (h.abre == "00:00" && h.fecha == "00:00") || h.abre < h.fecha)) {
        customMessage.ERROR_BAD_REQUEST.field = "[HORARIOS] ABERTURA DEVE SER ANTES DO FECHAMENTO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.funcionario == undefined || instituicao.funcionario == null) {
        customMessage.ERROR_BAD_REQUEST.field = "[FUNCIONARIO] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.funcionario.nome == undefined || instituicao.funcionario.nome == "" || instituicao.funcionario.nome == null || instituicao.funcionario.nome.length > 100) {
        customMessage.ERROR_BAD_REQUEST.field = "[FUNCIONARIO NOME] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.funcionario.cpf == undefined || instituicao.funcionario.cpf == "" || instituicao.funcionario.cpf == null || !regexCpf.test(instituicao.funcionario.cpf)) {
        customMessage.ERROR_BAD_REQUEST.field = "[FUNCIONARIO CPF] INVÁLIDO (formato 000.000.000-00)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.funcionario.data_nascimento == undefined || instituicao.funcionario.data_nascimento == "" || instituicao.funcionario.data_nascimento == null || !regexData.test(instituicao.funcionario.data_nascimento) || isNaN(new Date(instituicao.funcionario.data_nascimento))) {
        customMessage.ERROR_BAD_REQUEST.field = "[FUNCIONARIO DATA_NASCIMENTO] INVÁLIDA (formato AAAA-MM-DD)"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.funcionario.email == undefined || instituicao.funcionario.email == "" || instituicao.funcionario.email == null || !regexEmail.test(instituicao.funcionario.email) || instituicao.funcionario.email.length > 255) {
        customMessage.ERROR_BAD_REQUEST.field = "[FUNCIONARIO EMAIL] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.funcionario.senha == undefined || instituicao.funcionario.senha == "" || instituicao.funcionario.senha == null || instituicao.funcionario.senha.length > 255) {
        customMessage.ERROR_BAD_REQUEST.field = "[FUNCIONARIO SENHA] INVÁLIDA"
        return customMessage.ERROR_BAD_REQUEST

    } else if (instituicao.funcionario.telefone == undefined || instituicao.funcionario.telefone == "" || instituicao.funcionario.telefone == null || !regexTelefone.test(instituicao.funcionario.telefone)) {
        customMessage.ERROR_BAD_REQUEST.field = "[FUNCIONARIO TELEFONE] INVÁLIDO (somente números, com DDD)"
        return customMessage.ERROR_BAD_REQUEST

    } else {
        return false
    }
}


const tratarDados = async function (instituicao) {

    instituicao.nome = instituicao.nome.replaceAll("'", "")
    instituicao.email = instituicao.email.replaceAll("'", "")
    instituicao.foto = instituicao.foto ? instituicao.foto.replaceAll("'", "") : null
    instituicao.cidade = instituicao.cidade.replaceAll("'", "")
    instituicao.logradouro = instituicao.logradouro.replaceAll("'", "")
    instituicao.bairro = instituicao.bairro.replaceAll("'", "")
    instituicao.numero = String(instituicao.numero).replaceAll("'", "")
    instituicao.complemento = instituicao.complemento ? instituicao.complemento.replaceAll("'", "") : ""
    instituicao.sigla_estado = instituicao.sigla_estado.replaceAll("'", "").toUpperCase()
    instituicao.funcionario.nome = instituicao.funcionario.nome.replaceAll("'", "")
    instituicao.funcionario.email = instituicao.funcionario.email.replaceAll("'", "")

    return instituicao
}


const inserirNovaInstituicao = async function (instituicao, contentType) {

    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {

        if (String(contentType).toUpperCase() == "APPLICATION/JSON") {

            let validar = await validarDados(instituicao)

            if (validar) {
                return validar
            } else {

                let resultCoordenadas = await coordenadas.definirLatitudeLongitudePorCEP(instituicao.cep)

                if (resultCoordenadas) {
                    instituicao.latitude = Number(resultCoordenadas.latitude)
                    instituicao.longitude = Number(resultCoordenadas.longitude)
                } else {
                    customMessage.ERROR_BAD_REQUEST.field = "[CEP] NÃO FOI POSSÍVEL LOCALIZAR AS COORDENADAS"
                    return customMessage.ERROR_BAD_REQUEST
                }

                const sal = await bcrypt.genSalt(10)
                instituicao.funcionario.sal = sal
                instituicao.funcionario.senha = await bcrypt.hash(instituicao.funcionario.senha, sal)

                let result = await instituicaoDAO.insertInstituicao(await tratarDados(instituicao))

                if (result) {

                    instituicao.id = result.id_instituicao
                    instituicao.funcionario.id = result.id_funcionario

                    delete instituicao.funcionario.sal
                    delete instituicao.funcionario.email
                    delete instituicao.funcionario.senha

                    customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_CREATED_ITEM.status
                    customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_CREATED_ITEM.status_code
                    customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_CREATED_ITEM.message
                    customMessage.DEFAULT_MESSAGE.response = instituicao

                    return customMessage.DEFAULT_MESSAGE

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
    inserirNovaInstituicao
}