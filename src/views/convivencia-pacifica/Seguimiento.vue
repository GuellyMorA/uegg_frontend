<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import Auth from '@/services/Auth';

// ===== INTERFACES Y TIPOS =====
interface IndicadorItem {
    id: number;
    desc_indicadores: string;
    cod_indicadores: string;
}

interface FormState {
    username: string;
    idUE: string;
    // Datos de Unidad Educativa
    codSie: string;
    sie: number | null;
    unidadEducativa: string;

    accionInicial: number | null;
    accionEjecutada: number | null;
    Indicador1: IndicadorItem | null;
    Indicador2: IndicadorItem | null;
    Indicador3: IndicadorItem | null;
    Indicador4: IndicadorItem | null;
    Indicador5: IndicadorItem | null;
    fecha: string;
    indicadoresIds: Record<string, number | null>;

    // Propiedades pobladas por `findUnidadesEducativasPorDirector`
    director: string;
    departamentoId: number | null;
    departamentoNombre: string;
    municipioNombre: string;
    nivel: string;
    modalidad: string;

    // Propiedades pobladas por `findAccionesEjecucion`
    id_accciones_ejecucion: number | null;
    id_pcpa_construccion: number | null;
    accionEjecutadaEstado: string | null;
}

// ===== CONSTANTES =====
const TIPO_IND_1 = '1. Infraestructura amigable y segura';
const TIPO_IND_2 = '2. Convivencia pacífica y aplicación de protocolos';
const TIPO_IND_3 = '3. Formación de la comunidad educativa en convivencia pacífica';
const TIPO_IND_4 = '4. Participación de niñas, niños y adolescentes';
const TIPO_IND_5 = '5. Articulación de la unidad educativa con servicios y la comunidad';

const TIPO_MAP_INDICADORES: Record<string, string> = {
    [TIPO_IND_1]: 'Indicador1',
    [TIPO_IND_2]: 'Indicador2',
    [TIPO_IND_3]: 'Indicador3',
    [TIPO_IND_4]: 'Indicador4',
    [TIPO_IND_5]: 'Indicador5',
};

const INDICADORES_FIELDS = {
    pk: 'id_indicadores_ejecutadas',
    type: 'id_pcpa_indicadores_tipo',
    value: 'desc_indicadores_ejecutadas',
    date: 'fec_ejecucion'
};

const sieRules = [
    (value: any) => !!value || 'El SIE es requerido',
    (value: any) => (String(value)?.length === 8) || 'El código SIE requiere 8 dígitos.',
];

// ===== REFERENCIAS REACTIVAS =====
const router = useRouter();
const valid = ref(false);
const dialog = ref(false);
const dialogSave = ref(false);
const validationErrors = ref<Record<string, boolean>>({});
const find = ref(false);
const indicadores = ref<IndicadorItem[]>([]);
const institucionEducativa = ref<any>(null);

// ===== ESTADO DE LA UI =====
const username = ref(localStorage.getItem('username') || '');
const existeMiembro =  ref(false); 
const registroExiste = ref(localStorage.getItem('existeEnBD') === 'true' ? true : false);
const isFormDisabled = ref(true);  //ref(!registroExiste.value);
const isFormDisabledFromNew = ref(true);
const isLoading = ref(true);
const idUE = ref(localStorage.getItem('idUE'));
const constId = ref<number | null>(null);

// ===== FUNCIONES DE AYUDA =====
const getDefaultFormState = (): FormState => ({
    username: '',
    idUE: '',
    // Datos de Unidad Educativa
    codSie: '',
    sie: null,
    unidadEducativa: '',
    accionInicial: null,
    accionEjecutada: null,
    Indicador1: null,
    Indicador2: null,
    Indicador3: null,
    Indicador4: null,
    Indicador5: null,
    fecha: '',
    indicadoresIds: {},
    // Propiedades pobladas por `findUnidadesEducativasPorDirector`  
    director: '',
    departamentoId: null,
    departamentoNombre: '',
    municipioNombre: '',
    nivel: '',
    modalidad: '',

    // Props de Acciones
    id_accciones_ejecucion: null,
    id_pcpa_construccion: null,
    accionEjecutadaEstado: null
});
const form = ref<FormState>(getDefaultFormState());

function formatFecha(fecha: string): string {
    if (!fecha) return '';
    const dateParts = fecha.split("T")[0].split("-");
    if (dateParts.length === 3) {
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    }
    return '';
}

function parseDate(dateString: string): string | null {
    if (!dateString || dateString.length !== 10) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
}

function onDateInput(cleanedInput: string): string {
    if (cleanedInput.length <= 2) {
        return cleanedInput;
    } else if (cleanedInput.length <= 4) {
        return `${cleanedInput.slice(0, 2)}/${cleanedInput.slice(2)}`;
    }
    const truncatedInput = cleanedInput.slice(0, 8);
    return `${truncatedInput.slice(0, 2)}/${truncatedInput.slice(2, 4)}/${truncatedInput.slice(4, 8)}`;
}

// ===== CICLO DE VIDA =====
onMounted(async () => {
    console.log('Ingresando con codSie y username : ', localStorage.getItem('codigo_sie'), localStorage.getItem('username'));
    await loadInitialData();
    console.log('==================================================================================');
    console.log('Ingresando con if= registroExiste y disabled= isFormDisabled y existeMiembro: ', registroExiste.value, isFormDisabled.value,existeMiembro.value);
    console.log(' onMounted constId.value : ', constId.value);
});

// ===== CARGA DE DATOS =====
const loadInitialData = async () => {
    isLoading.value = true;
    username.value = localStorage.getItem("username") || "";
    form.value.username = username.value;
    form.value.idUE = localStorage.getItem('idUE') || '';
    const codSie = localStorage.getItem('codigo_sie') || '';

    if (codSie) {
        form.value.codSie = codSie;

        try {
            // 1. Encontrar IDs críticos (idUE y idConst)
            idUE.value = await ConvivenciaPacifica.findUeByCiAndCodSieSetVariables(form.value);
            form.value.idUE = idUE.value || '';
            constId.value = await ConvivenciaPacifica.findIdConstByCiAndUeSetVariables(form.value);
            console.info('Iniciando procesamiento de API... constId.value: ', constId.value);

            if (!constId.value && constId.value > 0) {
                toast.warn('No se encontró registro de construcción PCPA. No se puede cargar ni guardar indicadores.', { autoClose: 4000 });
                isLoading.value = false;
                isFormDisabled.value = true;
                return;
            }
            console.log('  constId.value : ', constId.value);

            // 2. Cargar datos en paralelo
            await Promise.all([
                findUnidadesEducativasPorDirector(),
                // findMiembrosComisionConstruccion(),
                loadIndicadorTipos(),
                findAccionesEjecucion(form.value.codSie),
            ]);

            // 3. Cargar indicadores guardados (depende de loadIndicadorTipos)
            await findIndicadoresEjecucion(form.value.codSie);

            // 4. Ajustar estado de la UI 
            if (idUE.value) {
                // Si el registro existe,  mantenemos bloqueado
            } else {
                // Si es un registro nuevo, se mantiene bloqueado
                // hasta que el usuario haga clic en "Ingresar nuevo registro"           
            }
        } catch (error) {
            console.error("loadInitialData Error al cargar datos iniciales:", error);
            toast.error('loadInitialData Error al cargar datos iniciales.', { autoClose: 3000 });
        } finally {
            isLoading.value = false;
        }
    } else {
        isLoading.value = false;
        toast.error('Usuario no válido o sin SIE asignado.', { autoClose: 3000 });
    }
};

const loadIndicadorTipos = async () => {
    try {
        const res = await ConvivenciaPacifica.getIndicadorTipo();
        if (res.status === 200) {
            indicadores.value = res.data;
        } else {
            toast.error('Indicadores no encontrados', { autoClose: 3000 });
        }
    } catch (error) {
        console.error("Error al cargar indicadores:", error);
        toast.error('Error al cargar indicadores.', { autoClose: 3000 });
    }
};

const findAccionesEjecucion = async (codSie) => {
    try {
        const res = await ConvivenciaPacifica.findAccionesEjecucion(codSie);
        if (res.data && res.data.length > 0) {

            if (!registroExiste.value) {
                registroExiste.value = true;
                isFormDisabled.value = true;
            }

            const data = res.data[0];
            form.value.accionInicial = data.cantidad_acciones_inicial;
            form.value.accionEjecutada = data.cantidad_acciones_final;
            form.value.id_accciones_ejecucion = data.id_accciones_ejecucion;
            form.value.id_pcpa_construccion = data.id_pcpa_construccion;
            form.value.accionEjecutadaEstado = data.estado;
        }

    } catch (error) {
        console.error("Error en findAccionesEjecucion:", error);
        toast.error('Error al buscar acciones de ejecución.', { autoClose: 3000 });
    }
};

const findIndicadoresEjecucion = async (codSie: string) => {
    try {
        const res = await ConvivenciaPacifica.findIndicadoresEjecucion(codSie);
        if (res.data) {
            console.info("res en findIndicadoresEjecucion:", res.data);
            populateFormFromData(res.data, TIPO_MAP_INDICADORES, INDICADORES_FIELDS);
            // existeMiembro.value=true;
        }
    } catch (error) {
        console.error("Error en findIndicadoresEjecucion:", error);
        toast.error('Error al buscar indicadores de ejecución.', { autoClose: 3000 });
    }
};

const findUnidadesEducativasPorDirector = async () => {
    console.log("form.value.codSie:", form.value.codSie);
    const dataAuth = { username: localStorage.getItem('username'), password: localStorage.getItem('password') };

    if (String(form.value.codSie).length !== 8) {
        institucionEducativa.value = null;
        find.value = false;
        // Limpiar campos del form
        Object.assign(form.value, {
            departamentoId: null, departamentoNombre: '', municipioId: null,
            municipioNombre: '', unidadEducativa: '', nivel: '',
            modalidad: '', director: ''
        });
        console.warn("findUnidadesEducativasPorDirector -> SIE no válido.");
        return;
    }

    try {
        const res = await Auth.listUnidadesEducativasPorDirector(dataAuth);
        const data = res?.data.data.find((ue: any) => ue.codigo_sie === Number(localStorage.getItem('codigo_sie')));

        if (data) {
            Object.assign(form.value, {
                departamentoId: data.departamento_codigo,
                departamentoNombre: data.departamento,
                municipioNombre: data.distrito,
                unidadEducativa: data.nombre_unidad_educativa,
                nivel: data.nivel,
                modalidad: data.dependencia,
                director: `${data.nombre_director} ${data.ap_paterno_director} ${data.ap_materno_director}`
            });
            find.value = true;
            institucionEducativa.value = data;
        } else {
            console.warn("No se encontró ninguna institución educativa para el SIE:", form.value.codSie);
            find.value = false;
            institucionEducativa.value = null;
        }
    } catch (error) {
        console.error("Error en findUnidadesEducativasPorDirector:", error);
        toast.error('Error al buscar la unidad educativa.', { autoClose: 3000 });
    }
};




const populateFormFromData = (
    items: any[],
    tipoMap: Record<string, string>,
    fieldNames: { pk: string, type: string, value: string, date: string }
) => {

    if (!items || items.length === 0) {
        return;
    }

    if (!registroExiste.value) {
        registroExiste.value = true;
        isFormDisabled.value = true;
    }

    if (!form.value.indicadoresIds) {
        form.value.indicadoresIds = {};
    }

    items.forEach((item: any) => {
        const formKey = tipoMap[item[fieldNames.value]];

        if (formKey) {
            // 2. Guardar el ID (PK) de la fila
            form.value.indicadoresIds[formKey] = item[fieldNames.pk];

            // 3. Obtener el valor guardado
            const savedValue = item[fieldNames.type];

            if (formKey.startsWith('Indicador')) {
                // Es un v-select: Buscar el OBJETO que coincida
                // `savedValue` es el ID (e.g., 1)
                // `indicadores` es la lista de objetos (e.g., [{ id: 1, ... }])
                const matchingIndicator = (indicadores.value || []).find(
                    (ind: IndicadorItem) => ind.id === savedValue
                );

                // Asignar el objeto completo al formulario para el v-select
                (form.value as any)[formKey] = matchingIndicator || null;
                 existeMiembro.value=true;
            } else {
                // Es un text-field (aunque este helper solo se usa para indicadores)
                (form.value as any)[formKey] = savedValue;
            }
        }

        // 4. Establecer la fecha
        const dateValue = item[fieldNames.date];
        if (!form.value.fecha && dateValue) {
            form.value.fecha = formatFecha(dateValue);
        }
    });
};

// ===== GUARDADO DE DATOS =====
const save = async () => {
    console.log(`Iniciando guardado (Existe: ${registroExiste.value})`);
    if (!validateForm()) {
        dialog.value = false;
        toast.info('Debe ingresar los datos requeridos', { autoClose: 3000 });
        return;
    }

    isLoading.value = true;
    isFormDisabled.value = true;

    try {
        if (!constId.value) {
            throw new Error('No se pudo encontrar el ID de construcción para la UE.');
        }

        const fechaISO = parseDate(form.value.fecha);
        if (!fechaISO) {
            throw new Error('La fecha no es válida.');
        }

        // 1. Obtener TODOS los datos del formulario
        const allActivities = getDatosFormulario();
        // 2. Filtrar las listas
        const indicadores = allActivities.filter(a => a.key.startsWith('Indicador'));
        const acciones = allActivities.filter(a => a.key.startsWith('accion'));

        // 3. Ejecutar ambas sincronizaciones en paralelo
        await Promise.all([
            syncIndicadores(indicadores, constId.value, fechaISO),
            syncAccionesEjecucion(acciones, constId.value, username.value)
        ]);

        toast.success('Registros guardados correctamente', { autoClose: 3000 });
        dialog.value = false;
        dialogSave.value = true;
        registroExiste.value = true;

    } catch (error: any) {
        console.error("Error al guardar:", error);
        toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`, { autoClose: 3000 });
        isFormDisabled.value = false; // Permite reintentar
    } finally {
        isLoading.value = false;
    }
};

const syncIndicadores = async (indicadores: any[], constId: number, fechaISO: string) => {
    const promises: Promise<any>[] = [];

    for (const ind of indicadores) {
        // `ind.value` es el objeto IndicadorItem del v-select
        if (!ind.value || typeof ind.value !== 'object') continue;

        const descValue = ind.value.cod_indicadores;

        const payload: any = {
            id_pcpa_indicadores_tipo: ind.value.id,
            id_pcpa_construccion: constId,
            cod_indicadores: descValue,
            desc_indicadores: ind.tipoId,
            fec_ejecucion: fechaISO,
        };

        if (ind.id) {
            // Actualizar (UPDATE)
            payload.estado = 'MODIFICADO';
            payload.usu_mod = username.value;
            promises.push(ConvivenciaPacifica.updateSeguimiento(ind.id, payload));
        } else {
            // Crear (INSERT)
            payload.estado = 'ACTIVO';
            payload.usu_cre = username.value;
            promises.push(ConvivenciaPacifica.createSeguimiento(payload));
        }
    }
    return Promise.all(promises);
};

const syncAccionesEjecucion = async (acciones: any[], constId: number, username: string | null) => {

    if (acciones.length === 0) {
        return Promise.resolve();
    }

    const payload: any = {
        id_pcpa_construccion: constId,
    };
    let rowId: number | null = null;

    for (const accion of acciones) {
        if (accion.key === 'accionInicial') {
            payload.cantidad_acciones_inicial = accion.value;
        } else if (accion.key === 'accionEjecutada') {
            payload.cantidad_acciones_final = accion.value;
        }

        if (accion.id) {
            rowId = accion.id;
        }
    }

    if (rowId) {
        // Actualizar (UPDATE)
        payload.estado = 'MODIFICADO';
        payload.usu_mod = username;
        payload.fec_mod = new Date();
        return ConvivenciaPacifica.updateAccionesEjecucion(rowId, payload);
    } else {
        // Crear (INSERT)
        payload.estado = 'ACTIVO';
        payload.usu_cre = username;
        payload.fec_cre = new Date();
        return ConvivenciaPacifica.createAccionesEjecucion(payload);
    }
};

const getDatosFormulario = () => {
    const activities = [
        { tipoId: 100, key: 'accionInicial', value: form.value.accionInicial, id: form.value.id_accciones_ejecucion },
        { tipoId: 101, key: 'accionEjecutada', value: form.value.accionEjecutada, id: form.value.id_accciones_ejecucion },
        { tipoId: TIPO_IND_1, key: 'Indicador1', value: form.value.Indicador1, id: form.value.indicadoresIds['Indicador1'] },
        { tipoId: TIPO_IND_2, key: 'Indicador2', value: form.value.Indicador2, id: form.value.indicadoresIds['Indicador2'] },
        { tipoId: TIPO_IND_3, key: 'Indicador3', value: form.value.Indicador3, id: form.value.indicadoresIds['Indicador3'] },
        { tipoId: TIPO_IND_4, key: 'Indicador4', value: form.value.Indicador4, id: form.value.indicadoresIds['Indicador4'] },
        { tipoId: TIPO_IND_5, key: 'Indicador5', value: form.value.Indicador5, id: form.value.indicadoresIds['Indicador5'] },
    ];

    // Filtra solo los que tienen un valor
    return activities.filter(act => act.value !== null && act.value !== undefined && act.value !== '');
};

// ===== VALIDACIÓN Y MANEJO DE UI =====
const validateForm = (): boolean => {
    validationErrors.value = {};
    if (!form.value.accionInicial) validationErrors.value['accionInicial'] = true;
    if (!form.value.accionEjecutada) validationErrors.value['accionEjecutada'] = true;

    if (!form.value.Indicador1 && !form.value.Indicador2 && !form.value.Indicador3 && !form.value.Indicador4 && !form.value.Indicador5) {
        validationErrors.value['Indicador'] = true;
    }
    if (!form.value.fecha || form.value.fecha.length !== 10) validationErrors.value['fecha'] = true;

    Object.keys(validationErrors.value).forEach(key => {
        if (validationErrors.value[key] === true) {
            console.log(`Campo ${key} sin dato ingresado : vacio= `, validationErrors.value[key]);
            toast.error(`Campo ${key} sin dato ingresado`, {
                autoClose: 3500, position: toast.POSITION.TOP_RIGHT,
            });
        }
    });

    return Object.keys(validationErrors.value).length === 0;
};

const iniciarNuevoRegistro = () => {
    console.log('Ingresar nuevo registro clickeado.');
    isFormDisabled.value = false;
    isFormDisabledFromNew.value = false;
};

const modificarRegistro = () => {
    console.log('modificar registro .');
    dialogSave.value = false;
    isFormDisabled.value = false;
};


const onDateInput1 = (event: Event) => {
    const target = event.target as HTMLInputElement;
    form.value.fecha = onDateInput(target.value.replace(/\D/g, ''));
};


const recargarPagina = () => {
    console.log('recargarPagina .');
    isFormDisabled.value = false;
    window.location.href = '/convivencia/pacifica/seguimiento';
};

const xxxreset = () => {
    // Preserva los datos de la UE
    const sie = form.value.codSie;
    const unidadEducativa = form.value.unidadEducativa;
    const director = form.value.director;

    // Resetea el formulario
    form.value = {
        ...getDefaultFormState(),
        // Restaura los datos de la UE
        sie,
        unidadEducativa,
        director,
    };

    dialogSave.value = false;
};
</script>

<template>
    <v-row>
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Seguimiento y evaluación del PCPA</v-card-title>
                        <div class="d-flex align-center">
                            <v-progress-circular v-if="isLoading" indeterminate color="primary" size="24" class="mr-4"></v-progress-circular>

                            <v-btn v-if="!existeMiembro && !isLoading" color="primary" class="ml-2" @click="iniciarNuevoRegistro"  flat>
                                Ingresar nuevo registro
                            </v-btn>
                            <div class="mt-2 text-caption">__ existeMiembro: {{ existeMiembro }}</div>
                            <v-btn v-if="registroExiste && existeMiembro && !isLoading" color="info" class="ml-2" @click="modificarRegistro"      flat>
                                Modificar registro
                            </v-btn>
                            <div class="mt-2 text-caption">__isFormDisabled: {{ isFormDisabled }}</div>
                        </div>
                    </div>
                    <v-form v-model="valid" class="">
                        <v-container>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100"></span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.sie" :rules="sieRules" :counter="8" label="SIE" required hide-details
                                        :readonly="true"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="8">
                                    <v-text-field v-model="form.unidadEducativa" :counter="10" label="Unidad Educativa" hide-details
                                        required :readonly="true"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100">Seguimiento</span>
                                    </div>
                                </v-col>


                                <v-col cols="12" md="8">
                                    Indique cuantas acciones estaban inicialmente planificadas para el año en curso
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.accionInicial" :counter="10" label="Cantidad" hide-details type="number"
                                        :disabled="isFormDisabled"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="8">
                                    Indique cuantas acciones ejecutó hasta fin de año en curso
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.accionEjecutada" :counter="10" label="Cantidad" hide-details type="number"
                                        :disabled="isFormDisabled"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100">Cumplimiento de indicadores</span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="3">
                                    1. Infraestructura amigable y segura
                                </v-col>

                                <v-col cols="12" md="9">
                                    <v-select v-model="form.Indicador1" :items="indicadores" item-title="desc_indicadores"
                                        item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                                </v-col>

                                <v-col cols="12" md="3">
                                    2. Convivencia pacífica y aplicación de protocolos
                                </v-col>

                                <v-col cols="12" md="9">
                                    <v-select v-model="form.Indicador2" :items="indicadores" item-title="desc_indicadores"
                                        item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                                </v-col>

                                <v-col cols="12" md="3">
                                    3. Formación de la comunidad educativa en convivencia pacífica
                                </v-col>

                                <v-col cols="12" md="9">
                                    <v-select v-model="form.Indicador3" :items="indicadores" item-title="desc_indicadores"
                                        item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                                </v-col>
                                <v-col cols="12" md="3">
                                    4. Participación de niñas, niños y adolescentes
                                </v-col>

                                <v-col cols="12" md="9">
                                    <v-select v-model="form.Indicador4" :items="indicadores" item-title="desc_indicadores"
                                        item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                                </v-col>
                                <v-col cols="12" md="3">
                                    5. Articulación de la unidad educativa con servicios y la comunidad
                                </v-col>

                                <v-col cols="12" md="9">
                                    <v-select v-model="form.Indicador5" :items="indicadores" item-title="desc_indicadores"
                                        item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                                </v-col>
                                <v-col cols="12" md="3">
                                    Fecha Ejecucion
                                </v-col>

                                <v-col cols="12" md="9">
                                    <v-text-field v-model="form.fecha" label="DD/MM/AAAA" @input="onDateInput1" placeholder="DD/MM/AAAA"
                                        hide-details required :disabled="isFormDisabled"></v-text-field>
                                </v-col>

                                <v-col cols="12" md="12">
                                    <v-dialog v-model="dialog" persistent width="auto">
                                        <template v-slot:activator="{ props }">
                                            <v-btn size="large" rounded="pill" color="primary" class="rounded-pill" block type="button"
                                                flat v-bind="props" :disabled="isFormDisabled">Registrar</v-btn>
                                        </template>
                                        <v-card>
                                            <v-card-title class="text-h5">
                                                Confirmar
                                            </v-card-title>
                                            <v-card-text>¿ Está seguro de guardar el registro ?</v-card-text>
                                            <v-card-actions>
                                                <v-spacer></v-spacer>
                                                <v-btn color="green-darken-1" variant="text" @click="dialog = false"> Cancelar
                                                </v-btn>
                                                <v-btn color="green-darken-1" variant="text" @click="save"> Aceptar </v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </v-dialog>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-form>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>

    <v-dialog v-model="dialogSave" persistent width="auto">
        <v-card>
            <v-card-title class="text-h5">Mensaje</v-card-title>
            <v-card-text>
                Registro guardado correctamente .<br>
                ¿Desea modificar el registro actual o salir del formulario?
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-lighten-2" variant="text" @click="recargarPagina">MODIFICAR REGISTRO</v-btn>
                <v-btn color="green-darken-1" variant="text"
                    @click="router.push('/convivencia/pacifica')">SALIR</v-btn>

            </v-card-actions>
        </v-card>
    </v-dialog>
</template>