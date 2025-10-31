import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tabs,
  Tab,
  Stack,
  IconButton,
  SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SaveIcon from "@mui/icons-material/Save";
import { toast } from "react-toastify";
import {
  Obra,
  ObraLegacy,
  Aditivo,
  Despesa,
  FolhaPagamento,
} from "../types/obra";
import { obraService } from "../services/obraService";
import { pessoaService } from "../services/pessoaService";

const CadastrarObra: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Aba Informações
  const [obra, setObra] = useState<ObraLegacy>({
    nome: "",
    contratoNumero: "",
    tipoObra: "Manutenção",
    situacao: "Em andamento",
    dataInicio: "",
    dataTerminoPrevista: "",
    dataInicioReal: "",
    descricao: "",
    enderecoCep: "",
    enderecoRua: "",
    enderecoCidade: "",
    enderecoEstado: "",
    responsavelId: undefined,
    contratanteId: undefined,
  });

  // Aba Financeiro
  const [financeiro, setFinanceiro] = useState({
    orcamentoEstimado: 0,
    valorTotal: 0,
    valorUtilizado: 0,
    saldoObra: 0,
  });
  const [aditivos, setAditivos] = useState<Aditivo[]>([]);
  const [novoAditivo, setNovoAditivo] = useState<Aditivo>({
    valor: 0,
    data: new Date().toISOString().split("T")[0],
  });

  // Aba Gastos Gerais (Despesas)
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [novaDespesa, setNovaDespesa] = useState<Despesa>({
    obraId: 0,
    categoria: "",
    fornecedor: "",
    pagoPor: "",
    status: "Pago",
    dataPagamento: new Date().toISOString().split("T")[0],
    valor: 0,
    descricao: "",
  });

  // Aba Folha de Pagamento
  const [folhasPagamento, setFolhasPagamento] = useState<FolhaPagamento[]>([]);
  const [novaFolha, setNovaFolha] = useState<FolhaPagamento>({
    obraId: 0,
    funcionario: "",
    diasTrabalhados: 1, // ✅ Valor inicial 1 (ao invés de 0)
    pagoPor: "",
    periodoReferencia: "",
    status: "Pago",
    dataPagamento: new Date().toISOString().split("T")[0],
    valorDiaria: 0,
    valor: 0,
    descricao: "",
  });

  // Responsáveis e contratantes da API
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [contratantes, setContratantes] = useState<any[]>([]);

  // Carregar pessoas da API ao montar o componente
  useEffect(() => {
    carregarPessoas();
  }, []);

  const carregarPessoas = async () => {
    try {
      setLoading(true);
      const pessoas = await pessoaService.listar();

      console.log("🧑 Pessoas carregadas:", pessoas);

      // Filtrar por tipo: responsáveis (pessoas físicas) e contratantes (empresas)
      const pessoasFisicas = pessoas.filter(
        (p: any) => p.tipo === "PF" || p.tipo_documento === "PF"
      );
      const pessoasJuridicas = pessoas.filter(
        (p: any) => p.tipo === "PJ" || p.tipo_documento === "PJ"
      );

      console.log("👤 Pessoas Físicas (Responsáveis):", pessoasFisicas);
      console.log("🏢 Pessoas Jurídicas (Contratantes):", pessoasJuridicas);

      setResponsaveis(pessoasFisicas);
      setContratantes(pessoasJuridicas);
    } catch (error: any) {
      console.error("❌ Erro ao carregar pessoas:", error);
      toast.error("Erro ao carregar lista de pessoas");
    } finally {
      setLoading(false);
    }
  };

  const handleObraChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setObra({ ...obra, [name as string]: value });
  };

  const handleFinanceiroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFinanceiro({ ...financeiro, [name]: numValue });
  };

  // Adicionar Aditivo
  const adicionarAditivo = () => {
    if (novoAditivo.valor <= 0) {
      toast.error("Valor do aditivo deve ser maior que zero");
      return;
    }
    setAditivos([...aditivos, { ...novoAditivo, id: Date.now() }]);
    setNovoAditivo({ valor: 0, data: new Date().toISOString().split("T")[0] });
    toast.success("Aditivo adicionado!");
  };

  const removerAditivo = (id: number) => {
    setAditivos(aditivos.filter((a) => a.id !== id));
    toast.info("Aditivo removido");
  };

  // Adicionar Despesa
  const adicionarDespesa = () => {
    if (!novaDespesa.categoria || !novaDespesa.fornecedor) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setDespesas([...despesas, { ...novaDespesa, id: Date.now() }]);
    setNovaDespesa({
      obraId: 0,
      categoria: "",
      fornecedor: "",
      pagoPor: "",
      status: "Pago",
      dataPagamento: new Date().toISOString().split("T")[0],
      valor: 0,
      descricao: "",
    });
    toast.success("Despesa adicionada!");
  };

  const removerDespesa = (id: number) => {
    setDespesas(despesas.filter((d) => d.id !== id));
    toast.info("Despesa removida");
  };

  // Adicionar Folha de Pagamento
  const adicionarFolha = () => {
    if (!novaFolha.funcionario) {
      toast.error("Selecione um funcionário");
      return;
    }
    setFolhasPagamento([...folhasPagamento, { ...novaFolha, id: Date.now() }]);
    setNovaFolha({
      obraId: 0,
      funcionario: "",
      diasTrabalhados: 1, // ✅ Valor inicial 1
      pagoPor: "",
      periodoReferencia: "",
      status: "Pago",
      dataPagamento: new Date().toISOString().split("T")[0],
      valorDiaria: 0,
      valor: 0,
      descricao: "",
    });
    toast.success("Folha de pagamento adicionada!");
  };

  const removerFolha = (id: number) => {
    setFolhasPagamento(folhasPagamento.filter((f) => f.id !== id));
    toast.info("Folha removida");
  };

  const handleSubmit = async () => {
    // Validações
    if (!obra.nome || !obra.contratoNumero) {
      toast.error("⚠️ Preencha os campos obrigatórios (Nome e ART)");
      return;
    }

    if (!obra.responsavelId) {
      toast.error("⚠️ Selecione um responsável pela obra");
      return;
    }

    if (!obra.contratanteId) {
      toast.error("⚠️ Selecione um contratante/cliente");
      return;
    }

    try {
      setSalvando(true);

      // Calcular prazo em dias (diferença entre data_fim_prevista e data_inicio)
      let prazoDias: number | undefined = undefined;
      if (obra.dataInicio && obra.dataTerminoPrevista) {
        const dataInicio = new Date(obra.dataInicio);
        const dataFim = new Date(obra.dataTerminoPrevista);
        const diffTime = dataFim.getTime() - dataInicio.getTime();
        prazoDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Converter ms para dias
      }

      // Mapear status corretamente
      const mapearStatus = (
        situacao: string | undefined
      ):
        | "planejamento"
        | "em_andamento"
        | "pausada"
        | "concluida"
        | "cancelada" => {
        switch (situacao?.toLowerCase()) {
          case "planejamento":
            return "planejamento";
          case "em andamento":
            return "em_andamento";
          case "pausada":
            return "pausada";
          case "concluída":
          case "concluida":
            return "concluida";
          case "cancelada":
            return "cancelada";
          default:
            return "em_andamento";
        }
      };

      // Preparar dados para API com tipos corretos
      const dadosObra: Partial<Obra> = {
        nome: obra.nome,
        contrato_numero: obra.contratoNumero,
        status: mapearStatus(obra.situacao),
        data_inicio: obra.dataInicio || undefined,
        data_fim_prevista: obra.dataTerminoPrevista || undefined,
        prazo_dias: prazoDias, // ✅ Campo calculado
        observacoes: obra.descricao || "",
        endereco_cep: obra.enderecoCep || "",
        endereco_rua: obra.enderecoRua || "",
        endereco_cidade: obra.enderecoCidade || "",
        endereco_estado: obra.enderecoEstado || "",
        responsavel_id: obra.responsavelId
          ? Number(obra.responsavelId)
          : undefined,
        contratante_id: obra.contratanteId
          ? Number(obra.contratanteId)
          : undefined,
        orcamento: financeiro.orcamentoEstimado,
      };

      console.log("📝 Enviando obra para API:", dadosObra);
      console.log("📤 Payload JSON:", JSON.stringify(dadosObra, null, 2));

      const obraCriada = await obraService.criar(dadosObra);

      console.log("✅ Obra criada com sucesso:", obraCriada);

      toast.success(
        `✅ Obra cadastrada com sucesso! Código: ${
          obraCriada.codigo || obraCriada.id
        }`
      );

      // Limpar formulário após sucesso
      setObra({
        nome: "",
        contratoNumero: "",
        tipoObra: "Manutenção",
        situacao: "Em andamento",
        dataInicio: "",
        dataTerminoPrevista: "",
        descricao: "",
        enderecoCep: "",
        enderecoRua: "",
        enderecoCidade: "",
        enderecoEstado: "",
        responsavelId: undefined,
        contratanteId: undefined,
      });

      setFinanceiro({
        orcamentoEstimado: 0,
        valorTotal: 0,
        valorUtilizado: 0,
        saldoObra: 0,
      });

      setAditivos([]);
      setDespesas([]);
      setFolhasPagamento([]);
      setAbaAtiva(0);

      // Opcional: redirecionar para página de obras após 2 segundos
      setTimeout(() => {
        window.location.href = "/obras";
      }, 2000);
    } catch (error: any) {
      console.error("❌ Erro ao cadastrar obra:", error);
      console.error("📥 Resposta do servidor:", error.response?.data);
      console.error("📊 Status HTTP:", error.response?.status);
      console.error("📋 Detalhes:", error.response?.data?.details);

      let mensagemErro = "Erro ao cadastrar obra";

      if (error.response?.status === 400) {
        const details = error.response?.data?.details || "";
        const serverError = error.response?.data?.error || "";

        // Erro de data inválida
        if (details.includes("invalid input syntax for type date")) {
          mensagemErro =
            "⚠️ Preencha todas as datas obrigatórias (Data de Início e Data de Término Prevista)";
        }
        // Erro de constraint de prazo
        else if (details.includes("obra_prazo_dias_check")) {
          mensagemErro =
            "⚠️ O prazo da obra deve ser maior que zero. Verifique se a Data de Término é posterior à Data de Início.";
        }
        // Erro de constraint de status
        else if (details.includes("obra_status_check")) {
          mensagemErro =
            "⚠️ Status inválido. Use: Em andamento, Pausada, Concluída ou Cancelada.";
        }
        // Outros erros 400
        else {
          mensagemErro =
            serverError ||
            details ||
            error.response?.data?.message ||
            "Dados inválidos. Verifique os campos obrigatórios.";
        }
      } else {
        mensagemErro =
          error.response?.data?.message || error.message || "Erro desconhecido";
      }

      toast.error(`❌ ${mensagemErro}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={abaAtiva} onChange={(_, v) => setAbaAtiva(v)}>
          <Tab label="Informações" />
          <Tab label="Financeiro" />
          <Tab label="Gastos gerais" />
          <Tab label="Folha de pagto" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3, mt: 2 }}>
          {/* ABA 1: INFORMAÇÕES */}
          {abaAtiva === 0 && (
            <Stack spacing={3}>
              <Typography variant="h6">Código da Obra: 1</Typography>
              <Typography variant="body2" color="text.secondary">
                Situação: {obra.situacao}
              </Typography>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Contratante/Cliente</InputLabel>
                  <Select
                    name="contratanteId"
                    value={obra.contratanteId?.toString() || ""}
                    onChange={handleObraChange}
                  >
                    {contratantes.length === 0 ? (
                      <MenuItem disabled>
                        Nenhum contratante (PJ) cadastrado
                      </MenuItem>
                    ) : (
                      contratantes.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.nome} - {c.documento}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Tipo de Obra</InputLabel>
                  <Select
                    name="tipoObra"
                    value={obra.tipoObra || ""}
                    onChange={handleObraChange}
                  >
                    <MenuItem value="Manutenção">Manutenção</MenuItem>
                    <MenuItem value="Construção">Construção</MenuItem>
                    <MenuItem value="Reforma">Reforma</MenuItem>
                    <MenuItem value="Infraestrutura">Infraestrutura</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  required
                  label="Nome da Obra"
                  name="nome"
                  value={obra.nome}
                  onChange={handleObraChange}
                />
                <TextField
                  fullWidth
                  required
                  label="ART"
                  name="contratoNumero"
                  value={obra.contratoNumero}
                  onChange={handleObraChange}
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data de Início (Estimada)"
                  name="dataInicio"
                  value={obra.dataInicio}
                  onChange={handleObraChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Data de Término (Estimada)"
                  name="dataTerminoPrevista"
                  value={obra.dataTerminoPrevista}
                  onChange={handleObraChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descrição da Obra"
                name="descricao"
                value={obra.descricao}
                onChange={handleObraChange}
              />

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Endereço da Obra
              </Typography>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="CEP"
                  name="enderecoCep"
                  value={obra.enderecoCep}
                  onChange={handleObraChange}
                  sx={{ width: { xs: "100%", md: "30%" } }}
                />
                <TextField
                  fullWidth
                  label="Logradouro / Rua"
                  name="enderecoRua"
                  value={obra.enderecoRua}
                  onChange={handleObraChange}
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Estado/UF"
                  name="enderecoEstado"
                  value={obra.enderecoEstado}
                  onChange={handleObraChange}
                  sx={{ width: { xs: "100%", md: "30%" } }}
                />
                <TextField
                  fullWidth
                  label="Cidade"
                  name="enderecoCidade"
                  value={obra.enderecoCidade}
                  onChange={handleObraChange}
                />
              </Stack>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Responsável pela Obra
              </Typography>

              <FormControl fullWidth required>
                <InputLabel>Responsável pela Obra</InputLabel>
                <Select
                  name="responsavelId"
                  value={obra.responsavelId?.toString() || ""}
                  onChange={handleObraChange}
                >
                  {responsaveis.length === 0 ? (
                    <MenuItem disabled>
                      Nenhum responsável (PF) cadastrado
                    </MenuItem>
                  ) : (
                    responsaveis.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.nome} - {r.documento}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => setAbaAtiva(1)}
                  sx={{
                    backgroundColor: "#2196f3",
                    "&:hover": { backgroundColor: "#1976d2" },
                  }}
                >
                  Próximo
                </Button>
              </Box>
            </Stack>
          )}

          {/* ABA 2: FINANCEIRO */}
          {abaAtiva === 1 && (
            <Stack spacing={3}>
              <Typography variant="h6">Financeiro</Typography>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Orçamento estimado da Obra"
                  name="orcamentoEstimado"
                  value={financeiro.orcamentoEstimado}
                  onChange={handleFinanceiroChange}
                  InputProps={{ startAdornment: "R$" }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Valor total da obra"
                  name="valorTotal"
                  value={financeiro.valorTotal}
                  onChange={handleFinanceiroChange}
                  InputProps={{ startAdornment: "R$" }}
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Valor utilizado"
                  name="valorUtilizado"
                  value={financeiro.valorUtilizado}
                  onChange={handleFinanceiroChange}
                  InputProps={{ startAdornment: "R$" }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Saldo da Obra"
                  name="saldoObra"
                  value={financeiro.saldoObra}
                  onChange={handleFinanceiroChange}
                  InputProps={{ startAdornment: "R$" }}
                />
              </Stack>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Aditivo
              </Typography>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems="center"
              >
                <TextField
                  type="number"
                  label="Valor do Aditivo"
                  value={novoAditivo.valor}
                  onChange={(e) =>
                    setNovoAditivo({
                      ...novoAditivo,
                      valor: parseFloat(e.target.value) || 0,
                    })
                  }
                  InputProps={{ startAdornment: "R$" }}
                  sx={{ width: { xs: "100%", md: "40%" } }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  onClick={adicionarAditivo}
                  sx={{
                    backgroundColor: "#4caf50",
                    "&:hover": { backgroundColor: "#45a049" },
                  }}
                >
                  Adicionar
                </Button>
              </Stack>

              {aditivos.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{ backgroundColor: "#c62828", color: "white" }}
                      >
                        <th style={{ padding: "8px", textAlign: "left" }}>
                          Ação
                        </th>
                        <th style={{ padding: "8px", textAlign: "left" }}>
                          Valor do aditivo
                        </th>
                        <th style={{ padding: "8px", textAlign: "left" }}>
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {aditivos.map((aditivo) => (
                        <tr key={aditivo.id}>
                          <td style={{ padding: "8px" }}>
                            <IconButton
                              size="small"
                              onClick={() => removerAditivo(aditivo.id!)}
                            >
                              <DeleteIcon color="error" />
                            </IconButton>
                          </td>
                          <td style={{ padding: "8px" }}>
                            R$ {aditivo.valor.toFixed(2)}
                          </td>
                          <td style={{ padding: "8px" }}>{aditivo.data}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button variant="outlined" onClick={() => setAbaAtiva(0)}>
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setAbaAtiva(2)}
                  sx={{
                    backgroundColor: "#2196f3",
                    "&:hover": { backgroundColor: "#1976d2" },
                  }}
                >
                  Próximo
                </Button>
              </Box>
            </Stack>
          )}

          {/* ABA 3: GASTOS GERAIS (Despesas) */}
          {abaAtiva === 2 && (
            <Stack spacing={3}>
              <Typography variant="h6">Lançamento de despesas</Typography>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={novaDespesa.categoria}
                    onChange={(e) =>
                      setNovaDespesa({
                        ...novaDespesa,
                        categoria: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="Material de Construção">
                      Material de Construção
                    </MenuItem>
                    <MenuItem value="Mão de Obra">Mão de Obra</MenuItem>
                    <MenuItem value="Equipamentos">Equipamentos</MenuItem>
                    <MenuItem value="Transporte">Transporte</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Forma de Pagamento</InputLabel>
                  <Select
                    value={novaDespesa.pagoPor}
                    onChange={(e) =>
                      setNovaDespesa({
                        ...novaDespesa,
                        pagoPor: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                    <MenuItem value="PIX">PIX</MenuItem>
                    <MenuItem value="Cartão">Cartão</MenuItem>
                    <MenuItem value="Boleto">Boleto</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Pago por</InputLabel>
                  <Select
                    value={novaDespesa.pagoPor}
                    onChange={(e) =>
                      setNovaDespesa({
                        ...novaDespesa,
                        pagoPor: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="William de Souza Pereira">
                      William de Souza Pereira
                    </MenuItem>
                    <MenuItem value="João Silva">João Silva</MenuItem>
                    <MenuItem value="Empresa">Empresa</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Fornecedor</InputLabel>
                  <Select
                    value={novaDespesa.fornecedor}
                    onChange={(e) =>
                      setNovaDespesa({
                        ...novaDespesa,
                        fornecedor: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="CARVALHO CONSTRUÇÃO">
                      CARVALHO CONSTRUÇÃO
                    </MenuItem>
                    <MenuItem value="Materiais ABC">Materiais ABC</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={novaDespesa.status}
                    onChange={(e) =>
                      setNovaDespesa({ ...novaDespesa, status: e.target.value })
                    }
                  >
                    <MenuItem value="Pago">Pago</MenuItem>
                    <MenuItem value="Pendente">Pendente</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  type="date"
                  label="Data de Pagamento"
                  value={novaDespesa.dataPagamento}
                  onChange={(e) =>
                    setNovaDespesa({
                      ...novaDespesa,
                      dataPagamento: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  type="number"
                  label="Valor"
                  value={novaDespesa.valor}
                  onChange={(e) =>
                    setNovaDespesa({
                      ...novaDespesa,
                      valor: parseFloat(e.target.value) || 0,
                    })
                  }
                  InputProps={{ startAdornment: "R$" }}
                  sx={{ width: { xs: "100%", md: "30%" } }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Descrição da Obra"
                  value={novaDespesa.descricao}
                  onChange={(e) =>
                    setNovaDespesa({
                      ...novaDespesa,
                      descricao: e.target.value,
                    })
                  }
                />
              </Stack>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  onClick={adicionarDespesa}
                  sx={{
                    backgroundColor: "#4caf50",
                    "&:hover": { backgroundColor: "#45a049" },
                  }}
                >
                  Adicionar Nova Despesa
                </Button>
              </Box>

              {despesas.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Despesas
                  </Typography>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{ backgroundColor: "#c62828", color: "white" }}
                      >
                        <th style={{ padding: "8px" }}>Ação</th>
                        <th style={{ padding: "8px" }}>Categoria</th>
                        <th style={{ padding: "8px" }}>Fornecedor</th>
                        <th style={{ padding: "8px" }}>Pago por</th>
                        <th style={{ padding: "8px" }}>Data do Pagamento</th>
                        <th style={{ padding: "8px" }}>Situação</th>
                        <th style={{ padding: "8px" }}>Valor</th>
                        <th style={{ padding: "8px" }}>Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {despesas.map((desp) => (
                        <tr key={desp.id}>
                          <td style={{ padding: "8px" }}>
                            <IconButton
                              size="small"
                              onClick={() => removerDespesa(desp.id!)}
                            >
                              <DeleteIcon color="error" />
                            </IconButton>
                          </td>
                          <td style={{ padding: "8px" }}>{desp.categoria}</td>
                          <td style={{ padding: "8px" }}>{desp.fornecedor}</td>
                          <td style={{ padding: "8px" }}>{desp.pagoPor}</td>
                          <td style={{ padding: "8px" }}>
                            {desp.dataPagamento}
                          </td>
                          <td style={{ padding: "8px" }}>{desp.status}</td>
                          <td style={{ padding: "8px" }}>
                            R$ {desp.valor.toFixed(2)}
                          </td>
                          <td style={{ padding: "8px" }}>{desp.descricao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, textAlign: "right" }}
                  >
                    <strong>Total Pago:</strong> R${" "}
                    {despesas.reduce((sum, d) => sum + d.valor, 0).toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button variant="outlined" onClick={() => setAbaAtiva(1)}>
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setAbaAtiva(3)}
                  sx={{
                    backgroundColor: "#2196f3",
                    "&:hover": { backgroundColor: "#1976d2" },
                  }}
                >
                  Próximo
                </Button>
              </Box>
            </Stack>
          )}

          {/* ABA 4: FOLHA DE PAGAMENTO */}
          {abaAtiva === 3 && (
            <Stack spacing={3}>
              <Typography variant="h6">
                Lançamento de Folha de pagamento
              </Typography>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Funcionário</InputLabel>
                  <Select
                    value={novaFolha.funcionario}
                    onChange={(e) =>
                      setNovaFolha({
                        ...novaFolha,
                        funcionario: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="Junior Sá da Vitória">
                      Junior Sá da Vitória
                    </MenuItem>
                    <MenuItem value="João Silva">João Silva</MenuItem>
                    <MenuItem value="Maria Santos">Maria Santos</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Dias Trabalhados</InputLabel>
                  <Select
                    value={novaFolha.diasTrabalhados}
                    onChange={(e) =>
                      setNovaFolha({
                        ...novaFolha,
                        diasTrabalhados: Number(e.target.value),
                      })
                    }
                  >
                    {[...Array(31)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Pago por</InputLabel>
                  <Select
                    value={novaFolha.pagoPor}
                    onChange={(e) =>
                      setNovaFolha({ ...novaFolha, pagoPor: e.target.value })
                    }
                  >
                    <MenuItem value="William de Souza Pereira">
                      William de Souza Pereira
                    </MenuItem>
                    <MenuItem value="Empresa">Empresa</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Período Referência</InputLabel>
                  <Select
                    value={novaFolha.periodoReferencia}
                    onChange={(e) =>
                      setNovaFolha({
                        ...novaFolha,
                        periodoReferencia: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="1º Quinzena - Jan/2025">
                      1º Quinzena - Jan/2025
                    </MenuItem>
                    <MenuItem value="2º Quinzena - Jan/2025">
                      2º Quinzena - Jan/2025
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={novaFolha.status}
                    onChange={(e) =>
                      setNovaFolha({ ...novaFolha, status: e.target.value })
                    }
                  >
                    <MenuItem value="Pago">Pago</MenuItem>
                    <MenuItem value="Pendente">Pendente</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  type="date"
                  label="Data de Pagamento"
                  value={novaFolha.dataPagamento}
                  onChange={(e) =>
                    setNovaFolha({
                      ...novaFolha,
                      dataPagamento: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <TextField
                type="number"
                label="Valor Diária/Salário Base"
                value={novaFolha.valorDiaria}
                onChange={(e) =>
                  setNovaFolha({
                    ...novaFolha,
                    valorDiaria: parseFloat(e.target.value) || 0,
                  })
                }
                InputProps={{ startAdornment: "R$" }}
                sx={{ width: { xs: "100%", md: "30%" } }}
              />

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descrição"
                value={novaFolha.descricao}
                onChange={(e) =>
                  setNovaFolha({ ...novaFolha, descricao: e.target.value })
                }
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={adicionarFolha}
                  sx={{
                    backgroundColor: "#4caf50",
                    "&:hover": { backgroundColor: "#45a049" },
                  }}
                >
                  Lançar Folha de Pagamento
                </Button>
              </Box>

              {folhasPagamento.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Folha de Pagamento
                  </Typography>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{ backgroundColor: "#c62828", color: "white" }}
                      >
                        <th style={{ padding: "8px" }}>Ação</th>
                        <th style={{ padding: "8px" }}>Funcionário</th>
                        <th style={{ padding: "8px" }}>Período Referência</th>
                        <th style={{ padding: "8px" }}>Pago por</th>
                        <th style={{ padding: "8px" }}>Data de Pagamento</th>
                        <th style={{ padding: "8px" }}>Situação</th>
                        <th style={{ padding: "8px" }}>Valor</th>
                        <th style={{ padding: "8px" }}>Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {folhasPagamento.map((folha) => (
                        <tr key={folha.id}>
                          <td style={{ padding: "8px" }}>
                            <IconButton
                              size="small"
                              onClick={() => removerFolha(folha.id!)}
                            >
                              <DeleteIcon color="error" />
                            </IconButton>
                          </td>
                          <td style={{ padding: "8px" }}>
                            {folha.funcionario}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {folha.periodoReferencia}
                          </td>
                          <td style={{ padding: "8px" }}>{folha.pagoPor}</td>
                          <td style={{ padding: "8px" }}>
                            {folha.dataPagamento}
                          </td>
                          <td style={{ padding: "8px" }}>{folha.status}</td>
                          <td style={{ padding: "8px" }}>
                            R${" "}
                            {(
                              folha.diasTrabalhados * folha.valorDiaria
                            ).toFixed(2)}
                          </td>
                          <td style={{ padding: "8px" }}>{folha.descricao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, textAlign: "right" }}
                  >
                    <strong>Total Pago:</strong> R${" "}
                    {folhasPagamento
                      .reduce(
                        (sum, f) => sum + f.diasTrabalhados * f.valorDiaria,
                        0
                      )
                      .toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button variant="outlined" onClick={() => setAbaAtiva(2)}>
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={salvando}
                  startIcon={
                    salvando ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  sx={{
                    backgroundColor: "#4caf50",
                    "&:hover": { backgroundColor: "#45a049" },
                  }}
                >
                  {salvando ? "Salvando..." : "Salvar"}
                </Button>
              </Box>
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default CadastrarObra;
