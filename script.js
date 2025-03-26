const dadosDaConversao  = {
    cotacoes:[],
    entrada:{
        valor: undefined,
        moeda: undefined
    },
    saida:{
        moeda: undefined
    }
}


async function receberDados(){

    dadosDaConversao.entrada.valor = document.querySelector(".entrada .valor").value
    dadosDaConversao.entrada.moeda = document.querySelector(".entrada .moeda").value
    dadosDaConversao.saida.moeda = document.querySelector(".saida .moeda").value
}
async function valoresParaConvesao(){
    
    try{
        const url ="https://api2.binance.com/api/v3/ticker/24hr"
        const resposta = await fetch(url)
        const json = await resposta.json()
       
        
        return(json)
    }catch(erro){
        return window.cotacaoPadrao

    }
}
async function tratarDados(){
    if(dadosDaConversao.cotacoes.length>0){
        return
    }
    const moedas = await valoresParaConvesao()
    const paraBtc = moedas
    .filter(cotacao=>cotacao.symbol.endsWith("BTC"))
    .map(cotacao=>({moeda:cotacao.symbol.substring(0,cotacao.symbol.indexOf('BTC')), 
        valor:parseFloat(cotacao.lastPrice)
    }))
    
    const deBtc = moedas
    .filter(cotacao=>cotacao.symbol.startsWith("BTC"))
    .map(cotacao=> ({moeda:cotacao.symbol.substring(3),
        valor: 1/parseFloat(cotacao.lastPrice)
    }))
    dadosDaConversao.cotacoes = [
        ...paraBtc,
        ...deBtc,
    ]
}

async function resultado(){
    const valorEntrada = parseFloat(dadosDaConversao.entrada.valor) 
    const moedaEntrada = (dadosDaConversao.entrada.moeda||"BTC").toUpperCase()
    const moedaSaida =  (dadosDaConversao.saida.moeda||"USDT").toUpperCase()
    
    if(isNaN(valorEntrada)){
        console.error(`Erro: Valor de entrada deve ser numérico. (Ex: 2,55)`)
        return
    }
    
    const moedaDeEntradaParaBtc = moedaEntrada==="BTC" ? 1: dadosDaConversao.cotacoes.find(cotacao=>cotacao.moeda === moedaEntrada)?.valor
    if(moedaDeEntradaParaBtc===undefined){
        console.error(`Erro: A moeda: ${moedaEntrada} não existe ou não consta no banco de dados.`)
    }
    const moedaDeSaidaParaBtc = moedaSaida==="BTC" ? 1:dadosDaConversao.cotacoes.find(cotacao=>cotacao.moeda === moedaSaida)?.valor
    if(moedaDeSaidaParaBtc===undefined){
        console.error(`Erro: A moeda: ${moedaSaida} não existe ou não consta no banco de dados.`)
    }
    if(moedaDeEntradaParaBtc===undefined||moedaDeSaidaParaBtc===undefined){
        return
    }
    const razao =moedaDeEntradaParaBtc/moedaDeSaidaParaBtc
    const valorSaida = valorEntrada *razao

    document.querySelector(".saida .valor").value = valorSaida

}
function preencherSeletor(select,moedas){
    const selecao =select.value
    select.innerHTML=""
    moedas.forEach(moeda=> {
        const option = document.createElement('option')
        option.value = moeda
        option.innerHTML = moeda
        
        select.appendChild(option)
    })
    select.value = selecao

}
function preencherMoedas(){
    let moedas = dadosDaConversao.cotacoes.map(cotacao=>cotacao.moeda)
    moedas.push("BTC")
    moedas = moedas.filter(moeda=>moeda).sort()

    preencherSeletor(document.querySelector(".entrada .moeda"),moedas)
    preencherSeletor(document.querySelector(".saida .moeda"),moedas)

}
async function converter(){
    await tratarDados()
    preencherMoedas()
    await receberDados()
    await resultado()  
}

converter()