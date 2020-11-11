import "./index.sass";
/** page.json 为自动生成，不用修改 */
import ITEMLIST from "./page.json";
const itemListDOM = document.getElementById("itemList");
const searchBarDOM = document.getElementById("searchBar");
const cardPrefabDOM = document.getElementById("cardPrefab");
const cardParentDOM = cardPrefabDOM.parentElement;
cardParentDOM.removeChild(cardPrefabDOM);
const items = [];

ITEMLIST.forEach(({ name, img, intro }) => {
  /** all item list */
  const itemDOM = document.createElement("a");
  itemDOM.innerHTML=name;
  itemDOM.href=`/mpa/${name}.html`
  itemDOM.target=name;

  itemListDOM.appendChild(itemDOM);

  items.push({
    itemDOM,
    name
  });

  /** demo show */
  if(img){
    const cloneDOM= cardPrefabDOM.cloneNode(true);
    const children = cloneDOM.children;
    const imgDOM = children[0].children[0];
    const titleDOM = children[1];
    const introDOM = children[2];
    const imgUrl = `../demos/${name}/${img}`;

    imgDOM.setAttribute("style", `background-image:url(${imgUrl})`);
    titleDOM.innerHTML=name;
    introDOM.innerHTML=intro;

    cloneDOM.href=`/mpa/${name}.html`
    cloneDOM.target=name;
    cardParentDOM.appendChild(cloneDOM);
  }
});

searchBarDOM.oninput = () => {
  updateFilter(searchBar.value);
};

function updateFilter(value) {
  let reg = new RegExp(value, "i");
  items.forEach(({ itemDOM, name }) => {
    if (reg.test(name)) {
      itemDOM.classList.remove("hide");
    } else {
      itemDOM.classList.add("hide");
    }
  });
}