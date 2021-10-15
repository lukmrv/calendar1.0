let catOne = document.querySelector(".pop-cat-one");
let catTwo = document.querySelector(".pop-cat-two");
let catOneSound = document.querySelector(".cat-sound-one");
let catTwoSound = document.querySelector(".cat-sound-two");

catOne.addEventListener("mouseover", () => {
  catOneSound.play();
  catOne.classList.add("hidden");
  catTwo.classList.remove("hidden");
});

catTwo.addEventListener("mouseout", () => {
  catTwoSound.play();
  catOne.classList.remove("hidden");
  catTwo.classList.add("hidden");
});
