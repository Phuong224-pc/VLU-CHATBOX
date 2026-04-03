# VLU Smart Assistant (AI-Powered Chatbot) 🤖

A specialized AI assistant developed for Van Lang University students to support academic inquiries, personalized learning roadmaps, and graduation forecasting.

**Live Preview:** [https://phuong224-pc.github.io/VLU-CHATBOX/](https://phuong224-pc.github.io/VLU-CHATBOX/)

---

## ✨ Key Features
- **AI Chatbot**: Real-time academic support powered by **Groq API (Llama 3.3 70B)**.
- **Academic Roadmap**: Generates personalized study paths and course suggestions.
- **Graduation Tracker**: Forecasts graduation timelines based on student data.
- **Career Orientation**: Provides guidance and future career paths for SE students.
- **Modern UI**: Professional VLU branding with responsive sidebar and Dark/Light mode.

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+).
- **AI Integration**: Groq Cloud API.
- **Libraries**: [Marked.js](https://marked.js.org/), [Firebase Auth](https://firebase.google.com/), [FontAwesome](https://fontawesome.com/).

---

## ⚙️ Installation & Setup (For Local Testing)

**Note:** For security reasons, the live demo is for **UI/UX showcase only**. To interact with the AI, you must run the project locally using your own API Key.

### 1. Clone the repository
```bash
git clone [https://github.com/phuong224-pc/VLU-CHATBOX.git](https://github.com/phuong224-pc/VLU-CHATBOX.git)
cd VLU-CHATBOX
2. Configure Environment Variables
Look for config.example.js in the root folder.

Create a new file named config.js.

Copy and paste the following content into config.js:

JavaScript
const CONFIG = {
    GROQ_API_KEY: "YOUR_ACTUAL_GROQ_API_KEY_HERE" 
};
Replace "YOUR_ACTUAL_GROQ_API_KEY_HERE" with your key from Groq Console.

3. Launch the App
Open index.html with Live Server in VS Code and start chatting!

🛡️ QA & Security Standards (For Recruiters)
As an aspiring QA/QC Engineer, I have applied several industry standards to this project:

Information Security: Implemented .gitignore to prevent sensitive API Keys from being exposed on public repositories (Zero-Leakage Policy).

Error Handling: Developed robust logic to handle API failures (401 Unauthorized, 429 Rate Limit) and provide clear user feedback.

UI/UX Testing: Conducted cross-device testing to ensure the responsive sidebar and components work seamlessly on mobile and desktop.

Code Documentation: Maintained clean, modular code with detailed setup instructions for seamless developer onboarding.

👩‍💻 Author
Trương Trần Thanh Phương

Education: 2nd-year Software Engineering Student @ Van Lang University.

Career Goal: QA/QC Intern.

English Proficiency: IELTS Target 7.5.


---

### 🚀 Các bước cuối cùng để cập nhật lên GitHub:

1.  **Lưu file**: Nhấn `Ctrl + S` cho file `README.md`.
2.  **Đẩy code lên**: Mở Terminal và chạy các lệnh:
    * `git add README.md`
    * `git commit -m "Finalize professional README for QA/QC portfolio"`
    * `git push origin main`

### 💡 Tại sao bản README này "ăn tiền"?
* **Có Link Live Preview:** Giúp nhà tuyển dụng click vào xem giao diện ngay lập tức mà không cần cài đặt.
* **Mục 🛡️ QA & Security:** Đây là điểm khác biệt của Phương. Nó chứng minh rằng bạn có tư duy của một **Tester/QA** thực thụ: biết bảo mật thông tin và biết kiểm thử lỗi trước khi release.

Dự án đã cực kỳ hoàn chỉnh rồi! Phương có muốn mình gợi ý thêm cách viết mô tả dự án này vào CV (bản tiếng Anh) không?