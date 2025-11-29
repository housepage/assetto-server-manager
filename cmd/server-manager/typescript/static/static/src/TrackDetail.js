"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackDetail = void 0;
const SummernoteWrapper_1 = require("./forms/SummernoteWrapper");
class TrackDetail {
    constructor() {
        if (!$(".track-details").length) {
            return;
        }
        $(".track-image").on("click", TrackDetail.onTrackLayoutClick);
        TrackDetail.fixLayoutImageHeights();
        TrackDetail.initSummerNote();
        $(window).on("resize", TrackDetail.fixLayoutImageHeights);
    }
    static onTrackLayoutClick(e) {
        const $currentTarget = $(e.currentTarget);
        $("#hero-skin").attr({
            "src": $currentTarget.attr("src"),
            "alt": $currentTarget.attr("alt"),
        });
        $("select[name='skin-delete']").val($currentTarget.data("layout"));
    }
    static fixLayoutImageHeights() {
        $(".track-layouts").height($("#hero-skin").height());
    }
    static initSummerNote() {
        let $summerNote = $("#summernote");
        let $trackNotes = $("#TrackNotes");
        let html = "";
        if ($trackNotes.length > 0) {
            html = $trackNotes.html();
        }
        let wrapper = new SummernoteWrapper_1.SummernoteWrapper($summerNote, {
            placeholder: 'You can use this text input to attach notes to each track!',
            tabsize: 2,
            height: 200,
        }, html);
        wrapper.render();
    }
}
exports.TrackDetail = TrackDetail;
//# sourceMappingURL=TrackDetail.js.map