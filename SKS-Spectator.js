"use strict";
// LiteLoader-AIDS automatic generated
/// <reference path="e:\Dev/dts/llaids/src/index.d.ts"/> 
Object.defineProperty(exports, "__esModule", { value: true });
exports.err = void 0;
ll.registerPlugin(
/* name */ "SKS-Spectator", 
/* introduction */ "", 
/* version */ [0, 0, 1], 
/* otherInformation */ {});
var CONFIG_PATH = './plugins/SKS/spectator/config.json';
var conf = new JsonConfigFile(CONFIG_PATH);
conf.init('pos', [0, 80, 0, 0]);
conf.init('tag', 'watching');
conf.init('onJoin', true);
//const defaultPos:FloatPos = new FloatPos(0, 80, 0, 0)
//const TAG = "watching"
//const onJoin = true
function err() { }
exports.err = err;
function spectator(player) {
    var _a = mc.runcmdEx("gamemode spectator ".concat(player.realName)), output = _a.output, success = _a.success;
    log(output);
    return success;
}
function getPlayersNoTag() {
    var players = mc.getOnlinePlayers();
    var tmp = [];
    players.forEach(function (player) {
        if (!player.hasTag(conf.get('tag')))
            tmp.push(player.xuid);
    });
    return tmp;
}
// function getPlayersTaged() {
//     let players = mc.getOnlinePlayers()
//     let tmp:string[] = []
//     players.forEach((player) => {
//         if (player.hasTag(conf.get('tag'))) tmp.push(player.xuid)
//     })
//     return tmp
// }
function getRandomPlayerNoTaged() {
    var noTagPlayers = getPlayersNoTag();
    var length = noTagPlayers.length;
    if (length === 0) {
        return null;
    }
    var pxuid = noTagPlayers[Math.floor(Math.random() * length)];
    return pxuid;
}
function getSelectPlayerGUI() {
    var players = {};
    var onlinePlayers = mc.getOnlinePlayers();
    onlinePlayers.forEach(function (player) {
        //players[player.realName] = player.xuid
        if (!player.hasTag(conf.get('tag')))
            players[player.realName] = player.xuid;
    });
    var pllist = Object.keys(players);
    var fm = mc.newCustomForm();
    fm.setTitle("选择玩家视角");
    fm.addDropdown("选择玩家视角", pllist, 0);
    return { fm: fm, players: players, pllist: pllist };
}
var TaskSpectator = /** @class */ (function () {
    function TaskSpectator(watcher, watchee) {
        if (watchee === void 0) { watchee = null; }
        this._watcher = watcher;
        this._watchee = watchee;
        this._taskID = null;
    }
    Object.defineProperty(TaskSpectator.prototype, "watcher", {
        get: function () {
            return this._watcher;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TaskSpectator.prototype, "watchee", {
        get: function () {
            return this._watchee;
        },
        set: function (xuid) {
            this._watchee = xuid;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TaskSpectator.prototype, "taskID", {
        get: function () {
            return this._taskID;
        },
        enumerable: false,
        configurable: true
    });
    TaskSpectator.prototype.start = function (delay) {
        var _this = this;
        if (delay === void 0) { delay = 3000; }
        this._taskID = setInterval(function () {
            _this._tp();
        }, delay);
        log("taskID:".concat(this._taskID, " Watcher:").concat(this._watcher, " Watchee:").concat(this._watchee, "\u5DF2\u542F\u52A8"));
        return this._taskID;
    };
    TaskSpectator.prototype._tp = function () {
        var p1 = mc.getPlayer(this._watcher);
        if (p1 == null) {
            log("Watcher-".concat(this._watcher, "\u4E0D\u5B58\u5728"));
            this.stop();
            return false;
        }
        if (this._watchee === null) {
            var _a = conf.get('pos', [0, 200, 0, 0]), x = _a[0], y = _a[1], z = _a[2], dimId = _a[3];
            var defaultPos = new FloatPos(x, y, z, dimId);
            p1.teleport(defaultPos);
            return false;
        }
        else {
            var p2 = mc.getPlayer(this._watchee);
            if (p2 == null) {
                log("Watchee-".concat(this._watchee, "\u4E0D\u5B58\u5728"));
                this.stop();
                this._watchee = getRandomPlayerNoTaged();
                this.start();
                return false;
            }
            var _b = p2.feetPos, x = _b.x, y = _b.y, z = _b.z, dimid = _b.dimid;
            p1.teleport(x, y, z, dimid, p2.direction);
        }
        return true;
    };
    TaskSpectator.prototype.stop = function () {
        if (this.taskID === null) {
            log("\u4EFB\u52A1\u4E0D\u5B58\u5728");
            return false;
        }
        var status = clearInterval(this.taskID);
        if (status) {
            log("taskID:".concat(this.taskID, "\u505C\u6B62\u6210\u529F"));
            return true;
        }
        else {
            log("taskID:".concat(this.taskID, "\u505C\u6B62\u5931\u8D25"));
            return false;
        }
    };
    return TaskSpectator;
}());
var TaskMgr = /** @class */ (function () {
    function TaskMgr() {
        this._list = new Map();
    }
    Object.defineProperty(TaskMgr.prototype, "list", {
        get: function () {
            return this._list;
        },
        enumerable: false,
        configurable: true
    });
    TaskMgr.prototype.add = function (task) {
        if (this._list.has(task.watcher)) {
            this.remove(task.watcher);
        }
        task.start();
        var watcher = task.watcher, watchee = task.watchee, taskID = task.taskID;
        if (task.taskID === null)
            return false;
        this._list = this._list.set(task.watcher, task);
        log("\u4EFB\u52A1taskID:".concat(taskID, " watcher:").concat(watcher, " watchee:").concat(watchee, "\u6DFB\u52A0\u6210\u529F"));
        //log(this._list)
        log("\u5F53\u524D\u6B63\u5728\u8FDB\u884C\u7684task\u6570\u91CF:".concat(this._list.size));
        return true;
    };
    TaskMgr.prototype.remove = function (key) {
        var task = this._list.get(key);
        if (typeof task === 'undefined')
            return;
        var watcher = task.watcher, watchee = task.watchee, taskID = task.taskID;
        task.stop();
        this._list.delete(key);
        log("\u4EFB\u52A1taskID:".concat(taskID, " watcher:").concat(watcher, " watchee:").concat(watchee, "\u79FB\u9664\u6210\u529F"));
        //log(this._list)
        log("\u5F53\u524D\u6B63\u5728\u8FDB\u884C\u7684task\u6570\u91CF:".concat(this._list.size));
        return;
    };
    return TaskMgr;
}());
var taskList = new TaskMgr();
mc.listen("onJoin", function (player) {
    if (!player.hasTag(conf.get('tag'))) {
        taskList.list.forEach(function (v, k, map) {
            if (v.watchee === null)
                v.watchee = player.xuid;
        });
    }
    else {
        if (conf.get('onJoin', false)) {
            spectator(player);
            var task = new TaskSpectator(player.xuid, getRandomPlayerNoTaged());
            taskList.add(task);
        }
    }
});
mc.listen("onLeft", function (player) {
    if (taskList.list.has(player.xuid)) {
        taskList.remove(player.xuid);
        return;
    }
});
mc.listen("onServerStarted", function () {
    var cmd = mc.newCommand("watching", "自动传送并监视玩家", PermType.Any);
    cmd.setAlias("wch");
    cmd.setEnum("RandomAction", ["random"]);
    cmd.setEnum("GuiAction", ["gui"]);
    cmd.setEnum("StopAction", ["stop"]);
    cmd.mandatory("action", ParamType.Enum, "GuiAction");
    cmd.mandatory("action", ParamType.Enum, "RandomAction");
    cmd.mandatory("action", ParamType.Enum, "StopAction");
    // cmd.mandatory("name", ParamType.RawText);
    cmd.overload(["StopAction"]);
    cmd.overload(["GuiAction"]);
    cmd.overload(["RandomAction"]);
    cmd.setCallback(function (_cmd, _ori, out, res) {
        if (_ori.player === undefined)
            return out.error('此命令仅玩家可执行');
        if (!_ori.player.hasTag(conf.get('tag'))) {
            _ori.player.sendText("您没有权限使用此命令", 0);
            return;
        }
        switch (res.action) {
            case "gui":
                var _a = getSelectPlayerGUI(), fm = _a.fm, players_1 = _a.players, pllist_1 = _a.pllist;
                _ori.player.sendForm(fm, function (pl, data) {
                    if (data == null)
                        return;
                    var tmpPlayerXuid = players_1[pllist_1[data[0]]];
                    var task = new TaskSpectator(pl.xuid, tmpPlayerXuid);
                    taskList.add(task);
                });
                return out.success("\u8DDF\u968F\u5DF2\u5F00\u542F");
            case "random":
                var rxuid = getRandomPlayerNoTaged();
                var task = new TaskSpectator(_ori.player.xuid, rxuid);
                taskList.add(task);
                return out.success("\u968F\u673A\u8DDF\u968F\u5DF2\u5F00\u542F\uFF0C\u5F53\u524D\u8DDF\u968F\u73A9\u5BB6".concat(rxuid));
            case "stop":
                if (!_ori.player.isOP())
                    return out.success("\u6743\u9650\u4E0D\u8DB3");
                taskList.remove(_ori.player.xuid);
                return out.success("\u5DF2\u5173\u95ED\u8DDF\u968F\u6A21\u5F0F");
        }
    });
    cmd.setup();
});
