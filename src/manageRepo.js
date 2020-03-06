const ora = require('ora');
const fs = require('fs');
const simpleGitPromise = require('simple-git/promise')();
const touch = require('touch');
const {without} = require('ramda')
const  {
  askRepoDetails,
  askIgnoreFiles
}= require('./prompt');

const createRemoteRepo = async (client) => {
  const answers = await askRepoDetails();
  const data = {
    name: answers.name,
    description: answers.description,
    private: answers.visibilty === 'private'
  };

  const spinner = ora('Creating remote repository').start();

  try {
    const response = await client.repos.createForAuthenticatedUser(data);
   
    return response.data.html_url;
  } finally {
    spinner.stop();
  }
};

const createGitIgnore = async () => {
  const filelist = without(['.git','.gitignore'],fs.readdirSync('.'));

  if (filelist.length) {
    const answers = await askIgnoreFiles(filelist);

    if (answers.ignore.length) {
      fs.writeFileSync('.gitignore', answers.ignore.join('\n'));
    } else {
      touch('.gitignore');
    }
  } else {
    touch('.gitignore');
  }
};

const setupRepo = async url => {
  const spinner = ora(
    'Initializing local repo and pushing to remote...'
  ).start();

  try {
    simpleGitPromise
      .init()
      .then(simpleGitPromise.add('.gitignore'))
      .then(simpleGitPromise.add('./*'))
      .then(simpleGitPromise.commit('Initial commit'))
      .then(simpleGitPromise.addRemote('origin', url))
      .then(simpleGitPromise.push('origin', 'master'));
  } finally {
    spinner.stop();
  }
};

module.exports = {
  createRemoteRepo,
  createGitIgnore,
  setupRepo
};
