import { Application } from 'probot' // eslint-disable-line no-unused-vars

export = (app: Application) => {
  app.on('organization.member_added', async (context) => {

    const res = await context.github.repos.getContents({
      owner: context.payload.repository.owner.login,
      repo: 'org-settings',
      path: '.github/add-member-to-team.yml'
    })

    const content = Buffer.from(res.data.content, 'base64').toString('utf8')

    const yaml = require('js-yaml')
    const config = yaml.safeLoad(content)

    const response = await context.github.query(`query ($login: String!, $team: String!) {
      organization (login: $login) {
        team (slug: $team) {
          id
        }
      }
    }`, { login: config.orgName, team: config.defaultTeam })

    // The `Team` GraphQL type doesn't include the databaseId
    // so we can hack around it by decoding the node id.
    // See https://github.com/github/ecosystem-api/issues/1576

    const decoded = Buffer.from(response.organization.team.id, 'base64').toString()
    const split = decoded.split('Team')
    const id = parseInt(split[split.length - 1], 10)

    const teamParams = Object.assign({}, {
      team_id: id || 0,
      username: context.payload.login || ''
    } || {})

    await context.github.teams.addOrUpdateMembership(teamParams).catch((e) => console.log(e))

  })



}