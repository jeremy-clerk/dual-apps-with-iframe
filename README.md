# Seamlessly iframing a secondary Clerk application inside a primary Clerk application. 
The user story and use case is that they are required to have two separate Clerk applications as they are two separate
legal entities. 

Users who sign up for the Tier 1 application are automatically granted access to the Tier 2 application. 

Users who signup for the Tier 2 application are only granted access to the Tier 2 application. 

The Tier 1 application will have portions of the Tier 2 app iframed inside of it for a seamless user experience. 

The goal is for users of the Tier 1 application to sign in to the Tier 1 application and then be able to be signed-in to the Tier 2 application as well.  

## General Outline 

Tier 1 application and Tier 2 application are separate applications in Clerk with separate user bases. 

The Tier 2 application should operate independently of the Tier 1 application. 

The Tier 1 application will have the Tier 2 application iframed within the application. 


## Making It Work 

### NOTE --- this requires Clerk enabling "Experimental Same Site None" on the Tier 2 application. This sets the cookies to be 'SameSite=None' which is a security risk. Users will need to sign a legal disclaimer stating that they understand the risks.

### Linking the users 
When a user is created in the **Tier 1** application a webhook is sent to the **Tier 2** application.
- The Tier 2 application will create the user in the Tier 2 application.
  - The `external_id` property of the User in the Tier 2 application is set to the Tier 1 users `id` property.
  - The `external_id` property of the User in the _Tier 1_ application is set the `id` property of the Tier 2 application. 


### Signing the user in to Tier 2 from Tier 1

When the Tier 1 application loads the Tier 2 application in an iframe if the Tier 2 application is not signed in

- Tier 2 redirects to an intermediary route. This route detects if the application is iframed.
  - If the application is iframed it sends a message to the parent window to request a sign-in. 
  - The parent window (Tier 1) sends a request to an api endpoint on the Tier 2 application
    - This request contains the JWT from the Tier 1 user. 
  - When the Tier 2 application receives the request, it will verify that the Tier 1 user is signed in. 
  - If the user is signed in, it will generate a sign-in token for the corresponding Tier 2 user. 
  - The sign-in token is returned to the Tier 1 application. 
  - The Tier 1 application sends a message to the iframed child window (Tier 2) with the sign-in token. 
  - The Tier 2 application responds to this message by redirecting to sign in with the `__clerk_ticket` parameter set to the value of the sign in token. 
  - The Tier 2 application signs the user in and the app will function as normal. 

    
# Requirements

"Experimental Same Site None" needs to be enabled on the Tier 2 application, and the legal waiver signed. 

The Tier 2 application needs to have the Clerk secret key and publishable key for both Tier 1 & Tier 2 applications.

The session JWT needs to be customized to include the `external_id` of the user as `externalId` (in this example)

HIGHLY RECOMMENDED to set the CSP for the Tier 2 application to _only allow_ iframing from the Tier 1 origin. 

# Other Considerations and Recommendations

- If the user is already signed in to the Tier 2 application, it would be recommended to perform some sort of check that it is the correct user. 
- When signing out from Tier 1 - recommended to sign the user out from the Tier 2 app as well. 
- It would be possible to sign in the user to the Tier 2 app automatically on sign in from the Tier 1 app, but it would require that the iframe be present on all routes.
- Handle redirects (i.e. if the iframe should be showing `/some-path/sub-path` this is currently not handled. The redirect_url would need to be set when sending the `__clerk_ticket` parameter and unset the `SIGN_IN_FORCE_REDIRECT_URL`)


## Notes 
This is not an officially supported or recommended use of Clerk.

This can expose your application to security vulnerabilities, and you are responsible for mitigating potential security flaws. 

This was tested for proof of concept with 2 separate production domains. It was not tested for every possibility. 
