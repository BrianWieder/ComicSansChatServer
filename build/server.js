"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var admin = __importStar(require("firebase-admin"));
require("./utils/exit");
dotenv_1.default.config();
var serviceAccount = require('./independent-studies-firebase-service-account.json');
var cors = require('cors');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
var Controllers_1 = require("./Controllers");
var db_1 = require("./utils/db");
var app = express_1.default();
var port = Number(process.env.PORT) || 3000;
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express_1.default.json());
app.use(cors());
app.use(express_1.default.static(path_1.default.join(__dirname, 'static')));
app.use('/api/welcome', Controllers_1.WelcomeController);
app.use('/api/chats', Controllers_1.ChatsController);
app.use('/api/users', Controllers_1.UserController);
app.get('*', function (req, res) {
    res.sendFile(path_1.default.join(__dirname + '/static/index.html'));
});
io.use(function (socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
        admin
            .auth()
            .verifyIdToken(socket.handshake.query.token)
            .then(function (decodedToken) {
            socket.decoded = decodedToken;
            socket.join(decodedToken.uid);
            next();
        })
            .catch(function (err) {
            next(new Error('Authentication error'));
        });
    }
}).on('connection', function (socket) {
    var _this = this;
    // Connection now authenticated to receive further events
    socket.on('chat', function (message) { return __awaiter(_this, void 0, void 0, function () {
        var userSent, users, db_message, msgToSend_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!message.chat_id) return [3 /*break*/, 4];
                    return [4 /*yield*/, db_1.getUser(socket.decoded.uid)];
                case 1:
                    userSent = _a.sent();
                    return [4 /*yield*/, db_1.getUsersForChat(message.chat_id)];
                case 2:
                    users = _a.sent();
                    return [4 /*yield*/, db_1.createMessage(message.chat_id, socket.decoded.uid, message.message)];
                case 3:
                    db_message = _a.sent();
                    msgToSend_1 = {
                        Chat_ID: 1,
                        ID: socket.decoded.uid,
                        Message: message.message,
                        Owner: socket.decoded.uid,
                        Time_Sent: db_message.Time_Sent,
                        last_login: userSent.last_login,
                        name: userSent.name,
                        profile_picture: userSent.profile_picture
                    };
                    users.forEach(function (user) {
                        io.to(user.User_ID).emit('chat', msgToSend_1);
                    });
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); });
});
server.listen(port, function () {
    console.log("Listening at http://localhost:" + port + "/");
});
