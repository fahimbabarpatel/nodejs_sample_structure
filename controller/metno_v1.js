"use strict"

import execute from "../common/http_call.js";
import config from "config";
const metno_config = config.get("data_provider.metno")




export async function getdata(req, res) {
    try {
        let lat = req.query.lat;
        let lon = req.query.lon;
        let altitude = req.query.altitude;
        console.log({
            lat,
            lon,
            altitude
        })
        let options = {
            uri: metno_config.getDataURL,
            qs: {
                lat,
                lon,
                altitude
            },
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true
        };
        let response = await execute(options);
        res.send(response)
    } catch (err) {
        console.log(err)
    }
}