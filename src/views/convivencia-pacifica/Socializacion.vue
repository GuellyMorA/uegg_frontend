<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import Auth from '@/services/Auth';


// --- Refs y Estado (sin cambios) ---
const router = useRouter();
const valid = ref(false);
const dialog = ref(false);
const dialogSave = ref(false);
const validationErrors = ref<Record<string, boolean>>({});
const find = ref(false);
const variusSie = ref(false);

const institucionEducativa = ref();
const miembrosComision = ref();
// const comisionSocializacion = ref(); // Ya no es necesario, se procesa en la función de guardado
// const comisionImplementacion = ref(); // Ya no es necesario
// const actividadesEjecucion = ref(); // Ya no es necesario

const sieRules = [
    (value: any) => !!value || 'El SIE es requerido',
    (value: any) => (value?.length === 8) || 'El código SIE requiere 8 dígitos.',
];

let username: string | null;
const form: any = ref({
    sie: null,
    unidadEducativa: '',
   // Miembros de la comisión SOCIALIZACION
    comisionSocializacionEstudiante: true,
    comisionSocializacionDirector: true,
    comisionSocializacionMaestro: false,
    comisionSocializacionPadre: false,
    comisionSocializacionOtro: false,
    comisionSocializacionEstudianteNombre: 'Estudiante1 SOC,Estudiante2  SOC',
    comisionSocializacionDirectorNombre: 'Director1 soc, Director2 socializacion',
    comisionSocializacionMaestroNombre: '',
    comisionSocializacionPadreNombre: '',
    comisionSocializacionOtroNombre: '',
    comisionSocializacionEstudianteId: null,
    comisionSocializacionDirectorId: null,
    comisionSocializacionMaestroId: null,
    comisionSocializacionPadreId: null,
    comisionSocializacionOtroId: null,

    //  Miembros de la comisión Implementación
    comisionImplementacionEstudiante: false,
    comisionImplementacionDirector: false,
    comisionImplementacionMaestro: false,
    comisionImplementacionPadre: false,
    comisionImplementacionOtro: false,
    comisionImplementacionEstudianteNombre: 'Estudiante1 imp,Estudiante2 imp',
    comisionImplementacionDirectorNombre: 'Director1 Implementación, Director2 Implementación',
    comisionImplementacionMaestroNombre: '',
    comisionImplementacionPadreNombre: '',
    comisionImplementacionOtroNombre: '',
    comisionImplementacionEstudianteId: null,
    comisionImplementacionDirectorId: null,
    comisionImplementacionMaestroId: null,
    comisionImplementacionPadreId: null,
    comisionImplementacionOtroId: null,

    actividad1: 'MEDIOS DE COMUNICACIÓN INTERNA',
    actividad2: 'OTROS',
    actividad3: null,
    actividad4: null,
    actividad5: null,
    actividad1Fecha: '15/12/2025',
    actividad2Fecha: '17/08/2026',
    actividad3Fecha: '',
    actividad4Fecha: '',
    actividad5Fecha: '',
    actividad1Id: null,
    actividad2Id: null,
    actividad3Id: null,
    actividad4Id: null,
    actividad5Id: null,
    validado: false
});
   console.log('existeMiembro : ', localStorage.getItem('existeMiembro'));  
   
const readOnlyVar = ref(localStorage.getItem('existeMiembro') === 'true');
// registroExiste se actualice automáticamente cuando cambie readOnlyVar, usa un computed en lugar de otro ref:
const registroExiste = computed(() => readOnlyVar.value);
console.log('existeEnBD-readOnlyVar:', readOnlyVar.value);

const isLoading = ref(true);
const dataUE = JSON.parse(localStorage.getItem('dataUE') || '[{}]');
const idUE = dataUE[0].id;

const isFormDisabled = ref(true);
const isFormDisabledFromNew = ref(true);

// --- Funciones de Control de Formulario (sin cambios) ---

const iniciarNuevoRegistro = () => {
    console.log('Ingresar nuevo registro clickeado.');
    isFormDisabled.value = false;
    isFormDisabledFromNew.value = false;
  //  registroExiste.value = false; // Importante: marcar que es un nuevo registro
    // Aquí también deberías limpiar el formulario (reset)
  //RBC  reset(); 
};

const modificarRegistro = () => {
    console.log('modificar registro .');
    isFormDisabled.value = false;
  //  registroExiste.value = true; // Importante: marcar que es una modificación
};

// --- Funciones de Carga de Datos (onMounted, finders...) (Con leves mejoras) ---

onMounted(async () => {
    let user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.codigo_sie) {
        form.value.sie = user.codigo_sie;
        username = localStorage.getItem('username');
        
        // Ejecutar búsquedas en paralelo
        try {
            await Promise.all([
                findUnidadesEducativasPorDirector(),
                findMiembroComision(),
                findActividadesEjecutadas()
            ]);
        } catch (error) {
            console.error("Error al cargar datos iniciales:", error);
            toast.error('Error al cargar datos iniciales.', { autoClose: 3000 });
        } finally {
            isLoading.value = false;
        }
    } else {
        isLoading.value = false;
        // Manejar caso donde no hay usuario o SIE
    }
});

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

const findMiembroComision = async () => {
    if (String(form.value.sie).length !== 8) {
        miembrosComision.value = null;
        return;
    }
    
    try {
        const res = await ConvivenciaPacifica.findMiembrosComisionConstruccion(form.value.sie);
        miembrosComision.value = res.data; // Guardar todos los miembros

        if (res.data && res.data.length > 0) {
            // Lógica para poblar el formulario (Socialización - Tipo 3)
            const mapMiembro = (comisionTipo: number, miembroTipo: number) => {
                return res.data.find((obj: any) => obj.id_comision_tipo === comisionTipo && obj.id_miembro_tipo === miembroTipo);
            };

            const socializacionTipos = [
                { tipo: 1, key: 'Estudiante' }, { tipo: 2, key: 'Director' },
                { tipo: 3, key: 'Maestro' }, { tipo: 4, key: 'Padre' }, { tipo: 5, key: 'Otro' }
            ];

            socializacionTipos.forEach(item => {
                const miembro = mapMiembro(3, item.tipo);
                form.value[`comisionSocializacion${item.key}`] = !!miembro;
                form.value[`comisionSocializacion${item.key}Nombre`] = miembro?.nombres_miembro || '';
                form.value[`comisionSocializacion${item.key}Id`] = miembro?.id_miembro || null;
            });

            // Lógica para poblar el formulario (Implementación - Tipo 4)
            socializacionTipos.forEach(item => {
                const miembro = mapMiembro(4, item.tipo);
                form.value[`comisionImplementacion${item.key}`] = !!miembro;
                form.value[`comisionImplementacion${item.key}Nombre`] = miembro?.nombres_miembro || '';
                form.value[`comisionImplementacion${item.key}Id`] = miembro?.id_miembro || null;
            });

        } else {
             miembrosComision.value = null;
        }
    } catch (error) {
        console.error("Error en findMiembroComision:", error);
        toast.error('Error al buscar miembros de comisión.', { autoClose: 3000 });
        miembrosComision.value = null;
    }
};

const findActividadesEjecutadas = async () => {
     try {
        const res = await ConvivenciaPacifica.findActividadesEjecutadas(form.value.sie);
        
        const formatFecha = (fecha: string) => {
            if (!fecha) return '';
            const dateParts = fecha.split("-"); // Asume YYYY-MM-DD
            if (dateParts.length === 3) {
                return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // DD/MM/YYYY
            }
            return '';
        };

        if (res.data && res.data.length > 0) {
            // Mapeo de tipos de actividad a claves del formulario
            const actividadTipoMap: { [key: number]: string } = {
                11: 'actividad1', 12: 'actividad2',
                13: 'actividad3', 14: 'actividad4', 15: 'actividad5'
            };

            res.data.forEach((data: any) => {
                const keyBase = actividadTipoMap[data.id_pcpa_actividades_tipo];
                if (keyBase) {
                    form.value[`${keyBase}Id`] = data.id_actividades_ejecutadas;
                    form.value[keyBase] = data.desc_actividades_ejecutadas;
                    form.value[`${keyBase}Fecha`] = formatFecha(data.fec_actividad);
                }
            });
            // Si hay al menos una actividad, marcamos que el registro existe
            if(res.data.length > 0) registroExiste.value = true;
        }
    } catch (error) {
        console.error("Error en findActividadesEjecutadas:", error);
        toast.error('Error al buscar actividades.', { autoClose: 3000 });
    }
};

// --- Funciones de Formateo de Inputs (sin cambios) ---

const onDateInput = (cleanedInput: string) => {
    if (cleanedInput.length <= 2) {
        return cleanedInput;
    } else if (cleanedInput.length <= 4) {
        return cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2);
    }
    // Limita a 8 dígitos (DDMMYYYY)
    const truncatedInput = cleanedInput.slice(0, 8);
    return truncatedInput.slice(0, 2) + '/' + truncatedInput.slice(2, 4) + '/' + truncatedInput.slice(4, 8);
};

const onDateInput1 = (event: any) => { form.value.actividad1Fecha = onDateInput(event.target.value.replace(/\D/g, '')); };
const onDateInput2 = (event: any) => { form.value.actividad2Fecha = onDateInput(event.target.value.replace(/\D/g, '')); };
const onDateInput3 = (event: any) => { form.value.actividad3Fecha = onDateInput(event.target.value.replace(/\D/g, '')); };
const onDateInput4 = (event: any) => { form.value.actividad4Fecha = onDateInput(event.target.value.replace(/\D/g, '')); };
const onDateInput5 = (event: any) => { form.value.actividad5Fecha = onDateInput(event.target.value.replace(/\D/g, '')); };

// --- Validación (sin cambios) ---

const validateForm = () => {
    validationErrors.value = {};
    const { actividad1, actividad2, actividad3, actividad4, actividad5,
            actividad1Fecha, actividad2Fecha, actividad3Fecha, actividad4Fecha, actividad5Fecha } = form.value;

    if (!actividad1 && !actividad2 && !actividad3 && !actividad4 && !actividad5) {
        validationErrors.value['actividad'] = true;
    }
    if (actividad1 && !actividad1Fecha) validationErrors.value['actividad1'] = true;
    if (actividad2 && !actividad2Fecha) validationErrors.value['actividad2'] = true;
    if (actividad3 && !actividad3Fecha) validationErrors.value['actividad3'] = true;
    if (actividad4 && !actividad4Fecha) validationErrors.value['actividad4'] = true;
    if (actividad5 && !actividad5Fecha) validationErrors.value['actividad5'] = true;
   
    return Object.keys(validationErrors.value).length === 0;
};

// --- Función de Reseteo (sin cambios) ---
const reset = () => {
    form.value.actividad1 = null;
    form.value.actividad2 = null;
    form.value.actividad3 = null;
    form.value.actividad4 = null;
    form.value.actividad5 = null;
    form.value.actividad1Fecha = '';
    form.value.actividad2Fecha = '';
    form.value.actividad3Fecha = '';
    form.value.actividad4Fecha = '';
    form.value.actividad5Fecha = '';
    form.value.actividad1Id = null;
    form.value.actividad2Id = null;
    form.value.actividad3Id = null;
    form.value.actividad4Id = null;
    form.value.actividad5Id = null;
    // También resetear comisiones
    // ...
    dialogSave.value = false;
};

// --- Constantes (sin cambios) ---
const actividadTipo = [
    { id: 1, name: '' },  
    { id: 2, name: 'MEDIOS DE COMUNICACIÓN INTERNA' },  
    { id: 3, name: 'REDES SOCIALES' },  
    { id: 4, name: 'TALLERES' },  
    { id: 5, name: 'FERIAS' },  
    { id: 6, name: 'OTROS' }
];

// --- FUNCIONES AUXILIARES REFACTORIZADAS ---

/**
 * Convierte una fecha en formato DD/MM/YYYY a un string ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
const parseDate = (dateString: string): string | null => {
    if (!dateString || dateString.length !== 10) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    // parts[2] = YYYY, parts[1] = MM, parts[0] = DD
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
};

/**
 * Sincroniza (Crea/Actualiza/Elimina) los miembros de una comisión.
 */
const syncComisionMiembros = async (miembros: any[], comisionTipoId: number, constId: number) => {
    const promises: Promise<any>[] = [];

    for (const [index, member] of miembros.entries()) {
        const payload = {
            id_pcpa_construccion: constId,
            id_pcpa_comision_tipo: comisionTipoId,
            id_pcpa_miembro_tipo: member.tipoId,
            orden: index + 1,
            nombres_miembro: member.value || '',
            apellidos_miembro: '',
            check_miembro_comision: member.status,
           // estado: 'ACTIVO',
           // usu_cre: username, // O usu_mod si es actualización
           // fec_cre: new Date() // O fec_mod
        };

        if (member.status && member.value ) {
            // Si tiene estado y valor, es una creación o actualización
            if (member.id ) {  //   &&  !registroExiste
                                
               // Actualizar miembros socializacion   
                  payload.estado= 'MODIFICADO',             
                 payload.usu_mod = username;
                 payload.fec_mod = new Date();
                 promises.push(ConvivenciaPacifica.updateMiembroComision(member.id, payload));
                
                 // el codigo comentado a continuacion no es necesario
                // --- INICIO: Solución provisional si NO HAY UPDATE (Eliminar y Crear) ---
                // 1. Eliminar si existe
                //if(member.id) promises.push(ConvivenciaPacifica.deleteMiembroComision(member.id));
                // 2. Crear
               // promises.push(ConvivenciaPacifica.createMiembroComision(payload));
                // --- FIN: Solución provisional ---

            } else if (!member.id  ) {

                // Crear miembros socializacion
                   payload.estado= 'ACTIVO',
                payload.usu_cre = username;
                 payload.fec_cre = new Date();
                promises.push(ConvivenciaPacifica.createMiembroComision(payload));
            }
        } else if (!member.status && member.id) {
            // el codigo comentado a continuacion no es necesario
            // Si no tiene estado pero sí ID, es una eliminación
          //  promises.push(ConvivenciaPacifica.deleteMiembroComision(member.id));
        }
    }
    return Promise.all(promises);
};

/**
 * Sincroniza (Crea/Actualiza/Elimina) las actividades.
 */
const syncActividades = async (activities: any[], constId: number) => {
    const promises: Promise<any>[] = [];

    for (const activity of activities) {
        const fechaISO = parseDate(activity.fecha);
        
        const payload = {
            id_pcpa_actividades_tipo: activity.tipoId,
            id_pcpa_construccion: constId,
            desc_actividad: (activity.value && typeof activity.value === 'object')  ? activity.value.name : activity.value ,//activity.value != null ? activity.value : '', //  name
            fec_actividad: fechaISO,
           // usu_cre: username,
           // fec_cre: new Date()
        };

        if (activity.value && fechaISO) {
            // Si tiene valor y fecha, es actualización
            if (activity.id  ) { //  &&  !registroExiste
                // Actualizar actividad
                 payload.estado= 'MODIFICADO',
                 payload.usu_mod = username;
                 payload.fec_mod = new Date();
                 promises.push(ConvivenciaPacifica.updateSocializacion(activity.id, payload));
                
                 // el codigo comentado a continuacion no es necesario
                // --- INICIO: Solución provisional si NO HAY UPDATE (Eliminar y Crear) ---
             //   if(activity.id) promises.push(ConvivenciaPacifica.deleteActividadesEjecutadas(activity.id));
             //   promises.push(ConvivenciaPacifica.createSocializacion(payload));
                // --- FIN: Solución provisional ---

            } else if (!activity.id  ) {
                // Crear actividad            
            //  payload.desc_actividad= activity.value != null ? activity.value.name : '', //  
                payload.estado= 'ACTIVO',
                 payload.usu_cre = username;
                 payload.fec_cre = new Date();
                promises.push(ConvivenciaPacifica.createSocializacion(payload));
            }
        } else if (!activity.value && activity.id) {
            // el codigo comentado a continuacion no es necesario
            // Si no tiene valor pero sí ID, es eliminación
           // promises.push(ConvivenciaPacifica.deleteActividadesEjecutadas(activity.id));
        }
    }
    return Promise.all(promises);
};

// --- FUNCIONES PRINCIPALES DE GUARDADO (create / update) ---

/**
 * Prepara los datos del formulario para ser enviados.
 */
const getDatosFormulario = () => {
    const socializacionMiembros = [
        { tipoId: 1, status: form.value.comisionSocializacionEstudiante, value: form.value.comisionSocializacionEstudianteNombre, id: form.value.comisionSocializacionEstudianteId },
        { tipoId: 2, status: form.value.comisionSocializacionDirector, value: form.value.comisionSocializacionDirectorNombre, id: form.value.comisionSocializacionDirectorId },
        { tipoId: 3, status: form.value.comisionSocializacionMaestro, value: form.value.comisionSocializacionMaestroNombre, id: form.value.comisionSocializacionMaestroId },
        { tipoId: 4, status: form.value.comisionSocializacionPadre, value: form.value.comisionSocializacionPadreNombre, id: form.value.comisionSocializacionPadreId },
        { tipoId: 5, status: form.value.comisionSocializacionOtro, value: form.value.comisionSocializacionOtroNombre, id: form.value.comisionSocializacionOtroId }
    ];

    const implementacionMiembros = [
        { tipoId: 1, status: form.value.comisionImplementacionEstudiante, value: form.value.comisionImplementacionEstudianteNombre, id: form.value.comisionImplementacionEstudianteId },
        { tipoId: 2, status: form.value.comisionImplementacionDirector, value: form.value.comisionImplementacionDirectorNombre, id: form.value.comisionImplementacionDirectorId },
        { tipoId: 3, status: form.value.comisionImplementacionMaestro, value: form.value.comisionImplementacionMaestroNombre, id: form.value.comisionImplementacionMaestroId },
        { tipoId: 4, status: form.value.comisionImplementacionPadre, value: form.value.comisionImplementacionPadreNombre, id: form.value.comisionImplementacionPadreId },
        { tipoId: 5, status: form.value.comisionImplementacionOtro, value: form.value.comisionImplementacionOtroNombre, id: form.value.comisionImplementacionOtroId }
    ];

    const activities = [
        { tipoId: 11, value: form.value.actividad1, fecha: form.value.actividad1Fecha, id: form.value.actividad1Id },
        { tipoId: 12, value: form.value.actividad2, fecha: form.value.actividad2Fecha, id: form.value.actividad2Id },
        { tipoId: 13, value: form.value.actividad3, fecha: form.value.actividad3Fecha, id: form.value.actividad3Id },
        { tipoId: 14, value: form.value.actividad4, fecha: form.value.actividad4Fecha, id: form.value.actividad4Id },
        { tipoId: 15, value: form.value.actividad5, fecha: form.value.actividad5Fecha, id: form.value.actividad5Id }
    ];
    
    return { socializacionMiembros, implementacionMiembros, activities };
};

/**
 * Función `registro` actualizada que dirige a create o update.
 */
const registro = async () => {
    console.log(`Iniciando guardado (Existe: ${registroExiste.value})`);
    
    if (!validateForm()) {
        dialog.value = false;
        toast.info('Debe ingresar los datos requeridos', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
        return;
    }

    isLoading.value = true;
    isFormDisabled.value = true;

    try {
        const constId = await findConstByCiAndUe();
        if (!constId) {
            throw new Error('No se pudo encontrar el ID de construcción para la UE.');
        }

        const { socializacionMiembros, implementacionMiembros, activities } = getDatosFormulario();

        // Ejecutar todas las sincronizaciones en paralelo
        await Promise.all([
            syncComisionMiembros(socializacionMiembros, 3, constId), // 3 = Socialización
            syncComisionMiembros(implementacionMiembros, 4, constId), // 4 = Implementación
            syncActividades(activities, constId)
        ]);

        // Éxito
        toast.success('Registros guardados correctamente', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
        dialog.value = false;
        dialogSave.value = true;
        registroExiste.value = true; // El registro ahora existe (o sigue existiendo)

        // Recargar datos para obtener nuevos IDs y estados
        await findMiembroComision();
        await findActividadesEjecutadas();

    } catch (error: any) {
        console.error("Error al guardar:", error);
        toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`, {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    } finally {
        isLoading.value = false;
    }
};

// --- Función findConstByCiAndUe (Mejorada) ---
const findConstByCiAndUe = async (): Promise<number | null> => {
    form.value.idUE = idUE;
    form.value.username = username;
    
    try {
        const res = await ConvivenciaPacifica.findConstByCiAndUe(form.value);
        if (res.status === 200 && res.data && res.data.length > 0) {
            const existeCiAndCodSie = res.data;
            if (existeCiAndCodSie.length === 1) {
                localStorage.setItem('idConst', existeCiAndCodSie[0].id);
                return existeCiAndCodSie[0].id;
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
                                <v-select v-model="form.actividad1" :items="actividadTipo" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.actividad1Fecha" label="Fecha"  @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                Actividad 2
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-select v-model="form.actividad2" :items="actividadTipo" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.actividad2Fecha" label="Fecha"  @input="onDateInput2" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                Actividad 3
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-select v-model="form.actividad3" :items="actividadTipo" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.actividad3Fecha" label="Fecha"  @input="onDateInput3" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                Actividad 4
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-select v-model="form.actividad4" :items="actividadTipo" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.actividad4Fecha" label="Fecha"  @input="onDateInput4" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                Actividad 5
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-select v-model="form.actividad5" :items="actividadTipo" item-title="name" item-value="id" label="Nombre" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.actividad5Fecha" label="Fecha"  @input="onDateInput5" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
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



