function toggleMenu() {
  document.getElementById("ham-menu").classList.toggle("active");
}

document.getElementById("ham-button").onclick = toggleMenu;

document.querySelector(".cat-head>img").onclick = toggleMenu;
