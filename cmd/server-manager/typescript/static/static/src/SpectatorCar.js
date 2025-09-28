"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectatorCar = void 0;
class SpectatorCar {
    constructor() {
        this.$spectatorToggle = $(".spectator-toggle");
        if (!this.$spectatorToggle.length) {
            return;
        }
        this.$spectatorToggle.on('switchChange.bootstrapSwitch', () => { this.toggleSpectatorOptions(); });
        this.toggleSpectatorOptions();
    }
    toggleSpectatorOptions() {
        if (this.$spectatorToggle.bootstrapSwitch('state')) {
            $(".visible-spectator-enabled").show();
        }
        else {
            $(".visible-spectator-enabled").hide();
        }
    }
}
exports.SpectatorCar = SpectatorCar;
//# sourceMappingURL=SpectatorCar.js.map