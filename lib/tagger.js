'use strict'

const TreeTagger = require('treetagger')

const tagger = new TreeTagger({
    language: 'german'
})

exports.tag = (text) => new Promise((resolve, reject) => {
    tagger.tag(text, (err, results) => err ? reject(err) : resolve(results))
})

exports.filterStopwords = (tags) => tags.filter(tag => tag.pos.match(/^ADJ|^N|^VV/))
exports.getNouns = (tags) => tags.filter(tag => tag.pos.match(/^N/))
exports.groupByLemma = (tags) => {
  const grouped = {}
  tags.forEach(item => {
      if (item.l === '<unknown>') item.l = item.t
          grouped[item.l] = grouped[item.l] || {}
          grouped[item.l][item.t] = (grouped[item.l][item.t] || 0) + 1
  })
  return grouped
}
