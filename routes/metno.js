"use strict";
import {getdata} from  "../controller/metno_v1.js"

export class MetNoRoutes {

    constructor(router) {
        this.router = router;
        this.init();
    }

    init() {
        this.router.get("/metno_v1/getdata",  getdata);
    }
}