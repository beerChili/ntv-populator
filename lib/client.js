'use strict'

const request = require('request'),
    zlib = require('zlib')

const baseUrl = 'http://ntvapi_api_1:10010/api',
    headers = {
        'Content-Encoding': 'gzip',
        'Content-Type': 'application/json',
        'Access_Token': '6910UHYigPn1o1wCN3VzPzMQ9bAjZT13'
    }

module.exports = class Client {

    static post(source, date, words) {
        const options = {
            url: baseUrl + `/words?date=${date}&source=${source}`,
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
            url: baseUrl + `/words?date=${date}&source=${source}`,
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
            url: baseUrl + `/words?date=${date}&source=${source}`,
            method: 'DELETE',
            headers: {
                'Access_Token': '6910UHYigPn1o1wCN3VzPzMQ9bAjZT13'
            }
        }
        return new Promise((resolve, reject) => {
            request(options, (err, response) => err ? reject(err) : resolve(response))
        })
    }
}
