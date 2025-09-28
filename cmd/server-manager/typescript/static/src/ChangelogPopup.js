"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangelogPopup = void 0;
class ChangelogPopup {
    constructor() {
        if (!ShowUpgradePopup) {
            return;
        }
        const $changelogModal = $("#changelog-modal");
        $changelogModal.on('shown.bs.modal', () => {
            $.get("/accounts/dismiss-changelog");
        });
        $changelogModal.modal();
    }
}
exports.ChangelogPopup = ChangelogPopup;
//# sourceMappingURL=ChangelogPopup.js.map