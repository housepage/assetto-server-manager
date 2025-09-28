"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarDetail = void 0;
const SummernoteWrapper_1 = require("./forms/SummernoteWrapper");
class CarDetail {
    constructor() {
        if (!$(".car-details").length) {
            return;
        }
        $(".car-image").on("click", CarDetail.onCarSkinClick);
        CarDetail.fixCarImageHeights();
        $(window).on("resize", CarDetail.fixCarImageHeights);
        CarDetail.initSummerNote();
        CarDetail.initSkinUpload();
    }
    static onCarSkinClick(e) {
        const $currentTarget = $(e.currentTarget);
        $("#hero-skin").attr({
            "src": $currentTarget.attr("src"),
            "alt": $currentTarget.attr("alt"),
        });
        $("select[name='skin-delete']").val($currentTarget.data("skin"));
    }
    static fixCarImageHeights() {
        $(".car-skins").height($("#hero-skin").height());
    }
    static initSummerNote() {
        let $summerNote = $("#summernote");
        let $carNotes = $("#CarNotes");
        let html = "";
        if ($carNotes.length > 0) {
            html = $carNotes.html();
        }
        let wrapper = new SummernoteWrapper_1.SummernoteWrapper($summerNote, {
            placeholder: 'You can use this text input to attach notes to each car!',
            tabsize: 2,
            height: 200,
        }, html);
        wrapper.render();
    }
    static initSkinUpload() {
        $("#input-folder-skin").on("change", () => {
            $("#upload-skin").show();
        });
        $("#skin-upload").on("submit", () => {
            const chooseFilesButton = $("#input-folder-skin").get(0);
            if (!chooseFilesButton.files) {
                return false;
            }
            let list = new DataTransfer();
            for (let file of chooseFilesButton.files) {
                if (file.name === "livery.png" || file.name === "preview.jpg" || file.name === "ui_skin.json") {
                    list.items.add(file);
                }
            }
            chooseFilesButton.files = list.files;
            return true;
        });
    }
}
exports.CarDetail = CarDetail;
//# sourceMappingURL=CarDetail.js.map