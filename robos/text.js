const algorithmia = require('algorithmia')
const apiKeyAlgorithmia = require('../credentials/algorithmia.json').apiKey
const sbd = require('sbd')

async function robot(content){
    await fetchContentFromWikipedia(content)
    sanitizedContent(content)
    breakContentIntoSentences(content)

    console.log('robot')

    async function fetchContentFromWikipedia(content){
        const algorithmiaAuthenticated = algorithmia(apiKeyAlgorithmia)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()
        
        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizedContent(content){
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDates = removeDates(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitized = withoutDates

        function removeBlankLinesAndMarkdown(text){
            const allLines = text.split('\n')
            
            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().lenght === 0 || line.trim().startsWith('=')){
                    return false
                }
                return true
            })
            return withoutBlankLinesAndMarkdown.join(' ')
        }

        function removeDates(text){
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    }

    function breakContentIntoSentences(content){
        content.sentences = [] 
        
        const sentences = sbd.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
}
module.exports = robot