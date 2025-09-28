"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarList = void 0;
class CarList {
    constructor() {
        $(".delete-car").on("click", function (e) {
            e.stopPropagation();
            return confirm("Are you sure that you want to permanently delete this content?");
        });
    }
}
exports.CarList = CarList;
//# sourceMappingURL=CarList.js.map