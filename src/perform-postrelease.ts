import { ContextArgument } from "./context";
import { collectPrereleases } from "./collect-prereleases";

export async function performPostRelease(
  { octokit, context, logger }: ContextArgument,
  targetReleaseId: number
) {
  const { owner, repo } = context.repo;

  logger.info(`Fetching target release (${targetReleaseId})`);
  const { data: targetRelease } = await octokit.rest.repos.getRelease({
    owner,
    repo,
    release_id: targetReleaseId,
  });

  if (targetRelease.draft) {
    // Find older prereleases to delete
    logger.info("Target is a draft release, finding prereleases to bundle up");
    const { prereleases, skippedPreleaseCount } = await collectPrereleases(
      { octokit, context, logger },
      targetRelease.tag_name
    );

    // Delete older prereleases
    logger.info(
      `Found ${prereleases.length} older prereleases to cleanup, ${skippedPreleaseCount} newer prereleases skipped`
    );
    for (const prerelease of prereleases) {
      logger.debug(
        `Deleting prerelease ${prerelease.tag_name} (${prerelease.id})`
      );
      await octokit.rest.repos.deleteRelease({
        owner,
        repo,
        release_id: prerelease.id,
      });

      // As long as this is not the target release, delete the tag as well
      if (prerelease.tag_name !== targetRelease.tag_name) {
        logger.debug(`Deleting tag ${prerelease.tag_name}`);
        await octokit.rest.git.deleteRef({
          owner,
          repo,
          ref: `tags/${prerelease.tag_name}`,
        });
      } else {
        logger.debug(`Skipping tag ${prerelease.tag_name}`);
      }
    }

    // Promote draft release to production
    logger.info("Promoting draft release to production");
    await octokit.rest.repos.updateRelease({
      owner,
      repo,
      release_id: targetReleaseId,
      draft: false,
      prerelease: false,
      latest: true,
    });
  } else {
    logger.info("Target is an existing release, marking release as latest");
    await octokit.rest.repos.updateRelease({
      owner,
      repo,
      release_id: targetReleaseId,
      make_latest: "true",
    });
  }
}
