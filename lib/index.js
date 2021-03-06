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
var _this = this;
module.exports = function (app) {
    app.on('organization.member_added', function (context) { return __awaiter(_this, void 0, void 0, function () {
        var res, content, yaml, config, response, decoded, split, id, teamParams, body, issueBody, issueParams, createIssueParams;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context.log("event received");
                    return [4 /*yield*/, context.github.repos.getContents({
                            owner: context.payload.organization.login,
                            repo: 'org-settings',
                            path: '.github/onboard-new-org-member.yml'
                        })];
                case 1:
                    res = _a.sent();
                    content = Buffer.from(res.data.content, 'base64').toString('utf8');
                    yaml = require('js-yaml');
                    config = yaml.safeLoad(content);
                    return [4 /*yield*/, context.github.query("query ($login: String!, $team: String!) {\n      organization (login: $login) {\n        team (slug: $team) {\n          id\n        }\n      }\n    }", { login: config.orgName, team: config.defaultTeam })
                        // The `Team` GraphQL type doesn't include the databaseId
                        // so we can hack around it by decoding the node id.
                        // See https://github.com/github/ecosystem-api/issues/1576
                    ];
                case 2:
                    response = _a.sent();
                    decoded = Buffer.from(response.organization.team.id, 'base64').toString();
                    split = decoded.split('Team');
                    id = parseInt(split[split.length - 1], 10);
                    teamParams = Object.assign({}, {
                        team_id: id || 0,
                        username: context.payload.membership.user.login || ''
                    } || {});
                    return [4 /*yield*/, context.github.teams.addOrUpdateMembership(teamParams).catch(function (e) { return console.log(e); })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, context.github.query("query ($owner: String!, $repo: String!) {\n      repository(owner: $owner, name: $repo) {\n        object(expression: \"master:.github/templates/on-board-template.md\") {\n          ... on Blob {\n            text\n          }\n        }\n      }\n    }", { owner: config.orgName, repo: config.settingsRepo })];
                case 4:
                    body = _a.sent();
                    issueBody = body.repository.object.text;
                    issueBody = issueBody.replace(new RegExp("" + config.replacePhrase, 'g'), "@" + context.payload.membership.user.login);
                    issueBody += (config.ccList) ? "\n\n<h6>/cc " + config.ccList + "</h6>" : '';
                    issueParams = {
                        owner: config.orgName,
                        repo: config.onboardRepo,
                        title: context.payload.membership.user.login + " On-boarding",
                        body: issueBody
                    };
                    createIssueParams = Object.assign({}, config.onboardRepo, issueParams || {});
                    context.github.issues.create(createIssueParams);
                    return [2 /*return*/];
            }
        });
    }); });
};
//# sourceMappingURL=index.js.map