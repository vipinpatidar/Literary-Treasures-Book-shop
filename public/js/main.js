const mobileMenu = document.querySelector(".mobile-menu");

const navBar = document.querySelector(".header-nav");
const openIcon = document.querySelector(".icon-menu");
const closeIcon = document.querySelector(".close-icon");

mobileMenu.addEventListener("click", () => {
  navBar.classList.toggle("open");
  openIcon.classList.toggle("close");
  closeIcon.classList.toggle("close");
});
