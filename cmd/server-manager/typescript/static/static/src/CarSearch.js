"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarSearch = void 0;
class CarSearch {
    constructor($parent) {
        this.$parent = $parent;
        this.$searchField = $parent.find(".car-search");
        this.$searchButton = $parent.find(".car-search-btn");
        if (!this.$searchField.length) {
            return;
        }
        this.$searchButton.on("click", (e) => {
            e.preventDefault();
            this.doSearch();
        });
        this.$searchField.on("keypress", (e) => {
            if (e.keyCode !== 13) {
                return;
            }
            e.preventDefault();
            this.doSearch();
        });
    }
    doSearch() {
        const searchTerm = this.$searchField.val();
        const $carsSelect = this.$parent.find(".Cars");
        $.getJSON("/cars/search.json?q=" + encodeURIComponent(searchTerm), (data) => {
            $carsSelect.find("option:not(:selected)").remove();
            if (!data) {
                $carsSelect.multiSelect('refresh');
                return;
            }
            for (const car of data) {
                if ($carsSelect.find("option[value='" + car.CarID + "']").length) {
                    continue;
                }
                $carsSelect.append('<option value=' + car.CarID + " class=" + car.Class + ">" + car.CarName + "</option>");
            }
            $carsSelect.multiSelect('refresh');
        });
    }
}
exports.CarSearch = CarSearch;
//# sourceMappingURL=CarSearch.js.map