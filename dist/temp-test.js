"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { reconcileReleases } from "./reconcile-releases.js";
const action_1 = require("@octokit/action");
const action_perform_postrelease_1 = require("./action-perform-postrelease");
const action_perform_prerelease_1 = require("./action-perform-prerelease");
process.env.GITHUB_ACTION = "test";
process.env.GITHUB_TOKEN = "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";
process.env.LOG_LEVEL = "info";
const testOktokit = new action_1.Octokit({});
const owner = "danielemery";
const repo = "action-deployment-poc";
const SHA = "e8f7e9e6f49638e4d0bbb3c3f98371ac340485d0";
const TAG = "2024-03-10_14_44";
const fakeLogger = {
    debug: process.env.LOG_LEVEL === "debug" ? console.debug : () => { },
    info: console.log,
    warning: console.warn,
    error: console.error,
};
async function performTests() {
    const result = await (0, action_perform_prerelease_1.performPreRelease)({
        octokit: testOktokit,
        context: {
            repo: { owner, repo },
            sha: SHA,
        },
        logger: fakeLogger,
    }, TAG);
    console.log({ result });
    // const result = { releaseId: 145834585, isExistingRelease: false };
    await (0, action_perform_postrelease_1.performPostRelease)({
        octokit: testOktokit,
        context: {
            repo: { owner, repo },
            sha: SHA,
        },
        logger: fakeLogger,
    }, result.releaseId);
}
performTests()
    .then(() => {
    console.log("Tests complete");
    process.exit(0);
})
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=temp-test.js.map