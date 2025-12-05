/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    { type: 'doc', id: 'README', label: '📚 Introduction' },
    
    {
      type: 'category',
      label: '🏗️ Core Platform',
      collapsible: true,
      collapsed: false,
      items: [
        { type: 'doc', id: 'executive-summary', label: '📋 Executive Summary' },
        { type: 'doc', id: 'system-architecture', label: '🏗️ System Architecture' },
        { type: 'doc', id: 'agent-analysis', label: '🤖 Agent Analysis' },
      ],
    },
    
    {
      type: 'category',
      label: '🔄 Event & Flow System',
      collapsible: true,
      collapsed: false,
      items: [
        { type: 'doc', id: 'event-system', label: '🔄 Event System' },
        { type: 'doc', id: 'skill-execution', label: '⚙️ Skill Execution' },
        { type: 'doc', id: 'interaction-diagrams', label: '📊 Interaction Diagrams' },
      ],
    },
    
    {
      type: 'category',
      label: '🤖 Agent Creator',
      collapsible: true,
      collapsed: false,
      items: [
        { type: 'doc', id: 'agent-creator-overview', label: '🎯 Overview' },
        { type: 'doc', id: 'agent-creator-architecture', label: '🏗️ Architecture' },
        { type: 'doc', id: 'agent-creator-flows', label: '🔄 Flows & Skills' },
        { type: 'doc', id: 'agent-creator-diagrams', label: '📊 System Diagrams' },
        { type: 'doc', id: 'agent-creator-development', label: '👨‍💻 Development Guide' },
      ],
    },

    {
      type: 'category',
      label: '🛠️ Development & Integration',
      collapsible: true,
      collapsed: false,
      items: [
        { type: 'doc', id: 'development-guide', label: '👨‍💻 Development Guide' },
        { type: 'doc', id: 'integration-guide', label: '🔧 Integration Guide' },
        { type: 'doc', id: 'integration-setup', label: '🔗 Integration Setup' },
        { type: 'doc', id: 'newo-tools', label: '🔨 Newo Tools' },
        { type: 'doc', id: 'sip-setup', label: '📞 SIP Setup' },
      ],
    },
    
    {
      type: 'category',
      label: '📖 Reference & API',
      collapsible: true,
      collapsed: true,
      items: [
        { type: 'doc', id: 'system-reference', label: '📖 System Reference' },
        { type: 'doc', id: 'actions-api', label: '🔧 Actions API' },
        {
          type: 'category',
          label: '⚡ Actions Reference',
          collapsible: true,
          collapsed: true,
          items: [
            { type: 'doc', id: 'actions/index', label: '📋 All Actions' },
            
            // Communication Actions
            {
              type: 'category',
              label: '📢 Communication',
              collapsible: true,
              collapsed: true,
              items: [
                { type: 'doc', id: 'actions/sendmessage', label: 'SendMessage' },
                { type: 'doc', id: 'actions/sendcommand', label: 'SendCommand' },
                { type: 'doc', id: 'actions/sendsystemevent', label: 'SendSystemEvent' },
              ],
            },
            
            // AI Generation Actions  
            {
              type: 'category',
              label: '🤖 AI Generation',
              collapsible: true,
              collapsed: true,
              items: [
                { type: 'doc', id: 'actions/gen', label: 'Gen' },
                { type: 'doc', id: 'actions/genstream', label: 'GenStream' },
                { type: 'doc', id: 'actions/summarize', label: 'Summarize' },
              ],
            },
            
            // Data & State Management
            {
              type: 'category',
              label: '💾 Data & State',
              collapsible: true,
              collapsed: true,
              items: [
                { type: 'doc', id: 'actions/set', label: 'Set' },
                { type: 'doc', id: 'actions/setstate', label: 'SetState' },
                { type: 'doc', id: 'actions/getstate', label: 'GetState' },
                { type: 'doc', id: 'actions/getmemory', label: 'GetMemory' },
                { type: 'doc', id: 'actions/getvaluejson', label: 'GetValueJSON' },
                { type: 'doc', id: 'actions/updatevaluejson', label: 'UpdateValueJSON' },
              ],
            },
            
            // Context & Identity Actions
            {
              type: 'category',
              label: '👥 Context & Identity',
              collapsible: true,
              collapsed: true,
              items: [
                { type: 'doc', id: 'actions/getactors', label: 'GetActors' },
                { type: 'doc', id: 'actions/createactor', label: 'CreateActor' },
                { type: 'doc', id: 'actions/getagentpersona', label: 'GetAgentPersona' },
                { type: 'doc', id: 'actions/gettriggeredact', label: 'GetTriggeredAct' },
                { type: 'doc', id: 'actions/getcurrentprompt', label: 'GetCurrentPrompt' },
                { type: 'doc', id: 'actions/getuser', label: 'GetUser' },
                { type: 'doc', id: 'actions/updateuser', label: 'UpdateUser' },
              ],
            },
            
            // Date & Time Functions
            {
              type: 'category',
              label: '🕐 Date & Time',
              collapsible: true,
              collapsed: true,
              items: [
                { type: 'doc', id: 'actions/getdatetime', label: 'GetDateTime' },
                { type: 'doc', id: 'actions/getdateinterval', label: 'GetDateInterval' },
              ],
            },
            
            // Data Manipulation & Utilities
            {
              type: 'category',
              label: '🔧 Utilities',
              collapsible: true,
              collapsed: true,
              items: [
                { type: 'doc', id: 'actions/concat', label: 'Concat' },
                { type: 'doc', id: 'actions/stringify', label: 'Stringify' },
                { type: 'doc', id: 'actions/getrandomchoice', label: 'GetRandomChoice' },
                { type: 'doc', id: 'actions/createarray', label: 'CreateArray' },
                { type: 'doc', id: 'actions/isempty', label: 'IsEmpty' },
                { type: 'doc', id: 'actions/isglobal', label: 'IsGlobal' },
                { type: 'doc', id: 'actions/issimilar', label: 'IsSimilar' },
              ],
            },
            
            // Knowledge Base Actions
            {
              type: 'category',
              label: '🧠 Knowledge Base',
              collapsible: true,
              collapsed: true,
              items: [
                { type: 'doc', id: 'actions/setakb', label: 'SetAKB' },
              ],
            },
            
            // Control Flow
            {
              type: 'category',
              label: '🔄 Control Flow',
              collapsible: true,
              collapsed: true,
              items: [
                { type: 'doc', id: 'actions/if', label: 'If' },
                { type: 'doc', id: 'actions/do', label: 'Do' },
                { type: 'doc', id: 'actions/return', label: 'Return' },
                { type: 'doc', id: 'actions/dummy', label: 'Dummy' },
              ],
            },
          ],
        },
      ],
    },
    
    {
      type: 'category',
      label: '💼 Business & Operations',
      collapsible: true,
      collapsed: true,
      items: [
        { type: 'doc', id: 'business-applications', label: '💼 Business Applications' },
        { type: 'doc', id: 'troubleshooting', label: '🐛 Troubleshooting' },
      ],
    },
    
  ],
};

module.exports = sidebars;