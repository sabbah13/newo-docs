/*
 Generates a Kodemo document JSON from project source files.
 Outputs to static/kodemo/conversation-started.json
*/
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const websiteRoot = path.resolve(__dirname, '..');

// Document specifications
const DOC_SPECS = [
  {
    id: 'conversation-started',
    title: 'Conversation Started Walkthrough',
    subjects: [
      ['cs-skill', 'ConversationStartedSkill', 'project/ConvoAgent/CAMainFlow/ConversationStartedSkill.guidance'],
      ['common-cs', 'CommonConversationStartedSkill', 'project/ConvoAgent/CAMainFlow/CommonConversationStartedSkill.guidance'],
      ['switch-skill', 'SwitchConversationStartedSkill', 'project/ConvoAgent/CAMainFlow/SwitchConversationStartedSkill.guidance'],
      ['gen1-in', 'Gen1 Inbound', 'project/ConvoAgent/CAMainFlow/Gen1ConversationStartedInboundSkill.guidance'],
      ['gen1-out', 'Gen1 Outbound', 'project/ConvoAgent/CAMainFlow/Gen1ConversationStartedOutboundSkill.guidance'],
      ['gen2-in', 'Gen2 Inbound', 'project/ConvoAgent/CAMainFlow/Gen2ConversationStartedInboundSkill.guidance'],
      ['gen2-out', 'Gen2 Outbound', 'project/ConvoAgent/CAMainFlow/Gen2ConversationStartedOutboundSkill.guidance'],
      ['greet-out', 'GreetUserOutboundSkill', 'project/ConvoAgent/CAMainFlow/GreetUserOutboundSkill.guidance'],
      ['update-prompt', 'Gen2UpdateCurrentPromptSkill', 'project/ConvoAgent/CAMainFlow/Gen2UpdateCurrentPromptSkill.guidance'],
      ['make-fast-prompt', '_makeFastPrompt', 'project/ConvoAgent/CAMainFlow/_makeFastPrompt.guidance'],
      ['gen2-fast-prompt', '_gen2MakeFastPromptSkill', 'project/ConvoAgent/CAMainFlow/_gen2MakeFastPromptSkill.guidance'],
      ['set-followup', '_utilsSetFollowUpTimerSkill', 'project/ConvoAgent/CAMainFlow/_utilsSetFollowUpTimerSkill.jinja'],
      ['update-meta', 'UpdateConversationMetaSkill', 'project/ConvoAgent/CAMainFlow/UpdateConversationMetaSkill.guidance'],
      ['start-session', '_startNewSessionSkill', 'project/ConvoAgent/CAMainFlow/_startNewSessionSkill.guidance'],
      ['create-phone-actors', '_utilsCreatePhoneActorsSkill', 'project/ConvoAgent/CAMainFlow/_utilsCreatePhoneActorsSkill.guidance'],
    ],
    storySections: [
      ['intro', 'cs-skill', 'v1', '<h2>Conversation Started</h2><p>The main entry point is <code>conversation_started</code> handled by <code>ConversationStartedSkill</code>.</p>'],
      ['common', 'common-cs', 'v1', '<p><code>CommonConversationStartedSkill</code> centralizes shared setup (state resets, RAG, timers, session meta).</p>'],
      ['mode', 'switch-skill', 'v1', '<p>Switching selects Gen1/Gen2 inbound/outbound per <code>voice_mode</code>.</p>'],
      ['gen1in', 'gen1-in', 'v1', '<p>Gen1 inbound flow executes greeting, fast prompt, common steps.</p>'],
      ['gen1out', 'gen1-out', 'v1', '<p>Gen1 outbound flow sets fast prompt and state.</p>'],
      ['gen2in', 'gen2-in', 'v1', '<p>Gen2 inbound flow greets via commands, updates prompt, common steps.</p>'],
      ['gen2out', 'gen2-out', 'v1', '<p>Gen2 outbound flow applies outbound delay, follow-up timers and greeting; then updates prompt and common steps.</p>'],
      ['timers', 'set-followup', 'v1', '<p>Follow-up timers are applied based on inbound/outbound context.</p>'],
      ['prompt', 'make-fast-prompt', 'v1', '<p>Fast prompts are built to initialize session/system context.</p>'],
      ['meta', 'update-meta', 'v1', '<p>Session metadata is updated for analytics and routing.</p>'],
      ['session', 'start-session', 'v1', '<p>New session creation also sets the program timer for session timeout.</p>'],
      ['phones', 'create-phone-actors', 'v1', '<p>Phone actors are created to represent user phone endpoints.</p>'],
    ],
  },
  {
    id: 'conversation-ended',
    title: 'Conversation Ended & Follow-up',
    subjects: [
      ['ended', 'ConversationEndedSkill', 'project/ConvoAgent/CAMainFlow/ConversationEndedSkill.guidance'],
      ['callback-check', '_checkIfAgentShouldCallBackSkill', 'project/ConvoAgent/CAMainFlow/_checkIfAgentShouldCallBackSkill.jinja'],
      ['followup', 'FollowUpSkill', 'project/ConvoAgent/CAMainFlow/FollowUpSkill.guidance'],
      ['set-followup', '_utilsSetFollowUpTimerSkill', 'project/ConvoAgent/CAMainFlow/_utilsSetFollowUpTimerSkill.jinja'],
    ],
    storySections: [
      ['end', 'ended', 'v1', '<h2>Conversation End</h2><p>Handles finalization and computes follow-up logic.</p>'],
      ['cb', 'callback-check', 'v1', '<p>Determines whether a callback should be scheduled with time windows/reasons.</p>'],
      ['fu', 'followup', 'v1', '<p>Orchestrates follow-up messaging/calling based on timers and state.</p>'],
    ],
  },
  {
    id: 'reply-routing',
    title: 'Reply Routing & Outbound Greeting',
    subjects: [
      ['switch-reply-out', 'SwitchReplyOutboundSkill', 'project/ConvoAgent/CAMainFlow/SwitchReplyOutboundSkill.guidance'],
      ['greet-out', 'GreetUserOutboundSkill', 'project/ConvoAgent/CAMainFlow/GreetUserOutboundSkill.guidance'],
      ['real-user', 'RealUserMessageSkill', 'project/ConvoAgent/CAMainFlow/RealUserMessageSkill.guidance'],
      ['phone-reply', 'UserPhoneReplySkill', 'project/ConvoAgent/CAMainFlow/UserPhoneReplySkill.guidance'],
      ['sms-reply', 'UserSMSReplySkill', 'project/ConvoAgent/CAMainFlow/UserSMSReplySkill.guidance'],
      ['chat-reply', 'UserNewoChatReplySkill', 'project/ConvoAgent/CAMainFlow/UserNewoChatReplySkill.guidance'],
    ],
    storySections: [
      ['router', 'switch-reply-out', 'v1', '<h2>Reply Routing</h2><p>Outbound vs inbound replies are routed here.</p>'],
      ['greet', 'greet-out', 'v1', '<p>Outbound greeting timing and follow-up timer setup.</p>'],
      ['real', 'real-user', 'v1', '<p>Real user messages are normalized and forwarded into the generation pipeline.</p>'],
    ],
  },
  {
    id: 'session-and-state',
    title: 'Session, State & Attributes',
    subjects: [
      ['reset', '_utilsResetSessionStateSkill', 'project/ConvoAgent/CAMainFlow/_utilsResetSessionStateSkill.guidance'],
      ['get-channel', '_utilsGetConversationChannelSkill', 'project/ConvoAgent/CAMainFlow/_utilsGetConversationChannelSkill.guidance'],
      ['persona-defaults', '_utilsPersonaAttributeGetWithDefaultsSkill', 'project/ConvoAgent/CAMainFlow/_utilsPersonaAttributeGetWithDefaultsSkill.guidance'],
      ['update-meta', 'UpdateConversationMetaSkill', 'project/ConvoAgent/CAMainFlow/UpdateConversationMetaSkill.guidance'],
      ['start-session', '_startNewSessionSkill', 'project/ConvoAgent/CAMainFlow/_startNewSessionSkill.guidance'],
    ],
    storySections: [
      ['state', 'reset', 'v1', '<h2>Session & State</h2><p>Resets and initializes state at conversation boundaries.</p>'],
      ['chan', 'get-channel', 'v1', '<p>Derives the conversation channel to route behavior.</p>'],
      ['defaults', 'persona-defaults', 'v1', '<p>Utility accessors for persona attributes with defaults.</p>'],
      ['meta', 'update-meta', 'v1', '<p>Metadata updates (actor ids, timestamps, analytics).</p>'],
    ],
  },
];

function readFile(relPath) {
  const abs = path.join(repoRoot, relPath);
  return fs.readFileSync(abs, 'utf8');
}

function escapeHtml(code) {
  return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildStory(sections) {
  return sections
    .map(([id, subjectId, versionId, html]) => {
      return html.replace('<p', `<p data-effect-id="${id}" data-effect-subject="${subjectId}" data-effect-version="${versionId}"`);
    })
    .join('');
}

function guessDisplayName(name, filePath) {
  if (filePath.endsWith('.jinja')) return `${name}.jinja`;
  if (filePath.endsWith('.guidance')) return `${name}.hbs`;
  return `${name}.txt`;
}

function buildSubjects(subjectTriples) {
  const subjects = {};
  for (const [id, name, file] of subjectTriples) {
    const code = readFile(file);
    subjects[id] = {
      type: 'code',
      name: guessDisplayName(name, file),
      versions: {
        v1: { value: code },
      },
    };
  }
  return subjects;
}

function main() {
  const outDir = path.join(websiteRoot, 'static', 'kodemo');
  fs.mkdirSync(outDir, { recursive: true });

  const index = [];

  for (const spec of DOC_SPECS) {
    const doc = {
      version: 1,
      title: spec.title,
      story: buildStory(spec.storySections),
      subjects: buildSubjects(spec.subjects),
      subjectIndex: spec.subjects.map(([id]) => id),
      // Add code-highlighting metadata so Kodemo renders language hints
      languages: {
        default: 'handlebars',
      },
    };
    const outPath = path.join(outDir, `${spec.id}.json`);
    fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), 'utf8');
    index.push({ id: spec.id, title: spec.title, path: `/kodemo/${spec.id}.json` });
    // eslint-disable-next-line no-console
    console.log('Kodemo document written:', outPath);
  }

  const indexPath = path.join(outDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
}

main();


