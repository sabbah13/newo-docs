# Instant Callback Agent

The Instant Callback functionality enables your AI Agent to perform immediate outreach to users who have just submitted a form on your website. This allows for real-time engagement by automatically contacting users via SMS, email, phone calls, or scheduling meetings based on their form inputs.

When a user submits a form on your website, an HTTP POST request is triggered (set up on your website backend). This request contains a pre-configured webhook URL with a JSON payload containing the requested action in an `external_request` field. The AI Agent then initiates the appropriate communication channel without delay.

You can implement Instant Callback using a simple HTML form where the user's contact information is dynamically inserted into the request:

```
<form action="https://your-webhook-url.com" method="POST">
  <div>
    <label for="name">Your Name:</label>
    <input type="text" id="name" name="name" required>
  </div>
  <div>
    <label for="phone">Phone Number:</label>
    <input type="tel" id="phone" name="phone" required>
  </div>
  <input type="hidden" id="externalRequest" name="external_request">
  <button type="submit" onclick="setRequestValue()">Submit</button>
  
  <script>
    function setRequestValue() {
      const phone = document.getElementById('phone').value;
      const name = document.getElementById('name').value;
      document.getElementById('externalRequest').value = 
        `Send an SMS with the following content: Hi ${name}! I'm Adrian, an AI consultant from Newo. Congratulations on your submission!. To the phone number: ${phone}`;
    }
  </script>
</form>
```

For more control over JSON payloads, use JavaScript to handle the form submission:

```
<script>
  document.getElementById('callbackForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Get the user's input values from the form
    const formData = new FormData(this);
    const phone = formData.get('phone');
    const email = formData.get('email');
    const name = formData.get('name');
    
    // Construct the external_request with the dynamic user data
    fetch('https://your-webhook-url.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        external_request: \`Send an SMS with the following content: Hi ${name}! I'm Adrian, an AI consultant from Newo. Congratulations on your submission!. To the phone number: ${phone}\`
      })
    });
  });
</script>
```

Use this command to have your AI Agent send text messages to users immediately after form submission. The phone number is dynamically filled from the form input:

```
{  
  "external_request": "Send an SMS with the following content: Hi! I'm Adrian, an AI consultant from Newo. Congratulations, you've just created your AI Employee! To complete the setup, you'll need to meet with my human colleague. Would tomorrow be convenient for you?. To the phone number: ${phoneNumber}"  
}
```

Use this command to have your AI Agent send emails to users instantly. The email address is dynamically filled from the form input:

```
{  
  "external_request": "Send an email with the following content: Hi! I'm Adrian, an AI consultant from Newo. Congratulations, you've just created your AI Employee!. To the ${userEmail}"  
}
```

Use this command to have your AI Agent call users directly after they submit the form. The phone number is dynamically filled from the form input:

```
{  
  "external_request": "Call the user to know how they are doing using this phone number: ${phoneNumber}"  
}
```

Use this command to have your AI Agent schedule meetings with users automatically. The email address is dynamically filled from the form input:

```
{  
  "external_request": "Create a meeting with the user on 04.03.2025 at 2 pm using their email ${userEmail}"  
}
```

Make an HTTP request to your webhook URL with the following specifications:

*   Method: POST
*   URL: Your configured webhook URL (ask the Newo team for your unique webhook)
*   Headers:
    *   Content-Type: application/json
    *   Body: One of the JSON objects containing the `external_request` field with dynamic values from your form

Updated 4 months ago

* * *
