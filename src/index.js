import singleSpaHtml from "single-spa-html"; // single-spa helper
import template from "./template.html"; // html template is separated out so that we can get better syntax highlighting
import "./styles.css"; // styles are global so these are based on IDs

const htmlLifecycles = singleSpaHtml({
  domElementGetter: () => {
    const id = "single-spa-application:@example/cookie-consent";
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

/*
There's a fair amount going on here.
First, we're exporting the `mount` lifecycle function for single-spa to use.
Next, `mount` checks for previous user consent and resolves early if they have.
If not, then we use the original mount function provided by the helper (above), 
  and after it resolves we perform our setup logic to enable the interactive elements.
*/
export const mount = (props) => {
  return localStorage.getItem("cookie-consent") // look for value; this could instead be a cookie if you wanted to send it back and forth to your server.
    ? Promise.resolve(null) // don't render anything if they have already "consented"
    : htmlLifecycles.mount(props).then(() => {
        // extend single-spa mount lifecycle; after single-spa has mounted the template, enhance with plain JavaScript
        const dialog = document.querySelector("#cookie-consent"), // get outermost node
          noSellCheckbox =
            dialog && dialog.querySelector("#cookie-consent-no-sell"), // get checkbox node
          acceptBtn = dialog && dialog.querySelector("#cookie-consent-accept"); // get button node

        if (!dialog || !noSellCheckbox || !acceptBtn) return;

        // bind and handle click event on button
        acceptBtn.addEventListener("click", () => {
          // create consent data object
          const consent = {
            date: new Date().toJSON(),
            noSell: noSellCheckbox.checked,
          };
          localStorage.setItem("cookie-consent", JSON.stringify(consent));
          dialog.classList.add("hide"); // add hidden class to animate out
        });
        
        // dialog starts out with 'hide' class; this removes it so that it animates in.
        setTimeout(() => dialog.classList.remove("hide")); 

        dialog.addEventListener("transitionend", () => {
          // listen for when animation ends and set hidden attribute so that they remain in sync
          dialog.classList.contains("hide") &&
            dialog.setAttribute("hidden", "");
        });
      });
};

export const { bootstrap, unmount } = htmlLifecycles; // export other lifecycles as-is
