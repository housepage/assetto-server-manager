"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToObject = exports.FromArray = exports.ParseNumber = exports.ParseDate = exports.RaceControl = exports.RaceControlDriverMap = exports.RaceControlDriverMapRaceControlDriver = exports.RaceControlDriverMapRaceControlDriverRaceControlCarLapInfo = exports.RaceControlDriverMapRaceControlDriverCollision = exports.RaceControlDriverMapRaceControlDriverVec = exports.RaceControlDriverMapRaceControlDriverSessionCarInfo = exports.RaceControlTrackInfo = exports.RaceControlTrackMapData = exports.RaceControlSessionInfo = void 0;
const maxUnixTSInSeconds = 9999999999;
function ParseDate(d) {
    if (d instanceof Date)
        return d;
    if (typeof d === 'number') {
        if (d > maxUnixTSInSeconds)
            return new Date(d);
        return new Date(d * 1000);
    }
    return new Date(d);
}
exports.ParseDate = ParseDate;
function ParseNumber(v, isInt = false) {
    if (!v)
        return 0;
    if (typeof v === 'number')
        return v;
    return (isInt ? parseInt(v) : parseFloat(v)) || 0;
}
exports.ParseNumber = ParseNumber;
function FromArray(Ctor, data, def = null) {
    if (!data || !Object.keys(data).length)
        return def;
    const d = Array.isArray(data) ? data : [data];
    return d.map((v) => new Ctor(v));
}
exports.FromArray = FromArray;
function ToObject(o, typeOrCfg = {}, child = false) {
    if (!o)
        return null;
    if (typeof o.toObject === 'function' && child)
        return o.toObject();
    switch (typeof o) {
        case 'string':
            return typeOrCfg === 'number' ? ParseNumber(o) : o;
        case 'boolean':
        case 'number':
            return o;
    }
    if (o instanceof Date) {
        return typeOrCfg === 'string' ? o.toISOString() : Math.floor(o.getTime() / 1000);
    }
    if (Array.isArray(o))
        return o.map((v) => ToObject(v, typeOrCfg, true));
    const d = {};
    for (const k of Object.keys(o)) {
        const v = o[k];
        if (!v)
            continue;
        d[k] = ToObject(v, typeOrCfg[k] || {}, true);
    }
    return d;
}
exports.ToObject = ToObject;
class RaceControlSessionInfo {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.Version = ('Version' in d) ? d.Version : 0;
        this.SessionIndex = ('SessionIndex' in d) ? d.SessionIndex : 0;
        this.CurrentSessionIndex = ('CurrentSessionIndex' in d) ? d.CurrentSessionIndex : 0;
        this.SessionCount = ('SessionCount' in d) ? d.SessionCount : 0;
        this.ServerName = ('ServerName' in d) ? d.ServerName : '';
        this.Track = ('Track' in d) ? d.Track : '';
        this.TrackConfig = ('TrackConfig' in d) ? d.TrackConfig : '';
        this.Name = ('Name' in d) ? d.Name : '';
        this.Type = ('Type' in d) ? d.Type : 0;
        this.Time = ('Time' in d) ? d.Time : 0;
        this.Laps = ('Laps' in d) ? d.Laps : 0;
        this.WaitTime = ('WaitTime' in d) ? d.WaitTime : 0;
        this.AmbientTemp = ('AmbientTemp' in d) ? d.AmbientTemp : 0;
        this.RoadTemp = ('RoadTemp' in d) ? d.RoadTemp : 0;
        this.WeatherGraphics = ('WeatherGraphics' in d) ? d.WeatherGraphics : '';
        this.ElapsedMilliseconds = ('ElapsedMilliseconds' in d) ? d.ElapsedMilliseconds : 0;
        this.EventType = ('EventType' in d) ? d.EventType : 0;
    }
    toObject() {
        const cfg = {};
        cfg.Version = 'number';
        cfg.SessionIndex = 'number';
        cfg.CurrentSessionIndex = 'number';
        cfg.SessionCount = 'number';
        cfg.Type = 'number';
        cfg.Time = 'number';
        cfg.Laps = 'number';
        cfg.WaitTime = 'number';
        cfg.AmbientTemp = 'number';
        cfg.RoadTemp = 'number';
        cfg.ElapsedMilliseconds = 'number';
        cfg.EventType = 'number';
        return ToObject(this, cfg);
    }
}
exports.RaceControlSessionInfo = RaceControlSessionInfo;
class RaceControlTrackMapData {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.width = ('width' in d) ? d.width : 0;
        this.height = ('height' in d) ? d.height : 0;
        this.margin = ('margin' in d) ? d.margin : 0;
        this.scale_factor = ('scale_factor' in d) ? d.scale_factor : 0;
        this.offset_x = ('offset_x' in d) ? d.offset_x : 0;
        this.offset_y = ('offset_y' in d) ? d.offset_y : 0;
        this.drawing_size = ('drawing_size' in d) ? d.drawing_size : 0;
    }
    toObject() {
        const cfg = {};
        cfg.width = 'number';
        cfg.height = 'number';
        cfg.margin = 'number';
        cfg.scale_factor = 'number';
        cfg.offset_x = 'number';
        cfg.offset_y = 'number';
        cfg.drawing_size = 'number';
        return ToObject(this, cfg);
    }
}
exports.RaceControlTrackMapData = RaceControlTrackMapData;
class RaceControlTrackInfo {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.name = ('name' in d) ? d.name : '';
        this.city = ('city' in d) ? d.city : '';
        this.country = ('country' in d) ? d.country : '';
        this.description = ('description' in d) ? d.description : '';
        this.geotags = ('geotags' in d) ? d.geotags : [];
        this.length = ('length' in d) ? d.length : '';
        this.pitboxes = ('pitboxes' in d) ? d.pitboxes : '';
        this.run = ('run' in d) ? d.run : '';
        this.tags = ('tags' in d) ? d.tags : [];
        this.width = ('width' in d) ? d.width : '';
    }
    toObject() {
        const cfg = {};
        return ToObject(this, cfg);
    }
}
exports.RaceControlTrackInfo = RaceControlTrackInfo;
class RaceControlDriverMapRaceControlDriverSessionCarInfo {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.CarID = ('CarID' in d) ? d.CarID : 0;
        this.DriverName = ('DriverName' in d) ? d.DriverName : '';
        this.DriverGUID = ('DriverGUID' in d) ? d.DriverGUID : '';
        this.CarModel = ('CarModel' in d) ? d.CarModel : '';
        this.CarSkin = ('CarSkin' in d) ? d.CarSkin : '';
        this.DriverInitials = ('DriverInitials' in d) ? d.DriverInitials : '';
        this.CarName = ('CarName' in d) ? d.CarName : '';
        this.EventType = ('EventType' in d) ? d.EventType : 0;
    }
    toObject() {
        const cfg = {};
        cfg.CarID = 'number';
        cfg.EventType = 'number';
        return ToObject(this, cfg);
    }
}
exports.RaceControlDriverMapRaceControlDriverSessionCarInfo = RaceControlDriverMapRaceControlDriverSessionCarInfo;
class RaceControlDriverMapRaceControlDriverVec {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.X = ('X' in d) ? d.X : 0;
        this.Y = ('Y' in d) ? d.Y : 0;
        this.Z = ('Z' in d) ? d.Z : 0;
    }
    toObject() {
        const cfg = {};
        cfg.X = 'number';
        cfg.Y = 'number';
        cfg.Z = 'number';
        return ToObject(this, cfg);
    }
}
exports.RaceControlDriverMapRaceControlDriverVec = RaceControlDriverMapRaceControlDriverVec;
class RaceControlDriverMapRaceControlDriverCollision {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.ID = ('ID' in d) ? d.ID : '';
        this.Type = ('Type' in d) ? d.Type : '';
        this.Time = ('Time' in d) ? ParseDate(d.Time) : new Date();
        this.OtherDriverGUID = ('OtherDriverGUID' in d) ? d.OtherDriverGUID : '';
        this.OtherDriverName = ('OtherDriverName' in d) ? d.OtherDriverName : '';
        this.Speed = ('Speed' in d) ? d.Speed : 0;
    }
    toObject() {
        const cfg = {};
        cfg.Time = 'string';
        cfg.Speed = 'number';
        return ToObject(this, cfg);
    }
}
exports.RaceControlDriverMapRaceControlDriverCollision = RaceControlDriverMapRaceControlDriverCollision;
class RaceControlDriverMapRaceControlDriverRaceControlCarLapInfo {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.TopSpeedThisLap = ('TopSpeedThisLap' in d) ? d.TopSpeedThisLap : 0;
        this.TopSpeedBestLap = ('TopSpeedBestLap' in d) ? d.TopSpeedBestLap : 0;
        this.BestLap = ('BestLap' in d) ? d.BestLap : 0;
        this.NumLaps = ('NumLaps' in d) ? d.NumLaps : 0;
        this.LastLap = ('LastLap' in d) ? d.LastLap : 0;
        this.LastLapCompletedTime = ('LastLapCompletedTime' in d) ? ParseDate(d.LastLapCompletedTime) : new Date();
        this.TotalLapTime = ('TotalLapTime' in d) ? d.TotalLapTime : 0;
        this.CarName = ('CarName' in d) ? d.CarName : '';
    }
    toObject() {
        const cfg = {};
        cfg.TopSpeedThisLap = 'number';
        cfg.TopSpeedBestLap = 'number';
        cfg.BestLap = 'number';
        cfg.NumLaps = 'number';
        cfg.LastLap = 'number';
        cfg.LastLapCompletedTime = 'string';
        cfg.TotalLapTime = 'number';
        return ToObject(this, cfg);
    }
}
exports.RaceControlDriverMapRaceControlDriverRaceControlCarLapInfo = RaceControlDriverMapRaceControlDriverRaceControlCarLapInfo;
class RaceControlDriverMapRaceControlDriver {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.CarInfo = new RaceControlDriverMapRaceControlDriverSessionCarInfo(d.CarInfo);
        this.TotalNumLaps = ('TotalNumLaps' in d) ? d.TotalNumLaps : 0;
        this.ConnectedTime = ('ConnectedTime' in d) ? ParseDate(d.ConnectedTime) : new Date();
        this.LoadedTime = ('LoadedTime' in d) ? ParseDate(d.LoadedTime) : new Date();
        this.Position = ('Position' in d) ? d.Position : 0;
        this.Split = ('Split' in d) ? d.Split : '';
        this.LastSeen = ('LastSeen' in d) ? ParseDate(d.LastSeen) : new Date();
        this.LastPos = new RaceControlDriverMapRaceControlDriverVec(d.LastPos);
        this.Collisions = Array.isArray(d.Collisions) ? d.Collisions.map((v) => new RaceControlDriverMapRaceControlDriverCollision(v)) : [];
        this.Cars = ('Cars' in d) ? d.Cars : {};
    }
    toObject() {
        const cfg = {};
        cfg.TotalNumLaps = 'number';
        cfg.ConnectedTime = 'string';
        cfg.LoadedTime = 'string';
        cfg.Position = 'number';
        cfg.LastSeen = 'string';
        return ToObject(this, cfg);
    }
}
exports.RaceControlDriverMapRaceControlDriver = RaceControlDriverMapRaceControlDriver;
class RaceControlDriverMap {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.Drivers = ('Drivers' in d) ? d.Drivers : {};
        this.GUIDsInPositionalOrder = ('GUIDsInPositionalOrder' in d) ? d.GUIDsInPositionalOrder : [];
    }
    toObject() {
        const cfg = {};
        return ToObject(this, cfg);
    }
}
exports.RaceControlDriverMap = RaceControlDriverMap;
class RaceControl {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.SessionInfo = new RaceControlSessionInfo(d.SessionInfo);
        this.TrackMapData = new RaceControlTrackMapData(d.TrackMapData);
        this.TrackInfo = new RaceControlTrackInfo(d.TrackInfo);
        this.SessionStartTime = ('SessionStartTime' in d) ? ParseDate(d.SessionStartTime) : new Date();
        this.CurrentRealtimePosInterval = ('CurrentRealtimePosInterval' in d) ? d.CurrentRealtimePosInterval : 0;
        this.ConnectedDrivers = ('ConnectedDrivers' in d) ? new RaceControlDriverMap(d.ConnectedDrivers) : null;
        this.DisconnectedDrivers = ('DisconnectedDrivers' in d) ? new RaceControlDriverMap(d.DisconnectedDrivers) : null;
        this.CarIDToGUID = ('CarIDToGUID' in d) ? d.CarIDToGUID : {};
    }
    toObject() {
        const cfg = {};
        cfg.SessionStartTime = 'string';
        cfg.CurrentRealtimePosInterval = 'number';
        return ToObject(this, cfg);
    }
}
exports.RaceControl = RaceControl;
//# sourceMappingURL=RaceControl.js.map