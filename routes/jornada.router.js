const express = require('express')

// Criando um objeto de rota para os Endpoints
const router = express.Router()

const bodyParser = require('body-parser')

// Permitindo a utilização de JSON no body da requisição
const bodyParserJson = bodyParser.json()

// Import da controller da jornada
const controllerJornada = require('../controller/jornada/controller_Jornada.js')

router.get('/instituicao/:id', async function(request, response) {
    let result = await controllerJornada.listarJornadasPorInstituicao(request.params.id)

    response.status(result.status_code)
    response.json(result)
})

router.get('/doadora/:id', async function(request, response) {
    let result = await controllerJornada.buscarJornadaDoadora(request.params.id)

    response.status(result.status_code)
    response.json(result)
})

router.patch('/:id', bodyParserJson, async function(request, response) {
    let id = request.params.id
    let dados = request.body
    let contentType = request.headers['content-type']
    let result = await controllerJornada.atualizarStatusJornada(id, dados, contentType)

    response.status(result.status_code)
    response.json(result)
})

router.post('/',bodyParserJson, async function(request, response) {

    let dados = request.body
    let contentType = request.headers['content-type']
    let result = await controllerJornada.inserirNovaJornada(dados, contentType)

    response.status(result.status_code)
    response.json(result)
})

module.exports = router