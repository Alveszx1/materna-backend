const express = require('express')

// Criando um objeto de rota para os Endpoints de Ator
const router = express.Router()

const bodyParser = require('body-parser')

// Permitindo a utilização de JSON no body da requisição
const bodyParserJson = bodyParser.json()

// Import da controller da doadora
const controllerInstituicao = require('../controller/instituicao/controller_instituicao.js')

router.get('/', async function(request, response) {
    let result = await controllerInstituicao.listarInstituicao()

    response.status(result.status_code)
    response.json(result)
})

router.get('/:id', async function(request, response) {
    let id = request.params.id
    let result = await controllerInstituicao.buscarInstituicaoById(id)

    response.status(result.status_code)
    response.json(result)
})

router.post('/', bodyParserJson, async function(request, response) {
    let dados = request.body
    let contentType = request.headers['content-type']
    let result = await controllerInstituicao.inserirNovaInstituicao(dados, contentType)

    response.status(result.status_code)
    response.json(result)
})

module.exports = router