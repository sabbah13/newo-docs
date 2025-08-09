# SendCommand

Sends a command to a connector. A full list of commandIdn's can be found [here](command-identifier-list.md). See the examples below for the arbitrary arguments applicable to each commandIdn.

```
SendCommand(
  commandIdn: str,
  integrationIdn: str,
  connectorIdn: str,
  **arguments: str
)
```

*   **commandIdn:** The connector command identifier.
*   **integrationIdn:** The integration identifier (program\_timer, twilio, vapi, sandbox, etc.).
*   **connectorIdn:** The connector identifier.
*   **\*\*arguments:** Arbitrary arguments sent along with the message.

In the example below, the connector will call the number +16507000000. If the user picks up the phone, a persona and actor will be created for them if necessary (if this is a new user), and responses will be generated in a new flow instance that has a subscription to the user\_message event from the vapi/vapi\_caller connector. Ensure you have created a Vapi connector with the connectorIdn as "vapi\_caller." Additionally, change the "phoneNumber" to call your phone for testing purposes.

```
{{SendCommand(
  commandIdn="make_call", 
  integrationIdn="vapi", 
  connectorIdn="vapi_caller", 
  phoneNumber="+16507000000",
  greetingPhrase="Hello, how can I assist you today?"
)}}
```

*   **phoneNumber:** The phone number that will be called when the SendCommand action is activated.
*   **greetingPhrase:** A greeting phrase the agent will say once the call has been answered.

See "[Make Telephone Calls (Vapi)](make-telephone-calls-vapi.md)" for a full walk-through example.

In the examples below, timers are set up using various arguments. Programmable timers support "set\_timer" or "set\_repeatable\_timer." Both commands can use the "fireAt" and "interval" parameters.

The below SendCommand action activates a timer once at 2024-02-20\[T\]22:17.

```
{{SendCommand(
  commandIdn="set_timer", 
  integrationIdn="program_timer", 
  connectorIdn="fire_timer", 
  fireAt="2024-02-20T22:17", 
  personaId=GetUser(field="id"), 
  timerName="MyTimer", 
  repeatable="false"
)}}
```

*   **personaId:** The ID of the persona for whom the timer is to be set.
*   **timerName:** The name of the timer (must be unique for the persona).
*   **fireAt:** The date/time of timer activation in the format: YYYY-MM-DD\[T\]HH:MM\[:SS\[.ffffff\]\]\[Z or HH\[:\]MM.
*   **repeatable:** Set as "true" or "false." If "true," the timer activation repeats after the interval. The default is "false." If repeatable="true," then the interval is mandatory. If repeatable="false", fireAt and interval are set, then the interval is ignored. If repeatable="true," fireAt and interval are set, then the timer will first activate at fireAt and then will repeat after the interval.

The below SendCommand action activates a timer once after 120 seconds.

```
{{SendCommand(
  commandIdn="set_timer", 
  integrationIdn="program_timer", 
  connectorIdn="my_timer", 
  personaId=GetUser(field="id"), 
  timerName="followup_timer_2", 
  interval="120"
)}}
```

*   **interval:** The interval after which the timer will activate in seconds.

The below SendCommand action activates a timer at 2024-02-20\[T\]22:17 and repeatedly activates thereafter every 240 seconds.

```
{{SendCommand(
  commandIdn="set_repeatable_timer", 
  integrationIdn="program_timer", 
  connectorIdn="my_timer", 
  personaId=GetUser(field="id"), 
  timerName="followup_timer_3", 
  interval="240",
  fireAt="2024-02-20T22:17"
)}}
```

The below SendCommand action creates a timer but disables it.

```
{{SendCommand(
  commandIdn="set_timer", 
  integrationIdn="program_timer", 
  connectorIdn="my_timer", 
  personaId=GetUser(field="id"), 
  timerName="followup_timer_3", 
  enabled="false"
)}}
```

*   **enabled:** Set as "true" or "false." Sets whether the timer is active or not.

The below SendCommand action creates a timer and enables it.

```
{{SendCommand(
  commandIdn="set_timer", 
  integrationIdn="program_timer", 
  connectorIdn="my_timer", 
  personaId=GetUser(field="id"), 
  timerName="followup_timer_3", 
  enabled="true"
)}}
```

In the example below, the connector will send an SMS to the number +16507000000. Ensure you have created a Twilio Messenger connector with the connectorIdn as "sms\_connector" for the below Skill Script to work. Additionally, change the "phoneNumber" to call your phone for testing purposes.

```
{{SendCommand(  
    commandIdn="send_message",  
    integrationIdn="twilio_messenger",  
    connectorIdn="sms_connector",  
    text="Hello, how can I assist you today?",  
    phoneNumber="+16507000000"  
)}}
```

Updated 4 months ago

* * *
