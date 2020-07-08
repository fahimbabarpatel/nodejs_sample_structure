'use strict'

var rp = require('request-promise-native')


export default async function execute(options) {
    try {
        return await rp(options)
    } catch (err) {
        console.log(`Exception while executing HTTPS ${JSON.stringify(options)} ---  ${err}  ---  ${JSON.stringify(err)}`)
        return false;
    }
}