const algorithmia = require('algorithmia')
const apiKeyAlgorithmia = require('../credentials/algorithmia.json').apiKey
const sbd = require('sbd')
const fetch = require('node-fetch')

const watsonApiKey = require('../credentials/watson-nlu.json').apikey
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
 
const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
}) 

const state = require('./state.js')

async function robot(){
  const content = state.load()
  await fetchContentFromWikipediaAlgorithmia(content)

  sanitizedContent(content)
  breakContentIntoSentences(content)
  limitMaximumSentences(content)
  await fetchKeywordsOfAllSentences(content)

  state.save(content)

  async function fetchContentFromWikipediaAlgorithmia(content){
      const algorithmiaAuthenticated = algorithmia(apiKeyAlgorithmia)
      const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
      const wikipediaResponse = await wikipediaAlgorithm.pipe({
          "articleName": content.searchTerm,
          "lang": content.lang

      })
      const wikipediaContent = wikipediaResponse.get()
      content.sourceContentOriginal = wikipediaContent.content
  }

  async function fetchContentFromWikipedia(content) {
      try {
          const response = await fetch(`https://${content.lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext&titles=${encodeURIComponent(content.searchTerm)}&format=json`)
          const wikipediaRawResponse = await response.json()
  
          const wikipediaRawContent = wikipediaRawResponse.query.pages
  
          Object.keys(wikipediaRawContent).forEach((key) => {
              content.sourceContentOriginal = wikipediaRawContent[key]['extract']
          })
  
      } catch (error) {
          console.log(error)
      }
  }

  function sanitizedContent(content) {
      const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
      const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
  
      content.sourceContentSanitized = withoutDatesInParentheses
  
      function removeBlankLinesAndMarkdown(text) {
        const allLines = text.split('\n')
  
        const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
          if (line.trim().length === 0 || line.trim().startsWith('=')) {
            return false
          }
  
          return true
        })
  
        return withoutBlankLinesAndMarkdown.join(' ')
      }
  }

  function removeDatesInParentheses(text) {
      return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
  }

  function breakContentIntoSentences(content){
      content.sentences = [] 
      
      const sentences = sbd.sentences(content.sourceContentSanitized)
      sentences.forEach((sentence) => {
          content.sentences.push({
              text: sentence,
              keywords: []
          })
      })
  }

  function limitMaximumSentences(content){
      content.sentences = content.sentences.slice(0, content.maximumSentences)
  }

  async function fetchKeywordsOfAllSentences(content) {
      console.log('> [text-robot] Starting to fetch keywords from Watson')
  
      for (const sentence of content.sentences) {
        console.log(`> [text-robot] Sentence: "${sentence.text}"`)
  
        sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
  
        console.log(`> [text-robot] Keywords: ${sentence.keywords.join(', ')}\n`)
      }
  }
    
  async function fetchWatsonAndReturnKeywords(sentence) {
      return new Promise((resolve, reject) => {
        nlu.analyze({
          text: sentence,
          features: {
            keywords: {}
          }
        }, (error, response) => {
          if (error) {
            reject(error)
            return
          }
  
          const keywords = response.keywords.map((keyword) => {
            return keyword.text
          })
  
          resolve(keywords)
        })
      })
  }
}
module.exports = robot