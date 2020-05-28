import singleSpaHtml from "single-spa-html";
import template from "./template.html";
import "./styles.css";

const htmlLifecycles = singleSpaHtml({
  domElementGetter: () => {
    const id = "single-spa-application:@org/cookie-consent";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      document.body.prepend(el);
    }
    return el;
  },
  template,
});

export const mount = (props) => {
  return localStorage.getItem("cookie-consent")
    ? Promise.resolve(null)
    : htmlLifecycles.mount(props).then(() => {
        const dialog = document.querySelector(`#cookie-consent`),
          noSellCheckbox = dialog.querySelector("#cookie-consent-no-sell"),
          acceptBtn = dialog.querySelector("#cookie-consent-accept");

        acceptBtn.addEventListener("click", () => {
          const consent = {
            date: new Date().toJSON(),
            noSell: noSellCheckbox.checked,
          };
          localStorage.setItem("cookie-consent", JSON.stringify(consent));
          dialog.classList.add("h");
        });

        setTimeout(() => dialog.classList.remove("h"));

        dialog.addEventListener("transitionend", () => {
          dialog.classList.contains('h') && dialog.setAttribute("hidden", "");
        });
      });
};

export const { bootstrap, unmount } = htmlLifecycles;
