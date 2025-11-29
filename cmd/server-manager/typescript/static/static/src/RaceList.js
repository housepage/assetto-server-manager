"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaceList = void 0;
const rrule_1 = require("rrule");
class RaceList {
    constructor() {
        this.initRecurrenceRuleExplanations();
        this.initRaceDetailsButtons();
    }
    initRecurrenceRuleExplanations() {
        let rRules = document.getElementsByClassName('rrule-text');
        for (let i = 0; i < rRules.length; i++) {
            let recurrenceString = rRules[i].getAttribute("data-rrule");
            if (recurrenceString) {
                let rule = rrule_1.RRule.fromString(recurrenceString);
                rRules[i].textContent = rule.toText();
            }
        }
    }
    initRaceDetailsButtons() {
        $(document).on("click", ".custom-race-details", (e) => {
            let $this = $(e.currentTarget);
            let raceID = $this.attr("data-race-id");
            const modalContentURL = `/event-details?custom-race=${raceID}`;
            $.get(modalContentURL).then((data) => {
                let $eventDetailsModal = $("#race-details-modal");
                $eventDetailsModal.html(data);
                $eventDetailsModal.find("input[type='checkbox']").bootstrapSwitch();
                $eventDetailsModal.modal();
            });
            return false;
        });
    }
}
exports.RaceList = RaceList;
//# sourceMappingURL=RaceList.js.map