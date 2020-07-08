"use strict";
import metnoControllerv1 from    "../controller/metno_v1"

export class MetNoRoutes {

    constructor(router) {
        this.router = router;
        this.metnoControllerv1 = new metnoControllerv1();
        this.init();
    }

    init() {
        this.router.get("/metno_v1/getdata",  this.metnoControllerv1.getdata);
    }
}