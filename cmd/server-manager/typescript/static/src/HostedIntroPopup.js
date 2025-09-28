"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostedIntroPopup = void 0;
class HostedIntroPopup {
    constructor() {
        const $introModal = $("#intro-modal");
        if (!$introModal.length) {
            return;
        }
        $introModal.on('shown.bs.modal', () => {
            $.get("/accounts/dismiss-intro");
        });
        $introModal.modal();
    }
}
exports.HostedIntroPopup = HostedIntroPopup;
//# sourceMappingURL=HostedIntroPopup.js.map