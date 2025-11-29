"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaceWeekend = void 0;
const jsplumb_1 = require("jsplumb");
const dagre_1 = __importStar(require("dagre"));
const manager_1 = require("./javascript/manager");
var RaceWeekend;
(function (RaceWeekend) {
    class EditSession {
        constructor() {
            this.$raceWeekendSession = $("#race-weekend-session");
            if (!this.$raceWeekendSession.length) {
                return;
            }
            this.initSessionTypeSwitch();
            (0, manager_1.initMultiSelect)($("#ParentSessions"));
        }
        initSessionTypeSwitch() {
            const $sessionSwitcher = this.$raceWeekendSession.find("#SessionType");
            if (!IsEditing) {
                this.handleSessionPoints($sessionSwitcher.val());
            }
            $sessionSwitcher.on("change", (e) => {
                const val = $(e.currentTarget).val();
                this.$raceWeekendSession.find(".sessions .tab-pane").removeClass(["show", "active"]);
                const $newSession = this.$raceWeekendSession.find("#session-" + val);
                $newSession.addClass(["show", "active"]);
                $newSession.find(".session-details").show();
                this.$raceWeekendSession.find(".session-enabler").prop("checked", false);
                this.$raceWeekendSession.find("#" + val + "\\.Enabled").prop("checked", true);
                this.handleSessionPoints(val);
            });
        }
        handleSessionPoints(sessionType) {
            if (sessionType !== "Race") {
                $(".init-empty-non-race").val(0);
            }
            else {
                $(".init-empty-non-race").each((index, elem) => {
                    let $elem = $(elem);
                    $elem.val($elem.data("default-value"));
                });
                $("#Race\\.WaitTime").val(300);
            }
        }
    }
    RaceWeekend.EditSession = EditSession;
    class View {
        constructor() {
            this.jsp = jsplumb_1.jsPlumb.getInstance();
            this.jsp.bind("ready", () => {
                this.initJsPlumb();
            });
            $(".view-results").on("click", this.onViewResultsClick);
            $(".manage-entrylist").on("click", this.openManageEntryListModal);
            this.initSessionDetailsButtons();
        }
        initJsPlumb() {
            this.jsp.importDefaults({
                ConnectionsDetachable: false,
                ReattachConnections: false,
            });
            $(".race-weekend-session").each((index, element) => {
                const $session = $(element);
                this.jsp.draggable(element, { grid: [5, 5] });
                const parentIDsJSON = $session.data("parent-ids");
                if (parentIDsJSON) {
                    const parentIDs = JSON.parse(parentIDsJSON);
                    for (let parentID of parentIDs) {
                        let conn = this.jsp.connect({
                            source: parentID,
                            target: $session.attr("id"),
                            anchor: "AutoDefault",
                            endpoint: ["Blank", { width: 10, height: 10 }],
                            connector: ["Flowchart", { cornerRadius: 10 }],
                            cssClass: "race-weekend-connector",
                        });
                        if (conn) {
                            conn.addOverlay(["PlainArrow", {
                                    width: 20,
                                    height: 20,
                                    id: "arrow",
                                    cssClass: "race-weekend-arrow"
                                }]);
                        }
                    }
                }
            });
            this.jsp.bind("click", (conn, originalEvent) => {
                const [ep1, ep2] = conn.endpoints;
                let session1ID = $(ep1.getElement()).attr("id");
                let session2ID = $(ep2.getElement()).attr("id");
                this.openManageFilterModal(session1ID, session2ID);
            });
            const g = new dagre_1.graphlib.Graph();
            g.setGraph({
                nodesep: 550,
            });
            g.setDefaultEdgeLabel(function () {
                return {};
            });
            $('.race-weekend-session').each((idx, node) => {
                const n = $(node);
                g.setNode(n.attr('id'), {
                    width: Math.round(n.width()),
                    height: Math.round(n.height())
                });
            });
            for (const edge of this.jsp.getAllConnections()) {
                g.setEdge(edge.source.id, edge.target.id);
            }
            dagre_1.default.layout(g);
            $("#race-weekend-graph-container").css({
                "height": (g.graph().height + 200) + "px",
                "width": (g.graph().width + 350) + "px",
            });
            g.nodes().forEach((n) => {
                let $n = $('#' + n);
                $n.css('left', g.node(n).x + 'px');
                $n.css('top', g.node(n).y + 'px');
            });
            this.jsp.repaintEverything();
        }
        openManageFilterModal(session1ID, session2ID) {
            const modalContentURL = `/race-weekend/${RaceWeekendID}/filters?parentSessionID=${session1ID}&childSessionID=${session2ID}`;
            $.get(modalContentURL).then((data) => {
                let $filtersModal = $("#filters-modal");
                $filtersModal.html(data);
                $filtersModal.find("input[type='checkbox']").bootstrapSwitch();
                $filtersModal.modal();
                new SessionTransition($filtersModal, session1ID, session2ID);
            });
        }
        openManageEntryListModal(e) {
            e.preventDefault();
            const sessionID = $(e.currentTarget).closest(".race-weekend-session").attr("id");
            const modalContentURL = `/race-weekend/${RaceWeekendID}/entrylist?sessionID=${sessionID}`;
            $.get(modalContentURL).then((data) => {
                let $filtersModal = $("#filters-modal");
                $filtersModal.html(data);
                $filtersModal.find("input[type='checkbox']").bootstrapSwitch();
                $filtersModal.modal();
                new EntryListPreview($filtersModal, sessionID);
            });
        }
        onViewResultsClick(e) {
            e.preventDefault();
            let $raceWeekendSession = $(this).closest(".race-weekend-session");
            let sessionID = $raceWeekendSession.attr("id");
            let $results = $("#results-" + sessionID);
            $('html, body').animate({
                scrollTop: ($("#race-weekend-results").offset().top) - 200,
            }, 500, () => {
                $results.collapse('show');
            });
        }
        initSessionDetailsButtons() {
            $(document).on("click", ".race-weekend-session-details", (e) => {
                let $this = $(e.currentTarget);
                let sessionID = $this.attr("data-session-id");
                const modalContentURL = `/event-details?raceWeekendID=${RaceWeekendID}&sessionID=${sessionID}`;
                $.get(modalContentURL).then((data) => {
                    let $eventDetailsModal = $("#session-details-modal");
                    $eventDetailsModal.html(data);
                    $eventDetailsModal.find("input[type='checkbox']").bootstrapSwitch();
                    $eventDetailsModal.modal();
                });
                return false;
            });
        }
    }
    RaceWeekend.View = View;
    class PreviewModal {
        constructor($elem) {
            this.$elem = $elem;
        }
        registerEvents() {
            this.$elem.find("input, select").on("change", () => {
                this.updateValues();
            });
            this.$elem.find("input").on("switchChange.bootstrapSwitch", () => {
                this.updateValues();
            });
            this.$elem.find("#save-filters").on("click", () => {
                this.saveValues();
            });
        }
        buildTableDataForEntrant(entrant, pos) {
            let $td = $("<td>");
            if (entrant.Class) {
                $td.css({ "background-color": entrant.ClassColor, "color": "white" });
            }
            if (pos !== undefined) {
                $td.text(`${pos + 1}. ${entrant.Name}`);
            }
            else {
                $td.text(entrant.Name);
            }
            return $td;
        }
        buildClassKey(classes) {
            let $tableKey = $("#table-key");
            $tableKey.empty();
            if (Object.entries(classes).length > 1) {
                for (const [className, classColor] of Object.entries(classes)) {
                    let $colorBlock = $("<div>").attr({
                        "class": "class-key__background",
                    }).css("background-color", classColor);
                    let $colorText = $("<div>").attr({ "class": "class-key__name" }).text(className);
                    $tableKey.append($("<div>").attr({ "class": "class-key" }).append($colorBlock, $colorText));
                }
            }
        }
    }
    let SplitType;
    (function (SplitType) {
        SplitType["Numeric"] = "Numeric";
        SplitType["ManualDriverSelection"] = "Manual Driver Selection";
        SplitType["ChampionshipClass"] = "Championship Class";
    })(SplitType || (SplitType = {}));
    class SessionTransition extends PreviewModal {
        constructor($elem, parentSessionID, childSessionID) {
            super($elem);
            this.reverseGrid = 0;
            this.availableResultsForSorting = [];
            this.startOnFastestLapTyre = false;
            this.splitType = SplitType.Numeric;
            this.selectedDriverGUIDs = [];
            this.SelectedChampionshipClassIDs = {};
            this.parentSessionID = parentSessionID;
            this.childSessionID = childSessionID;
            this.updateValues();
            this.registerEvents();
        }
        packageValues() {
            return JSON.stringify({
                ResultStart: this.resultStart,
                ResultEnd: this.resultEnd,
                NumEntrantsToReverse: this.reverseGrid,
                EntryListStart: this.gridStart,
                SortType: this.sortType,
                ForceUseTyreFromFastestLap: this.startOnFastestLapTyre,
                AvailableResultsForSorting: this.availableResultsForSorting,
                SplitType: this.splitType,
                SelectedDriverGUIDs: this.selectedDriverGUIDs,
                SelectedChampionshipClassIDs: this.SelectedChampionshipClassIDs,
            });
        }
        updateValues() {
            this.resultStart = parseInt(this.$elem.find("#ResultsStart").val());
            this.resultEnd = parseInt(this.$elem.find("#ResultsEnd").val());
            this.reverseGrid = parseInt(this.$elem.find("#ReverseGrid").val());
            this.gridStart = parseInt(this.$elem.find("#GridStart").val());
            this.sortType = this.$elem.find("#ResultsSort").val();
            this.availableResultsForSorting = this.$elem.find("#AvailableResults").val();
            this.startOnFastestLapTyre = this.$elem.find("#ForceUseTyreFromFastestLap").is(":checked");
            if (this.sortType == "fastest_multi_results_lap" || this.sortType == "number_multi_results_lap") {
                this.$elem.find("#AvailableResultsWrapper").show();
            }
            else {
                this.$elem.find("#AvailableResultsWrapper").hide();
            }
            let $driversMultiSelect = this.$elem.find("#Drivers");
            let $classesMultiSelect = this.$elem.find("#Classes");
            this.splitType = this.$elem.find("#SplitType").val();
            this.selectedDriverGUIDs = $driversMultiSelect.val();
            this.SelectedChampionshipClassIDs = {};
            for (let classID of $classesMultiSelect.val()) {
                this.SelectedChampionshipClassIDs[classID] = true;
            }
            switch (this.splitType) {
                case SplitType.Numeric:
                    this.$elem.find("#DriverSelectionForm").hide();
                    this.$elem.find("#ClassSelectionForm").hide();
                    this.$elem.find("#FilterFromTo").show();
                    break;
                case SplitType.ManualDriverSelection:
                    this.$elem.find("#DriverSelectionForm").show();
                    this.$elem.find("#ClassSelectionForm").hide();
                    this.$elem.find("#FilterFromTo").hide();
                    (0, manager_1.initMultiSelect)($driversMultiSelect);
                    break;
                case SplitType.ChampionshipClass:
                    this.$elem.find("#DriverSelectionForm").hide();
                    this.$elem.find("#FilterFromTo").hide();
                    this.$elem.find("#ClassSelectionForm").show();
                    (0, manager_1.initMultiSelect)($classesMultiSelect);
                    break;
            }
            $.ajax(`/race-weekend/${RaceWeekendID}/grid-preview?parentSessionID=${this.parentSessionID}&childSessionID=${this.childSessionID}`, {
                data: this.packageValues(),
                contentType: "application/json",
                type: "POST",
            }).then((response) => {
                let results = [];
                let grid = [];
                for (const [key, value] of Object.entries(response.Results)) {
                    results.push(value);
                }
                for (const [key, value] of Object.entries(response.Grid)) {
                    grid.push(value);
                }
                let $table = $("table#grid-preview");
                $table.find("tr:not(:first-child)").remove();
                this.buildClassKey(response.Classes);
                for (let i = 0; i < Math.max(grid.length, results.length); i++) {
                    let $row = $("<tr>");
                    if (i < results.length) {
                        $row.append(this.buildTableDataForEntrant(results[i], i));
                    }
                    else {
                        $row.append($("<td>"));
                    }
                    if (i < grid.length) {
                        $row.append(this.buildTableDataForEntrant(grid[i], i));
                    }
                    else {
                        $row.append($("<td>"));
                    }
                    $table.append($row);
                }
            });
        }
        saveValues() {
            $.ajax(`/race-weekend/${RaceWeekendID}/update-grid?parentSessionID=${this.parentSessionID}&childSessionID=${this.childSessionID}`, {
                data: this.packageValues(),
                contentType: "application/json",
                type: "POST",
            }).then(() => {
                $("#filters-modal").modal("hide");
            });
        }
    }
    class EntryListPreview extends PreviewModal {
        constructor($elem, sessionID) {
            super($elem);
            this.sortType = "";
            this.reverseGrid = 0;
            this.sessionID = sessionID;
            this.updateValues();
            this.registerEvents();
        }
        updateValues() {
            this.sortType = this.$elem.find("#SortType").val();
            this.reverseGrid = parseInt(this.$elem.find("#ReverseGrid").val());
            $.ajax(`/race-weekend/${RaceWeekendID}/entrylist-preview?sessionID=${this.sessionID}&sortType=${this.sortType}&reverseGrid=${this.reverseGrid}`, {
                type: "GET",
            }).then((response) => {
                let grid = [];
                for (const [key, value] of Object.entries(response.Grid)) {
                    grid.push(value);
                }
                let $table = $("table#entrylist-preview");
                $table.find("tr:not(:first-child)").remove();
                this.buildClassKey(response.Classes);
                for (let i = 0; i < grid.length; i++) {
                    let $row = $("<tr>");
                    let $pos = $("<td>").text(i + 1);
                    if (grid[i].Class) {
                        $pos.css({ "background-color": grid[i].ClassColor, "color": "white" });
                    }
                    $row.append($pos);
                    $row.append(this.buildTableDataForEntrant(grid[i]));
                    $table.append($row);
                }
            });
        }
        saveValues() {
            $.ajax(`/race-weekend/${RaceWeekendID}/update-entrylist?sessionID=${this.sessionID}&sortType=${this.sortType}&reverseGrid=${this.reverseGrid}`, {
                type: "GET",
            }).then(() => {
                $("#filters-modal").modal("hide");
            });
        }
    }
})(RaceWeekend = exports.RaceWeekend || (exports.RaceWeekend = {}));
//# sourceMappingURL=RaceWeekend.js.map