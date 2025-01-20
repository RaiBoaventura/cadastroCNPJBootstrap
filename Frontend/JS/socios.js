
document.addEventListener("DOMContentLoaded", () => {
    const socioContainer = document.getElementById("socio-container");
    const addSocioBtn = document.getElementById("add-socio-btn");
    const avancarBtn = document.getElementById("avancar-btn");
    const cnpj = JSON.parse(localStorage.getItem("empresaCNPJ"));

    console.log("CNPJ recuperado do localStorage:", cnpj);

    let sociosData = [];
    let socioIndex = 0;

    // Sincronizar os dados do DOM com o array sociosData
    function sincronizarDados() {
        sociosData = [];
        document.querySelectorAll(".card").forEach((card, index) => {
            sociosData.push({
                nome: document.getElementById(`nome-socio-${index}`).value.trim(),
                cep: document.getElementById(`cep-socio-${index}`).value.trim(),
                endereco: document.getElementById(`endereco-socio-${index}`).value.trim(),
                numero: document.getElementById(`numero-socio-${index}`).value.trim(),
                bairro: document.getElementById(`bairro-socio-${index}`).value.trim(),
                cidade: document.getElementById(`cidade-socio-${index}`).value.trim(),
                uf: document.getElementById(`uf-socio-${index}`).value.trim(),
                telefone: document.getElementById(`telefone-socio-${index}`).value.trim(),
                email: document.getElementById(`email-socio-${index}`).value.trim(),
            });
        });
    }

    
    function adicionarEventoCEP(index) {
        const cepInput = document.getElementById(`cep-socio-${index}`);
        const enderecoInput = document.getElementById(`endereco-socio-${index}`);
        const bairroInput = document.getElementById(`bairro-socio-${index}`);
        const cidadeInput = document.getElementById(`cidade-socio-${index}`);
        const ufInput = document.getElementById(`uf-socio-${index}`);
    
        let errorMessage = document.createElement("span");
        errorMessage.className = "error-message text-danger";
        errorMessage.style.display = "none";
        errorMessage.id = `cep-error-${index}`;
        cepInput.parentNode.appendChild(errorMessage);
    
        if (cepInput) {
            cepInput.addEventListener("blur", async () => {
                const cep = cepInput.value.replace(/\D/g, ''); // Remover caracteres não numéricos
                if (!cep || cep.length !== 8) {
                    errorMessage.textContent = "CEP inválido. Insira um CEP com 8 dígitos.";
                    errorMessage.style.display = "block";
                    cepInput.classList.add("is-invalid");
                    limparEndereco(index); // Limpa os campos relacionados
                    return;
                }
    
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    if (!response.ok) throw new Error("Erro ao buscar endereço");
                    const data = await response.json();
    
                    if (data.erro) {
                        errorMessage.textContent = "CEP não encontrado. Verifique e tente novamente.";
                        errorMessage.style.display = "block";
                        cepInput.classList.add("is-invalid");
                        limparEndereco(index);
                        return;
                    }
    
                    // Preencher os campos de endereço automaticamente
                    enderecoInput.value = data.logradouro || '';
                    bairroInput.value = data.bairro || '';
                    cidadeInput.value = data.localidade || '';
                    ufInput.value = data.uf || '';
                    errorMessage.style.display = "none";
                    cepInput.classList.remove("is-invalid");
                    cepInput.classList.add("is-valid");
                } catch (error) {
                    console.error("Erro ao buscar endereço:", error);
                    errorMessage.textContent = "Erro ao buscar endereço. Tente novamente.";
                    errorMessage.style.display = "block";
                    cepInput.classList.add("is-invalid");
                    limparEndereco(index);
                }
            });
        }
    }
    
    function limparEndereco(index) {
        document.getElementById(`endereco-socio-${index}`).value = '';
        document.getElementById(`bairro-socio-${index}`).value = '';
        document.getElementById(`cidade-socio-${index}`).value = '';
        document.getElementById(`uf-socio-${index}`).value = '';
    }
    
// Verificar se há pelo menos um sócio
function verificarSocios() {
    const totalSocios = document.querySelectorAll(".card").length;

    if (totalSocios === 0) {
        alert("É necessário adicionar pelo menos um sócio antes de avançar.");
        return false; // Impede o avanço
    }

    return true; // Permite o avanço
}



    // Atualizar os índices após exclusões ou alterações
    function atualizarIndices() {
        document.querySelectorAll(".card").forEach((card, newIndex) => {
            card.id = `socio-${newIndex}`;
            card.querySelector("h5").textContent = `Sócio ${newIndex + 1}`;
            card.querySelectorAll("input").forEach(input => {
                const idParts = input.id.split("-");
                idParts[idParts.length - 1] = newIndex;
                input.id = idParts.join("-");
            });
            card.querySelector(".remove-socio-btn").dataset.index = newIndex;
        });
        socioIndex = sociosData.length;
    }

    function criarCamposSocio(socio = {}, index) {
        const socioDiv = document.createElement("div");
        socioDiv.classList.add("card", "p-4", "mb-4");
        socioDiv.id = `socio-${index}`;
        socioDiv.innerHTML = `
            <h5>Sócio ${index + 1}</h5>
            <div class="mb-3">
                <label for="nome-socio-${index}" class="form-label">Nome:</label>
                <input type="text" id="nome-socio-${index}" class="form-control required-socio" value="${socio.nome || ''}">
            </div>
            <div class="mb-3">
                <label for="cep-socio-${index}" class="form-label">CEP:</label>
                <input type="text" id="cep-socio-${index}" class="form-control" value="${socio.cep || ''}" placeholder="Ex: 12345678">
            </div>
            <div class="mb-3">
                <label for="endereco-socio-${index}" class="form-label">Endereço:</label>
                <input type="text" id="endereco-socio-${index}" class="form-control" value="${socio.endereco || ''}">
            </div>
            <div class="mb-3">
                <label for="numero-socio-${index}" class="form-label">Número:</label>
                <input type="text" id="numero-socio-${index}" class="form-control" value="${socio.numero || ''}">
            </div>
            <div class="mb-3">
                <label for="bairro-socio-${index}" class="form-label">Bairro:</label>
                <input type="text" id="bairro-socio-${index}" class="form-control" value="${socio.bairro || ''}">
            </div>
            <div class="mb-3">
                <label for="cidade-socio-${index}" class="form-label">Cidade:</label>
                <input type="text" id="cidade-socio-${index}" class="form-control" value="${socio.cidade || ''}">
            </div>
            <div class="mb-3">
                <label for="uf-socio-${index}" class="form-label">UF:</label>
                <input type="text" id="uf-socio-${index}" class="form-control" value="${socio.uf || ''}">
            </div>
            <div class="mb-3">
                <label for="telefone-socio-${index}" class="form-label">Telefone:</label>
                <input type="text" id="telefone-socio-${index}" class="form-control required-socio" value="${socio.telefone || ''}">
            </div>
            <div class="mb-3">
                <label for="email-socio-${index}" class="form-label">Email:</label>
                <input type="email" id="email-socio-${index}" class="form-control required-socio" value="${socio.email || ''}">
            </div>
            <button type="button" class="btn btn-danger remove-socio-btn" data-index="${index}">Remover Sócio</button>
        `;
        socioContainer.appendChild(socioDiv);
    
        // Chamar a função para associar o evento ao botão de remoção
        adicionarEventoRemoverSocio(index);
    
        // Chamar a função para associar o evento ao campo de CEP
        adicionarEventoCEP(index);
    }
    
    
    function validarSocios() {
        let valid = true;
    
        // Iterar sobre cada sócio no DOM
        document.querySelectorAll(".card").forEach((card, index) => {
            const camposObrigatorios = [
                `nome-socio-${index}`,
                `cep-socio-${index}`,
                `endereco-socio-${index}`,
                `numero-socio-${index}`,
                `bairro-socio-${index}`,
                `cidade-socio-${index}`,
                `uf-socio-${index}`,
                `telefone-socio-${index}`,
                `email-socio-${index}`
            ];
    
            camposObrigatorios.forEach(campoId => {
                const campo = document.getElementById(campoId);
    
                if (!campo.value.trim()) {
                    campo.classList.add("is-invalid"); // Destacar como inválido
                    valid = false; // Marcar como inválido
                } else {
                    campo.classList.remove("is-invalid"); // Remover erro se válido
                    campo.classList.add("is-valid"); // Adicionar classe de válido
                }
            });
        });
    
        if (!valid) {
            alert("Por favor, preencha todos os campos de todos os sócios antes de avançar.");
        }
    
        return valid;
    }
    
    
    // Adicionar evento para remover sócio
    function adicionarEventoRemoverSocio(index) {
        const removeBtn = document.querySelector(`#socio-${index} .remove-socio-btn`);
        if (removeBtn) {
            removeBtn.addEventListener("click", () => {
                sincronizarDados();
                sociosData.splice(index, 1);
                socioContainer.removeChild(document.getElementById(`socio-${index}`));
                atualizarIndices();
            });
        }
    }

    // Adicionar um novo sócio
    addSocioBtn.addEventListener("click", () => {
        sincronizarDados();
        const novoSocio = { nome: "", cep: "", endereco: "", numero: "", bairro: "", cidade: "", uf: "", telefone: "", email: "" };
        sociosData.push(novoSocio);
        criarCamposSocio(novoSocio, socioIndex++);
    });

// Integrar a verificação ao evento de avançar
avancarBtn.addEventListener("click", (event) => {
    const sociosValidos = verificarSocios() && validarSocios(); // Verifica todos os critérios

    if (!sociosValidos) {
        event.preventDefault(); // Impede o comportamento padrão do botão
        return;
    }

    sincronizarDados();
    localStorage.setItem("sociosData", JSON.stringify(sociosData));
    window.location.href = "bancos.html";
});

    // Carregar sócios com base no CNPJ
    async function carregarSocios() {
        if (!cnpj) {
            console.warn("CNPJ não disponível no localStorage.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/cnpj/${cnpj}`);
            if (!response.ok) throw new Error("Erro ao buscar sócios");
            const data = await response.json();
            if (data.qsa && Array.isArray(data.qsa)) {
                data.qsa.forEach((socio, index) => {
                    sociosData.push({
                        nome: socio.nome || "",
                        cep: "",
                        endereco: "",
                        numero: "",
                        bairro: "",
                        cidade: "",
                        uf: "",
                        telefone: "",
                        email: "",
                    });
                    criarCamposSocio(sociosData[sociosData.length - 1], socioIndex++);
                });
            }
        } catch (error) {
            console.error("Erro ao carregar sócios:", error);
        }
    }

    
    carregarSocios();
});
