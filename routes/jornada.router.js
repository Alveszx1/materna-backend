const express = require('express')

// Criando um objeto de rota para os Endpoints
const router = express.Router()

const bodyParser = require('body-parser')

// Permitindo a utilização de JSON no body da requisição
const bodyParserJson = bodyParser.json()

// Import da controller da jornada
const controllerJornada = require('../controller/jornada/controller_Jornada.js')

router.post('/',bodyParserJson, async function(request, response) {

    let dados = request.body
    let contentType = request.headers['content-type']
    let result = await controllerJornada.inserirNovaJornada(dados, contentType)

    response.status(result.status_code)
    response.json(result)
})

module.exports = router