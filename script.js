// --- 1. CẤU HÌNH GROQ API ---
// Kiểm tra xem CONFIG có tồn tại không trước khi lấy Key (Giúp demo trên GitHub không bị sập)
let API_KEY = "";
if (typeof CONFIG !== "undefined") {
    API_KEY = CONFIG.GROQ_API_KEY;
} else {
    console.warn("Đang chạy chế độ Demo (không có API Key). Giao diện vẫn hoạt động bình thường.");
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Biến toàn cục để quản lý phiên chat hiện tại
let currentChatId = null;

document.addEventListener('DOMContentLoaded', () => {
    // --- 2. KHAI BÁO CÁC PHẦN TỬ ---
    const modal = document.getElementById('authModal');
    const guestBtn = document.getElementById('guestBtn');
    const closeBtn = document.querySelector('.close-modal');
    const loginTabBtn = document.getElementById('loginTabBtn');
    const registerTabBtn = document.getElementById('registerTabBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userInput = document.getElementById('userInput');
    const chatbox = document.getElementById('chatbox');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const plusBtn = document.getElementById('plusBtn'); 
    const attachMenu = document.getElementById('attachMenu'); 
    const sendBtn = document.getElementById('sendBtn');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const chatHistoryList = document.getElementById('chatHistoryList');
    const newChatBtn = document.getElementById('newChatBtn');
    const darkModeBtn = document.getElementById('darkModeBtn');
    const modeText = document.getElementById('modeText');
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('aside'); 

    // --- LOGIC ĐÓNG/MỞ SIDEBAR ---
    if (toggleSidebar && sidebar) {
        toggleSidebar.onclick = () => {
            sidebar.classList.toggle('closed');
            const icon = toggleSidebar.querySelector('i');
            if (sidebar.classList.contains('closed')) {
                icon.classList.replace('fa-bars', 'fa-chevron-right');
            } else {
                icon.classList.replace('fa-chevron-right', 'fa-bars');
            }
        };
    }

    // --- 2.1 LOGIC ĐIỀU KHIỂN MENU ĐÍNH KÈM (ATTACH MENU) ---
    if (plusBtn && attachMenu) {
        plusBtn.onclick = (e) => {
            e.stopPropagation(); 
            attachMenu.classList.toggle('active'); 
        };

        document.addEventListener('click', (e) => {
            if (attachMenu.classList.contains('active') && !attachMenu.contains(e.target) && e.target !== plusBtn) {
                attachMenu.classList.remove('active');
            }
        });

        // Xử lý click item trong menu (Dùng switch case bên dưới)
        const menuItems = attachMenu.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.onclick = function(e) {
                e.stopPropagation();
                const action = this.innerText.trim();
                console.log("Phương đã chọn chức năng:", action);

                switch(action) {
                    case "Thêm ảnh và tệp":
                        alert("Mở trình chọn tệp...");
                        break;
                    case "Tạo hình ảnh":
                        userInput.value = "/imagine "; 
                        userInput.focus();
                        break;
                    case "Tìm kiếm trên mạng":
                        alert("Đang kích hoạt tìm kiếm trực tuyến!");
                        break;
                    default:
                        console.log("Chức năng đang phát triển");
                }
                attachMenu.classList.remove('active');
            };
        });
    }

    // --- 3. TỰ ĐỘNG LOAD DANH SÁCH SIDEBAR ---
    updateHistorySidebar();

    // --- LOGIC LỜI CHÀO THEO BUỔI ---
    const dynamicGreeting = document.getElementById('dynamicGreeting');
    const hour = new Date().getHours();
    if (dynamicGreeting) {
        if (hour < 12) dynamicGreeting.innerText = "Chào buổi sáng! Chúc bạn ngày mới năng suất tại VLU! ☀️";
        else if (hour < 18) dynamicGreeting.innerText = "Buổi chiều tốt lành! Bạn đã nộp bài tập chưa đó? 📝";
        else dynamicGreeting.innerText = "Tối muộn rồi, đừng thức khuya quá nhé sinh viên VLU ơi! 🌙";
    }

    // --- KIỂM TRA TRẠNG THÁI DARK MODE ---
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if (modeText) modeText.innerText = "Chế độ sáng";
        const icon = darkModeBtn.querySelector('i');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }

    // --- HÀM MƯA LOGO VLU ---
    function rainLogo() {
        for (let i = 0; i < 15; i++) {
            const logo = document.createElement('img');
            logo.src = 'img/logovanlang.png'; 
            logo.className = 'rain-logo';
            logo.style.left = Math.random() * 100 + 'vw';
            logo.style.position = 'fixed';
            logo.style.top = '-50px';
            logo.style.width = '40px';
            logo.style.zIndex = '9999';
            logo.style.pointerEvents = 'none';
            logo.style.animation = `rainFall ${Math.random() * 2 + 1}s linear forwards`;
            document.body.appendChild(logo);
            setTimeout(() => logo.remove(), 2000);
        }
    }

    // --- 4. XỬ LÝ ĐOẠN CHAT MỚI ---
    if (newChatBtn) {
        newChatBtn.onclick = () => {
            currentChatId = null; 
            chatbox.innerHTML = '';
            if (welcomeScreen) welcomeScreen.style.display = 'flex';
            userInput.value = '';
            userInput.style.height = 'auto';
            userInput.focus();
            updateHistorySidebar();
        };
    }

    // --- 5. LOGIC LƯU VÀ TẢI LỊCH SỬ ---
    function saveChatToLocal(role, text) {
        if (!currentChatId) {
            currentChatId = Date.now().toString(); 
        }
        let allChats = JSON.parse(localStorage.getItem('vlu_chat_sessions')) || {};
        if (!allChats[currentChatId]) {
            allChats[currentChatId] = {
                title: text.substring(0, 30) + (text.length > 30 ? "..." : ""),
                messages: []
            };
        }
        allChats[currentChatId].messages.push({ role, text });
        localStorage.setItem('vlu_chat_sessions', JSON.stringify(allChats));
        updateHistorySidebar();
    }

    function updateHistorySidebar() {
        if (!chatHistoryList) return;
        chatHistoryList.innerHTML = '';
        const allChats = JSON.parse(localStorage.getItem('vlu_chat_sessions')) || {};
        Object.keys(allChats).reverse().forEach(id => {
            const historyItem = document.createElement('div');
            historyItem.className = "history-item";
            if (id === currentChatId) historyItem.classList.add('active');
            historyItem.innerHTML = `<i class="far fa-comment"></i> ${allChats[id].title}`;
            historyItem.onclick = () => {
                currentChatId = id;
                renderSession(id);
            };
            chatHistoryList.appendChild(historyItem);
        });
    }

    function renderSession(id) {
        const allChats = JSON.parse(localStorage.getItem('vlu_chat_sessions')) || {};
        const chatData = allChats[id];
        if (chatData) {
            chatbox.innerHTML = '';
            if (welcomeScreen) welcomeScreen.style.display = 'none';
            chatData.messages.forEach(msg => {
                if (msg.role === 'user') renderUserMessage(msg.text);
                else renderBotMessage(msg.text, false);
            });
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    }

    if (clearChatBtn) {
        clearChatBtn.onclick = () => {
            if (confirm("Xóa sạch toàn bộ lịch sử trò chuyện?")) {
                localStorage.removeItem('vlu_chat_sessions');
                location.reload();
            }
        };
    }

    // --- 6. HÀM HIỂN THỊ TIN NHẮN ---
    function renderUserMessage(text) {
        const uMsg = document.createElement('div');
        uMsg.className = "message user-message";
        uMsg.innerHTML = `<div class="content">${text}</div>`;
        chatbox.appendChild(uMsg);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    function renderBotMessage(text, isNew = true) {
    const bMsg = document.createElement('div');
    bMsg.className = "message bot-message";
    bMsg.innerHTML = `
        <div class="bot-icon"><i class="fas fa-robot"></i></div>
        <div class="message-wrapper" style="max-width: 85%;">
            <div class="content"></div>
            <div class="bot-actions">
                <i class="far fa-copy" title="Sao chép" onclick="copyText(this)"></i>
                <i class="fas fa-volume-up" title="Phát âm thanh" onclick="speakText(this)"></i>
            </div>
        </div>
    `;
    chatbox.appendChild(bMsg);
    const contentDiv = bMsg.querySelector('.content');

    // SỬA TẠI ĐÂY: Nếu chuỗi bắt đầu bằng <div, ta hiểu đó là HTML và render thẳng
    if (text.trim().startsWith('<div')) {
        contentDiv.innerHTML = text;
    } else {
        const htmlContent = typeof marked !== 'undefined' ? marked.parse(text) : text;
        contentDiv.innerHTML = htmlContent;
    }

    if (isNew) contentDiv.classList.add('fade-in');
    chatbox.scrollTop = chatbox.scrollHeight;
}

    // --- 7. XỬ LÝ GỬI TIN NHẮN QUA GROQ API ---
    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        if (text.toUpperCase().includes("VLU")) rainLogo();
        if (welcomeScreen) welcomeScreen.style.display = 'none';

        renderUserMessage(text);
        saveChatToLocal('user', text);
        
        userInput.value = '';
        userInput.style.height = 'auto';

        const typingMsg = document.createElement('div');
        typingMsg.className = "message bot-message typing-indicator";
        typingMsg.innerHTML = `
            <div class="bot-icon"><i class="fas fa-robot"></i></div>
            <div class="content"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
        `;
        chatbox.appendChild(typingMsg);
        chatbox.scrollTop = chatbox.scrollHeight;

        // KIỂM TRA KEY CHO BẢN DEMO
        if (!API_KEY) {
            setTimeout(() => {
                if (chatbox.contains(typingMsg)) chatbox.removeChild(typingMsg);
                renderBotMessage(`
                    <div style="line-height: 1.6;">
                        <strong style="color: #d9534f; font-size: 1.1em;">⚠️ YÊU CẦU CẤU HÌNH HỆ THỐNG</strong><br>
                        Chào Phương! Để kích hoạt trí tuệ nhân tạo, bạn vui lòng thực hiện các bước sau:
                        <ul style="margin-top: 10px; padding-left: 20px;">
                            <li><b>Bước 1:</b> Tạo file <code>config.js</code> trong thư mục gốc dự án.</li>
                            <li><b>Bước 2:</b> Sao chép nội dung từ file <code>config.example.js</code> sang.</li>
                            <li><b>Bước 3:</b> Dán mã <b>API Key</b> lấy từ <a href="https://console.groq.com/" target="_blank" style="color: #007bff; text-decoration: underline;">GROQ Cloud</a> vào biến <code>GROQ_API_KEY</code>.</li>
                            <li><b>Bước 4:</b> Lưu file và nhấn <b>F5</b> để bắt đầu trò chuyện.</li>
                        </ul>
                        <p style="margin-top: 10px; font-size: 0.9em; color: #666;"><i>* Ghi chú: Giao diện vẫn hoạt động bình thường ở chế độ xem trước (Preview).</i></p>
                    </div>
                `, true);
            }, 800);
            return;
        }

        try {
            const response = await fetch(GROQ_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "Bạn là trợ lý ảo của Đại học Văn Lang (VLU). Hãy trả lời thân thiện bằng tiếng Việt." },
                        { role: "user", content: text }
                    ]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            const botResponse = data.choices[0].message.content;
            if (chatbox.contains(typingMsg)) chatbox.removeChild(typingMsg);

            renderBotMessage(botResponse, true);
            saveChatToLocal('bot', botResponse);

        } catch (error) {
            console.error("Lỗi API Groq:", error);
            if (chatbox.contains(typingMsg)) chatbox.removeChild(typingMsg);
            renderBotMessage("Ối! Có lỗi kết nối rồi Phương ơi. Kiểm tra lại API Key nhé!", true);
        }
    }

    // --- SỰ KIỆN NÚT BẤM ---
    userInput.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    sendBtn.onclick = sendMessage;

    // --- TIỆN ÍCH DARK MODE ---
    if (darkModeBtn) {
        darkModeBtn.onclick = () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            const icon = darkModeBtn.querySelector('i');
            if (isDark) {
                if (icon) icon.classList.replace('fa-moon', 'fa-sun');
                if (modeText) modeText.innerText = "Chế độ sáng";
            } else {
                if (icon) icon.classList.replace('fa-sun', 'fa-moon');
                if (modeText) modeText.innerText = "Chế độ tối";
            }
        };
    }

    // --- AUTH MODAL ---
    if (guestBtn) guestBtn.onclick = () => modal.style.display = "block";
    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }

    loginTabBtn.onclick = () => {
        loginForm.style.display = "flex";
        registerForm.style.display = "none";
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
    }
    registerTabBtn.onclick = () => {
        loginForm.style.display = "none";
        registerForm.style.display = "flex";
        registerTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
    }

    // --- COPY & SPEAK ---
    window.copyText = (el) => {
        const text = el.closest('.message-wrapper').querySelector('.content').innerText;
        navigator.clipboard.writeText(text);
        el.className = "fas fa-check";
        el.style.color = "#28a745";
        setTimeout(() => {
            el.className = "far fa-copy";
            el.style.color = "";
        }, 2000);
    };

    window.speakText = (el) => {
        const text = el.closest('.message-wrapper').querySelector('.content').innerText;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        window.speechSynthesis.speak(utterance);
    };

    userInput.oninput = function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    };
});