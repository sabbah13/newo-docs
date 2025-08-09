# Google Places Picker Widget

The Google Places Picker widget allows users to enter a location and get redirected to the Newo.ai Agent Creator. This makes it easy for businesses to integrate the Agent Creator on their website while maintaining their branding. Here's an example of the Google Places Picker widget on the Newo.ai website:

![](https://files.readme.io/c3a4cce47d4b69ed6416dfaa8423efdfb96a4af7013660722196b909e20812da-Screenshot_2024-11-27_at_17.11.01.png)

Below is an example implementation using '@googlemaps/extended-component-library' and an explanation of how to construct the redirect URL to the Newo.ai Agent Creator in various scenarios.

1.  Set up the Google Maps API by first creating a Google Cloud Platform project:
    1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
    2.  Create a new project or select an existing one.
    3.  Navigate to "API & Services" and then the "Library" section.
    4.  Enable the "Maps JavaScript API" and "Places API" for your project.
    5.  Obtain an API Key by going to "API & Services" and then the "Credentials" section. Click **Create Credentials** and **API Key**. It is recommended that your API key be restricted to avoid unauthorized usage.
2.  Add the "@googlemaps/extended-component-library" to the `<head>` of your HTML site:

```
<script type="module" src="https://unpkg.com/@googlemaps/extended-component-library"></script>
```

3.  Place an API Loader element in the root of your app's HTML, specifying your API Key:

```
<gmpx-api-loader key="YOUR_GOOGLE_API_KEY"></gmpx-api-loader>
```

4.  Place the [PlacePicker](https://github.com/googlemaps/extended-component-library/blob/HEAD/src/place_picker/README.md) component below the API loader to allow users to select a location:

```
<gmpx-place-picker placeholder="Enter a place"></gmpx-place-picker>
```

5.  Style the Picker by adding CSS components and adjusting the values. For example:

```
.wrapper {
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
}
.input {
    flex: 1;
}
.link {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 0.5rem 2rem;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 0.25em;
}
```

When a user selects a location, you can redirect them to the Newo.ai Agent Creator using the following link format:

```
https://agent.newo.ai/creator?source=${picker.value.googleMapsURI}&source_type=google_map
```

You can optionally include a referral parameter, allowing you to track referrals for your agents:

```
https://agent.newo.ai/creator?source=${websiteUrl}&source_type=website&[email protected]
```

Below is a complete HTML example that (1) sets up the Places Picker, (2) captures the selected place, and (3) constructs the recommended redirect URL to the Newo.ai Agent Creator.

```
<html lang="en">
<head>
 <title>Places API example</title>
 <script type="module" src="https://unpkg.com/@googlemaps/extended-component-library"></script>
 <style>
   .wrapper {
     display: flex;
     align-items: stretch;
     gap: 0.5rem;
   }
   .input {
     flex: 1;
   }
   .link {
     display: inline-flex;
     justify-content: center;
     align-items: center;
     padding: 0.5rem 2rem;
     background-color: #007bff;
     color: white;
     text-decoration: none;
     border-radius: 0.25em;
   }
 </style>
</head>
<body>
<gmpx-api-loader key="GOOGLE_API_KEY"></gmpx-api-loader>
<div class="wrapper">
 <gmpx-place-picker placeholder="Enter a place" id="place-picker" class="input"></gmpx-place-picker>
 <a class="link" href="" id="link">Go To Creator</a>
</div>
<script>
 const picker = document.getElementById('place-picker');
 const link = document.getElementById('link');
 link.addEventListener('click', (event) => {
   if (!picker.value) {
     event.preventDefault();
     return false;
   }
   const redirectUrl = `https://agent.newo.ai/creator?source=${googleMapsURI}&source_type=google_map`;
 });
</script>
</body>
</html>
```

Updated 4 months ago

* * *
