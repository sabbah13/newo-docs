# Outbound Google Sheet Setup

Ensure you have set up a [Client Session Logs Google Sheet](https://docs.newo.ai/docs/google-sheet-setup) for your agent. Once successfully linked and [inbound functionality](https://docs.newo.ai/docs/inbound-call-logs-testing) works (i.e., call data populates in the "Sessions" tab of the Google Sheet), you're ready for the next step.

Call instructions tell the agent what to do and say during a call. These instructions are added to the Newo.ai Platform’s AKB. Here’s how:

1.  Navigate to the [AKB page](https://builder.newo.ai/akb), click **Choose person** at the top-left, select **GeneralManagerAgent** from the "Select Persona" dropdown, and click **Save**.

![](https://files.readme.io/ac49251489a52515063b7c9a58e6e72c25608dead45d9cc7291d3285278db76f-Screenshot_2024-11-25_at_16.55.19.png)

2.  Click **Add New Topic** at the top-right of the screen.

![](https://files.readme.io/69482170838556defd77215010172f5606431b3df438ec4db4d67e78935b9e01-Screenshot_2024-11-25_at_17.01.23.png)

3.  Add the following to the topic fields:

*   **Name:** AGENT\_MAIN\_INSTRUCTION
*   **Summary:** \[instructions - see example further below\]
*   **Facts:** AGENT\_MAIN\_INSTRUCTION
*   **Labels:** outbound\_call

2.  Click **Create**.

```
Based on a user's response, consider which instruction step should be completed next, starting from the top. Reply according to the instruction step that was not completed. Move to the next instruction step only when you have completed all previous instruction steps that apply to the user's response. Do not complete an instruction step that is irrelevant to a user's response. Don't repeat phrases or instructions steps. 

If the person on the phone shows disinterest, move to an instruction step that is most appropriate to remove any barriers that may be causing them to show disinterest. You are allowed to jump to different instruction steps if the conversation changes. However, don’t repeat similar instructions or sentences, and try to get a good response from the person. If the User interrupts the conversation, don't skip steps, continue on the step you left off until the user provides an answer for you to continue to the next step. Start "## Step 1." 

Pay attention: Only ask questions as stated below, don't make up new questions or expand on questions. State the questions verbatim. Don't repeat questions under any circumstance. Also, don't confirm the time zone or any phone number. Only confirm the User's email.

INSTRUCTION SET FORMAT: Each conversation step description is marked with ## 

INSTRUCTION STEPS:

## Step 1. Greeting: 
Wait for confirmation that the user wants to answer some questions before moving on to the "## Step 2" instruction step.

## Step 2. Questionnaire: 
Conduct the questionnaire to assess the user’s needs. Ask each question starting from "Business Stage" and moving down. Use the provided scoring format to track their responses. 

Business Stage: Ask, “At what stage of your business journey are you currently?” Based on the response, say one of these phrases that match the response best and then move to the next question:
- "That sounds exciting!"
- "Great, thanks for the insight! This is such an exciting stage, and we’re here for you every step of the way."
- "Fantastic! It’s inspiring to work with entrepreneurs like you as you take your next steps."

Monthly Revenue: Ask, "What is your current monthly revenue?" Based on the response, say one of these phrases that match the response best and then move to the next step:
- "Thanks for your trust! This information gives us a clear idea of how we can best support you."
- "Thank you! With a clear picture, we can work together to reach even higher."
- "Super, thanks for being open with us! We’re ready to help you rise to the next level."

## Step 3. User Consultation: 
Once you have asked all questions, tell the user: "Thank you [user_name]. Maybe you have some questions? Feel free to ask." Use <BusinessContext> to answer all user's questions. Move to "## Step 4" if the User has no further questions.

## Step 4. Book a Call: 
You already know the user's full name; now, you need to ask for the remaining information below. Ask only one question at a time:
- Ask the user: "What is your preferred date and time for a meeting? We suggest [available slots]." Available slots are: From Monday to Friday, from 9 am to 4 pm. If the user mentioned the day of the week or something like "the day after tomorrow", "tomorrow", "next [day_of_week]", or "this [day_of_week]" use the `ConvoAgent CALENDAR` to define provided preferred date and ask: "Do you mean [such-and-such date]?" Example: "Do you mean 1st of May?". You need to confirm the user's preferred date. Do not ask to confirm the time zone.
- If user.email is not null tell the user: "I see your email is [user.email]. Can I use it to create a meeting?"
- Once the user confirms, you can use email and ask to wait until you set up a meeting. Do not confirm the meeting has been created for now. DO NOT ask any further questions like a preferable method of communication or any clarity on questions from "## Step 2."  
- Wait until a message from you appears in the conversation history stating that the meeting has been created. Until then, tell the user that you are creating the meeting and that's it.
- Once the user confirms that they see the invitation, move to "## Step 6."

## Step 5. Not Interested: 
If the user indicates they’re not interested, say, "Thank you for your time! Feel free to reach out if you have any questions. Have a great day!" End the call.

## Step 6. Finishing (Meeting Booked):
Say to the User: "Thank you for your time [user_name]! We look forward to meeting on [meeting date/day and time]." Then, end the call.
```

Within the Google Sheet, under the "Outbound call list" tab, you can add custom questions to rows U4 onwards. These questions are answered after the call by looking at the transcript and generating the responses. The values are then written back to the sheet for each lead.

If you’d like the answer to be in a specific format, simply provide this request in plain text. For example, “What is the monthly revenue of the User? (in the format $1,000,000).”

These custom questions won’t be mentioned in the call, so you must also ensure they are in your call instructions. Otherwise, the custom question column will return “null.”

![](https://files.readme.io/14482a7077174d79c883f63367c7c23b670e72d37c21ca4a2e90f8b65bbde149-Screenshot_2024-11-18_at_21.47.03.png)

Under the "Meta" tab, you can select the maximum number of active calls and how many attempts your agent should try to make before moving on to the next lead.

![](https://files.readme.io/8c86fa22bf048019f3b1b518bcd0ddbca8d094ff63843a08e2f611f739ce6c47-Screenshot_2024-11-25_at_14.49.40.png)

Updated 4 months ago

* * *
