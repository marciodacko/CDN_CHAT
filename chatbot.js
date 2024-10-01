(function() {
    const apiUrl = 'http://127.0.0.1:8000/faq/get-answer/'; // Endpoint para obter a resposta
    const tokenUrl = 'http://127.0.0.1:8000/api/token/refresh/'; // Endpoint para renovar o token
    

    let accessToken = '';  // Token de acesso atual
    let refreshToken = ''; // Token de refresh para renovar o acesso

    // Função para adicionar o chatbot à página
    function loadChatbot() {
        const chatbotContainer = document.createElement('div');
        chatbotContainer.id = 'chatbot-container';
        chatbotContainer.style.position = 'fixed';
        chatbotContainer.style.bottom = '20px';
        chatbotContainer.style.right = '20px';
        chatbotContainer.style.width = '300px';
        chatbotContainer.style.height = '400px';
        chatbotContainer.style.background = '#f1f1f1';
        chatbotContainer.style.borderRadius = '10px';
        chatbotContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        chatbotContainer.style.padding = '10px';

        chatbotContainer.innerHTML = `
            <div id="chatbot-header" style="font-weight:bold; text-align:center; margin-bottom:10px;">
                Chatbot de Suporte
            </div>
            <div id="chatbot-content" style="height:300px; overflow-y:auto; background:#fff; padding:10px; border-radius:5px; margin-bottom:10px;">
                <p>Como posso ajudar você?</p>
            </div>
            <input type="text" id="chatbot-input" placeholder="Digite sua pergunta..." style="width: calc(100% - 20px); padding: 5px;">
            <button id="chatbot-send" style="width: 100%; padding: 5px; margin-top: 5px;">Enviar</button>
        `;
        document.body.appendChild(chatbotContainer);

        document.getElementById('chatbot-send').addEventListener('click', function() {
            sendQuestion();
        });
    }

    // Função para enviar a pergunta ao backend
    function sendQuestion() {
        const question = document.getElementById('chatbot-input').value;
        if (!question) return;

        fetch(apiUrl + `?question=${encodeURIComponent(question)}&user_id=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 401) {
                // Token expirado, tentar renovar
                renewToken().then(() => {
                    sendQuestion(); // Tentar enviar novamente após renovar o token
                });
            } else {
                return response.json();
            }
        })
        .then(data => {
            if (data) {
                displayAnswer(data.answer);
            }
        })
        .catch(err => {
            console.error('Erro ao obter a resposta:', err);
            displayAnswer('Desculpe, algo deu errado.');
        });
    }

    // Função para exibir a resposta no chatbot
    function displayAnswer(answer) {
        const contentDiv = document.getElementById('chatbot-content');
        const p = document.createElement('p');
        p.textContent = answer;
        contentDiv.appendChild(p);
        contentDiv.scrollTop = contentDiv.scrollHeight;
        document.getElementById('chatbot-input').value = '';
    }

    // Função para renovar o token de acesso
    function renewToken() {
        return fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh: refreshToken })
        })
        .then(response => response.json())
        .then(data => {
            accessToken = data.access; // Atualiza o token de acesso
            console.log('Token renovado com sucesso.');
        })
        .catch(err => {
            console.error('Erro ao renovar o token:', err);
        });
    }

    // Obtém o token passado como parâmetro ao carregar o script
    function getTokenFromScript() {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src.includes('chatbot.js')) {
                const urlParams = new URLSearchParams(scripts[i].src.split('?')[1]);
                accessToken = urlParams.get('token');
                refreshToken = urlParams.get('refresh_token'); // Pegue o token de refresh da URL
                return true;
            }
        }
        return false;
    }

    // Inicializa o chatbot
    if (getTokenFromScript()) {
        window.addEventListener('load', function() {
            loadChatbot();
        });
    } else {
        console.error('Tokens de autenticação não encontrados. Por favor, forneça tokens válidos.');
    }
})();
