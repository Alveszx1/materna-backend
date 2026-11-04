
const definirLatitudeLongitudePorCEP = async function (cep) {
    try {

        let cepLimpo = String(cep).replace(/\D/g, "")

        if (cepLimpo.length != 8) {
            return false
        }

        let buscarDados = await fetch(
            `https://brasilapi.com.br/api/cep/v2/${cepLimpo}`
        )

        if (!buscarDados.ok) {
            return false
        }

        const dados = await buscarDados.json()

        const latitude = dados.location?.coordinates?.latitude
        const longitude = dados.location?.coordinates?.longitude

        if (
            latitude == undefined || latitude == null ||
            longitude == undefined || longitude == null
        ) {
            return false
        }

        return {
            latitude: Number(latitude),
            longitude: Number(longitude)
        }

    } catch (error) {
        console.log("Erro ao buscar coordenadas:", error)
        return false
    }
}

module.exports = {
    definirLatitudeLongitudePorCEP
}
