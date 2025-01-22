import { enviarPessoaJuridica } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
    const cnpjInput = document.getElementById("cnpj");
    const continuarBtn = document.getElementById("continuar-btn");
    const cnpjError = document.getElementById("cnpj-error");
    const capitalSocialInput = document.getElementById("capital_social");
    const capitalSocialNumInput = document.getElementById("capital_social_num");
    const fileInputs = [
        { id: "contrato_Social", name: "Contrato Social e última alteração" },
        { id: "cartao_CNPJ", name: "Cartão CNPJ atualizado" },
        { id: "relacao_Faturamento", name: "Relação de faturamento dos últimos 12 meses" },
    ];
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("email-error");
    const dataFundacaoInput = document.getElementById("data_fundacao");
    const dataFundacaoError = document.getElementById("data-fundacao-error");
    const telefoneInput = document.getElementById("telefone");
    const telefoneError = document.getElementById("telefone-error");
    const telefoneContadorError = document.getElementById("telefone-contador-error");
    const telefoneContadorInput = document.getElementById("telefone_contador");
    let isTyping = false; // Para evitar formatações simultâneas

    // === Validação de Data de Fundação ===
    function validarDataFundacao(data) {
        const hoje = new Date();
        const dataFormatada = new Date(data);
        return dataFormatada <= hoje && !isNaN(dataFormatada);
    }

    dataFundacaoInput.addEventListener("blur", () => {
        const data = dataFundacaoInput.value.trim();
        if (data === "") {
            dataFundacaoError.textContent = "O campo de data de fundação é obrigatório.";
            dataFundacaoError.style.display = "block";
            dataFundacaoInput.classList.add("is-invalid");
        } else if (!validarDataFundacao(data)) {
            dataFundacaoError.textContent = "A data de fundação não pode ser futura ou inválida.";
            dataFundacaoError.style.display = "block";
            dataFundacaoInput.classList.add("is-invalid");
        } else {
            dataFundacaoError.style.display = "none";
            dataFundacaoInput.classList.remove("is-invalid");
            dataFundacaoInput.classList.add("is-valid");
        }
        validarFormulario();
    });

    // === Formatar Telefone em Tempo Real ===
    function formatarTelefone(input) {
        input.addEventListener("input", () => {
            let telefone = input.value.replace(/\D/g, ""); // Remove caracteres não numéricos

            if (telefone.length > 11) telefone = telefone.slice(0, 11); // Limita a 11 dígitos

            if (telefone.length <= 10) {
                telefone = telefone.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3"); // Formato para telefone fixo
            } else {
                telefone = telefone.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3"); // Formato para celular
            }

            input.value = telefone;
        });
    }

    // Aplica a formatação em tempo real nos campos de telefone
    formatarTelefone(telefoneInput);
    formatarTelefone(telefoneContadorInput);

    // === Validação de Telefone ===
    function validarTelefone(telefone) {
        const telefoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/; // Aceita formatos como (XX) XXXXX-XXXX ou XX XXXX-XXXX
        return telefoneRegex.test(telefone);
    }

    telefoneInput.addEventListener("blur", () => {
        const telefone = telefoneInput.value.trim();
        if (telefone === "") {
            telefoneError.textContent = "O campo de telefone é obrigatório.";
            telefoneError.style.display = "block";
            telefoneInput.classList.add("is-invalid");
        } else if (!validarTelefone(telefone)) {
            telefoneError.textContent = "O telefone deve estar no formato válido (XX XXXXX-XXXX ou XX XXXX-XXXX).";
            telefoneError.style.display = "block";
            telefoneInput.classList.add("is-invalid");
        } else {
            telefoneError.style.display = "none";
            telefoneInput.classList.remove("is-invalid");
            telefoneInput.classList.add("is-valid");
        }
        validarFormulario();
    });

    telefoneContadorInput.addEventListener("blur", () => {
        const telefone = telefoneContadorInput.value.trim();
        if (telefone === "") {
            telefoneContadorError.textContent = "O campo de telefone do contador é obrigatório.";
            telefoneContadorError.style.display = "block";
            telefoneContadorInput.classList.add("is-invalid");
        } else if (!validarTelefone(telefone)) {
            telefoneContadorError.textContent = "O telefone do contador deve estar no formato válido (XX XXXXX-XXXX ou XX XXXX-XXXX).";
            telefoneContadorError.style.display = "block";
            telefoneContadorInput.classList.add("is-invalid");
        } else {
            telefoneContadorError.style.display = "none";
            telefoneContadorInput.classList.remove("is-invalid");
            telefoneContadorInput.classList.add("is-valid");
        }
        validarFormulario();
    });


    // === Validação de E-mail ===
    function validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    emailInput.addEventListener("blur", () => {
        const email = emailInput.value.trim();
        if (email === "") {
            emailError.textContent = "O campo de e-mail é obrigatório.";
            emailError.style.display = "block";
            emailInput.classList.add("is-invalid");
        } else if (!validarEmail(email)) {
            emailError.textContent = "O e-mail fornecido não é válido.";
            emailError.style.display = "block";
            emailInput.classList.add("is-invalid");
        } else {
            emailError.style.display = "none";
            emailInput.classList.remove("is-invalid");
            emailInput.classList.add("is-valid");
        }
        validarFormulario();
    });
    // === Validação do CNPJ ===
    function validarCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]+/g, '');
        if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0, pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado != digitos.charAt(0)) return false;

        tamanho++;
        numeros = cnpj.substring(0, tamanho);
        soma = 0, pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        return resultado == digitos.charAt(1);
    }

    // === Consultar CNPJ ===
    async function buscarDadosCNPJ(cnpj) {
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
            if (!response.ok) throw new Error("Erro ao buscar dados do CNPJ");

            const data = await response.json();
            preencherDadosEmpresa(data);
            cnpjError.style.display = "none";
            cnpjInput.classList.remove("is-invalid");
            cnpjInput.classList.add("is-valid");
        } catch (error) {
            console.error(error);
            cnpjError.textContent = "Erro ao consultar o CNPJ. Tente novamente.";
            cnpjError.style.display = "block";
            cnpjInput.classList.add("is-invalid");
        }
    }



    // === Preencher Dados da Empresa ===
    function preencherDadosEmpresa(data) {
        document.getElementById("razao_social").value = data.razao_social || '';
        document.getElementById("nome_fantasia").value = data.nome_fantasia || '';
        document.getElementById("logradouro").value = data.logradouro || '';
        document.getElementById("ramo_atividade").value = data.cnae_fiscal_descricao || '';
        document.getElementById("data_fundacao").value = data.data_inicio_atividade || '';

        const numericValue = parseFloat(data.capital_social || '0');

        // Preenche o campo numérico oculto
        capitalSocialNumInput.value = numericValue.toFixed(2);

        // Formata o valor como moeda e preenche o campo visível
        capitalSocialInput.value = numericValue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });

        document.getElementById("numero_complemento").value = data.numero || '';
        document.getElementById("bairro").value = data.bairro || '';
        document.getElementById("cidade").value = data.municipio || '';
        document.getElementById("uf").value = data.uf || '';
        document.getElementById("telefone").value = data.ddd_telefone_1 || '';
        document.getElementById("email").value = data.email || '';
    }

    // === Configurar Drag-and-Drop ===
    function setupDropZone(dropZoneId, inputId, listId) {
        const dropZone = document.getElementById(dropZoneId);
        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);

        ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
            dropZone.addEventListener(eventName, e => e.preventDefault());
        });

        ["dragenter", "dragover"].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add("drag-over"));
        });

        ["dragleave", "drop"].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove("drag-over"));
        });

        dropZone.addEventListener("drop", e => handleFiles(e.dataTransfer.files, list));
        dropZone.addEventListener("click", () => input.click());
        input.addEventListener("change", () => handleFiles(input.files, list));
    }

    function handleFiles(files, list) {
        Array.from(files).forEach(file => {
            const listItem = document.createElement("li");
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(file);
            downloadLink.download = file.name;
            downloadLink.textContent = file.name;

            const fileSize = document.createElement("span");
            fileSize.textContent = ` (${Math.round(file.size / 1024)} KB)`;

            const removeButton = document.createElement("button");
            removeButton.textContent = "Remover";
            removeButton.className = "remove-btn";
            removeButton.addEventListener("click", () => listItem.remove());

            listItem.appendChild(downloadLink);
            listItem.appendChild(fileSize);
            listItem.appendChild(removeButton);
            list.appendChild(listItem);
        });
    }

    setupDropZone("contrato-drop-zone", "contrato_Social", "contrato-list");
    setupDropZone("cnpj-drop-zone", "cartao_CNPJ", "cnpj-list");
    setupDropZone("faturamento-drop-zone", "relacao_Faturamento", "faturamento-list");

    // === Validação do Formulário ===
    function validarFormulario() {
        const allFieldsFilled = Array.from(document.querySelectorAll("#pj-form input[required]"))
            .every(input => input.value.trim() !== "");
        const allFilesUploaded = fileInputs.every(fileInput => {
            const inputElement = document.getElementById(fileInput.id);
            return inputElement.files.length > 0;
        });

        continuarBtn.disabled = !(allFieldsFilled && allFilesUploaded);
    }
    capitalSocialInput.addEventListener("input", () => {
        if (isTyping) return;
        isTyping = true;

        // Remove todos os caracteres não numéricos
        const rawValue = capitalSocialInput.value.replace(/[^\d]/g, '');

        const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0;

        // Formata o valor como moeda brasileira
        capitalSocialInput.value = numericValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

        // Atualiza o campo numérico oculto
        capitalSocialNumInput.value = numericValue.toFixed(2);

        isTyping = false;
    });


    cnpjInput.addEventListener("blur", () => {
        const cnpj = cnpjInput.value;
        if (validarCNPJ(cnpj)) {
            buscarDadosCNPJ(cnpj);
        } else {
            cnpjError.textContent = "CNPJ inválido. Verifique o número e tente novamente.";
            cnpjError.style.display = "block";
            cnpjInput.classList.add("is-invalid");
        }
        validarFormulario();
    });

    continuarBtn.addEventListener("click", () => {
        const pessoaJuridica = {
            cnpj: document.getElementById("cnpj").value,
            razao_social: document.getElementById("razao_social").value,
            nome_fantasia: document.getElementById("nome_fantasia").value,
            conta_bancaria: document.getElementById("conta_bancaria").value,
            inscricao_estadual: document.getElementById("inscricao_estadual").value,
            ramo_atividade: document.getElementById("ramo_atividade").value,
            data_fundacao: document.getElementById("data_fundacao").value,
            capital_social: capitalSocialNumInput.value,
            telefone: document.getElementById("telefone").value,
            email: document.getElementById("email").value,
            site: document.getElementById("site").value,
            contador: document.getElementById("contador").value,
            telefone_contador: document.getElementById("telefone_contador").value,
            logradouro: document.getElementById("logradouro").value,
            numero_complemento: document.getElementById("numero_complemento").value,
            bairro: document.getElementById("bairro").value,
            cidade: document.getElementById("cidade").value,
            uf: document.getElementById("uf").value,
        };

        try {
            localStorage.setItem("pessoaJuridica", JSON.stringify(pessoaJuridica));
            localStorage.setItem("empresaCNPJ", pessoaJuridica.cnpj); // Salva apenas o CNPJ
            window.location.href = "socios.html";
        } catch (error) {
            console.error("Erro ao armazenar os dados:", error);
            alert("Erro ao continuar. Tente novamente.");
        }
    });

    capitalSocialInput.addEventListener("input", () => {
        // Remove caracteres não numéricos, incluindo pontos e vírgulas
        let rawValue = capitalSocialInput.value.replace(/[^\d]/g, "");

        // Converte para número e ajusta se estiver vazio
        let numericValue = rawValue ? parseFloat(rawValue) / 100 : 0;

        // Formata como moeda brasileira
        capitalSocialInput.value = numericValue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });

        // Atualiza o campo numérico oculto
        capitalSocialNumInput.value = numericValue.toFixed(2);
    });

    function desformatarValorMonetario(valor) {
        // Remove o símbolo de moeda, pontos e espaços
        return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    }
    capitalSocialInput.addEventListener("blur", () => {
        // Obtem o valor desformatado do campo formatado
        const valorDesformatado = desformatarValorMonetario(capitalSocialInput.value);

        // Atualiza o campo numérico oculto
        capitalSocialNumInput.value = valorDesformatado.toFixed(2);

        // Log dentro do escopo correto
        console.log("Valor formatado:", capitalSocialInput.value);
        console.log("Valor desformatado:", valorDesformatado);
    });


    fileInputs.forEach(fileInput => {
        const inputElement = document.getElementById(fileInput.id);
        inputElement.addEventListener("change", validarFormulario);
    });

    const pessoaJuridica = JSON.parse(localStorage.getItem("pessoaJuridica"));
    if (!pessoaJuridica) {
        console.error("Dados de pessoa jurídica não encontrados no localStorage.");
    } else {
        console.log("Capital Social enviado:", pessoaJuridica.capital_social);
    }

    validarFormulario();
});
