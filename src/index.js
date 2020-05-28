import singleSpaHtml from "single-spa-html"; // single-spa helper
import template from "./template.html"; // html template is separated out so that we can get better syntax highlighting
import "./styles.css"; // styles are global so these are based on IDs

const htmlLifecycles = singleSpaHtml({
  domElementGetter: () => {
    const id = "single-spa-application:@org/cookie-consent";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      document.body.prepend(el); // single-spa automatically _appends_, but this content should be _prepended_ for accessibility
    }
    return el;
  },
  template,
});

export const mount = (props) => {
  return localStorage.getItem("cookie-consent") // look for value; this could instead be a cookie if you wanted to send it back and forth to your server.
    ? Promise.resolve(null) // don't render anything if they have already "consented"
    : htmlLifecycles.mount(props).then(() => { // extend single-spa mount lifecycle; after single-spa has mounted the template, enhance with plain JavaScript
        const dialog = document.querySelector(`#cookie-consent`), // get outermost node
          noSellCheckbox = dialog.querySelector("#cookie-consent-no-sell"), // get checkbox node
          acceptBtn = dialog.querySelector("#cookie-consent-accept"); // get button node

        acceptBtn.addEventListener("click", () => { // bind and handle click event on button
          const consent = {
            date: new Date().toJSON(),
            noSell: noSellCheckbox.checked,
          };
          localStorage.setItem("cookie-consent", JSON.stringify(consent));
          dialog.classList.add("h"); // add hidden class to animate out
        });

        setTimeout(() => dialog.classList.remove("h")); // dialog starts out with 'h' (hidden) class; this removes it so that it animates in.

        dialog.addEventListener("transitionend", () => {
          // listen for when animation ends and set hidden attribute
          dialog.classList.contains('h') && dialog.setAttribute("hidden", "");
        });
      });
};

export const { bootstrap, unmount } = htmlLifecycles; // export other lifecycles as-is
