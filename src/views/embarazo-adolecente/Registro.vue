<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
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
  constId: number | null;
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
  discapacidad: boolean;
  discapacidadCognitiva: boolean;
  discapacidadVisual: boolean;
  discapacidadAuditiva: boolean;
  discapacidadMotriz: boolean;
  discapacidadOtro: boolean;
  unionTemprana: boolean;
  id_emb_informe_embarazo: number | null;
  id_emb_estudiante_embarazo: number | null;
  validado: boolean;
}

// ===== ESTADO REACTIVO =====
const router = useRouter();

const form = reactive<FormEstudianteData>({
  username: '',
  idUE: '',
  constId: null,
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
  discapacidad: false,
  discapacidadCognitiva: false,
  discapacidadVisual: false,
  discapacidadAuditiva: false,
  discapacidadMotriz: false,
  discapacidadOtro: false,
  unionTemprana: false,
  id_emb_informe_embarazo: null,
  id_emb_estudiante_embarazo: null,
  validado: false
});

// Estado de loading
const isLoading = ref(false);
const isLoadingEstudiante = ref(false);
const valid = ref(false);

// Otros estados
const dialog = ref(false);
const dialogSave = ref(false);
const find = ref(false);

// Datos externos
const institucionEducativa = ref<UnidadEducativa | null>(null);

// Datos de sesión
const username = ref(localStorage.getItem('username') || '');
const registroExiste = ref(localStorage.getItem('existeEnBD') === 'true');
const isFormDisabled = ref(registroExiste.value);
const idUE = ref(localStorage.getItem('idUE') || ''); 
const constId = ref(localStorage.getItem('constId') || ''); 
const codSie = ref(localStorage.getItem('codigo_sie') || '');

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

// ===== MÉTODOS PRINCIPALES =====
onMounted(async () => {
  console.log(`Iniciando componente con SIE: ${codSie.value} y usuario: ${username.value}`);
  console.log('onMounted idUE.value:', idUE.value);
  console.log('onMounted form.constId:', form.constId);
    await loadInitialData();
console.log('==================================================================================');
    console.log('Ingresando con if= registroExiste y disabled= isFormDisabled : ', registroExiste.value, isFormDisabled.value);
    console.log(' onMounted->loadInitialData -> form.constId : ', form.constId);


   // console.warn('Error al cargar datos reales, cargando datos de ejemplo:', error);
   // Si no hay datos después de intentar cargar los reales, usar datos de ejemplo
  //if (!form.unidadEducativa) {
 //   loadMockData();
 // }
    form.estudianteCodigoRude= '81981532201336'
    form.estudianteCedulaIdentidad= ''
    form.estudianteComplemento= ''
    form.estudiantePaterno= 'ARAMAYO'
    form.estudianteMaterno='CHAMO'
    form.estudianteNombre= 'ALEJANDRA MARIEL'
    form.estudianteFechaNacimiento= '01/04/2009'

});

const loadInitialData = async () => {
  startLoading();

  try {
    if (!codSie.value) {
      toast.error('Usuario no válido o sin SIE asignado', getToastOptions());
      return;
    }

    form.username = username.value;
    form.idUE = idUE.value;

    const constId = await ConvivenciaPacifica.findIdConstByCiAndUeSetVariables(form);
    
    if (!constId || constId == 0) {
      toast.warn('No se encontró registro de construcción PCPA. No se puede cargar ni guardar.', getToastOptions(4000));
      isFormDisabled.value = true;
      return;
    }

    if (!idUE.value || idUE.value == '') {
      toast.warn('No se encontró registro de UE. No se puede cargar ni guardar.', getToastOptions(4000));
      isFormDisabled.value = true;
      return;
    }

    isFormDisabled.value = false;
    form.constId = constId;
    form.codSie = codSie.value;

    const results = await Promise.allSettled([
      findUnidadesEducativasPorDirector()
    ]);

    if (results[0].status === 'rejected') {
      console.error("findUnidadesEducativasPorDirector -> Error al cargar datos de UE:", results[0].reason);
      toast.error('No se pudieron cargar los datos de la Unidad Educativa.', { autoClose: 3000 });
    }

  } catch (error: any) {
    console.error("Error al cargar datos iniciales:", error);
    toast.error(`Error al cargar datos iniciales. Por favor, intente nuevamente: ${error.message || 'Error desconocido'}`, getToastOptions());
    isFormDisabled.value = true;
  } finally {
    stopLoading();
  }
};

// ===== MÉTODOS DE GUARDADO =====

const save = async () => {
  if (!validateForm()) {
    toast.warning('Complete todos los campos requeridos antes de guardar', getToastOptions());
    return;
  }

  startLoading();
  dialog.value = false;

  try {
    const isUpdate = form.id_emb_informe_embarazo;
    let informeRes;
    let estudianteRes;

    // Lógica para el Informe de Embarazo (CREATE o UPDATE)
    let infPayload = null;
    if (isUpdate) {
      infPayload = informePayload('MODIFICADO');
      const informeId = form.id_emb_informe_embarazo ;
      informeRes = await EstudianteEmbarazo.updateInformeEmbarazo(informeId, infPayload);
      
      if (informeRes.status !== 200) {
        throw new Error('Error al actualizar el informe de embarazo');
      }
    } else {
      infPayload = informePayload('ACTIVO');
      informeRes = await EstudianteEmbarazo.createInformeEmbarazo(infPayload);

      if (informeRes.status !== 201) {
        throw new Error('Error al crear el informe de embarazo');
      }
    }

    // Lógica para el Registro del Estudiante (CREATE o UPDATE)
    const informeRelacionId = isUpdate ? form.id_emb_informe_embarazo : informeRes.data.id;
    let estudPayload = null;
     
    if (isUpdate) {
      estudPayload = estudiantePayload(informeRelacionId, 'MODIFICADO');
      estudianteRes = await EstudianteEmbarazo.updateEstudianteEmbarazo(form.id_emb_estudiante_embarazo, estudPayload);
      console.log('UPDATE estudPayload:', estudPayload);

      if (estudianteRes.status !== 200) {
        throw new Error('Error al actualizar el registro del estudiante');
      }
    } else {
      estudPayload = estudiantePayload(informeRelacionId, 'ACTIVO');
      estudianteRes = await EstudianteEmbarazo.createEstudianteEmbarazo(estudPayload);
      console.log('CREATE estudPayload:', estudPayload);

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

const informePayload = (estado: string) => {
  const usu_cre = estado === 'ACTIVO' ? username.value : null;
  const fec_cre = estado === 'ACTIVO' ? new Date().toISOString() : null;
  const usu_mod = estado === 'MODIFICADO' ? username.value : null;
  const fec_mod = estado === 'MODIFICADO' ? new Date().toISOString() : null;

  return {
    id_pcpa_unidad_educativa: form.idUE,
    id_emb_reporte_embarazo_tipo_1: form.reporteNombre1?.id,
    id_emb_reporte_embarazo_tipo_2: form.reporteNombre2?.id,
    id_emb_reporte_embarazo_tipo_3: form.reporteNombre3?.id,
    usu_cre,
    fec_cre,
    usu_mod,
    fec_mod,
    estado
  };
};

const estudiantePayload = (idInforme: number, estado: 'ACTIVO' | 'MODIFICADO') => {

  const usu_cre = estado === 'ACTIVO' ? username.value : null;
  const fec_cre = estado === 'ACTIVO' ? new Date().toISOString() : null;
  const usu_mod = estado === 'MODIFICADO' ? username.value : null;
  const fec_mod = estado === 'MODIFICADO' ? new Date().toISOString() : null;

  return {
    id_pcpa_unidad_educativa: form.idUE,
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
    check_estudiante_discapacidad: form.discapacidad || false,
    dis_cognitiva: form.discapacidadCognitiva || false,
    dis_visual: form.discapacidadVisual || false,
    dis_auditiva: form.discapacidadAuditiva || false,
    dis_motriz: form.discapacidadMotriz || false,
    dis_otro: form.discapacidadOtro || false,
    check_estudiante_conviviente: form.unionTemprana || false,
    usu_cre,
    fec_cre,
    usu_mod,
    fec_mod,
    estado
  };
};

const handleSaveSuccess = (action: string) => {
  toast.success(`Registro(s) ${action} correctamente`, getToastOptions());
  dialogSave.value = true;
  localStorage.setItem('existeEnBD', 'true');
  registroExiste.value = true;
};

// ===== MÉTODOS DE BÚSQUEDA =====

const findEstudianteEmbarazada = async () => {
  const estudianteFecNac = formatDateForInput(form.estudianteFechaNacimiento);
  form.estudianteFechaNacimiento = estudianteFecNac;

  if (!validateStudentSearchCriteria(
    form.estudianteCodigoRude,
    form.estudianteNombre,
    form.estudiantePaterno,
    form.estudianteMaterno,
    form.estudianteFechaNacimiento
  )) {
    toast.warning('Ingrese al menos un criterio de búsqueda válido.', getToastOptions());
    return;
  }

  startEstudianteLoading();
  
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 10000);

  let estudianteEncontrado: any | null = null;

  try {
   
    try { // Búsqueda en la Base de Datos Local
      const resLocal = await EstudianteEmbarazo.findEstudianteEmbarazoByCodRude(form.estudianteCodigoRude);
      
      if (resLocal.status === 200 && resLocal.data?.length > 0) {
        estudianteEncontrado = resLocal.data;
        console.log("Estudiante encontrado en BD local:", estudianteEncontrado);
      }
    } catch (localError) {
      console.warn("Error al buscar en BD local (se intentará con SIE):", localError);
    }

    // Búsqueda en API SIE (Fallback)
    if (!estudianteEncontrado) {
      console.log("**************************************");
      console.log("Estudiante No encontrado localmente. Buscando en API SIE...");
      
      const resSie = await EstudianteEmbarazo.findEstudianteEmbarazoApiSie({
        ...form,
        signal: abortController.signal
      });

      if (resSie?.data) {
        const sieData = Array.isArray(resSie.data) ? resSie.data : [resSie.data];
        
        if (sieData.length > 0) {
          estudianteEncontrado = sieData[0];
          console.log("Estudiante encontrado en API SIE:", estudianteEncontrado);
        }
      }
    }

    // Procesamiento del Resultado
    if (estudianteEncontrado) {
      isFormDisabled.value = false;
      let estudiante;

      if (Array.isArray(estudianteEncontrado)) {
        estudiante = estudianteEncontrado[0];
      } else {
        estudiante = estudianteEncontrado.data[0];
      }

      populateFormWithStudentData(estudiante);
      
      toast.success(`Estudiante encontrado: ${form.estudianteNombre || ''} ${form.estudiantePaterno || ''}`, {
        ...getToastOptions(4000),     icon: '✅'      });
    } else {
     // isFormDisabled.value = true;
      resetStudentValidation();
      toast.info('No se encontró ningún estudiante con los criterios proporcionados', {
        ...getToastOptions(3000),   icon: '🔍'      });

       // Si no hay datos después de intentar cargar los reales, usar datos de ejemplo
        //if (!form.unidadEducativa) {
          loadMockData();
      // }  
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      toast.error('Tiempo de espera excedido en la búsqueda. Intente con menos criterios.', getToastOptions(6000));
      console.warn('Búsqueda cancelada por timeout');
    } else {
      console.error('[findEstudianteEmbarazada] Error detallado:', error);
     resetStudentValidation();
      handleStudentSearchError(error);
    }
  } finally {
    clearTimeout(timeoutId);
    abortController.abort();
    form.estudianteFechaNacimiento = formatDateFromAPI(estudianteFecNac);
    stopEstudianteLoading();
  }
};

const populateFormWithStudentData = (estudiante: any) => {
  Object.assign(form, {
    validado: true,
    codSie: estudiante.codigo_sie,
    id_emb_informe_embarazo: estudiante.id_emb_informe_embarazo || null,
    id_emb_estudiante_embarazo: estudiante.id_emb_estudiante_embarazo || null,
   
    estudianteNivel: estudiante.nivel || form.estudianteNivel,
    estudianteGrado: estudiante.grado || form.estudianteGrado,
    estudianteEdad: estudiante.edad || asignarEdad(form.estudianteFechaNacimiento),
  //  id_emb_informe_embarazo: estudiante.id_emb_informe_embarazo || null,
  //  id_emb_estudiante_embarazo: estudiante.id_emb_estudiante_embarazo || null,
    discapacidad: estudiante.check_estudiante_discapacidad || false,
    discapacidadCognitiva: estudiante.dis_cognitiva || false,
    discapacidadVisual: estudiante.dis_visual || false,
    discapacidadAuditiva: estudiante.dis_auditiva || false,
    discapacidadMotriz: estudiante.dis_motriz || false,
    discapacidadOtro: estudiante.dis_otro || false,
    unionTemprana: estudiante.check_estudiante_conviviente || false
  });
  console.log('populateFormWithStudentData -> form->target:', printTarget(form));
};

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
      toast.info('No se encontró institución educativa para el CODIGO SIE proporcionado', getToastOptions());
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


// ===== UTILIDADES =====

const printTarget = (obj: any) => {
  const target = obj?.__v_raw ? obj.__v_raw : obj;
  return target;
};

const asignarEdad = (fechaNacimiento: string) => {
  if (!fechaNacimiento) {
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
  const requiredFields: { key: keyof typeof form; label: string }[] = [
    { key: 'reporteNombre1', label: 'Nombre del reporte' },
    { key: 'estudianteNombre', label: 'Nombre del estudiante' },
    { key: 'estudiantePaterno', label: 'Apellido paterno' },
    { key: 'estudianteMaterno', label: 'Apellido materno' },
    { key: 'estudianteEdad', label: 'Edad del estudiante' },
    { key: 'estudianteGrado', label: 'Grado' },
    { key: 'estudianteNivel', label: 'Nivel' },
  ];

  const missingFields = requiredFields
    .filter(f => !form[f.key])
    .map(f => f.label);

  if (missingFields.length > 0) {
    toast.info(`Estos campos están vacíos: ${missingFields.join(', ')}`,
      { autoClose: 3500, position: toast.POSITION.TOP_RIGHT });
    return false;
  }

  return true;
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
  
  if (formatted.length > 10) {
    formatted = formatted.substring(0, 10);
  }
  
  form.estudianteFechaNacimiento = formatted;
  input.value = formatted;
};

const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return '';
  
  if (dateString.includes('T')) return dateString;
  
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }
  
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }
  
  return '';
};

const formatDateFromAPI = (isoString: string): string => {
  if (!isoString) return '';
  
  if (isoString.includes('/')) return isoString;
  
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

const formatDateForInput = (fecha: string): string => {
  if (!fecha) return '';

  const partes = fecha.split('/');
  if (partes.length === 3) {
    const [dia, mes, anio] = partes;
    return `${anio}-${mes.padStart(2,'0')}-${dia.padStart(2,'0')}`;
  }
  return '';
};

const validateStudentSearchCriteria = (
  rude: string, 
  nombre: string,
  paterno: string, 
  materno: string, 
  fechaNac: string
): boolean => {
  return !!rude.trim() || !!nombre.trim() || !!paterno.trim() || !!materno.trim() || !!fechaNac.trim();
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

const getToastOptions = (autoClose: number = 3000): ToastOptions => ({
  autoClose,
  position: toast.POSITION.TOP_RIGHT
});

const loadMockData = () => {
  console.log('Cargando datos de ejemplo para desarrollo');
  
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
  
  toast.info('Usando datos de ejemplo para visualización', {
    autoClose: 3000,
    position: toast.POSITION.TOP_RIGHT
  });
};
// ===== MÉTODOS PARA NAVEGACIÓN =====
const recargarPagina = () => {
  console.log('recargarPagina.');
  isFormDisabled.value = false;
  window.location.href = '/embarazo/adolecente/registro';
};

// ===== COMPUTED PROPERTIES =====
const showDiscapacidadDetails = computed(() => form.discapacidad);

const canSave = computed(() => 
  form.reporteNombre1 && 
  (form.estudianteCedulaIdentidad || form.estudianteCodigoRude) &&
  form.estudianteNombre &&
  form.estudiantePaterno
);

// ===== WATCHERS =====
watch(() => form.discapacidad, (newValue) => {
  if (!newValue) {
    form.discapacidadCognitiva = false;
    form.discapacidadVisual = false;
    form.discapacidadAuditiva = false;
    form.discapacidadMotriz = false;
    form.discapacidadOtro = false;
  }
});

</script>

<template>
  <v-row>
    <v-col cols="12" lg="12" sm="12">
      <v-card elevation="10" class="withbg">
        <v-card-item>
          <v-card-title class="text-h5">Registro de estudiante embarazada</v-card-title>

          <v-form v-model="valid" class="mt-4">
            <v-container>
              <v-row>
                <!-- Datos de la Unidad Educativa -->
                <v-col cols="12">
                  <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos de la Unidad Educativa</span>
                  </div>
                </v-col>

                <v-col cols="12" md="4"><v-text-field v-model="form.codSie" label="SIE" :readonly="true" variant="outlined" density="comfortable" hide-details /></v-col>
                <v-col cols="12" md="8"><v-text-field v-model="form.unidadEducativa" label="Unidad Educativa" :readonly="true" variant="outlined" density="comfortable" hide-details /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.departamentoNombre" label="Departamento" :readonly="true" variant="outlined" density="comfortable" hide-details /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.municipioNombre" label="Distrito" :readonly="true" variant="outlined" density="comfortable" hide-details /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.nivel" label="Nivel" :readonly="true" variant="outlined" density="comfortable" hide-details /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.modalidad" label="Modalidad" :readonly="true" variant="outlined" density="comfortable" hide-details /></v-col>
                <v-col cols="12" md="8"><v-text-field v-model="form.director" label="Director" :readonly="true" variant="outlined" density="comfortable" hide-details /></v-col>

                <!-- ¿Quién informa el embarazo? -->
                <v-col cols="12">
                  <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">¿Quién informa el embarazo?</span>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select v-model="form.reporteNombre1" :items="personaReporteTipo" item-title="name" item-value="id" label="Reporte 1" variant="outlined" density="comfortable" hide-details return-object />
                </v-col>

                <!-- Datos de la estudiante embarazada -->
                <v-col cols="12">
                  <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos de la estudiante embarazada</span>
                  </div>
                </v-col>

             <v-col cols="12" md="4">
                                    <v-text-field v-model="form.estudianteCodigoRude" label="Código RUDE" variant="outlined" density="comfortable" hide-details />
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="form.estudianteCedulaIdentidad" label="Cédula de Identidad" variant="outlined" density="comfortable" hide-details />
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-text-field v-model="form.estudianteComplemento" label="Complemento..." variant="outlined" density="comfortable" hide-details />
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="form.estudianteFechaNacimiento" label="DD/MM/AAAA" variant="outlined" density="comfortable" hide-details @input="formatDateInput" maxlength="10" />
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.estudiantePaterno" label="Apellido Paterno" variant="outlined" density="comfortable" hide-details />
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.estudianteMaterno" label="Apellido Materno" variant="outlined" density="comfortable" hide-details />
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.estudianteNombre" label="Nombre(s)" variant="outlined" density="comfortable" hide-details append-inner-icon="mdi-magnify" @click:append-inner="findEstudianteEmbarazada" :disabled="isFormDisabled" :loading="isLoadingEstudiante" />
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.estudianteNivel" label="Nivel" :readonly="true" variant="outlined" density="comfortable" hide-details />
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.estudianteGrado" label="Grado" :readonly="true" variant="outlined" density="comfortable" hide-details />
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.estudianteEdad" label="Edad" type="number" min="0" :readonly="true" variant="outlined" density="comfortable" hide-details />
                                </v-col>
                            
                <!-- Discapacidad -->
                <v-col cols="12"><v-checkbox v-model="form.discapacidad" label="¿La adolescente tiene discapacidad?" color="primary" :disabled="isFormDisabled" /></v-col>
                
                <v-col cols="12" v-if="showDiscapacidadDetails">
                  <v-card variant="tonal" class="pa-4 mt-2">
                    <v-card-title class="text-subtitle-1 font-weight-medium pb-0">¿Qué tipo de discapacidad tiene?</v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-checkbox v-model="form.discapacidadCognitiva" label="Cognitiva" :disabled="isFormDisabled" />
                          <v-checkbox v-model="form.discapacidadVisual" label="Visual" :disabled="isFormDisabled" />
                          <v-checkbox v-model="form.discapacidadAuditiva" label="Auditiva" :disabled="isFormDisabled" />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-checkbox v-model="form.discapacidadMotriz" label="Motriz" :disabled="isFormDisabled" />
                          <v-checkbox v-model="form.discapacidadOtro" label="Otro" :disabled="isFormDisabled" />
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Unión temprana -->
                <v-col cols="12">
                  <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Unión temprana edad</span>
                  </div>
                </v-col>
                <v-col cols="12"><v-checkbox v-model="form.unionTemprana" label="La adolescente actualmente está casada o convive en pareja" color="primary" :disabled="isFormDisabled" />
                </v-col>
                         <!-- Diálogo de confirmación -->
                  <v-col cols="12" md="12">
                        <v-dialog v-model="dialog" persistent width="auto">
                          <template v-slot:activator="{ props }">
                            <v-btn size="large" rounded="pill" color="primary" class="rounded-pill" block type="button" flat v-bind="props"
                            :disabled="isFormDisabled">Registrar</v-btn>
                          </template>
                          <v-card>
                            <v-card-title class="text-h5">Confirmar</v-card-title>
                            <v-card-text>¿Está seguro de guardar el registro?</v-card-text>
                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn color="green-darken-1" variant="text" @click="dialog = false">Cancelar</v-btn>
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


  <!-- Diálogo de nuevo registro -->
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