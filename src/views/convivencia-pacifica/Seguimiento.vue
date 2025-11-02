<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import Auth from '@/services/Auth';

// --- Refs y Estado ---
const router = useRouter();
const valid = ref(false);
const dialog = ref(false);
const dialogSave = ref(false);
const validationErrors = ref<Record<string, boolean>>({});
const find = ref(false);

const indicadores = ref();

const institucionEducativa = ref();

let username= '';// localStorage.getItem("username") || ""; 
// --- Variables de Estado Mejoradas ---
const readOnlyVar = ref(localStorage.getItem('existeEnBD') === 'true');
console.log('existeEnBD-readOnlyVar:', readOnlyVar.value);

const registroExiste =  ref(readOnlyVar.value) ;
const isLoading = ref(true);

const dataUE = JSON.parse(localStorage.getItem('dataUE') || '[{}]');
const idUE = dataUE[0]?.id;
const constId  = ref();
// Control de formulario
const isFormDisabled = ref(true);
const isFormDisabledFromNew = ref(true);

const form: any = ref({
    sie: null,
    unidadEducativa: '',
    accionInicial: null,
    accionEjecutada: null,
    Indicador1: null,
    Indicador2: null,
    Indicador3: null,
    Indicador4: null, // Asumiendo que el template se corregirá
    Indicador5: null, // Asumiendo que el template se corregirá
    fecha: '',
    // Almacena los IDs de las filas de indicadores para saber si actualizar (UPDATE) o crear (INSERT)
    indicadoresIds: {} as Record<string, number | null>
});

const sieRules = [
    (value: any) => !!value || 'El SIE es requerido',
    (value: any) => (value?.length === 8) || 'El código SIE requiere 8 dígitos.',
];
// --- Funciones de Carga de Datos ---
onMounted(async () => {
    username = localStorage.getItem("username") || ""; 
    let user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user && user.codigo_sie) {
        form.value.sie = user.codigo_sie;
        
        try {
            // 1. Encontrar IDs críticos (idUE y idConst)
            await findUeByCiAndCodSie(); // Establece `idUE`
             constId.value = await findConstByCiAndUe(); // Establece `construccionId.value`
            
            if (!constId) {
                toast.warn('No se encontró registro de construcción PCPA. No se puede cargar ni guardar el indicadores.', { autoClose: 4000 });
                isLoading.value = false;
                isFormDisabled.value = true; // Deshabilitado porque no hay 'padre'
                return;
            }
       
            // 2. Cargar datos en paralelo
            await Promise.all([
            findUnidadesEducativasPorDirector(), // Puebla form.unidadEducativa
            loadIndicadorTipos(), // Cargar los v-select
            findAccionesEjecucion(form.value.sie), // Cargar acciones
           // findIndicadoresEjecucion(form.value.sie) // Cargar indicadores
            ]);

            // 3. AHORA que 'indicadores.value' está lleno,   puedes buscar los indicadores guardados de forma segura.
             await findIndicadoresEjecucion(form.value.sie);


        } catch (error) {
            console.error("Error al cargar datos iniciales:", error);
            toast.error('Error al cargar datos iniciales.', { autoClose: 3000 });
        } finally {
            isLoading.value = false;
            // El formulario permanece deshabilitado (isFormDisabled.value = true)
            // hasta que el usuario presione 'Ingresar' o 'Modificar'
            // El estado (isFormDisabled, registroExiste) 
        // ya fue manejado por 'populateFormFromData'.
        // Si no se encontró nada, 'registroExiste' seguirá 'false' 
        // y 'isFormDisabled' seguirá 'true', lo cual es correcto.
        }
    } else {
        isLoading.value = false;
        toast.error('Usuario no válido o sin SIE asignado.', { autoClose: 3000 });
    }
});
// --- Funciones de Control de Formulario ---
// --- Funciones de Control de Formulario ---
const iniciarNuevoRegistro = () => {
    console.log('Ingresar nuevo registro clickeado.');
    isFormDisabled.value = false;
    reset(); // Limpia el formulario
    ////   form.value.accionInicial = 77; // ✅ precarga al iniciar nuevo registro
     //  form.value.accionEjecutada = 88; // ✅ precarga al iniciar nuevo registro
     //  form.value.fecha ='14/01/2025'; 

    dialogSave.value = false;
    registroExiste.value = false; 
};

const modificarRegistro = () => {
    console.log('modificar registro .');
    isFormDisabled.value = false;
      //     form.value.accionInicial = 7; 
      // form.value.accionEjecutada = 8; 
      //    form.value.fecha ='14/01/2025'; 
};


const findUnidadesEducativasPorDirector = async () => {
    console.log("form.value.sie:", form.value.sie);
    const dataAuth = { username: localStorage.getItem('username'), password: localStorage.getItem('password') };

    if (String(form.value.sie).length !== 8) {
        institucionEducativa.value = null;
        find.value = false;
        // Limpiar campos del form
        Object.assign(form.value, {
            departamentoId: null, departamentoNombre: '', municipioId: null,
            municipioNombre: '', unidadEducativa: '', nivel: '',
            modalidad: '', director: ''
        });
        console.warn("SIE no válido.");
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
            console.warn("No se encontró ninguna institución educativa para el SIE:", form.value.sie);
            find.value = false;
            institucionEducativa.value = null;
        }
    } catch (error) {
        console.error("Error en findUnidadesEducativasPorDirector:", error);
        toast.error('Error al buscar la unidad educativa.', { autoClose: 3000 });
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
/**
 * Helper genérico para poblar el formulario desde un array de datos de la API.
 * Procesa los items y actualiza 'form.value', 'form.value.indicadoresIds' y 'form.value.fecha'.
 *
 * @param {any[]} items - El array de res.data (los datos de la API)
 * @param {Record<number, string>} tipoMap - El mapa de tipos (Ej: { 100: 'accionInicial' })
 * @param {object} fieldNames - Los nombres de las columnas en el JSON de la API.
 * @param {string} fieldNames.pk - El nombre de la columna Primary Key (Ej: 'id_indicadores_ejecutadas')
 * @param {string} fieldNames.type - El nombre de la columna Tipo (Ej: 'id_pcpa_indicadores_tipo')
 * @param {string} fieldNames.value - El nombre de la columna Valor (Ej: 'desc_indicadores_ejecutadas')
 * @param {string} fieldNames.date - El nombre de la columna Fecha (Ej: 'fec_ejecucion')
 */
const populateFormFromData = (    items: any[],     tipoMap: Record<number, string>, 
    fieldNames: { pk: string, type: string, value: string, date: string }
) => {
    
    if (!items || items.length === 0) {
        return; // No hay datos, no hacer nada
    }

    // Si es la primera vez que encontramos datos, marcamos que existe
    if (!registroExiste.value) {
        registroExiste.value = true;
        isFormDisabled.value = true; 
    }

    if (!form.value.indicadoresIds) {
        form.value.indicadoresIds = {};
    }

    items.forEach((item: any) => {
        // 1. Obtener la llave del formulario (Ej: 'accionInicial') usando el nombre de campo 'type'
        const formKey = tipoMap[item[fieldNames.type]];
        
        if (formKey) {
            // 2. Guardar el ID (PK) usando el nombre de campo 'pk'
            form.value.indicadoresIds[formKey] = item[fieldNames.pk];
            
            // 3. Obtener el valor guardado usando el nombre de campo 'value'
            const savedValue = item[fieldNames.value];
            
            if (formKey.startsWith('Indicador')) {
                // Es un v-select: Buscar el OBJETO que coincida
                // Asumimos que 'indicadores.value' es (ej: [{ id: 1, desc_indicadores: 'Cumplido' }])
                // Y que 'savedValue' es (ej: "Cumplido")
                const matchingIndicator = indicadores.value.find(
                    (ind: any) => ind.desc_indicadores === savedValue
                );
                form.value[formKey] = matchingIndicator || null;
            } else {
                // Es un text-field (accionInicial, accionEjecutada)
                form.value[formKey] = savedValue;
            }
        }
        
        // 4. Establecer la fecha usando el nombre de campo 'date'
        const dateValue = item[fieldNames.date];
        if (!form.value.fecha && dateValue) {
            form.value.fecha = formatFecha(dateValue);
        }
    });
};

/**
 * Busca las 'Acciones' (Inicial y Ejecutada) y las puebla en el formulario.
 * Esta función asume que la API (ConvivenciaPacifica.findAccionesEjecucion)
 * devuelve un array, y que el primer item (res.data[0]) 
 * contiene las columnas 'cantidad_acciones_inicial' y 'cantidad_acciones_final'.
 */
const findAccionesEjecucion = async (codSie: number | null) => {
    try {
        const res = await ConvivenciaPacifica.findAccionesEjecucion(codSie); 
        
        // Comprobar si hay datos y al menos un item en el array
        if (res.data && res.data.length > 0) {
            
            // Si hay datos, marcar que el registro existe
            if (!registroExiste.value) {
                registroExiste.value = true;
                isFormDisabled.value = true; 
            }

            // Tomar el primer registro del array
            const data = res.data[0]; 

            // Mapear los campos directamente al formulario
            form.value.accionInicial = data.cantidad_acciones_inicial;
            form.value.accionEjecutada = data.cantidad_acciones_final;
            form.value.id_accciones_ejecucion = data.id_accciones_ejecucion;
           form.value.id_pcpa_construccion = data.id_pcpa_construccion;
           form.value.accionEjecutadaEstado = data.estado; 
            // Inicializar 'indicadoresIds' si es la primera vez
           // if (!form.value.indicadoresIds) {
             ////   form.value.indicadoresIds = {};
           // }
            
            // Guardar el ID (PK) de esta fila. 
            // Usamos una clave 'accionesRowId' para saber que este ID 
            // pertenece a la fila que agrupa ambas acciones.
          //  form.value.indicadoresIds['accionesRowId'] = data.id_accciones_ejecucion;

            // (El JSON de ejemplo no tiene fecha, así que no se mapea)
        }
        
    } catch (error) {
        console.error("Error en findAccionesEjecucion:", error);
        toast.error('Error al buscar acciones de ejecución.', { autoClose: 3000 });
        // No seteamos 'registroExiste = false' aquí,
        // porque la otra función (findIndicadoresEjecucion) podría sí tener datos.
    }
};

/**
 * Busca los 'Indicadores' (1 al 5) y los puebla en el formulario.
 * USA la estructura de 'indicadores' (id_indicadores_ejecutadas, etc.)
 */
const findIndicadoresEjecucion = async (codSie: number | null) => {
    // Mapa de tipos específico para INDICADORES
    const TIPO_MAP_INDICADORES: { [key: number]: string } = {
        1: 'Indicador1',
        2: 'Indicador2',
        3: 'Indicador3',
        4: 'Indicador4',
        5: 'Indicador5',

    };

    // Nombres de los campos devueltos por el endpoint 'findIndicadoresEjecucion' (según tu JSON)
    const INDICADORES_FIELDS = {
        pk: 'id_indicadores_ejecutadas',
        type: 'id_pcpa_indicadores_tipo',
        value: 'desc_indicadores_ejecutadas', // <-- Este es el valor "Cumplido", "En Proceso", etc.
        date: 'fec_ejecucion'
    };

    try {
        const res = await ConvivenciaPacifica.findIndicadoresEjecucion(codSie); 
        
        if (res.data) {
                console.info("res en findIndicadoresEjecucion:", res.data);
            // Llama al helper genérico con los datos y los nombres de campos correctos
            populateFormFromData(res.data, TIPO_MAP_INDICADORES, INDICADORES_FIELDS);
        }
        
    } catch (error) {
        console.error("Error en findIndicadoresEjecucion:", error);
        toast.error('Error al buscar indicadores de ejecución.', { autoClose: 3000 });
    }
};




/**
 * Helper para formatear fecha de 'YYYY-MM-DD...' a 'DD/MM/YYYY'
 */
const formatFecha = (fecha: string) => {
    if (!fecha) return '';
    const dateParts = fecha.split("T")[0].split("-"); // Asume YYYY-MM-DD
    if (dateParts.length === 3) {
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // Retorna DD/MM/YYYY
    }
    return '';
};

/**
 * Convierte fecha DD/MM/YYYY a ISO String
 * (Función copiada del script guía)
 */
const parseDate = (dateString: string): string | null => {
    if (!dateString || dateString.length !== 10) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    // parts[2] = YYYY, parts[1] = MM, parts[0] = DD
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
};
// --- Funciones de Formateo de Inputs ---
const onDateInput = (cleanedInput: string) => {
    if (cleanedInput.length <= 2) {
        return cleanedInput;
    } else if (cleanedInput.length <= 4) {
        return cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2);
    }
    const truncatedInput = cleanedInput.slice(0, 8);
    return truncatedInput.slice(0, 2) + '/' + truncatedInput.slice(2, 4) + '/' + truncatedInput.slice(4, 8);
};
const onDateInput1 = (event: any) => { form.value.fecha = onDateInput(event.target.value.replace(/\D/g, '')); };

// --- Validación ---
const validateForm = () => {
    validationErrors.value = {};
    if (!form.value.accionInicial) validationErrors.value['accionInicial'] = true;
    if (!form.value.accionEjecutada) validationErrors.value['accionEjecutada'] = true;
    if (!form.value.Indicador1 && !form.value.Indicador2 && !form.value.Indicador3 && !form.value.Indicador4 && !form.value.Indicador5) {
        validationErrors.value['Indicador'] = true;
    }
    if (!form.value.fecha || form.value.fecha.length !== 10) validationErrors.value['fecha'] = true;
    
    return Object.keys(validationErrors.value).length === 0;
};

// --- Reseteo ---
const reset = () => {
    form.value.accionInicial = null;
    form.value.accionEjecutada = null;
    form.value.Indicador1 = null;
    form.value.Indicador2 = null;
    form.value.Indicador3 = null;
    form.value.Indicador4 = null;
    form.value.Indicador5 = null;
    form.value.fecha = '';
    form.value.indicadoresIds = {};
    dialogSave.value = false;
};

// --- FUNCIONES AUXILIARES DE GUARDADO ---
/**
 * Sincroniza (Crea/Actualiza) las filas de INDICADORES (1-5).
 * @param {any[]} indicadores - La lista filtrada de indicadores.
 */
const syncIndicadores = async (indicadores: any[], constId: number, fechaISO: string) => {
    const promises: Promise<any>[] = [];

    // 'indicadores' es la lista filtrada que SÓLO contiene { key: 'Indicador1', ... }
    for (const ind of indicadores) {
        // El valor a guardar (descripción)
        const descValue = (ind.value && typeof ind.value === 'object')
            ? ind.value.desc_indicadores // Valor del v-select (Ej: "Cumplido")
            : ind.value;                   // Fallback

        const payload: any = {
            id_pcpa_indicadores_tipo: ind.value.id, //  ind.tipoId, // ID estático (1, 2, 3...)
            id_pcpa_construccion: constId,
            cod_indicadores:ind.value.cod_indicadores,
            desc_indicadores: descValue, // El valor (texto o número)
            fec_ejecucion: fechaISO,
        };

        if (ind.value) { 
            if (ind.id) { // ind.id = form.value.indicadoresIds['Indicador1']
                // Actualizar (UPDATE)
                payload.estado = 'MODIFICADO';
                payload.usu_mod = username;
                payload.fec_mod = new Date();
                promises.push(ConvivenciaPacifica.updateSeguimiento(ind.id, payload));
            } else {
                // Crear (INSERT)
                payload.estado = 'ACTIVO';
                payload.usu_cre = username;
                payload.fec_cre = new Date();
                promises.push(ConvivenciaPacifica.createSeguimiento(payload));
            }
        }
    }
    return Promise.all(promises);
};


/**
 * Sincroniza (Crea/Actualiza) la fila ÚNICA de Acciones.
 * @param {any[]} acciones - La lista filtrada (e.g., [{key: 'accionInicial', ...}, {key: 'accionEjecutada', ...}])
 * @param {number} constId - ID de la construcción
 * @param {string | null} username - Nombre de usuario
 */
const syncAccionesEjecucion = async (acciones: any[], constId: number, username: string | null) => {
    
    // Si no hay acciones (ambos campos vacíos), no hacer nada.
    if (acciones.length === 0) {
        return Promise.resolve();
    }

    // 1. Construir el payload único
    const payload: any = {
        id_pcpa_construccion: constId,
    };
    
    let rowId: number | null = null;

    // 2. Iterar la lista (de 1 o 2 items) para poblar el payload
    for (const accion of acciones) {
        if (accion.key === 'accionInicial') {
            payload.cantidad_acciones_inicial = accion.value;
        } else if (accion.key === 'accionEjecutada') {
            payload.cantidad_acciones_final = accion.value;
        }

        // Asumir que el ID es el mismo para ambos (guardado por findAccionesEjecucion)
        if (accion.id) {
            rowId = accion.id;
        }
    }

    // 3. Hacer UNA sola llamada (UPDATE o CREATE) DESPUÉS del loop
    if (rowId) {
        // Actualizar (UPDATE)
        payload.estado = 'MODIFICADO';
        payload.usu_mod = username;
        payload.fec_mod = new Date();
        // Se asume que el ID (rowId) es el PK de la tabla 'acciones_ejecucion'
        return ConvivenciaPacifica.updateAccionesEjecucion(rowId, payload);
    } else {
        // Crear (INSERT)
        payload.estado = 'ACTIVO';
        payload.usu_cre = username;
        payload.fec_cre = new Date();
        return ConvivenciaPacifica.createAccionesEjecucion(payload);
    }
};


// --- FUNCIÓN PRINCIPAL DE GUARDADO ---
/**
 * Función `save` (llamada por el template)
 */
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
        // Asumiendo que 'constId' es un ref que obtiene su valor de onMounted
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
            syncAccionesEjecucion(acciones, constId.value, username)
        ]);

        toast.success('Registros guardados correctamente', { autoClose: 3000 });
        dialog.value = false;
        dialogSave.value = true;
        registroExiste.value = true; 

        // Recargar datos para obtener nuevos IDs (IDs de fila) y estados
        // (Asegúrate de que estas funciones existan y se llamen correctamente)
        // await findAccionesEjecucion(form.value.sie);
        // await findIndicadoresEjecucion(constId.value);

    } catch (error: any) {
        console.error("Error al guardar:", error);
        toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`, { autoClose: 3000 });
        isFormDisabled.value = false; // Permite al usuario reintentar
    } finally {
        isLoading.value = false;
    }
};

/**
 * Prepara los datos del formulario para ser enviados.
 */
const getDatosFormulario = () => {
    // Mapa (ASUMIDO) de llaves de formulario a IDs de tipo estáticos
    const activities = [
        { tipoId: 100, key: 'accionInicial', value: form.value.accionInicial, id: form.value.id_accciones_ejecucion },
        { tipoId: 101, key: 'accionEjecutada', value: form.value.accionEjecutada, id: form.value.id_accciones_ejecucion },
        { tipoId: 1, key: 'Indicador1', value: form.value.Indicador1, id: form.value.indicadoresIds['Indicador1'] },
        { tipoId: 2, key: 'Indicador2', value: form.value.Indicador2, id: form.value.indicadoresIds['Indicador2'] },
        { tipoId: 3, key: 'Indicador3', value: form.value.Indicador3, id: form.value.indicadoresIds['Indicador3'] },
        { tipoId: 4, key: 'Indicador4', value: form.value.Indicador4, id: form.value.indicadoresIds['Indicador4'] },
        { tipoId: 5, key: 'Indicador5', value: form.value.Indicador5, id: form.value.indicadoresIds['Indicador5'] },
    ];
    // Filtra solo los que tienen un valor
    return activities.filter(act => act.value !== null && act.value !== undefined && act.value !== '');
};

// --- Funciones para obtener datos de la UE (similares al código fuente) ---
const findUeByCiAndCodSie = async (): Promise<boolean> => {
    try {
        const formData = {
            codSie: localStorage.getItem('codigo_sie') || '',
            username: localStorage.getItem('username') || ''
        };

        const res = await ConvivenciaPacifica.findUeByCiAndCodSie(formData);
        console.log('Respuesta de findUeByCiAndCodSie →', res);

        if (res.status === 200 && res.data && res.data.length >= 1) {
            localStorage.setItem('existeEnBD', 'true');
            localStorage.setItem('dataUE', JSON.stringify(res.data));

              
            return true;
        } else {
            localStorage.setItem('existeEnBD', 'false');
            localStorage.setItem('dataUE', JSON.stringify([{ id: 0 }]));
            return false;
        }
    } catch (error) {
        console.error('Error en findUeByCiAndCodSie:', error);
        toast.error('Error de conexión con el servidor.', { autoClose: 3000 });
        return false;
    }
};

const findConstByCiAndUe = async (): Promise<number | null> => {
    const formData = {
        idUE: idUE,
        username: username
    };

    try {
        const res = await ConvivenciaPacifica.findConstByCiAndUe(formData);
        if (res.status === 200 && res.data && res.data.length > 0) {
            const data = res.data;
            if (data.length === 1) {
                localStorage.setItem('idConst', data[0].id);
                return data[0].id;
            } else {
                localStorage.setItem('idConst', '0');
                toast.warn('Se encontraron múltiples o ninguna construcción para esta UE.', { autoClose: 3500 });
                return null;
            }
        } else {
            toast.error('No se encontró una UE para el Director', { autoClose: 3500 });
            return null;
        }
    } catch (error) {
        console.error("Error en findConstByCiAndUe:", error);
        toast.error('Error de conexión al buscar ID de construcción.', { autoClose: 3500 });
        return null;
    }
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

