<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import type { ToastOptions } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import EstudianteEmbarazo from '@/services/EstudianteEmbarazo';
import Auth from '@/services/Auth';


// ===== INTERFACES Y TIPOS =====

interface UnidadEducativa {
  nombre_unidad_educativa: string;
  nombre_director: string;
  ap_paterno_director: string;
  ap_materno_director: string;
  departamento_codigo: string;
  departamento: string;
  distrito: string;
  nivel: string;
  dependencia: string;
  codigo_sie: number;
}

interface ReporteTipo {
  id: number;
  name: string;
}

interface FormEstudianteData {
      username: string | null;
  idUE: string | null;
  codSie: string | null;
    constId:number | null;
  sie: string | null;
  departamentoId: string | null;
  departamentoNombre: string;
  municipioId: string | null;
  municipioNombre: string;
  unidadEducativa: string;
  nivel: string;
  modalidad: string;
  director: string;
  reporteNombre1: ReporteTipo | null;
  reporteNombre2: ReporteTipo | null;
  reporteNombre3: ReporteTipo | null;
  estudianteCodigoRude: string;
  estudianteCedulaIdentidad: string;
  estudianteComplemento: string;
  estudiantePaterno: string;
  estudianteMaterno: string;
  estudianteNombre: string;
  estudianteFechaNacimiento: string;
  estudianteEdad: string | number;
  estudianteGrado: string;
  estudianteNivel: string;
  dispacidad: boolean;
  dispacidadCognitiva: boolean;
  dispacidadVisual: boolean;
  dispacidadAuditiva: boolean;
  dispacidadMotriz: boolean;
  dispacidadOtro: boolean;
  //casada: boolean; 
  unionTemprana: boolean;


id_emb_informe_embarazo:string | number;
id_emb_estudiante_embarazo:string | number;

  validado: boolean;


  
}
// Formulario tipado
const form = reactive<FormEstudianteData>(  {
  username: '',
    idUE: '',
  constId:null,
  codSie: '',
  sie: '',
  departamentoId: null,
  departamentoNombre: '',
  municipioId: null,
  municipioNombre: '',
  unidadEducativa: '',
  nivel: '',
  modalidad: '',
  director: '',
  reporteNombre1: null,
  reporteNombre2: null,
  reporteNombre3: null,
  estudianteCodigoRude: '',
  estudianteCedulaIdentidad: '',
  estudianteComplemento: ' ',
  estudiantePaterno: '',
  estudianteMaterno: '',
  estudianteNombre: '',
  estudianteFechaNacimiento: '',
  estudianteEdad: '',
  estudianteGrado: '',
  estudianteNivel: '',

  dispacidad: false,
  dispacidadCognitiva: false,
  dispacidadVisual: false,
  dispacidadAuditiva: false,
  dispacidadMotriz: false,
  dispacidadOtro: false,
//casada: false,
  unionTemprana: false,

id_emb_informe_embarazo:null,
id_emb_estudiante_embarazo:null,
  
  validado: false

});

// ===== ESTADO REACTIVO =====
const router = useRouter();

// Estado de loading manual (reemplazo para useLoading)
const isLoading = ref(false);
const isLoadingEstudiante = ref(false);



// Otro estado de UI
const dialog = ref(false);
const dialogSave = ref(false);
const find = ref(false);
const institucionEducativa = ref<UnidadEducativa | null>(null);

const username = ref(localStorage.getItem('username') || '');
const registroExiste = ref(localStorage.getItem('existeEnBD') === 'true');
const isFormDisabled = ref(registroExiste.value);
//const isFormDisabledFromNew = ref(true);
const idUE = ref(localStorage.getItem('idUE'));
const constId = ref<number | null>(null);
const codSie = ref(localStorage.getItem('codigo_sie') || '');

const usingMockData = ref(false); // Para saber si estamos usando datos de ejemplo

// Datos estáticos
const personaReporteTipo: ReporteTipo[] = [
  { id: 1, name: 'Estudiante embarazada' },
  { id: 2, name: 'Pareja de estudiante' },
  { id: 3, name: 'Familia de estudiante' },
  { id: 4, name: 'Otro estudiante' },
  { id: 5, name: 'Maestro/Maestra' },
  { id: 6, name: 'Personal administrativo' },
  { id: 7, name: 'Director' },
  { id: 8, name: 'Otros' }
];

// gemni --- Estado de UI ---
const loading = ref({
  initial: true,
  estudiante: false,
  save: false,
});

// --- Estado de Sesión y Datos Críticos ---
const session = ref({
  username: localStorage.getItem('username') || '',
  idUE: localStorage.getItem('idUE') || null,
  codSie: localStorage.getItem('codigo_sie') || '',
  constId: null as number | null, // ID de Construcción PCPA
});


// --- Datos de APIs ---
const variusSie = ref(false);

// ===== DATOS DE EJEMPLO =====
const loadMockData = () => {
  console.log('Cargando datos de ejemplo para desarrollo');
  usingMockData.value = true;
  
  // Datos de la institución educativa
  /*Object.assign(form, {
    sie: '12345678',
    departamentoId: '02',
    departamentoNombre: 'Chuquisaca',
    municipioId: '0201',
    municipioNombre: 'Sucre',
    unidadEducativa: 'Unidad Educativa Fiscomisional San Francisco',
    nivel: 'Secundaria',
    modalidad: 'Privada',
    director: 'Lic. María Elena Quispe Flores',
    codSie: '12345678',
    idUE: 'UE12345'
  });
  */
  // Datos del reporte
  form.reporteNombre1 = personaReporteTipo[2]; // Familia de estudiante
  //sie/uegg/InfoEstudiante/81981532201336/ALEJANDRA MARIEL/ARAMAYO/CHAMO/2009-04-01
  // Datos de la estudiante
  Object.assign(form, {
    estudianteCodigoRude: '81981532201336',
    estudianteCedulaIdentidad: '',
    estudianteComplemento: '',
    estudiantePaterno: 'ARAMAYO',
    estudianteMaterno: 'CHAMO',
    estudianteNombre: 'ALEJANDRA MARIEL',
    estudianteFechaNacimiento: '01/04/2009',
    estudianteEdad: '',
    estudianteGrado: '',
    estudianteNivel: '',
    validado: true
  });
  
  // Datos adicionales
    form.dispacidad = true;
  form.dispacidadCognitiva = true;
    form.dispacidadVisual = false;
  form.dispacidadAuditiva = true;

  form.unionTemprana = true;
  
  // Simular que existe en BD
  registroExiste.value = true;
  localStorage.setItem('existeEnBD', 'true');
  
  toast.info('Usando datos de ejemplo para visualización', {
    autoClose: 3000,
    position: toast.POSITION.TOP_RIGHT
  });
};


// ===== MÉTODOS PRINCIPALES =====
onMounted(async () => {
  console.log(`Iniciando componente con SIE: ${codSie.value} y usuario: ${username.value}`);
  await loadInitialData();
  console.log('==================================================================================');
  console.log('onMounted constId.value : ', constId.value);

   // console.warn('Error al cargar datos reales, cargando datos de ejemplo:', error);
   // Si no hay datos después de intentar cargar los reales, usar datos de ejemplo
 // if (!form.unidadEducativa) {
    loadMockData();
  //}
  

});

const loadInitialData = async () => {
  startLoading();
//  loading.value.initial = true;

  try {
    if (!codSie.value) {
      toast.error('Usuario no válido o sin SIE asignado', getToastOptions());
      return;
    }

    // 1. Encontrar IDs críticos (idUE y constId)
    //idUE.value = await ConvivenciaPacifica.findUeByCiAndCodSieSetVariables(form);
    form.username = username.value; ///  es el ci
    form.idUE = idUE.value;
   

    constId.value = await ConvivenciaPacifica.findIdConstByCiAndUeSetVariables(form);
    //session.value.constId = constId;
    
   // console.info('ID de Construcción PCPA encontrado:', constId.value);

    if (!constId || constId.value == 0) {
      toast.warn('No se encontró registro de construcción PCPA. No se puede cargar ni guardar.', getToastOptions(4000));
      isFormDisabled.value = true;
      return;
    }
   form.constId = constId.value;
   form.codSie = codSie.value;


    const results = await Promise.allSettled([
      findUnidadesEducativasPorDirector(),
      //findEstudiante()
    ]);

    if (results[0].status === 'rejected') {
      console.error("findUnidadesEducativasPorDirector -> Error al cargar datos de UE:", results[0].reason);
      toast.error('No se pudieron cargar los datos de la Unidad Educativa.', { autoClose: 3000 });
    }
  //  if (results[1].status === 'rejected') {
   //   console.error("findEstudiante -> Error al buscar estudiante (inicial):", results[1].reason);
  //  }

  } catch (error: any) {
    console.error("Error al cargar datos iniciales:", error);
    toast.error(`Error al cargar datos iniciales. Por favor, intente nuevamente: ${error.message || 'Error desconocido'}`, getToastOptions());

    isFormDisabled.value = true;
  } finally {
    stopLoading();
   // loading.value.initial = false;
  }

};

/**
 * Busca al estudiante usando una estrategia de "fallback".
 * 1. Intenta encontrarlo en la base de datos local.
 * 2. Si no lo encuentra, busca en la API externa del SIE.
 * 3. Procesa el resultado final.
 */
const findEstudiante = async () => {

    // ANOTACIÓN: He cambiado el mensaje de advertencia para que coincida
    // con la nueva lógica de validación (que parece aceptar más campos).
    if (!validateStudentSearchCriteria(
            form.estudianteCodigoRude, 
            form.estudianteNombre,
            form.estudiantePaterno, 
            form.estudianteMaterno, 
            formatDateForInput(form.estudianteFechaNacimiento)
        )) {
        toast.warning('Ingrese al menos un criterio de búsqueda válido.', getToastOptions());
        return;
    }

    startEstudianteLoading();
    
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10s de timeout

    // ANOTACIÓN: Usamos una variable clara para guardar el resultado final,
    // en lugar de 'estudiante' que cambiaba de tipo y causaba errores.
    let estudianteEncontrado: any | null = null; 

    try {
        // --- 1. Búsqueda en la Base de Datos Local ---
        try {
            const resLocal = await EstudianteEmbarazo.findEstudianteEmbarazoByCodRude(form.estudianteCodigoRude);
            
            // ANOTACIÓN: Asumimos que 'resLocal.data' tiene una propiedad 'data' que es un array.
            // (Basado en tu lógica original 'estudiante.data.length')
            if (resLocal.status === 200 && resLocal.data?.length > 0) {
                estudianteEncontrado = resLocal.data[0];
                console.log("Estudiante encontrado en BD local:", estudianteEncontrado);
            }
        } catch (localError) {
            console.warn("Error al buscar en BD local (se intentará con SIE):", localError);
            // No detenemos la ejecución, permitimos que el fallback actúe.
        }

        // --- 2. Búsqueda en API SIE (Fallback) ---
        // ANOTACIÓN: Solo si NO se encontró en la BD local, se ejecuta la búsqueda externa.
        if (!estudianteEncontrado) {
            console.log("No encontrado localmente. Buscando en API SIE...");
            
            const resSie = await EstudianteEmbarazo.findEstudianteEmbarazoApiSie({
                ...form, // Asumo que 'form' es un ref, así que es 'form.value'
                signal: abortController.signal
            });

            // ANOTACIÓN: Asumimos que 'resSie.data' es directamente un array o un objeto.
            // (Basado en tu lógica original 'Array.isArray(res.data)')
            if (resSie?.data) {
                const sieData = Array.isArray(resSie.data) ? resSie.data : [resSie.data];
                
                if (sieData.length > 0) {
                    estudianteEncontrado = sieData[0];
                    console.log("Estudiante encontrado en API SIE:", estudianteEncontrado);
                }
            }
        }

        // --- 3. Procesamiento del Resultado ---
        // ANOTACIÓN: Ahora solo tenemos una validación, al final.
        if (estudianteEncontrado) {
            populateFormWithStudentData(estudianteEncontrado);
            toast.success(`Estudiante encontrado: ${form.estudianteNombre || ''} ${form.estudiantePaterno || ''}`, {
                ...getToastOptions(4000),
                icon: '✅'
            });
        } else {
            resetStudentValidation();
            toast.info('No se encontró ningún estudiante con los criterios proporcionados', {
                ...getToastOptions(3000),
                icon: '🔍'
            });
        }

    } catch (error: any) {
        // --- Manejo de Errores ---
        //console.error('[findEstudiante] Error:', error);
       // handleStudentSearchError(error); // Asumo que esta función existe
         // 5. Manejo de errores mejorado
            clearTimeout(timeoutId);
            
        if (error.name === 'AbortError') {
            toast.error('Tiempo de espera excedido en la búsqueda. Intente con menos criterios.', getToastOptions(6000));
            console.warn('Búsqueda cancelada por timeout');
        } else {
            console.error('[findEstudiante] Error detallado:', error);
            handleStudentSearchError(error);
        }
    } finally {
        // --- Limpieza ---
        // ANOTACIÓN: El timeout DEBE limpiarse aquí, en 'finally', 
        // para asegurar que se ejecute siempre.
        clearTimeout(timeoutId);
            abortController.abort(); // Asegurar que cualquier petición pendiente se cancele

        stopEstudianteLoading();
    }
};

const populateFormWithStudentData = (estudiante: any) => {
  Object.assign(form, {
    validado: true,
    codSie : estudiante.codigo_sie,
    estudianteNivel: estudiante.nivel || form.estudianteNivel,
    estudianteGrado: estudiante.grado || form.estudianteGrado,
    estudianteEdad: asignarEdad(form.estudianteFechaNacimiento) ,

  //  estudianteNombre: estudiante.nombres_estudiante || estudiante.nombre || form.estudianteNombre,
  //  estudiantePaterno: estudiante.apellido_pat_estudiante || estudiante.paterno || form.estudiantePaterno,
  //  estudianteMaterno: estudiante.apellido_mat_estudiante || estudiante.materno || form.estudianteMaterno,
   // Discapacidad
      dispacidad : estudiante.check_estudiante_discapacidad || false,
      dispacidadCognitiva : estudiante.dis_cognitiva || false,
      dispacidadVisual : estudiante.dis_visual || false,
      dispacidadAuditiva : estudiante.dis_auditiva || false,
      dispacidadMotriz : estudiante.dis_motriz || false,
      dispacidadOtro : estudiante.dis_otro || false,
      
      // Unión temprana
     // casada: check_estudiante_conviviente  || false,
      unionTemprana : estudiante.check_estudiante_conviviente || false
      
  });
};


const xxxsave = async () => {
  if (!validateForm()) {
    toast.warning('Complete todos los campos requeridos antes de guardar', getToastOptions());
    return;
  }

  startLoading();
  dialog.value = false;

  try {
    const informePayload = createInformePayload();
    const informeRes = await EstudianteEmbarazo.createInformeEmbarazo(informePayload);
    
    if (informeRes.status !== 201) {
      throw new Error('Error al crear el informe de embarazo');
    }

    const estudiantePayload = createEstudiantePayload(informeRes.data.id);
    const estudianteRes = await EstudianteEmbarazo.createEstudianteEmbarazo(estudiantePayload);
    
    if (estudianteRes.status !== 201) {
      throw new Error('Error al crear el registro del estudiante');
    }

    handleSaveSuccess();
  } catch (error: any) {
    console.error('Error al guardar:', error);
    toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`, getToastOptions());
  } finally {
    stopLoading();
  }
};
// Asegúrate de que este objeto esté disponible en el scope
// Por ejemplo, importado o definido como una referencia reactiva
// const estudianteEmbarazoData = ref({...}); // el objeto que me pasaste

const save = async () => {
  if (!validateForm()) {
    toast.warning('Complete todos los campos requeridos antes de guardar', getToastOptions());
    return;
  }

  startLoading();
  dialog.value = false;



  try {
   // Determinar si necesitamos crear o actualizar el informe

    const isUpdate = form.id_emb_informe_embarazo

    let informeRes;
    let estudianteRes;
    let estudianteId; // Para guardar el ID del estudiante para la actualización

    // 1. Lógica para el Informe de Embarazo (CREATE o UPDATE)
    const informePayload = createInformePayload();
    if (isUpdate) {
      // Si estamos actualizando, necesitamos el ID del informe existente
      const informeId = form.id_emb_informe_embarazo;
      informeRes = await EstudianteEmbarazo.updateInformeEmbarazo(informeId, informePayload);
       
      if (informeRes.status !== 200) { // Asumiendo 200 OK para la actualización
        throw new Error('Error al actualizar el informe de embarazo');
      }
      // El ID del informe ya existe, lo usamos.
      estudianteId = form.id_emb_estudiante_embarazo; 
    } else {
      // Caso CREATE
      informeRes = await EstudianteEmbarazo.createInformeEmbarazo(informePayload);

      if (informeRes.status !== 201) {
        throw new Error('Error al crear el informe de embarazo');
      }
    }

    // 2. Lógica para el Registro del Estudiante (CREATE o UPDATE)
    // El payload para el estudiante necesita el ID del informe.
    // Si es CREATE, usa el ID retornado por createInformeEmbarazo (informeRes.data.id).
    // Si es UPDATE, el ID del informe ya está en estudianteEmbarazoData.value.id_emb_informe_embarazo.
    const informeRelacionId = isUpdate 
        ? form.id_emb_informe_embarazo 
        : informeRes.data.id;
        
    const estudiantePayload = createEstudiantePayload(informeRelacionId);
    
    if (isUpdate) {
        // Caso UPDATE
        estudianteRes = await EstudianteEmbarazo.updateEstudianteEmbarazo(estudianteId, estudiantePayload);

        if (estudianteRes.status !== 200) { // Asumiendo 200 OK para la actualización
            throw new Error('Error al actualizar el registro del estudiante');
        }
    } else {
        // Caso CREATE
        estudianteRes = await EstudianteEmbarazo.createEstudianteEmbarazo(estudiantePayload);

        if (estudianteRes.status !== 201) {
            throw new Error('Error al crear el registro del estudiante');
        }
    }

    handleSaveSuccess(isUpdate ? 'actualizado' : 'creado');
  } catch (error: any) {
    console.error('Error al guardar:', error);
    toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`, getToastOptions());
  } finally {
    stopLoading();
  }
};
const createInformePayload = () => {
  return {
    id_pcpa_unidad_educativa: constId.value,
    id_emb_reporte_embarazo_tipo_1: form.reporteNombre1?.id,
    id_emb_reporte_embarazo_tipo_2: form.reporteNombre2?.id,
    id_emb_reporte_embarazo_tipo_3: form.reporteNombre3?.id,
    estado: 'ACTIVO',
    usu_cre: username.value,
    fec_cre: new Date().toISOString()
  };
};

const createEstudiantePayload = (idInforme: number) => {
  return {
    id_pcpa_unidad_educativa: constId.value,
    id_emb_informe_embarazo: idInforme,

    cod_rude: form.estudianteCodigoRude,
    cedula_identidad: form.estudianteCedulaIdentidad,
    complemento: form.estudianteComplemento,
    fec_nacimiento: formatDateForAPI(form.estudianteFechaNacimiento),
    nombres_estudiante: form.estudianteNombre,
    apellido_pat_estudiante: form.estudiantePaterno,
    apellido_mat_estudiante: form.estudianteMaterno,
    nivel: form.estudianteNivel,
    grado: form.estudianteGrado,
    edad: form.estudianteEdad,

    check_estudiante_discapacidad: form.dispacidad|| false,
    dis_cognitiva: form.discapacidadCognitiva || false,
    dis_visual: form.discapacidadVisual || false,
    dis_auditiva: form.discapacidadAuditiva || false,
    dis_motriz: form.discapacidadMotriz || false,
    dis_otro: form.discapacidadOtro || false,
 // Unión temprana
    check_estudiante_casada: form.unionTemprana || false,
    check_estudiante_conviviente: form.unionTemprana || false,
   
    estado: 'ACTIVO',
    usu_cre: username.value,
    fec_cre: new Date().toISOString()
  };
};



/**
 * Calcula la edad a partir de la fecha de nacimiento y asigna al form
 * @param {string} fechaNacimiento - fecha en formato YYYY-MM-DD
 */
const  asignarEdad= (fechaNacimiento: string ) =>  {
  if (!fechaNacimiento) {
    //form.estudianteEdad = null;
    return;
  }

  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesDiff = hoy.getMonth() - nacimiento.getMonth();

  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}

const findUnidadesEducativasPorDirector = async () => {
  try {
    if (form.codSie.length !== 8) {
      resetInstitucionEducativa();
      console.warn(`SIE inválido: ${form.codSie}`);
      return;
    }

    const dataAuth = {
      username: localStorage.getItem('username') || '',
      password: localStorage.getItem('password') || ''
    };

    const res = await Auth.listUnidadesEducativasPorDirector(dataAuth);
    const unidades = res?.data?.data || [];
    
    institucionEducativa.value = unidades.find((ue: UnidadEducativa) => 
      ue.codigo_sie.toString() === form.codSie
    ) || null;

    if (institucionEducativa.value) {
      populateFormFromInstitucion();
      find.value = true;
    } else {
      resetInstitucionEducativa();
      toast.info('No se encontró institución educativa para el SIE proporcionado', getToastOptions());
    }
  } catch (error) {
    console.error('Error al buscar institución educativa en findUnidadesEducativasPorDirector:', error);
    toast.error('Error al cargar datos de la institución educativa', getToastOptions());
    resetInstitucionEducativa();
  }
};

const populateFormFromInstitucion = () => {
  if (!institucionEducativa.value) return;
  
  Object.assign(form, {
    unidadEducativa: institucionEducativa.value.nombre_unidad_educativa,
    director: `${institucionEducativa.value.nombre_director} ${institucionEducativa.value.ap_paterno_director} ${institucionEducativa.value.ap_materno_director}`,
    departamentoId: institucionEducativa.value.departamento_codigo,
    departamentoNombre: institucionEducativa.value.departamento,
    municipioNombre: institucionEducativa.value.distrito,
    nivel: institucionEducativa.value.nivel,
    modalidad: institucionEducativa.value.dependencia
  });
};

const resetInstitucionEducativa = () => {
  institucionEducativa.value = null;
  find.value = false;
  Object.assign(form, {
    departamentoId: null,
    departamentoNombre: '',
    municipioId: null,
    municipioNombre: '',
    unidadEducativa: '',
    nivel: '',
    modalidad: '',
    director: ''
  });
};


const resetStudentValidation = () => {
  form.validado = false;
  form.estudianteNivel = '';
  form.estudianteGrado = '';
  form.estudianteEdad = '';
};

const handleStudentSearchError = (error: any) => {
  let mensajeError = 'Error al buscar estudiante. Intente nuevamente.';
  
  if (error.name === 'AbortError') {
    mensajeError = 'Tiempo de espera excedido. Revise su conexión.';
  } else if (error.response?.status === 404) {
    mensajeError = 'Servicio de búsqueda no disponible temporalmente.';
  } else if (error.response?.status === 429) {
    mensajeError = 'Demasiados intentos. Espere 1 minuto antes de volver a intentar.';
  } else if (error.message) {
    mensajeError = error.message;
  }
  
  toast.error(mensajeError, {
    ...getToastOptions(6000),
    pauseOnHover: true
  });
};

const validateForm = (): boolean => {
  // Validaciones básicas - expandir según necesidades
  return !!(
    form.reporteNombre1 && 
    form.estudianteNombre && 
    form.estudiantePaterno && 
    (form.estudianteCedulaIdentidad || form.estudianteCodigoRude)
  );
};


const handleSaveSuccess = () => {
  toast.success('Registros guardados correctamente', getToastOptions());
  dialogSave.value = true;
  localStorage.setItem('existeEnBD', 'true');
  registroExiste.value = true;
};

const resetForm = () => {
  Object.assign(form, {
    reporteNombre1: null,
    reporteNombre2: null,
    reporteNombre3: null,
    estudianteCodigoRude: '',
    estudianteCedulaIdentidad: '',
    estudianteComplemento: ' ',
    estudiantePaterno: '',
    estudianteMaterno: '',
    estudianteNombre: '',
    estudianteFechaNacimiento: '',
    estudianteEdad: '',
    estudianteGrado: '',
    estudianteNivel: '',
    dispacidad: false,
    dispacidadCognitiva: false,
    dispacidadVisual: false,
    dispacidadAuditiva: false,
    dispacidadMotriz: false,
    dispacidadOtro: false,
    unionTemprana: false,
    validado: false
  });
  
  dialogSave.value = false;
};

const formatDateInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const cleaned = input.value.replace(/\D/g, '');
  let formatted = '';
  
  if (cleaned.length >= 2) {
    formatted += cleaned.substring(0, 2);
    if (cleaned.length >= 4) {
      formatted += '/' + cleaned.substring(2, 4);
      if (cleaned.length >= 8) {
        formatted += '/' + cleaned.substring(4, 8);
      } else if (cleaned.length > 4) {
        formatted += '/' + cleaned.substring(4);
      }
    } else {
      formatted += cleaned.substring(2);
    }
  } else {
    formatted = cleaned;
  }
  
  // Limitar a 10 caracteres (DD/MM/YYYY)
  if (formatted.length > 10) {
    formatted = formatted.substring(0, 10);
  }
  
  form.estudianteFechaNacimiento = formatted;
  input.value = formatted;
};
// ===== UTILIDADES LOCALES =====
/**
 * Formatea una fecha en formato DD/MM/YYYY para enviar a la API en formato ISO
 */
const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return '';
  
  // Si ya está en formato ISO, devolverlo directamente
  if (dateString.includes('T')) return dateString;
  
  // Formato DD/MM/YYYY
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }
  
  // Intentar parsear de otras formas
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }
  
  return '';
};

/**
 * Formatea una fecha ISO para mostrar en el campo de entrada como DD/MM/YYYY
 */
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Si ya está en formato DD/MM/YYYY, devolverlo directamente
  if (dateString.includes('/')) return dateString;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

const formatDateForInput = (fecha: string): string => {
 
  if (!fecha) return '';

  // Validar y convertir formato DD/MM/YYYY a YYYY-MM-DD
  const partes = fecha.split('/');
  if (partes.length === 3) {
    const [dia, mes, anio] = partes;
    form.estudianteFechaNacimiento = `${anio}-${mes.padStart(2,'0')}-${dia.padStart(2,'0')}`;
  }
}



/**
 * Valida los criterios de búsqueda para estudiante
 */
const validateStudentSearchCriteria = (rude: string, nombre: string,
    paterno: string, materno: string, fechaNac: string  ): boolean => {
  return !!rude.trim() || !!nombre.trim() || !!paterno.trim() || !!materno.trim() 
           !!fechaNac.trim()     ;
};

const startLoading = () => {
  isLoading.value = true;
};

const stopLoading = () => {
  isLoading.value = false;
};

const startEstudianteLoading = () => {
  isLoadingEstudiante.value = true;
};

const stopEstudianteLoading = () => {
  isLoadingEstudiante.value = false;
};

// ===== UTILIDADES =====
const getToastOptions = (autoClose: number = 3000): ToastOptions => ({
  autoClose,
  position: toast.POSITION.TOP_RIGHT
});

// ===== COMPUTED PROPERTIES =====
const showDiscapacidadDetails = computed(() => form.dispacidad);

const canSave = computed(() => 
  form.reporteNombre1 && 
  (form.estudianteCedulaIdentidad || form.estudianteCodigoRude) &&
  form.estudianteNombre &&
  form.estudiantePaterno
);
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card elevation="8" class="elevation-8 rounded-xl">
          <v-card-title class="text-h5 font-weight-bold bg-primary text-white rounded-t-xl">
            Registro de estudiante embarazada
          </v-card-title>
   <v-card-text>
  <v-form @submit.prevent>
    <v-row>
      <!-- Datos de Unidad Educativa -->
      <v-col cols="12">
        <h3 class="text-h6 font-weight-medium mt-4 mb-2 text-primary">
          <v-icon icon="mdi-school" class="mr-2" /> Datos de la Unidad Educativa
        </h3>
        <v-divider class="mb-4" />
      </v-col>

      <v-col cols="12" md="4"><v-text-field v-model="form.codSie" label="SIE" readonly variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="8"><v-text-field v-model="form.unidadEducativa" label="Unidad Educativa" readonly variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="4"><v-text-field v-model="form.departamentoNombre" label="Departamento" readonly variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="4"><v-text-field v-model="form.municipioNombre" label="Distrito" readonly variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="4"><v-text-field v-model="form.nivel" label="Nivel" readonly variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="4"><v-text-field v-model="form.modalidad" label="Modalidad" readonly variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="8"><v-text-field v-model="form.director" label="Director" readonly variant="outlined" density="comfortable" hide-details /></v-col>

      <!-- ¿Quién informa el embarazo? -->
      <v-col cols="12">
        <h3 class="text-h6 font-weight-medium mt-6 mb-2 text-primary">
          <v-icon icon="mdi-account-question" class="mr-2" /> ¿Quién informa el embarazo?
        </h3>
        <v-divider class="mb-4" />
      </v-col>
      <v-col cols="12" md="4">
        <v-select v-model="form.reporteNombre1" :items="personaReporteTipo" item-title="name" item-value="id" label="Reporte 1"
          variant="outlined" density="comfortable" hide-details return-object />
      </v-col>

      <!-- Datos de la estudiante embarazada -->
      <v-col cols="12">
        <h3 class="text-h6 font-weight-medium mt-6 mb-2 text-primary">
          <v-icon icon="mdi-account" class="mr-2" /> Datos de la estudiante embarazada
        </h3>
        <v-divider class="mb-4" />
      </v-col>

      <v-col cols="12" md="4"><v-text-field v-model="form.estudianteCodigoRude" label="Código RUDE" variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="3"><v-text-field v-model="form.estudianteCedulaIdentidad" label="Cédula de Identidad" variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="2"><v-text-field v-model="form.estudianteComplemento" label="Complemento..." variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="3"><v-text-field v-model="form.estudianteFechaNacimiento" label="DD/MM/AAAA" variant="outlined" density="comfortable" hide-details @input="formatDateInput" maxlength="10" /></v-col>
      <v-col cols="12" md="4"><v-text-field v-model="form.estudiantePaterno" label="Apellido Paterno" variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="4"><v-text-field v-model="form.estudianteMaterno" label="Apellido Materno" variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="4"><v-text-field v-model="form.estudianteNombre" label="Nombre(s)" variant="outlined" density="comfortable" hide-details append-inner-icon="mdi-magnify" @click:append-inner="findEstudiante" :loading="isLoadingEstudiante" /></v-col>
      <v-col cols="12" md="4"><v-text-field v-model="form.estudianteNivel" label="Nivel" readonly variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="4"><v-text-field v-model="form.estudianteGrado" label="Grado" readonly variant="outlined" density="comfortable" hide-details /></v-col>
      <v-col cols="12" md="4"><v-text-field v-model="form.estudianteEdad" label="Edad" type="number" min="0" readonly variant="outlined" density="comfortable" hide-details /></v-col>

      <!-- Discapacidad -->
      <v-col cols="12"><v-checkbox v-model="form.dispacidad" label="¿La adolescente tiene discapacidad?" color="primary" /></v-col>
      <v-col cols="12" v-if="showDiscapacidadDetails">
        <v-card variant="tonal" class="pa-4 mt-2">
          <v-card-title class="text-subtitle-1 font-weight-medium pb-0">¿Qué tipo de discapacidad tiene?</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-checkbox v-model="form.dispacidadCognitiva" label="Cognitiva" />
                <v-checkbox v-model="form.dispacidadVisual" label="Visual" />
                <v-checkbox v-model="form.dispacidadAuditiva" label="Auditiva" />
              </v-col>
              <v-col cols="12" md="6">
                <v-checkbox v-model="form.dispacidadMotriz" label="Motriz" />
                <v-checkbox v-model="form.dispacidadOtro" label="Otro" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Unión temprana -->
      <v-col cols="12">
        <h3 class="text-h6 font-weight-medium mt-6 mb-2 text-primary">
          <v-icon icon="mdi-heart" class="mr-2" /> Unión temprana edad
        </h3>
        <v-divider class="mb-4" />
      </v-col>
      <v-col cols="12"><v-checkbox v-model="form.unionTemprana" label="La adolescente actualmente está casada o convive en pareja" color="primary" /></v-col>

      <!-- Botones -->
      <v-col cols="12" class="d-flex justify-end pt-6">
        <v-btn color="primary" size="large" rounded="xl" :loading="isLoading" :disabled="!canSave" @click="dialog = true" prepend-icon="mdi-content-save">
          Registrar
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</v-card-text>

        </v-card>
      </v-col>
    </v-row>
    
    <!-- Diálogo de confirmación -->
    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6 bg-primary text-white">
          Confirmar Registro
        </v-card-title>
        <v-card-text class="mt-4">
          ¿Está seguro de que desea guardar el registro de la estudiante embarazada?
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey"
            rounded="xl"
            @click="dialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="xl"
            @click="save"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Diálogo de nuevo registro -->
    <v-dialog v-model="dialogSave" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6 bg-primary text-white">
          Nuevo Registro
        </v-card-title>
        <v-card-text class="mt-4">
          ¿Desea realizar un nuevo registro? (Si ya añadió el registro y quiere modificarlo, seleccione NO)
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            rounded="xl"
            @click="router.push('/convivencia/pacifica')"
          >
            NO
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="xl"
            @click="resetForm"
          >
            SI
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.v-card {
  border-radius: 16px !important;
}

.v-text-field, .v-select {
  margin-top: 8px;
}

.bg-primary {
  background-color: rgb(var(--v-theme-primary)) !important;
}
</style>