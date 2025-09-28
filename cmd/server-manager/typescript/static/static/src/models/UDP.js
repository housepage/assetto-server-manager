"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToObject = exports.FromArray = exports.ParseNumber = exports.ParseDate = exports.Chat = exports.CollisionWithCar = exports.CollisionWithEnvironment = exports.LapCompleted = exports.LapCompletedLapCompletedCar = exports.CarUpdate = exports.CarUpdateVec = exports.SessionInfo = void 0;
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
class SessionInfo {
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
exports.SessionInfo = SessionInfo;
class CarUpdateVec {
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
exports.CarUpdateVec = CarUpdateVec;
class CarUpdate {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.CarID = ('CarID' in d) ? d.CarID : 0;
        this.Pos = new CarUpdateVec(d.Pos);
        this.Velocity = new CarUpdateVec(d.Velocity);
        this.Gear = ('Gear' in d) ? d.Gear : 0;
        this.EngineRPM = ('EngineRPM' in d) ? d.EngineRPM : 0;
        this.NormalisedSplinePos = ('NormalisedSplinePos' in d) ? d.NormalisedSplinePos : 0;
    }
    toObject() {
        const cfg = {};
        cfg.CarID = 'number';
        cfg.Gear = 'number';
        cfg.EngineRPM = 'number';
        cfg.NormalisedSplinePos = 'number';
        return ToObject(this, cfg);
    }
}
exports.CarUpdate = CarUpdate;
class LapCompletedLapCompletedCar {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.CarID = ('CarID' in d) ? d.CarID : 0;
        this.LapTime = ('LapTime' in d) ? d.LapTime : 0;
        this.Laps = ('Laps' in d) ? d.Laps : 0;
        this.Completed = ('Completed' in d) ? d.Completed : 0;
    }
    toObject() {
        const cfg = {};
        cfg.CarID = 'number';
        cfg.LapTime = 'number';
        cfg.Laps = 'number';
        cfg.Completed = 'number';
        return ToObject(this, cfg);
    }
}
exports.LapCompletedLapCompletedCar = LapCompletedLapCompletedCar;
class LapCompleted {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.CarID = ('CarID' in d) ? d.CarID : 0;
        this.LapTime = ('LapTime' in d) ? d.LapTime : 0;
        this.Cuts = ('Cuts' in d) ? d.Cuts : 0;
        this.CarsCount = ('CarsCount' in d) ? d.CarsCount : 0;
        this.Cars = Array.isArray(d.Cars) ? d.Cars.map((v) => new LapCompletedLapCompletedCar(v)) : [];
    }
    toObject() {
        const cfg = {};
        cfg.CarID = 'number';
        cfg.LapTime = 'number';
        cfg.Cuts = 'number';
        cfg.CarsCount = 'number';
        return ToObject(this, cfg);
    }
}
exports.LapCompleted = LapCompleted;
class CollisionWithEnvironment {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.CarID = ('CarID' in d) ? d.CarID : 0;
        this.ImpactSpeed = ('ImpactSpeed' in d) ? d.ImpactSpeed : 0;
        this.WorldPos = new CarUpdateVec(d.WorldPos);
        this.RelPos = new CarUpdateVec(d.RelPos);
    }
    toObject() {
        const cfg = {};
        cfg.CarID = 'number';
        cfg.ImpactSpeed = 'number';
        return ToObject(this, cfg);
    }
}
exports.CollisionWithEnvironment = CollisionWithEnvironment;
class CollisionWithCar {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.CarID = ('CarID' in d) ? d.CarID : 0;
        this.OtherCarID = ('OtherCarID' in d) ? d.OtherCarID : 0;
        this.ImpactSpeed = ('ImpactSpeed' in d) ? d.ImpactSpeed : 0;
        this.WorldPos = new CarUpdateVec(d.WorldPos);
        this.RelPos = new CarUpdateVec(d.RelPos);
    }
    toObject() {
        const cfg = {};
        cfg.CarID = 'number';
        cfg.OtherCarID = 'number';
        cfg.ImpactSpeed = 'number';
        return ToObject(this, cfg);
    }
}
exports.CollisionWithCar = CollisionWithCar;
class Chat {
    constructor(data) {
        const d = (data && typeof data === 'object') ? ToObject(data) : {};
        this.CarID = ('CarID' in d) ? d.CarID : 0;
        this.Message = ('Message' in d) ? d.Message : '';
    }
    toObject() {
        const cfg = {};
        cfg.CarID = 'number';
        return ToObject(this, cfg);
    }
}
exports.Chat = Chat;
//# sourceMappingURL=UDP.js.map