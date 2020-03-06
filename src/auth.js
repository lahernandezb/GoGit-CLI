const ora= require('ora');
const Configstore = require('configstore');
const { Octokit } = require('@octokit/rest');
const { createBasicAuth } = require('@octokit/auth-basic');
const {
  askGithubCredentials,
  get2FaCode
} = require('./prompt');
const pkg = require('../package.json');

const conf = new Configstore(pkg.name);

const getStoredGithubToken = () => conf.get('github.token');

const getPersonalAccessToken = async () => {
  const credentials = await askGithubCredentials();
  const spinner = ora('Authenticatings, please wait...').start();

  const auth = createBasicAuth({
    username: credentials.username,
    password: credentials.password,
    async on2Fa() {
      spinner.stop();
      const res = await get2FaCode();
      spinner.start();
      return res.twoFaCode;
    },
    token: {
      scopes: ['user','repo'],
    }
  });

  try {
    const { token } = await auth();

    if (token) {
      conf.set('github.token', token);

      return token;
    } else {
      throw new Error('Github token was not found');
    }
  } finally {
    spinner.stop();
  }
};

const getAuthorizedClient = token => {
  return new Octokit({
    userAgent: 'audifred',
    auth: token,
  })
}

module.exports = {
  getStoredGithubToken,
  getPersonalAccessToken,
  getAuthorizedClient,
};
