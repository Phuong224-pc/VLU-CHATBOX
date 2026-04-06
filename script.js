// --- 1. CẤU HÌNH GROQ API ---
let API_KEY = "";
if (typeof CONFIG !== "undefined") {
    API_KEY = CONFIG.GROQ_API_KEY;
} else {
    console.warn("Đang chạy chế độ Demo (không có API Key). Giao diện vẫn hoạt động bình thường.");
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Biến toàn cục để quản lý phiên chat và ngữ cảnh
let currentChatId = null;
let currentSystemPrompt = "Bạn là trợ lý ảo của Đại học Văn Lang (VLU). Hãy trả lời thân thiện bằng tiếng Việt.";

// Định nghĩa các ngữ cảnh chuyên biệt cho từng mục sidebar
const featurePrompts = {
    'roadmap': "Bạn là chuyên gia tư vấn lộ trình học tập tại VLU. Hãy dựa vào chương trình đào tạo của trường để tư vấn các môn học, chứng chỉ (như IELTS 7.5) và lộ trình ra trường đúng hạn cho sinh viên.",
    'results': "Bạn là chuyên gia phân tích kết quả học tập. Hãy giúp sinh viên hiểu về GPA, cách cải thiện điểm số và các quy định về học vụ tại VLU.",
    'graduation': "Bạn là cố vấn tốt nghiệp. Hãy tư vấn về điều kiện xét tốt nghiệp, các chứng chỉ đầu ra và thủ tục nhận bằng tại VLU.",
    'future': "Bạn là chuyên gia định hướng nghề nghiệp. Hãy giúp sinh viên VLU kết nối ngành học với thị trường lao động và phát triển kỹ năng mềm.",
    'default': "Bạn là trợ lý ảo của Đại học Văn Lang (VLU). Hãy trả lời thân thiện bằng tiếng Việt."
};

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
    document.getElementById('goHomeBtn').addEventListener('click', () => {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const chatbox = document.getElementById('chatbox');
    
    // 1. Xóa tất cả các tin nhắn cũ trong chatbox (trừ cái welcomeScreen)
    // Cách an toàn nhất là xóa hết các thẻ .message
    const messages = chatbox.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());

    // 2. Hiện lại Welcome Screen
    if (welcomeScreen) {
        welcomeScreen.style.display = 'flex';
        // Gọi lại hàm cập nhật lời chào theo thời gian (nếu bạn có)
        updateDynamicGreeting(); 
    }

    // 3. Cuộn lên trên cùng
    chatbox.scrollTop = 0;
});

// Hàm cập nhật lời chào động (nên thêm vào để giống hình bạn gửi)
function updateDynamicGreeting() {
    const greetingText = document.getElementById('dynamicGreeting');
    const hour = new Date().getHours();
    
    if (hour < 12) {
        greetingText.innerText = "Chào buổi sáng! Chúc bạn ngày mới năng suất tại VLU! ☀️";
    } else if (hour < 18) {
        greetingText.innerText = "Chào buổi chiều! Bạn cần hỗ trợ gì về lịch học không? ✨";
    } else {
        greetingText.innerText = "Tối muộn rồi, đừng thức khuya quá nhé sinh viên VLU ơi! 🌙";
    }
}
    
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

    // --- 2.1 LOGIC ĐIỀU KHIỂN MENU ĐÍNH KÈM ---
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

        const menuItems = attachMenu.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.onclick = function(e) {
                e.stopPropagation();
                const action = this.innerText.trim();
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
                }
                attachMenu.classList.remove('active');
            };
        });
    }

    // --- 2.2 LOGIC CHUYỂN ĐỔI PHIÊN CHAT THEO TÍNH NĂNG ---
    function switchToFeatureChat(featureKey) {
        currentChatId = null; 
        chatbox.innerHTML = '';
        if (welcomeScreen) welcomeScreen.style.display = 'none';

        currentSystemPrompt = featurePrompts[featureKey] || featurePrompts['default'];

        let introText = "Chào Phương! Mình có thể giúp gì cho bạn?";
        if(featureKey === 'roadmap') introText = "Chào Phương! Mình sẽ giúp bạn xây dựng **lộ trình học tập** hiệu quả tại VLU. Bạn cần tư vấn về mục tiêu IELTS hay kế hoạch môn học?";
        else if(featureKey === 'results') introText = "Chào Phương! Hãy gửi cho mình bảng điểm hoặc môn học bạn thắc mắc, mình sẽ **phân tích kết quả** giúp bạn.";
        else if(featureKey === 'graduation') introText = "Chào Phương! Mình sẽ hỗ trợ bạn kiểm tra các điều kiện để **tốt nghiệp** đúng hạn.";
        else if(featureKey === 'future') introText = "Chào Phương! Chúng ta hãy cùng thảo luận về **định hướng sự nghiệp** sau khi tốt nghiệp VLU nhé.";

        renderBotMessage(introText, true);
        userInput.focus();
        updateHistorySidebar();
    }

    // SỬA LỖI ĐẢO CÂU: Chọn trực tiếp bằng ID thay vì nth-child
    const roadmapBtn = document.getElementById('btn-roadmap');
    const resultsBtn = document.getElementById('btn-results');
    const graduationBtn = document.getElementById('btn-graduation');
    const futureBtn = document.getElementById('btn-future');

    if(roadmapBtn) roadmapBtn.onclick = (e) => { e.preventDefault(); switchToFeatureChat('roadmap'); };
    if(resultsBtn) resultsBtn.onclick = (e) => { e.preventDefault(); switchToFeatureChat('results'); };
    if(graduationBtn) graduationBtn.onclick = (e) => { e.preventDefault(); switchToFeatureChat('graduation'); };
    if(futureBtn) futureBtn.onclick = (e) => { e.preventDefault(); switchToFeatureChat('future'); };

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

    // --- 4. XỬ LÝ ĐOẠN CHAT MỚI ---
    if (newChatBtn) {
        newChatBtn.onclick = () => {
            currentChatId = null; 
            currentSystemPrompt = featurePrompts['default'];
            chatbox.innerHTML = '';
            if (welcomeScreen) welcomeScreen.style.display = 'flex';
            userInput.value = '';
            userInput.style.height = 'auto';
            userInput.focus();
            updateHistorySidebar();
        };
    }
    // --- SỬA LỖI: LOGIC XÓA TOÀN BỘ LỊCH SỬ ---
if (clearChatBtn) {
    clearChatBtn.onclick = () => {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat không?')) {
            // 1. Xóa dữ liệu trong LocalStorage
            localStorage.removeItem('vlu_chat_sessions');
            
            // 2. Reset các biến trạng thái
            currentChatId = null;
            
            // 3. Làm sạch giao diện
            chatbox.innerHTML = '';
            if (welcomeScreen) welcomeScreen.style.display = 'flex';
            
            // 4. Cập nhật lại danh sách ở sidebar
            updateHistorySidebar();
            
            alert('Đã xóa toàn bộ lịch sử chat!');
        }
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
                        { role: "system", content: currentSystemPrompt },
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
            renderBotMessage("Ối! Có lỗi kết nối rồi Phương ơi.", true);
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