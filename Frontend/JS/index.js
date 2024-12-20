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
    function formatarParaMoeda(valor) {
        const numero = parseFloat(valor.replace(/[^\d.-]/g, '').replace(',', '.')) || 0;
        return numero.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    }
    
    function removerFormatacao(valor) {
        return parseFloat(valor.replace(/[^\d.-]/g, '').replace(',', '.')) || 0;
    }
    
    capitalSocialInput.addEventListener("input", () => {
        if (isTyping) return; // Evita reentrância
        isTyping = true;
    
        const rawValue = capitalSocialInput.value.replace(/[^\d]/g, ''); // Apenas números
        const numericValue = removerFormatacao(rawValue) / 100; // Divide para incluir casas decimais
        const formattedValue = formatarParaMoeda(numericValue.toFixed(2)); // Formata valor final
    
        capitalSocialInput.value = formattedValue; // Exibe o valor formatado
        capitalSocialNumInput.value = numericValue.toFixed(2); // Valor para envio ao banco
    
        isTyping = false;
    });
    
    capitalSocialInput.addEventListener("blur", () => {
        // Atualiza ao sair do campo para garantir formatação final
        const numericValue = removerFormatacao(capitalSocialInput.value);
        capitalSocialInput.value = formatarParaMoeda(numericValue.toFixed(2));
        capitalSocialNumInput.value = numericValue.toFixed(2);
    });
    
    function preencherDadosEmpresa(data) {
        const capitalSocialInput = document.getElementById("capital_social");
        const capitalSocialNumInput = document.getElementById("capital_social_num");
    
        document.getElementById("razao_social").value = data.razao_social || '';
        document.getElementById("nome_fantasia").value = data.nome_fantasia || '';
        document.getElementById("logradouro").value = data.logradouro || '';
        document.getElementById("ramo_atividade").value = data.cnae_fiscal_descricao || '';
        document.getElementById("data_fundacao").value = data.data_inicio_atividade || '';
    
        if (capitalSocialInput) {
            const numericValue = parseFloat(data.capital_social || '0');
            capitalSocialInput.value = formatarParaMoeda(numericValue.toFixed(2));
            capitalSocialNumInput.value = numericValue.toFixed(2);
        }
    
        document.getElementById("numero_complemento").value = data.numero || '';
        document.getElementById("bairro").value = data.bairro || '';
        document.getElementById("cidade").value = data.municipio || '';
        document.getElementById("uf").value = data.uf || '';
        document.getElementById("telefones").value = data.ddd_telefone_1 || '';
        document.getElementById("email").value = data.email || '';
    }

    // === Configurar Drag-and-Drop ===
    function setupDropZone(dropZoneId, inputId, listId) {
        const dropZone = document.getElementById(dropZoneId);
        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);

        if (!dropZone || !input || !list) {
            console.error(`Elemento(s) não encontrado(s): ${dropZoneId}, ${inputId}, ${listId}`);
            return;
        }

        ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
            dropZone.addEventListener(eventName, e => e.preventDefault());
        });

        ["dragenter", "dragover"].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add("drag-over"));
        });

        ["dragleave", "drop"].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove("drag-over"));
        });

        dropZone.addEventListener("drop", e => {
            const files = e.dataTransfer.files;
            handleFiles(files, list);
        });

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

    // Configuração das Zonas de Upload
    setupDropZone("contrato-drop-zone", "contrato_Social", "contrato-list");
    setupDropZone("cnpj-drop-zone", "cartao_CNPJ", "cnpj-list");
    setupDropZone("faturamento-drop-zone", "relacao_Faturamento", "faturamento-list");

    // === Validação de Formulário ===
    function validarFormulario() {
        const allFieldsFilled = Array.from(document.querySelectorAll("#pj-form input[required]"))
            .every(input => input.value.trim() !== "");
        const allFilesUploaded = fileInputs.every(fileInput => {
            const inputElement = document.getElementById(fileInput.id);
            return inputElement.files.length > 0;
        });

        continuarBtn.disabled = !(allFieldsFilled && allFilesUploaded);
    }

    // Eventos
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
            capital_social: capitalSocialNumInput.value, // Valor numérico
            telefones: document.getElementById("telefones").value,
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
            // Armazena os dados no localStorage
            localStorage.setItem("empresaCNPJ", JSON.stringify(pessoaJuridica.cnpj));
    
            // Redireciona para a página de sócios
            window.location.href = "socios.html";
        } catch (error) {
            console.error("Erro ao armazenar os dados:", error);
            alert("Erro ao continuar. Tente novamente.");
        }
    });

    fileInputs.forEach(fileInput => {
        const inputElement = document.getElementById(fileInput.id);
        inputElement.addEventListener("change", validarFormulario);
    });

    validarFormulario();
});
