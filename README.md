# single-spa-html with js example

This is an example application that uses [single-spa-html](https://single-spa.js.org/docs/ecosystem-html-web-components/) that is enhanced with plain JavaScript.

This example is modeled after a simple usecase: obtaining cookie consent from your users. The markup is relatively simple, the interactions don't do much, but some JavaScript is required to get it to work. This example highlights the following features: 

- using single-spa-html along with plain JavaScript
- html template is extracted out of the js file
- styles are included
- transitions in and out

`index.js` is commented to show how and why the code is written the way it is. To reset the UI after having "accepted", delete the `cookie-consent` localStorage value using your browser's devtools. 

## How to run

- `git clone git@github.com:filoxo/single-spa-html-with-js-example.git`
- `yarn install`
- `yarn start`
- Include this module in your import map (typically in the root-config)

    ```js
    {
      imports: {
        ... // other imports
        "@example/cookie-consent": "http://localhost:8080/index.js"
      }
    }
    ```
- [Register as a single-spa application](https://single-spa.js.org/docs/api/#registerapplication) in your root config

    ```js
    registerApplication({
      name: "@example/cookie-consent",
      app: () => System.import("@example/cookie-consent"),
      activeWhen: ["/"],
    })
    ```
