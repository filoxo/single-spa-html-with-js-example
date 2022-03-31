import singleSpaHtml from "single-spa-html"; // single-spa lifecycles helper
import template from "./template.html"; // separate html template provides better syntax highlighting
import styles from "./styles.css"; // CSS Modules; pitfall: ensure that your CSS is scoped else they will be *global*

const ONE_MINUTE = 60000;

// Use CSS modules in html template by interpolating them
const interpolateTemplate = () => {
  const cssModuleClassNames = Object.keys(styles).join("|");
  const classNamesRegex = new RegExp(cssModuleClassNames, "gi");
  const templateWithClassNames = template.replace(
    classNamesRegex,
    (matched) => styles[matched]
  );
  return templateWithClassNames;
};

const htmlLifecycles = singleSpaHtml({
  domElementGetter: () => {
    const id = "single-spa-application:@example/cookie-consent";
    let container = document.getElementById(id);
    if (!container) {
      container = document.createElement("div");
      container.id = id;
      document.body.prepend(container); // single-spa automatically _appends_, but this content should be _prepended_ for accessibility
    }
    return container;
  },
  template: interpolateTemplate(),
});

/*
This seems complicated so let's break it down:
1. this mount function will be used by single-spa as part of the application lifecycle
2. it wraps htmlLifecycles.mount to in order to conditionally render the html (based on prior consent);
  this may not be needed for many applications! If instead always mount the same content this
  could instead be implemented as `export const mount = [htmlLifecycles.mount, myOtherMountFn]`
3. If no prior consent, then await the original mount function and bind behaviors the interactive elements
*/
export const mount = async (props) => {
  // uses localStorage for convenience but could be anything to check.
  // for example, this could be implemented with cookies if you wanted to send it back and forth to your server
  const priorConsentOrNull = localStorage.getItem("cookie-consent");
  const hasPriorConsent = Boolean(priorConsentOrNull); // check for prior consent set by app

  if (hasPriorConsent) {
    const { date } = JSON.parse(priorConsentOrNull);
    const priorConsentDate = new Date(date).getTime();
    // consent may expire so request it again if needed
    // this also allows me to clear the value for demo purposes
    const priorConsentExpired = priorConsentDate - Date.now() > ONE_MINUTE;
    if (priorConsentExpired) {
      localStorage.removeItem("cookie-consent"); // re-obtain consent if expired
    } else {
      return Promise.resolve(null); // don't render anything if user prior consent & it has not expired
    }
  }
  await htmlLifecycles.mount(props); // wait for single-spa to mount the application

  // after app mount, bind behaviors the interactive elements with plain JavaScript
  const dialog = document.querySelector("#cookie-consent"),
    noSellCheckbox = dialog?.querySelector("#cookie-consent-no-sell"),
    acceptBtn = dialog?.querySelector("#cookie-consent-accept");

  if (!dialog || !noSellCheckbox || !acceptBtn) return; // sanity checks

  // bind and handle click event on button
  acceptBtn.addEventListener("click", function handleConsentAction() {
    // create consent data object
    const consent = JSON.stringify({
      date: new Date().toJSON(),
      noSell: noSellCheckbox.checked,
    });
    localStorage.setItem("cookie-consent", consent);
    dialog.classList.add(styles.hide); // animate out
  });

  // remove hide class so that dialog animates in
  setTimeout(function onInit() {
    dialog.classList.remove(styles.hide);
  });

  dialog.addEventListener("transitionend", function handleTransitionEnd() {
    // listen for when animation ends and set hidden attribute so that they remain in sync
    dialog.classList.contains(styles.hide) && dialog.setAttribute("hidden", "");
  });

  // TODO: implement a way to revoke consent (execise left to reader)
};

export const { bootstrap, unmount } = htmlLifecycles; // export other lifecycles as-is
