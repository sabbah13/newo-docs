GetDatetime

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetDatetime

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# GetDatetime

Returns the current date and/or time.

`GetDatetime(   format: Literal["datetime", "date", "time"],   timezone: str,   weekday: str  )`

#### 

Where:

[](#where)

*   **format:** Indicates what value to return (i.e., either the date, time, or both).
*   **timezone:** Indicate a timezone identifier. If a timezone argument is not provided, the actor's timezone\_identifier is used. If an event doesn't have an actor, then the UTC timezone is used to get the current date and time. A list of timezone identifiers can be found [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
*   **weekday:** Adds the weekday to the end of the date/time if set to "true."

### 

Example 1 (Date)

[](#example-1-date)

The code below sets a variable name "date\_" and adds the date to it using the GetDatetime action. The SendMessage action outputs the result in the Sandbox chat. Ensure you set up an event subscription to activate this Skill when sending a message in the Sandbox chat.

`{{set(name="date_", value=GetDatetime(format= "date"))}}  {{SendMessage(message=date_)}}`

#### 

Response: 2024-01-19

[](#response-2024-01-19)

### 

Example 2 (Time)

[](#example-2-time)

The code below sets a variable name "time\_" and adds the time to it using the GetDatetime action. The SendMessage action outputs the result in the Sandbox chat. Ensure you set up an event subscription to activate this Skill when sending a message in the Sandbox chat.

`{{set(name="time_", value=GetDatetime(format= "time"))}}  {{SendMessage(message=time_)}}`

#### 

Response: 09:47:19.479534

[](#response-094719479534)

### 

Example 3 (Date/Time - Timezone Identifier)

[](#example-3-datetime---timezone-identifier)

The code below sets a variable name "datetime\_" and adds the date/time to it using the GetDatetime action. The SendMessage action outputs the result in the Sandbox chat. Ensure you set up an event subscription to activate this Skill when sending a message in the Sandbox chat.

`{{set(name="datetime_", value=GetDatetime(format= "datetime", timezone="America/Los_Angeles"))}}  {{SendMessage(message=datetime_)}}`

#### 

Response: 2024-01-19T09:47:19.479534-07:00

[](#response-2024-01-19t094719479534-0700)

### 

Example 4 (Date/Time - Weekday)

[](#example-4-datetime---weekday)

The code below sets a variable name "datetime\_" and adds the date/time to it using the GetDatetime action. The weekday is also added to the end of the date/time. The SendMessage action outputs the result in the Sandbox chat. Ensure you set up an event subscription to activate this Skill when sending a message in the Sandbox chat.

`{{set(name="datetime_", value=GetDatetime(format= "datetime", timezone="America/Los_Angeles", weekday="true"))}}  {{SendMessage(message=datetime_)}}`

#### 

Response: 2024-01-19T09:47:19.479534-07:00, Thursday

[](#response-2024-01-19t094719479534-0700-thursday)

Updated 4 months ago

* * *

Did this page help you?

Yes

No
