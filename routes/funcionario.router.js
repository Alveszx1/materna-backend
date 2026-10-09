const express = require('express')

// Criando um objeto de rota para os Endpoints de Ator
const router = express.Router()

const bodyParser = require('body-parser')

// Permitindo a utilização de JSON no body da requisição
const bodyParserJson = bodyParser.json()

// Import da controller da doadora
const controllerFuncionario = require('../controller/funcionario/controller_funcionario.js')

router.post('/', bodyParserJson, async function(request, response) {
    let dados = request.body
    let contentType = request.headers['content-type']
    let result = await controllerFuncionario.insertFuncionario(dados, contentType)

    response.status(result.status_code)
    response.json(result)
})



module.exports = router