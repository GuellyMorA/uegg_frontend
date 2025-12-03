
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import Auth from '@/services/Auth'; 
import _ from 'lodash';

// ===== INTERFACES Y TIPOS =====
interface MiembroComision {
  status: boolean;
  value: string;
  id?: string | null;
}

interface Tema {
  status: boolean;
  id: string | number;
  label?: string;
  nivel?: number;
  tieneHijos?: boolean;
  cod_actividad?: string;
}

interface ActividadPromocion {
  id_actividades_promocion: string | number;
  check_actividad_tipo: boolean;
  id_pcpa_actividades_tipo: number;
  nivel: number;
  desc_actividades_promocion: string;
  estado: string;
}

// ===== CONSTANTES =====
const TIPO_COMISION_CONSTRUCCION = 1;
const TIPO_COMISION_APROBACION = 2;
const NIVEL_ACTIVIDAD_PRINCIPAL = 1;
const NIVEL_ACTIVIDAD_SECUNDARIA = 2;

// ===== REFERENCIAS REACTIVAS =====

const router = useRouter();
const valid = ref(false);
const dialog = ref(false);
const dialogSave = ref(false);
const validationErrors = ref<Record<string, boolean>>({});
const find = ref(false);
const comisionConstruccion = ref<Record<string, MiembroComision>>({});
const tema = ref<Record<string, Tema>>({});
const temaPromover = ref<Record<string, Tema>>({});
const comisionAprobacion = ref<Record<string, MiembroComision>>({});
const institucionEducativa = ref<any>(null);
const temaDisciplinario = ref<Record<string, Tema>>({});
const miembrosComisionConstruccion = ref<any[]>([]);
const actividadesPromocion = ref<ActividadPromocion[]>([]);

// Para los v-file-input
const selectedFilePlan = ref<File | null>(null);
const uploadMessagePlan = ref<string>('');
const selectedFileDiagnostico = ref<File | null>(null);
const uploadMessageDiagnostico = ref<string>('');

// Objeto reactivo con todos los campos del formulario
const form = ref({   
    username: '',
    idUE:  '',
    // Datos de Unidad Educativa
     codSie: '',
     sie: null,
     unidadEducativa: '',
     director: '',
     departamentoId: null,
     departamentoNombre: '',
     municipioId: null,
     municipioNombre: '',  
     nivel: '',
     modalidad: '',
    // Construcción del PCPA
    fecha: '',// '01/07/2025',
    registroAnterior: false,
    // Miembros de la comisión de construcción del PCPA
    comisionSocializacionEstudiante: false,
    comisionSocializacionEstudianteNombre:'',// 'Estudiante Alfa, Estudiante Beta',
    comisionSocializacionDirector: false,
    comisionSocializacionDirectorNombre:'',// 'Director Titular',
    comisionSocializacionMaestro: false,
    comisionSocializacionMaestroNombre: '',//'Maestro A, Maestro B',
    comisionSocializacionPadre: false,
    comisionSocializacionPadreNombre: '',//'Padre Familia 1, Madre Familia 2',
    comisionSocializacionOtro: false,
    comisionSocializacionOtroNombre: '',
    // Temas que aborda el Plan
    temaDerecho: false,
    temaNorma: false,
    temaPromover: false,
    temaPromover1: false,
    temaPromover2: false,
    temaPromover3: false,
    temaPromover4: false,
    temaPromover5: false,
    temaPromover6: false,
    temaPromover7: false,
    temaPromover8: false,
    temaPromover9: false,
    temaDisciplinario: false,
    temaDisciplinarioCorrectivo: false,
    temaDisciplinarioProcedimientoMarco: false,
    temaDisciplinarioProcedimientoAlternativo: false,
    temaDisciplinarioLineamiento: false,
    // Miembros de la comisión que aprueba el PCPA
    comisionAprobacionEstudiante: false,
    comisionAprobacionEstudianteNombre: '',//'Representante Estudiantil A',
    comisionAprobacionDirector: false,
    comisionAprobacionDirectorNombre: '',//'Director Aprobador',
    comisionAprobacionMaestro: false,
    comisionAprobacionMaestroNombre: '',//'',
    comisionAprobacionPadre: false,
    comisionAprobacionPadreNombre: '',//'Presidente de Junta Escolar',
    comisionAprobacionOtro: false,
    comisionAprobacionOtroNombre: '',
    fechaAprobacion: '',//'01/09/2036',
    vigenciaAprobacion: 1,
    validado: false  //false Declaración jurada   
});

// ===== ESTADO DE LA UI =====
const username = ref(localStorage.getItem('username') || '');
const registroExiste = ref( localStorage.getItem('existeEnBD')==='true' ? true : false  );  
const isFormDisabled = ref(true);  //ref(registroExiste.value);  
const isFormDisabledFromNew = ref(true); 
const isLoading = ref(true);
const idUE = ref(localStorage.getItem('idUE'));
const constId = ref<number | null>(null);
// ===== COMPUTED PROPERTIES =====
const temaDisciplinarioSync = computed(() => {
  return [
    form.value.temaDisciplinarioCorrectivo,
    form.value.temaDisciplinarioProcedimientoMarco,
    form.value.temaDisciplinarioProcedimientoAlternativo,
    form.value.temaDisciplinarioLineamiento
  ].some(value => value === true);
});

const temaPromoverSync = computed(() => {
  return [
    form.value.temaPromover1,
    form.value.temaPromover2,
    form.value.temaPromover3,
    form.value.temaPromover4,
    form.value.temaPromover5,
    form.value.temaPromover6,
    form.value.temaPromover7,
    form.value.temaPromover8,
    form.value.temaPromover9
  ].some(value => value === true);
});

// ===== FUNCIONES DE AYUDA =====
/**
 * Formatea una fecha de 'YYYY-MM-DD...' a 'DD/MM/YYYY'
 */
function formatFecha(fecha: Date): string {
  // Obtenemos día, mes y año
  const day = fecha.getDate();
  const month = fecha.getMonth() + 1; // getMonth() es base 0 (Enero=0)
  const year = fecha.getFullYear();
  // Aseguramos que tengan 2 dígitos (ej. 05 en lugar de 5)
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');
  // Construimos la cadena "DD/MM/AAAA"
  return `${formattedDay}/${formattedMonth}/${year}`; 
}

/**
 * Formatea una fecha en formato DD/MM/YYYY a ISO string para la API
 */
const formatDateToAPI = (dateString: string): string | null => {
  if (!dateString) return null;
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
};


/**
 * Valida que una fecha tenga el formato correcto DD/MM/YYYY
 */
const validateDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  return regex.test(dateString);
};

// ===== GESTIÓN DE DATOS INICIALES =====
onMounted(async() => {
    console.log('Ingresando con codSie y username : ' , localStorage.getItem('codigo_sie') , localStorage.getItem('username')   );
    await loadInitialData(); 
    console.log('==================================================================================');
    console.log('Ingresando con if= registroExiste y disabled=!isFormDisabled : ' ,registroExiste.value , !isFormDisabled.value   );
    console.log(' onMounted constId.value : ' ,constId.value);
} ); 

/**
 * Orquesta la carga de datos iniciales.
 */
const loadInitialData = async () => {      
    isLoading.value = true;
    username.value = localStorage.getItem("username") || "";    
    form.value.username = username.value;
    form.value.idUE = localStorage.getItem('idUE') || ''; 
    const codSie = localStorage.getItem('codigo_sie') || '';
    
    if (codSie) {
        form.value.codSie = codSie; 
        try {
            // 1. Encontrar IDs críticos (idUE y constId.value)
            idUE.value = await ConvivenciaPacifica.findUeByCiAndCodSieSetVariables(form.value)   
            form.value.idUE = idUE.value || '';
            constId.value = await ConvivenciaPacifica.findIdConstByCiAndUeSetVariables(form.value);  
            console.info('Iniciando procesamiento de API... constId.value: ', constId.value); 
            if (!constId.value && constId.value >0 ) { 
                toast.warn('No se encontró registro de construcción PCPA. No se puede cargar ni guardar indicadores.', { autoClose: 4000 });
                isLoading.value = false;
                isFormDisabled.value = true; 
            } else {
                // 2. Cargar datos en paralelo          
                await Promise.all([
                    findUnidadesEducativasPorDirector(),
                    findMiembrosComisionConstruccion(),
                    findActividadesPromocion(),
                ]);  
            }
        } catch (error: any) {
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

// Habilita el formulario para un nuevo registro. Ejemplo: limpiar campos
const iniciarNuevoRegistro = () => {
   form.value.fechaAprobacion= formatFecha(new Date()),// '01/07/2025',
   form.value.fecha= formatFecha(new Date());// '01/07/2025',

   console.log('Ingresar nuevo registro clickeado.');
   isFormDisabled.value = false;
   isFormDisabledFromNew.value = false;

};

// Habilita el formulario para editar un registro existente y deshabilita el botón
const modificarRegistro = () => {
    console.log('modificar registro .');

   dialogSave.value = false;       // Cierra el diálogo
   isFormDisabled.value = false;   // Habilita los campos para edición
};





// ===== GESTIÓN DE MIEMBROS DE COMISIÓN =====
/**
 * Procesa un mapa de miembros de comisión, divide los nombres por coma y los crea en la BD.
 * @param {object} miembrosMap - El objeto (ej. comisionConstruccion.value)
 * @param {string | number} idConst - El ID del registro de construcción (pcpa_construccion)
 * @param {number} idComisionTipo - 1 para Construcción, 2 para Aprobación
 * @param {Function} apiCall - La función del servicio a llamar (ej. ConvivenciaPacifica.createMiembroComision)
 */
const procesarMiembros = async (miembrosMap: Record<string, MiembroComision>, idConst: string | number, idComisionTipo: number, apiCall: Function) => {
    const promesasCreacion: Promise<any>[] = [];
    const username = localStorage.getItem('username'); // Asegurarnos de tener el username
    
    // Iteramos sobre las entradas del mapa (ej. '1': {status: true, value: 'Ana, Juan'})
    for (const [key, itemData] of Object.entries(miembrosMap)) {
        // Solo procesar si el checkbox está activo y hay un valor en el texto
        if (itemData.status && itemData.value) {
            // 1. Dividir el string por comas
            const nombresArray = itemData.value.split(',')
                                     .map(name => name.trim()) // Limpiar espacios
                                     .filter(name => name.length > 0); // Ignorar entradas vacías
            let ordenBase = (parseInt(key) - 1) * 10; // Da un orden base (Estudiante=0, Director=10, etc.)
            // 2. Crear una promesa de creación para CADA nombre
            for (const [index, nombre] of nombresArray.entries()) {
                const payload = {
                    id_pcpa_construccion: idConst,
                    id_pcpa_comision_tipo: idComisionTipo,
                    id_pcpa_miembro_tipo: parseInt(key), // El 'key' es 1, 2, 3, 4, o 5
                    orden: ordenBase + index + 1, // Orden único para cada miembro
                    nombres_miembro: nombre, // El nombre individual
                    apellidos_miembro: '', // Asumimos apellidos vacíos
                    check_miembro_comision: itemData.status,                 
                    estado: 'ACTIVO',
                    usu_cre: username,
                    fec_cre: new Date()
                };
                // 3. Añadir la promesa al array
                promesasCreacion.push(apiCall(payload));
            }
        }
    }
    // 4. Ejecutar todas las promesas de creación en paralelo
    if (promesasCreacion.length > 0) {
        console.log(`Iniciando creación de ${promesasCreacion.length} miembros para comisión tipo ${idComisionTipo}...`);
        const resultados = await Promise.allSettled(promesasCreacion);
        let exitosos = 0;
        resultados.forEach((res, i) => {
            if (res.status === 'fulfilled') {
                if (res.value.status === 201) { // 201 = Creado
                    exitosos++;
                    console.log(`Miembro ${i+1} (Comisión ${idComisionTipo}) creado exitosamente.`);
                } else {
                    console.warn(`Error al crear miembro ${i+1} (Comisión ${idComisionTipo}): Status ${res.value.status}`);
                }
            } else {
                console.error(`Fallo la creación del miembro ${i+1} (Comisión ${idComisionTipo}):`, res.reason);
            }
        });
        // 5. Mostrar un resumen
        if (exitosos > 0) {
            toast.info(`Se guardaron ${exitosos} miembros para la comisión.`, { autoClose: 3500, position: toast.POSITION.TOP_RIGHT });
        }
        if (exitosos < promesasCreacion.length) {
             toast.error(`Fallaron ${promesasCreacion.length - exitosos} guardados de miembros.`, { autoClose: 3500, position: toast.POSITION.TOP_RIGHT });
        }
    }
};

// ===== GESTIÓN DE REGISTROS =====
// registro el formulario para editar o crear un nuevo registro
const save = () => {
   console.log('Fecha form.value.fecha:', form.value.fecha);
    if (registroExiste.value ){
       updateRecord();
    }
    else{
       createRecord(); 
    }  
};

const createRecord = async () => {
    dialog.value = false; 
    if (!validateForm()) { 
        dialog.value = false; 
        toast.info('Debe ingresar los datos requeridos', { 
            autoClose: 3500, 
            position: toast.POSITION.TOP_RIGHT, 
        }); 
        return false; 
    }
    dialogSave.value = true; 
    isFormDisabled.value = true; // Deshabilita el formulario después de guardar 

    // --- Definición de Mapas de Miembros ---
    comisionConstruccion.value = { 
        1: {status: form.value.comisionSocializacionEstudiante, value: form.value.comisionSocializacionEstudianteNombre, id: form.value.comisionSocializacionEstudianteId },
        2: {status: form.value.comisionSocializacionDirector, value: form.value.comisionSocializacionDirectorNombre, id: form.value.comisionSocializacionDirectorId},
        3: {status: form.value.comisionSocializacionMaestro, value: form.value.comisionSocializacionMaestroNombre, id: form.value.comisionSocializacionMaestroId},
        4: {status: form.value.comisionSocializacionPadre, value: form.value.comisionSocializacionPadreNombre, id: form.value.comisionSocializacionPadreId},
        5: {status: form.value.comisionSocializacionOtro, value: form.value.comisionSocializacionOtroNombre, id: form.value.comisionSocializacionOtroId}
    };
    comisionAprobacion.value = { 
        1: {status: form.value.comisionAprobacionEstudiante, value: form.value.comisionAprobacionEstudianteNombre, id: form.value.comisionAprobacionEstudianteId},
        2: {status: form.value.comisionAprobacionDirector, value: form.value.comisionAprobacionDirectorNombre, id: form.value.comisionAprobacionDirectorId},
        3: {status: form.value.comisionAprobacionMaestro, value: form.value.comisionAprobacionMaestroNombre, id: form.value.comisionAprobacionMaestroId},
        4: {status: form.value.comisionAprobacionPadre, value: form.value.comisionAprobacionPadreNombre, id: form.value.comisionAprobacionPadreId},
        5: {status: form.value.comisionAprobacionOtro, value: form.value.comisionAprobacionOtroNombre, id: form.value.comisionAprobacionOtroId}
    };
    // Mapas de Temas (sin cambios)
    tema.value = { 
        1: {status: form.value.temaDerecho,         id: form.value.id_temaDerecho },
        2: {status: form.value.temaNorma,           id: form.value.id_temaNorma},         
        3: {status: form.value.temaDisciplinario,   id: form.value.id_temaDisciplinario}, 
        4: {status: form.value.temaSancion,         id: form.value.id_temaSancion},       
        5: {status: form.value.temaAdopcion,        id: form.value.id_temaAdopcion}, 
        6: {status: form.value.temaAlternativo,     id: form.value.id_temaAlternativo},   
        7: {status: form.value.temaRemision,        id: form.value.id_temaRemision},      
        8: {status: form.value.temaTaller,          id: form.value.id_temaTaller},        
        9: {status: form.value.temaPromover,        id: form.value.id_temaPromover}, 
        10:{status: form.value.temaSeguimiento ,    id: form.value.id_temaSeguimiento   }
    };
    temaPromover.value = { 
        1: {status: form.value.temaPromover1,       id: form.value.id_temaPromover1},     
        2: {status: form.value.temaPromover2,       id: form.value.id_temaPromover2},     
        3: {status: form.value.temaPromover3,       id: form.value.id_temaPromover3},     
        4: {status: form.value.temaPromover4,       id: form.value.id_temaPromover4},     
        5: {status: form.value.temaPromover5,       id: form.value.id_temaPromover5}, 
        6: {status: form.value.temaPromover6,       id: form.value.id_temaPromover6},     
        7: {status: form.value.temaPromover7,       id: form.value.id_temaPromover7},     
        8: {status: form.value.temaPromover8,       id: form.value.id_temaPromover8},     
        9: {status: form.value.temaPromover9,       id: form.value.id_temaPromover9} 
    };
    temaDisciplinario.value = { 
        10:{status:  form.value.temaDisciplinarioCorrectivo,id: form.value.id_temaDisciplinarioCorrectivo},
        11:{status:  form.value.temaDisciplinarioProcedimientoMarco,id: form.value.id_temaDisciplinarioProcedimientoMarco},
        12:{status:  form.value.temaDisciplinarioProcedimientoAlternativo,id: form.value.id_temaDisciplinarioProcedimientoAlternativo},
        13:{status:  form.value.temaDisciplinarioLineamiento,id: form.value.id_temaDisciplinarioLineamiento}
    };
    // --- Guardado Payload 1 (crear Unidad Educativa) ---
    const payload1 = { 
        cod_ue: form.value.codSie,
        desc_ue: form.value.unidadEducativa, 
        cod_sie: form.value.codSie,
        cod_rda_director: null,
        cod_director: null,
        nombres_director: form.value.director,
        apellidos_director: form.value.director,
        cod_departamento: form.value.departamento_codigo,
        desc_departamento: form.value.departamentoNombre,
        cod_municipio:  form.value.municipioId, 
        desc_municipio:  form.value.municipioNombre,
        cod_nivel: 0 ,
        desc_nivel: form.value.nivel ,
        modalidad: form.value.modalidad,
        estado: 'ACTIVO',
        usu_cre: username.value,
        fec_cre: new Date()
    };
    console.log(payload1);
    let save1;
    try {
        save1 = await ConvivenciaPacifica.createUnidadEducativa(payload1); 
        if(save1.status === 201){ 
            toast.info(`Registro ${form.value.codSie} guardado correctamente`, { 
                autoClose: 3500, 
                position: toast.POSITION.TOP_RIGHT, 
            }); 
            dialog.value = false; 
            dialogSave.value = true; 
        } else {
            toast.error('Registro no guardado (UE)', { autoClose: 3500, position: toast.POSITION.TOP_RIGHT }); 
            return; // Detener si falla el guardado principal
        }
    } catch (error: any) {
        toast.error(`Error al guardar UE: ${error.message}`, { autoClose: 3500, position: toast.POSITION.TOP_RIGHT });
        return; // Detener si falla
    }
    console.log("save1", save1); 
    // --- Guardado Payload 2 (createContruccion) ---
    const fechaRegistroAPI = formatDateToAPI(form.value.fecha);
    const fechaAprobacionAPI = formatDateToAPI(form.value.fechaAprobacion);
    
    if (!fechaRegistroAPI || !fechaAprobacionAPI) {
      toast.error('Fechas inválidas', { autoClose: 3500, position: toast.POSITION.TOP_RIGHT });
      return;
    }
    
    const payload2 = { 
        id_pcpa_unidad_educativa: save1.data.id,
        fecha_registro: fechaRegistroAPI,
        check_diagnostico_pcpa: form.value.registroAnterior,   
        fecha_aprobacion: fechaAprobacionAPI, 
        vigencia_aprobacion : form.value.vigenciaAprobacion,
        estado: 'ACTIVO',
        usu_cre: username.value,
        fec_cre: new Date()
    };
    let save2;
    try {
        save2 = await ConvivenciaPacifica.createContruccion(payload2); 
        if(save2.status === 201){ 
             constId.value = await ConvivenciaPacifica.findIdConstByCiAndUeSetVariables(form.value);  
              toast.info(`Registro id UE ${save1.data.id} guardado correctamente`, { 
                autoClose: 3500, 
                position: toast.POSITION.TOP_RIGHT, 
            }); 
            dialog.value = false; 
            dialogSave.value = true; 
            localStorage.setItem('existeEnBD', 'true'); 
        } else {
            toast.error('Registro no guardado (Construcción)', { autoClose: 3500, position: toast.POSITION.TOP_RIGHT }); 
            return; // Detener si falla
        }
    } catch (error: any) {
         toast.error(`Error al guardar Construcción: ${error.message}`, { autoClose: 3500, position: toast.POSITION.TOP_RIGHT });
         return; // Detener si falla
    }
    console.log("save2", save2); 
    // --- Guardado Payload 3 (Miembros Construcción) ---
    console.log("ini bucle save3 (Comisión Construcción)"); 
    await procesarMiembros(comisionConstruccion.value, save2.data.id, TIPO_COMISION_CONSTRUCCION, ConvivenciaPacifica.createMiembroComision);
    console.log("fin bucle save3"); 
    // --- Guardado Payload 4 (Temas Nivel 1) createTarea---
    console.log("ini bucle save4 (Temas Nivel 1)"); 
    const promesasSave4 = [];
    Object.keys(tema.value).map((item, key) => { 
        if(tema.value[item].status){ 
            const payload4 = { 
                id_pcpa_construccion: save2.data.id,
                id_pcpa_actividades_tipo: item,                   
                nivel: NIVEL_ACTIVIDAD_PRINCIPAL, 
                fec_aprobacion: fechaAprobacionAPI, 
                tiempo_vigencia: 0, 
                declaracion_jurada: true, 
                estado: 'ACTIVO' , 
                usu_cre: username.value, 
                fec_cre: new Date() 
            };
            promesasSave4.push(ConvivenciaPacifica.createTarea(payload4)); 
        }        
    });
    if(promesasSave4.length > 0) {
        await Promise.allSettled(promesasSave4);
        toast.info(`Guardados ${promesasSave4.length} temas principales.`, { autoClose: 3000, position: toast.POSITION.TOP_RIGHT });
    }
    console.log("fin bucle save4"); 
    // --- Guardado Payload 50 (Temas Disciplinarios Nivel 2) ---
    if(form.value.temaDisciplinario){ 
        console.log("ini bucle 50 (Disciplinario N2)"); 
        const promesasSave50 = [];
        Object.keys(temaDisciplinario.value).map((item, key) => { 
            if(temaDisciplinario.value[item].status){ 
                const payload50 = { 
                    id_pcpa_construccion: save2.data.id,
                    id_pcpa_actividades_tipo: item,       
                    nivel: NIVEL_ACTIVIDAD_SECUNDARIA, 
                    fec_aprobacion: fechaAprobacionAPI, 
                    tiempo_vigencia: 0, 
                    declaracion_jurada: true, 
                    estado: 'ACTIVO' , 
                    usu_cre: username.value, 
                    fec_cre: new Date() 
                };
                promesasSave50.push(ConvivenciaPacifica.createTareaPromover(payload50)); 
            }        
        });
        if(promesasSave50.length > 0) {
            await Promise.allSettled(promesasSave50);
            toast.info(`Guardados ${promesasSave50.length} sub-temas disciplinarios.`, { autoClose: 3000, position: toast.POSITION.TOP_RIGHT });
        }
        console.log("fin bucle 50"); 
    }
    // --- Guardado Payload 5 (Temas Promover Nivel 2) ---
    if(form.value.temaPromover){ 
        console.log("ini bucle 5 (Promover N2)"); 
        const promesasSave5 = [];
        Object.keys(temaPromover.value).map((item, key) => { 
            if(temaPromover.value[item].status){ 
                const payload5 = { 
                    id_pcpa_construccion: save2.data.id,
                    id_pcpa_actividades_tipo: item,   
                    nivel: NIVEL_ACTIVIDAD_SECUNDARIA, 
                    fec_aprobacion: fechaAprobacionAPI, 
                    tiempo_vigencia: 0, 
                    declaracion_jurada: true, 
                    estado: 'ACTIVO' , 
                    usu_cre:username.value, 
                    fec_cre: new Date() 
                };
                promesasSave5.push(ConvivenciaPacifica.createTareaPromover(payload5)); 
            }        
        });
        if(promesasSave5.length > 0) {
            await Promise.allSettled(promesasSave5);
            toast.info(`Guardados ${promesasSave5.length} sub-temas de promoción.`, { autoClose: 3000, position: toast.POSITION.TOP_RIGHT });
        }
        console.log("fin bucle 5"); 
    }
    // --- Guardado Payload 6 (Miembros Aprobación) ---
    console.log("ini bucle save6 (Comisión Aprobación)"); 
    await procesarMiembros(comisionAprobacion.value, save2.data.id, TIPO_COMISION_APROBACION, ConvivenciaPacifica.createMiembroComisionAprobacion);
    console.log("fin bucle save6"); 
    console.log("fin de createRec"); 
};

const updateRecord = async () => {
    // 1. Snapshot y validación
    console.log('Editando datos (snapshot):', { ...form.value }); 
    if (!validateForm()) { 
        dialog.value = false; 
        toast.info('Debe ingresar los datos requeridos', { 
            autoClose: 3500, 
            position: toast.POSITION.TOP_RIGHT, 
        }); 
        return false; 
    }
    dialog.value = false; 
    isFormDisabled.value = true; 
    form.value.idUE =  localStorage.getItem('idUE') ; //user.codigo_sie;          
      // constId.value = await ConvivenciaPacifica.findIdConstByCiAndUeSetVariables(form.value);  
      // console.log('updateRecord->  constId.value : ' ,constId.value); 
     //  localStorage.setItem('idConst',constId.value )
    // --- Definición de Mapas de Miembros ---
    // (Estos mapas se usarán para la CREACIÓN después de la eliminación)
    comisionConstruccion.value = { 
        1: {status: form.value.comisionSocializacionEstudiante, value: form.value.comisionSocializacionEstudianteNombre, id: null }, // IDs antiguos no son necesarios para este mapa
        2: {status: form.value.comisionSocializacionDirector, value: form.value.comisionSocializacionDirectorNombre, id: null},
        3: {status: form.value.comisionSocializacionMaestro, value: form.value.comisionSocializacionMaestroNombre, id: null},
        4: {status: form.value.comisionSocializacionPadre, value: form.value.comisionSocializacionPadreNombre, id: null},
        5: {status: form.value.comisionSocializacionOtro, value: form.value.comisionSocializacionOtroNombre, id: null}
    };
    comisionAprobacion.value = { 
        1: {status: form.value.comisionAprobacionEstudiante, value: form.value.comisionAprobacionEstudianteNombre, id: null},
        2: {status: form.value.comisionAprobacionDirector, value: form.value.comisionAprobacionDirectorNombre, id: null},
        3: {status: form.value.comisionAprobacionMaestro, value: form.value.comisionAprobacionMaestroNombre, id: null},
        4: {status: form.value.comisionAprobacionPadre, value: form.value.comisionAprobacionPadreNombre, id: null},
        5: {status: form.value.comisionAprobacionOtro, value: form.value.comisionAprobacionOtroNombre, id: null}
    };
    // --- Actualización Payload 2 (Construcción) ---
    const fechaRegistroAPI = formatDateToAPI(form.value.fecha);
    const fechaAprobacionAPI = formatDateToAPI(form.value.fechaAprobacion);
    
    if (!fechaRegistroAPI || !fechaAprobacionAPI) {
      toast.error('Fechas inválidas', { autoClose: 3500, position: toast.POSITION.TOP_RIGHT });
      return;
    }
    
    const payload2 = { 
        fecha_registro: fechaRegistroAPI, 
        check_diagnostico_pcpa: form.value.registroAnterior,
        fecha_aprobacion: fechaAprobacionAPI,
        vigencia_aprobacion: form.value.vigenciaAprobacion,
        estado: 'MODIFICADO',
        usu_cre: username.value, // Debería ser usu_mod? Asumiendo usu_cre para log
        fec_cre: new Date() // Debería ser fec_mod? Asumiendo fec_cre para log
    };
    try {
        console.log("ini save2 updateContruccion : constId.value, payload2:",constId.value, { ...payload2 }); 
        const res = await ConvivenciaPacifica.updateContruccion(constId.value, payload2); 
        if (res.status === 200) { 
              toast.info(`Registro ${constId.value} actualizado correctamente`, { 
                autoClose: 3500, 
                position: toast.POSITION.TOP_RIGHT, 
            }); 
            dialog.value = false; 
            dialogSave.value = true; 
        } else {
             toast.error('Registro no actualizado', { 
                autoClose: 3500, 
                position: toast.POSITION.TOP_RIGHT, 
            }); 
            return; // Detener si falla la actualización principal
        }
        console.log("fin save2, respuesta:", res); 
    } catch (error: any) { 
        console.error("Error crítico en save2:", error); 
        toast.error(`Error al actualizar: ${error.message}`, { autoClose: 3500, position: toast.POSITION.TOP_RIGHT }); 
        return; 
    }
    // --- NUEVA LÓGICA DE ACTUALIZACIÓN DE MIEMBROS (DELETE-ALL, CREATE-ALL) ---
  /*  try {
        // 1. Buscar todos los miembros actuales
        console.log("Buscando miembros antiguos para eliminar...");
        const resMiembros = await ConvivenciaPacifica.findMiembrosComisionConstruccion(form.value.codSie); 
        const miembrosActuales = resMiembros.data || [];
        if (miembrosActuales.length > 0) {
            // 2. Mapear sus IDs para eliminarlos
            // Asumiendo que 'id_miembro' es el PK de ueggPcpaMiembroComision, según lógica en createRec 
            const idsParaEliminar = miembrosActuales.map(miembro => miembro.id_miembro); 
            console.log(`Eliminando ${idsParaEliminar.length} miembros antiguos...`, idsParaEliminar);
            const promesasDelete = idsParaEliminar.map(id => ConvivenciaPacifica.deleteMiembroComision(id));
            await Promise.allSettled(promesasDelete);
            toast.info('Miembros de comisión anteriores actualizados.', { autoClose: 2000, position: toast.POSITION.TOP_RIGHT });
        }
        // 3. Crear todos los miembros de nuevo usando la función auxiliar
        console.log("Creando nuevos miembros de Comisión Construcción (Update)...");
        await procesarMiembros(comisionConstruccion.value, constId.value, TIPO_COMISION_CONSTRUCCION, ConvivenciaPacifica.createMiembroComision);
        console.log("Creando nuevos miembros de Comisión Aprobación (Update)...");
        await procesarMiembros(comisionAprobacion.value, constId.value, TIPO_COMISION_APROBACION, ConvivenciaPacifica.createMiembroComisionAprobacion);
    } catch (error: any) {
        console.error("Error crítico al actualizar miembros de comisión:", error);
        toast.error(`Error al actualizar miembros: ${error.message}`, { autoClose: 3500, position: toast.POSITION.TOP_RIGHT });
        // No detenemos, ya que el registro principal y los temas aún pueden guardarse
    }
    */
    // --- Lógica de Temas (Actividades) ---
    // (Esta lógica se mantiene sin cambios)
    console.log("--- Iniciando save4 (tema.value) ---", tema.value); 
    const temasPromoverMapeados = mapearTemasPromover(form.value); 
    console.log("Temas Promover Mapeados:", temasPromoverMapeados); 
    const resultadoFinal = compararActividades(actividadesPromocion.value, temasPromoverMapeados); 
   // console.log('resultadoFinal :', resultadoFinal); 
   // console.table(resultadoFinal); 
    // Esta función maneja sus propias llamadas a la API (createTarea/updateTarea)
    await procesarResultadosAPI(resultadoFinal); 
    console.log("--- fin bucle save 4 ---"); 
    console.log("--- fin de todos los saves (update) ---"); 
};

// ===== PROCESAMIENTO DE RESULTADOS API =====
/**
 * Función principal que recibe el array y procesa las peticiones.
 * Es 'async' para poder usar 'await'.
 *
 * @param {Array} resultadoFinal El array generado en el paso anterior.
 */
 const procesarResultadosAPI = async (resultadoFinal: any[])=>{
        console.log('Iniciando procesamiento de API...');
       constId.value = await ConvivenciaPacifica.findIdConstByCiAndUeSetVariables(form.value);  //   
        // modifica el array original
     resultadoFinal = actualizarEstadoModificado(resultadoFinal);
    // console.table(resultadoFinal);
        // 1. Creamos un array para guardar todas las promesas (peticiones)
        const promesas = [];
        const fechaAprobacionAPI = formatDateToAPI(form.value.fechaAprobacion);
        
        if (!fechaAprobacionAPI) {
          toast.error('Fecha de aprobación inválida', { autoClose: 3500, position: toast.POSITION.TOP_RIGHT });
          return;
        }
        
        // 2. Iteramos sobre cada item del array resultadoFinal
        for (const item of resultadoFinal) {
            const idParaActualizar = item.id_actividades_promocion;    
            if (item.estado === 'MODIFICADO' && ( item.status === true  || item.status === false ) ) { //&& item.status === false  item.estado === 'INACTIVO'
            // Si es MODIFICADO llamamos al endpoint PUT.                  
          //  console.log(`Preparando PUT (update) para ID: ${idParaActualizar}`, item);
            // 2. Creamos la promesa PUT(update) y la añadimos al array
            promesas.push(// 3. Usamos una función asíncrona autoejecutable (IIAFE).  Esto crea y devuelve una promesa que 'Promise.allSettled' puede manejar.
                (async () => {                       
                    try {
                        const payload4 = {
                            id_pcpa_construccion: constId.value,                       
                            id_pcpa_actividades_tipo: item.id_pcpa_actividades_tipo,                             
                            nivel: item.nivel,
                            fec_aprobacion: fechaAprobacionAPI,
                            tiempo_vigencia: 0,
                            declaracion_jurada: true,
                            estado: item.status ? 'MODIFICADO' : 'INACTIVO',
                            usu_cre: username.value,
                            fec_cre: new Date()
                        };
                        console.log(`save4 (PUT ID: ${idParaActualizar}), payload4:`, { ...payload4 });
                        // 4. Ahora sí puedes usar 'await' dentro de esta función 'async'
                        const res = await ConvivenciaPacifica.updateTarea(idParaActualizar, payload4);
                        if (res.status === 200) {
                            toast.info(`Registro ${idParaActualizar} guardado correctamente`, { 
                                autoClose: 3500,
                                position: toast.POSITION.TOP_RIGHT, 
                            });
                            console.log(`Registro ${idParaActualizar} guardado correctamente`);
                        } else {
                            toast.error(`Registro ${idParaActualizar} no modificado (Status: ${res.status})`, { 
                                autoClose: 3500,    position: toast.POSITION.TOP_RIGHT,  });
                        }
                        console.log(`fin bucle save4 (ID: ${idParaActualizar}), respuesta:`, res);
                        // 5. Devolvemos la respuesta para que 'allSettled' la capture como 'fulfilled'
                        return res; 
                    } catch (error: any) {
                        // 6. El 'catch' maneja el error de 'updateTarea'
                        console.error(`Error en save4 (PUT ID: ${idParaActualizar}):`, error);
                        toast.error(`Error guardando ${idParaActualizar}: ${error.message}`);
                        // 7. Volvemos a lanzar el error para que Promise.allSettled
                        //    lo registre como 'rejected'.
                        throw error; 
                    }
                })() // <-- Los '()' al final ejecutan la función inmediatamente.
            ); 
            }
            const esNuevo = item.estado === 'NUEVO';
            const estaActivo = item.status === true;
            const esNivel2 = item.nivel === NIVEL_ACTIVIDAD_SECUNDARIA;
            const esNivel1SinHijos = item.nivel === NIVEL_ACTIVIDAD_PRINCIPAL && item.tieneHijos === false;
             // Si es NUEVO, llamamos al endpoint POST (Crear).     
            if (esNuevo && estaActivo && (esNivel2 || esNivel1SinHijos)) {        
                console.log('Preparando POST (NUEVO)', item);             
                // Creamos la promesa POST y la añadimos al array    
                promesas.push(   // 3. Usamos una función asíncrona autoejecutable (IIAFE). Esto crea y devuelve una promesa que 'Promise.allSettled' puede manejar.
                (async () => {                       
                    try {
                        const payload4 = {
                            id_pcpa_construccion: constId.value,                       
                            id_pcpa_actividades_tipo: item.id_pcpa_actividades_tipo,                             
                            nivel: item.nivel,
                            fec_aprobacion: fechaAprobacionAPI,
                            tiempo_vigencia: 0,
                            declaracion_jurada: true,
                            estado: 'ACTIVO',
                            usu_cre: username.value,
                            fec_cre: new Date()
                        };
                        console.log(`ini bucle save4 (POST ID: ${idParaActualizar}), payload4:`, { ...payload4 });
                        // 4. usar 'await' dentro de esta función 'async'
                        const res = await ConvivenciaPacifica.createTarea( payload4);
                        if (res.status === 201) {
                            toast.info(`Registro ${idParaActualizar} guardado correctamente`, { 
                                autoClose: 3500,
                                position: toast.POSITION.TOP_RIGHT, 
                            });
                        } else {
                            toast.error(`Registro ${idParaActualizar} no modificado (Status: ${res.status})`, { 
                                autoClose: 3500,
                                position: toast.POSITION.TOP_RIGHT, 
                            });
                        }
                        console.log(`fin bucle save4 (ID: ${idParaActualizar}), respuesta:`, res);
                        // 5. Devolvemos la respuesta para que 'allSettled' la capture como 'fulfilled'
                        return res; 
                    } catch (error: any) {
                        // 6. El 'catch' maneja el error de 'updateTarea'
                        console.error(`Error en save4 (PUT ID: ${idParaActualizar}):`, error);
                        toast.error(`Error guardando ${idParaActualizar}: ${error.message}`);
                        // 7. Volvemos a lanzar el error para que Promise.allSettled
                        //    lo registre como 'rejected'.
                        throw error; 
                    }
                })() // <-- Los '()' al final ejecutan la función inmediatamente.
            );
            }
        }
        // 3. Ejecutamos todas las promesas en paralelo
        // Usamos Promise.allSettled() porque no queremos que una petición fallida detenga a las demás. Esperará a que todas terminen.
        console.log(`Enviando ${promesas.length} peticiones...`);
        const resultados = await Promise.allSettled(promesas);
        console.log('--- Procesamiento de API completado ---resultados : ', resultados);
        // 4. (Opcional) Revisamos los resultados de cada petición
       /* resultados.forEach((resultado, index) => {
            if (resultado.status === 'fulfilled') {
            // La petición fue exitosa
            console.log(`Éxito Petición ${index + 1}:`, resultado.value.data);
            } else {
            // La petición falló
            console.error(`Error Petición ${index + 1}:`, resultado.reason.message);
            // Si el servidor dio una respuesta de error (ej. 404, 500), estará aquí:
            if (resultado.reason.response) {
                console.error('Detalle del error (servidor):', resultado.reason.response.data);
            }
            }
        });*/
        console.log('Fin del proceso.');
};

// ===== FUNCIONES AUXILIARES =====
function capitalizarPrimeraLetra(texto: string): string {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/** Compara un array de actividades con un objeto JSON de estados
 * y devuelve un array combinado según las reglas especificadas.
 *
 * Reglas (basadas en los ejemplos proporcionados):
 * 1. Si el ID existe en ambos (array y JSON):
 * - Se combinan los datos.
 * - El 'estado' se establece como 'ACTIVO'.
 * 2. Si el ID solo existe en el array (no en JSON):
 * - Se usan datos del array.
 * - id='null', status=true, estado='INACTIVAR'.
 * 3. Si el ID solo existe en el JSON (no en el array):
 * - Se usan datos del JSON.
 * - id_actividades_promocion='null', check_actividad_tipo='null', estado='NUEV O'.
 * - (Nota: El 'status' del JSON 7882 era 'false' en los datos, pero 'true' en el
 * ejemplo de salida. Esta función sigue el ejemplo de salida).
 */
 function compararActividades(arrayDatos: ActividadPromocion[], jsonDatos: Record<string, Tema>) {
  const resultado = [];
// 1. Convertir el array JSON a un Map usando el label como clave
  const jsonMap = new Map();
  for (const item of Object.values(jsonDatos)) {
    if (item && item.label) {
      // Normalizamos el label para la comparación
      const labelNormalizado = capitalizarPrimeraLetra(item.label.toLowerCase());
      jsonMap.set(labelNormalizado, item.status);
    }
  }
// Copia plana de los datos
const copiaNoReactiva = new Map(jsonMap);
  // 2. Recorrer el array principal (arrayDatos)
  //    Esto manejará la Regla 1 (Coincidencia) y la Regla 2 (Solo en Array)
  for (const arrayItem of arrayDatos) {
    const labelBuscado  = capitalizarPrimeraLetra(arrayItem.desc_actividades_promocion.toLowerCase()); // id_actividades_promocion
    const jsonMatch = jsonMap.get(labelBuscado );
    if (jsonMatch) {
      // Regla 1: Existe en ambos (Array BD y JSON pantalla)
      resultado.push({
        id_actividades_promocion: arrayItem.id_actividades_promocion,
        check_actividad_tipo: arrayItem.check_actividad_tipo,
        id_pcpa_actividades_tipo: arrayItem.id_pcpa_actividades_tipo,
         nivel: arrayItem.nivel,
        id: arrayItem.id_actividades_promocion,
         label: arrayItem.desc_actividades_promocion,
        status: 'fromBD y Json', // Tomamos el status del JSON
        estado: jsonMatch ? 'ACTIVO' : 'INACTIVO', //arrayItem.estado    'estado' fijo según tu ejemplo de regla 1
        tieneHijos : 'null' 
      });
      // Eliminamos el item del Map para saber cuáles sobran (Regla 3)
    //  copiaNoReactiva.delete(labelBuscado);
    } else {
      // Regla 2: Solo existe en el Array desde BD
      resultado.push({
        id_actividades_promocion: arrayItem.id_actividades_promocion,
        check_actividad_tipo: arrayItem.check_actividad_tipo,
        id_pcpa_actividades_tipo: arrayItem.id_pcpa_actividades_tipo,
          nivel: arrayItem.nivel,
        id:  arrayItem.id_actividades_promocion, // 'id' nulo según tu ejemplo de regla 2
        label: arrayItem.desc_actividades_promocion,
        status: 'fromBD', // true   'status' fijo según tu ejemplo de regla 2
        estado: arrayItem.estado, //ACTIVO 'estado' fijo según tu ejemplo de regla 2
          tieneHijos : 'null' 
      });
    }
  }
  // 3. Recorrer los items restantes en el  json desde la pantalla 
  //    Estos son los que solo existían en el JSON (Regla 3)
  for (const jsonItem of copiaNoReactiva.keys()) {
    // Regla 3: Solo existe en el JSON  desde la pantalla 
        const nuevoRegistro = obtenerKeyOriginal(jsonDatos, jsonItem);
   //console.error( 'nuevoRegistro :', nuevoRegistro);
      resultado.push({
      id_actividades_promocion: 'null', // Nulo según tu ejemplo de regla 3
      check_actividad_tipo: 'null', // Nulo según tu ejemplo de regla 3
       id_pcpa_actividades_tipo:  nuevoRegistro?.id,
         nivel: nuevoRegistro?.nivel ,
      id:'null', 
         label:jsonItem, 
      status:nuevoRegistro?.status , // 'status' fijo según tu ejemplo de regla 3
      estado: 'NUEVO', // 'estado' fijo según tu ejemplo de regla 3
        tieneHijos : nuevoRegistro?.tieneHijos
    });
  }
  return resultado;
}

function obtenerKeyOriginal(jsonDatos: Record<string, Tema>, labelBuscado: string) {
  for (const item of Object.values(jsonDatos)) {
    if (item.label === labelBuscado) {
      return { id: item.id, status: item.status,  nivel: item.nivel,   tieneHijos : item.tieneHijos  };
    }
  }
  return null; // si no se encuentra
}

//  busca todos los elementos que check_actividad_tipo =true, entonces ,esos elementos busca en el objeto, mediante la propiedad label, pero conviertela antes a mayuscula, a los elementos encontrados cambiale la propiedad estado a MODIFICADO
function actualizarEstadoModificado(dataArray: any[]) {
  // 1. Crear un MAPA (clave = label.toUpperCase(), valor = objeto con los IDs)
  const labelsFuenteMap = new Map();
  dataArray.forEach(item => {
  //  console.log("item.label:", item.label);
    if (item.id_actividades_promocion != 'null' && item.label) {
      labelsFuenteMap.set(item.label.toUpperCase(), {
        id_actividades_promocion: item.id_actividades_promocion,
        id_pcpa_actividades_tipo: item.id_pcpa_actividades_tipo
      });
    }
  });
  // 2. Recorrer el array principal y modificar los que coincidan
 /* const arrayModificado = dataArray.map(item => {
    if (!item.label) return item; // sin label, no se toca
    const labelUpper = item.label.toUpperCase();
    if (labelsFuenteMap.has(labelUpper)) {
      const fuente = labelsFuenteMap.get(labelUpper);
 console.error( 'fuente Buscado:', fuente);
      return {
        ...item,
        id_actividades_promocion: fuente.id_actividades_promocion,
        id_pcpa_actividades_tipo: fuente.id_pcpa_actividades_tipo,
        estado: "MODIFICADO"
      };
    }
      return item;
    })
    // 👇 Filtra los elementos con id_pcpa_actividades_tipo = null o 'null'
    .filter(item => item.estado == 'MODIFICADO' || (item.estado == 'NUEVO' &&  item.status == true) );//   item.status !== false  && item.estado !== 'NUEVO 
*/
console.log("--- INICIO DE PROCESO DE MAPEO Y COMPARACIÓN ---");
    // 1. FASE DE MAPEO (.map)
    const arrayMapeado = dataArray.map((item, index) => {        
       // console.log(` Procesando elemento #${index + 1}: Label Original: ${item.label ? item.label : 'SIN ETIQUETA'} | Estado Actual: ${item.estado}`);
        if (!item.label) {
            console.log(`⚠️ Condición: Sin etiqueta (label nulo). Se omite la comparación.`);
            return item;
        }
        const labelUpperDataArray = item.label.toUpperCase();
        // Comprobación de coincidencia
        if (labelsFuenteMap.has(labelUpperDataArray)) {
            const fuente = labelsFuenteMap.get(labelUpperDataArray);
          //  console.log(`✅ DataArray ENCONTRADA: "${labelUpperDataArray}" existe. El elemento será MODIFICADO.`);
          //  console.error('   fuente Buscado:', fuente);
            return {
                ...item,
                id_actividades_promocion: fuente.id_actividades_promocion,
                id_pcpa_actividades_tipo: fuente.id_pcpa_actividades_tipo,
                estado: "MODIFICADO" // Se establece el estado de modificación
            };
        }
        //console.error(`❌ labelsFuenteMap : "${labelsFuenteMap.get(labelUpperDataArray)}" buscada. El elemento NO será MODIFICADO.`);
       //rbc console.error(`❌ DataArray SIN COINCIDENCIA : "${labelUpperDataArray}" NO se encontró. Se mantiene el estado: ${item.estado}, ${item.id_pcpa_actividades_tipo} `);
        return item;
    });
    console.log("--- INICIO DE FASE DE FILTRADO ---");
    // 2. FASE DE FILTRADO (.filter)
    const arrayModificado = arrayMapeado.filter((item, index) => {
        const etiqueta = item.label || 'SIN LABEL';
        const estado = item.estado || 'N/A';
        const status = item.status === true; // status booleano
        let seMantiene = false;
        // 🔹 Opción A: Es 'MODIFICADO'
        if (estado === 'MODIFICADO') {
            seMantiene = true;
          //  console.log(`🟢 FILTRO: El item "${etiqueta}" está en estado 'MODIFICADO'. ACEPTADO.`);
        } 
        // 🔹 Opción B: Es 'NUEVO' Y tiene status=true
        else if (estado === 'NUEVO' && status) {
             seMantiene = true;
           //  console.log(`🟢 FILTRO: El item "${etiqueta}" es 'NUEVO' y tiene status=true. ACEPTADO.`);
        } 
        // 🔹 Rechazo
        else {
          //  console.log(`🔴 FILTRO: El item "${etiqueta}" (Estado: ${estado}, Status: ${item.status}) no cumple las condiciones. RECHAZADO.`);
        }
        return seMantiene;
    });
    console.log("--- FIN DEL PROCESO ---", arrayModificado);
  return arrayModificado;
}

// --- DATOS DE ENTRADA ---
function mapearTemasPromover(formData: any) {
    // Mapeo de los checkboxes de temas promover
    const temasPromover = {
  1:  { label: "Derechos y deberes", status: formData.temaDerecho || false, id: 1, cod_actividad: "DB", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false },
  2:  { label: "Normas de conducta", status: formData.temaNorma || false, id: 2, cod_actividad: "NC", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false },
  3:  { label: "Procedimientos disciplinarios", status: formData.temaDisciplinario || false, id: 3, cod_actividad: "PD", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: true },  
  4:  { label: "Correctivos pedagógicos", codigo: "S", status: formData.temaDisciplinarioCorrectivo || false, id: 10, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  5:  { label: "Procedimiento marco para la adopción de decisiones disciplinarias", codigo: "PADD", status: formData.temaDisciplinarioProcedimientoMarco || false, id: 11, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  6:  { label: "Procedimientos alternativos para la solución de conflictos", codigo: "PAS", status: formData.temaDisciplinarioProcedimientoAlternativo || false, id: 12, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  7:  { label: "Lineamientos para la remisión de informes sobre casos de violencia", codigo: "LRI", status: formData.temaDisciplinarioLineamiento || false, id: 13, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  8:  { label: "Sanción", status: formData.temaXX || false, id: 8, cod_actividad: "S", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false },
  9:  { label: "Adopción", status: formData.temaXX || false, id: 9, cod_actividad: "PADD", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false },
  10: { label: "Alternativo", status: formData.temaXX || false, id: 10, cod_actividad: "PAS", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false },
  11: { label: "Remisión", status: formData.temaXX || false, id: 11, cod_actividad: "LRI", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false },
  12: { label: "Taller", status: formData.temaXX || false, id: 12, cod_actividad: "PTC", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false },
  13: { label: "Actividades para promover la convivencia pacífica", status: formData.temaPromover || false, id: 9, cod_actividad: "APC", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: true },  
  14: { label: "Movilización social", codigo: "MS", status: formData.temaPromover1 || false, id: 1, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  15: { label: "Fomento al desarrollo de habilidades y práctica de valores", codigo: "FDHP", status: formData.temaPromover2 || false, id: 2, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  16: { label: "Capacitación", codigo: "C", status: formData.temaPromover3 || false, id: 3, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  17: { label: "Medidas de seguridad en la infraestructura", codigo: "MSI", status: formData.temaPromover4 || false, id: 4, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  18: { label: "Normas de convivencia en la unidad educativa", codigo: "NCUE", status: formData.temaPromover5 || false, id: 5, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  19: { label: "Promoción de la participación de las y los estudiantes", codigo: "PPE", status: formData.temaPromover6 || false, id: 6, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  20: { label: "Gestión y articulación con la comunidad educativa", codigo: "GACU", status: formData.temaPromover7 || false, id: 7, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  21: { label: "Acción comunal", codigo: "AC", status: formData.temaPromover8 || false, id: 8, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  22: { label: "Acciones para la reducción de riesgos en el contexto y en la unidad educativa", codigo: "ARRUE", status: formData.temaPromover9 || false, id: 9, nivel: NIVEL_ACTIVIDAD_SECUNDARIA, tieneHijos: false },
  23: { label: "Seguimiento", status: formData.temaPromover23 || false, id: 16, cod_actividad: "PSE", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false },
  24: { label: "Mediación", status: formData.temaPromover24 || false, id: 17, cod_actividad: "MCI", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false },
  25: { label: "Reinserción", status: formData.temaPromover25 || false, id: 18, cod_actividad: "RS", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false },
  26: { label: "Taller libre", status: formData.temaPromover26 || false, id: 19, cod_actividad: "TAL", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false },
  27: { label: "Feria", status: formData.temaPromover27 || false, id: 14, cod_actividad: "FER", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false },
  28: { label: "Otros", status: formData.temaPromover28 || false, id: 15, cod_actividad: "OTR", nivel: NIVEL_ACTIVIDAD_PRINCIPAL, tieneHijos: false }
};
    return temasPromover;
}

// Lógica para subir archivos (simulada)
const uploadFilePlan = () => {
    if (selectedFilePlan.value) {
        uploadMessagePlan.value = `Archivo "${selectedFilePlan.value.name}" subido con éxito.`;
        console.log('Subiendo Plan:', selectedFilePlan.value);
    }
};
const uploadFileDiagnostico = () => {
    if (selectedFileDiagnostico.value) {
        uploadMessageDiagnostico.value = `Archivo "${selectedFileDiagnostico.value.name}" subido con éxito.`;
        console.log('Subiendo Diagnóstico:', selectedFileDiagnostico.value);
    }
};

const findUnidadesEducativasPorDirector = async () => {
    console.log("findUnidadesEducativasPorDirector ->form.value.codSie:" , form.value.codSie);
    const  dataAuth =  {username: localStorage.getItem('username'), password: localStorage.getItem('password')};
    if(String(form.value.codSie).length === 8){
        const res = await  Auth.listUnidadesEducativasPorDirector(dataAuth); 
      const data = res?.data.data.find( (ue: any) => ue.codigo_sie === Number(localStorage.getItem('codigo_sie'))  ); 
      if(data){
        form.value.unidadEducativa = data.nombre_unidad_educativa ;  
        form.value.director = data.nombre_director + ' ' + data.ap_paterno_director + ' ' + data.ap_materno_director  ; 
        form.value.departamentoId = data.departamento_codigo;
        form.value.departamentoNombre = data.departamento;
        form.value.municipioNombre = data.distrito ;   
        form.value.nivel = data.nivel;
        form.value.modalidad = data.dependencia;
        find.value = true;
        institucionEducativa.value = data;
       // console.log("form.value.codSie.length: ", form.value.codSie.length);
        }
    } else {
        institucionEducativa.value = null;
        find.value = false;
        form.value.departamentoId = null;
        form.value.departamentoNombre = '';
        form.value.municipioId = null;
        form.value.municipioNombre = '';
        form.value.unidadEducativa = '';
        form.value.nivel = '';
        form.value.modalidad = '';
        form.value.director = '';
        console.warn("No se encontró ninguna institución educativa para el SIE:", form.value.codSie); 
    }
}; 

const findMiembrosComisionConstruccion = async () => {
   // console.log(form.value.codSie);
    if(String(form.value.codSie).length === 8){
        const res = await ConvivenciaPacifica.findMiembrosComisionConstruccion(form.value.codSie);
    //    console.log("findMiembrosComisionConstr res: ", res);
        // 1. Verificar si hay datos
        if (res.data && res.data.length > 0) {
            // 2. Preparar los "buckets" para agrupar los nombres
            const grupos = {
                // Comisión Construcción (tipo 1)
                const_1: [], // Estudiantes
                const_2: [], // Director
                const_3: [], // Maestro
                const_4: [], // Padres
                const_5: [], // Otros
                // Comisión Aprobación (tipo 2)
                aprob_1: [], // Estudiantes
                aprob_2: [], // Director
                aprob_3: [], // Maestro
                aprob_4: [], // Padres
                aprob_5: []  // Otros
            };
            // 3. Iterar y agrupar los nombres
            res.data.forEach((miembro: any) => {
                const { id_comision_tipo, id_miembro_tipo, nombres_miembro } = miembro;
                if (id_comision_tipo === TIPO_COMISION_CONSTRUCCION) { // Construcción
                    if (id_miembro_tipo === 1) grupos.const_1.push(nombres_miembro);
                    else if (id_miembro_tipo === 2) grupos.const_2.push(nombres_miembro);
                    else if (id_miembro_tipo === 3) grupos.const_3.push(nombres_miembro);
                    else if (id_miembro_tipo === 4) grupos.const_4.push(nombres_miembro);
                    else if (id_miembro_tipo === 5) grupos.const_5.push(nombres_miembro);
                } else if (id_comision_tipo === TIPO_COMISION_APROBACION) { // Aprobación
                    if (id_miembro_tipo === 1) grupos.aprob_1.push(nombres_miembro);
                    else if (id_miembro_tipo === 2) grupos.aprob_2.push(nombres_miembro);
                    else if (id_miembro_tipo === 3) grupos.aprob_3.push(nombres_miembro);
                    else if (id_miembro_tipo === 4) grupos.aprob_4.push(nombres_miembro);
                    else if (id_miembro_tipo === 5) grupos.aprob_5.push(nombres_miembro);
                }
            });
            // 4. Asignar los nombres concatenados y activar checkboxes
            // --- Comisión Construcción ---
            form.value.comisionSocializacionEstudianteNombre = grupos.const_1.join(', ');
            form.value.comisionSocializacionEstudiante = grupos.const_1.length > 0;
            form.value.comisionSocializacionDirectorNombre = grupos.const_2.join(', ');
            form.value.comisionSocializacionDirector = grupos.const_2.length > 0;
            form.value.comisionSocializacionMaestroNombre = grupos.const_3.join(', ');
            form.value.comisionSocializacionMaestro = grupos.const_3.length > 0;
            form.value.comisionSocializacionPadreNombre = grupos.const_4.join(', ');
            form.value.comisionSocializacionPadre = grupos.const_4.length > 0;
            form.value.comisionSocializacionOtroNombre = grupos.const_5.join(', ');
            form.value.comisionSocializacionOtro = grupos.const_5.length > 0;
            // --- Comisión Aprobación ---
            form.value.comisionAprobacionEstudianteNombre = grupos.aprob_1.join(', ');
            form.value.comisionAprobacionEstudiante = grupos.aprob_1.length > 0;
            form.value.comisionAprobacionDirectorNombre = grupos.aprob_2.join(', ');
            form.value.comisionAprobacionDirector = grupos.aprob_2.length > 0;
            form.value.comisionAprobacionMaestroNombre = grupos.aprob_3.join(', ');
            form.value.comisionAprobacionMaestro = grupos.aprob_3.length > 0;
            form.value.comisionAprobacionPadreNombre = grupos.aprob_4.join(', ');
            form.value.comisionAprobacionPadre = grupos.aprob_4.length > 0;
            form.value.comisionAprobacionOtroNombre = grupos.aprob_5.join(', ');
            form.value.comisionAprobacionOtro = grupos.aprob_5.length > 0;
            // 5. Asignar datos generales (fechas, etc.)
            // Se toma del primer registro, ya que es igual en todos
            const dataMaestra = res.data[0];
            let dateParts = (dataMaestra.fecha_registro || '').split("T");
            dateParts = (dateParts[0]).split("-");
            form.value.fecha = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
            dateParts = (dataMaestra.fecha_aprobacion || '').split("T");
            dateParts = (dateParts[0]).split("-");
            form.value.fechaAprobacion = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
            form.value.vigenciaAprobacion = dataMaestra.vigencia_aprobacion;
            form.value.registroAnterior = dataMaestra.check_diagnostico_pcpa;
            // Guarda todos los datos recibidos, no solo el primero
            miembrosComisionConstruccion.value = res.data; 
        } else {
            // Si res.data está vacío o nulo
            miembrosComisionConstruccion.value = null;
        }
    } else {
        miembrosComisionConstruccion.value = null;
        find.value = false;
        form.value.departamentoId = null;
        form.value.departamentoNombre = '';
        form.value.municipioId = null;
        form.value.municipioNombre = '';
        form.value.unidadEducativa = '';
        form.value.nivel = '';
        form.value.modalidad = '';
        form.value.director = '';
    }
};

const findActividadesPromocion = async () => {
    console.log('form.value.codSie : ', form.value.codSie);
    const res = await ConvivenciaPacifica.findActividadesPromocion(form.value.codSie);
    console.log("findActividadesPromocion res: ", res);
       actividadesPromocion.value = res.data;        
   // console.table(actividadesPromocion.value); // O si prefieres una forma más compacta:
    res.data.map((data: {  nivel: number; id_pcpa_actividades_tipo: number; 
                        }, index:  number) => {
       //  console.log("id_pcpa_actividades_tipo: ", data.id_pcpa_actividades_tipo  )        
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_PRINCIPAL && data.id_pcpa_actividades_tipo===1  ){// temaDerecho
            form.value.id_temaDerecho= res.data[index].id_actividades_promocion  ;     
            form.value.temaDerecho= res.data[index].check_actividad_tipo ;      }
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_PRINCIPAL && data.id_pcpa_actividades_tipo===2  ){   
			form.value.id_temaNorma       = res.data[index].id_actividades_promocion        ; 		  
			form.value.temaNorma          = res.data[index].check_actividad_tipo        ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_PRINCIPAL && data.id_pcpa_actividades_tipo===3  ){   // PROCEDIMIENTOS DISCIPLINARIOS
			form.value.id_temaDisciplinario= res.data[index].id_actividades_promocion; 		 
			form.value.temaDisciplinario   = res.data[index].check_actividad_tipo;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_PRINCIPAL && data.id_pcpa_actividades_tipo===4  ){ 
			form.value.id_temaSancion     = res.data[index].id_actividades_promocion      ; 		      
			form.value.temaSancion        = res.data[index].check_actividad_tipo      ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_PRINCIPAL && data.id_pcpa_actividades_tipo===5  ){  
			form.value.id_temaAdopcion    = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaAdopcion       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_PRINCIPAL && data.id_pcpa_actividades_tipo===6  ){   
			form.value.id_temaAlternativo = res.data[index].id_actividades_promocion  ; 		      
			form.value.temaAlternativo    = res.data[index].check_actividad_tipo  ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_PRINCIPAL && data.id_pcpa_actividades_tipo===7  ){  
			form.value.id_temaRemision    = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaRemision       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_PRINCIPAL && data.id_pcpa_actividades_tipo===8  ){ 
			form.value.id_temaTaller      = res.data[index].id_actividades_promocion       ; 		        
			form.value.temaTaller         = res.data[index].check_actividad_tipo       ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_PRINCIPAL && data.id_pcpa_actividades_tipo===9  ){    // ACTIVIDADES PARA PROMOVER LA CONVIVENCIA PACÍFICA
			form.value.id_temaPromover    = res.data[index].id_actividades_promocion     ; 		          
			form.value.temaPromover       = res.data[index].check_actividad_tipo     ; }
          //  form.value.nivel_temaPromover      = res.data[index].nivel     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_PRINCIPAL && data.id_pcpa_actividades_tipo===10  ){  
			form.value.id_temaSeguimiento  = res.data[index].id_actividades_promocion  ;        
			form.value.temaSeguimiento    = res.data[index].check_actividad_tipo  ;   }                                                               
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===1  ){ 
			form.value.id_temaPromover1    = res.data[index].id_actividades_promocion     ; 		       
			form.value.temaPromover1       = res.data[index].check_actividad_tipo     ;  
            form.value.nivel_temaPromover1       = res.data[index].nivel     ;  } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===2  ){  
			form.value.id_temaPromover2    = res.data[index].id_actividades_promocion     ; 		        
			form.value.temaPromover2       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===3  ){   
			form.value.id_temaPromover3      = res.data[index].id_actividades_promocion     ; 		        
			form.value.temaPromover3       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===4  ){ 
			form.value.id_temaPromover4    = res.data[index].id_actividades_promocion     ; 		          
			form.value.temaPromover4       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===5  ){  
			form.value.id_temaPromover5    = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaPromover5       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===6  ){  
			form.value.id_temaPromover6    = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaPromover6       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===7  ){   
			form.value.id_temaPromover7    = res.data[index].id_actividades_promocion     ; 		        
			form.value.temaPromover7       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===8  ){   
			form.value.id_temaPromover8      = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaPromover8       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===9  ){ 
			form.value.id_temaPromover9      = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaPromover9       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===10  ){   //  PROCEDIMIENTOS DISCIPLINARIOS
			form.value.id_temaDisciplinarioCorrectivo            = res.data[index].id_actividades_promocion                ; 	
			form.value.temaDisciplinarioCorrectivo               = res.data[index].check_actividad_tipo                ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===11  ){ 
			form.value.id_temaDisciplinarioProcedimientoMarco    = res.data[index].id_actividades_promocion        ; 		      
			form.value.temaDisciplinarioProcedimientoMarco       = res.data[index].check_actividad_tipo        ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===12  ){ 
			form.value.id_temaDisciplinarioProcedimientoAlternativo = res.data[index].id_actividades_promocion  ; 		  
			form.value.temaDisciplinarioProcedimientoAlternativo = res.data[index].check_actividad_tipo  ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel === NIVEL_ACTIVIDAD_SECUNDARIA && data.id_pcpa_actividades_tipo===13  ){  
			form.value.id_temaDisciplinarioLineamiento           = res.data[index].id_actividades_promocion               ; 		  
			form.value.temaDisciplinarioLineamiento              = res.data[index].check_actividad_tipo               ;   } 
           form.value.temaPromover = temaPromoverSync.value;
           // Sync temaDisciplinario parent based on any true sub-value
           form.value.temaDisciplinario = temaDisciplinarioSync.value;
     //  console.log('res.data[index]: ',res.data[index]);    
    });
}; 

const onDateInput = (event: any) => {
    // Remove non-numeric characters from the input
    const cleanedInput = event.target.value.replace(/\D/g, '');
    // Format the input as a date (DD-MM-YYYY)
    if (cleanedInput.length <= 2) {
        form.value.fecha = cleanedInput;
    } else if (cleanedInput.length <= 4) {
        form.value.fecha = cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2);
    } else if (cleanedInput.length <= 8) {
        form.value.fecha = cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2, 4) + '/' + cleanedInput.slice(4, 8);
    } else {
        form.value.fecha = cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2, 4) + '/' + cleanedInput.slice(4, 8);
    }
};

const onDateInputAprobacion = (event: any) => {
    // Remove non-numeric characters from the input
    const cleanedInput = event.target.value.replace(/\D/g, '');
    // Format the input as a date (DD-MM-YYYY)
    if (cleanedInput.length <= 2) {
        form.value.fechaAprobacion = cleanedInput;
    } else if (cleanedInput.length <= 4) {
        form.value.fechaAprobacion = cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2);
    } else if (cleanedInput.length <= 8) {
        form.value.fechaAprobacion = cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2, 4) + '/' + cleanedInput.slice(4, 8);
    } else {
        form.value.fechaAprobacion = cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2, 4) + '/' + cleanedInput.slice(4, 8);
    }
};

const validateForm = () => {
    validationErrors.value = {};
    if (!form.value.codSie || !form.value.unidadEducativa) validationErrors.value['codSie'] = true;
    else delete validationErrors.value['codSie'];
    if (!form.value.fecha || !validateDate(form.value.fecha)) validationErrors.value['fecha'] = true;
    else delete validationErrors.value['fecha'];
    if (!form.value.fechaAprobacion || !validateDate(form.value.fechaAprobacion)) validationErrors.value['fechaAprobacion'] = true;
    else delete validationErrors.value['fechaAprobacion'];
   //// if ( (!form.value.comisionSocializacionEstudiante && !form.value.comisionSocializacionEstudianteNombre) && (!form.value.comisionSocializacionDirector && !form.value.comisionSocializacionDirectorNombre)  && (!form.value.comisionSocializacionMaestro &&  !form.value.comisionSocializacionMaestroNombre) && (!form.value.comisionSocializacionPadre && !form.value.comisionSocializacionPadreNombre)  && (!form.value.comisionSocializacionOtro && !form.value.comisionSocializacionOtroNombre) ) validationErrors.value['comision'] = true;
   // else delete validationErrors.value['comision'];
    if (!form.value.temaDerecho && !form.value.temaNorma && !form.value.temaDisciplinario && !form.value.temaSancion && !form.value.temaAdopcion && !form.value.temaAlternativo && !form.value.temaRemision && !form.value.temaTaller && !form.value.temaPromover && !form.value.temaSeguimiento) validationErrors.value['tema'] = true;
    else delete validationErrors.value['tema'];
    if(form.value.temaPromover){
        if (!form.value.temaPromover1 && !form.value.temaPromover2 && !form.value.temaPromover3 && !form.value.temaPromover4 && !form.value.temaPromover5 && !form.value.temaPromover6 && !form.value.temaPromover7 && !form.value.temaPromover8 && !form.value.temaPromover9) validationErrors.value['temaPromover'] = true;
        else delete validationErrors.value['temaPromover'];
    }
    //   if ( (!form.value.comisionAprobacionEstudiante && !form.value.comisionAprobacionEstudianteNombre) && (!form.value.comisionAprobacionDirector && !form.value.comisionAprobacionDirectorNombre)  && (!form.value.comisionAprobacionMaestro &&  !form.value.comisionAprobacionMaestroNombre) && (!form.value.comisionAprobacionPadre && !form.value.comisionAprobacionPadreNombre)  && (!form.value.comisionAprobacionOtro && !form.value.comisionAprobacionOtroNombre) ) validationErrors.value['comision'] = true;
  // else delete validationErrors.value['comisionAprobacion'];
    if (!form.value.vigenciaAprobacion) validationErrors.value['vigenciaAprobacion'] = true;
    else delete validationErrors.value['vigenciaAprobacion'];
    if (!form.value.validado) validationErrors.value['validado'] = true;
    else delete validationErrors.value['validado'];
     Object.keys(validationErrors.value).forEach(key => {
            if (validationErrors.value[key] === true) {
                console.log(`Campo ${key} sin dato ingresado : vacio= `, validationErrors.value[key]);
                toast.error(`Campo ${key} sin dato ingresado`, { 
                autoClose: 3500,    position: toast.POSITION.TOP_RIGHT,  });
            } 
        });
    return !Object.keys(validationErrors.value).length;
};

const recargarPagina = () => { //   7]
    console.log('recargarPagina .');
    isFormDisabled.value = false; // Habilita "Actividades" y "Registrar"
    // isFormDisabledFromNew se mantiene 'true', deshabilitando "Comisiones"
   window.location.href = '/convivencia/pacifica/desarrollo'; 
};

// ===== WATCHERS =====
watch(() => registroExiste.value, (nuevoValor) => {
  console.log('registroExiste cambió a:', nuevoValor);
});

watch(
  () => ({
    registroExiste: registroExiste.value,
    isFormDisabled: isFormDisabled.value
  }),
  (nuevosValores) => {
    console.log('Valores actuales:');
    console.log('- registroExiste:', nuevosValores.registroExiste);
    console.log('- isFormDisabled:', nuevosValores.isFormDisabled);
  },
  { deep: true } // Necesario cuando se watchea un objeto
);

// para subir archivos
/*const selectedFile = ref(null);
const uploadMessage = ref('');
const uploadFile = async () => {
    if (!selectedFile.value) return;
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    try{
        const response = await axios.post('http://localhost:3000/uploud',formData, {
            headers:{
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}
*/
</script>

<template>
    <v-row>
        <v-col cols="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Registro de datos</v-card-title>
                        <div class="d-flex align-center">
                            <v-progress-circular v-if="isLoading" indeterminate color="primary" size="24" class="mr-4"></v-progress-circular>
                            
                            <v-btn v-if="!registroExiste && !isLoading" color="primary" class="ml-2" @click="iniciarNuevoRegistro" flat>
                                Ingresar nuevo registro
                            </v-btn>
<div class="mt-2 text-caption">__registroExiste: {{ registroExiste }}</div>
                            <v-btn v-if="registroExiste && !isLoading" color="info" class="ml-2" @click="modificarRegistro"  flat>
                                Modificar registro
                            </v-btn>
<div class="mt-2 text-caption">__ disabled=isFormDisabled  {{ isFormDisabled }}</div>  
                        </div>
                    </div>

                    <v-form v-model="valid" class="mt-4">
                        <v-container>
                            <v-row>
                                <!-- Datos de Unidad Educativa -->
                                <v-col cols="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos de Unidad Educativa</span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.codSie" :counter="8" label="SIE" required hide-details  :readonly="true"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="8">
                                    <v-text-field v-model="form.unidadEducativa" label="Unidad Educativa" hide-details  :readonly="true"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.departamentoNombre" label="Departamento" hide-details   :readonly="true"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.municipioNombre" label="Distrito" hide-details  :readonly="true"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.nivel" label="Nivel" hide-details  :readonly="true"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.modalidad" label="Modalidad" hide-details  :readonly="true"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="8">
                                    <v-text-field v-model="form.director" label="Director" hide-details  :readonly="true"></v-text-field>
                                </v-col>

                                <!-- Construcción del PCPA -->
                                <v-col cols="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100">Construcción del PCPA</span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.fecha" label="Fecha de registro" @input="onDateInput" placeholder="DD/MM/AAAA" :disabled="isFormDisabled" hide-details required></v-text-field>
                                </v-col>
                                <v-col cols="12" md="8">
                                    <v-checkbox v-model="form.registroAnterior" label="¿Se realizó un diagnóstico antes de iniciar la construcción del PCPA?" :disabled="isFormDisabled" required></v-checkbox>
                                </v-col>
                                
                                <!-- Miembros de la comisión de construcción -->
                                <v-col cols="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100">Miembros de la comisión de construcción del PCPA.</span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionSocializacionEstudiante" label="Estudiantes" :disabled="isFormDisabledFromNew"  ></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionSocializacionEstudianteNombre" label="Nombre" hide-details :disabled="!form.comisionSocializacionEstudiante || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionSocializacionDirector" label="Director(a)" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionSocializacionDirectorNombre" label="Nombre" hide-details :disabled="!form.comisionSocializacionDirector || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionSocializacionMaestro" label="Maestro(a)" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionSocializacionMaestroNombre" label="Nombre" hide-details :disabled="!form.comisionSocializacionMaestro || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionSocializacionPadre" label="Padres/Madres" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionSocializacionPadreNombre" label="Nombre" hide-details :disabled="!form.comisionSocializacionPadre || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionSocializacionOtro" label="Otros" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionSocializacionOtroNombre" label="Nombre" hide-details :disabled="!form.comisionSocializacionOtro || isFormDisabledFromNew"></v-text-field>
                                </v-col>

                                <!-- Temas que aborda el Plan -->
                                <v-col cols="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100">Temas que aborda el Plan de Convivencia Pacífica y Armónica</span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-checkbox v-model="form.temaDerecho" label="Derechos y deberes" :disabled="isFormDisabled" required></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-checkbox v-model="form.temaNorma" label="Normas de conducta" :disabled="isFormDisabled" required></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-checkbox v-model="form.temaPromover" label="Actividades para promover la convivencia pacífica" :disabled="isFormDisabled" required></v-checkbox>
                                    <v-row class="pl-10 secondarybg" v-if="form.temaPromover">
                                        <v-col cols="12">
                                            <v-checkbox v-model="form.temaPromover1" label="Movilización social" :disabled="isFormDisabled" required></v-checkbox>
                                            <v-checkbox v-model="form.temaPromover2" label="Fomento al desarrollo de habilidades y práctica de valores" :disabled="isFormDisabled" required></v-checkbox>
                                            <v-checkbox v-model="form.temaPromover3" label="Capacitación" :disabled="isFormDisabled" required></v-checkbox>
                                            <v-checkbox v-model="form.temaPromover4" label="Medidas de seguridad en la infraestructura" :disabled="isFormDisabled" required></v-checkbox>
                                            <v-checkbox v-model="form.temaPromover5" label="Normas de convivencia en la unidad educativa" :disabled="isFormDisabled" required></v-checkbox>
                                            <v-checkbox v-model="form.temaPromover6" label="Promoción de la participación de las y los estudiantes" :disabled="isFormDisabled" required></v-checkbox>
                                            <v-checkbox v-model="form.temaPromover7" label="Gestión y articulación con la comunidad educativa" :disabled="isFormDisabled" required></v-checkbox>
                                            <v-checkbox v-model="form.temaPromover8" label="Acción comunal" :disabled="isFormDisabled" required></v-checkbox>
                                            <v-checkbox v-model="form.temaPromover9" label="Acciones para reducción de riesgos en el contexto y en la unidad educativa" :disabled="isFormDisabled" required></v-checkbox>
                                        </v-col>
                                    </v-row>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-checkbox v-model="form.temaDisciplinario" label="Procedimientos disciplinarios" :disabled="isFormDisabled" required></v-checkbox>
                                    <v-row class="pl-10 secondarybg" v-if="form.temaDisciplinario">
                                        <v-col cols="12">
                                            <v-checkbox v-model="form.temaDisciplinarioCorrectivo" label="CORRECTIVOS PEDAGÓGICOS" :disabled="isFormDisabled" required></v-checkbox>
                                            <v-checkbox v-model="form.temaDisciplinarioProcedimientoMarco" label="PROCEDIMIENTO MARCO PARA LA ADOPCIÓN DE DECISIONES DISCIPLINARIAS" :disabled="isFormDisabled" required></v-checkbox>
                                            <v-checkbox v-model="form.temaDisciplinarioProcedimientoAlternativo" label="PROCEDIMIENTOS ALTERNATIVOS PARA LA SOLUCIÓN DE CONFLICTOS" :disabled="isFormDisabled" required></v-checkbox>
                                            <v-checkbox v-model="form.temaDisciplinarioLineamiento" label="LINEAMIENTOS PARA LA REMISIÓN DE INFORMES SOBRE CASOS DE VIOLENCIA" :disabled="isFormDisabled" required></v-checkbox>
                                        </v-col>
                                    </v-row>
                                </v-col>

                                <!-- Miembros de la comisión que aprueba -->
                                <v-col cols="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100">Miembros de la comisión que aprueba el PCPA</span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionAprobacionEstudiante" label="Estudiantes" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionAprobacionEstudianteNombre" label="Nombre" hide-details :disabled="!form.comisionAprobacionEstudiante || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionAprobacionDirector" label="Director(a)" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionAprobacionDirectorNombre" label="Nombre" hide-details :disabled="!form.comisionAprobacionDirector || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionAprobacionMaestro" label="Maestro(a)" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionAprobacionMaestroNombre" label="Nombre" hide-details :disabled="!form.comisionAprobacionMaestro || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionAprobacionPadre" label="Padres/Madres" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionAprobacionPadreNombre" label="Nombre" hide-details :disabled="!form.comisionAprobacionPadre || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionAprobacionOtro" label="Otros" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionAprobacionOtroNombre" label="Nombre" hide-details :disabled="!form.comisionAprobacionOtro || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="form.fechaAprobacion" label="Fecha de aprobación" @input="onDateInputAprobacion" placeholder="DD/MM/AAAA" :disabled="isFormDisabledFromNew" hide-details required></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="form.vigenciaAprobacion" label="Tiempo de vigencia (1 a 3 años)" type="number" :disabled="isFormDisabled" hide-details required></v-text-field>
                                </v-col>
                                
                                <!-- Adjuntar archivos -->
                                <v-col cols="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100">Adjuntar archivos</span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="6">
                                     <v-form @submit.prevent="uploadFilePlan">
                                        <v-file-input
                                            label="Adjuntar su Plan de convivencia (PDF)"
                                            v-model="selectedFilePlan"
                                            accept=".pdf"
                                            prepend-icon="mdi-paperclip"
                                            outlined
                                            dense
                                            :disabled="isFormDisabled"
                                        ></v-file-input>
                                        <v-btn :disabled="!selectedFilePlan || isFormDisabled" color="primary" class="mt-4" type="submit">Subir Plan</v-btn>
                                        <v-alert v-if="uploadMessagePlan" type="success" class="mt-3">{{ uploadMessagePlan }}</v-alert>
                                    </v-form>
                                </v-col>
                                 <v-col cols="12" md="6">
                                    <v-form @submit.prevent="uploadFileDiagnostico">
                                        <v-file-input
                                            label="Adjuntar su diagnóstico de convivencia (PDF)"
                                            v-model="selectedFileDiagnostico"
                                            accept=".pdf"
                                            prepend-icon="mdi-paperclip"
                                            outlined
                                            dense
                                            :disabled="isFormDisabled"
                                        ></v-file-input>
                                        <v-btn :disabled="!selectedFileDiagnostico || isFormDisabled" color="primary" class="mt-4" type="submit">Subir Diagnóstico</v-btn>
                                        <v-alert v-if="uploadMessageDiagnostico" type="success" class="mt-3">{{ uploadMessageDiagnostico }}</v-alert>
                                    </v-form>
                                </v-col>

                                <!-- Declaración jurada y envío -->
                                <v-col cols="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100">Declaración jurada</span>
                                    </div>
                                </v-col>
                                <v-col cols="12">
                                    <v-checkbox v-model="form.validado" label="Declaro que todos los datos que he registrado son verídicos y que pueden ser validados por las autoridades del Ministerio de Educación" :disabled="isFormDisabled" required></v-checkbox>
                                </v-col>
                                <v-col cols="12" v-if="form.validado">
                                    <v-dialog v-model="dialog" persistent width="auto">
                                        <template v-slot:activator="{ props }">
                                            <v-btn size="large" rounded="pill" color="primary" class="rounded-pill" block type="button" flat v-bind="props" :disabled="isFormDisabled">Registrar</v-btn>
                                        </template>
                                        <v-card>
                                            <v-card-title class="text-h5">Confirmar</v-card-title>
                                            <v-card-text>¿ Está seguro de guardar el registro ?</v-card-text>
                                            <v-card-actions>
                                                <v-spacer></v-spacer>
                                                <v-btn color="grey-darken-1" variant="text" @click="dialog = false">Cancelar</v-btn>
                                                <v-btn color="green-darken-1" variant="text" @click="save">Aceptar</v-btn>
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
                Registro guardado correctamente.<br>  
                ¿Desea modificar el registro actual o salir del formulario?
                </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-lighten-2" variant="text" @click="recargarPagina">MODIFICAR REGISTRO</v-btn>
                <v-btn color="green-darken-1" variant="text" @click="router.push('/convivencia/pacifica')">SALIR</v-btn>   
               
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>




