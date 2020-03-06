#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const {
  getStoredGithubToken,
  getPersonalAccessToken,
  getAuthorizedClient
} = require('./src/auth');
const {
  createRemoteRepo,
  setupRepo,
  createGitIgnore
} = require('./src/manageRepo');

const directoryExists = path => fs.existsSync(path);

if (directoryExists('.git')) {
  console.log(chalk.red('Already a git repo'));
  process.exit();
}

const getGithubToken = async () => {
  let token = getStoredGithubToken();

  if (token) {
    return token;
  }

  token = await getPersonalAccessToken();

  return token;
};

const run = async () => {
  try {
    const token = await getGithubToken();

    const authorizedClient = await getAuthorizedClient(token);

    const url = await createRemoteRepo(authorizedClient);

    await createGitIgnore();

    await setupRepo(url);

    console.log(chalk.green('All done!'));
  } catch (err) {
    console.log(err);
  }
};

run();
