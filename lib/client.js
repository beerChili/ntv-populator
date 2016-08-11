'use strict'

const request = require('request'),
    zlib = require('zlib'),
    config = require('config')

const headers = {
        'Content-Encoding': 'gzip',
        'Content-Type': 'application/json',
        'Access_Token': config.api_key
    }

module.exports = class Client {

    static post(source, date, words) {
        const options = {
            url: `${config.api}/words?date=${date}&source=${source}`,
            method: 'POST',
            body: zlib.gzipSync(JSON.stringify(words)),
            headers
        }
        return new Promise((resolve, reject) => {
            request(options, (err, response) => err ? reject(err) : resolve(response))
        })
    }

    static put(source, date, words) {
        const options = {
            url: `${config.api}/words?date=${date}&source=${source}`,
            method: 'PUT',
            body: zlib.gzipSync(JSON.stringify(words)),
            headers
        }
        return new Promise((resolve, reject) => {
            request(options, (err, response) => err ? reject(err) : resolve(response))
        })
    }

    static delete(source, date) {
        const options = {
            url: `${config.api}/words?date=${date}&source=${source}`,
            method: 'DELETE',
            headers: {
                'Access_Token': config.api_key
            }
        }
        return new Promise((resolve, reject) => {
            request(options, (err, response) => err ? reject(err) : resolve(response))
        })
    }
}
