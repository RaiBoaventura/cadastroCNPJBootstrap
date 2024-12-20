document.addEventListener("DOMContentLoaded", () => {
    const empresaTableBody = document.getElementById("empresaTableBody");
    const empresaModal = new bootstrap.Modal(document.getElementById("empresaModal"));
    const addEmpresaBtn = document.getElementById("addEmpresaBtn");
    const saveEmpresaBtn = document.getElementById("saveEmpresaBtn");

    const cnpjInput = document.getElementById("cnpj");
    const razaoSocialInput = document.getElementById("razao_social");
    const telefoneInput = document.getElementById("telefone");
    const empresaIdInput = document.getElementById("empresaId");

    // Carregar empresas
async function carregarEmpresas() {
    try {
        const response = await fetch("http://localhost:3000/empresa"); // Ajustado para o endpoint correto
        if (!response.ok) {
            throw new Error(`Erro ao carregar empresas: ${response.statusText}`);
        }

        const empresas = await response.json();

        empresaTableBody.innerHTML = "";
        empresas.forEach((empresa) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${empresa.id}</td>
                <td>${empresa.cnpj}</td>
                <td>${empresa.razao_social}</td>
                <td>${empresa.telefone || "-"}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-2" onclick='editarEmpresa(${JSON.stringify(empresa)})'>Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deletarEmpresa(${empresa.id})">Excluir</button>
                </td>
            `;
            empresaTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao carregar empresas:", error);
    }
}


    // Adicionar Empresa
    addEmpresaBtn.addEventListener("click", () => {
        cnpjInput.value = "";
        razaoSocialInput.value = "";
        telefoneInput.value = "";
        empresaIdInput.value = "";
        empresaModal.show();
    });

    // Salvar Empresa
    saveEmpresaBtn.addEventListener("click", async () => {
        const id = empresaIdInput.value;
        const empresa = {
            cnpj: cnpjInput.value,
            razao_social: razaoSocialInput.value,
            telefone: telefoneInput.value,
        };

        try {
            if (id) {
                // Atualizar
                await fetch(`http://localhost:3000/empresa/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(empresa),
                });
            } else {
                // Adicionar
                await fetch("http://localhost:3000/empresa", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(empresa),
                });
            }

            empresaModal.hide();
            carregarEmpresas();
        } catch (error) {
            console.error("Erro ao salvar empresa:", error);
        }
    });

    // Deletar Empresa
    window.deletarEmpresa = async (id) => {
        if (confirm("Deseja realmente excluir esta empresa?")) {
            try {
                await fetch(`http://localhost:3000/empresa/${id}`, { method: "DELETE" });
                carregarEmpresas();
            } catch (error) {
                console.error("Erro ao excluir empresa:", error);
            }
        }
    };

    // Editar Empresa
    window.editarEmpresa = (empresa) => {
        empresaIdInput.value = empresa.id;
        cnpjInput.value = empresa.cnpj;
        razaoSocialInput.value = empresa.razao_social;
        telefoneInput.value = empresa.telefone || "";
        empresaModal.show();
    };

    // Inicializar
    carregarEmpresas();
});
