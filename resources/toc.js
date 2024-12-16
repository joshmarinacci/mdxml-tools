console.log("loading toc.js")

addEventListener("DOMContentLoaded", (event) => {
    document.querySelectorAll("button").forEach(button => {
        if(button.hasAttribute('data-target')) {
            button.addEventListener('click', () => {
                const target = button.getAttribute('data-target')
                console.log("target clicked",target)
                const list = document.querySelector(`#${target}`)
                console.log("list is",list)
                if(list) {
                    list.classList.toggle('collapsed')
                }
            })
        }
    })
});