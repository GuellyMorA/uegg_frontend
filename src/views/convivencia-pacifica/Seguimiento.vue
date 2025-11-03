<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import Auth from '@/services/Auth';

// --- Tipos y Constantes ---

/**
 * Define la estructura de un item en el v-select de indicadores.
 * Basado en el uso en `syncIndicadores` // [cite: 100, 101] y `v-select`// [cite: 174].
 */
interface IndicadorItem {
    id: number;
    desc_indicadores: string;
    cod_indicadores: string;
}

/**
 * Define la estructura completa del estado del formulario.
 */
interface FormState {
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
    indicadoresIds: Record<string, number | null>; // Almacena IDs de fila para UPDATEs 

    // Propiedades pobladas por `findUnidadesEducativasPorDirector` // [cite: 33-34]
    departamentoId: number | null;
    departamentoNombre: string;
    municipioNombre: string;
    nivel: string;
    modalidad: string;
    director: string;

    // Propiedades pobladas por `findAccionesEjecucion` // [cite: 48]
    id_accciones_ejecucion: number | null;
    id_pcpa_construccion: number | null;
    accionEjecutadaEstado: string | null;
}

// Constantes para los tipos de indicadores (evita "magic strings")
// 
const TIPO_IND_1 = '1. Infraestructura amigable y segura';
const TIPO_IND_2 = '2. Convivencia pacífica y aplicación de protocolos';
const TIPO_IND_3 = '3. Formación de la comunidad educativa en convivencia pacífica';
const TIPO_IND_4 = '4. Participación de niñas, niños y adolescentes';
const TIPO_IND_5 = '5. Articulación de la unidad educativa con servicios y la comunidad';

// Mapa de tipos específico para INDICADORES // [cite: 56]
const TIPO_MAP_INDICADORES: Record<string, string> = {
    [TIPO_IND_1]: 'Indicador1',
    [TIPO_IND_2]: 'Indicador2',
    [TIPO_IND_3]: 'Indicador3',
    [TIPO_IND_4]: 'Indicador4',
    [TIPO_IND_5]: 'Indicador5',
};

// Nombres de los campos devueltos por 'findIndicadoresEjecucion' // [cite: 62]
const INDICADORES_FIELDS = {
    pk: 'id_indicadores_ejecutadas',
    type: 'id_pcpa_indicadores_tipo', // El tipo (e.g., "1. Infra...")
    value: 'desc_indicadores_ejecutadas', // El valor (e.g., "Cumplido" o su ID)
    date: 'fec_ejecucion'
};

/**
 * Estado inicial por defecto para el formulario.
 */
const getDefaultFormState = (): FormState => ({
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
    // Props de UE
    departamentoId: null,
    departamentoNombre: '',
    municipioNombre: '',
    nivel: '',
    modalidad: '',
    director: '',
    // Props de Acciones
    id_accciones_ejecucion: null,
    id_pcpa_construccion: null,
    accionEjecutadaEstado: null
});


// --- Estado Reactivo ---

const router = useRouter();
const valid = ref(false);
const dialog = ref(false);
const dialogSave = ref(false);
const validationErrors = ref<Record<string, boolean>>({});
const find = ref(false);
const isLoading = ref(true);

// Refs tipados
const indicadores = ref<IndicadorItem[]>([]);
const institucionEducativa = ref<any>(null); // `any` si la estructura no es crítica
const constId = ref<number | null>(null);

// Estado del formulario
const form = ref<FormState>(getDefaultFormState());

// Estado de la UI
const registroExiste = ref(localStorage.getItem('existeEnBD') === 'true'); // [cite: 6]
const isFormDisabled = ref(true); //  Controla si los campos están habilitados

// Variables no reactivas
let username: string = '';
const dataUE = JSON.parse(localStorage.getItem('dataUE') || '[]'); // // [cite: 7] '[]' es más seguro que '[{}]'
const idUE = dataUE[0]?.id || null; // // [cite: 7]

// Reglas de validación
const sieRules = [
    (value: any) => !!value || 'El SIE es requerido', // [cite: 10, 11]
    (value: any) => (String(value)?.length === 8) || 'El código SIE requiere 8 dígitos.', // [cite: 11]
];


// --- Ciclo de Vida ---

onMounted(async () => {
    await loadInitialData();
});

/**
 * Orquesta la carga de datos iniciales al montar el componente.
 */
const loadInitialData = async () => {
    isLoading.value = true;
    username = localStorage.getItem("username") || ""; 
    let user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user && user.codigo_sie) {
        form.value.sie = user.codigo_sie;
        
        try {
            // 1. Encontrar IDs críticos (idUE y idConst)
            await findUeByCiAndCodSie(); // Establece `idUE` internamente
            
            constId.value = await findConstByCiAndUe(); // // [cite: 13]
            
            if (!constId.value) { // // [cite: 13]
                toast.warn('No se encontró registro de construcción PCPA. No se puede cargar ni guardar indicadores.', { autoClose: 4000 });
                isLoading.value = false;
                isFormDisabled.value = true; // // [cite: 14]
                return;
            }
       
            // 2. Cargar datos en paralelo
            await Promise.all([
                findUnidadesEducativasPorDirector(), // Puebla form.unidadEducativa // [cite: 14]
                loadIndicadorTipos(), // Cargar los v-select // [cite: 15]
                findAccionesEjecucion(form.value.sie), // Cargar acciones // [cite: 15]
            ]);

            // 3. Cargar indicadores guardados (depende de loadIndicadorTipos)
            await findIndicadoresEjecucion(form.value.sie); // [cite: 16]

        } catch (error) {
            console.error("Error al cargar datos iniciales:", error); // [cite: 17]
            toast.error('Error al cargar datos iniciales.', { autoClose: 3000 }); // [cite: 18]
        } finally {
            isLoading.value = false; // [cite: 18]
            // El estado de 'isFormDisabled' y 'registroExiste'
            // es manejado por las funciones de carga (findAccionesEjecucion, etc.)
            // // [cite: 19, 20]
        }
    } else {
        isLoading.value = false; // [cite: 21]
        toast.error('Usuario no válido o sin SIE asignado.', { autoClose: 3000 }); // [cite: 22]
    }
};


// --- Carga de Datos (API) ---

/**
 * Carga los tipos de indicadores para los v-select.
 */
const loadIndicadorTipos = async () => {
    try {
        const res = await ConvivenciaPacifica.getIndicadorTipo(); // [cite: 38]
        if (res.status === 200) {
            indicadores.value = res.data; // [cite: 39]
        } else {
            toast.error('Indicadores no encontrados', { autoClose: 3000 }); // [cite: 40]
        }
    } catch (error) {
        console.error("Error al cargar indicadores:", error); // [cite: 41]
        toast.error('Error al cargar indicadores.', { autoClose: 3000 }); // [cite: 42]
    }
};

/**
 * Busca las 'Acciones' (Inicial y Ejecutada) y las puebla en el formulario.
 * // [cite: 43]
 */
const findAccionesEjecucion = async (codSie: number | null) => {
    try {
        const res = await ConvivenciaPacifica.findAccionesEjecucion(codSie); // [cite: 44]
        if (res.data && res.data.length > 0) { // [cite: 45]
            
            if (!registroExiste.value) {
                registroExiste.value = true;
                isFormDisabled.value = true; // [cite: 46]
            }

            const data = res.data[0];
            form.value.accionInicial = data.cantidad_acciones_inicial; // [cite: 47]
            form.value.accionEjecutada = data.cantidad_acciones_final; // [cite: 48]
            form.value.id_accciones_ejecucion = data.id_accciones_ejecucion; // [cite: 48]
            form.value.id_pcpa_construccion = data.id_pcpa_construccion; // [cite: 48]
            form.value.accionEjecutadaEstado = data.estado; // [cite: 48]
        }
        
    } catch (error) {
        console.error("Error en findAccionesEjecucion:", error); // [cite: 52]
        toast.error('Error al buscar acciones de ejecución.', { autoClose: 3000 }); // [cite: 53]
    }
};

/**
 * Busca los 'Indicadores' (1 al 5) y los puebla en el formulario.
 * // [cite: 55]
 */
const findIndicadoresEjecucion = async (codSie: number | null) => {
    try {
        const res = await ConvivenciaPacifica.findIndicadoresEjecucion(codSie); // [cite: 63]
        if (res.data) { // [cite: 64]
            console.info("res en findIndicadoresEjecucion:", res.data);
            populateFormFromData(res.data, TIPO_MAP_INDICADORES, INDICADORES_FIELDS); // [cite: 65]
        }
    } catch (error) {
        console.error("Error en findIndicadoresEjecucion:", error); // [cite: 66]
        toast.error('Error al buscar indicadores de ejecución.', { autoClose: 3000 }); // [cite: 67]
    }
};

/**
 * Busca los datos de la UE y los asigna al formulario.
 */
const findUnidadesEducativasPorDirector = async () => {
    console.log("form.value.sie:", form.value.sie); // [cite: 29]
    const dataAuth = { username: localStorage.getItem('username'), password: localStorage.getItem('password') }; // [cite: 30]

    if (String(form.value.sie).length !== 8) {
        institucionEducativa.value = null;
        find.value = false; // [cite: 31]
        // Limpiar campos del form
        Object.assign(form.value, {
            departamentoId: null, departamentoNombre: '', municipioId: null,
            municipioNombre: '', unidadEducativa: '', nivel: '',
            modalidad: '', director: ''
        }); // [cite: 31]
        console.warn("SIE no válido."); // [cite: 32]
        return;
    }

    try {
        const res = await Auth.listUnidadesEducativasPorDirector(dataAuth); // [cite: 32]
        const data = res?.data.data.find((ue: any) => ue.codigo_sie === Number(localStorage.getItem('codigo_sie'))); // [cite: 33]

        if (data) {
            Object.assign(form.value, {
                departamentoId: data.departamento_codigo,
                departamentoNombre: data.departamento,
                municipioNombre: data.distrito,
                unidadEducativa: data.nombre_unidad_educativa,
                nivel: data.nivel, // [cite: 34]
                modalidad: data.dependencia, // [cite: 34]
                director: `${data.nombre_director} ${data.ap_paterno_director} ${data.ap_materno_director}` // [cite: 34]
            });
            find.value = true; // [cite: 35]
            institucionEducativa.value = data; // [cite: 35]
        } else {
            console.warn("No se encontró ninguna institución educativa para el SIE:", form.value.sie); // [cite: 35]
            find.value = false; // [cite: 36]
            institucionEducativa.value = null; // [cite: 36]
        }
    } catch (error) {
        console.error("Error en findUnidadesEducativasPorDirector:", error); // [cite: 36]
        toast.error('Error al buscar la unidad educativa.', { autoClose: 3000 }); // [cite: 37]
    }
};

/**
 * Busca el ID de la UE.
 */
const findUeByCiAndCodSie = async (): Promise<boolean> => {
    try {
        const formData = {
            codSie: localStorage.getItem('codigo_sie') || '', // [cite: 140]
            username: localStorage.getItem('username') || '' // [cite: 141]
        };
        const res = await ConvivenciaPacifica.findUeByCiAndCodSie(formData); // [cite: 142]
        if (res.status === 200 && res.data && res.data.length >= 1) { // [cite: 143]
            localStorage.setItem('existeEnBD', 'true'); // [cite: 143]
            localStorage.setItem('dataUE', JSON.stringify(res.data)); // [cite: 144]
            return true;
        } else {
            localStorage.setItem('existeEnBD', 'false'); // [cite: 144]
            localStorage.setItem('dataUE', JSON.stringify([{ id: 0 }])); // [cite: 145]
            return false;
        }
    } catch (error) {
        console.error('Error en findUeByCiAndCodSie:', error); // [cite: 145]
        toast.error('Error de conexión con el servidor.', { autoClose: 3000 }); // [cite: 146]
        return false;
    }
};

/**
 * Busca el ID de Construcción.
 */
const findConstByCiAndUe = async (): Promise<number | null> => {
    const formData = {
        idUE: idUE,
        username: username
    }; // [cite: 147]
    try {
        const res = await ConvivenciaPacifica.findConstByCiAndUe(formData); // [cite: 148]
        if (res.status === 200 && res.data && res.data.length > 0) { // [cite: 149]
            const data = res.data;
            if (data.length === 1) { // [cite: 150]
                localStorage.setItem('idConst', data[0].id);
                return data[0].id; // [cite: 151]
            } else {
                localStorage.setItem('idConst', '0'); // [cite: 151]
                toast.warn('Se encontraron múltiples o ninguna construcción para esta UE.', { autoClose: 3500 }); // [cite: 152]
                return null;
            }
        } else {
            toast.error('No se encontró una UE para el Director', { autoClose: 3500 }); // [cite: 153]
            return null; // [cite: 154]
        }
    } catch (error) {
        console.error("Error en findConstByCiAndUe:", error); // [cite: 154]
        toast.error('Error de conexión al buscar ID de construcción.', { autoClose: 3500 }); // [cite: 155]
        return null;
    }
};

/**
 * Helper genérico para poblar el formulario desde un array de datos de la API.
 * // [cite: 68-71]
 */
const populateFormFromData = (
    items: any[],
    tipoMap: Record<string, string>,
    fieldNames: { pk: string, type: string, value: string, date: string }
) => {
    
    if (!items || items.length === 0) {
        return; // // [cite: 72]
    }

    if (!registroExiste.value) {
        registroExiste.value = true;
        isFormDisabled.value = true; // [cite: 73]
    }

    if (!form.value.indicadoresIds) {
        form.value.indicadoresIds = {}; // [cite: 73]
    }

    items.forEach((item: any) => {
        // [REFACTOR] CORRECCIÓN DE BUG:
        // Las variables estaban intercambiadas.
        // `fieldNames.type` (e.g., "1. Infra...") es la clave para `tipoMap`.
        // `fieldNames.value` (e.g., el ID 1) es el valor guardado.
        
        const formKey = tipoMap[item[fieldNames.value]]; //type [cite: 74] (Original era fieldNames.value)
        
        if (formKey) {
            // 2. Guardar el ID (PK) de la fila // [cite: 74]
            form.value.indicadoresIds[formKey] = item[fieldNames.pk];
            
            // 3. Obtener el valor guardado // [cite: 75]
            const savedValue = item[fieldNames.type]; // value   (Original era fieldNames.type)
            
            if (formKey.startsWith('Indicador')) {
                // Es un v-select: Buscar el OBJETO que coincida // [cite: 75]
                // `savedValue` es el ID (e.g., 1)
                // `indicadores` es la lista de objetos (e.g., [{ id: 1, ... }])
                const matchingIndicator = (indicadores.value || []).find(
                    (ind: IndicadorItem) => ind.id === savedValue
                ); // // [cite: 76-77]
                
                // Asignar el objeto completo al formulario para el v-select // [cite: 174]
                (form.value as any)[formKey] = matchingIndicator || null; // [cite: 77, 78]

            } else {
                // Es un text-field (aunque este helper solo se usa para indicadores)
                (form.value as any)[formKey] = savedValue; // [cite: 78]
            }
        }
        
        // 4. Establecer la fecha // [cite: 79]
        const dateValue = item[fieldNames.date];
        if (!form.value.fecha && dateValue) { // [cite: 80]
            form.value.fecha = formatFecha(dateValue); // [cite: 80]
        }
    });
};


// --- Lógica de Guardado (API) ---

/**
 * Función principal de guardado.
 */
const save = async () => {
    console.log(`Iniciando guardado (Existe: ${registroExiste.value})`); // [cite: 118]
    if (!validateForm()) { // [cite: 119]
        dialog.value = false;
        toast.info('Debe ingresar los datos requeridos', { autoClose: 3000 }); // [cite: 120]
        return;
    }

    isLoading.value = true;
    isFormDisabled.value = true; // [cite: 120]

    try {
        if (!constId.value) { // [cite: 121]
            throw new Error('No se pudo encontrar el ID de construcción para la UE.');
        }
        
        const fechaISO = parseDate(form.value.fecha); // [cite: 122]
        if (!fechaISO) { // [cite: 123]
             throw new Error('La fecha no es válida.');
        }

        // 1. Obtener TODOS los datos del formulario
        const allActivities = getDatosFormulario(); // [cite: 124]
        // 2. Filtrar las listas
        const indicadores = allActivities.filter(a => a.key.startsWith('Indicador')); // [cite: 125]
        const acciones = allActivities.filter(a => a.key.startsWith('accion')); // [cite: 126]

        // 3. Ejecutar ambas sincronizaciones en paralelo
        await Promise.all([
            syncIndicadores(indicadores, constId.value, fechaISO), // [cite: 126]
            syncAccionesEjecucion(acciones, constId.value, username) // [cite: 126]
        ]);
        
        toast.success('Registros guardados correctamente', { autoClose: 3000 }); // [cite: 127]
        dialog.value = false;
        dialogSave.value = true;
        registroExiste.value = true; // [cite: 127]
        
        // [Opcional] Recargar datos para obtener nuevos IDs de fila
        // await findAccionesEjecucion(form.value.sie); // [cite: 128]
        // await findIndicadoresEjecucion(form.value.sie); // [cite: 129]

    } catch (error: any) {
        console.error("Error al guardar:", error); // [cite: 129]
        toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`, { autoClose: 3000 }); // [cite: 130]
        isFormDisabled.value = false; // Permite reintentar // [cite: 130]
    } finally {
        isLoading.value = false; // [cite: 131]
    }
};

/**
 * Sincroniza (Crea/Actualiza) las filas de INDICADORES (1-5).
 * // [cite: 97, 98]
 */
const syncIndicadores = async (indicadores: any[], constId: number, fechaISO: string) => {
    const promises: Promise<any>[] = []; // [cite: 98]
    
    for (const ind of indicadores) { // [cite: 99]
        // `ind.value` es el objeto IndicadorItem del v-select
        if (!ind.value || typeof ind.value !== 'object') continue; // [cite: 102]

        const descValue = ind.value.cod_indicadores; // // [cite: 100]
        
        const payload: any = {
            id_pcpa_indicadores_tipo: ind.value.id, // 
            id_pcpa_construccion: constId, 
            cod_indicadores: descValue, 
            desc_indicadores: ind.tipoId, // El label (e.g., "1. Infra...") 
            fec_ejecucion: fechaISO, 
        };

        if (ind.id) { // ind.id es el ID de la *fila* (ej. form.value.indicadoresIds['Indicador1'])
            // Actualizar (UPDATE) // [cite: 102]
            payload.estado = 'MODIFICADO';
            payload.usu_mod = username; // [cite: 103]
            promises.push(ConvivenciaPacifica.updateSeguimiento(ind.id, payload)); // [cite: 103]
        } else {
            // Crear (INSERT) // [cite: 104]
            payload.estado = 'ACTIVO';
            payload.usu_cre = username; // [cite: 105]
            promises.push(ConvivenciaPacifica.createSeguimiento(payload)); // [cite: 105]
        }
    }
    return Promise.all(promises); // [cite: 106]
};

/**
 * Sincroniza (Crea/Actualiza) la fila ÚNICA de Acciones.
 * // [cite: 107, 108]
 */
const syncAccionesEjecucion = async (acciones: any[], constId: number, username: string | null) => {
    
    if (acciones.length === 0) { // [cite: 109]
        return Promise.resolve();
    }

    const payload: any = {
        id_pcpa_construccion: constId, // [cite: 110]
    };
    let rowId: number | null = null; // [cite: 111]

    for (const accion of acciones) {
        if (accion.key === 'accionInicial') {
            payload.cantidad_acciones_inicial = accion.value; // [cite: 111]
        } else if (accion.key === 'accionEjecutada') {
            payload.cantidad_acciones_final = accion.value; // [cite: 112]
        }

        if (accion.id) {
            rowId = accion.id; // [cite: 113]
        }
    }

    if (rowId) {
        // Actualizar (UPDATE) // [cite: 114]
        payload.estado = 'MODIFICADO';
        payload.usu_mod = username; // [cite: 115]
        payload.fec_mod = new Date();
        return ConvivenciaPacifica.updateAccionesEjecucion(rowId, payload); // [cite: 115]
    } else {
        // Crear (INSERT) // [cite: 116]
        payload.estado = 'ACTIVO';
        payload.usu_cre = username; // [cite: 117]
        payload.fec_cre = new Date();
        return ConvivenciaPacifica.createAccionesEjecucion(payload); // [cite: 117]
    }
};

/**
 * Prepara los datos del formulario para ser enviados.
 * // [cite: 132, 133]
 */
const getDatosFormulario = () => {
    const activities = [
        // [REFACTOR] Usar las constantes
        { tipoId: 100, key: 'accionInicial', value: form.value.accionInicial, id: form.value.id_accciones_ejecucion },
        { tipoId: 101, key: 'accionEjecutada', value: form.value.accionEjecutada, id: form.value.id_accciones_ejecucion },
        { tipoId: TIPO_IND_1, key: 'Indicador1', value: form.value.Indicador1, id: form.value.indicadoresIds['Indicador1'] }, // [cite: 134]
        { tipoId: TIPO_IND_2, key: 'Indicador2', value: form.value.Indicador2, id: form.value.indicadoresIds['Indicador2'] }, // [cite: 135]
        { tipoId: TIPO_IND_3, key: 'Indicador3', value: form.value.Indicador3, id: form.value.indicadoresIds['Indicador3'] }, // [cite: 136]
        { tipoId: TIPO_IND_4, key: 'Indicador4', value: form.value.Indicador4, id: form.value.indicadoresIds['Indicador4'] }, // [cite: 137]
        { tipoId: TIPO_IND_5, key: 'Indicador5', value: form.value.Indicador5, id: form.value.indicadoresIds['Indicador5'] }, // [cite: 138]
    ];
    
    // Filtra solo los que tienen un valor // [cite: 139]
    return activities.filter(act => act.value !== null && act.value !== undefined && act.value !== '');
};


// --- Control de UI y Formulario ---

/**
 * Habilita el formulario para un nuevo registro.
 */
const iniciarNuevoRegistro = () => {
    console.log('Ingresar nuevo registro clickeado.'); // [cite: 23]
    isFormDisabled.value = false; 
    reset(); // Limpia el formulario
    dialogSave.value = false;
    registroExiste.value = false; // [cite: 27]
};

/**
 * Habilita el formulario para modificar un registro existente.
 */
const modificarRegistro = () => {
    console.log('modificar registro .');
    isFormDisabled.value = false; // [cite: 27]
};

/**
 * Valida el formulario antes de guardar.
 */
const validateForm = (): boolean => {
    validationErrors.value = {};
    if (!form.value.accionInicial) validationErrors.value['accionInicial'] = true; // [cite: 91]
    if (!form.value.accionEjecutada) validationErrors.value['accionEjecutada'] = true; // [cite: 92]
    
    if (!form.value.Indicador1 && !form.value.Indicador2 && !form.value.Indicador3 && !form.value.Indicador4 && !form.value.Indicador5) {
        validationErrors.value['Indicador'] = true; // [cite: 92]
    }
    if (!form.value.fecha || form.value.fecha.length !== 10) validationErrors.value['fecha'] = true; // [cite: 93]
    
    return Object.keys(validationErrors.value).length === 0; // [cite: 93]
};

/**
 * Resetea el formulario a su estado inicial.
 */
const reset = () => {
    // Preserva los datos de la UE
    const sie = form.value.sie;
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
    
    dialogSave.value = false; // [cite: 96]
};

/**
 * Maneja el input de la fecha para auto-formatear con '/'.
 */
const onDateInput1 = (event: Event) => {
    const target = event.target as HTMLInputElement;
    form.value.fecha = onDateInput(target.value.replace(/\D/g, '')); // [cite: 90]
};


// --- Funciones Utilitarias ---

/**
 * Helper para formatear fecha de 'YYYY-MM-DD...' a 'DD/MM/YYYY'
 */
const formatFecha = (fecha: string): string => {
    if (!fecha) return '';
    const dateParts = fecha.split("T")[0].split("-"); // Asume YYYY-MM-DD // [cite: 82]
    if (dateParts.length === 3) {
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // Retorna DD/MM/YYYY // [cite: 83]
    }
    return '';
};

/**
 * Convierte fecha DD/MM/YYYY a ISO String
 * // [cite: 84]
 */
const parseDate = (dateString: string): string | null => {
    if (!dateString || dateString.length !== 10) return null; // [cite: 85]
    const parts = dateString.split('/');
    if (parts.length !== 3) return null; // [cite: 86]
    // parts[2] = YYYY, parts[1] = MM, parts[0] = DD
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString(); // [cite: 86]
};

/**
 * Formatea el texto del input de fecha.
 */
const onDateInput = (cleanedInput: string): string => {
    if (cleanedInput.length <= 2) {
        return cleanedInput; // [cite: 87]
    } else if (cleanedInput.length <= 4) {
        return `${cleanedInput.slice(0, 2)}/${cleanedInput.slice(2)}`; // [cite: 88]
    }
    const truncatedInput = cleanedInput.slice(0, 8); // [cite: 89]
    return `${truncatedInput.slice(0, 2)}/${truncatedInput.slice(2, 4)}/${truncatedInput.slice(4, 8)}`; // [cite: 89]
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
                            
                            <v-btn v-if="!registroExiste && !isLoading" color="primary" class="ml-2" @click="iniciarNuevoRegistro" :disabled="!isFormDisabled" flat>
                                Ingresar nuevo registro
                            </v-btn>

                            <v-btn v-if="registroExiste && !isLoading" color="info" class="ml-2" @click="modificarRegistro" :disabled="!isFormDisabled" flat>
                                Modificar registro
                            </v-btn>
                            </div>


                    </div>
                    <v-form v-model="valid" class="">
                        <v-container>
                        <v-row>
                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100"></span> </div>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.sie" :rules="sieRules" :counter="8" label="SIE" required hide-details :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.unidadEducativa" :counter="10" label="Unidad Educativa" hide-details required :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Seguimiento</span>
                                </div>
                            </v-col>


                            <v-col cols="12" md="8" >
                                Indique cuantas acciones estaban inicialmente planificadas para el año en curso
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.accionInicial" :counter="10" label="Cantidad" hide-details type="number" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                Indique cuantas acciones ejecutó hasta fin de año en curso
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.accionEjecutada" :counter="10" label="Cantidad" hide-details type="number" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Cumplimiento de indicadores</span>
                                </div>
                            </v-col>
                                    <v-col cols="12" md="3" >
                                1. Infraestructura amigable y segura
                            </v-col>

                            <v-col cols="12" md="9" >
                                <v-select v-model="form.Indicador1" :items="indicadores" item-title="desc_indicadores" item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="3" >
                                2. Convivencia pacífica y aplicación de protocolos
                            </v-col>

                            <v-col cols="12" md="9" >
                                <v-select v-model="form.Indicador2" :items="indicadores" item-title="desc_indicadores" item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="3" >
                                3. Formación de la comunidad educativa en convivencia pacífica
                            </v-col>

                            <v-col cols="12" md="9" >
                                <v-select v-model="form.Indicador3" :items="indicadores" item-title="desc_indicadores" item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>
                              <v-col cols="12" md="3" >
                                4. Participación de niñas, niños y adolescentes
                            </v-col>

                            <v-col cols="12" md="9" >
                                <v-select v-model="form.Indicador4" :items="indicadores" item-title="desc_indicadores" item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>
                             <v-col cols="12" md="3" >
                                5. Articulación de la unidad educativa con servicios y la comunidad
                            </v-col>

                            <v-col cols="12" md="9" >
                                <v-select v-model="form.Indicador5" :items="indicadores" item-title="desc_indicadores" item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>
<v-col cols="12" md="3" >
                                Fecha Ejecucion
                            </v-col>

                            <v-col cols="12" md="9" >
                                <v-text-field v-model="form.fecha" label="DD/MM/AAAA" @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12" >                                
                                <v-dialog v-model="dialog" persistent width="auto" >
                                    <template v-slot:activator="{ props }">                                
                                        <v-btn size="large" rounded="pill" color="primary" class="rounded-pill" block type="button" flat v-bind="props" :disabled="isFormDisabled">Registrar</v-btn>
                                    </template>
                                    <v-card>
                                        <v-card-title class="text-h5">
                                        Confirmar
                                        </v-card-title>
                                        <v-card-text>¿ Está seguro de guardar el registro ?</v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="green-darken-1" variant="text" @click="dialog = false"> Cancelar </v-btn>
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
                                
    <v-dialog v-model="dialogSave" persistent width="auto" >
        <v-card>
            <v-card-title class="text-h5">
            Mensaje
            </v-card-title>
            <v-card-text>¿ Nuevo registro ? (Si ya añadió el registro y quiere modificarlo escoja NO)</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green-darken-1" variant="text" @click="router.push('/convivencia/pacifica')"> NO </v-btn>
                <v-btn color="green-darken-1" variant="text" @click="reset"> SI </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

