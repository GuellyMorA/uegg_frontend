<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify'; // [cite: 203]
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica'; // [cite: 203]
import Auth from '@/services/Auth'; // [cite: 203]

// --- Tipos y Constantes ---

// IDs de Tipos de Comisión (de la BD) // [cite: 204]
const TIPO_COMISION_SOCIALIZACION = 3; // [cite: 205]
const TIPO_COMISION_IMPLEMENTACION = 4; // [cite: 205]

// IDs de Tipos de Miembro (de la BD) // [cite: 205]
const MIEMBRO_TIPO_MAP = { // [cite: 205]
    Estudiante: 1,
    Director: 2,
    Maestro: 3,
    Padre: 4,
    Otro: 5,
};

// IDs de Tipos de Actividad (de la BD) - Se mantiene para definir los tipos estáticos de cada slot // [cite: 206]
/*const ACTIVIDAD_TIPO_MAP = { // [cite: 206]
    actividad1: 11, // 'actividad1',
    actividad2: 12,
    actividad3: 13,
    actividad4: 14,
    actividad5: 15,
}; // [cite: 207]
*/

// Mapa de tipos de actividad (se llena dinámicamente desde la BD)
let ACTIVIDAD_TIPO_MAP: Record<string, number> = {};

// --- Interfaces de Tipos ---

/**
 * Define la estructura de un item en el v-select de actividades.
 */
interface ActividadTipoItem { // [cite: 208]
    id: number;
    name: string; // [cite: 209]
}

/**
 * Define la estructura de un miembro de comisión en el estado.
 */
interface MiembroComision { // [cite: 210]
    key: string; // 'Estudiante', 'Director', etc.
    tipoId: number; // [cite: 211]
    status: boolean; // El v-checkbox
    nombre: string; // [cite: 212]
    id: number | null; // [cite: 213]
}

/**
 * Define la estructura de una actividad en el estado.
 */
interface Actividad { // [cite: 214]
    key: string; // 'actividad1', 'actividad2', etc.
    tipoId: number; // [cite: 215]
    nombre: ActividadTipoItem | string | null; // [cite: 216]
    fecha: string; // El v-text-field (DD/MM/YYYY)
    id: number | null; // [cite: 217]
}

/**
 * Define la estructura completa del estado del formulario.
 */
interface FormState { // [cite: 218]
    sie: number | null;
    unidadEducativa: string;
    director: string; // [cite: 219]
    comisionSocializacion: MiembroComision[];
    comisionImplementacion: MiembroComision[];
    actividades: Actividad[];
    validado: boolean; // [cite: 220]
    
    // [NUEVO] Propiedades planas añadidas para la gestión de formulario
    // ... (Estas propiedades planas deben definirse si se usan en el template, ej: actividad1, actividad1Fecha)
    // Se asume que las propiedades planas están definidas implícitamente en el FormState en la implementación real
    // por la forma en que se usan en registro() y mapearFormularioDesdeActividades().
    [key: string]: any;
}


// --- Helpers para Estado Inicial ---

/**
 * Crea un objeto MiembroComision por defecto.
 */
const createDefaultMiembro = (key: string, tipoId: number, status = false, nombre = ''): MiembroComision => ({ // [cite: 222]
    key,
    tipoId,
    status,
    nombre,
    id: null
}); // [cite: 223]

/**
 * Crea un objeto Actividad por defecto.
 */
const createDefaultActividad = (key: string, tipoId: number, nombre: ActividadTipoItem | null = null, fecha = ''): Actividad => ({
    key,
    tipoId,
    nombre,
    fecha,
    id: null
}); // [cite: 224]

/**
 * Genera el estado inicial del formulario, respetando los valores por defecto del script original.
 */
const getDefaultFormState = (): FormState => { // [cite: 225]
    
    // Se inicializa 'nombre' a null o string vacío ya que la lista de opciones es dinámica
    // y no podemos garantizar que el objeto exista al cargar.

    return {
        sie: null,
        unidadEducativa: '',
        director: '',
        validado: false,

        // Miembros de la comisión SOCIALIZACION 
        comisionSocializacion: [ // [cite: 228]
            createDefaultMiembro('Estudiante', MIEMBRO_TIPO_MAP.Estudiante, true, 'Estudiante1 SOC,Estudiante2  SOC'),
            createDefaultMiembro('Director', MIEMBRO_TIPO_MAP.Director, true, 'Director1 soc, Director2 socializacion'),
            createDefaultMiembro('Maestro', MIEMBRO_TIPO_MAP.Maestro, false, ''),
            createDefaultMiembro('Padre', MIEMBRO_TIPO_MAP.Padre, false, ''),
            createDefaultMiembro('Otro', MIEMBRO_TIPO_MAP.Otro, false, ''),
        ],

        // Miembros de la comisión IMPLEMENTACIÓN // [cite: 228]
        comisionImplementacion: [ // [cite: 229]
            createDefaultMiembro('Estudiante', MIEMBRO_TIPO_MAP.Estudiante, false, 'Estudiante1 imp,Estudiante2 imp'),
            createDefaultMiembro('Director', MIEMBRO_TIPO_MAP.Director, false, 'Director1 Implementación, Director2 Implementación'),
            createDefaultMiembro('Maestro', MIEMBRO_TIPO_MAP.Maestro, false, ''),
            createDefaultMiembro('Padre', MIEMBRO_TIPO_MAP.Padre, false, ''),
            createDefaultMiembro('Otro', MIEMBRO_TIPO_MAP.Otro, false, ''),
        ],

        // Actividades de Ejecución // [cite: 229]
        actividades: [ // [cite: 230]
            // Inicializamos con nombre a null, el valor será cargado por findActividadesEjecutadas
            createDefaultActividad('actividad1', ACTIVIDAD_TIPO_MAP.actividad1, null, ''), 
            createDefaultActividad('actividad2', ACTIVIDAD_TIPO_MAP.actividad2, null, ''),
            createDefaultActividad('actividad3', ACTIVIDAD_TIPO_MAP.actividad3, null, ''),
            createDefaultActividad('actividad4', ACTIVIDAD_TIPO_MAP.actividad4, null, ''),
            createDefaultActividad('actividad5', ACTIVIDAD_TIPO_MAP.actividad5, null, ''),
        ]
    }; // [cite: 231]
};


// --- Estado Reactivo ---

const router = useRouter(); // [cite: 231]
const valid = ref(false); // [cite: 232]
const dialog = ref(false); // [cite: 232]
const dialogSave = ref(false); // [cite: 232]
const validationErrors = ref<Record<string, boolean>>({}); // [cite: 232]
const find = ref(false); // [cite: 232]
const isLoading = ref(true); // [cite: 232]
const institucionEducativa = ref<any>(null); // [cite: 233]
const form = ref<FormState>(getDefaultFormState()); // [cite: 233]
const constId = ref<number | null>(null); // [cite: 233]

// [NUEVO] Lista de tipos de actividades cargados dinámicamente
const actividadTipos = ref<ActividadTipoItem[]>([]); 

// Estado de la UI // [cite: 234]
const registroExiste = ref(localStorage.getItem('existeMiembro') === 'true'); // [cite: 234]
const isFormDisabled = ref(true); // [cite: 234]
const isFormDisabledFromNew = ref(true); // [cite: 235]

// Variables
let username: string = ''; // [cite: 235]
let dataUE = JSON.parse(localStorage.getItem('dataUE') || '[{}]'); // [cite: 236]
const idUE = ref(dataUE[0].id) || null; // [cite: 236]
const existeCiAndCodSie= ref<any | null>(null); 

// Reglas // [cite: 237]
const sieRules = [ // [cite: 237]
    (value: any) => !!value || 'El SIE es requerido', // [cite: 238]
    (value: any) => (String(value)?.length === 8) || 'El código SIE requiere 8 dígitos.', // [cite: 239]
];

// --- Ciclo de Vida ---

onMounted(async () => { // [cite: 239]
    await loadInitialData(); // [cite: 240]
});


/**
 * Orquesta la carga de datos iniciales.
 */
const loadInitialData = async () => { // [cite: 240]
    isLoading.value = true; // [cite: 241]
    username = localStorage.getItem("username") || ""; // [cite: 241]
    let user = JSON.parse(localStorage.getItem('user') || '{}'); // [cite: 241]
    if (!user || !user.codigo_sie) { // [cite: 242]
        isLoading.value = false; // [cite: 242]
        toast.error('Usuario no válido o sin SIE asignado.', { autoClose: 3000 }); // [cite: 243]
        return;
    }

    form.value.sie = user.codigo_sie; // [cite: 243]
    try {
        // 1. Cargar datos críticos de la UE y ID de Construcción
        await findUeByCiAndCodSie(); // [cite: 244]
        constId.value = await findConstByCiAndUe(); // [cite: 245]
        await findMiembrosByCodSie();
        console.info('Iniciando procesamiento de API... constId.value: ', constId.value); // [cite: 246]

        if (!constId.value) { // [cite: 248]
            toast.warn('No se encontró registro de construcción PCPA. No se puede cargar ni guardar.', { autoClose: 4000 }); // [cite: 248]
            isLoading.value = false; // [cite: 249]
            isFormDisabled.value = true; // [cite: 249]
            isFormDisabledFromNew.value = true; // [cite: 249]
            return; // [cite: 250]
        }

        // [NUEVO] 2. Cargar Tipos de Actividad (debe ser lo primero)
        await loadActividadTipos(); 

        // 3. Cargar el resto de los datos en paralelo
        await Promise.all([ // [cite: 250]
            findUnidadesEducativasPorDirector(),
            findMiembroComision(),
            findActividadesEjecutadas()
        ]); // [cite: 251]

        // 4. Ajustar estado de la UI // [cite: 252]
        if (registroExiste.value) { // [cite: 252]
            isFormDisabled.value = true; // [cite: 252]
            isFormDisabledFromNew.value = true; // [cite: 253]
        } else {
            isFormDisabled.value = false; // [cite: 253]
            isFormDisabledFromNew.value = false; // [cite: 254]
        }

    } catch (error) { // [cite: 254]
        console.error("Error al cargar datos iniciales:", error); // [cite: 255]
        toast.error('Error al cargar datos iniciales.', { autoClose: 3000 }); // [cite: 255]
    } finally {
        isLoading.value = false; // [cite: 256]
    }
};




// --- Carga de Datos (API) ---

/**
 * Define la estructura de un item en el v-select de actividades (necesario para el tipado).
 */

interface ActividadTipoItem {
    id: number;
    name: string;
}

interface SavedActividad {
    id_actividades_ejecutadas: number; // La PK de la fila guardada
    id_pcpa_actividades_tipo: number;       // El ID del tipo de actividad
    fec_actividad: string;         // La fecha guardada
    // ... otros campos
}

// Asume que 'actividadTipos' y 'formatFecha' están disponibles.
// const actividadTipos = ref<ActividadTipoItem[]>([]); 

/**
 * Carga y mapea los tipos de actividades para los v-select.
 * Mapea 'desc_actividad' a 'name' y añade una opción vacía con ID 0.
 */
const loadActividadTipos = async () => {
    try {
        const res = await ConvivenciaPacifica.getActividadTipo();

        if (res.status === 200 && Array.isArray(res.data)) {
            
            // 💡 Filtrar solo los IDs del 11 al 15
            const filteredData = res.data.filter(
                (item: any) => item.id >= 11 && item.id <= 15
            );

            // 💡 Mapear 'desc_actividad' a 'name' (necesario para item-title="name")
            const mappedData: ActividadTipoItem[] = filteredData
                .filter((item: any) => item.desc_actividad) 
                .map((item: any) => ({
                    id: item.id,
                    name: item.desc_actividad, 
            }));

            // 💡 Añadir la opción vacía con ID 0 para evitar conflictos con la actividad real ID=1
            const emptyOption: ActividadTipoItem = { id: 0, name: '' };
            actividadTipos.value = mappedData; //[emptyOption, ...mappedData]; 
            
        } else {
            toast.error('Tipos de Actividad no encontrados.', { autoClose: 3000 });
        }
    } catch (error) {
        console.error("❌ Error al cargar Tipos de Actividad:", error);
        toast.error('Error al cargar Tipos de Actividad.', { autoClose: 3000 });
    }
};



/**
 * Carga las actividades guardadas y las puebla en el estado del formulario 
 * utilizando el helper populateActividadesFromData.
 */
const findActividadesEjecutadas = async () => {
    // Si el SIE no está en el formulario, salimos
    if (!form.value.sie) return; 

    try {
        // Asume que la API devuelve un arreglo de SavedActividad[] en res.data
        const res = await ConvivenciaPacifica.findActividadesEjecutadas(form.value.sie); 

        if (res.data && res.data.length > 0) {
            
            // 1. Marcar que el registro existe para inhabilitar campos (si aplica)
            registroExiste.value = true;
            isFormDisabled.value = true; // Agregado para mantener coherencia con el helper

            console.log('findActividadesEjecutadas...data: ', res.data); 
            
            // 2. Usar el helper para poblar los campos dinámicos (actividad1, actividad1Fecha, etc.)
            // El helper se encarga de:
            // - Iterar sobre res.data.
            // - Buscar el objeto completo de actividad en actividadTipos.value.
            // - Asignar el objeto al v-select (form.actividadX).
            // - Asignar la fecha formateada (form.actividadXFecha).
            // - Guardar el PK de la fila (form.actividadesIds).
            populateActividadesFromData(res.data); 
            
            // Se elimina toda la lógica interna del forEach, ya que el helper la maneja.
            // Se elimina la llamada a mapearFormularioDesdeActividades() ya que el helper 
            // puebla directamente form.value.
            
            console.log("✅ Actividades cargadas y mapeadas al formulario:", form.value); 
            
        } else {
            console.log("ℹ️ No se encontraron actividades ejecutadas para este SIE.");
        }
    } catch (error) { 
        console.error("❌ Error en findActividadesEjecutadas:", error); 
        toast.error('Error al buscar actividades.', { autoClose: 3000 }); 
    }
};


/**
 * Helper específico para poblar los v-select de Actividades (actividad1, actividad2, etc.)
 * y sus campos de fecha correspondientes, usando el array de actividades guardadas.
 * * @param items Array de objetos de actividades guardadas desde la API (e.g., SavedActividad[])
 */
const populateActividadesFromData = (
    items: SavedActividad[]
) => {
    
    if (!items || items.length === 0) {
        return;
    }

    // 1. Establecer el estado del formulario como "registro existente"
    if (!registroExiste.value) {
        registroExiste.value = true;
        isFormDisabled.value = true;
    }

    // 2. Inicializar el contenedor para guardar los PKs
    if (!form.value.actividadesIds) {
        form.value.actividadesIds = {};
    }

    items.forEach((item: SavedActividad, index: number) => {
        // Solo procesamos las actividades que tienen un campo definido en el formulario (actividad1 a actividad5)
        if (index >= 5) {
            return;
        }

        // --- Mapeo de campos del Formulario ---
        const formActivityKey = `actividad${index + 1}`; // e.g., 'actividad1'
        const formDateKey =  `${item.desc_actividades_ejecutadas}Fecha`;// `${formActivityKey}Fecha`;    // e.g., 'actividad1Fecha'
        
        // --- 1. Obtener el ID de la actividad guardada ---
        const savedActivityTypeId = item.id_pcpa_actividades_tipo;

        // --- 2. Buscar el OBJETO completo en la lista de opciones ---
        // Esto es necesario porque el v-select con 'return-object' espera el objeto completo.
        const matchingActivity = (actividadTipos.value || []).find(
            (act: ActividadTipoItem) => act.id === savedActivityTypeId
        );

        if (matchingActivity) {
            
            // 3. Asignar el objeto completo al v-select (form.actividadX)
            (form.value as any)[item.desc_actividades_ejecutadas] = matchingActivity; //  formActivityKey
            
            // 4. Asignar la fecha formateada al text-field (form.actividadXFecha)
            const dateValue = item.fec_actividad;
            if (dateValue) {
                // Asegúrate de que formatFecha convierta de ISO/DB a DD/MM/AAAA
                (form.value as any)[formDateKey] = formatFecha(dateValue); 
            }

            // 5. Guardar el ID (PK) de la fila guardada para la actualización/modificación
            form.value.actividadesIds[formActivityKey] = item.id_actividades_ejecutadas;
        } else {
             // Si no se encuentra, asignar nulo o la opción vacía, pero mantener el PK si existe
             (form.value as any)[formActivityKey] = null; 
             form.value.actividadesIds[formActivityKey] = item.id_actividades_ejecutadas;
        }
    });
};



// ... (rest of findUeByCiAndCodSie, findConstByCiAndUe, findUnidadesEducativasPorDirector, findMiembroComision, mapearFormularioDesdeComision) ...

// --- Carga de Datos (API) ---

/**
 * Carga los datos de la UE (Director, Nombre, etc.)
 */
const findUnidadesEducativasPorDirector = async () => { // [cite: 21]
    const dataAuth = { username: localStorage.getItem('username'), password: localStorage.getItem('password') }; // [cite: 22]

    if (String(form.value.sie).length !== 8) {
        console.warn("SIE no válido para buscar UE."); // [cite: 24]
        return;
    }

    try {
        const res = await Auth.listUnidadesEducativasPorDirector(dataAuth);
        const data = res?.data.data.find((ue: any) => ue.codigo_sie === Number(localStorage.getItem('codigo_sie'))); // [cite: 25]
         console.log('findUnidadesEducativasPorDirector...data: ', data);
        if (data) {
            form.value.unidadEducativa = data.nombre_unidad_educativa;
            form.value.director = `${data.nombre_director} ${data.ap_paterno_director} ${data.ap_materno_director}`; // [cite: 26]
            // ... poblar otros campos del form si es necesario
            find.value = true; // [cite: 27]
            institucionEducativa.value = data;
        } else {
            console.warn("No se encontró ninguna institución educativa para el SIE:", form.value.sie); // [cite: 28]
            find.value = false; // [cite: 28]
        }
    } catch (error) {
        console.error("Error en findUnidadesEducativasPorDirector:", error);
        toast.error('Error al buscar la unidad educativa.', { autoClose: 3000 }); // [cite: 29]
    }
};

/**
 * Carga los miembros de comisión guardados y los puebla en el estado.
 */
const findMiembroComision = async () => { // [cite: 30]
    if (!form.value.sie) return;

    try {
        const res = await ConvivenciaPacifica.findMiembrosComisionConstruccion(form.value.sie);

        if (res.data && res.data.length > 0) {
          //  registroExiste.value = true;
             localStorage.setItem('existeEnBD', 'true')
            // Helper para poblar el array del formulario
            const populateMiembros = (formArray: MiembroComision[], comisionTipoId: number) => {
                formArray.forEach(miembro => {
                    const data = res.data.find((d: any) =>
                        d.id_comision_tipo === comisionTipoId && d.id_miembro_tipo === miembro.tipoId
                    ); // [cite: 32]
                      console.log('findMiembroComision...data: ', data);
                    if (data) {
                        miembro.status = true; // Si existe, el check está activo
                        miembro.nombre = data.nombres_miembro;
                        miembro.id = data.id_miembro; // [cite: 34]
                    }
                });
            };

            // Poblar ambas comisiones
            populateMiembros(form.value.comisionSocializacion, TIPO_COMISION_SOCIALIZACION);
            populateMiembros(form.value.comisionImplementacion, TIPO_COMISION_IMPLEMENTACION); // [cite: 35]

               // Ejecutar el mapeo
            mapearFormularioDesdeComision();
        }
    } catch (error) {
        console.error("Error en findMiembroComision:", error);
        toast.error('Error al buscar miembros de comisión.', { autoClose: 3000 }); // [cite: 39]
    }
};

// 🔹 Mapeo de los datos cargados a los campos individuales del template
const mapearFormularioDesdeComision = () => {
        // --- SOCIALIZACIÓN ---
        const estudianteSoc = form.value.comisionSocializacion.find((m) => m.key === "Estudiante");
        const directorSoc = form.value.comisionSocializacion.find((m) => m.key === "Director");
        const maestroSoc = form.value.comisionSocializacion.find((m) => m.key === "Maestro");
        const padreSoc = form.value.comisionSocializacion.find((m) => m.key === "Padre");
        const otroSoc = form.value.comisionSocializacion.find((m) => m.key === "Otro");

        form.value.comisionSocializacionEstudiante = estudianteSoc?.status || false;
        form.value.comisionSocializacionEstudianteNombre = estudianteSoc?.nombre || "";

        form.value.comisionSocializacionDirector = directorSoc?.status || false;
        form.value.comisionSocializacionDirectorNombre = directorSoc?.nombre || "";

        form.value.comisionSocializacionMaestro = maestroSoc?.status || false;
        form.value.comisionSocializacionMaestroNombre = maestroSoc?.nombre || "";

        form.value.comisionSocializacionPadre = padreSoc?.status || false;
        form.value.comisionSocializacionPadreNombre = padreSoc?.nombre || "";

        form.value.comisionSocializacionOtro = otroSoc?.status || false;
        form.value.comisionSocializacionOtroNombre = otroSoc?.nombre || "";

        // --- IMPLEMENTACIÓN ---
        const estudianteImp = form.value.comisionImplementacion.find((m) => m.key === "Estudiante");
        const directorImp = form.value.comisionImplementacion.find((m) => m.key === "Director");
        const maestroImp = form.value.comisionImplementacion.find((m) => m.key === "Maestro");
        const padreImp = form.value.comisionImplementacion.find((m) => m.key === "Padre");
        const otroImp = form.value.comisionImplementacion.find((m) => m.key === "Otro");

        form.value.comisionImplementacionEstudiante = estudianteImp?.status || false;
        form.value.comisionImplementacionEstudianteNombre = estudianteImp?.nombre || "";

        form.value.comisionImplementacionDirector = directorImp?.status || false;
        form.value.comisionImplementacionDirectorNombre = directorImp?.nombre || "";

        form.value.comisionImplementacionMaestro = maestroImp?.status || false;
        form.value.comisionImplementacionMaestroNombre = maestroImp?.nombre || "";

        form.value.comisionImplementacionPadre = padreImp?.status || false;
        form.value.comisionImplementacionPadreNombre = padreImp?.nombre || "";

        form.value.comisionImplementacionOtro = otroImp?.status || false;
        form.value.comisionImplementacionOtroNombre = otroImp?.nombre || "";
      };


   

/**
 * Busca el ID de la UE.
 */
const findUeByCiAndCodSie = async () => { // [cite: 111]
    try {
        const payload = {
            codSie: localStorage.getItem('codigo_sie') || '',
            username: localStorage.getItem('username') || ''
        };

        const res = await ConvivenciaPacifica.findUeByCiAndCodSie(payload); // [cite: 112]
  console.log('Respuesta de findUeByCiAndCodSie →', res);
 if (res.status === 200 && res.data && res.data.length >= 1) { // [cite: 113-114]
      existeCiAndCodSie.value = res.data || [];
   
        localStorage.setItem('existeEnBD', 'true');
        localStorage.setItem('dataUE', JSON.stringify(existeCiAndCodSie.value));
              dataUE = res.data; // Actualiza la variable local
            idUE.value = dataUE[0].id; // Actualiza el ID de UE
          return true;

      } else {
        localStorage.setItem('existeEnBD', 'false');
        localStorage.setItem('dataUE', JSON.stringify([{ id: 0 }]));
        idUE.value = 0;    
      toast.error('No se encontró una UE para el Director', {
        autoClose: 3000,        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }

    } catch (error) {
        console.error('❌ Error en findUeByCiAndCodSie:', error);
        toast.error('Error de conexión con el servidor (UE).', { autoClose: 3000 }); // [cite: 119]
    }
};

/**
 * Busca el ID de Construcción.
 */
const findConstByCiAndUe = async (): Promise<number | null> => { // [cite: 120]
    try {
        const payload = { idUE: idUE.value, username: username };
        const res = await ConvivenciaPacifica.findConstByCiAndUe(payload); // [cite: 122]

        if (res.status === 200 && res.data && res.data.length > 0) { // [cite: 123]
            if (res.data.length === 1) {
                localStorage.setItem('idConst', res.data[0].id);
                return res.data[0].id; // Retorna el ID
            } else {
                localStorage.setItem('idConst', '0');
                toast.warn('Se encontraron múltiples o ninguna construcción para esta UE.', { autoClose: 3500 }); // [cite: 126]
                return null;
            }
        } else {
            toast.error('No se encontró una construcción para la UE', { autoClose: 3500 }); // [cite: 127]
            return null;
        }
    } catch (error) {
        console.error("Error en findConstByCiAndUe:", error);
        toast.error('Error de conexión al buscar ID de construcción.', { autoClose: 3500 }); // [cite: 129]
        return null;
    }
};

// --- Lógica de Guardado (API) ---

/**
 * Función principal de guardado.
 */
const registro = async () => { // [cite: 98]
    console.log(`Iniciando guardado (Existe: ${registroExiste.value})`);
    if (!validateForm()) { // [cite: 99]
        dialog.value = false;
        toast.info('Debe ingresar los datos requeridos', { autoClose: 3000 }); // [cite: 100]
        return;
    }

   
      isLoading.value = true;
    isFormDisabled.value = true;
    // Asumo que esta variable también existe
    if (isFormDisabledFromNew) isFormDisabledFromNew.value = true;// Deshabilitar todo al guardar

   try {
        // 1. Obtener constId (asumiendo que ya lo tienes en constId.value)
        if (!constId.value) {
                toast.error('Error crítico: No hay ID de construcción. No se puede guardar.', { autoClose: 3000 });
            throw new Error('No se pudo encontrar el ID de construcción para la UE.');
        }

        // 2. [EL ARREGLO ESTÁ AQUÍ]
        // Re-construir los arrays desde el 'form' plano, basado en [cite: 94-97]

        // Construir Miembros de Socialización
        const socializacionMiembros = [
            { tipoId: 1, status: form.value.comisionSocializacionEstudiante, value: form.value.comisionSocializacionEstudianteNombre, id: form.value.comisionSocializacionEstudianteId },
            { tipoId: 2, status: form.value.comisionSocializacionDirector, value: form.value.comisionSocializacionDirectorNombre, id: form.value.comisionSocializacionDirectorId },
            { tipoId: 3, status: form.value.comisionSocializacionMaestro, value: form.value.comisionSocializacionMaestroNombre, id: form.value.comisionSocializacionMaestroId },
            { tipoId: 4, status: form.value.comisionSocializacionPadre, value: form.value.comisionSocializacionPadreNombre, id: form.value.comisionSocializacionPadreId },
            { tipoId: 5, status: form.value.comisionSocializacionOtro, value: form.value.comisionSocializacionOtroNombre, id: form.value.comisionSocializacionOtroId }
        ]; //[cite: 94-95]

        // Construir Miembros de Implementación
        const implementacionMiembros = [
            { tipoId: 1, status: form.value.comisionImplementacionEstudiante, value: form.value.comisionImplementacionEstudianteNombre, id: form.value.comisionImplementacionEstudianteId },
            { tipoId: 2, status: form.value.comisionImplementacionDirector, value: form.value.comisionImplementacionDirectorNombre, id: form.value.comisionImplementacionDirectorId },
            { tipoId: 3, status: form.value.comisionImplementacionMaestro, value: form.value.comisionImplementacionMaestroNombre, id: form.value.comisionImplementacionMaestroId },
            { tipoId: 4, status: form.value.comisionImplementacionPadre, value: form.value.comisionImplementacionPadreNombre, id: form.value.comisionImplementacionPadreId },
            { tipoId: 5, status: form.value.comisionImplementacionOtro, value: form.value.comisionImplementacionOtroNombre, id: form.value.comisionImplementacionOtroId }
        ]; //[cite: 95]

        // ¡Corrección clave!
        // Creamos el array 'activities' usando las variables planas
        // y la propiedad 'nombre' que 'syncActividades' espera.
        const activities: Actividad[] = [ // (Asumiendo que tienes la Interfaz 'Actividad' definida)
            { key: 'actividad1', tipoId: 11, nombre: form.value.actividad1, fecha: form.value.actividad1Fecha, id: form.value.actividad1Id },
            { key: 'actividad2', tipoId: 12, nombre: form.value.actividad2, fecha: form.value.actividad2Fecha, id: form.value.actividad2Id },
            { key: 'actividad3', tipoId: 13, nombre: form.value.actividad3, fecha: form.value.actividad3Fecha, id: form.value.actividad3Id },
            { key: 'actividad4', tipoId: 14, nombre: form.value.actividad4, fecha: form.value.actividad4Fecha, id: form.value.actividad4Id },
            { key: 'actividad5', tipoId: 15, nombre: form.value.actividad5, fecha: form.value.actividad5Fecha, id: form.value.actividad5Id }
        ];
        

        // 3. Ejecutar todas las sincronizaciones en paralelo
        await Promise.all([
            syncComisionMiembros(socializacionMiembros, 3, constId.value), // 3 = Socialización
            syncComisionMiembros(implementacionMiembros, 4, constId.value), // 4 = Implementación
            syncActividades( constId.value) // <-- Pasamos el array recién creado
        ]);


        // Éxito
        toast.success('Registros guardados correctamente', { autoClose: 3000 }); // [cite: 106]
        dialog.value = false;
        dialogSave.value = true;
      //  registroExiste.value = true; // El registro ahora existe
           localStorage.setItem('existeEnBD', 'true')
        // Recargar datos para obtener nuevos IDs y estados
        await findMiembroComision();
        await findActividadesEjecutadas(); // [cite: 108]
  //await findMiembrosByCodSie();
    } catch (error: any) {
        console.error("Error al guardar:", error);
        toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`, { autoClose: 3000 }); // [cite: 109]
        // Permitir reintentar si falla
        isFormDisabled.value = false;
        // La lógica original // [cite: 17] mantiene los campos de comisión deshabilitados al "modificar",
        // así que isFormDisabledFromNew se queda en 'true'.
    } finally {
        isLoading.value = false; // [cite: 110]
    }
};



const findMiembrosByCodSie = async () => {
  try {
    form.value.codSie = localStorage.getItem('codigo_sie') || '';

    const res = await ConvivenciaPacifica.findMiembrosComisionConstruccion(form.value.codSie);
    console.log('Respuesta de listMiembrosComision →', res);

    if (res.status === 200) {
      existeCiAndCodSie.value = res.data || [];

      if (existeCiAndCodSie.value.length >= 1) {
        localStorage.setItem('existeMiembro', 'true');
        localStorage.setItem('existeMiembroTipo', 'true');
       // localStorage.setItem('dataUE', JSON.stringify(existeCiAndCodSie.value));
      } else {
        localStorage.setItem('existeMiembro', 'false');
        localStorage.setItem('existeMiembroTipo', JSON.stringify([{ id: 0 }]));
      }
  console.log('existeMiembro : ', localStorage.getItem('existeMiembro'));  
      return true;
    } else {
      toast.error('No se encontró una miembro para la UE', {
        autoClose: 3000,
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }

  } catch (error) {
    console.error('❌ Error en listMiembrosComision:', error);
    toast.error('Error de conexión con el servidor. listMiembrosComision', {
      autoClose: 3000,
      position: toast.POSITION.TOP_RIGHT,
    });
    return false;
  }
};


/**
 * Sincroniza (Crea/Actualiza) los miembros de una comisión.
 */
const syncComisionMiembros = async (miembros: MiembroComision[], comisionTipoId: number, constId: number) => { // [cite: 72-73]
    const promises: Promise<any>[] = [];

    for (const [index, member] of miembros.entries()) {
        const payload: any = {
            id_pcpa_construccion: constId,
            id_pcpa_comision_tipo: comisionTipoId,
            id_pcpa_miembro_tipo: member.tipoId,
            orden: index + 1,
            nombres_miembro: member.nombre || '', // [cite: 74-75]
            apellidos_miembro: '',
            check_miembro_comision: member.status,
        };

        if (member.status && member.nombre) { // [cite: 76]
            // Si tiene estado y valor, es una creación o actualización
            if (member.id) {
                // Actualizar
                payload.estado = 'MODIFICADO'; // [cite: 77]
                payload.usu_mod = username;
                payload.fec_mod = new Date(); // [cite: 78]
                promises.push(ConvivenciaPacifica.updateMiembroComision(member.id, payload)); // [cite: 78]
            } else {
                // Crear
                payload.estado = 'ACTIVO';
                payload.usu_cre = username;
                payload.fec_cre = new Date(); // [cite: 81]
                promises.push(ConvivenciaPacifica.createMiembroComision(payload)); // [cite: 81]
            }
        } else if (!member.status && member.id) {
            // [LOGICA ORIGINAL] La eliminación está comentada en el script original // [cite: 81-82]
            // promises.push(ConvivenciaPacifica.deleteMiembroComision(member.id));
        }
    }
    return Promise.all(promises);
};

/**
 * Sincroniza (Crea/Actualiza/Desactiva) las actividades ejecutadas.
 * Itera sobre los campos planos del formulario (actividad1, actividad2, etc.).
 */
const syncActividades = async (constId: number) => { 
    const promises: Promise<any>[] = []; 
    // Los 5 slots de actividad que esperamos en el formulario
    const formKeys = ['actividad1', 'actividad2', 'actividad3', 'actividad4', 'actividad5']; 

    // Helper para obtener el PK del registro guardado
    const getOldActivityId = (key: string) => form.value.actividadesIds?.[key] || null;

    for (const key of formKeys) { 
        // 1. Obtener los valores del formulario
        const activityObject = (form.value as any)[key] as ActividadTipoItem | null;
        const dateString = (form.value as any)[`${key}Fecha`] as string | null;
        const oldActivityId = getOldActivityId(key); // PK de la fila guardada

        // 2. Determinar el estado de los datos
        const actividadTipoId: number | null = activityObject?.id || null;
        const fechaISO = parseDate(dateString || '');
        
        // El registro tiene datos válidos si tiene un tipo de actividad seleccionado Y una fecha.
        const hasValidData = actividadTipoId !== null && !!fechaISO;
        // El registro existía si tenemos un ID (PK) guardado.
        const existedInOldData = !!oldActivityId;

        console.log(`Actividad ${key} | PK: ${oldActivityId} | Tiene Datos: ${hasValidData}`); 

        // 3. Construir el Payload base para CREATE/UPDATE/DEACTIVATE
        const payload: any = { 
            id_pcpa_actividades_tipo: actividadTipoId,
            id_pcpa_construccion: constId,
            desc_actividad: key, //activityObject?.name || null,
            fec_actividad: fechaISO,
        }; 
        
        // --- Lógica de Sincronización (CREATE / UPDATE / DEACTIVATE) ---
        
        if (hasValidData) {
            // Caso 1: Tiene datos válidos (CREATE o UPDATE)
            
            if (existedInOldData) { 
                // A. ACTUALIZAR: Ya existía y tiene datos
                console.log(`Actualizando actividad ${key} con ID: ${oldActivityId}`);
                payload.estado = 'MODIFICADO'; // o 'ACTIVO' según la lógica de tu API
                payload.usu_mod = username; 
                payload.fec_mod = new Date(); 
                promises.push(ConvivenciaPacifica.updateSocializacion(oldActivityId, payload)); 
            } else { 
                // B. CREAR: No existía y tiene datos
                console.log(`Creando nueva actividad ${key}`); 
                payload.estado = 'ACTIVO'; 
                payload.usu_cre = username; 
                payload.fec_cre = new Date(); 
                promises.push(ConvivenciaPacifica.createSocializacion(payload)); 
            }
        
        } else if (existedInOldData) { 
            // Caso 2: No tiene datos válidos, pero existía (DEACTIVATE)
            
            // Esto ocurre si se borra el v-select y/o el campo de fecha.
            console.log(`Desactivando actividad ${key} con ID: ${oldActivityId}`); 
            
            payload.estado = 'INACTIVO'; 
            payload.usu_mod = username; 
            payload.fec_mod = new Date(); 
            
            // Usamos el ID existente (PK) para enviar la desactivación.
            promises.push(ConvivenciaPacifica.updateSocializacion(oldActivityId, payload)); 
            
        } else { 
            // Caso 3: No tiene datos válidos y no existía (IGNORAR)
            console.log(`Ignorando slot ${key}: vacío.`);
        }
    }
    
    // Ejecutar todas las promesas de forma concurrente
    return Promise.all(promises); 
};


// --- Control de UI y Formulario ---

/**
 * Habilita el formulario para un nuevo registro.
 */
const iniciarNuevoRegistro = () => { // [cite: 16]
    console.log('Ingresar nuevo registro clickeado.');
    isFormDisabled.value = false;
    isFormDisabledFromNew.value = false; // Habilita *todo*
    reset(); // Limpia el formulario
};

/**
 * Habilita el formulario para modificar un registro existente.
 */
const modificarRegistro = () => { // [cite: 17]
    console.log('Modificar registro.');
    isFormDisabled.value = false; // Habilita "Actividades" y "Registrar"
    // isFormDisabledFromNew se mantiene 'true', deshabilitando "Comisiones"
};

/**
 * Valida el formulario antes de guardar.
 */
/**
 * Valida el formulario antes de guardar.
 */
const validateForm = (): boolean => {
    validationErrors.value = {};

    const formData = form.value;

    // 🔹 Buscar propiedades del objeto que empiecen con "actividad"
    const actividadKeys = Object.keys(formData).filter(k => k.startsWith('actividad') && !k.endsWith('Fecha'));

    // 🔹 Validar si al menos una tiene "name" distinto de null o vacío
    const hasAnyActivity = actividadKeys.some(key => {
        const actividad = formData[key];
        return (
            actividad &&
            typeof actividad === 'object' &&
            actividad.name &&
            actividad.name.trim() !== ''
        );
    });

    if (!hasAnyActivity) {
        validationErrors.value['actividad'] = true;
    }

    // 🔹 Validar que si una actividad tiene "name", también tenga su "Fecha" correspondiente
    actividadKeys.forEach(key => {
        const actividad = formData[key];
        const fechaKey = `${key}Fecha`; // ej. "actividad1Fecha"
        const fecha = formData[fechaKey];

        const hasValidName =
            actividad &&
            typeof actividad === 'object' &&
            actividad.name &&
            actividad.name.trim() !== '';

        if (hasValidName && (!fecha || fecha.trim() === '')) {
            validationErrors.value[key] = true;
        }
    });

    return Object.keys(validationErrors.value).length === 0;
};


/**
 * Resetea el formulario a su estado inicial.
 */
const reset = () => { // [cite: 64]
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

    dialogSave.value = false;
    registroExiste.value = false;
};



// --- Funciones Utilitarias ---

/**
 * Helper para formatear fecha de 'YYYY-MM-DD...' a 'DD/MM/YYYY'
 */
const formatFecha = (fecha: string): string => { // [cite: 41]
    if (!fecha) return '';
    const dateParts = fecha.split("T")[0].split("-"); // Asume YYYY-MM-DD
    if (dateParts.length === 3) {
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // DD/MM/YYYY
    }
    return '';
};

/**
 * Convierte fecha DD/MM/YYYY a ISO String
 */
const parseDate = (dateString: string): string | null => { // [cite: 69-70]
    if (!dateString || dateString.length !== 10) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null; // [cite: 71]
    // parts[2] = YYYY, parts[1] = MM, parts[0] = DD
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
};

/**
 * Formatea el texto del input de fecha.
 */
const XXformatAndCleanDate = (cleanedInput: string): string => { // [cite: 49]
    if (cleanedInput.length <= 2) {
        return cleanedInput;
    } else if (cleanedInput.length <= 4) { // [cite: 50]
        return `${cleanedInput.slice(0, 2)}/${cleanedInput.slice(2)}`;
    }
    const truncatedInput = cleanedInput.slice(0, 8);
    return `${truncatedInput.slice(0, 2)}/${truncatedInput.slice(2, 4)}/${truncatedInput.slice(4, 8)}`; // [cite: 52]
};


// ... (rest of mapearFormularioDesdeActividades, registro, syncComisionMiembros) ...


  // 🔹 Mapeo a los campos individuales del formulario (como en el template)
const XXXmapearFormularioDesdeActividades = () => {
        const setActividad = (key: string, index: number) => {
          const act = form.value.actividades.find((a) => a.key === key);
          if (!act) return;

          // Ejemplo: form.value.actividad1 = {id: 2, name: "..."} o null
          form.value[`actividad${index}`] = act.nombre || null;
          form.value[`actividad${index}Fecha`] = act.fecha || "";
        };

        setActividad("actividad1", 1);
        setActividad("actividad2", 2);
        setActividad("actividad3", 3);
        setActividad("actividad4", 4);
        setActividad("actividad5", 5);
      };



// ... (rest of the script) ...

const onDateInput = (event: any) => {
  let value = event.target.value.replace(/\D/g, "");

  if (value.length > 2 && value.length <= 4) {
    value = value.replace(/^(\d{2})(\d+)/, "$1/$2");
  } else if (value.length > 4) {
    value = value.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
  }

  value = value.substring(0, 10);
  event.target.value = value;

  // Validar día, mes y año básico
  const [day, month, year] = value.split("/").map(Number);
  if (month > 12 || day > 31 || year < 1900 || year > 2100) {
    console.warn("⚠️ Fecha inválida:", value);
  }
};

</script>


<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Socialización e implementación </v-card-title>
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
                            
                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.sie" :rules="sieRules" :counter="8" label="SIE" required hide-details :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.unidadEducativa" :counter="10" label="Unidad Educativa" hide-details required :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Socialización</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="12">
                                Miembros de la comisión de socialización del PCPA
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionEstudiante" label="Estudiantes" :disabled="isFormDisabledFromNew"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionEstudianteNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionEstudiante || isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionDirector" label="Director(a)" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionDirectorNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionDirector || isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionMaestro" label="Maestro(a)" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionMaestroNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionMaestro || isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionPadre" label="Padres/Madres" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionPadreNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionPadre || isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionOtro" label="Otros" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionOtroNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionOtro || isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Implementación</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="12">
                                Miembros de la comisión
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionImplementacionEstudiante" label="Estudiantes" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionImplementacionEstudianteNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionImplementacionEstudiante || isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionImplementacionDirector" label="Director(a)" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionImplementacionDirectorNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionImplementacionDirector || isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionImplementacionMaestro" label="Maestro(a)" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionImplementacionMaestroNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionImplementacionMaestro || isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionImplementacionPadre" label="Padres/Madres" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionImplementacionPadreNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionImplementacionPadre || isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionImplementacionOtro" label="Otros" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionImplementacionOtroNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionImplementacionOtro || isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Actividades de Socialización del Plan de Convivencia Pacífica y Armónica</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="2" >
                                Actividad 1
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-select v-model="form.actividad1" :items="actividadTipos" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.actividad1Fecha" label="Fecha"  @input="onDateInput" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                Actividad 2
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-select v-model="form.actividad2" :items="actividadTipos" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.actividad2Fecha" label="Fecha"  @input="onDateInput" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                Actividad 3
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-select v-model="form.actividad3" :items="actividadTipos" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.actividad3Fecha" label="Fecha"  @input="onDateInput" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                Actividad 4
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-select v-model="form.actividad4" :items="actividadTipos" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.actividad4Fecha" label="Fecha"  @input="onDateInput" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                Actividad 5
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-select v-model="form.actividad5" :items="actividadTipos" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.actividad5Fecha" label="Fecha"  @input="onDateInput" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
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
                                            <v-btn color="green-darken-1" variant="text" @click="registro"> Aceptar </v-btn>
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
            <v-card-text>Registro guardado. ¿Ingresar uno nuevo o modificar el actual?</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red-darken-1" variant="text" @click="router.push('/convivencia/pacifica')">MODIFICAR REGISTRO</v-btn>
                <v-btn color="green-darken-1" variant="text" @click="reset">NUEVO REGISTRO</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>



