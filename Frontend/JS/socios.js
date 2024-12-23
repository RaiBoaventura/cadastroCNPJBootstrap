document.addEventListener("DOMContentLoaded", () => {
    const socioContainer = document.getElementById("socio-container");
    const addSocioBtn = document.getElementById("add-socio-btn");
    const avancarBtn = document.getElementById("avancar-btn");

    const cnpj = JSON.parse(localStorage.getItem("empresaCNPJ"));
    console.log("CNPJ recuperado do localStorage:", cnpj);

    let sociosData = [];
    let socioIndex = 0;

    function criarCamposSocio(socio = {}, index) {
        const socioDiv = document.createElement("div");
        socioDiv.classList.add("card", "p-4", "mb-4");
        socioDiv.id = `socio-${index}`;
        socioDiv.innerHTML = `
            <h5>Sócio ${index + 1}</h5>
            <div class="mb-3">
                <label for="nome-socio-${index}" class="form-label">Nome:</label>
                <input type="text" id="nome-socio-${index}" class="form-control required-socio" value="${socio.nome || ''}" readonly>
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
                <input type="text" id="telefone-socio-${index}" class="form-control required-socio" value="${socio.telefone || ''}" placeholder="Ex: (11) 98765-4321">
            </div>
            <div class="mb-3">
                <label for="email-socio-${index}" class="form-label">Email:</label>
                <input type="email" id="email-socio-${index}" class="form-control required-socio" value="${socio.email || ''}" placeholder="Ex: exemplo@email.com">
            </div>
        `;
        socioContainer.appendChild(socioDiv);
        adicionarEventoCEP(index);
    }

    async function buscarSociosPorCNPJ(cnpj) {
        if (!cnpj) {
            console.warn("CNPJ não encontrado no localStorage.");
            return;
        }

        try {
            console.log(`Buscando sócios para o CNPJ: ${cnpj}`);
            const response = await fetch(`http://localhost:3000/cnpj/${cnpj}`);
            if (!response.ok) throw new Error("Erro ao buscar sócios");
            const data = await response.json();
            console.log("Dados recebidos da API:", data);

            if (data.qsa && Array.isArray(data.qsa)) {
                data.qsa.forEach((socio, index) => {
                    const novoSocio = {
                        nome: socio.nome || `Sócio ${index + 1}`,
                        cep: "",
                        endereco: "",
                        numero: "",
                        bairro: "",
                        cidade: "",
                        uf: "",
                        telefone: "",
                        email: "",
                    };
                    sociosData.push(novoSocio);
                    criarCamposSocio(novoSocio, socioIndex++);
                });
            } else {
                console.warn("Nenhum sócio encontrado para o CNPJ fornecido.");
            }
        } catch (error) {
            console.error("Erro ao buscar sócios:", error);
        }
    }

    function adicionarEventoCEP(index) {
        const cepInput = document.getElementById(`cep-socio-${index}`);
        if (cepInput) {
            cepInput.addEventListener("blur", () => {
                const cep = cepInput.value.replace(/\D/g, '');
                buscarEndereco(cep, index);
            });
        }
    }

    async function buscarEndereco(cep, index) {
        if (!cep || cep.length !== 8) {
            alert("Por favor, insira um CEP válido com 8 dígitos.");
            return;
        }
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error("Erro ao buscar endereço");
            const data = await response.json();

            if (data.erro) {
                alert("CEP não encontrado. Verifique e tente novamente.");
                return;
            }

            document.getElementById(`endereco-socio-${index}`).value = data.logradouro || '';
            document.getElementById(`bairro-socio-${index}`).value = data.bairro || '';
            document.getElementById(`cidade-socio-${index}`).value = data.localidade || '';
            document.getElementById(`uf-socio-${index}`).value = data.uf || '';
        } catch (error) {
            console.error("Erro ao buscar endereço:", error);
            alert("Houve um erro ao buscar o endereço. Tente novamente mais tarde.");
        }
    }

    function validarSocios() {
        const requiredFields = document.querySelectorAll(".required-socio");
        for (let field of requiredFields) {
            if (field.value.trim() === "") {
                alert("Todos os sócios precisam ter nome, telefone e email preenchidos.");
                return false;
            }
        }
        return true;
    }

    async function carregarSocios() {
        if (cnpj) {
            await buscarSociosPorCNPJ(cnpj);
        } else {
            console.warn("CNPJ não disponível no localStorage para carregar os sócios.");
        }
    }

    carregarSocios();

    avancarBtn.addEventListener("click", () => {
        if (!validarSocios()) return;

        // Atualizar os dados dos sócios preenchidos no DOM
        sociosData = sociosData.map((socio, index) => ({
            nome: document.getElementById(`nome-socio-${index}`).value.trim(),
            cep: document.getElementById(`cep-socio-${index}`).value.trim(),
            endereco: document.getElementById(`endereco-socio-${index}`).value.trim(),
            numero: document.getElementById(`numero-socio-${index}`).value.trim(),
            bairro: document.getElementById(`bairro-socio-${index}`).value.trim(),
            cidade: document.getElementById(`cidade-socio-${index}`).value.trim(),
            uf: document.getElementById(`uf-socio-${index}`).value.trim(),
            telefone: document.getElementById(`telefone-socio-${index}`).value.trim(),
            email: document.getElementById(`email-socio-${index}`).value.trim(),
        }));

        localStorage.setItem("sociosData", JSON.stringify(sociosData));
        window.location.href = "bancos.html";
    });
});
