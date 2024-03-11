import { Octokit } from "@octokit/action";
import * as github from "@actions/github";
import { ContextArgument, createContext } from "./context";

export async function createPrerelease(
  { octokit, context, logger }: ContextArgument,
  tag: string
) {
  const { owner, repo } = context.repo;
  await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/tags/${tag}`,
    sha: context.sha,
  });

  const newRelease = await octokit.rest.repos.createRelease({
    owner,
    repo,
    prerelease: true,
    tag_name: tag,
    name: tag,
    generate_release_notes: true,
  });

  logger.info(`Created prerelease: ${newRelease.data.html_url}`);
}

export default function (tag: string) {
  const octokit = new Octokit();
  return createPrerelease(createContext(octokit, github.context), tag);
}
