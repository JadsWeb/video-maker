const readline = require('readline-sync')
const robos = {
    text: require('./robos/text.js')
}

async function start(){
    const content = {}

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    
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

    console.log(content)
}

start()