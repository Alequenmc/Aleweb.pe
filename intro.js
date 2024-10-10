document.addEventListener('DOMContentLoaded', () => {

    function revealOnScroll() {
        const elements = document.querySelectorAll('.hidden');
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            if (rect.top <= viewportHeight * 0.85) {
                element.classList.add('visible');
                element.classList.remove('hidden');
            }
        });
    }
    window.addEventListener('scroll', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(revealOnScroll, 100);
    });
    revealOnScroll();
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    let currentSlide = 0;

    function showSlide(index) {
        carouselSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    if (prevButton && nextButton && carouselSlides.length) {
        prevButton.addEventListener('click', () => {
            currentSlide = (currentSlide > 0) ? currentSlide - 1 : carouselSlides.length - 1;
            showSlide(currentSlide);
        });

        nextButton.addEventListener('click', () => {
            currentSlide = (currentSlide < carouselSlides.length - 1) ? currentSlide + 1 : 0;
            showSlide(currentSlide);
        });

        showSlide(currentSlide);
    }

    // Cambio de tema con localStorage
    const themeToggleButton = document.getElementById('themeToggleButton');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            toggleTheme();
            const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
        });

        // Cargar tema guardado
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            toggleTheme();
        }
    }

    const searchButton = document.getElementById('searchButton');
    const searchBar = document.getElementById('searchBar');

    if (searchButton && searchBar) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchBar.value.toLowerCase().trim();
            if (searchTerm === '') return; 

            let found = false;
            const allTextElements = document.querySelectorAll('.searchable');
            allTextElements.forEach(element => {
                const elementText = element.textContent.toLowerCase();
                const regex = new RegExp(searchTerm, 'gi');
                const matches = elementText.match(regex);

                if (matches) {
                    found = true;
                    const highlightedText = elementText.replace(regex, '<span class="highlighted">$&</span>');
                    element.innerHTML = highlightedText;
                } else {
                    element.innerHTML = elementText; // Restaurar texto original
                }
            });

            if (!found) {
                alert(`No se encontraron resultados para: "${searchTerm}"`);
            }
        });
    }
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const chatbot = document.getElementById('chatbot');
    const toggleButton = document.getElementById('toggleButton');
    const closeButton = document.getElementById('closeChatbot');
    const sendButton = document.getElementById('sendButton');
    const chatInput = document.getElementById('chatInput');
    const chatDisplay = document.getElementById('chatDisplay');

    setTimeout(() => {
        if (chatbot) chatbot.classList.add('show');
    }, 5000);

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            if (chatbot) chatbot.classList.toggle('show');
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            if (chatbot) chatbot.classList.remove('show');
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', () => {
            const userMessage = chatInput.value.trim();
            if (userMessage) {
                chatDisplay.innerHTML += `<div class="chat-message self-end">${userMessage}</div>`;
                chatInput.value = '';

                setTimeout(() => {
                    chatDisplay.innerHTML += `<div class="chat-message self-start">No te he comprendido bien. ¿Podrías reformular tu pregunta para que pueda asistirte mejor? </div>`;
                    chatDisplay.scrollTop = chatDisplay.scrollHeight; 
                }, 1000); 
            }
        });
    }
    setTimeout(() => {
        chatDisplay.innerHTML += `<div class="chat-message self-start">Puedes escribir tus preguntas aquí. Ten en cuenta que el chatbot tiene algunas limitaciones y es posible que no pueda responder a todas las consultas</div>`;
        chatDisplay.scrollTop = chatDisplay.scrollHeight; 
    }, 1000);
});

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
}

let debounceTimeout;
