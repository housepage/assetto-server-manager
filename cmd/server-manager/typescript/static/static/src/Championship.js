"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Championship = void 0;
const dragula_1 = __importDefault(require("dragula"));
var Championship;
(function (Championship) {
    class View {
        constructor() {
            this.initDraggableCards();
            this.initEventDetailsButtons();
            this.initACSRRatingWatcher();
        }
        initDraggableCards() {
            let drake = (0, dragula_1.default)([document.querySelector(".championship-events")], {
                moves: (el, source, handle, sibling) => {
                    if (!CanMoveChampionshipEvents || !handle) {
                        return false;
                    }
                    return $(handle).hasClass("card-header");
                },
            });
            drake.on("drop", () => {
                this.saveChampionshipEventOrder();
            });
        }
        saveChampionshipEventOrder() {
            let championshipEventIDs = [];
            $(".championship-event").each(function () {
                if (!$(this).hasClass("gu-mirror")) {
                    championshipEventIDs.push($(this).attr("id"));
                }
            });
            $.ajax({
                type: "POST",
                url: `/championship/${ChampionshipID}/reorder-events`,
                data: JSON.stringify(championshipEventIDs),
                dataType: "json"
            });
        }
        initEventDetailsButtons() {
            $(document).on("click", ".championship-event-details", (e) => {
                let $this = $(e.currentTarget);
                let eventID = $this.attr("data-event-id");
                const modalContentURL = `/event-details?championshipID=${ChampionshipID}&eventID=${eventID}`;
                $.get(modalContentURL).then((data) => {
                    let $eventDetailsModal = $("#event-details-modal");
                    $eventDetailsModal.html(data);
                    $eventDetailsModal.find("input[type='checkbox']").bootstrapSwitch();
                    $eventDetailsModal.modal();
                });
                return false;
            });
        }
        initACSRRatingWatcher() {
            this.ACSRRatingWatcher();
            $(document).on("input", ".acsrGUID", (e) => {
                this.ACSRRatingWatcher();
            });
        }
        ACSRRatingWatcher() {
            let val = $(".acsrGUID").val();
            if (val != undefined) {
                let valString = val.toString();
                let $registerButton = $("#register-for-championship");
                let $acsrRatingContainer = $("#acsr-rating-container");
                $acsrRatingContainer.empty();
                if (valString.length == 17) {
                    $.ajax({
                        type: "POST",
                        url: `/championship/${ChampionshipID}/${valString}/acsr-rating`,
                        data: "",
                        dataType: "json"
                    }).then((response) => {
                        if (!response.acsr_enabled) {
                            return;
                        }
                        if (response.acsr_driver_rating == null) {
                            let notFoundSpan = $('<span />');
                            let notFoundLink = $(`<a />`);
                            notFoundSpan.addClass("text-warning");
                            notFoundSpan.text("Sorry, we couldn't find an ACSR driver matching that GUID." +
                                " You can sign up for an account ");
                            notFoundLink.attr("href", "https://acsr.assettocorsaservers.com/");
                            notFoundLink.text("here!");
                            notFoundSpan.append(notFoundLink);
                            $acsrRatingContainer.append(notFoundSpan);
                            $registerButton.attr("disabled", "disabled");
                            return;
                        }
                        let skillSpan = $('<span />');
                        let safetySpan = $('<span />');
                        skillSpan.addClass("badge badge-primary acsr-badge--skill mr-1");
                        skillSpan.text(response.acsr_driver_rating.skill_rating_grade);
                        safetySpan.addClass("badge badge-success acsr-badge--safety mr-1");
                        safetySpan.text(response.acsr_driver_rating.safety_rating);
                        $acsrRatingContainer.append(skillSpan);
                        $acsrRatingContainer.append(safetySpan);
                        let metSpan = $('<span />');
                        if (response.gate_met) {
                            metSpan.addClass("text-success");
                            metSpan.text("You meet the requirements!");
                            $registerButton.removeAttr("disabled");
                        }
                        else {
                            metSpan.addClass("text-danger");
                            metSpan.text("Sorry, you don't meet the requirements!");
                            $registerButton.attr("disabled");
                        }
                        $acsrRatingContainer.append(metSpan);
                    });
                }
                else {
                    let incorrectGUIDSpan = $('<span />');
                    let incorrectGUIDLink = $(`<a />`);
                    incorrectGUIDSpan.addClass("text-warning");
                    incorrectGUIDSpan.text("It looks like your Steam GUID is not formatted correctly! Please enter " +
                        "your full GUID above now. You can find your GUID (steamID64) ");
                    incorrectGUIDLink.attr("href", "https://steamid.io/lookup");
                    incorrectGUIDLink.text("here!");
                    incorrectGUIDSpan.append(incorrectGUIDLink);
                    $acsrRatingContainer.append(incorrectGUIDSpan);
                    $registerButton.attr("disabled", "disabled");
                }
            }
        }
    }
    Championship.View = View;
})(Championship = exports.Championship || (exports.Championship = {}));
//# sourceMappingURL=Championship.js.map