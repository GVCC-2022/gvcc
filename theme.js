document.addEventListener("DOMContentLoaded", function() {
    // 1. Puraani theme check karo (Dark ya Light)
    let currentTheme = localStorage.getItem("appTheme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);

    // 2. Har page par automatically ek button bana do
    let btn = document.createElement("button");
    btn.id = "themeToggleBtn";
    btn.innerHTML = currentTheme === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    document.body.appendChild(btn);

    // 3. Button par click karne se kya hoga
    btn.onclick = function() {
        let theme = document.documentElement.getAttribute("data-theme");
        let newTheme = theme === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("appTheme", newTheme);
        
        // Icon change karo (Chand se Suraj, Suraj se Chand)
        btn.innerHTML = newTheme === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    };
});
