<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import Auth from '@/services/Auth';

// ===== INTERFACES Y TIPOS =====
interface ActividadTipoItem {
    id: number;
    name: string;
}

interface MiembroComision {
    key: string;
    tipoId: number;
    status: boolean;
    nombre: string;
    id: number | null;
}

interface Actividad {
    key: string;
    tipoId: number;
    nombre: ActividadTipoItem | string | null;
    fecha: string;
    id: number | null;
}

interface FormState {
    username: string;
    idUE: string;
    codSie: string;
    sie: number | null;
    unidadEducativa: string;
    director: string;
    comisionSocializacion: MiembroComision[];
    comisionImplementacion: MiembroComision[];
    actividades: Actividad[];
    validado: boolean;
    [key: string]: any;
}

interface SavedActividad {
    id_actividades_ejecutadas: number;
    id_pcpa_actividades_tipo: number;
    fec_actividad: string;
    desc_actividades_ejecutadas: string;
}

// ===== CONSTANTES =====
const TIPO_COMISION_SOCIALIZACION = 3;
const TIPO_COMISION_IMPLEMENTACION = 4;
const MIEMBRO_TIPO_MAP = {
    Estudiante: 1,
    Director: 2,
    Maestro: 3,
    Padre: 4,
    Otro: 5,
};

// ===== REFERENCIAS REACTIVAS =====
const router = useRouter();
const valid = ref(false);
const dialog = ref(false);
const dialogSave = ref(false);
const validationErrors = ref<Record<string, boolean>>({});
const find = ref(false);
const institucionEducativa = ref<any>(null);
const actividadTipos = ref<ActividadTipoItem[]>([]);
const miembrosComisionConstruccion = ref<any[]>([]);
// ===== ESTADO DE LA UI =====
const username = ref(localStorage.getItem('username') || '');
const existeMiembro =  ref(false);  // ref(localStorage.getItem('existeMiembro') === 'true');
const registroExiste = ref( localStorage.getItem('existeEnBD')==='true' ? true : false  );  
const isFormDisabled =  ref(true);  // ref(registroExiste.value);
const isFormDisabledFromNew = ref(true);
const isLoading = ref(true);
const idUE = ref(localStorage.getItem('idUE'));
const constId = ref<number | null>(null);



const sieRules = [
    (value: any) => !!value || 'El SIE es requerido',
    (value: any) => (String(value)?.length === 8) || 'El código SIE requiere 8 dígitos.',
];

// ===== ESTADO DEL FORMULARIO =====
const form = ref<FormState>({
    username: '',
    idUE: '',
    codSie: '',
    sie: null,
    unidadEducativa: '',
    director: '',
    validado: false,
    comisionSocializacion: [
        { key: 'Estudiante', tipoId: MIEMBRO_TIPO_MAP.Estudiante, status: false, nombre: '', id: null },
        { key: 'Director', tipoId: MIEMBRO_TIPO_MAP.Director, status: false, nombre: '', id: null },
        { key: 'Maestro', tipoId: MIEMBRO_TIPO_MAP.Maestro, status: false, nombre: '', id: null },
        { key: 'Padre', tipoId: MIEMBRO_TIPO_MAP.Padre, status: false, nombre: '', id: null },
        { key: 'Otro', tipoId: MIEMBRO_TIPO_MAP.Otro, status: false, nombre: '', id: null },
    ],
    comisionImplementacion: [
        { key: 'Estudiante', tipoId: MIEMBRO_TIPO_MAP.Estudiante, status: false, nombre: '', id: null },
        { key: 'Director', tipoId: MIEMBRO_TIPO_MAP.Director, status: false, nombre: '', id: null },
        { key: 'Maestro', tipoId: MIEMBRO_TIPO_MAP.Maestro, status: false, nombre: '', id: null },
        { key: 'Padre', tipoId: MIEMBRO_TIPO_MAP.Padre, status: false, nombre: '', id: null },
        { key: 'Otro', tipoId: MIEMBRO_TIPO_MAP.Otro, status: false, nombre: '', id: null },
    ],
    actividades: [
        { key: 'actividad1', tipoId: 11, nombre: null, fecha: '', id: null },
        { key: 'actividad2', tipoId: 12, nombre: null, fecha: '', id: null },
        { key: 'actividad3', tipoId: 13, nombre: null, fecha: '', id: null },
        { key: 'actividad4', tipoId: 14, nombre: null, fecha: '', id: null },
        { key: 'actividad5', tipoId: 15, nombre: null, fecha: '', id: null },
    ]
});

// ===== UTILIDADES =====
const xxxcreateDefaultMiembro = (key: string, tipoId: number, status = false, nombre = ''): MiembroComision => ({
    key,
    tipoId,
    status,
    nombre,
    id: null
});

const xxxcreateDefaultActividad = (key: string, tipoId: number, nombre: ActividadTipoItem | null = null, fecha = ''): Actividad => ({
    key,
    tipoId,
    nombre,
    fecha,
    id: null
});

const formatFecha = (fecha: string): string => {
    if (!fecha) return '';
    const dateParts = fecha.split("T")[0].split("-");
    if (dateParts.length === 3) {
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    }
    return '';
};

const parseDate = (dateString: string): string | null => {
    if (!dateString || dateString.length !== 10) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
};

const onDateInput = (event: any) => {
    let value = event.target.value.replace(/\D/g, "");
    if (value.length > 2 && value.length <= 4) {
        value = value.replace(/^(\d{2})(\d+)/, "$1/$2");
    } else if (value.length > 4) {
        value = value.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
    }
    value = value.substring(0, 10);
    event.target.value = value;
    
    const [day, month, year] = value.split("/").map(Number);
    if (month > 12 || day > 31 || year < 1900 || year > 2100) {
        console.warn("⚠️ Fecha inválida:", value);
    }
};

// ===== CARGA DE DATOS INICIALES =====
onMounted(async () => {
    console.log('Ingresando con codSie y username : ', localStorage.getItem('codigo_sie'), localStorage.getItem('username'));
    await loadInitialData();
    console.log('==================================================================================');
    console.log('Ingresando con if= registroExiste y disabled= isFormDisabled y existeMiembro: ', registroExiste.value, isFormDisabled.value,existeMiembro.value);
    console.log('onMounted constId.value : ', constId.value);
});

const loadInitialData = async () => {
    isLoading.value = true;
    username.value = localStorage.getItem("username") || "";
    form.value.username = username.value;
    const codSie = localStorage.getItem('codigo_sie') || '';
    
    if (codSie) {
        form.value.codSie = codSie;
        try {
            // 1. Encontrar IDs críticos (idUE y idConst)
            idUE.value = await ConvivenciaPacifica.findUeByCiAndCodSieSetVariables(form.value);
            form.value.idUE = idUE.value || '';
            constId.value = await ConvivenciaPacifica.findIdConstByCiAndUeSetVariables(form.value);
            console.info('Iniciando procesamiento de API... constId.value: ', constId.value);
            
            if (!constId.value && constId.value >0 ) { 
                toast.warn('No se encontró registro de construcción PCPA. No se puede cargar ni guardar.', { autoClose: 4000 });
                isLoading.value = false;
                isFormDisabled.value = true;
                return;
            }
                    
            // 2. Cargar Tipos de Actividad
            await loadActividadTipos();
            
            // 3. Cargar datos en paralelo
            await Promise.all([
                findUnidadesEducativasPorDirector(),
                  findMiembrosComisionConstruccion(),
                findActividadesEjecutadas()
            ]);
            
      
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

// ===== MANEJO DE UI =====
const iniciarNuevoRegistro = () => {
    console.log('Ingresar nuevo registro clickeado.');
    isFormDisabled.value = false;
    isFormDisabledFromNew.value = false;
};

const modificarRegistro = () => {
    console.log('Modificar registro.');
    dialogSave.value = false;
    isFormDisabled.value = false;
};

const xxsave = async () => {
    console.log(`Iniciando guardado (registroExiste: ${registroExiste.value})`);
    
    if (!validateForm()) {
        dialog.value = false;
        toast.info('Debe ingresar los datos requeridos', { autoClose: 3000 });
        return;
    }
    
    if (isFormDisabledFromNew.value) isFormDisabledFromNew.value = true;
    
    try {
        if (!constId.value) {
            toast.error('Error crítico: No hay ID de construcción. No se puede guardar.', { autoClose: 3000 });
            throw new Error('No se pudo encontrar el ID de construcción para la UE.');
        }
        
        const socializacionMiembros = [
            { tipoId: 1, status: form.value.comisionSocializacionEstudiante, nombre: form.value.comisionSocializacionEstudianteNombre, id: form.value.comisionSocializacionEstudianteId },
            { tipoId: 2, status: form.value.comisionSocializacionDirector, nombre: form.value.comisionSocializacionDirectorNombre, id: form.value.comisionSocializacionDirectorId },
            { tipoId: 3, status: form.value.comisionSocializacionMaestro, nombre: form.value.comisionSocializacionMaestroNombre, id: form.value.comisionSocializacionMaestroId },
            { tipoId: 4, status: form.value.comisionSocializacionPadre, nombre: form.value.comisionSocializacionPadreNombre, id: form.value.comisionSocializacionPadreId },
            { tipoId: 5, status: form.value.comisionSocializacionOtro, nombre: form.value.comisionSocializacionOtroNombre, id: form.value.comisionSocializacionOtroId }
        ];
        
        const implementacionMiembros = [
            { tipoId: 1, status: form.value.comisionImplementacionEstudiante, nombre: form.value.comisionImplementacionEstudianteNombre, id: form.value.comisionImplementacionEstudianteId },
            { tipoId: 2, status: form.value.comisionImplementacionDirector, nombre: form.value.comisionImplementacionDirectorNombre, id: form.value.comisionImplementacionDirectorId },
            { tipoId: 3, status: form.value.comisionImplementacionMaestro, nombre: form.value.comisionImplementacionMaestroNombre, id: form.value.comisionImplementacionMaestroId },
            { tipoId: 4, status: form.value.comisionImplementacionPadre, nombre: form.value.comisionImplementacionPadreNombre, id: form.value.comisionImplementacionPadreId },
            { tipoId: 5, status: form.value.comisionImplementacionOtro, nombre: form.value.comisionImplementacionOtroNombre, id: form.value.comisionImplementacionOtroId }
        ];
        
        const activities: Actividad[] = [
            { key: 'actividad1', tipoId: 11, nombre: form.value.actividad1, fecha: form.value.actividad1Fecha, id: form.value.actividad1Id },
            { key: 'actividad2', tipoId: 12, nombre: form.value.actividad2, fecha: form.value.actividad2Fecha, id: form.value.actividad2Id },
            { key: 'actividad3', tipoId: 13, nombre: form.value.actividad3, fecha: form.value.actividad3Fecha, id: form.value.actividad3Id },
            { key: 'actividad4', tipoId: 14, nombre: form.value.actividad4, fecha: form.value.actividad4Fecha, id: form.value.actividad4Id },
            { key: 'actividad5', tipoId: 15, nombre: form.value.actividad5, fecha: form.value.actividad5Fecha, id: form.value.actividad5Id }
        ];
        
        await Promise.all([
            syncComisionMiembros(socializacionMiembros, TIPO_COMISION_SOCIALIZACION, constId.value),
            syncComisionMiembros(implementacionMiembros, TIPO_COMISION_IMPLEMENTACION, constId.value),
            syncActividades(constId.value)
        ]);
        
        toast.success('Registros guardados correctamente', { autoClose: 3000 });
        dialog.value = false;
        dialogSave.value = true;
        localStorage.setItem('existeEnBD', 'true');
        console.info("fin del guardar. existeEnBD:", localStorage.getItem('existeEnBD'));
        
    
        await findActividadesEjecutadas();
    } catch (error: any) {
        console.error("Error al guardar:", error);
        toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`, { autoClose: 3000 });
        isFormDisabled.value = false;
    } finally {
        isLoading.value = false;
    }
};
const save = async () => {
    console.log(`Iniciando guardado (registroExiste: ${registroExiste.value})`);

    if (!validateForm()) {
        dialog.value = false;
        toast.info('Debe ingresar los datos requeridos', { autoClose: 3000 });
        return;
    }

    if (isFormDisabledFromNew.value) isFormDisabledFromNew.value = true;

    try {
        if (!constId.value) {
            toast.error('Error crítico: No hay ID de construcción. No se puede guardar.', { autoClose: 3000 });
            throw new Error('No se pudo encontrar el ID de construcción para la UE.');
        }

        // === CONSTRUCCIÓN DE MAPAS DE MIEMBROS (con nombres múltiples por coma) ===
        const socializacionMap: Record<string, MiembroComision> = {
            '1': { status: form.value.comisionSocializacionEstudiante, value: form.value.comisionSocializacionEstudianteNombre },
            '2': { status: form.value.comisionSocializacionDirector, value: form.value.comisionSocializacionDirectorNombre },
            '3': { status: form.value.comisionSocializacionMaestro, value: form.value.comisionSocializacionMaestroNombre },
            '4': { status: form.value.comisionSocializacionPadre, value: form.value.comisionSocializacionPadreNombre },
            '5': { status: form.value.comisionSocializacionOtro, value: form.value.comisionSocializacionOtroNombre }
        };

        const implementacionMap: Record<string, MiembroComision> = {
            '1': { status: form.value.comisionImplementacionEstudiante, value: form.value.comisionImplementacionEstudianteNombre },
            '2': { status: form.value.comisionImplementacionDirector, value: form.value.comisionImplementacionDirectorNombre },
            '3': { status: form.value.comisionImplementacionMaestro, value: form.value.comisionImplementacionMaestroNombre },
            '4': { status: form.value.comisionImplementacionPadre, value: form.value.comisionImplementacionPadreNombre },
            '5': { status: form.value.comisionImplementacionOtro, value: form.value.comisionImplementacionOtroNombre }
        };

        // === ACTIVIDADES (se mantienen como antes) ===
        const xxxactivities: Actividad[] = [
            { key: 'actividad1', tipoId: 11, nombre: form.value.actividad1, fecha: form.value.actividad1Fecha, id: form.value.actividad1Id },
            { key: 'actividad2', tipoId: 12, nombre: form.value.actividad2, fecha: form.value.actividad2Fecha, id: form.value.actividad2Id },
            { key: 'actividad3', tipoId: 13, nombre: form.value.actividad3, fecha: form.value.actividad3Fecha, id: form.value.actividad3Id },
            { key: 'actividad4', tipoId: 14, nombre: form.value.actividad4, fecha: form.value.actividad4Fecha, id: form.value.actividad4Id },
            { key: 'actividad5', tipoId: 15, nombre: form.value.actividad5, fecha: form.value.actividad5Fecha, id: form.value.actividad5Id }
        ];

     await   syncActividades(constId.value);

        if(existeMiembro.value===false){
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

            // === SINCRONIZACIÓN PARALELA ===
            await Promise.all([
                procesarMiembros(socializacionMap, constId.value, TIPO_COMISION_SOCIALIZACION, ConvivenciaPacifica.createMiembroComision),
                procesarMiembros(implementacionMap, constId.value, TIPO_COMISION_IMPLEMENTACION, ConvivenciaPacifica.createMiembroComision),
            //  syncActividades(constId.value)
            ]);
        }
  
        toast.success('Registros guardados correctamente', { autoClose: 3000 });
        dialog.value = false;
        dialogSave.value = true;
        localStorage.setItem('existeEnBD', 'true');
        console.info("fin del guardar. existeEnBD:", localStorage.getItem('existeEnBD'));

      //  await findActividadesEjecutadas();
    } catch (error: any) {
        console.error("Error al guardar:", error);
        toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`, { autoClose: 3000 });
        isFormDisabled.value = false;
    } finally {
        isLoading.value = false;
    }
};

// ===== GESTIÓN DE MIEMBROS DE COMISIÓN =====
/**
 * Procesa un mapa de miembros de comisión, divide los nombres por coma y los crea en la BD.
 * @param {object} miembrosMap - El objeto (ej. comisionConstruccion.value)
 * @param {string | number} idConst - El ID del registro de construcción (pcpa_construccion)
 * @param {number} idComisionTipo - 1 para Construcción, 2 para Aprobación
 * @param {Function} apiCall - La función del servicio a llamar (ej. ConvivenciaPacifica.createMiembroComision)
 */
// (nueva lógica con múltiples nombres por coma) ===
const procesarMiembros = async (
    miembrosMap: Record<string, MiembroComision>,
    idConst: string | number,
    idComisionTipo: number,
    apiCall: Function
) => {
    const promesasCreacion: Promise<any>[] = [];
    const username = localStorage.getItem('username') || '';

    for (const [key, itemData] of Object.entries(miembrosMap)) {
        if (itemData.status && itemData.value) {
            const nombresArray = itemData.value
                .split(',')
                .map((name: string) => name.trim())
                .filter((name: string) => name.length > 0);

            const ordenBase = (parseInt(key) - 1) * 10;

            for (const [index, nombre] of nombresArray.entries()) {
                const payload = {
                    id_pcpa_construccion: idConst,
                    id_pcpa_comision_tipo: idComisionTipo,
                    id_pcpa_miembro_tipo: parseInt(key),
                    orden: ordenBase + index + 1,
                    nombres_miembro: nombre,
                    apellidos_miembro: '',
                    check_miembro_comision: itemData.status,
                    estado: 'ACTIVO',
                    usu_cre: username,
                    fec_cre: new Date()
                };
                promesasCreacion.push(apiCall(payload));
            }
        }
    }

    if (promesasCreacion.length > 0) {
        console.log(`Iniciando creación de ${promesasCreacion.length} miembros para comisión tipo ${idComisionTipo}...`);
        const resultados = await Promise.allSettled(promesasCreacion);
        let exitosos = 0;

        resultados.forEach((res, i) => {
            if (res.status === 'fulfilled' && res.value?.status === 201) {
                exitosos++;
                console.log(`Miembro ${i + 1} (Comisión ${idComisionTipo}) creado exitosamente.`);
            } else if (res.status === 'fulfilled') {
                console.warn(`Error al crear miembro ${i + 1}: Status ${res.value?.status}`);
            } else {
                console.error(`Fallo creación miembro ${i + 1}:`, res.reason);
            }
        });

        if (exitosos > 0) {
            toast.info(`Se guardaron ${exitosos} miembros para la comisión.`, { autoClose: 3500 });
        }
        if (exitosos < promesasCreacion.length) {
            toast.error(`Fallaron ${promesasCreacion.length - exitosos} guardados de miembros.`, { autoClose: 3500 });
        }
    }
};

const xxxfindMiembrosComisionConstruccion = async () => {
    if (!form.value.codSie) return;
    
    try {
        const res = await ConvivenciaPacifica.findMiembrosComisionConstruccion(form.value.codSie);
        if (res.data && res.data.length > 0) {
            localStorage.setItem('existeEnBD', 'true');
           

            const populateMiembros = (formArray: MiembroComision[], comisionTipoId: number) => {
                formArray.forEach(miembro => {
                    const data = res.data.find((d: any) =>
                        d.id_comision_tipo === comisionTipoId && d.id_miembro_tipo === miembro.tipoId
                    );
                    console.log('findMiembrosComisionConstruccion -> data: ', data);
                    if (data) {
                        miembro.status = true;
                        miembro.nombre = data.nombres_miembro;
                        miembro.id = data.id_miembro;

                         existeMiembro.value=true;
                    }
                });
            };
            
            populateMiembros(form.value.comisionSocializacion, TIPO_COMISION_SOCIALIZACION);
            populateMiembros(form.value.comisionImplementacion, TIPO_COMISION_IMPLEMENTACION);
            mapearFormularioDesdeComision();
        }
    } catch (error) {
        console.error("Error en findMiembroComision:", error);
        toast.error('Error al buscar miembros de comisión.', { autoClose: 3000 });
    }
};
// qwen
const findMiembrosComisionConstruccion = async () => {
    if (!form.value.codSie || String(form.value.codSie).length !== 8) {
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
        return;
    }

    try {
        const res = await ConvivenciaPacifica.findMiembrosComisionConstruccion(form.value.codSie);
        
        if (res.data && res.data.length > 0) {
            localStorage.setItem('existeEnBD', 'true');
            
            // 1. Preparar los "buckets" para agrupar los nombres
            const grupos = {
                // Comisión Socialización (tipo 3)
                soc_1: [], // Estudiantes
                soc_2: [], // Director
                soc_3: [], // Maestro
                soc_4: [], // Padres
                soc_5: [], // Otros
                // Comisión Implementación (tipo 4)
                imp_1: [], // Estudiantes
                imp_2: [], // Director
                imp_3: [], // Maestro
                imp_4: [], // Padres
                imp_5: []  // Otros
            };
            
            // 2. Iterar y agrupar los nombres
            res.data.forEach((miembro: any) => {
                const { id_comision_tipo, id_miembro_tipo, nombres_miembro } = miembro;
                if (id_comision_tipo === TIPO_COMISION_SOCIALIZACION) { // Socialización
                    if (id_miembro_tipo === 1) grupos.soc_1.push(nombres_miembro);
                    else if (id_miembro_tipo === 2) grupos.soc_2.push(nombres_miembro);
                    else if (id_miembro_tipo === 3) grupos.soc_3.push(nombres_miembro);
                    else if (id_miembro_tipo === 4) grupos.soc_4.push(nombres_miembro);
                    else if (id_miembro_tipo === 5) grupos.soc_5.push(nombres_miembro);
                     existeMiembro.value = true;
                } else if (id_comision_tipo === TIPO_COMISION_IMPLEMENTACION) { // Implementación
                    if (id_miembro_tipo === 1) grupos.imp_1.push(nombres_miembro);
                    else if (id_miembro_tipo === 2) grupos.imp_2.push(nombres_miembro);
                    else if (id_miembro_tipo === 3) grupos.imp_3.push(nombres_miembro);
                    else if (id_miembro_tipo === 4) grupos.imp_4.push(nombres_miembro);
                    else if (id_miembro_tipo === 5) grupos.imp_5.push(nombres_miembro);
                     existeMiembro.value = true;
                }
            });
            
            // 3. Asignar los nombres concatenados y activar checkboxes
            // --- Comisión Socialización ---
            form.value.comisionSocializacionEstudianteNombre = grupos.soc_1.join(', ');
            form.value.comisionSocializacionEstudiante = grupos.soc_1.length > 0;
            form.value.comisionSocializacionDirectorNombre = grupos.soc_2.join(', ');
            form.value.comisionSocializacionDirector = grupos.soc_2.length > 0;
            form.value.comisionSocializacionMaestroNombre = grupos.soc_3.join(', ');
            form.value.comisionSocializacionMaestro = grupos.soc_3.length > 0;
            form.value.comisionSocializacionPadreNombre = grupos.soc_4.join(', ');
            form.value.comisionSocializacionPadre = grupos.soc_4.length > 0;
            form.value.comisionSocializacionOtroNombre = grupos.soc_5.join(', ');
            form.value.comisionSocializacionOtro = grupos.soc_5.length > 0;
            
            // --- Comisión Implementación ---
            form.value.comisionImplementacionEstudianteNombre = grupos.imp_1.join(', ');
            form.value.comisionImplementacionEstudiante = grupos.imp_1.length > 0;
            form.value.comisionImplementacionDirectorNombre = grupos.imp_2.join(', ');
            form.value.comisionImplementacionDirector = grupos.imp_2.length > 0;
            form.value.comisionImplementacionMaestroNombre = grupos.imp_3.join(', ');
            form.value.comisionImplementacionMaestro = grupos.imp_3.length > 0;
            form.value.comisionImplementacionPadreNombre = grupos.imp_4.join(', ');
            form.value.comisionImplementacionPadre = grupos.imp_4.length > 0;
            form.value.comisionImplementacionOtroNombre = grupos.imp_5.join(', ');
            form.value.comisionImplementacionOtro = grupos.imp_5.length > 0;
            
            // 4. Asignar datos generales (fechas, etc.)
            const dataMaestra = res.data[0];
            let dateParts = (dataMaestra.fecha_registro || '').split("T");
            dateParts = (dateParts[0]).split("-");
            form.value.fecha = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
            dateParts = (dataMaestra.fecha_aprobacion || '').split("T");
            dateParts = (dateParts[0]).split("-");
            form.value.fechaAprobacion = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
            form.value.vigenciaAprobacion = dataMaestra.vigencia_aprobacion;
            form.value.registroAnterior = dataMaestra.check_diagnostico_pcpa;
            
            // Guarda todos los datos recibidos
            miembrosComisionConstruccion.value = res.data; 
          
        } else {
            // Si res.data está vacío o nulo
            miembrosComisionConstruccion.value = null;
          
        }
    } catch (error) {
        console.error("Error en findMiembrosComisionConstruccion:", error);
        toast.error('Error al buscar miembros de comisión.', { autoClose: 3000 });
    }
};

// ===== CARGA DE DATOS ESPECÍFICOS =====
const loadActividadTipos = async () => {
    try {
        const res = await ConvivenciaPacifica.getActividadTipo();
        if (res.status === 200 && Array.isArray(res.data)) {
            const filteredData = res.data.filter((item: any) => item.id >= 11 && item.id <= 15);
            const mappedData: ActividadTipoItem[] = filteredData
                .filter((item: any) => item.desc_actividad)
                .map((item: any) => ({
                    id: item.id,
                    name: item.desc_actividad,
                }));
            actividadTipos.value = mappedData;
        } else {
            toast.error('Tipos de Actividad no encontrados.', { autoClose: 3000 });
        }
    } catch (error) {
        console.error("❌ Error al cargar Tipos de Actividad:", error);
        toast.error('Error al cargar Tipos de Actividad.', { autoClose: 3000 });
    }
};

const findActividadesEjecutadas = async () => {
    if (!form.value.codSie) return;
    
    try {
        const res = await ConvivenciaPacifica.findActividadesEjecutadas(form.value.codSie);
        if (res.data && res.data.length > 0) {
            console.log('findActividadesEjecutadas...data: ', res.data);
            populateActividadesFromData(res.data);
            console.log("✅ Actividades cargadas y mapeadas al formulario:", form.value);
        } else {
            console.log("ℹ️ No se encontraron actividades ejecutadas para este SIE.");
        }
    } catch (error) {
        console.error("❌ Error en findActividadesEjecutadas:", error);
        toast.error('Error al buscar actividades.', { autoClose: 3000 });
    }
};

const populateActividadesFromData = (items: SavedActividad[]) => {
    if (!items || items.length === 0) {
        return;
    }
    
    if (!form.value.actividadesIds) {
        form.value.actividadesIds = {};
    }
    
    items.forEach((item: SavedActividad, index: number) => {
        if (index >= 5) {
            return;
        }
        
        const formActivityKey = item.desc_actividades_ejecutadas;
        const formDateKey = `${item.desc_actividades_ejecutadas}Fecha`;
        const savedActivityTypeId = item.id_pcpa_actividades_tipo;
        
        const matchingActivity = (actividadTipos.value || []).find(
            (act: ActividadTipoItem) => act.id === savedActivityTypeId
        );
        
        if (matchingActivity) {
            (form.value as any)[item.desc_actividades_ejecutadas] = matchingActivity;
            const dateValue = item.fec_actividad;
            if (dateValue) {
                (form.value as any)[formDateKey] = formatFecha(dateValue);
            }
            form.value.actividadesIds[formActivityKey] = item.id_actividades_ejecutadas;
        } else {
            (form.value as any)[formActivityKey] = null;
            form.value.actividadesIds[formActivityKey] = item.id_actividades_ejecutadas;
        }
    });
};

const findUnidadesEducativasPorDirector = async () => {
    console.log("findUnidadesEducativasPorDirector ->form.value.codSie:", form.value.codSie);
    const dataAuth = {
        username: localStorage.getItem('username'),
        password: localStorage.getItem('password')
    };
    
    if (String(form.value.codSie).length !== 8) {
        console.warn("SIE no válido para buscar UE.");
        return;
    }
    
    try {
        const res = await Auth.listUnidadesEducativasPorDirector(dataAuth);
        const data = res?.data.data.find((ue: any) => ue.codigo_sie === Number(localStorage.getItem('codigo_sie')));
        
        if (data) {
            form.value.unidadEducativa = data.nombre_unidad_educativa;
            form.value.director = `${data.nombre_director} ${data.ap_paterno_director} ${data.ap_materno_director}`;
            find.value = true;
            institucionEducativa.value = data;
        } else {
            console.warn("No se encontró ninguna institución educativa para el SIE:", form.value.codSie);
            find.value = false;
        }
    } catch (error) {
        console.error("Error en findUnidadesEducativasPorDirector:", error);
        toast.error('Error al buscar la unidad educativa.', { autoClose: 3000 });
    }
};




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

// ===== VALIDACIÓN Y GUARDADO =====
const validateForm = (): boolean => {
    validationErrors.value = {};
    const formData = form.value;
    
    const actividadKeys = Object.keys(formData).filter(k => k.startsWith('actividad') && !k.endsWith('Fecha'));
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
    
    actividadKeys.forEach(key => {
        const actividad = formData[key];
        const fechaKey = `${key}Fecha`;
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
    
    Object.keys(validationErrors.value).forEach(key => {
        if (validationErrors.value[key] === true) {
            console.log(`Campo ${key} sin dato ingresado : vacio= `, validationErrors.value[key]);
            toast.error(`Campo ${key} sin dato ingresado`, {
                autoClose: 3500,
                position: toast.POSITION.TOP_RIGHT,
            });
        }
    });
    
    return Object.keys(validationErrors.value).length === 0;
};

const syncComisionMiembros = async (miembros: MiembroComision[], comisionTipoId: number, constId: number) => {
    const promises: Promise<any>[] = [];
    let username = localStorage.getItem("username") || "";
    
    for (const [index, member] of miembros.entries()) {
        const payload: any = {
            id_pcpa_construccion: constId,
            id_pcpa_comision_tipo: comisionTipoId,
            id_pcpa_miembro_tipo: member.tipoId,
            orden: index + 1,
            nombres_miembro: member.nombre || '',
            apellidos_miembro: '',
            check_miembro_comision: member.status,
        };
        
        if (member.status && member.nombre) {
            if (member.id) {
                payload.estado = 'MODIFICADO';
                payload.usu_mod = username;
                payload.fec_mod = new Date();
                promises.push(ConvivenciaPacifica.updateMiembroComision(member.id, payload));
            } else {
                payload.estado = 'ACTIVO';
                payload.usu_cre = username;
                payload.fec_cre = new Date();
                promises.push(ConvivenciaPacifica.createMiembroComision(payload));
            }
        } else if (!member.status && member.id) {
            // La lógica de eliminación está comentada en el script original
        }
    }
    
    return Promise.all(promises);
};

const syncActividades = async (constId: number) => {
    const promises: Promise<any>[] = [];
    const formKeys = ['actividad1', 'actividad2', 'actividad3', 'actividad4', 'actividad5'];
    let username = localStorage.getItem("username") || "";
    
    const getOldActivityId = (key: string) => form.value.actividadesIds?.[key] || null;
    
    for (const key of formKeys) {
        const activityObject = (form.value as any)[key] as ActividadTipoItem | null;
        const dateString = (form.value as any)[`${key}Fecha`] as string | null;
        const oldActivityId = getOldActivityId(key);
        
        const actividadTipoId: number | null = activityObject?.id || null;
        const fechaISO = parseDate(dateString || '');
        const hasValidData = actividadTipoId !== null && !!fechaISO;
        const existedInOldData = !!oldActivityId;
        
        console.log(`Actividad ${key} | PK: ${oldActivityId} | Tiene Datos: ${hasValidData}`);
        
        const payload: any = {
            id_pcpa_actividades_tipo: actividadTipoId,
            id_pcpa_construccion: constId,
            desc_actividad: key,
            fec_actividad: fechaISO,
        };
        
        if (hasValidData) {
            if (existedInOldData) {
                console.log(`Actualizando actividad ${key} con ID: ${oldActivityId}`);
                payload.estado = 'MODIFICADO';
                payload.usu_mod = username;
                payload.fec_mod = new Date();
                promises.push(ConvivenciaPacifica.updateSocializacion(oldActivityId, payload));
            } else {
                console.log(`Creando nueva actividad ${key}`);
                payload.estado = 'ACTIVO';
                payload.usu_cre = username;
                payload.fec_cre = new Date();
                promises.push(ConvivenciaPacifica.createSocializacion(payload));
            }
        } else if (existedInOldData) {
            console.log(`Desactivando actividad ${key} con ID: ${oldActivityId}`);
            payload.estado = 'INACTIVO';
            payload.usu_mod = username;
            payload.fec_mod = new Date();
            promises.push(ConvivenciaPacifica.updateSocializacion(oldActivityId, payload));
        } else {
            console.log(`Ignorando slot ${key}: vacío.`);
        }
    }
    
    return Promise.all(promises);
};



const recargarPagina = () => {
    console.log('recargarPagina .');
    isFormDisabled.value = false;
    window.location.href = '/convivencia/pacifica/socializacion';
};

const xxxxreset = () => {
    const sie = form.value.codSie;
    const unidadEducativa = form.value.unidadEducativa;
    const director = form.value.director;
    
    form.value = {
        username: '',
        idUE: '',
        codSie: sie,
        sie: null,
        unidadEducativa: unidadEducativa,
        director: director,
        validado: false,
        comisionSocializacion: [
            { key: 'Estudiante', tipoId: MIEMBRO_TIPO_MAP.Estudiante, status: true, nombre: '', id: null },
            { key: 'Director', tipoId: MIEMBRO_TIPO_MAP.Director, status: true, nombre: '', id: null },
            { key: 'Maestro', tipoId: MIEMBRO_TIPO_MAP.Maestro, status: false, nombre: '', id: null },
            { key: 'Padre', tipoId: MIEMBRO_TIPO_MAP.Padre, status: false, nombre: '', id: null },
            { key: 'Otro', tipoId: MIEMBRO_TIPO_MAP.Otro, status: false, nombre: '', id: null },
        ],
        comisionImplementacion: [
            { key: 'Estudiante', tipoId: MIEMBRO_TIPO_MAP.Estudiante, status: false, nombre: '', id: null },
            { key: 'Director', tipoId: MIEMBRO_TIPO_MAP.Director, status: false, nombre: '', id: null },
            { key: 'Maestro', tipoId: MIEMBRO_TIPO_MAP.Maestro, status: false, nombre: '', id: null },
            { key: 'Padre', tipoId: MIEMBRO_TIPO_MAP.Padre, status: false, nombre: '', id: null },
            { key: 'Otro', tipoId: MIEMBRO_TIPO_MAP.Otro, status: false, nombre: '', id: null },
        ],
        actividades: [
            { key: 'actividad1', tipoId: 11, nombre: null, fecha: '', id: null },
            { key: 'actividad2', tipoId: 12, nombre: null, fecha: '', id: null },
            { key: 'actividad3', tipoId: 13, nombre: null, fecha: '', id: null },
            { key: 'actividad4', tipoId: 14, nombre: null, fecha: '', id: null },
            { key: 'actividad5', tipoId: 15, nombre: null, fecha: '', id: null },
        ]
    };
    
    dialogSave.value = false;
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
    { deep: true }
);
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
                            <v-btn v-if="!existeMiembro  && !isLoading" color="primary" class="ml-2" @click="iniciarNuevoRegistro"  flat>
                                Ingresar nuevo registro
                            </v-btn>
                            <div class="mt-2 text-caption">__ existeMiembro: {{ existeMiembro }}</div>
                            <v-btn v-if="registroExiste && existeMiembro && !isLoading" color="info" class="ml-2" @click="modificarRegistro"  flat>
                                Modificar registro
                            </v-btn>
                            <div class="mt-2 text-caption">__ disabled= isFormDisabled: {{ isFormDisabled }}</div>
                        </div>
                    </div>
                    <v-form v-model="valid" class="">
                        <v-container>
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.sie" :rules="sieRules" :counter="8" label="SIE" required hide-details :readonly="true"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="8">
                                    <v-text-field v-model="form.unidadEducativa" :counter="10" label="Unidad Educativa" hide-details required :readonly="true"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100">Socialización</span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="12">
                                    Miembros de la comisión de socialización del PCPA
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionSocializacionEstudiante" label="Estudiantes" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionSocializacionEstudianteNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionEstudiante || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionSocializacionDirector" label="Director(a)" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionSocializacionDirectorNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionDirector || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionSocializacionMaestro" label="Maestro(a)" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionSocializacionMaestroNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionMaestro || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionSocializacionPadre" label="Padres/Madres" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionSocializacionPadreNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionPadre || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionSocializacionOtro" label="Otros" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionSocializacionOtroNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionOtro || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100">Implementación</span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="12">
                                    Miembros de la comisión
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionImplementacionEstudiante" label="Estudiantes" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionImplementacionEstudianteNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionImplementacionEstudiante || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionImplementacionDirector" label="Director(a)" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionImplementacionDirectorNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionImplementacionDirector || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionImplementacionMaestro" label="Maestro(a)" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionImplementacionMaestroNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionImplementacionMaestro || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionImplementacionPadre" label="Padres/Madres" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionImplementacionPadreNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionImplementacionPadre || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-checkbox v-model="form.comisionImplementacionOtro" label="Otros" :disabled="isFormDisabledFromNew"></v-checkbox>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.comisionImplementacionOtroNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionImplementacionOtro || isFormDisabledFromNew"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="12">
                                    <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                        <span class="bg-surface position-relative text-subtitle-1 text-grey100">Actividades de Socialización del Plan de Convivencia Pacífica y Armónica</span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="2">
                                    Actividad 1
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select v-model="form.actividad1" :items="actividadTipos" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.actividad1Fecha" label="Fecha" @input="onDateInput" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    Actividad 2
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select v-model="form.actividad2" :items="actividadTipos" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.actividad2Fecha" label="Fecha" @input="onDateInput" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    Actividad 3
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select v-model="form.actividad3" :items="actividadTipos" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.actividad3Fecha" label="Fecha" @input="onDateInput" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    Actividad 4
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select v-model="form.actividad4" :items="actividadTipos" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.actividad4Fecha" label="Fecha" @input="onDateInput" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    Actividad 5
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select v-model="form.actividad5" :items="actividadTipos" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.actividad5Fecha" label="Fecha" @input="onDateInput" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="12">
                                    <v-dialog v-model="dialog" persistent width="auto">
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