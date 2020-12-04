const readline = require('readline-sync')
const robos = {
    text: require('./robos/text.js')
}

async function start(){
    const content = {
        useFetchContentFromWikipediaAlgorithmia: false,
        maximumSentences: 7
    }

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    //content.lang = askAndReturnLangueage()
    
    await robos.text(content)

    function askAndReturnSearchTerm(){
        return readline.question('Type a wikipedia search: ')
    }

    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectPrefixIndex = readline.keyInSelect(prefixes, 'choose one option: ')
        const selectPrefixText = prefixes[selectPrefixIndex]

        return selectPrefixText
    }

    function askAndReturnLangueage(){
        const language = ['pt', 'en', 'es', 'fr']
        const selectedLangIndex = readline.keyInSelect(language, 'Choice language: ')
        const selectedLangText =  language[selectedLangIndex]
        return selectedLangText
    }

    console.log(JSON.stringify(content, null, 4))
}

start()