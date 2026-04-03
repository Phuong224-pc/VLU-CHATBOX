document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('authModal');
    const guestBtn = document.getElementById('guestBtn');
    const closeBtn = document.querySelector('.close-modal');
    const loginTabBtn = document.getElementById('loginTabBtn');
    const registerTabBtn = document.getElementById('registerTabBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // 1. Mở/Đóng Modal
    guestBtn.onclick = () => modal.style.display = "block";
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }

    // 2. Chuyển tab Đăng nhập / Đăng ký
    loginTabBtn.onclick = () => {
        loginForm.style.display = "flex";
        registerForm.style.display = "none";
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
    };

    registerTabBtn.onclick = () => {
        loginForm.style.display = "none";
        registerForm.style.display = "flex";
        registerTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
    };

    // 3. Giả lập đăng nhập Social (Google/FB)
    window.handleSocial = (platform) => {
        alert(`Đang kết nối đến ${platform}... (Bản demo)`);
        setTimeout(() => {
            alert(`Đăng nhập bằng ${platform} thành công!`);
            modal.style.display = "none";
            guestBtn.innerHTML = `<i class="fas fa-user-check"></i> Sinh viên VLU`;
            guestBtn.style.background = "#28a745";
        }, 1000);
    };

    // 4. Xử lý Form Đăng ký thủ công
    registerForm.onsubmit = (e) => {
        e.preventDefault();
        const pass = document.getElementById('regPass').value;
        const confirm = document.getElementById('regPassConfirm').value;

        if (pass.includes(" ")) {
            alert("Mật khẩu không được chứa khoảng trắng!");
            return;
        }
        if (pass !== confirm) {
            alert("Mật khẩu nhập lại không khớp!");
            return;
        }
        alert("Đăng ký thành công! Mời bạn đăng nhập.");
        loginTabBtn.click();
    };

    // 5. Xử lý Form Đăng nhập thủ công
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const user = document.getElementById('loginUser').value;
        alert(`Chào mừng ${user} quay trở lại!`);
        modal.style.display = "none";
        guestBtn.innerHTML = `<i class="fas fa-user-check"></i> ${user}`;
        guestBtn.style.background = "#ed1c24";
    };
});
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('authModal');
    const guestBtn = document.getElementById('guestBtn');
    const closeBtn = document.querySelector('.close-modal');
    const loginTabBtn = document.getElementById('loginTabBtn');
    const registerTabBtn = document.getElementById('registerTabBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    guestBtn.onclick = () => modal.style.display = "block";
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }

    loginTabBtn.onclick = () => {
        loginForm.style.display = "flex";
        registerForm.style.display = "none";
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
    };

    registerTabBtn.onclick = () => {
        loginForm.style.display = "none";
        registerForm.style.display = "flex";
        registerTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
    };

    window.handleSocial = (p) => {
        alert(`Đang kết nối ${p}...`);
        setTimeout(() => {
            modal.style.display = "none";
            guestBtn.innerHTML = `<i class="fas fa-user-check"></i> Đã đăng nhập`;
            guestBtn.style.background = "#28a745";
        }, 800);
    };

    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const user = document.getElementById('loginUser').value;
        alert("Chào mừng " + user);
        modal.style.display = "none";
        guestBtn.innerHTML = `<i class="fas fa-user"></i> ${user}`;
    };
});