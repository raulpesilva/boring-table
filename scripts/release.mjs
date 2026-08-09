import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const registry = 'https://registry.npmjs.org/';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceDirectory = path.resolve(scriptDirectory, '..');
const commitShaPattern = /^[0-9a-f]{40}$/;
const packageNamePattern = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;
const packageInfoFields = ['name', 'version', 'directory', 'manifestPath', 'changelogPath', 'npmTag', 'tag', 'tarball'];
const candidateInfoFields = [...packageInfoFields, 'previousVersion', 'needsPublish'];

const commandForPlatform = (command) => (process.platform === 'win32' ? `${command}.cmd` : command);

const run = (command, args, options = {}) => {
  const useCommandPrompt = process.platform === 'win32' && command.endsWith('.cmd');
  const executable = useCommandPrompt ? (process.env.ComSpec ?? 'cmd.exe') : command;
  const executableArgs = useCommandPrompt ? ['/d', '/s', '/c', command, ...args] : args;
  const result = spawnSync(executable, executableArgs, {
    cwd: options.cwd ?? workspaceDirectory,
    encoding: 'utf8',
    env: options.env ?? process.env,
    stdio: options.inherit ? 'inherit' : 'pipe',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && !options.allowFailure) {
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
    throw new Error(`Command failed: ${command} ${args.join(' ')}${output ? `\n${output}` : ''}`);
  }

  return result;
};

const getOption = (args, name, required = true) => {
  const index = args.indexOf(name);
  const value = index === -1 ? undefined : args[index + 1];

  if (required && !value) {
    throw new Error(`Missing required option ${name}.`);
  }

  return value;
};

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

const writeJson = (file, value) => {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};

const appendOutput = (name, value) => {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  }
};

const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

const packageTarballName = (name, version) => `${name.replace(/^@/, '').replaceAll('/', '-')}-${version}.tgz`;

const validateVersion = (version) => {
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Expected a semantic version, received: ${version}`);
  }
};

const validatePackageName = (name) => {
  if (typeof name !== 'string' || name.length > 214 || !packageNamePattern.test(name)) {
    throw new Error(`Expected a valid lowercase npm package name, received: ${name}`);
  }
};

const validateCommitSha = (sha, label) => {
  if (typeof sha !== 'string' || !commitShaPattern.test(sha)) {
    throw new Error(`Expected ${label} to be a full commit SHA, received: ${sha}`);
  }
};

const assertObject = (value, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected ${label} to be an object.`);
  }
};

const assertExactKeys = (value, expectedKeys, label) => {
  assertObject(value, label);
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();

  if (JSON.stringify(actualKeys) !== JSON.stringify(sortedExpectedKeys)) {
    throw new Error(`Unexpected fields in ${label}: ${actualKeys.join(', ')}`);
  }
};

const assertSameStringArray = (actual, expected, label) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Unexpected ${label}. Expected ${expected.join(', ')}, received ${actual.join(', ')}.`);
  }
};

const assertPackageValues = (actual, expected, label) => {
  for (const field of packageInfoFields) {
    if (actual[field] !== expected[field]) {
      throw new Error(`Unexpected ${label}.${field}. Expected ${expected[field]}, received ${actual[field]}.`);
    }
  }
};

const stableVersionParts = (version) => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  return match ? match.slice(1).map(Number) : null;
};

const compareStableVersions = (candidate, current) => {
  const candidateParts = stableVersionParts(candidate);
  const currentParts = stableVersionParts(current);

  if (!candidateParts || !currentParts) {
    throw new Error(`Expected stable semantic versions, received ${candidate} and ${current}.`);
  }

  for (let index = 0; index < candidateParts.length; index += 1) {
    if (candidateParts[index] !== currentParts[index]) {
      return candidateParts[index] - currentParts[index];
    }
  }

  return 0;
};

const npmView = (spec, field) => {
  const result = run(commandForPlatform('npm'), ['view', spec, field, '--json', `--registry=${registry}`], {
    allowFailure: true,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

  if (result.status !== 0) {
    if (output.includes('E404')) {
      return null;
    }

    throw new Error(`Unable to inspect ${spec} on npm.\n${output.trim()}`);
  }

  const stdout = (result.stdout ?? '').trim();
  return stdout ? JSON.parse(stdout) : null;
};

const npmVersionExists = (name, version) => npmView(`${name}@${version}`, 'version') === version;

const assertPublishableVersion = (packageInfo) => {
  validateVersion(packageInfo.version);

  if (packageInfo.version.includes('-')) {
    return;
  }

  const currentLatest = npmView(packageInfo.name, 'dist-tags.latest');

  if (currentLatest && compareStableVersions(packageInfo.version, currentLatest) <= 0) {
    throw new Error(
      `${packageInfo.name}@${packageInfo.version} must be greater than the current latest version ${currentLatest}.`
    );
  }
};

const publicPackages = () => {
  const packagesDirectory = path.join(workspaceDirectory, 'packages');
  const packages = readdirSync(packagesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const directory = path.join(packagesDirectory, entry.name);
      const manifestFile = path.join(directory, 'package.json');

      if (!existsSync(manifestFile)) {
        return null;
      }

      const manifest = readJson(manifestFile);

      if (manifest.private === true) {
        return null;
      }

      validatePackageName(manifest.name);
      validateVersion(manifest.version);

      const relativeDirectory = path.relative(workspaceDirectory, directory).replaceAll(path.sep, '/');
      const manifestPath = `${relativeDirectory}/package.json`;

      return {
        name: manifest.name,
        version: manifest.version,
        directory: relativeDirectory,
        manifestPath,
        changelogPath: `${relativeDirectory}/CHANGELOG.md`,
        npmTag: manifest.version.includes('-') ? 'next' : 'latest',
        tag: `${manifest.name}@${manifest.version}`,
        tarball: packageTarballName(manifest.name, manifest.version),
        dependencies: Object.keys({
          ...manifest.dependencies,
          ...manifest.optionalDependencies,
        }),
      };
    })
    .filter(Boolean);

  const packageByName = new Map(packages.map((packageInfo) => [packageInfo.name, packageInfo]));
  const ordered = [];
  const visiting = new Set();
  const visited = new Set();

  const visit = (packageInfo) => {
    if (visited.has(packageInfo.name)) {
      return;
    }

    if (visiting.has(packageInfo.name)) {
      throw new Error(`Circular publish dependency detected at ${packageInfo.name}.`);
    }

    visiting.add(packageInfo.name);

    for (const dependency of packageInfo.dependencies) {
      const dependencyPackage = packageByName.get(dependency);

      if (dependencyPackage) {
        visit(dependencyPackage);
      }
    }

    visiting.delete(packageInfo.name);
    visited.add(packageInfo.name);
    ordered.push(packageInfo);
  };

  for (const packageInfo of packages.sort((left, right) => left.name.localeCompare(right.name))) {
    visit(packageInfo);
  }

  return ordered.map(({ dependencies, ...packageInfo }) => packageInfo);
};

const validateReleasePlan = (plan, expectedHead) => {
  assertExactKeys(plan, ['schemaVersion', 'base', 'head', 'packages', 'candidates'], 'release plan');

  if (plan.schemaVersion !== 1) {
    throw new Error(`Unsupported release plan schema version: ${plan.schemaVersion}`);
  }

  validateCommitSha(plan.base, 'release plan base');
  validateCommitSha(plan.head, 'release plan head');
  validateCommitSha(expectedHead, 'expected release head');

  if (plan.head !== expectedHead) {
    throw new Error(`Release plan targets ${plan.head}, expected ${expectedHead}.`);
  }

  if (!Array.isArray(plan.packages) || !Array.isArray(plan.candidates)) {
    throw new Error('Release plan packages and candidates must be arrays.');
  }

  const expectedPackages = publicPackages();

  if (plan.packages.length !== expectedPackages.length) {
    throw new Error(`Release plan contains ${plan.packages.length} packages; expected ${expectedPackages.length}.`);
  }

  for (let index = 0; index < expectedPackages.length; index += 1) {
    const actual = plan.packages[index];
    const expected = expectedPackages[index];
    assertExactKeys(actual, packageInfoFields, `release plan package ${index}`);
    assertPackageValues(actual, expected, `release plan package ${index}`);
  }

  const packageByName = new Map(
    expectedPackages.map((packageInfo, index) => [packageInfo.name, { packageInfo, index }])
  );
  const candidateNames = new Set();
  let previousCandidateIndex = -1;

  for (let index = 0; index < plan.candidates.length; index += 1) {
    const candidate = plan.candidates[index];
    assertExactKeys(candidate, candidateInfoFields, `release candidate ${index}`);
    const expected = packageByName.get(candidate.name);

    if (!expected || candidateNames.has(candidate.name) || expected.index <= previousCandidateIndex) {
      throw new Error(`Unexpected or duplicate release candidate: ${candidate.name}`);
    }

    assertPackageValues(candidate, expected.packageInfo, `release candidate ${index}`);

    if (candidate.previousVersion !== null) {
      validateVersion(candidate.previousVersion);

      if (candidate.previousVersion === candidate.version) {
        throw new Error(`Release candidate ${candidate.name} did not change version.`);
      }
    }

    if (typeof candidate.needsPublish !== 'boolean') {
      throw new Error(`Release candidate ${candidate.name} has an invalid needsPublish value.`);
    }

    candidateNames.add(candidate.name);
    previousCandidateIndex = expected.index;
  }

  return plan;
};

const manifestAtRevision = (revision, manifestPath) => {
  if (!revision || /^0+$/.test(revision)) {
    return null;
  }

  const result = run('git', ['show', `${revision}:${manifestPath}`], { allowFailure: true });

  if (result.status === 0) {
    return JSON.parse(result.stdout);
  }

  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

  if (output.includes('does not exist') || output.includes('exists on disk, but not in')) {
    return null;
  }

  throw new Error(`Unable to read ${manifestPath} at ${revision}.\n${output.trim()}`);
};

const createPlan = (base, outputFile) => {
  const packages = publicPackages();
  const candidates = packages
    .map((packageInfo) => {
      const previousManifest = manifestAtRevision(base, packageInfo.manifestPath);
      const previousVersion = previousManifest?.version ?? null;

      if (previousVersion === packageInfo.version) {
        return null;
      }

      const published = npmVersionExists(packageInfo.name, packageInfo.version);

      if (!published) {
        assertPublishableVersion(packageInfo);
      }

      return {
        ...packageInfo,
        previousVersion,
        needsPublish: !published,
      };
    })
    .filter(Boolean);

  const head = run('git', ['rev-parse', 'HEAD']).stdout.trim();
  const plan = {
    schemaVersion: 1,
    base,
    head,
    packages,
    candidates,
  };

  validateReleasePlan(plan, head);
  writeJson(outputFile, plan);
  appendOutput('should_publish', String(candidates.some((packageInfo) => packageInfo.needsPublish)));
  appendOutput('should_release', String(candidates.length > 0));

  if (candidates.length === 0) {
    console.log('No public package version changed; build and publication will be skipped.');
    return;
  }

  for (const packageInfo of candidates) {
    const action = packageInfo.needsPublish ? 'will be published' : 'already exists on npm';
    console.log(`${packageInfo.name}@${packageInfo.version} ${action}; GitHub release will be reconciled.`);
  }
};

const packRelease = (planFile, outputDirectory) => {
  const head = run('git', ['rev-parse', 'HEAD']).stdout.trim();
  const plan = validateReleasePlan(readJson(planFile), head);
  mkdirSync(outputDirectory, { recursive: true });

  for (const packageInfo of plan.packages) {
    const tarball = path.resolve(outputDirectory, packageInfo.tarball);
    run(
      commandForPlatform('pnpm'),
      ['--dir', path.resolve(workspaceDirectory, packageInfo.directory), 'pack', '--out', tarball],
      { inherit: true }
    );

    if (!existsSync(tarball) || statSync(tarball).size === 0) {
      throw new Error(`Package tarball was not created: ${tarball}`);
    }
  }

  const planDestination = path.resolve(outputDirectory, 'release-plan.json');
  const sourcePlan = path.resolve(planFile);

  if (sourcePlan !== planDestination) {
    writeFileSync(planDestination, readFileSync(sourcePlan));
  }

  const files = ['release-plan.json', ...plan.packages.map((packageInfo) => packageInfo.tarball)].sort();
  const outputFiles = readdirSync(outputDirectory).sort();
  assertSameStringArray(outputFiles, files, 'release bundle files');
  const checksumFile = path.resolve(outputDirectory, 'SHA256SUMS');
  const checksums = files.map((file) => `${sha256(path.resolve(outputDirectory, file))}  ${file}`).join('\n');
  writeFileSync(checksumFile, `${checksums}\n`);

  const checksumsSha256 = sha256(checksumFile);
  appendOutput('checksums_sha256', checksumsSha256);
  console.log(`Created ${plan.packages.length} package tarball(s); SHA256SUMS digest is ${checksumsSha256}.`);
};

const verifyRelease = (directory, expectedChecksumsSha256, expectedHead) => {
  if (!/^[a-f0-9]{64}$/.test(expectedChecksumsSha256)) {
    throw new Error('Expected checksum manifest digest to be a SHA-256 value.');
  }

  const checksumFile = path.resolve(directory, 'SHA256SUMS');
  const actualChecksumsSha256 = sha256(checksumFile);

  if (actualChecksumsSha256 !== expectedChecksumsSha256) {
    throw new Error('The downloaded checksum manifest does not match the verified checksum manifest.');
  }

  const plan = validateReleasePlan(readJson(path.resolve(directory, 'release-plan.json')), expectedHead);
  const expectedFiles = ['release-plan.json', ...plan.packages.map((packageInfo) => packageInfo.tarball)].sort();
  const directoryFiles = readdirSync(directory).sort();
  assertSameStringArray(directoryFiles, ['SHA256SUMS', ...expectedFiles].sort(), 'release directory files');
  const lines = readFileSync(checksumFile, 'utf8').trim().split('\n');
  const checksumFiles = [];

  for (const line of lines) {
    const match = /^([a-f0-9]{64})  ([^/\\]+)$/.exec(line);

    if (!match) {
      throw new Error(`Invalid checksum entry: ${line}`);
    }

    const [, expected, file] = match;
    const target = path.resolve(directory, file);

    if (checksumFiles.includes(file)) {
      throw new Error(`Duplicate checksum entry: ${file}`);
    }

    checksumFiles.push(file);

    if (!existsSync(target) || !statSync(target).isFile() || sha256(target) !== expected) {
      throw new Error(`Integrity verification failed for ${file}.`);
    }
  }

  assertSameStringArray(checksumFiles.sort(), expectedFiles, 'checksum entries');

  console.log(`Verified ${lines.length} release artifact(s).`);
};

const verifyNpmVersion = () => {
  const npmVersion = run(commandForPlatform('npm'), ['--version']).stdout.trim();

  if (compareStableVersions(npmVersion, '11.5.1') < 0) {
    throw new Error(`Trusted publishing requires npm >= 11.5.1; found ${npmVersion}.`);
  }
};

const publishRelease = (planFile, directory, expectedHead) => {
  verifyNpmVersion();
  const plan = validateReleasePlan(readJson(planFile), expectedHead);

  for (const packageInfo of plan.candidates) {
    if (npmVersionExists(packageInfo.name, packageInfo.version)) {
      console.log(`${packageInfo.name}@${packageInfo.version} already exists; skipping npm publish.`);
      continue;
    }

    assertPublishableVersion(packageInfo);
    const tarball = path.resolve(directory, packageInfo.tarball);

    if (!existsSync(tarball) || !statSync(tarball).isFile()) {
      throw new Error(`Verified package tarball is missing: ${packageInfo.tarball}`);
    }

    run(
      commandForPlatform('npm'),
      [
        'publish',
        tarball,
        '--ignore-scripts',
        '--access',
        'public',
        '--tag',
        packageInfo.npmTag,
        `--registry=${registry}`,
      ],
      { inherit: true }
    );
  }
};

const changelogNotes = (packageInfo) => {
  const changelog = readFileSync(path.resolve(workspaceDirectory, packageInfo.changelogPath), 'utf8');
  const lines = changelog.split(/\r?\n/);
  const heading = `## ${packageInfo.version}`;
  const start = lines.findIndex((line) => line.trim() === heading);

  if (start === -1) {
    throw new Error(`Could not find ${heading} in ${packageInfo.changelogPath}.`);
  }

  const nextHeading = lines.findIndex((line, index) => index > start && /^##\s+/.test(line));
  const end = nextHeading === -1 ? lines.length : nextHeading;
  return lines
    .slice(start + 1, end)
    .join('\n')
    .trim();
};

const resolveTagCommit = (tag) => {
  const result = run('git', ['rev-parse', '--verify', `refs/tags/${tag}^{commit}`], { allowFailure: true });
  return result.status === 0 ? result.stdout.trim() : null;
};

const releaseExists = (repository, tag) => {
  const result = run('gh', ['release', 'view', tag, '--repo', repository], { allowFailure: true });

  if (result.status === 0) {
    return true;
  }

  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

  if (/release not found|HTTP 404|Not Found/i.test(output)) {
    return false;
  }

  throw new Error(`Unable to inspect GitHub release ${tag}.\n${output.trim()}`);
};

const previousPackageTag = (packageInfo) => {
  const result = run('git', ['tag', '--list', `${packageInfo.name}@*`, '--sort=-version:refname']);
  return result.stdout
    .split(/\r?\n/)
    .map((tag) => tag.trim())
    .find((tag) => tag && tag !== packageInfo.tag);
};

const createAnnotatedTag = (repository, tag, target) => {
  const tagObject = run('gh', [
    'api',
    '--method',
    'POST',
    `repos/${repository}/git/tags`,
    '-f',
    `tag=${tag}`,
    '-f',
    `message=${tag}`,
    '-f',
    `object=${target}`,
    '-f',
    'type=commit',
    '--jq',
    '.sha',
  ]).stdout.trim();

  run('gh', [
    'api',
    '--method',
    'POST',
    `repos/${repository}/git/refs`,
    '-f',
    `ref=refs/tags/${tag}`,
    '-f',
    `sha=${tagObject}`,
  ]);
};

const createGitHubReleases = (planFile, repository, target) => {
  const targetCommit = run('git', ['rev-parse', target]).stdout.trim();
  const plan = validateReleasePlan(readJson(planFile), targetCommit);

  for (const packageInfo of plan.candidates) {
    if (!npmVersionExists(packageInfo.name, packageInfo.version)) {
      throw new Error(`Cannot create ${packageInfo.tag}: the package version is not available on npm.`);
    }

    const existingTagCommit = resolveTagCommit(packageInfo.tag);

    if (existingTagCommit && existingTagCommit !== targetCommit) {
      throw new Error(`${packageInfo.tag} already points to ${existingTagCommit}, expected ${targetCommit}.`);
    }

    if (releaseExists(repository, packageInfo.tag)) {
      console.log(`GitHub release ${packageInfo.tag} already exists; skipping.`);
      continue;
    }

    const previousTag = previousPackageTag(packageInfo);

    if (!existingTagCommit) {
      createAnnotatedTag(repository, packageInfo.tag, targetCommit);
    }

    const npmUrl = `https://www.npmjs.com/package/${encodeURIComponent(packageInfo.name)}/v/${packageInfo.version}`;
    const compareUrl = previousTag
      ? `https://github.com/${repository}/compare/${encodeURIComponent(previousTag)}...${encodeURIComponent(packageInfo.tag)}`
      : null;
    const notes = [
      changelogNotes(packageInfo),
      '',
      `**npm:** ${npmUrl}`,
      compareUrl ? `\n**Full changelog:** ${compareUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    const args = [
      'release',
      'create',
      packageInfo.tag,
      '--repo',
      repository,
      '--target',
      targetCommit,
      '--verify-tag',
      '--title',
      packageInfo.tag,
      '--generate-notes',
      '--notes',
      notes,
    ];

    if (previousTag) {
      args.push('--notes-start-tag', previousTag);
    }

    if (packageInfo.version.includes('-')) {
      args.push('--prerelease');
    }

    run('gh', args, { inherit: true });
  }
};

const main = () => {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case 'plan':
      createPlan(getOption(args, '--base'), path.resolve(getOption(args, '--output')));
      break;
    case 'pack':
      packRelease(path.resolve(getOption(args, '--plan')), path.resolve(getOption(args, '--output')));
      break;
    case 'verify':
      verifyRelease(
        path.resolve(getOption(args, '--directory')),
        getOption(args, '--expected'),
        getOption(args, '--head')
      );
      break;
    case 'publish':
      publishRelease(
        path.resolve(getOption(args, '--plan')),
        path.resolve(getOption(args, '--directory')),
        getOption(args, '--head')
      );
      break;
    case 'github-release':
      createGitHubReleases(
        path.resolve(getOption(args, '--plan')),
        getOption(args, '--repository'),
        getOption(args, '--target')
      );
      break;
    default:
      throw new Error(`Unknown release command: ${command ?? '(missing)'}.`);
  }
};

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
}
