"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Form = void 0;
const select2_1 = __importDefault(require("select2"));
class Form {
    constructor() {
        this.initSelect2();
    }
    initSelect2() {
        (0, select2_1.default)($);
    }
    static initialiseSelect2InElement($elem) {
        Form.initialiseSelect2OnElement($elem.find("select:not([multiple])"));
    }
    static initialiseSelect2OnElement($elem) {
        $elem.select2({
            theme: "bootstrap4",
            templateResult: (data) => {
                let $elem = $(data.element);
                let trackName = $elem.data("track-name");
                if (!trackName) {
                    return data.text;
                }
                let $opt = $("<span>");
                $opt.text($elem.text());
                $opt.append($("<small class='float-right text-muted'>" + trackName + "</small>"));
                $opt.append($("<div class='clearfix'></div>"));
                return $opt;
            },
        });
    }
}
exports.Form = Form;
//# sourceMappingURL=Form.js.map