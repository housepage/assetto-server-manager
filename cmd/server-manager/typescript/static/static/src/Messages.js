"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messages = void 0;
const SummernoteWrapper_1 = require("./forms/SummernoteWrapper");
class Messages {
    static initSummerNote() {
        let $contentManagerMessageContent = $("#ContentManagerMessageContent");
        if (!$contentManagerMessageContent.length) {
            return;
        }
        let $summerNote = $("#contentManagerWelcomeMessage");
        let html = "";
        if ($contentManagerMessageContent.length > 0) {
            html = $contentManagerMessageContent.html();
        }
        let wrapper = new SummernoteWrapper_1.SummernoteWrapper($summerNote, {
            placeholder: 'A message that Content Manager users can see!',
            tabsize: 2,
            height: 400,
        }, html);
        wrapper.render();
    }
}
exports.Messages = Messages;
//# sourceMappingURL=Messages.js.map