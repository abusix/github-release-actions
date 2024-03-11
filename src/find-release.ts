import { ContextArgument } from "./context";
const DEFAULT_MAX_PAGE_SEARCH = 5;

/**
 * Find the release with the given tag name.
 * @param context Context argument
 * @param targetTagName The tag name to search for.
 * @param maxPageSearch The maximum number of pages to search through. Default is 5.
 * @returns The release if found, otherwise null.
 */
export async function findRelease(
  { octokit, context, logger }: ContextArgument,
  targetTagName: string,
  maxPageSearch = DEFAULT_MAX_PAGE_SEARCH
) {
  const { owner, repo } = context.repo;

  const releasesIterator = octokit.paginate.iterator(
    octokit.rest.repos.listReleases,
    {
      owner,
      repo,
    }
  );
  let currentPage = 1;
  for await (const value of releasesIterator) {
    logger.debug(`Searching through release page #${currentPage}`);
    const matchingRelease = value.data.find(
      (release) => release.tag_name === targetTagName
    );
    if (matchingRelease) {
      return matchingRelease;
    }
    if (currentPage > maxPageSearch) {
      logger.debug(`Reached maximum page size when searching, aborting`);
      break;
    }
    currentPage++;
  }
  return null;
}
