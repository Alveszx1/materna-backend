const express = require("express")
const cors = require("cors")
const app = express()


const corsOptions = {
    origin: "*", // Configuração de origem da requisição (IP ou Dominio)
    methods: "GET, POST, PUT, DELETE, OPTIONS",  // Configuração dos verbos que serão utilizados na API
    allowedHeaders: ['Content-type', "Authorization"]
}

const doadoraRouter = require("./routes/doadora.router")


app.use(cors(corsOptions))


app.use("/v1/materna/doadora", doadoraRouter)

app.listen(9090, function(){
    console.log("API aguardando novas requisições..............")
})
