'use strict'

const scraper = require('ntv-scraper'),
    Client = require('./lib/client'),
    tagger = require('./lib/tagger'),
    _ = require('lodash'),
    moment = require('moment'),
    program = require('commander'),
    debug = require('debug')('populator'),
    check = require('check-types')

const filterWords = require('fs').readFileSync('./stopwords.txt', 'utf-8').split('\n')

program
    .option('-s, --source <data>')
    .option('-d, --date <data>')
    .option('-e, --end-date <data>')
    .parse(process.argv)

const startDate = moment(program.date)
const endDate = program.endDate ? moment(program.endDate) : startDate
populateMultiple(program.source.toUpperCase(), startDate, endDate)

function populateMultiple(source, startDate, endDate) {
    const diff = endDate.diff(startDate, 'd')
    let sequence = Promise.resolve();
    [...Array(diff + 1).keys()].forEach((i) => {
        const date = moment(startDate).add(i, 'd').toDate()
        sequence = sequence.then(() => populate(source, date))
            .then(response => debug(response.toJSON()))
            .catch(err => debug(err))
    })
}

function populate(source, date) {
    const occurrencesTable = {}
    return scraper.getArticleURLs(source, date)
        .then(urlList =>
            Promise.all(urlList.map((url, index) =>
                new Promise((resolve, reject) => {
                    scraper.getArticle(url, 250 * index)
                        .then(article => {
                            // replace punctuation, numbers and special characters with white spaces
                            let text = article.text
                                .replace(/[^A-zÀ-ÿ'\d-]|[\[\]_\\÷]|-(?![A-zÀ-ÿ])|\d(?!\d*-[A-zÀ-ÿ]+)/g, ' ')
                                .trim()

                            // remember references
                            const words = text.split(/ +/)
                            const uniqueWords = _.uniq(words)
                            const reference = {
                                headline: article.headline,
                                url
                            }
                            uniqueWords.forEach(word => {
                                if (!occurrencesTable[word]) occurrencesTable[word] = []
                                occurrencesTable[word].push(reference)
                            })

                            resolve(text)
                        })
                        .catch(err => {
                            debug(err)
                            resolve('')
                        })
                })
            ))
        )
        .then(results => {
            const text = _.join(results, ' ')
            debug('starting tagging')
            return tagger.tag(text)
        })
        .then(tags => {
            debug('tagged')
            const filtered = tagger
                .getNouns(tags)
                .map(tag => {
                    tag.l = tag.l === '<unknown>' ? tag.t : tag.l
                    return tag
                })
                .filter(tag => !filterWords.includes(tag.l) && tag.t.length > 1)
            const grouped = tagger.groupByLemma(filtered)

            const hist = []
            for (let lemma in grouped) {
                if (grouped.hasOwnProperty(lemma)) {
                    const words = []
                    for (let word in grouped[lemma]) {
                        if (grouped[lemma].hasOwnProperty(word)) {
                            words.push({
                                value: word,
                                count: grouped[lemma][word],
                                occurrenceRefs: occurrencesTable[word]
                            })
                        }
                    }
                    const word = mergeWords(words)
                    hist.push(word)
                }
            }
            debug(hist.sort((a, b) => b.count - a.count).slice(0, 100).map(word => {
                return word.value + ': ' + word.count
            }))
            return Client.put(source, date, hist.sort((a, b) => b.count - a.count).slice(0, 100))
        })
}

function mergeWords(words) {
    return words
        .sort((a, b) => a.count - b.count)
        .reduce((prev, curr) => {
            curr.count += prev.count
            if (curr.occurrenceRefs) {
                curr.occurrenceRefs.concat(prev.occurrenceRefs)
            } else {
                curr.occurrenceRefs = prev.occurrenceRefs || []
            }
            return curr
        })
}
