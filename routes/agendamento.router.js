const express = require('express')

// Criando um objeto de rota para os Endpoints de Agendamento
const router = express.Router()

const bodyParser = require('body-parser')

// Permitindo a utilização de JSON no body da requisição
const bodyParserJson = bodyParser.json()

const controllerAgendamento = require('../controller/agendamento/controller_agendamento.js')

router.post('/', bodyParserJson, async function(request, response) {
    let dados = request.body
    let contentType = request.headers['content-type']
    let result = await controllerAgendamento.inserirNovoAgendamento(dados, contentType)

    response.status(result.status_code)
    response.json(result)
})

router.put('/:id', bodyParserJson, async function (request, response) {
    let id = request.params.id
    let dados = request.body
    let contentType = request.headers['content-type']
    let result = await controllerAgendamento.atualizarAgendamento(id, dados, contentType)

    response.status(result.status_code)
    response.json(result)
})

module.exports = router