
  (function ($) {
  
  "use strict";

    // COUNTER NUMBERS
    jQuery('.counter-thumb').appear(function() {
      jQuery('.counter-number').countTo();
    });

    // BACKSTRETCH SLIDESHOW
    $('.hero-section').backstretch([
      "images/slideshow/afro-woman-cleaning-window-with-rag-home.jpg", 
      "images/slideshow/afro-woman-holding-bucket-with-cleaning-items.jpg",
      "images/slideshow/unrecognizable-cleaner-walking-into-hotel-room-with-tools-detergents.jpg"
    ],  {duration: 2000, fade: 750});
    
    // CUSTOM LINK
    $('.smoothscroll').click(function(){
      var el = $(this).attr('href');
      var elWrapped = $(el);
  
      scrollToDiv(elWrapped);
      return false;
  
      function scrollToDiv(element){
        var offset = element.offset();
        var offsetTop = offset.top;
        var totalScroll = offsetTop-navheight;
  
        $('body,html').animate({
        scrollTop: totalScroll
        }, 300);
      }
    });
    
  })(window.jQuery);

// custom.js

// API-ийн үндсэн URL (Django сервер таны localhost дээр ажиллаж байна гэж үзье)
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Токеныг локал хадгалах
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function clearToken() {
    localStorage.removeItem('token');
}

// Нэвтрэлтийн төлөвийг шалгах
function checkAuth() {
    return !!getToken();
}

// Навигацийн төлөвийг шинэчлэх
function updateNav() {
    const profileLink = document.querySelector('.nav-item.ms-3 a');
    if (checkAuth()) {
        profileLink.href = 'profile.html';
        profileLink.innerHTML = '<i class="bi bi-person-check-fill fs-5"></i>';
    } else {
        profileLink.href = 'login.html';
        profileLink.innerHTML = '<i class="bi bi-person-fill fs-5"></i>';
    }
}

// API дуудлага хийх туслах функц
async function apiCall(endpoint, method = 'GET', data = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (getToken()) {
        headers['Authorization'] = `Bearer ${getToken()}`;
    }
    const options = { method, headers };
    if (data) {
        options.body = JSON.stringify(data);
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return response.json();
}

// index.html: "Маягт хайх" товч
if (window.location.pathname.includes('index.html')) {
    const searchBtn = document.querySelector('.custom-btn[href="#services-section"]');
    if (searchBtn) {
        searchBtn.href = 'services.html';
    }
    updateNav();
}

// login.html: Нэвтрэлтийн форм
if (window.location.pathname.includes('login.html')) {
    const loginForm = document.querySelector('.custom-form');
    const emailInput = document.getElementById('email');
    let enteredEmail = '';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;

        // Имэйл илгээх (загварын Microsoft Authenticator)
        const response = await apiCall('/login', 'POST', { email });
        if (response.success) {
            enteredEmail = email;
            // Кодын форм руу шилжих
            loginForm.innerHTML = `
                <div class="mb-3">
                    <label for="code" class="form-label">6 оронтой код</label>
                    <input type="text" class="form-control" id="code" name="code" placeholder="Кодоо оруулна уу" required>
                </div>
                <div class="d-grid">
                    <button type="submit" class="custom-btn">Баталгаажуулах</button>
                </div>
            `;
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const code = document.getElementById('code').value;
                const verifyResponse = await apiCall('/verify', 'POST', { email: enteredEmail, code });
                if (verifyResponse.token) {
                    setToken(verifyResponse.token);
                    window.location.href = 'profile.html';
                } else {
                    alert('Код буруу байна!');
                }
            });
        } else {
            alert('Имэйл буруу байна!');
        }
    });
}

// signup.html: Бүртгэлийн форм
if (window.location.pathname.includes('signup.html')) {
    const signupForm = document.querySelector('.custom-form');
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const terms = document.getElementById('terms').checked;

        if (password !== confirmPassword) {
            alert('Нууц үг таарахгүй байна!');
            return;
        }
        if (!terms) {
            alert('Үйлчилгээний нөхцөлийг зөвшөөрнө үү!');
            return;
        }

        const response = await apiCall('/signup', 'POST', { email, password });
        if (response.success) {
            alert('Бүртгэл амжилттай! Нэвтэрнэ үү.');
            window.location.href = 'login.html';
        } else {
            alert('Бүртгэл амжилтгүй: ' + response.message);
        }
    });
}

// services.html: Маягтын жагсаалт
if (window.location.pathname.includes('services.html')) {
    async function loadForms() {
        const forms = await apiCall('/forms');
        const container = document.querySelector('.services-section .row');
        container.innerHTML = '';
        forms.forEach(form => {
            const formCard = `
                <div class="col-lg-4 col-12">
                    <div class="services-thumb section-bg mb-lg-0">
                        <div class="services-info">
                            <h4 class="services-title mb-1 mb-lg-2">
                                <a class="services-title-link" href="services-detail.html?id=${form.id}">${form.name}</a>
                            </h4>
                            <p>${form.description}</p>
                            <div class="d-flex flex-wrap align-items-center">
                                <div class="reviews-icons">
                                    <i class="bi-star-fill"></i>
                                    <i class="bi-star-fill"></i>
                                    <i class="bi-star-fill"></i>
                                    <i class="bi-star"></i>
                                    <i class="bi-star"></i>
                                </div>
                                <a href="services-detail.html?id=${form.id}" class="custom-btn btn button--atlas mt-2 ms-auto">
                                    <span>Илгээх</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += formCard;
        });
    }
    loadForms();
    updateNav();
}

// services-detail.html: Маягт бөглөх хуудас
if (window.location.pathname.includes('services-detail.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('id');

    async function loadFormDetails() {
        const form = await apiCall(`/forms/${formId}`);
        document.querySelector('h1').textContent = form.name;
        const formContainer = document.querySelector('.services-section');
        formContainer.innerHTML = `
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <form id="submissionForm" class="custom-form">
                            <div class="mb-3">
                                <label for="details" class="form-label">${form.description}</label>
                                <textarea class="form-control" id="details" name="details" required></textarea>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="custom-btn">Илгээх</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        const submissionForm = document.getElementById('submissionForm');
        submissionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const details = document.getElementById('details').value;
            const response = await apiCall('/submissions', 'POST', { formId, details });
            if (response.success) {
                alert('Маягт амжилттай илгээгдлээ!');
                window.location.href = 'profile.html';
            } else {
                alert('Алдаа гарлаа: ' + response.message);
            }
        });
    }
    loadFormDetails();
    updateNav();
}

// notification.html: Мэдэгдлийн жагсаалт
if (window.location.pathname.includes('notification.html')) {
    async function loadNotifications() {
        const notifications = await apiCall('/notifications');
        const container = document.querySelector('.notifications-section .col-lg-8');
        container.innerHTML = '';
        notifications.forEach(notification => {
            const card = `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${notification.title}</h5>
                        <p class="card-text">${notification.message}</p>
                        <p class="card-text date-row">
                            <small class="text-muted">${notification.date}</small>
                            <a href="#" class="btn btn-sm custom-btn custom-border-btn custom-btn-bg-white mark-read" data-id="${notification.id}">Уншсан</a>
                        </p>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
        document.querySelectorAll('.mark-read').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                await apiCall(`/notifications/${id}/read`, 'POST');
                loadNotifications();
            });
        });
    }
    loadNotifications();
    updateNav();
}

// profile.html: Хэрэглэгчийн профайл
if (window.location.pathname.includes('profile.html')) {
    async function loadProfile() {
        const profile = await apiCall('/profile');
        document.querySelector('.profile-header h3').textContent = profile.firstName;
        document.querySelector('.profile-header .text-muted').textContent = profile.email;
        document.querySelector('.profile-details .col-md-8:nth-child(2)').textContent = profile.lastName;
        document.querySelector('.profile-details .col-md-8:nth-child(4)').textContent = profile.phone;
        document.querySelector('.profile-details .col-md-8:nth-child(6)').textContent = profile.userType;
        document.querySelector('.profile-details .col-md-8:nth-child(8)').textContent = profile.department;
        document.querySelector('.profile-details .col-md-8:nth-child(10)').textContent = profile.program;
        document.querySelector('.profile-details .col-md-8:nth-child(12)').textContent = profile.registeredDate;

        const submissions = await apiCall('/submissions');
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        submissions.forEach(submission => {
            const item = `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${submission.formName}</h5>
                        <p class="card-text">Төлөв: ${submission.status}</p>
                        <p class="card-text">Илгээсэн: ${submission.submittedDate}</p>
                        ${submission.response ? `<p class="card-text">Хариу: ${submission.response}</p>` : ''}
                    </div>
                </div>
            `;
            historyList.innerHTML += item;
        });
    }

    document.getElementById('editProfileForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const response = await apiCall('/profile', 'PUT', { firstName, lastName, phoneNumber });
        if (response.success) {
            alert('Профайл амжилттай шинэчлэгдлээ!');
            window.location.reload();
        } else {
            alert('Алдаа гарлаа: ' + response.message);
        }
    });

    loadProfile();
    updateNav();
}