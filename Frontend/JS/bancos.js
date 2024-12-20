document.addEventListener("DOMContentLoaded", () => {
    const commercialRefsContainer = document.getElementById("commercialRefsContainer");
    const bankRefsContainer = document.getElementById("bankRefsContainer");
    const concluirCadastroBtn = document.getElementById("concluirCadastroBtn");
    const MAX_REFERENCES = 3;

    // === Função Genérica para Adicionar Referências ===
    function adicionarReferencia(container, className, template, maxRefs, alertMsg) {
        const currentRefs = container.querySelectorAll(`.${className}`).length;
        if (currentRefs >= maxRefs) {
            alert(alertMsg);
            return;
        }

        const refDiv = document.createElement("div");
        refDiv.className = `card p-3 mb-3 ${className}`;
        refDiv.innerHTML = template;
        container.appendChild(refDiv);

        // Adicionar eventos de validação
        refDiv.querySelectorAll("input, textarea").forEach(input => {
            input.addEventListener("input", validarFormulario);
        });

        validarFormulario(); // Revalida ao adicionar nova referência
    }

    // === Template de Referências ===
    const comercialTemplate = `
        <h4 class="card-title">Referência Comercial</h4>
        <div class="mb-3">
            <label class="form-label">Fornecedor:</label>
            <input type="text" class="form-control required-field" placeholder="Nome do Fornecedor">
        </div>
        <div class="mb-3">
            <label class="form-label">Telefone:</label>
            <input type="text" class="form-control required-field" placeholder="Telefone">
        </div>
        <div class="mb-3">
            <label class="form-label">Ramo:</label>
            <input type="text" class="form-control required-field" placeholder="Ramo de Atividade">
        </div>
        <div class="mb-3">
            <label class="form-label">Contato:</label>
            <input type="text" class="form-control required-field" placeholder="Nome do Contato">
        </div>
        <button type="button" class="btn btn-danger remove-button mt-2">Remover Referência</button>
    `;

    const bancarioTemplate = `
        <h4 class="card-title">Referência Bancária</h4>
        <div class="mb-3">
            <label class="form-label">Banco:</label>
            <input type="text" class="form-control required-field" placeholder="Nome do Banco">
        </div>
        <div class="mb-3">
            <label class="form-label">Agência:</label>
            <input type="text" class="form-control required-field" placeholder="Agência">
        </div>
        <div class="mb-3">
            <label class="form-label">Conta:</label>
            <input type="text" class="form-control required-field" placeholder="Conta">
        </div>
        <div class="mb-3">
            <label class="form-label">Data de Abertura:</label>
            <input type="date" class="form-control required-field">
        </div>
        <div class="mb-3">
            <label class="form-label">Telefone:</label>
            <input type="text" class="form-control required-field" placeholder="Telefone">
        </div>
        <div class="mb-3">
            <label class="form-label">Gerente:</label>
            <input type="text" class="form-control required-field" placeholder="Nome do Gerente">
        </div>
        <div class="mb-3">
            <label class="form-label">Observações:</label>
            <textarea class="form-control required-field" placeholder="Observações"></textarea>
        </div>
        <button type="button" class="btn btn-danger remove-button mt-2">Remover Referência</button>
    `;

    // === Validação de Formulário ===
    function validarFormulario() {
        const allRequiredFields = document.querySelectorAll(".required-field");
        const allFilled = Array.from(allRequiredFields).every(input => {
            return input.value.trim() !== "";
        });

        concluirCadastroBtn.disabled = !allFilled; // Habilita ou desabilita o botão
    }

    // === Adicionar Referências ===
    window.adicionarReferenciaComercial = function () {
        adicionarReferencia(
            commercialRefsContainer,
            "commercial-ref-form",
            comercialTemplate,
            MAX_REFERENCES,
            `Você pode adicionar no máximo ${MAX_REFERENCES} referências comerciais.`
        );
    };

    window.adicionarReferenciaBancaria = function () {
        adicionarReferencia(
            bankRefsContainer,
            "bank-ref-form",
            bancarioTemplate,
            MAX_REFERENCES,
            `Você pode adicionar no máximo ${MAX_REFERENCES} referências bancárias.`
        );
    };

    // === Remover Referências com Delegação de Eventos ===
    commercialRefsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-button")) {
            const refDiv = event.target.closest(".commercial-ref-form");
            if (refDiv) refDiv.remove();
            validarFormulario(); // Revalida após remoção
        }
    });

    bankRefsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-button")) {
            const refDiv = event.target.closest(".bank-ref-form");
            if (refDiv) refDiv.remove();
            validarFormulario(); // Revalida após remoção
        }
    });

    // === Evento de Concluir Cadastro ===
    concluirCadastroBtn.addEventListener("click", async () => {
        const commercialRefs = Array.from(commercialRefsContainer.querySelectorAll(".commercial-ref-form")).map(ref => ({
            fornecedor: ref.querySelector('input[placeholder="Nome do Fornecedor"]').value.trim(),
            telefone: ref.querySelector('input[placeholder="Telefone"]').value.trim(),
            ramo: ref.querySelector('input[placeholder="Ramo de Atividade"]').value.trim(),
            contato: ref.querySelector('input[placeholder="Nome do Contato"]').value.trim(),
        }));

        const bankRefs = Array.from(bankRefsContainer.querySelectorAll(".bank-ref-form")).map(ref => ({
            banco: ref.querySelector('input[placeholder="Nome do Banco"]').value.trim(),
            agencia: ref.querySelector('input[placeholder="Agência"]').value.trim(),
            conta: ref.querySelector('input[placeholder="Conta"]').value.trim(),
            dataAbertura: ref.querySelector('input[type="date"]').value.trim(),
            telefone: ref.querySelector('input[placeholder="Telefone"]').value.trim(),
            gerente: ref.querySelector('input[placeholder="Nome do Gerente"]').value.trim(),
            observacoes: ref.querySelector('textarea[placeholder="Observações"]').value.trim(),
        }));

        try {
            const response = await fetch("http://localhost:3000/salvar-tudo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    commercialRefs,
                    bankRefs,
                    pessoaJuridica: JSON.parse(localStorage.getItem("pessoaJuridica")),
                    socios: JSON.parse(localStorage.getItem("sociosData")),
                }),
            });

            if (!response.ok) throw new Error("Erro ao enviar os dados.");

            const result = await response.json();
            alert(result.message || "Cadastro concluído com sucesso!");
        } catch (error) {
            console.error("Erro ao concluir cadastro:", error);
            alert("Erro ao concluir cadastro. Tente novamente.");
        }
    });
    function limparDadosLocalStorage() {
        localStorage.removeItem("pessoaJuridica");
        localStorage.removeItem("sociosData");
    }
    
    concluirCadastroBtn.addEventListener("click", async () => {
        // Após salvar os dados
        await salvarDadosNoServidor(); // Função responsável por salvar
        limparDadosLocalStorage(); // Limpa os dados
    });
    
    // Revalida ao carregar a página
    validarFormulario();
});
