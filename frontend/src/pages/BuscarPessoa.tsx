import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { Pessoa, PessoaFilters } from "../types/pessoa";
import { pessoaService } from "../services/pessoaService";
import { obraService } from "../services/obraService";
import MaskedTextField from "../components/MaskedTextField";
import {
  validarCPF,
  validarCNPJ,
  validarEmail,
  validarTelefone,
  validarCEP,
  obterMensagemErro,
} from "../utils/validators";
import { removerMascara } from "../utils/masks";

// Tipo auxiliar para edição (permite CPF/CNPJ no select)
type PessoaEdicao = Omit<Pessoa, "tipo"> & {
  tipo: "PF" | "PJ" | "CPF" | "CNPJ";
};

const BuscarPessoa: React.FC = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [pessoasFiltradas, setPessoasFiltradas] = useState<Pessoa[]>([]);
  const [filtros, setFiltros] = useState<PessoaFilters>({
    codigoPessoa: "",
    nome: "",
    documento: "",
    cpf: "",
    funcao: "",
  });
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [pessoaEditando, setPessoaEditando] = useState<PessoaEdicao | null>(
    null
  );
  const [pessoaVisualizando, setPessoaVisualizando] = useState<Pessoa | null>(
    null
  );
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarPessoas();
  }, []);

  const carregarPessoas = async () => {
    try {
      setLoading(true);
      console.log("🔍 Carregando pessoas da API...");

      const data = await pessoaService.listar();

      console.log("📊 Pessoas carregadas:", data);
      console.log(
        "📊 Tipo de data:",
        typeof data,
        "É array?",
        Array.isArray(data)
      );

      const pessoasArray = Array.isArray(data) ? data : [];

      // Limpar estados antes de atualizar
      setPessoas([]);
      setPessoasFiltradas([]);

      // Aguardar um tick para garantir que os estados foram limpos
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Atualizar com novos dados
      setPessoas(pessoasArray);
      setPessoasFiltradas(pessoasArray);

      toast.success(`✅ ${pessoasArray.length} pessoa(s) carregada(s)`);
      console.log("✅ Estados atualizados com sucesso");
    } catch (error: any) {
      console.error("❌ Erro ao carregar pessoas:", error);
      toast.error("❌ Erro ao carregar pessoas");
      setPessoas([]);
      setPessoasFiltradas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name as string]: value as string });
  };

  const handleBuscar = () => {
    console.log("🔍 Aplicando filtros:", filtros);

    let pessoasFiltradasTemp = [...pessoas];

    // Filtro por código/ID
    if (filtros.codigoPessoa) {
      pessoasFiltradasTemp = pessoasFiltradasTemp.filter(
        (p) => p.id?.toString() === filtros.codigoPessoa
      );
    }

    // Filtro por nome
    if (filtros.nome) {
      pessoasFiltradasTemp = pessoasFiltradasTemp.filter((p) =>
        p.nome.toLowerCase().includes(filtros.nome!.toLowerCase())
      );
    }

    // Filtro por documento (CNPJ ou CPF)
    if (filtros.documento || filtros.cpf) {
      const docBusca = filtros.documento || filtros.cpf;
      pessoasFiltradasTemp = pessoasFiltradasTemp.filter((p) =>
        p.documento.includes(docBusca!)
      );
    }

    // Filtro por função/cargo
    if (filtros.funcao) {
      pessoasFiltradasTemp = pessoasFiltradasTemp.filter((p) =>
        p.cargo?.toLowerCase().includes(filtros.funcao!.toLowerCase())
      );
    }

    setPessoasFiltradas(pessoasFiltradasTemp);
    toast.success(`🔍 ${pessoasFiltradasTemp.length} pessoa(s) encontrada(s)`);
  };

  const handleLimparFiltros = () => {
    setFiltros({
      codigoPessoa: "",
      nome: "",
      documento: "",
      cpf: "",
      funcao: "",
    });
    setPessoasFiltradas(pessoas);
    toast.info("🔄 Filtros limpos");
  };

  const handleEditar = async (id: number) => {
    try {
      setLoading(true);
      console.log(`🔄 Iniciando edição da pessoa ID: ${id}`);

      const pessoa = await pessoaService.buscarPorId(id);
      console.log("📝 Dados carregados para edição:", pessoa);

      // ✅ Converter tipo da API (PF/PJ) para Select (CPF/CNPJ)
      const pessoaFormatada: PessoaEdicao = {
        ...pessoa,
        tipo:
          pessoa.tipo === "PF"
            ? "CPF"
            : pessoa.tipo === "PJ"
            ? "CNPJ"
            : pessoa.tipo,
      };

      setPessoaEditando(pessoaFormatada);
      setEditModalOpen(true);

      console.log("✅ Modal de edição aberto com sucesso");
    } catch (error: any) {
      console.error("❌ Erro ao carregar pessoa para edição:", error);
      toast.error("❌ Erro ao carregar dados da pessoa");
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizar = async (id: number) => {
    try {
      setLoading(true);
      const pessoa = await pessoaService.buscarPorId(id);
      setPessoaVisualizando(pessoa);
      setViewModalOpen(true);
    } catch (error: any) {
      console.error("❌ Erro ao carregar pessoa:", error);
      toast.error("❌ Erro ao carregar dados da pessoa");
    } finally {
      setLoading(false);
    }
  };

  const handleFecharModalVisualizacao = () => {
    setViewModalOpen(false);
    setPessoaVisualizando(null);
  };

  const handleFecharModal = () => {
    setEditModalOpen(false);
    setPessoaEditando(null);
  };

  const handleSalvarEdicao = async () => {
    if (!pessoaEditando) return;

    try {
      // ✅ VALIDAÇÕES ANTES DE SALVAR
      // 1. Validar nome
      if (!pessoaEditando.nome || pessoaEditando.nome.trim().length < 3) {
        toast.error("Nome deve ter pelo menos 3 caracteres");
        return;
      }

      // 2. Validar documento (CPF ou CNPJ)
      const documentoLimpo = removerMascara(pessoaEditando.documento);
      if (pessoaEditando.tipo === "PF" || pessoaEditando.tipo === "CPF") {
        if (!validarCPF(documentoLimpo)) {
          toast.error("CPF inválido. Verifique os dígitos.");
          return;
        }
      } else {
        if (!validarCNPJ(documentoLimpo)) {
          toast.error("CNPJ inválido. Verifique os dígitos.");
          return;
        }
      }

      // 3. Validar email (se preenchido)
      if (pessoaEditando.email && !validarEmail(pessoaEditando.email)) {
        toast.error("Email inválido");
        return;
      }

      // 4. Validar telefone (se preenchido)
      if (pessoaEditando.telefone) {
        const telefoneLimpo = removerMascara(pessoaEditando.telefone);
        if (!validarTelefone(telefoneLimpo)) {
          toast.error("Telefone inválido. Use (00) 00000-0000");
          return;
        }
      }

      // 5. Validar CEP (se preenchido)
      if (pessoaEditando.endereco_cep) {
        const cepLimpo = removerMascara(pessoaEditando.endereco_cep);
        if (!validarCEP(cepLimpo)) {
          toast.error("CEP inválido. Use 00000-000");
          return;
        }
      }

      setSalvando(true);
      console.log("🔄 Salvando edição da pessoa:", pessoaEditando);

      // ✅ Converter tipo de volta para API (CPF → PF, CNPJ → PJ)
      const tipoApi: Pessoa["tipo"] =
        pessoaEditando.tipo === "CPF"
          ? "PF"
          : pessoaEditando.tipo === "CNPJ"
          ? "PJ"
          : pessoaEditando.tipo;

      // ✅ REMOVER MÁSCARAS ANTES DE ENVIAR PARA API
      const dadosAtualizados: Pessoa = {
        nome: pessoaEditando.nome,
        email: pessoaEditando.email || "",
        telefone: removerMascara(pessoaEditando.telefone || ""),
        tipo: tipoApi, // ✅ Tipo convertido para API
        documento: removerMascara(pessoaEditando.documento),
        endereco_cep: removerMascara(pessoaEditando.endereco_cep || ""),
        endereco_rua: pessoaEditando.endereco_rua || "",
        endereco_numero: pessoaEditando.endereco_numero || "",
        endereco_bairro: pessoaEditando.endereco_bairro || "",
        endereco_cidade: pessoaEditando.endereco_cidade || "",
        endereco_estado: pessoaEditando.endereco_estado || "",
        endereco_complemento: pessoaEditando.endereco_complemento || "",
        cargo: pessoaEditando.cargo || "",
        ativo: pessoaEditando.ativo !== undefined ? pessoaEditando.ativo : true, // Campo obrigatório
      };

      console.log("📤 Dados a serem enviados:", dadosAtualizados);

      // Chamar API de atualização
      const pessoaAtualizada = await pessoaService.atualizar(
        pessoaEditando.id!,
        dadosAtualizados
      );
      console.log("✅ Pessoa atualizada na API:", pessoaAtualizada);

      // Atualizar estado local IMEDIATAMENTE
      const novaListaPessoas = pessoas.map((p) =>
        p.id === pessoaEditando.id
          ? { ...p, ...dadosAtualizados, id: pessoaEditando.id }
          : p
      );

      const novaListaFiltrada = pessoasFiltradas.map((p) =>
        p.id === pessoaEditando.id
          ? { ...p, ...dadosAtualizados, id: pessoaEditando.id }
          : p
      );

      // Atualizar estados
      setPessoas(novaListaPessoas);
      setPessoasFiltradas(novaListaFiltrada);

      toast.success("✅ Pessoa atualizada com sucesso!");
      handleFecharModal();

      // Recarregar dados do servidor para garantir sincronização
      setTimeout(() => {
        carregarPessoas();
      }, 500);
    } catch (error: any) {
      console.error("❌ Erro ao atualizar pessoa:", error);
      const mensagem =
        error.response?.data?.error || "Erro ao atualizar pessoa";
      toast.error(`❌ ${mensagem}`);
    } finally {
      setSalvando(false);
    }
  };

  const handleCampoChange = (campo: keyof PessoaEdicao, valor: any) => {
    if (pessoaEditando) {
      console.log(`📝 Alterando campo ${campo}:`, valor);

      const pessoaAtualizada = {
        ...pessoaEditando,
        [campo]: valor,
      };

      console.log("📝 Pessoa atualizada no estado:", pessoaAtualizada);
      setPessoaEditando(pessoaAtualizada);
    }
  };

  const verificarAssociacaoObras = async (
    pessoaId: number,
    pessoaNome: string
  ): Promise<boolean> => {
    try {
      console.log(
        `🔍 Verificando associações para pessoa ID ${pessoaId} (${pessoaNome})`
      );

      // Buscar todas as obras
      const obras = await obraService.listar();
      console.log("📊 Obras encontradas:", obras);

      // Verificar se a pessoa é responsável ou contratante de alguma obra ativa
      const obrasAssociadas = obras.filter((obra) => {
        const ehResponsavel = obra.responsavel_id === pessoaId;
        const ehContratante = obra.contratante_id === pessoaId;
        const obraAtiva =
          obra.status !== "concluida" && obra.status !== "cancelada";

        console.log(`🔍 Obra ${obra.nome}:`, {
          ehResponsavel,
          ehContratante,
          obraAtiva,
          status: obra.status,
          responsavel_id: obra.responsavel_id,
          contratante_id: obra.contratante_id,
        });

        return (ehResponsavel || ehContratante) && obraAtiva;
      });

      console.log("🔗 Obras associadas ativas:", obrasAssociadas);

      if (obrasAssociadas.length > 0) {
        const nomesObras = obrasAssociadas.map((obra) => obra.nome).join(", ");
        const tipoAssociacao = obrasAssociadas.some(
          (obra) => obra.responsavel_id === pessoaId
        )
          ? "responsável técnico"
          : "contratante";

        console.log(
          `❌ Pessoa ${pessoaNome} está associada às obras: ${nomesObras}`
        );

        toast.error(
          `❌ Não é possível excluir. ${pessoaNome} é ${tipoAssociacao} da(s) obra(s): ${nomesObras}`,
          { autoClose: 8000 }
        );

        return true; // Tem associações
      }

      console.log(`✅ Pessoa ${pessoaNome} não possui associações ativas`);
      return false; // Não tem associações
    } catch (error) {
      console.error("❌ Erro ao verificar associações:", error);
      toast.error("❌ Erro ao verificar associações da pessoa");
      return true; // Em caso de erro, impedir exclusão por segurança
    }
  };

  const handleExcluir = async (id: number) => {
    try {
      // Buscar dados da pessoa para obter o nome
      const pessoa = pessoas.find((p) => p.id === id);
      const nomePessoa = pessoa?.nome || `ID ${id}`;

      console.log(`🗑️ Iniciando processo de exclusão para: ${nomePessoa}`);

      // Verificar se há associações com obras ativas
      const temAssociacoes = await verificarAssociacaoObras(id, nomePessoa);

      if (temAssociacoes) {
        console.log(`❌ Exclusão cancelada - pessoa tem associações ativas`);
        return; // Bloquear exclusão
      }

      // Confirmar exclusão apenas se não há associações
      const confirmMessage = `Tem certeza que deseja excluir ${nomePessoa}?\n\n⚠️ Esta ação não pode ser desfeita!`;
      if (!window.confirm(confirmMessage)) {
        console.log("❌ Exclusão cancelada pelo usuário");
        return;
      }

      console.log(`🔄 Executando exclusão para: ${nomePessoa}`);
      await pessoaService.deletar(id.toString());

      toast.success(`✅ ${nomePessoa} foi excluída com sucesso!`);
      console.log(`✅ Exclusão concluída para: ${nomePessoa}`);

      carregarPessoas(); // Recarregar lista
    } catch (error: any) {
      console.error("❌ Erro ao excluir pessoa:", error);

      // Verificar se é erro de restrição de integridade
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Erro ao excluir pessoa";

      if (
        errorMessage.includes("associada") ||
        errorMessage.includes("referenciada") ||
        errorMessage.includes("constraint")
      ) {
        toast.error(
          "❌ Não é possível excluir. Usuário está associado a uma obra ativa.",
          { autoClose: 8000 }
        );
      } else {
        toast.error(`❌ ${errorMessage}`);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Buscar Pessoa</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={carregarPessoas}
          disabled={loading}
        >
          Atualizar
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Filtros */}
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              sx={{ flex: "1 1 200px" }}
              label="Código Pessoa"
              name="codigoPessoa"
              value={filtros.codigoPessoa}
              onChange={handleFiltroChange}
            />

            <TextField
              sx={{ flex: "1 1 250px" }}
              label="Nome"
              name="nome"
              value={filtros.nome}
              onChange={handleFiltroChange}
              placeholder="Prefeitura Municipal"
            />

            <TextField
              sx={{ flex: "1 1 200px" }}
              label="CNPJ"
              name="documento"
              value={filtros.documento}
              onChange={handleFiltroChange}
              placeholder="00.000.000/0000-00"
            />

            <TextField
              sx={{ flex: "1 1 200px" }}
              label="CPF"
              name="cpf"
              value={filtros.cpf}
              onChange={handleFiltroChange}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <FormControl sx={{ flex: "1 1 200px" }}>
              <InputLabel>Função</InputLabel>
              <Select
                name="funcao"
                value={filtros.funcao}
                onChange={handleFiltroChange}
                label="Função"
              >
                <MenuItem value="">Selecionar</MenuItem>
                <MenuItem value="administradorObras">
                  Administrador de Obras
                </MenuItem>
                <MenuItem value="cliente">Cliente</MenuItem>
                <MenuItem value="engenheiro">Engenheiro</MenuItem>
                <MenuItem value="pedreiro">Pedreiro</MenuItem>
                <MenuItem value="mestreObras">Mestre de Obras</MenuItem>
                <MenuItem value="fornecedor">Fornecedor</MenuItem>
              </Select>
            </FormControl>

            <Box
              sx={{
                flex: "1 1 auto",
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleLimparFiltros}
                sx={{ minWidth: 120 }}
              >
                Limpar
              </Button>
              <Button
                variant="contained"
                onClick={handleBuscar}
                sx={{
                  minWidth: 120,
                  bgcolor: "#4caf50",
                  "&:hover": { bgcolor: "#45a049" },
                }}
              >
                🔍 Buscar
              </Button>
            </Box>
          </Box>
        </Stack>

        {/* Tabela de Resultados */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Total:</strong> {pessoasFiltradas.length} pessoa(s)
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#c62828" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Ação
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      ID
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Nome
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Tipo
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Documento
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Cargo/Função
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Telefone
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pessoasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                        Nenhuma pessoa encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    pessoasFiltradas.map((pessoa) => (
                      <TableRow
                        key={pessoa.id}
                        sx={{ "&:hover": { bgcolor: "#f5f5f5" } }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleVisualizar(pessoa.id!)}
                              title="Visualizar"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditar(pessoa.id!)}
                              title="Editar"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleExcluir(pessoa.id!)}
                              title="Excluir"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>{pessoa.id}</TableCell>
                        <TableCell>{pessoa.nome}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              pessoa.tipo === "PF"
                                ? "Pessoa Física"
                                : "Pessoa Jurídica"
                            }
                            color={
                              pessoa.tipo === "PF" ? "primary" : "secondary"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{pessoa.documento}</TableCell>
                        <TableCell>{pessoa.cargo || "-"}</TableCell>
                        <TableCell>{pessoa.email || "-"}</TableCell>
                        <TableCell>{pessoa.telefone || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={pessoa.ativo !== false ? "Ativo" : "Inativo"}
                            color={
                              pessoa.ativo !== false ? "success" : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Modal de Edição */}
      <Dialog
        open={editModalOpen}
        onClose={handleFecharModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          ✏️ Editar Pessoa {pessoaEditando?.nome && `- ${pessoaEditando.nome}`}
        </DialogTitle>
        <DialogContent>
          {pessoaEditando && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              {/* ✅ NOVO - Upload de Foto */}
              {/* Nome */}
              <TextField
                label="Nome Completo *"
                fullWidth
                value={pessoaEditando.nome || ""}
                onChange={(e) => handleCampoChange("nome", e.target.value)}
                inputProps={{ maxLength: 200 }}
                helperText={`${
                  (pessoaEditando.nome || "").length
                }/200 caracteres`}
              />

              {/* Tipo */}
              <FormControl fullWidth>
                <InputLabel>Tipo de Pessoa *</InputLabel>
                <Select
                  value={pessoaEditando.tipo || "CPF"}
                  onChange={(e) => handleCampoChange("tipo", e.target.value)}
                  label="Tipo de Pessoa *"
                >
                  <MenuItem value="CPF">Pessoa Física</MenuItem>
                  <MenuItem value="CNPJ">Pessoa Jurídica</MenuItem>
                </Select>
              </FormControl>

              {/* Documento (CPF/CNPJ) */}
              <MaskedTextField
                maskType={pessoaEditando.tipo === "CPF" ? "cpf" : "cnpj"}
                label={pessoaEditando.tipo === "CPF" ? "CPF *" : "CNPJ *"}
                fullWidth
                value={pessoaEditando.documento || ""}
                onChange={(value) => handleCampoChange("documento", value)}
                validateOnBlur={true}
                placeholder={
                  pessoaEditando.tipo === "CPF"
                    ? "000.000.000-00"
                    : "00.000.000/0000-00"
                }
              />

              {/* Email */}
              <TextField
                label="E-mail"
                type="email"
                fullWidth
                value={pessoaEditando.email || ""}
                onChange={(e) => handleCampoChange("email", e.target.value)}
                error={
                  pessoaEditando.email
                    ? !validarEmail(pessoaEditando.email)
                    : false
                }
                helperText={
                  pessoaEditando.email && !validarEmail(pessoaEditando.email)
                    ? "Email inválido"
                    : ""
                }
                inputProps={{ maxLength: 100 }}
              />

              {/* Telefone */}
              <MaskedTextField
                maskType="telefone"
                label="Telefone"
                fullWidth
                value={pessoaEditando.telefone || ""}
                onChange={(value) => {
                  console.log("📞 Alterando telefone:", value);
                  handleCampoChange("telefone", value);
                }}
                validateOnBlur={true}
                placeholder="(00) 00000-0000"
              />

              {/* Cargo */}
              <TextField
                label="Cargo/Função"
                fullWidth
                value={pessoaEditando.cargo || ""}
                onChange={(e) => handleCampoChange("cargo", e.target.value)}
              />

              {/* Endereço - CEP */}
              <MaskedTextField
                maskType="cep"
                label="CEP"
                fullWidth
                value={pessoaEditando.endereco_cep || ""}
                onChange={(value) => handleCampoChange("endereco_cep", value)}
                validateOnBlur={true}
                placeholder="00000-000"
              />

              {/* Endereço - Rua */}
              <TextField
                label="Rua/Logradouro"
                fullWidth
                value={pessoaEditando.endereco_rua || ""}
                onChange={(e) =>
                  handleCampoChange("endereco_rua", e.target.value)
                }
                inputProps={{ maxLength: 200 }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Endereço - Número */}
                <TextField
                  label="Número"
                  fullWidth
                  value={pessoaEditando.endereco_numero || ""}
                  onChange={(e) =>
                    handleCampoChange("endereco_numero", e.target.value)
                  }
                />

                {/* Endereço - Bairro */}
                <TextField
                  label="Bairro"
                  fullWidth
                  value={pessoaEditando.endereco_bairro || ""}
                  onChange={(e) =>
                    handleCampoChange("endereco_bairro", e.target.value)
                  }
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Endereço - Cidade */}
                <TextField
                  label="Cidade"
                  fullWidth
                  value={pessoaEditando.endereco_cidade || ""}
                  onChange={(e) =>
                    handleCampoChange("endereco_cidade", e.target.value)
                  }
                />

                {/* Endereço - Estado */}
                <TextField
                  label="Estado (UF)"
                  fullWidth
                  value={pessoaEditando.endereco_estado || ""}
                  onChange={(e) =>
                    handleCampoChange("endereco_estado", e.target.value)
                  }
                  inputProps={{ maxLength: 2 }}
                />
              </Box>

              {/* Endereço - Complemento */}
              <TextField
                label="Complemento"
                fullWidth
                value={pessoaEditando.endereco_complemento || ""}
                onChange={(e) =>
                  handleCampoChange("endereco_complemento", e.target.value)
                }
              />

              {/* Status Ativo */}
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={
                    pessoaEditando.ativo !== undefined
                      ? pessoaEditando.ativo.toString()
                      : "true"
                  }
                  onChange={(e) =>
                    handleCampoChange("ativo", e.target.value === "true")
                  }
                  label="Status"
                >
                  <MenuItem value="true">Ativo</MenuItem>
                  <MenuItem value="false">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharModal} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvarEdicao}
            variant="contained"
            disabled={salvando}
          >
            {salvando ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Visualização */}
      <Dialog
        open={viewModalOpen}
        onClose={handleFecharModalVisualizacao}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          👁️ Visualizar Pessoa{" "}
          {pessoaVisualizando?.nome && `- ${pessoaVisualizando.nome}`}
        </DialogTitle>
        <DialogContent>
          {pessoaVisualizando && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              {/* ID */}
              <TextField
                label="ID"
                fullWidth
                value={pessoaVisualizando.id || ""}
                InputProps={{ readOnly: true }}
              />

              {/* Nome */}
              <TextField
                label="Nome Completo"
                fullWidth
                value={pessoaVisualizando.nome || ""}
                InputProps={{ readOnly: true }}
              />

              {/* Tipo */}
              <TextField
                label="Tipo de Pessoa"
                fullWidth
                value={
                  pessoaVisualizando.tipo === "PF"
                    ? "Pessoa Física"
                    : "Pessoa Jurídica"
                }
                InputProps={{ readOnly: true }}
              />

              {/* Documento (CPF/CNPJ) */}
              <TextField
                label={pessoaVisualizando.tipo === "PF" ? "CPF" : "CNPJ"}
                fullWidth
                value={pessoaVisualizando.documento || ""}
                InputProps={{ readOnly: true }}
              />

              {/* Email */}
              <TextField
                label="E-mail"
                fullWidth
                value={pessoaVisualizando.email || "Não informado"}
                InputProps={{ readOnly: true }}
              />

              {/* Telefone */}
              <TextField
                label="Telefone"
                fullWidth
                value={pessoaVisualizando.telefone || "Não informado"}
                InputProps={{ readOnly: true }}
              />

              {/* Cargo */}
              <TextField
                label="Cargo/Função"
                fullWidth
                value={pessoaVisualizando.cargo || "Não informado"}
                InputProps={{ readOnly: true }}
              />

              {/* Status */}
              <TextField
                label="Status"
                fullWidth
                value={pessoaVisualizando.ativo !== false ? "Ativo" : "Inativo"}
                InputProps={{ readOnly: true }}
              />

              {/* Endereço - CEP */}
              {pessoaVisualizando.endereco_cep && (
                <TextField
                  label="CEP"
                  fullWidth
                  value={pessoaVisualizando.endereco_cep}
                  InputProps={{ readOnly: true }}
                />
              )}

              {/* Endereço - Rua */}
              {pessoaVisualizando.endereco_rua && (
                <TextField
                  label="Rua/Logradouro"
                  fullWidth
                  value={pessoaVisualizando.endereco_rua}
                  InputProps={{ readOnly: true }}
                />
              )}

              {(pessoaVisualizando.endereco_numero ||
                pessoaVisualizando.endereco_bairro) && (
                <Box sx={{ display: "flex", gap: 2 }}>
                  {/* Endereço - Número */}
                  {pessoaVisualizando.endereco_numero && (
                    <TextField
                      label="Número"
                      fullWidth
                      value={pessoaVisualizando.endereco_numero}
                      InputProps={{ readOnly: true }}
                    />
                  )}

                  {/* Endereço - Bairro */}
                  {pessoaVisualizando.endereco_bairro && (
                    <TextField
                      label="Bairro"
                      fullWidth
                      value={pessoaVisualizando.endereco_bairro}
                      InputProps={{ readOnly: true }}
                    />
                  )}
                </Box>
              )}

              {(pessoaVisualizando.endereco_cidade ||
                pessoaVisualizando.endereco_estado) && (
                <Box sx={{ display: "flex", gap: 2 }}>
                  {/* Endereço - Cidade */}
                  {pessoaVisualizando.endereco_cidade && (
                    <TextField
                      label="Cidade"
                      fullWidth
                      value={pessoaVisualizando.endereco_cidade}
                      InputProps={{ readOnly: true }}
                    />
                  )}

                  {/* Endereço - Estado */}
                  {pessoaVisualizando.endereco_estado && (
                    <TextField
                      label="Estado (UF)"
                      fullWidth
                      value={pessoaVisualizando.endereco_estado}
                      InputProps={{ readOnly: true }}
                    />
                  )}
                </Box>
              )}

              {/* Endereço - Complemento */}
              {pessoaVisualizando.endereco_complemento && (
                <TextField
                  label="Complemento"
                  fullWidth
                  value={pessoaVisualizando.endereco_complemento}
                  InputProps={{ readOnly: true }}
                />
              )}

              {/* Datas de criação/atualização */}
              <Box sx={{ display: "flex", gap: 2 }}>
                {pessoaVisualizando.createdAt && (
                  <TextField
                    label="Data de Criação"
                    fullWidth
                    value={new Date(
                      pessoaVisualizando.createdAt
                    ).toLocaleString("pt-BR")}
                    InputProps={{ readOnly: true }}
                  />
                )}

                {pessoaVisualizando.updatedAt && (
                  <TextField
                    label="Última Atualização"
                    fullWidth
                    value={new Date(
                      pessoaVisualizando.updatedAt
                    ).toLocaleString("pt-BR")}
                    InputProps={{ readOnly: true }}
                  />
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharModalVisualizacao}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuscarPessoa;
