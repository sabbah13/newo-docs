GetTriggeredAct

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetTriggeredAct

Search

All

Pages

###### Start typing to search…

# GetTriggeredAct

Returns the field(s) of the action that initiated the execution of the flow instance. For example, if a user\_message event occurs and a flow with a subscription to user\_message is activated, then if this action is called in the Skill, it will refer to the action of the message.

```
GetTriggeredAct(
  fields: List[str]
)
```

#### 

Where:

[](#where)

*   **fields:** \["timeInterval", "text", "datetime", "englishText", "originalText", "languageCode", "personaName"\]. You can specify one or more fields separated by commas. You can also specify the name of an argument that is set when sending a message or event.
    *   **timeInterval:** time interval between triggered act and previous act in seconds;
    *   **text:** message text, if applicable;
    *   **datetime:** time of act;
    *   **englishText:** the text of the message in English, if applicable;
    *   **originalText:** original text of the message without filters and not translated into English, if applicable;
    *   **languageCode:** the code of the language in which the message was written, if applicable;
    *   **personaName:** the name of the persona who committed the act;
    *   **any argument name:** you can also specify the name of an argument that is set when sending a message or event.

### 

Example (View All Field Responses)

[](#example-view-all-field-responses)

This example will return all field values of the action that initiated the execution of the flow. In this case, the execution of the flow is initiated by a user sending a message in the Sandbox chat. Ensure an event has been set up to trigger when a user sends a message. Let's say the user, Ryan, sent a message, "Hello," in English at approximately 13:32 on the 21st of January 2024.

Skill ScriptResponse

```
{{set(name='test', value=GetTriggeredAct(fields=['timeInterval', 'text', 'datetime', 'englishText', 'originalText', 'languageCode', 'person']))}}

{{SendMessage(message=test)}}
```

```
0 
Hello 
2024-01-21 12:32:00.784000 
Hello 
Hello 
en 
Ryan
```

Updated 4 months ago

* * *
