document.addEventListener("DOMContentLoaded", () => {
    const empresaTableBody = document.getElementById("empresaTableBody");
    const empresaModal = new bootstrap.Modal(document.getElementById("empresaModal"));
    const addEmpresaBtn = document.getElementById("addEmpresaBtn");
    const saveEmpresaBtn = document.getElementById("saveEmpresaBtn");

    const cnpjInput = document.getElementById("cnpj");
    const razaoSocialInput = document.getElementById("razao_social");
    const telefoneInput = document.getElementById("telefone");
    const referenciasBancariasInput = document.getElementById("referencias_bancarias");
    const referenciasComerciaisInput = document.getElementById("referencias_comerciais");
    const sociosInput = document.getElementById("socios");
    const empresaIdInput = document.getElementById("empresaId");

    // Carregar empresas
    async function carregarEmpresas() {
        try {
            const response = await fetch("http://localhost:3000/vw_empresa_detalhada"); // Endpoint da view
            if (!response.ok) {
                throw new Error(`Erro ao carregar empresas: ${response.statusText}`);
            }
    
            const empresas = await response.json();
    
            empresaTableBody.innerHTML = "";
            empresas.forEach((empresa) => {
                // Transformar campos JSON em texto legível
                const referenciasBancarias = empresa.referencias_bancarias
                    ? empresa.referencias_bancarias.map(ref => `
                        Banco: ${ref.banco || '-'}, Agência: ${ref.agencia || '-'}, Conta: ${ref.conta || '-'}, 
                        Gerente: ${ref.gerente || '-'}, Telefone: ${ref.telefone || '-'}, Abertura: ${ref.data_abertura || '-'}`).join('<br>')
                    : "-";
    
                const referenciasComerciais = empresa.referencias_comerciais
                    ? empresa.referencias_comerciais.map(ref => `
                        Fornecedor: ${ref.fornecedor || '-'}, Telefone: ${ref.telefone || '-'}, 
                        Contato: ${ref.contato || '-'}, Ramo: ${ref.ramo_atividade || '-'}`).join('<br>')
                    : "-";
    
                const socios = empresa.socios
                    ? empresa.socios.map(socio => `
                        Nome: ${socio.nome || '-'}, Endereço: ${socio.endereco || '-'}, Bairro: ${socio.bairro || '-'}, 
                        Cidade: ${socio.cidade || '-'}, UF: ${socio.uf || '-'}, Telefone: ${socio.telefone || '-'}, 
                        Email: ${socio.email || '-'}`).join('<br>')
                    : "-";
    
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${empresa.id_empresa}</td>
                    <td>${empresa.cnpj}</td>
                    <td>${empresa.razao_social}</td>
                    <td>${empresa.empresa_telefone || "-"}</td>
                    <td>${referenciasBancarias}</td>
                    <td>${referenciasComerciais}</td>
                    <td>${socios}</td>
                    <td>
                        <button class="btn btn-warning btn-sm me-2" onclick='editarEmpresa(${JSON.stringify(empresa)})'>Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deletarEmpresa(${empresa.id_empresa})">Excluir</button>
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
        referenciasBancariasInput.value = "";
        referenciasComerciaisInput.value = "";
        sociosInput.value = "";
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
            referencias_bancarias: referenciasBancariasInput.value,
            referencias_comerciais: referenciasComerciaisInput.value,
            socios: sociosInput.value,
        };

        try {
            const url = id ? `http://localhost:3000/vw_empresa_detalhada/${id}` : "http://localhost:3000/vw_empresa_detalhada";
            const method = id ? "PUT" : "POST";

            await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(empresa),
            });

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
                await fetch(`http://localhost:3000/vw_empresa_detalhada/${id}`, { method: "DELETE" });
                carregarEmpresas();
            } catch (error) {
                console.error("Erro ao excluir empresa:", error);
            }
        }
    };

    // Editar Empresa
    window.editarEmpresa = (empresa) => {
        empresaIdInput.value = empresa.id_empresa;
        cnpjInput.value = empresa.cnpj;
        razaoSocialInput.value = empresa.razao_social;
        telefoneInput.value = empresa.empresa_telefone || "";
        referenciasBancariasInput.value = empresa.referencias_bancarias || "";
        referenciasComerciaisInput.value = empresa.referencias_comerciais || "";
        sociosInput.value = empresa.socios || "";
        empresaModal.show();
    };

    // Inicializar
    carregarEmpresas();
});
