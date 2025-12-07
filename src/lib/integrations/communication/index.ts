/**
 * Communication Integrations Index
 *
 * Exports all communication integration services.
 */

export { SlackService, slackService } from './slack.service';
export type { SendSlackMessageInput } from './slack.service';

export { GmailService, gmailService } from './gmail.service';
export type { SendEmailInput } from './gmail.service';

export { TeamsService, teamsService } from './teams.service';
export type { SendTeamsMessageInput } from './teams.service';
