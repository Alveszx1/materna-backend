const express = require("express")
const cors = require("cors")
const app = express()


const corsOptions = {
    origin: "*", // Configuração de origem da requisição (IP ou Dominio)
    methods: "GET, POST, PUT, DELETE, OPTIONS",  // Configuração dos verbos que serão utilizados na API
    allowedHeaders: ['Content-type', "Authorization"]
}

const doadoraRouter = require("./routes/doadora.router.js")
const funcionarioRouter = require("./routes/funcionario.router.js")
const campanhaRouter = require("./routes/campanha.router.js")
const instituicaoRouter = require("./routes/instituicao.router.js")
const jornadaRouter = require("./routes/jornada.router.js")
const horarioRouter = require("./routes/horario_instituicao.js")
const jornadaDoacao = require("./routes/jornadaDoacao.router.js")



app.use(cors(corsOptions))


app.use("/v1/materna/doadora", doadoraRouter)
app.use("/v1/materna/funcionario", funcionarioRouter )
app.use("/v1/materna/campanha", campanhaRouter)
app.use("/v1/materna/instituicao", instituicaoRouter)
app.use("/v1/materna/jornada", jornadaRouter)
app.use("/v1/materna/horario", horarioRouter)
app.use("/v1/materna/vinculo-etapa-doadora", jornadaDoacao)


app.listen(9090, function(){
    console.log("API aguardando novas requisições..............")
})
