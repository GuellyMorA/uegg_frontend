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
  institucioneducativa: string;
  id: number;
  [key: string]: any;
}

interface EstudianteEmbarazoData {
  id: number;
  nombres_estudiante: string;
  apellido_pat_estudiante: string;
  apellido_mat_estudiante: string;
  complemento: string;
  fec_nacimiento: string;
  cod_rude: string;
  [key: string]: any;
}

interface ConstruccionData {
  id: number;
  [key: string]: any;
}

interface SeguimientoForm {
        // IDs   
  id_estudiante_derechos: number | null;  
  id_pcpa_unidad_educativa: number | null;
  id_emb_informe_embarazo:number | null;
id_seguimiento_actuacion:number | null;

  username: string | null;
  idUE: string | null;
  codSie: string | null;
  sie: string | null;
  constId: number | null;


  unidadEducativa: string;
  codigoRude: string;
  estudiante: string;

  semanaGestacion: number | null;
  numeroEmbarazo: number | null;

  fechaEstimadaParto: string | null;

  recibeControlPrenatal: boolean;
  requiereBajaMedica: boolean;
  requierePermisoControl: boolean;
  //permisoControlPrenatal: boolean;

  requiereCuidadoPostparto: boolean;
  consideracionActividades: boolean;

 // fechaBajaPrenatal: string | null;
  //fechaConclusionPostnatal: string | null;
    fechaInicioBajaPrenatal: string | null;
  fechaFinBajaPostnatal: string | null;
  fechaRetorno: string | null;

  edadProgenitor: number | null;
  progenitorMismaUnidadEducativa: boolean;
  nacidoVivo: boolean;
  progenitorConoceEmbarazo: boolean;

  bajaMedica: boolean;


  diasBajaMedica: number | null;
  diasPermisoControl: number | null;

  director: string;
  accionesSeguimiento: boolean;

  validado: boolean;
};

const form = reactive<SeguimientoForm>({
          // IDs   
  id_estudiante_derechos:null,
  id_pcpa_unidad_educativa: null,
  id_emb_informe_embarazo:null,
id_seguimiento_actuacion:null,
  username: '',
  idUE: '',
  codSie: '',
  constId: null,
  sie: '',

  unidadEducativa: '',
  codigoRude: '',
  estudiante: '',

  semanaGestacion: null,
  numeroEmbarazo: null,

  fechaEstimadaParto: null,

  recibeControlPrenatal: false,
  requiereBajaMedica: false,
  requierePermisoControl: false,

  //permisoControlPrenatal: boolean;

  requiereCuidadoPostparto: false,
  consideracionActividades: false,

 // fechaBajaPrenatal: null,
  //fechaConclusionPostnatal: null,
      fechaInicioBajaPrenatal: null,
  fechaFinBajaPostnatal:  null,
  fechaRetorno: null,

  edadProgenitor: null,
  progenitorMismaUnidadEducativa: false,
  nacidoVivo: false,
  progenitorConoceEmbarazo: false,

  bajaMedica: false,
 
  diasBajaMedica:  null,
  diasPermisoControl:  null,

  director: '',
  accionesSeguimiento: false,

  validado: false
});

// ===== ESTADO REACTIVO =====
const router = useRouter();
// Estado de loading
const isLoading = ref(false);
const isLoadingEstudiante = ref(false);
const valid = ref(false);

// Otros estados
const dialog = ref(false);
const dialogSave = ref(false);
const find = ref(false);
const findEstudiante = ref(false);
const variusSie = ref(false);

// Datos externos
const construccion = ref<ConstruccionData | null>(null);
const institucionEducativa = ref<UnidadEducativa | null>(null);
const estudiante = ref<EstudianteEmbarazoData | null>(null);
//const seguimientoExistente = ref<SeguimientoActuacion | null>(null);

// Datos de sesión
const username = ref(localStorage.getItem('username') || '');
const registroExiste = ref(localStorage.getItem('existeEnBD') === 'true');
const isFormDisabled = ref(registroExiste.value);
const idUE = ref(localStorage.getItem('idUE') || '');
const constId = ref(localStorage.getItem('constId') || ''); 
const codSie = ref(localStorage.getItem('codigo_sie') || '');

// ===== REGLAS DE VALIDACIÓN =====
const sieRules = [
  (value: any) => {
    if (value) return true;
    return 'El SIE es requerido';
  },
  (value: any) => {
    if (value?.length === 8) return true;
    return 'El código SIE requiere 8 dígitos.';
  },
];


// ===== MÉTODOS DE CARGA INICIAL =====

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
  //  loadMockData();
 // }
          form.sie= '12345678'
    form.unidadEducativa= 'UNIDAD EDUCATIVA EJEMPLO'
    form.codigoRude= '81981532201336'
   // form.estudiante= 'ALEJANDRA MARIEL ARAMAYO CHAMO'
   // form.complemento: 'A',
   // form.fechaNacimiento: '2006-01-15',
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
      dialog.value = false;
      return;
  }

  startLoading();
  dialog.value = false;

  try {
    
    const isUpdate = !!form.id_seguimiento_actuacion;
    let resultado;
    
    if (isUpdate && form.id_seguimiento_actuacion) {
      resultado = await updateSeguimiento(form.id_emb_informe_embarazo);
    } else {
      resultado = await createSeguimiento(form.id_emb_informe_embarazo);
    }
    
    if (resultado) {
      handleSaveSuccess(isUpdate ? 'actualizado' : 'creado');
    }

  } catch (error: any) {
    console.error('Error al guardar:', error);
    toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`, getToastOptions());
  } finally {
    stopLoading();
  }
};

const createSeguimiento = async (informeRelacionId: number) => {

  const  payload = seguimientoActuacionPayload(informeRelacionId,'ACTIVO');
  const res = await EstudianteEmbarazo.createEstudianteDerechos(payload);
  
  if (res.status !== 201) {
    throw new Error('Error al crear el seguimiento de actuación');
  }
  
  return res.data;
};

const updateSeguimiento = async (informeRelacionId: number) => {
  
   const  payload = seguimientoActuacionPayload(informeRelacionId,'MODIFICADO');

  const res = await EstudianteEmbarazo.updateEstudianteDerechos(form.id_seguimiento_actuacion, payload);
  
  if (res.status !== 200) {
    throw new Error('Error al actualizar el seguimiento de actuación');
  }
  
  return res.data;
};

const seguimientoActuacionPayload = ( idInforme: number | null,  estado: 'ACTIVO' | 'MODIFICADO') => {

  const usu_cre = estado === 'ACTIVO' ? username.value : null;
  const fec_cre = estado === 'ACTIVO' ? new Date().toISOString() : null;
  const usu_mod = estado === 'MODIFICADO' ? username.value : null;
  const fec_mod = estado === 'MODIFICADO' ? new Date().toISOString() : null;

  return {
    // IDs      // id_seguimiento_actuacion: idSeguimiento,
    id_pcpa_unidad_educativa: form.idUE,
    id_emb_informe_embarazo: idInforme,

    // Datos del estudiante
    cod_rude: form.codigoRude,
    nombres_apellidos: form.estudiante,
    complemento: estudiante.value?.complemento || '',
    fec_nacimiento: formatDateForAPI(estudiante.value?.fec_nacimiento || null),

    // Datos del embarazo
    tiempo_gestacion: form.semanaGestacion,
    numero_embarazos: form.numeroEmbarazo,
    fec_estimada_parto: formatDateForAPI(form.fechaEstimadaParto),

    check_recibe_control_prenatal: form.recibeControlPrenatal,
    check_requiere_baja_medica: form.requiereBajaMedica,
    check_requiere_permiso_para_control: form.requierePermisoControl,

    check_requiere_cuidado_especial: form.requiereCuidadoPostparto,

    // Fechas
    fec_ini_baja_prenatal: formatDateForAPI(form.fechaInicioBajaPrenatal),
    fec_fin_baja_postnatal: formatDateForAPI(form.fechaFinBajaPostnatal),
    fec_retorno_a_ue: formatDateForAPI(form.fechaRetorno),

    // Otros
    check_cuenta_con_medidas_ue: form.consideracionActividades,
    check_tutores_al_tanto_emb: form.progenitorConoceEmbarazo,
    check_recibe_baja_medica: form.bajaMedica,

    numero_dias_baja_medica: form.diasBajaMedica ?? null,
    numero_dias_permiso_control: form.diasPermisoControl ?? null,

    persona_asignada_seguimiento: form.director,
    check_cuenta_con_seguimiento: form.accionesSeguimiento,

    // Campos renombrados correctamente
    numero_edad_progenitor: form.edadProgenitor,
    check_progenitor_estudiante_ue: form.progenitorMismaUnidadEducativa,
    check_embarazo_nacido_vivo: form.nacidoVivo,

    // Auditoría
    usu_cre,
    fec_cre,
    usu_mod,
    fec_mod,
    estado
  };
};



const handleSaveSuccess = (action: string) => {
  toast.success(`Seguimiento de actuación ${action} correctamente`, getToastOptions());
  dialogSave.value = true;
  localStorage.setItem('existeEnBD', 'true');
  registroExiste.value = true;
  isFormDisabled.value = true;
};

// ===== MÉTODOS DE BÚSQUEDA =====

const findEstudianteEmbarazada = async () => {

  console.log('Buscando estudiante con código RUDE:', form.codigoRude);
  
  if (!validateStudentSearchCriteria(form.codigoRude)) {
    resetEstudiante();
    toast.warning('Ingrese un código RUDE válido (más de 10 caracteres)', getToastOptions());
    return;
  }

  startEstudianteLoading();

  //  const abortController = new AbortController();
 // const timeoutId = setTimeout(() => abortController.abort(), 15000); // 15 segundos de timeout
  let estudianteEncontrado: any | null = null;

  try { 

    try {// Búsqueda en la Base de Datos Local  
    const resLocal = await EstudianteEmbarazo.findEstudianteDerechosByCodRude(form.codigoRude       );
       
      if (resLocal.status === 200 && resLocal.data?.length > 0) {
        estudianteEncontrado = resLocal.data;
        console.log("Estudiante encontrado en BD local:", estudianteEncontrado);

      }
    } catch (localError) {
      console.warn("Error al buscar en BD local (se intentará con SIE):", localError);
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
     
      form.estudiante = `${estudianteEncontrado[0].nombres_apellidos }`.trim();
    // findEstudiante.value = true; 
    //  form.validado = true;

      //populateFormWithStudentData(estudiante)
 // Rellenar el formulario con los datos existentes
      populateFormWithSeguimientoData(estudiante);
      
      toast.success(`Estudiante encontrado: ${form.estudiante || ', cod_rude: '  || estudianteEncontrado[0].cod_rude }`, {
        ...getToastOptions(4000),     icon: '✅'     });
    } else {
        // isFormDisabled.value = true;
      resetEstudiante();
      toast.info('No se encontró ningún estudiante con el código RUDE proporcionado', {
        ...getToastOptions(3000),      icon: '🔍'     });      
        // Si no hay datos después de intentar cargar los reales, usar datos de ejemplo
        //if (!form.unidadEducativa) {
          loadMockData();
        // }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      toast.error('Tiempo de espera excedido en la búsqueda. Intente nuevamente.', getToastOptions(6000));
      console.warn('Búsqueda de estudiante cancelada por timeout');
    } else {
      console.error('Error al buscar estudiante:', error);
      resetEstudiante();
      handleStudentSearchError(error);
    }
  } finally {
   // clearTimeout(timeoutId);
  //  abortController.abort();
    stopEstudianteLoading();
  }
};


const populateFormWithSeguimientoData = (seguimiento: any) => {
  Object.assign(form, {
    // === IDs ===
    id_estudiante_derechos: seguimiento.id_estudiante_derechos ?? null,
    id_pcpa_unidad_educativa: seguimiento.id_pcpa_unidad_educativa ?? null,
    id_emb_informe_embarazo: seguimiento.id_emb_informe_embarazo ?? null,

    username: seguimiento.username ?? '',
    idUE: seguimiento.idUE ?? '',
    codSie: seguimiento.codSie ?? '',
    sie: seguimiento.codSie ?? '',
    constId: seguimiento.constId ?? null,

    // === Datos principales ===
    codigoRude: seguimiento.cod_rude ?? '',
    // estudiante: seguimiento.nombres_apellidos ?? '', // si lo necesitas puedes habilitarlo

    // === NUMÉRICOS ===
    semanaGestacion: seguimiento.tiempo_gestacion ?? null,
    numeroEmbarazo: seguimiento.numero_embarazos ?? null,
    diasBajaMedica: seguimiento.numero_dias_baja_medica?.toString() ?? '',
    diasPermisoControl: seguimiento.numero_dias_permiso_control?.toString() ?? '',
    edadProgenitor: seguimiento.numero_edad_progenitor ?? null,

    // === FECHAS ===
    fechaEstimadaParto: seguimiento.fec_estimada_parto
      ? formatDateForView(seguimiento.fec_estimada_parto)
      : null,
    fechaInicioBajaPrenatal: seguimiento.fec_ini_baja_prenatal
      ? formatDateForView(seguimiento.fec_ini_baja_prenatal)
      : null,
    fechaFinBajaPostnatal: seguimiento.fec_fin_baja_postnatal
      ? formatDateForView(seguimiento.fec_fin_baja_postnatal)
      : null,
    fechaRetorno: seguimiento.fec_retorno_a_ue
      ? formatDateForView(seguimiento.fec_retorno_a_ue)
      : null,

    // === BOOLEANOS ===
    recibeControlPrenatal: seguimiento.check_recibe_control_prenatal ?? false,
    requierePermisoControl: seguimiento.check_requiere_permiso_para_control ?? false,
    requiereCuidadoPostparto: seguimiento.check_requiere_cuidado_especial ?? false,
    consideracionActividades: seguimiento.check_cuenta_con_medidas_ue ?? false,
    progenitorConoceEmbarazo: seguimiento.check_tutores_al_tanto_emb ?? false,
    bajaMedica: seguimiento.check_recibe_baja_medica ?? false,
    accionesSeguimiento: seguimiento.check_cuenta_con_seguimiento ?? false,
    nacidoVivo: seguimiento.check_embarazo_nacido_vivo ?? false,
    progenitorMismaUnidadEducativa: seguimiento.check_progenitor_estudiante_ue ?? false,

    // === STRINGS ===
    director: seguimiento.persona_asignada_seguimiento ?? '',

    // === Validación ===
    validado: true,
  });

  console.log('populateFormWithSeguimientoData -> form->target:', printTarget(form));
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


const xxxcargarSeguimientoExistente = async (idEstudiante: number) => {
  try {
    const res = await EstudianteEmbarazo.getSeguimientoActuacionPorEstudiante(idEstudiante);
    console.log("Resultado búsqueda seguimiento existente:", res);
    
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      // Seleccionar el seguimiento más reciente (ordenado por fecha de creación)
      const seguimientosOrdenados = [...res.data].sort((a, b) => 
        new Date(b.fec_cre || 0).getTime() - new Date(a.fec_cre || 0).getTime()
      );
      
      const seguimientoMasReciente = seguimientosOrdenados[0];
      seguimientoExistente.value = seguimientoMasReciente;
      form.id_seguimiento_actuacion = seguimientoMasReciente.id_seguimiento_actuacion;
      
      // Rellenar el formulario con los datos existentes
      populateFormWithSeguimientoData(seguimientoMasReciente);
      
      isFormDisabled.value = false;
      registroExiste.value = true;
      localStorage.setItem('existeEnBD', 'true');
      
      toast.info('Se encontró un seguimiento existente para esta estudiante', {
        ...getToastOptions(4000),
        icon: 'ℹ️'
      });
    }
  } catch (error) {
    console.error('Error al buscar seguimiento existente:', error);
  }
};
const xxxfindInstitucionEducativa = async () => {
  console.log('Buscando institución educativa con SIE:', form.sie);
  
  if (!form.sie || String(form.sie).length !== 8) {
    resetInstitucionEducativa();
    return;
  }

  try {
    startLoading();
    const res = await ConvivenciaPacifica.findInstitucionEducativa(form.sie);
    console.log("Resultado búsqueda institución educativa:", res);
    
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      // Si hay múltiples instituciones, seleccionar la primera por defecto
      // En un futuro podría implementarse un selector para el usuario
      const selectedInstitucion = res.data[0];
      form.unidadEducativa = selectedInstitucion.institucioneducativa || '';
      find.value = true;
      institucionEducativa.value = selectedInstitucion;
      console.log('Institución educativa encontrada:', institucionEducativa.value);
      
      // Buscar construcción PCPA
      await buscarConstruccionPcpa(form.sie);
    } else {
      resetInstitucionEducativa();
      toast.info('No se encontró institución educativa con el código SIE proporcionado', getToastOptions());
    }
  } catch (error) {
    console.error('Error al buscar institución educativa:', error);
    resetInstitucionEducativa();
    toast.error('Error al buscar institución educativa', getToastOptions());
  } finally {
    stopLoading();
  }
};

const xxxbuscarConstruccionPcpa = async (sie: string) => {
  try {
    const res = await ConvivenciaPacifica.getContruccionUnidadEducativa(sie);
    console.log("Resultado búsqueda construcción PCPA:", res);
    
    if (res.status === 200 && res.data) {
      construccion.value = res.data;
    } else {
      construccion.value = null;
      toast.error('No se encontró construcción PCPA para esta institución educativa', getToastOptions());
      isFormDisabled.value = true; // Deshabilitar formulario si no hay construcción PCPA
    }
  } catch (error) {
    console.error('Error al buscar construcción PCPA:', error);
    construccion.value = null;
    toast.error('Error al cargar datos de construcción PCPA', getToastOptions());
    isFormDisabled.value = true; // Deshabilitar formulario en caso de error
  }
};

const xxxxcargarDatosParaEdicion = async (idSeguimiento: number) => {
  try {
    startLoading();
    const res = await EstudianteEmbarazo.getSeguimientoActuacionPorId(idSeguimiento);
    
    if (res.status === 200 && res.data) {
      const seguimiento = res.data;
      seguimientoExistente.value = seguimiento;
      form.id_seguimiento_actuacion = seguimiento.id_seguimiento_actuacion;
      
      // Cargar datos de la institución educativa
      if (seguimiento.sie_institucion) {
        form.sie = seguimiento.sie_institucion;
        await findInstitucionEducativa();
      }
      
      // Cargar datos del estudiante
      if (seguimiento.id_emb_informe_embarazo) {
        const estudianteRes = await EstudianteEmbarazo.getEstudiantePorId(seguimiento.id_emb_informe_embarazo);
        if (estudianteRes.status === 200 && estudianteRes.data) {
          form.codigoRude = estudianteRes.data.cod_rude || '';
          form.estudiante = `${estudianteRes.data.nombres_estudiante || ''} ${estudianteRes.data.apellido_pat_estudiante || ''} ${estudianteRes.data.apellido_mat_estudiante || ''}`.trim();
          estudiante.value = estudianteRes.data;
          form.validado = true;
        }
      }
      
      // Rellenar formulario
      populateFormWithSeguimientoData(seguimiento);
      
      isFormDisabled.value = false;
      registroExiste.value = true;
      localStorage.setItem('existeEnBD', 'true');
    } else {
      throw new Error('No se encontró el seguimiento para editar');
    }
  } catch (error: any) {
    console.error('Error al cargar datos para edición:', error);
    toast.error(`Error al cargar datos para edición: ${error.message || 'Error desconocido'}`, getToastOptions());
    // Redirigir de vuelta a la lista si no se puede cargar el seguimiento para edición
    setTimeout(() => {
      router.push('/embarazo/seguimiento');
    }, 3000);
  } finally {
    stopLoading();
  }
};

// ===== MÉTODOS DE VALIDACIÓN =====
const validateForm = (): boolean => {
     console.error('validateForm:');
  // 1) Validaciones numéricas
  if (form.semanaGestacion != null && (form.semanaGestacion < 1 || form.semanaGestacion > 42)) {
    toast.info('La semana de gestación debe estar entre 1 y 42 semanas', getToastOptions());
    return false;
  }

  if (form.numeroEmbarazo != null && form.numeroEmbarazo < 1) {
    toast.info('El número de embarazo debe ser mayor a 0', getToastOptions());
    return false;
  }

  if (form.edadProgenitor != null && (form.edadProgenitor < 12 || form.edadProgenitor > 60)) {
    toast.info('La edad del progenitor debe estar entre 12 y 60 años', getToastOptions());
    return false;
  }

  // 2) Validar fechas obligatorias según el form REAL
  const requiredDates = [
    { key: 'fechaEstimadaParto', label: 'Fecha estimada de parto' },
    { key: 'fechaRetorno', label: 'Fecha efectiva de retorno' },
    { key: 'fechaInicioBajaPrenatal', label: 'Fecha de inicio de baja prenatal' },
    { key: 'fechaFinBajaPostnatal', label: 'Fecha de fin de baja postnatal' }
  ];

  for (const { key, label } of requiredDates) {
    const value = form[key];

    if (!value || value.trim() === '' || !isValidDate(value)) {
      toast.info(`Ingrese una ${label.toLowerCase()} válida`, getToastOptions());
      return false;
    }
  }

  // 3) Campos obligatorios reales
  const requiredFields = [
    { key: 'semanaGestacion', label: 'Semana de gestación' },
    { key: 'numeroEmbarazo', label: 'Número de embarazo' },
    { key: 'edadProgenitor', label: 'Edad del progenitor' },
    { key: 'director', label: 'Director asignado' }
  ];

  const missingFields = requiredFields
    .filter(f => form[f.key] === null || form[f.key] === '' || form[f.key] === undefined)
    .map(f => f.label);

  if (missingFields.length > 0) {
    toast.info(
      `Estos campos son requeridos: ${missingFields.join(', ')}`,
      { autoClose: 3500, position: toast.POSITION.TOP_RIGHT }
    );
    return false;
  }



  return true;
};


const isValidDate = (dateString: string): boolean => {
  const parts = dateString.split('/');
  if (parts.length !== 3) return false;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;
  
  return true;
};

const validateStudentSearchCriteria = (codigoRude: string): boolean => {
  return !!codigoRude && codigoRude.trim().length > 10;
};



// ===== ESTADOS DE CARGA =====
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



// ===== UTILIDADES DE FECHA =====
/**
 * Convierte una fecha de formato DD/MM/YYYY a YYYY-MM-DD para enviar a la API
 */
const formatDateForAPI = (dateString: string | null): string | null => {
  if (!dateString || dateString.trim() === '') return null;
  
  // Si ya está en formato ISO (YYYY-MM-DD), devolver directamente
  if (dateString.includes('-') && dateString.length >= 10) {
    return dateString.substring(0, 10);
  }
  
  // Si está en formato DD/MM/YYYY
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2].substring(0, 4); // Asegurar que solo tome 4 dígitos del año
    return `${year}-${month}-${day}`;
  }
  
  // Intentar parsear de otras formas
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return null;
};

/**
 * Convierte una fecha de formato YYYY-MM-DD a DD/MM/YYYY para mostrar en el formulario
 */
const formatDateForView = (dateString: string | null): string | null => {
  if (!dateString || dateString.trim() === '') return null;
  
  // Si ya está en formato DD/MM/YYYY, devolver directamente
  if (dateString.includes('/') && dateString.length >= 10) {
    return dateString;
  }
  
  // Si está en formato YYYY-MM-DD u otro formato ISO
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return null;
};

/**
 * Formatea el input de fecha mientras el usuario escribe
 */
const onDateInput = (cleanedInput: string): string => {
  if (cleanedInput.length <= 2) {
    return cleanedInput;
  } else if (cleanedInput.length <= 4) {
    return cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2);
  } else if (cleanedInput.length <= 8) {
    return cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2, 4) + '/' + cleanedInput.slice(4, 8);
  } else {
    return cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2, 4) + '/' + cleanedInput.slice(4, 8);
  }
};

const createOnDateInputHandler = (field: keyof SeguimientoForm) => {
  return (event: Event) => {
    const input = event.target as HTMLInputElement;
    const cleanedInput = input.value.replace(/\D/g, '');
    const formatted = onDateInput(cleanedInput);
    form[field] = formatted;
    input.value = formatted;
  };
};

// Crear handlers para cada campo de fecha
const onDateInput1 = createOnDateInputHandler('fechaEstimadaParto');
const onDateInput2 = createOnDateInputHandler('fechaBajaPrenatal');
const onDateInput3 = createOnDateInputHandler('fechaConclusionPostnatal');
const onDateInput4 = createOnDateInputHandler('fechaRetorno');
const onDateInput5 = createOnDateInputHandler('fechaInicioBajaPrenatal');
const onDateInput6 = createOnDateInputHandler('fechaFinBajaPostnatal');

// ===== UTILIDADES =====
const getToastOptions = (autoClose: number = 3000): ToastOptions => ({
  autoClose,
  position: toast.POSITION.TOP_RIGHT,
  pauseOnHover: true
});
const printTarget = (obj: any) => {
  const target = obj?.__v_raw ? obj.__v_raw : obj;
  return target;
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

const loadMockData = () => {
  console.log('Cargando datos mock de seguimiento y actuación');

  Object.assign(form, {
    // 🔹 Identificación y estudiante
    sie: '12345678',
    unidadEducativa: 'UNIDAD EDUCATIVA EJEMPLO',
    codigoRude: '81981532201336',
    estudiante: 'ALEJANDRA MARIEL ARAMAYO CHAMO',
    complemento: 'A',
    fechaNacimiento: '2006-01-15',

    // 🔹 Embarazo
    semanaGestacion: 24,
    numeroEmbarazo: 1,
    recibeControlPrenatal: true,
    requierePermisoControl: true,
    requiereCuidadoPostparto: true,
    consideracionActividades: true,

    // 🔹 Fechas estimadas y de retorno
    fechaEstimadaParto: '15/08/2024',
    fechaRetorno: '01/10/2024',

    // 🔹 Progenitor y permisos
    edadProgenitor: 18,
    progenitorMismaUnidadEducativa: false,
    progenitorConoceEmbarazo: true,
    permisoControlPrenatal: 5, // días con permiso

    // 🔹 Baja prenatal y postnatal
    fechaInicioBajaPrenatal: '01/06/2024',
    fechaFinBajaPostnatal: '15/09/2024',
    requiereBajaMedica: 90, // número de días

    // 🔹 Resultado del embarazo
    nacidoVivo: false,

    // 🔹 Seguimiento y apoyo
    director: 'DIRECTOR EJEMPLO',
    accionesSeguimiento: true,

    // 🔹 Estado del formulario
    validado: true
  });
  toast.info('Usando datos de ejemplo para visualización', {
    autoClose: 3000,
    position: toast.POSITION.TOP_RIGHT
  });

};

// ===== MÉTODOS DE REINICIO =====
const xxxresetInstitucionEducativa = () => {
  institucionEducativa.value = null;
  construccion.value = null;
  find.value = false;
  form.unidadEducativa = '';
};

const resetEstudiante = () => {
  estudiante.value = null;
  //seguimientoExistente.value = null;
  findEstudiante.value = false;
  form.estudiante = '';
  form.validado = false;
  form.id_seguimiento_actuacion = null;
  // No resetear el código RUDE para que el usuario pueda intentar nuevamente
};

// ===== MÉTODOS PARA NAVEGACIÓN =====

const recargarPagina = () => {
  console.log('Recargando página para nuevo registro');
  isFormDisabled.value = false;
    window.location.href = '/embarazo/adolecente/seguimiento/actuacion';
 // registroExiste.value = false;
 // localStorage.removeItem('existeEnBD');  
  resetEstudiante();  
};

// ===== COMPUTED PROPERTIES =====
const isEditMode = computed(() => !!form.id_seguimiento_actuacion);

const canSave = computed(() => {
  return (
    !isFormDisabled.value &&
    form.validado && 
    !!construccion.value && 
    !!estudiante.value && 
    form.semanaGestacion !== null &&
    form.numeroEmbarazo !== null &&
    form.fechaEstimadaParto &&
    form.fechaBajaPrenatal &&
    form.fechaConclusionPostnatal &&
    form.fechaRetorno &&
    form.edadProgenitor !== null &&
    form.fechaInicioBajaPrenatal &&
    form.fechaFinBajaPostnatal &&
    form.director
  );
});

const modoFormulario = computed(() => {
  return isEditMode.value ? 'EDICIÓN' : 'CREACIÓN';
});

// ===== WATCHERS =====

/*watch(() => form.codigoRude, async (newCodigo, oldCodigo) => {
  if (newCodigo && newCodigo.length > 10 && newCodigo !== oldCodigo && !form.validado) {
    await findEstudianteEmbarazada();
  }
});*/

watch(() => form.id_seguimiento_actuacion, (newId) => {
  isFormDisabled.value = !!newId;
});


</script>

<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Seguimiento y actuación para cumplimiento de derechos</v-card-title>
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
                                <v-text-field v-model="form.codSie"  label="SIE" :readonly="true" hide-details ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.unidadEducativa" label="Unidad Educativa" :readonly="true" hide-details ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.codigoRude" label="Código Rude" required density="comfortable" hide-details append-inner-icon="mdi-magnify" @click:append-inner="findEstudianteEmbarazada"  :loading="isLoadingEstudiante" ></v-text-field>           
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.estudiante" label="Nombres y Apellidos" hide-details :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100"></span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.semanaGestacion" type="number" label="Tiempo de gestación al momento de registrar el caso (semanas)" :disabled="isFormDisabled"  ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.numeroEmbarazo" type="number" label="Número de embarazos (cuántas veces estuvo embarazada incluyendo este embarazo)" :disabled="isFormDisabled"  ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.recibeControlPrenatal" label="¿ Recibe control prenatal ?" :disabled="isFormDisabled" ></v-checkbox> <!-- modificiación-->
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.requierePermisoControl" label="¿ Requiere permiso para asistir a los controles de salud ?" :disabled="isFormDisabled" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.requiereCuidadoPostparto" label="¿ Requiere cuidado especial en el embarazo o el postparto ?" :disabled="isFormDisabled" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.consideracionActividades" label="¿ La U.E. aplica adecuaciones curriculares ?" :disabled="isFormDisabled" ></v-checkbox>
                            </v-col>

                          
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaEstimadaParto" label="Fecha estimada de parto"  @input="onDateInput2" placeholder="DD/MM/AAAA" hide-details :disabled="isFormDisabled" ></v-text-field>
                            </v-col>
                       
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaRetorno" label="Fecha efectiva de retorno a la U.E. de la baja postnatal"  @input="onDateInput4" placeholder="DD/MM/AAAA" hide-details :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                                               
                     

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.edadProgenitor" type="number" label="Edad del progenitor (años)" :disabled="isFormDisabled"  ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.progenitorMismaUnidadEducativa" label="El progenitor del bebe ¿ Es estudiante de la U.E. ?" :disabled="isFormDisabled" ></v-checkbox>
                            </v-col>



                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.progenitorConoceEmbarazo" label="Los progenitores/tutores ¿ Están al tanto del embarazo ?" :disabled="isFormDisabled" ></v-checkbox>
                            </v-col>
 

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.diasPermisoControl" label="¿ Número de días con permiso para controles pre y postnatal ?" :disabled="isFormDisabled"  ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Baja prenatal y postnatal</span>
                                </div>
                            </v-col>
                        
                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.fechaInicioBajaPrenatal" label="Inicio de baja prenatal"  @input="onDateInput5" placeholder="DD/MM/AAAA" :disabled="isFormDisabled" ></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.fechaFinBajaPostnatal" label="Fin de baja postnatal"  @input="onDateInput6" placeholder="DD/MM/AAAA" :disabled="isFormDisabled" ></v-text-field>
                            </v-col>

                           <v-col cols="12" md="4" >                               
                                   <v-text-field v-model="form.diasBajaMedica" label="¿ Número de días con baja médica ?" :disabled="isFormDisabled" ></v-text-field>
                            </v-col>


                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.nacidoVivo" label="¿ El embarazo concluyó con nacido vivo/a ?" :disabled="isFormDisabled" ></v-checkbox>
                            </v-col>
                      

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Seguimiento y apoyo a niñas y adolescentes embarazadas</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="12" >
                                <v-text-field v-model="form.director"  label="Persona asignada al seguimiento (Nombre del Director de U.E.)"  :disabled="isFormDisabled"  ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12" >
                                <v-checkbox v-model="form.accionesSeguimiento" label="¿ Cuenta con acciones de seguimiento al desarrollo de adecuaciones curriculares y metodologías ?" :disabled="isFormDisabled" ></v-checkbox>
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
