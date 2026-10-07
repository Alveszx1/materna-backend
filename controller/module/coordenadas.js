const definirLatitudeLongitudePorCEP = async function (cep) {
    try {
        let cepLimpo = String(cep).replace(/\D/g, "")

        if (cepLimpo.length != 8) {
            return false
        }

        let buscarDados = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`)

        if (!buscarDados.ok) {
            return false
        }

        const dados = await buscarDados.json()

        if (
            dados.location == undefined || dados.location == null ||
            dados.location.coordinates == undefined || dados.location.coordinates == null ||
            dados.location.coordinates.latitude == undefined || dados.location.coordinates.latitude == "" ||
            dados.location.coordinates.longitude == undefined || dados.location.coordinates.longitude == ""
        ) {
            return false
        }

        return dados.location.coordinates
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    definirLatitudeLongitudePorCEP
}