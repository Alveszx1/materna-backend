/****************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento , manipulação de dados para realizar o CRUD do responsável
 * Data: 09/10/2026
 * Autor: Bruno Haddad Alves
 * Versão: 1.0
 */

const configMessages = require("../module/configMessage.js")

const funcionarioDAO = require("../../model/DAO/funcionario.js")

const bycript = require("bcrypt")


// const doadoraDAO = require("../../model/DAO/doadora.js")

// {
//     "nome": "Maria Souza",
//     "cpf": "123.456.789-00",
//     "data_nascimento": "1990-05-20",
//     "email": "maria@esperanca.org",
//     "adm": true,
//     "senha": "senha_hash_aqui",
//     "sal": "sal_aleatorio_aqui",
//     "telefone": "(11) 98888-7777",
//     "id_instituicao": 1
//   }



const validarDados = async function (funcionario) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))
 
    // Regex auxiliares
    const regexCpf = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const regexData = /^\d{4}-\d{2}-\d{2}$/
    const regexTelefone = /^\d{10,11}$/
 
    if (funcionario == undefined || funcionario == null) {
        customMessage.ERROR_BAD_REQUEST.field = "[FUNCIONARIO] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST
 
    } else if (funcionario.nome == undefined || funcionario.nome == "" || funcionario.nome == null || funcionario.nome.length > 100) {
        customMessage.ERROR_BAD_REQUEST.field = "[NOME] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST
 
    } else if (funcionario.cpf == undefined || funcionario.cpf == "" || funcionario.cpf == null || !regexCpf.test(funcionario.cpf)) {
        customMessage.ERROR_BAD_REQUEST.field = "[CPF] INVÁLIDO (formato 000.000.000-00)"
        return customMessage.ERROR_BAD_REQUEST
 
    } else if (funcionario.data_nascimento == undefined || funcionario.data_nascimento == "" || funcionario.data_nascimento == null || !regexData.test(funcionario.data_nascimento) || isNaN(new Date(funcionario.data_nascimento))) {
        customMessage.ERROR_BAD_REQUEST.field = "[DATA_NASCIMENTO] INVÁLIDA (formato AAAA-MM-DD)"
        return customMessage.ERROR_BAD_REQUEST
 
    } else if (funcionario.email == undefined || funcionario.email == "" || funcionario.email == null || !regexEmail.test(funcionario.email) || funcionario.email.length > 255) {
        customMessage.ERROR_BAD_REQUEST.field = "[EMAIL] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST
 
    } else if (typeof funcionario.adm != "boolean") {
        customMessage.ERROR_BAD_REQUEST.field = "[ADM] INVÁLIDO (true ou false)"
        return customMessage.ERROR_BAD_REQUEST
 
    } else if (funcionario.senha == undefined || funcionario.senha == "" || funcionario.senha == null || funcionario.senha.length > 255) {
        customMessage.ERROR_BAD_REQUEST.field = "[SENHA] INVÁLIDA"
        return customMessage.ERROR_BAD_REQUEST
 
    } else if (funcionario.sal == undefined || funcionario.sal == "" || funcionario.sal == null || funcionario.sal.length > 255) {
        customMessage.ERROR_BAD_REQUEST.field = "[SAL] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST
 
    } else if (funcionario.telefone == undefined || funcionario.telefone == "" || funcionario.telefone == null || !regexTelefone.test(funcionario.telefone)) {
        customMessage.ERROR_BAD_REQUEST.field = "[TELEFONE] INVÁLIDO (somente números, com DDD)"
        return customMessage.ERROR_BAD_REQUEST
 
    } else if (funcionario.id_instituicao == undefined || funcionario.id_instituicao == "" || funcionario.id_instituicao == null || isNaN(funcionario.id_instituicao) || funcionario.id_instituicao < 1) {
        customMessage.ERROR_BAD_REQUEST.field = "[ID_INSTITUICAO] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST
 
    } else {
        return false
    }
}



const insertFuncionario = async function(funcionario, contentType){

    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {

        if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

            let validarDadosFuncionario = await validarDados(funcionario)
            if(!validarDadosFuncionario){
                            
                funcionario.senha = await bycript.hash(funcionario.senha, 10)

                let result = await funcionarioDAO.insertFuncionario(await tratarDados(funcionario))
                if(result){
                    

                    funcionario.id = result
                    
                    delete funcionario.sal
                    delete funcionario.senha

                    customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_CREATED_ITEM.status
                    customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_CREATED_ITEM.status_code
                    customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_CREATED_ITEM.message
                    customMessage.DEFAULT_MESSAGE.response = funcionario

                    return customMessage.DEFAULT_MESSAGE

                }else{
                    return customMessage.ERROR_INTERNAL_SERVER_MODEL_FUNCIONARIO
                }
                 
            }else{
                return validarDadosFuncionario
            }

        }else{
            return customMessage.ERROR_CONTENT_TYPE
        }
        
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
    
}



const tratarDados = async function (funcionario) {

    funcionario.nome = funcionario.nome.replaceAll("'", "")

    funcionario.cpf = funcionario.cpf.replaceAll("'", "")

    funcionario.email = funcionario.email.replaceAll("'", "")

    funcionario.telefone = funcionario.telefone.replaceAll("'", "")

    return funcionario
}


module.exports = {
    insertFuncionario
}