"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaceControl = void 0;
const RaceControl_1 = require("./models/RaceControl");
const UDP_1 = require("./models/UDP");
const randomColor_1 = require("randomcolor/randomColor");
const utils_1 = require("./utils");
const moment_1 = __importDefault(require("moment"));
const reconnecting_websocket_1 = __importDefault(require("reconnecting-websocket"));
const EventCollisionWithCar = 10, EventCollisionWithEnv = 11, EventNewSession = 50, EventNewConnection = 51, EventConnectionClosed = 52, EventCarUpdate = 53, EventCarInfo = 54, EventEndSession = 55, EventVersion = 56, EventChat = 57, EventClientLoaded = 58, EventSessionInfo = 59, EventError = 60, EventLapCompleted = 73, EventClientEvent = 130, EventRaceControl = 200;
class RaceControl {
    constructor() {
        this.liveMap = new LiveMap(this);
        this.liveTimings = new LiveTimings(this, this.liveMap);
        this.firstLoad = true;
        this.track = "";
        this.trackLayout = "";
        this.$eventTitle = $("#event-title");
        this.status = new RaceControl_1.RaceControl();
        if (!this.$eventTitle.length) {
            return;
        }
        let ws = new reconnecting_websocket_1.default(((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + "/api/race-control", [], {
            minReconnectionDelay: 0,
        });
        ws.onmessage = this.handleWebsocketMessage.bind(this);
        $(window).on('beforeunload', () => {
            ws.close();
        });
        this.handleIFrames();
        setInterval(this.showEventCompletion.bind(this), 1000);
        this.$eventTitle.on("click", function (e) {
            e.preventDefault();
        });
    }
    handleWebsocketMessage(ev) {
        let message = JSON.parse(ev.data);
        if (!message) {
            return;
        }
        switch (message.EventType) {
            case EventVersion:
                location.reload();
                return;
            case EventRaceControl:
                this.status = new RaceControl_1.RaceControl(message.Message);
                if (this.status.SessionInfo.Track !== this.track || this.status.SessionInfo.TrackConfig !== this.trackLayout) {
                    this.track = this.status.SessionInfo.Track;
                    this.trackLayout = this.status.SessionInfo.TrackConfig;
                    this.liveMap.onTrackChange(this.track, this.trackLayout);
                    this.liveTimings.onTrackChange(this.track, this.trackLayout);
                    this.onTrackChange(this.track, this.trackLayout);
                }
                this.$eventTitle.text(RaceControl.getSessionType(this.status.SessionInfo.Type) + " at " + this.status.TrackInfo.name);
                $("#track-location").text(this.status.TrackInfo.city + ", " + this.status.TrackInfo.country);
                this.buildSessionInfo();
                if (this.firstLoad) {
                    this.showTrackWeatherImage();
                }
                this.firstLoad = false;
                break;
            case EventNewSession:
                this.showTrackWeatherImage();
                break;
            case EventChat:
                let $chatContainer = $("#chat-container");
                let chatMessage = $(".chat-message-template").first().clone();
                let chatMessageSender = $("<span>");
                let dt = new Date(message.Message.Time);
                let minutes = dt.getMinutes();
                let minutesString = "";
                let hours = dt.getHours();
                let hoursString = "";
                if (minutes < 10) {
                    minutesString = "0" + minutes;
                }
                else {
                    minutesString = minutes.toLocaleString();
                }
                if (hours < 10) {
                    hoursString = "0" + hours;
                }
                else {
                    hoursString = hours.toLocaleString();
                }
                chatMessageSender.attr("style", "color: " + randomColorForDriver(message.Message.DriverGUID)).text(hoursString + ":" + minutesString + " " + message.Message.DriverName + ": ");
                chatMessage.text(message.Message.Message);
                chatMessage.addClass("chat-message");
                chatMessageSender.addClass("chat-message-sender");
                $chatContainer.append(chatMessageSender);
                $chatContainer.append(chatMessage);
                if ($chatContainer.find(".chat-message").length > 50) {
                    $chatContainer.find(".chat-message").first().remove();
                    $chatContainer.find(".chat-message-sender").first().remove();
                }
                $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
                break;
        }
        this.liveMap.handleWebsocketMessage(message);
        this.liveTimings.handleWebsocketMessage(message);
    }
    static getSessionType(sessionIndex) {
        switch (sessionIndex) {
            case 0:
                return "Booking";
            case 1:
                return "Practice";
            case 2:
                return "Qualifying";
            case 3:
                return "Race";
            default:
                return "Unknown session";
        }
    }
    showEventCompletion() {
        let timeRemaining = "";
        if (this.status.SessionInfo.Time > 0) {
            let timeInMS = (this.status.SessionInfo.Time * 60 * 1000) + (this.status.SessionInfo.WaitTime / 126.166667 * 1000) - moment_1.default.duration((0, moment_1.default)().utc().diff((0, moment_1.default)(this.status.SessionStartTime).utc())).asMilliseconds();
            let days = Math.floor(timeInMS / 8.64e+7);
            timeRemaining = (0, utils_1.msToTime)(timeInMS, false, false);
            if (days > 0) {
                let dayText = " day + ";
                if (days > 1) {
                    dayText = " days + ";
                }
                timeRemaining = days + dayText + timeRemaining;
            }
        }
        else if (this.status.SessionInfo.Laps > 0) {
            let lapsCompleted = 0;
            if (this.status.ConnectedDrivers && this.status.ConnectedDrivers.GUIDsInPositionalOrder.length > 0) {
                let driver = this.status.ConnectedDrivers.Drivers[this.status.ConnectedDrivers.GUIDsInPositionalOrder[0]];
                if (driver.TotalNumLaps > 0) {
                    lapsCompleted = driver.TotalNumLaps;
                }
            }
            timeRemaining = this.status.SessionInfo.Laps - lapsCompleted + " laps remaining";
        }
        let $raceTime = $("#race-time");
        $raceTime.text(timeRemaining);
    }
    onTrackChange(track, layout) {
        $("#trackImage").attr("src", this.getTrackImageURL());
        $("#track-description").text(this.status.TrackInfo.description);
        $("#track-length").text(this.status.TrackInfo["length"]);
        $("#track-pitboxes").text(this.status.TrackInfo.pitboxes);
        $("#track-width").text(this.status.TrackInfo.width);
        $("#track-run").text(this.status.TrackInfo.run);
    }
    buildSessionInfo() {
        let $roadTempWrapper = $("#road-temp-wrapper");
        $roadTempWrapper.attr("style", "background-color: " + getColorForPercentage(this.status.SessionInfo.RoadTemp / 40));
        $roadTempWrapper.attr("data-original-title", "Road Temp: " + this.status.SessionInfo.RoadTemp + "°C");
        let $roadTempText = $("#road-temp-text");
        $roadTempText.text(this.status.SessionInfo.RoadTemp + "°C");
        let $ambientTempWrapper = $("#ambient-temp-wrapper");
        $ambientTempWrapper.attr("style", "background-color: " + getColorForPercentage(this.status.SessionInfo.AmbientTemp / 40));
        $ambientTempWrapper.attr("data-original-title", "Ambient Temp: " + this.status.SessionInfo.AmbientTemp + "°C");
        let $ambientTempText = $("#ambient-temp-text");
        $ambientTempText.text(this.status.SessionInfo.AmbientTemp + "°C");
        $("#event-name").text(this.status.SessionInfo.Name);
        $("#event-type").text(RaceControl.getSessionType(this.status.SessionInfo.Type));
    }
    showTrackWeatherImage() {
        let $currentWeather = $("#weatherImage");
        let pathCorrected = this.status.SessionInfo.WeatherGraphics.split("_");
        for (let i = 0; i < pathCorrected.length; i++) {
            if (pathCorrected[i].indexOf("type=") !== -1) {
                pathCorrected.splice(i);
                break;
            }
        }
        let pathFinal = pathCorrected.join("_");
        $.get("/content/weather/" + pathFinal + "/preview.jpg").done(function () {
            $currentWeather.attr("src", "/content/weather/" + pathFinal + "/preview.jpg").show();
        }).fail(function () {
            $currentWeather.hide();
        });
        $currentWeather.attr("alt", "Current Weather: " + (0, utils_1.prettifyName)(this.status.SessionInfo.WeatherGraphics, false));
    }
    getTrackImageURL() {
        if (!this.status) {
            return "";
        }
        const sessionInfo = this.status.SessionInfo;
        return "/content/tracks/" + sessionInfo.Track + "/ui" + (!!sessionInfo.TrackConfig ? "/" + sessionInfo.TrackConfig : "") + "/preview.png";
    }
    handleIFrames() {
        const $document = $(document);
        $document.on("change", ".live-frame-link", function (e) {
            let $this = $(e.currentTarget);
            let value = $this.val();
            if (value) {
                let $liveTimingFrame = $this.closest(".live-frame-wrapper").find(".live-frame");
                $this.closest(".live-frame-wrapper").find(".embed-responsive").attr("class", "embed-responsive embed-responsive-16by9");
                if (value.startsWith('<iframe')) {
                    let res = value.split('"');
                    for (let i = 0; i < res.length; i++) {
                        if (res[i] === " src=") {
                            if (res[i + 1]) {
                                $liveTimingFrame.attr("src", res[i + 1]);
                            }
                            $this.val(res[i + 1]);
                        }
                    }
                }
                else {
                    $liveTimingFrame.attr("src", value);
                }
            }
        });
        $document.on("click", ".remove-live-frame", function (e) {
            $(e.currentTarget).closest(".live-frame-wrapper").remove();
        });
        $document.find("#add-live-frame").click(function () {
            let $copy = $document.find(".live-frame-wrapper").first().clone();
            $copy.removeClass("d-none");
            $copy.find(".embed-responsive").attr("class", "d-none embed-responsive embed-responsive-16by9");
            $copy.find(".frame-input").removeClass("ml-0");
            $document.find(".live-frame-wrapper").last().after($copy);
        });
    }
}
exports.RaceControl = RaceControl;
class LiveMap {
    constructor(raceControl) {
        this.mapImageHasLoaded = false;
        this.mapScaleMultiplier = 1;
        this.trackScale = 1;
        this.trackMargin = 0;
        this.trackXOffset = 0;
        this.trackZOffset = 0;
        this.dots = new Map();
        this.maxRPMs = new Map();
        this.$map = $("#map");
        this.raceControl = raceControl;
        this.$trackMapImage = this.$map.find("img");
        $(window).on("resize", this.correctMapDimensions.bind(this));
    }
    handleWebsocketMessage(message) {
        switch (message.EventType) {
            case EventRaceControl:
                this.trackXOffset = this.raceControl.status.TrackMapData.offset_x;
                this.trackZOffset = this.raceControl.status.TrackMapData.offset_y;
                this.trackScale = this.raceControl.status.TrackMapData.scale_factor;
                for (const connectedGUID in this.raceControl.status.ConnectedDrivers.Drivers) {
                    const driver = this.raceControl.status.ConnectedDrivers.Drivers[connectedGUID];
                    if (!this.dots.has(driver.CarInfo.DriverGUID)) {
                        let $driverDot = this.buildDriverDot(driver.CarInfo, driver.LastPos).show();
                        this.dots.set(driver.CarInfo.DriverGUID, $driverDot);
                    }
                }
                $(".dot").css({ "transition": this.raceControl.status.CurrentRealtimePosInterval + "ms linear" });
                break;
            case EventNewConnection:
                const connectedDriver = new RaceControl_1.RaceControlDriverMapRaceControlDriverSessionCarInfo(message.Message);
                this.dots.set(connectedDriver.DriverGUID, this.buildDriverDot(connectedDriver));
                break;
            case EventClientLoaded:
                let carID = message.Message;
                if (!this.raceControl.status.CarIDToGUID.hasOwnProperty(carID)) {
                    return;
                }
                this.dots.get(this.raceControl.status.CarIDToGUID[carID]).show();
                break;
            case EventConnectionClosed:
                const disconnectedDriver = new RaceControl_1.RaceControlDriverMapRaceControlDriverSessionCarInfo(message.Message);
                const $dot = this.dots.get(disconnectedDriver.DriverGUID);
                if ($dot) {
                    $dot.hide();
                    this.dots.delete(disconnectedDriver.DriverGUID);
                }
                break;
            case EventCarUpdate:
                const update = new UDP_1.CarUpdate(message.Message);
                if (!this.raceControl.status.CarIDToGUID.hasOwnProperty(update.CarID)) {
                    return;
                }
                const driverGUID = this.raceControl.status.CarIDToGUID[update.CarID];
                let $myDot = this.dots.get(driverGUID);
                let dotPos = this.translateToTrackCoordinate(update.Pos);
                $myDot.css({
                    "left": dotPos.X,
                    "top": dotPos.Z,
                });
                let speed = Math.floor(Math.sqrt((Math.pow(update.Velocity.X, 2) + Math.pow(update.Velocity.Z, 2))) * 3.6);
                let speedUnits = "Km/h ";
                if (useMPH) {
                    speed = Math.floor(speed * 0.621371);
                    speedUnits = "MPH ";
                }
                let maxRPM = this.maxRPMs.get(driverGUID);
                if (!maxRPM) {
                    maxRPM = 0;
                }
                if (update.EngineRPM > maxRPM) {
                    maxRPM = update.EngineRPM;
                    this.maxRPMs.set(driverGUID, update.EngineRPM);
                }
                let $rpmGaugeOuter = $("<div class='rpm-outer'></div>");
                let $rpmGaugeInner = $("<div class='rpm-inner'></div>");
                $rpmGaugeInner.css({
                    'width': ((update.EngineRPM / maxRPM) * 100).toFixed(0) + "%",
                    'background': randomColorForDriver(driverGUID),
                });
                $rpmGaugeOuter.append($rpmGaugeInner);
                $myDot.find(".info").text(speed + speedUnits + (update.Gear - 1));
                $myDot.find(".info").append($rpmGaugeOuter);
                break;
            case EventNewSession:
                this.loadTrackMapImage();
                break;
            case EventCollisionWithCar:
            case EventCollisionWithEnv:
                let collisionData = message.Message;
                let collisionMapPoint = this.translateToTrackCoordinate(collisionData.WorldPos);
                let $collision = $("<div class='collision' />").css({
                    'left': collisionMapPoint.X,
                    'top': collisionMapPoint.Z,
                });
                $collision.appendTo(this.$map);
                break;
        }
    }
    onTrackChange(track, trackLayout) {
        this.loadTrackMapImage();
    }
    translateToTrackCoordinate(vec) {
        const out = new UDP_1.CarUpdateVec();
        out.X = ((vec.X + this.trackXOffset + this.trackMargin) / this.trackScale) * this.mapScaleMultiplier;
        out.Z = ((vec.Z + this.trackZOffset + this.trackMargin) / this.trackScale) * this.mapScaleMultiplier;
        return out;
    }
    buildDriverDot(driverData, lastPos) {
        if (this.dots.has(driverData.DriverGUID)) {
            return this.dots.get(driverData.DriverGUID);
        }
        const $driverName = $("<span class='name'/>").text(driverData.DriverInitials);
        const $info = $("<span class='info'/>").text("0").hide();
        const $dot = $("<div class='dot' style='background: " + randomColorForDriver(driverData.DriverGUID) + "'/>").append($driverName, $info).hide().appendTo(this.$map);
        if (lastPos !== undefined) {
            let dotPos = this.translateToTrackCoordinate(lastPos);
            $dot.css({
                "left": dotPos.X,
                "top": dotPos.Z,
            });
        }
        this.dots.set(driverData.DriverGUID, $dot);
        return $dot;
    }
    getTrackMapURL() {
        if (!this.raceControl.status) {
            return "";
        }
        const sessionInfo = this.raceControl.status.SessionInfo;
        return "/content/tracks/" + sessionInfo.Track + (!!sessionInfo.TrackConfig ? "/" + sessionInfo.TrackConfig : "") + "/map.png";
    }
    loadTrackMapImage() {
        const trackURL = this.getTrackMapURL();
        let that = this;
        this.$trackMapImage.on("load", function () {
            that.mapImageHasLoaded = true;
            that.correctMapDimensions();
        });
        this.$trackMapImage.attr({ "src": trackURL });
    }
    correctMapDimensions() {
        if (!this.$trackMapImage || !this.mapImageHasLoaded) {
            return;
        }
        if (this.$trackMapImage.height() / this.$trackMapImage.width() > LiveMap.mapRotationRatio) {
            this.$map.addClass("rotated");
            this.$trackMapImage.css({
                'max-height': this.$trackMapImage.closest(".map-container").width(),
                'max-width': 'auto'
            });
            this.mapScaleMultiplier = this.$trackMapImage.width() / this.raceControl.status.TrackMapData.width;
            this.$map.closest(".map-container").css({
                'max-height': (this.raceControl.status.TrackMapData.width * this.mapScaleMultiplier) + 20,
            });
            this.$map.css({
                'max-width': (this.raceControl.status.TrackMapData.width * this.mapScaleMultiplier) + 20,
            });
        }
        else {
            this.$map.removeClass("rotated").css({
                'max-height': 'inherit',
                'max-width': '100%',
            });
            this.$map.closest(".map-container").css({
                'max-height': 'auto',
            });
            this.$trackMapImage.css({
                'max-height': 'inherit',
                'max-width': '100%'
            });
            this.mapScaleMultiplier = this.$trackMapImage.width() / this.raceControl.status.TrackMapData.width;
        }
    }
    getDotForDriverGUID(guid) {
        return this.dots.get(guid);
    }
}
LiveMap.mapRotationRatio = 1.07;
const DriverGUIDDataKey = "driver-guid";
var SessionType;
(function (SessionType) {
    SessionType[SessionType["Race"] = 3] = "Race";
    SessionType[SessionType["Qualifying"] = 2] = "Qualifying";
    SessionType[SessionType["Practice"] = 1] = "Practice";
    SessionType[SessionType["Booking"] = 0] = "Booking";
})(SessionType || (SessionType = {}));
var Collision;
(function (Collision) {
    Collision["WithCar"] = "with other car";
    Collision["WithEnvironment"] = "with environment";
})(Collision || (Collision = {}));
class LiveTimings {
    constructor(raceControl, liveMap) {
        this.initialisedAdmin = false;
        this.raceControl = raceControl;
        this.liveMap = liveMap;
        this.$connectedDriversTable = $("#live-table");
        this.$disconnectedDriversTable = $("#live-table-disconnected");
        this.$storedTimes = $("#stored-times");
        setInterval(this.populateConnectedDrivers.bind(this), 1000);
        $(document).on("click", ".driver-link", this.toggleDriverSpeed.bind(this));
        $(document).on("click", "#countdown", this.getFromClickEvent.bind(this));
        $(document).on("submit", "#broadcast-chat-form", this.processChatForm.bind(this));
        $(document).on("submit", "#admin-command-form", this.processAdminCommandForm.bind(this));
        $(document).on("submit", "#kick-user-form", this.processKickUserForm.bind(this));
        $(document).on("submit", "#send-chat-form", this.processSendChatForm.bind(this));
    }
    getFromClickEvent(e) {
        e.preventDefault();
        e.stopPropagation();
        const $target = $(e.currentTarget);
        const href = $target.attr("href");
        $.get(href);
    }
    processChatForm(e) {
        this.postForm(e);
        $(".broadcast-chat").val('');
        return false;
    }
    processSendChatForm(e) {
        this.postForm(e);
        $(".send-chat").val('');
        return false;
    }
    processAdminCommandForm(e) {
        this.postForm(e);
        $(".admin-command").val('');
        return false;
    }
    processKickUserForm(e) {
        this.postForm(e);
        return false;
    }
    postForm(e) {
        e.preventDefault();
        e.stopPropagation();
        this.post($(e.currentTarget));
    }
    post(form) {
        $.ajax({
            url: form.attr("action"),
            type: 'post',
            data: form.serialize(),
            success: function () {
            }
        });
    }
    handleWebsocketMessage(message) {
        if (message.EventType === EventRaceControl) {
            this.populateConnectedDrivers();
            this.initialiseAdminSelects();
            this.populateDisconnectedDrivers();
        }
        else if (message.EventType === EventConnectionClosed) {
            const closedConnection = message.Message;
            this.removeDriverFromAdminSelects(closedConnection);
            if (this.raceControl.status.ConnectedDrivers) {
                const driver = this.raceControl.status.ConnectedDrivers.Drivers[closedConnection.DriverGUID];
                if (driver && (driver.LoadedTime.toString() === "0001-01-01T00:00:00Z" || !driver.TotalNumLaps)) {
                    this.$connectedDriversTable.find("tr[data-guid='" + closedConnection.DriverGUID + "']").remove();
                    this.removeDriverFromAdminSelects(driver.CarInfo);
                }
            }
        }
        else if (message.EventType === EventNewConnection) {
            const connectedDriver = new RaceControl_1.RaceControlDriverMapRaceControlDriverSessionCarInfo(message.Message);
            this.addDriverToAdminSelects(connectedDriver);
        }
    }
    onTrackChange(track, trackLayout) {
    }
    populateConnectedDrivers() {
        if (!this.raceControl.status || !this.raceControl.status.ConnectedDrivers) {
            return;
        }
        for (const driverGUID of this.raceControl.status.ConnectedDrivers.GUIDsInPositionalOrder) {
            const driver = this.raceControl.status.ConnectedDrivers.Drivers[driverGUID];
            if (!driver) {
                continue;
            }
            this.addDriverToTable(driver, this.$connectedDriversTable);
            this.populatePreviousLapsForDriver(driver);
        }
    }
    populatePreviousLapsForDriver(driver) {
        for (const carName in driver.Cars) {
            if (carName === driver.CarInfo.CarModel) {
                continue;
            }
            const dummyDriver = JSON.parse(JSON.stringify(driver));
            dummyDriver.CarInfo.CarModel = carName;
            dummyDriver.CarInfo.CarName = driver.Cars[carName].CarName;
            this.addDriverToTable(dummyDriver, this.$disconnectedDriversTable);
        }
    }
    populateDisconnectedDrivers() {
        if (!this.raceControl.status || !this.raceControl.status.DisconnectedDrivers) {
            return;
        }
        for (const driverGUID of this.raceControl.status.DisconnectedDrivers.GUIDsInPositionalOrder) {
            const driver = this.raceControl.status.DisconnectedDrivers.Drivers[driverGUID];
            if (!driver) {
                continue;
            }
            this.addDriverToTable(driver, this.$disconnectedDriversTable);
            this.populatePreviousLapsForDriver(driver);
        }
        if (this.$disconnectedDriversTable.find("tr").length > 1) {
            this.$storedTimes.show();
        }
        else {
            this.$storedTimes.hide();
        }
    }
    newRowForDriver(driver, addingToConnectedTable) {
        const $tr = $(addingToConnectedTable ? LiveTimings.CONNECTED_ROW_HTML : LiveTimings.DISCONNECTED_ROW_HTML);
        $tr.attr({
            "data-guid": driver.CarInfo.DriverGUID,
            "data-car-model": driver.CarInfo.CarModel,
        });
        const $tdName = $tr.find(".driver-name");
        $tdName.text(driver.CarInfo.DriverName);
        if (addingToConnectedTable) {
            const driverDot = this.liveMap.getDotForDriverGUID(driver.CarInfo.DriverGUID);
            if (driverDot) {
                let dotClass = "dot";
                if (driverDot.find(".info").is(":hidden")) {
                    dotClass += " dot-inactive";
                }
                $tdName.prepend($("<div/>").attr({ "class": dotClass }).css("background", (0, randomColor_1.randomColor)({
                    luminosity: 'bright',
                    seed: driver.CarInfo.DriverGUID,
                })));
            }
            $tdName.attr("class", "driver-link");
            $tdName.data(DriverGUIDDataKey, driver.CarInfo.DriverGUID);
        }
        return $tr;
    }
    addDriverToTable(driver, $table) {
        const addingDriverToConnectedTable = ($table === this.$connectedDriversTable);
        const carInfo = driver.Cars[driver.CarInfo.CarModel];
        if (!carInfo) {
            return;
        }
        let $tr = $table.find("[data-guid='" + driver.CarInfo.DriverGUID + "'][data-car-model='" + driver.CarInfo.CarModel + "']");
        let addTrToTable = false;
        if (!$tr.length) {
            addTrToTable = true;
            $tr = this.newRowForDriver(driver, addingDriverToConnectedTable);
        }
        if (addingDriverToConnectedTable) {
            $tr.find(".driver-pos").text(driver.Position === 255 || driver.Position === 0 ? "" : driver.Position);
        }
        $tr.find(".driver-car").text(carInfo.CarName ? carInfo.CarName : (0, utils_1.prettifyName)(driver.CarInfo.CarModel, true));
        if (addingDriverToConnectedTable) {
            let currentLapTimeText = "";
            if ((0, moment_1.default)(carInfo.LastLapCompletedTime).utc().isAfter((0, moment_1.default)(this.raceControl.status.SessionStartTime).utc())) {
                currentLapTimeText = (0, utils_1.msToTime)((0, moment_1.default)().utc().diff((0, moment_1.default)(carInfo.LastLapCompletedTime).utc()), false);
            }
            $tr.find(".current-lap").text(currentLapTimeText);
        }
        if (addingDriverToConnectedTable) {
            $tr.find(".last-lap").text((0, utils_1.msToTime)(carInfo.LastLap / 1000000));
        }
        $tr.find(".best-lap").text((0, utils_1.msToTime)(carInfo.BestLap / 1000000));
        if (addingDriverToConnectedTable) {
            $tr.find(".gap").text(driver.Split);
        }
        $tr.find(".num-laps").text(carInfo.NumLaps ? carInfo.NumLaps : "0");
        let topSpeed;
        let speedUnits;
        if (useMPH) {
            topSpeed = carInfo.TopSpeedBestLap * 0.621371;
            speedUnits = "MPH";
        }
        else {
            topSpeed = carInfo.TopSpeedBestLap;
            speedUnits = "Km/h";
        }
        $tr.find(".top-speed").text(topSpeed ? topSpeed.toFixed(2) + speedUnits : "");
        if (addingDriverToConnectedTable) {
            const $tdEvents = $tr.find(".events");
            const loadedID = driver.CarInfo.DriverGUID + "-loaded";
            if ((0, moment_1.default)(driver.LoadedTime).utc().add("10", "seconds").isSameOrAfter((0, moment_1.default)().utc()) && !$("#" + loadedID).length) {
                let $tag = $("<span/>").attr("id", loadedID);
                $tag.attr({ 'class': 'badge badge-success live-badge' });
                $tag.text("Loaded");
                $tdEvents.append($tag);
                setTimeout(() => {
                    $tag.remove();
                }, 10000);
            }
            if (driver.Collisions) {
                for (const collision of driver.Collisions) {
                    const collisionID = driver.CarInfo.DriverGUID + "-collision-" + collision.ID;
                    if ((0, moment_1.default)(collision.Time).utc().add("10", "seconds").isSameOrAfter((0, moment_1.default)().utc()) && !$("#" + collisionID).length) {
                        let $tag = $("<span/>");
                        $tag.attr("id", collisionID);
                        $tag.attr({ 'class': 'badge badge-danger live-badge' });
                        let crashSpeed;
                        if (useMPH) {
                            crashSpeed = collision.Speed * 0.621371;
                        }
                        else {
                            crashSpeed = collision.Speed;
                        }
                        if (collision.Type === Collision.WithCar) {
                            $tag.text("Crash with " + collision.OtherDriverName + " at " + crashSpeed.toFixed(2) + speedUnits);
                        }
                        else {
                            $tag.text("Crash " + collision.Type + " at " + crashSpeed.toFixed(2) + speedUnits);
                        }
                        $tdEvents.append($tag);
                        setTimeout(() => {
                            $tag.remove();
                        }, 10000);
                    }
                }
            }
        }
        if (!addingDriverToConnectedTable) {
            this.$connectedDriversTable.find("[data-guid='" + driver.CarInfo.DriverGUID + "'][data-car-model='" + driver.CarInfo.CarModel + "']").remove();
        }
        else {
            this.$disconnectedDriversTable.find("[data-guid='" + driver.CarInfo.DriverGUID + "'][data-car-model='" + driver.CarInfo.CarModel + "']").remove();
        }
        if (!addingDriverToConnectedTable && (!carInfo.NumLaps || carInfo.NumLaps === 0)) {
            return;
        }
        if (addTrToTable) {
            $table.append($tr);
        }
        else {
            if (driver.Position > 0 && addingDriverToConnectedTable) {
                $table.find("tr").eq(driver.Position - 1).after($tr.detach());
            }
        }
        if (!addingDriverToConnectedTable) {
            this.sortTable($table);
        }
    }
    sortTable($table) {
        const $tbody = $table.find("tbody");
        const that = this;
        $($tbody.find("tr:not(:nth-child(1))").get().sort(function (a, b) {
            if (that.raceControl.status.SessionInfo.Type == SessionType.Race) {
                let lapsA = parseInt($(a).find("td:nth-child(4)").text(), 10);
                let lapsB = parseInt($(b).find("td:nth-child(4)").text(), 10);
                if (lapsA !== 0 && lapsB !== 0 && lapsA < lapsB) {
                    return 1;
                }
                else if (lapsA === lapsB) {
                    return 0;
                }
                else {
                    return -1;
                }
            }
            else {
                let timeA = $(a).find("td:nth-child(3)").text();
                let timeB = $(b).find("td:nth-child(3)").text();
                if (timeA !== "" && timeB !== "" && timeA < timeB) {
                    return -1;
                }
                else if (timeA === timeB) {
                    return 0;
                }
                else if (timeA === "") {
                    return 1;
                }
                else if (timeB === "") {
                    return -1;
                }
                else {
                    return 1;
                }
            }
        })).appendTo($tbody);
    }
    toggleDriverSpeed(e) {
        const $target = $(e.currentTarget);
        const driverGUID = $target.data(DriverGUIDDataKey);
        const $driverDot = this.liveMap.getDotForDriverGUID(driverGUID);
        if (!$driverDot) {
            return;
        }
        $driverDot.find(".info").toggle();
        $target.find(".dot").toggleClass("dot-inactive");
    }
    initialiseAdminSelects() {
        if (this.initialisedAdmin) {
            return;
        }
        if (!this.raceControl.status || !this.raceControl.status.ConnectedDrivers) {
            return;
        }
        for (const driverGUID of this.raceControl.status.ConnectedDrivers.GUIDsInPositionalOrder) {
            const driver = this.raceControl.status.ConnectedDrivers.Drivers[driverGUID];
            if (!driver) {
                continue;
            }
            this.addDriverToAdminSelects(driver.CarInfo);
        }
        this.initialisedAdmin = true;
    }
    addDriverToAdminSelects(carInfo) {
        $(".kick-user option[value='default-driver-spacer']").remove();
        $(".chat-user option[value='default-driver-spacer']").remove();
        if ($(".kick-user option[value=" + carInfo.DriverGUID + "]").length != 0) {
        }
        else {
            $('.kick-user').append($('<option>', {
                value: carInfo.DriverGUID,
                text: carInfo.DriverName,
            }));
        }
        if ($(".chat-user option[value=" + carInfo.DriverGUID + "]").length != 0) {
        }
        else {
            $('.chat-user').append($('<option>', {
                value: carInfo.DriverGUID,
                text: carInfo.DriverName,
            }));
        }
    }
    removeDriverFromAdminSelects(carInfo) {
        $(".kick-user option[value=" + carInfo.DriverGUID + "]").remove();
        $(".chat-user option[value=" + carInfo.DriverGUID + "]").remove();
    }
}
LiveTimings.CONNECTED_ROW_HTML = `
        <tr class="driver-row">
            <td class="driver-pos text-center"></td>
            <td class="driver-name driver-link"></td>
            <td class="driver-car"></td>
            <td class="current-lap"></td>
            <td class="last-lap"></td>
            <td class="best-lap"></td>
            <td class="gap"></td>
            <td class="num-laps"></td>
            <td class="top-speed"></td>
            <td class="events"></td>
        </tr>
    `;
LiveTimings.DISCONNECTED_ROW_HTML = `
        <tr class="driver-row">
            <td class="driver-name"></td>
            <td class="driver-car"></td>
            <td class="best-lap"></td>
            <td class="num-laps"></td>
            <td class="top-speed"></td>
        </tr>
    `;
function randomColorForDriver(driverGUID) {
    return (0, randomColor_1.randomColor)({
        seed: driverGUID,
    });
}
const percentColors = [
    { pct: 0.25, color: { r: 0x00, g: 0x00, b: 0xff } },
    { pct: 0.625, color: { r: 0x00, g: 0xff, b: 0 } },
    { pct: 1.0, color: { r: 0xff, g: 0x00, b: 0 } }
];
function getColorForPercentage(pct) {
    let i;
    for (i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    let lower = percentColors[i - 1];
    let upper = percentColors[i];
    let range = upper.pct - lower.pct;
    let rangePct = (pct - lower.pct) / range;
    let pctLower = 1 - rangePct;
    let pctUpper = rangePct;
    let color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
}
//# sourceMappingURL=RaceControl.js.map