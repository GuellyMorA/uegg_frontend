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
  cod_rude: string;
  [key: string]: any;
}

interface ConstruccionData {
  id: number;
  [key: string]: any;
}

interface SeguimientoSituacion {
  id_seguimiento_situacion?: number;
  id_pcpa_unidad_educativa: number;
  id_emb_informe_embarazo: number;
  cod_rude: string;
  nombres_apellidos: string;
  check_emb_relacion_concensuada: boolean;
  check_emb_agresion_sexual: boolean;
  check_emb_violacion: boolean;
  check_reporte_caso_dna: boolean;
  fec_reporte_caso_dna: string | null;
  check_director_victima_violencia: boolean;
  check_consulta_victima_violencia_reporte_dna: boolean;
  cod_caso_denuncia: string | null;
  nombre_denunciante: string;
  nombre_adolescente: string;
  fec_denuncia: string | null;
  motivo_queja: string;
  acciones_a_seguir: string;
  estado: string;
  usu_cre?: string | null;
  fec_cre?: Date | null;
  usu_mod?: string | null;
  fec_mod?: Date | null;
  sie_institucion?: string;
}

interface SituacionForm {
      username: string | null;
  idUE: string | null;
  codSie: string | null;
  constId: number | null;
  sie: string | null;

  unidadEducativa: string;
  codigoRude: string;
  estudiante: string;
  embarazoConsensuado: boolean;
  embarazoAgresion: boolean;
  reporteCasoDna: boolean;
  embarazoViolacion: boolean;
  fechaReporteCasoDna: string | null;
  consultaVictimaViolencia: boolean;
  consultaVictimaViolenciaReporteDna: boolean;
  numeroCaso: string | null;
  nombreDenunciante: string;
  nombreVictima: string;
  fechaDenuncia: string | null;
  motivoQueja: string;
  solucioAcciones: string;
  id_seguimiento_situacion: number | null;
  validado: boolean;
}

// ===== ESTADO REACTIVO =====
const router = useRouter();

const form = reactive<SituacionForm>({

  username: '',
  idUE: '',
  constId: null,
  codSie: '',
  sie: '',
  unidadEducativa: '',
  codigoRude: '',
  estudiante: '',
  embarazoConsensuado: false,
  embarazoAgresion: false,
  reporteCasoDna: false,
  embarazoViolacion: false,
  fechaReporteCasoDna: null,
  consultaVictimaViolencia: false,
  consultaVictimaViolenciaReporteDna: false,
  numeroCaso: null,
  nombreDenunciante: '',
  nombreVictima: '',
  fechaDenuncia: null,
  motivoQueja: '',
  solucioAcciones: '',
  id_seguimiento_situacion: null,
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
const findEstudiante = ref(false);
const variusSie = ref(false);

// Datos externos
const construccion = ref<ConstruccionData | null>(null);
const institucionEducativa = ref<UnidadEducativa | null>(null);
const estudiante = ref<EstudianteEmbarazoData | null>(null);
const seguimientoExistente = ref<SeguimientoSituacion | null>(null);

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
    loadMockData();
 // }
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

const xxxcargarDatosParaEdicion = async (idSeguimiento: number) => {
  try {
    startLoading();
    const res = await EstudianteEmbarazo.getSeguimientoSituacionPorId(idSeguimiento);
    
    if (res.status === 200 && res.data) {
      const seguimiento = res.data;
      seguimientoExistente.value = seguimiento;
      form.id_seguimiento_situacion = seguimiento.id_seguimiento_situacion;
      
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
      router.push('/embarazo/seguimiento-situacion');
    }, 3000);
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
    const isUpdate = !!form.id_seguimiento_situacion;
    let resultado;
    
    if (isUpdate && form.id_seguimiento_situacion) {
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
   
  const  payload = seguimientoSituacionPayload(informeRelacionId,'ACTIVO');
  const res = await EstudianteEmbarazo.createEstudianteDerechosSeg(payload);
  
  if (res.status !== 201) {
    throw new Error('Error al crear el seguimiento de situación');
  }
  
  return res.data;
};

const updateSeguimiento = async (informeRelacionId: number) => {

  const  payload = seguimientoSituacionPayload(informeRelacionId,'MODIFICADO');

  const res = await EstudianteEmbarazo.updateEstudianteDerechosSeg(form.id_seguimiento_situacion, payload);
  
  if (res.status !== 200) {
    throw new Error('Error al actualizar el seguimiento de situación');
  }
  
  return res.data;
};

const seguimientoSituacionPayload = (  idInforme: number,  estado: 'ACTIVO' | 'MODIFICADO') => {

  const usu_cre = estado === 'ACTIVO' ? username.value : null;
  const fec_cre = estado === 'ACTIVO' ? new Date().toISOString() : null;
  const usu_mod = estado === 'MODIFICADO' ? username.value : null;
  const fec_mod = estado === 'MODIFICADO' ? new Date().toISOString() : null;

  return {
    id_pcpa_unidad_educativa: form.idUE,
    id_emb_informe_embarazo: idInforme,

    cod_rude: form.codSie,
    nombres_apellidos: `${form.nombreVictima || ''}`,

    check_emb_agresion_sexual: form.embarazoAgresion || false,
    check_emb_reporte_dna: form.reporteCasoDna || false,
    check_emb_sentencia_interrupcion: form.embarazoViolacion || false,

    fec_emb_referencia_dna: formatDateForAPI(form.fechaReporteCasoDna),

    check_director_victima_violencia: form.consultaVictimaViolencia || false,
    check_emb_director_refiere_dna:
      form.consultaVictimaViolenciaReporteDna || false,

    cod_caso_denuncia: form.numeroCaso || '',
    nombre_denunciante: form.nombreDenunciante || '',
    nombre_adolescente: form.nombreVictima || '',

    fec_denuncia: formatDateForAPI(form.fechaDenuncia),

    motivo_denuncia: form.motivoQueja || '',
    acciones_a_seguir: form.solucioAcciones || '',

    estado,
    usu_cre,
    usu_mod,
    fec_cre,
    fec_mod
  };
};

const handleSaveSuccess = (action: string) => {
  toast.success(`Seguimiento de situación ${action} correctamente`, getToastOptions());
  dialogSave.value = true;
  localStorage.setItem('existeEnBD', 'true');
  registroExiste.value = true;
  isFormDisabled.value = true;
};



// ===== MÉTODOS DE BÚSQUEDA =====

const findEstudianteEmbarazada = async () => {

  console.log('Buscando estudiante con código RUDE:', form.codigoRude);
  
  if (!validateStudentSearchCriteria(form.codigoRude)) {
  //  resetEstudiante();
    toast.warning('Ingrese un código RUDE válido (más de 10 caracteres)', getToastOptions());
    return;
  }

    startEstudianteLoading();

  //  const abortController = new AbortController();
 // const timeoutId = setTimeout(() => abortController.abort(), 15000); // 15 segundos de timeout
  let estudianteEncontrado: any | null = null;
  try {

    try {// Búsqueda en la Base de Datos Local  
        const resLocal = await EstudianteEmbarazo.findEstudianteDerechosSegByCodRude(form.codigoRude       );
        
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
     
      form.estudiante = `${estudianteEncontrado.data.nombres_estudiante || ''} ${estudianteEncontrado.data.apellido_pat_estudiante || ''} ${estudianteEncontrado.data.apellido_mat_estudiante || ''}`.trim();
    // findEstudiante.value = true; 
    //  form.validado = true;

      //populateFormWithStudentData(estudiante)
 // Rellenar el formulario con los datos existentes
      populateFormWithSeguimientoData(estudiante);

      toast.success(`Estudiante encontrado: ${form.estudiante}`, {
        ...getToastOptions(4000),      icon: '✅'   });
    } else {
            isFormDisabled.value = true;
    //  resetEstudiante();
      toast.info('No se encontró ningún estudiante con el código RUDE proporcionado', {
        ...getToastOptions(3000),
        icon: '🔍'
      });
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
   // abortController.abort();
    stopEstudianteLoading();
  }
};

const populateFormWithSeguimientoData = (seguimiento: SeguimientoSituacion) => {
  Object.assign(form, {
    validado: true,
    codSie: estudiante.codigo_sie,

    id_seguimiento_situacion: seguimiento.id_seguimiento_situacion ?? null,
    id_emb_informe_embarazo: estudiante.id_emb_informe_embarazo ?? null,
    id_emb_estudiante_embarazo: estudiante.id_emb_estudiante_embarazo ?? null,

    embarazoConsensuado: seguimiento.check_emb_relacion_concensuada ?? false,
    embarazoAgresion: seguimiento.check_emb_agresion_sexual ?? false,
    reporteCasoDna: seguimiento.check_reporte_caso_dna ?? false,
    embarazoViolacion: seguimiento.check_emb_violacion ?? false,

    fechaReporteCasoDna: seguimiento.fec_reporte_caso_dna
      ? formatDateForView(seguimiento.fec_reporte_caso_dna)  : '',

    consultaVictimaViolencia: seguimiento.check_director_victima_violencia ?? false,
    consultaVictimaViolenciaReporteDna: seguimiento.check_consulta_victima_violencia_reporte_dna ?? false,

    numeroCaso: seguimiento.cod_caso_denuncia ?? '',
    nombreDenunciante: seguimiento.nombre_denunciante ?? '',
    nombreVictima: seguimiento.nombre_adolescente ?? '',

    fechaDenuncia: seguimiento.fec_denuncia
      ? formatDateForView(seguimiento.fec_denuncia)    : '',

    motivoQueja: seguimiento.motivo_queja ?? '',
    solucioAcciones: seguimiento.acciones_a_seguir ?? ''

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
const xxxcargarSeguimientoExistente = async (idEstudiante: number) => {
  try {
    const res = await EstudianteEmbarazo.getSeguimientoSituacionPorEstudiante(idEstudiante);
    console.log("Resultado búsqueda seguimiento existente:", res);
    
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      // Seleccionar el seguimiento más reciente (ordenado por fecha de creación)
      const seguimientosOrdenados = [...res.data].sort((a, b) => 
        new Date(b.fec_cre || 0).getTime() - new Date(a.fec_cre || 0).getTime()
      );
      
      const seguimientoMasReciente = seguimientosOrdenados[0];
      seguimientoExistente.value = seguimientoMasReciente;
      form.id_seguimiento_situacion = seguimientoMasReciente.id_seguimiento_situacion;
      
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


// ===== MÉTODOS DE VALIDACIÓN =====
const validateForm = (): boolean => {
  // Validar que al menos uno de los tipos de embarazo esté seleccionado
  if (!form.embarazoConsensuado && !form.embarazoAgresion && !form.embarazoViolacion) {
    toast.info('Debe seleccionar al menos un tipo de embarazo (consensuado, agresión o violación)', getToastOptions());
    return false;
  }
  
  // Validar campos dependientes
  if (form.embarazoAgresion && !form.fechaReporteCasoDna) {
    toast.info('Debe ingresar la fecha de reporte de caso DNA para embarazo por agresión', getToastOptions());
    return false;
  }
  
  if (form.embarazoViolacion && !form.fechaReporteCasoDna) {
    toast.info('Debe ingresar la fecha de reporte de caso DNA para embarazo por violación', getToastOptions());
    return false;
  }
  
  // Validar fechas (asegurar que sean fechas válidas)
  const requiredDates = [
    { field: 'fechaDenuncia', label: 'Fecha de denuncia' }
  ];
  
  // Si es embarazo por agresión o violación, validar también fecha de reporte
  if (form.embarazoAgresion || form.embarazoViolacion) {
    requiredDates.push({ field: 'fechaReporteCasoDna', label: 'Fecha de reporte de caso DNA' });
  }
  
  for (const { field, label } of requiredDates) {
    const fieldValue = form[field as keyof SituacionForm] as string | null;
    if (!fieldValue || fieldValue.trim() === '' || !isValidDate(fieldValue)) {
      toast.info(`Ingrese una ${label.toLowerCase()} válida`, getToastOptions());
      return false;
    }
  }
  
  // Validar campos obligatorios
  const requiredFields: { key: keyof SituacionForm; label: string }[] = [
    { key: 'numeroCaso', label: 'Número de caso' },
    { key: 'nombreDenunciante', label: 'Nombre del denunciante' },
    { key: 'nombreVictima', label: 'Nombre de la víctima' },
    { key: 'motivoQueja', label: 'Motivo de la queja' },
    { key: 'solucioAcciones', label: 'Solución/acciones a seguir' }
  ];

  const missingFields = requiredFields
    .filter(f => !form[f.key] || form[f.key].trim() === '')
    .map(f => f.label);

  if (missingFields.length > 0) {
    toast.info(`Estos campos son requeridos: ${missingFields.join(', ')}`,
      { autoClose: 3500, position: toast.POSITION.TOP_RIGHT });
    return false;
  }

  // Validar SIE
  if (!form.sie || !form.unidadEducativa) {
    toast.info('Debe seleccionar una institución educativa válida', getToastOptions());
    return false;
  }

  // Validar estudiante
  if (!form.validado) {
    toast.info('Debe buscar y validar a la estudiante primero', getToastOptions());
    return false;
  }
  
  // Validar construcción PCPA
  if (!construccion.value) {
    toast.info('No se encontró construcción PCPA para esta institución educativa', getToastOptions());
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

// ===== MÉTODOS DE UTILIDAD =====
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

const createOnDateInputHandler = (field: keyof SituacionForm) => {
  return (event: Event) => {
    const input = event.target as HTMLInputElement;
    const cleanedInput = input.value.replace(/\D/g, '');
    const formatted = onDateInput(cleanedInput);
    form[field] = formatted;
    input.value = formatted;
  };
};

// Crear handlers para cada campo de fecha
const onDateInput1 = createOnDateInputHandler('fechaReporteCasoDna');
const onDateInput2 = createOnDateInputHandler('fechaDenuncia');

// ===== UTILIDADES =====
const getToastOptions = (autoClose: number = 3000): ToastOptions => ({
  autoClose,
  position: toast.POSITION.TOP_RIGHT,
  pauseOnHover: true
});

const loadMockData = () => {
  console.log('Cargando datos mock de seguimiento y actuación de riesgo');

  Object.assign(form, {
    // 🔹 Identificación y estudiante
    sie: '12345678',
    unidadEducativa: 'UNIDAD EDUCATIVA EJEMPLO',
    codigoRude: '81981532201336',
    estudiante: 'ALEJANDRA MARIEL ARAMAYO CHAMO',

    // 🔹 Embarazo y agresión
    embarazoAgresion: true,
    reporteCasoDna: true,
    embarazoViolacion: false,
    fechaReporteCasoDna: '01/06/2024',
    consultaVictimaViolencia: true,
    consultaVictimaViolenciaReporteDna: true,

    // 🔹 Denuncias
    numeroCaso: 123456,
    nombreDenunciante: 'JUANA PEREZ LOPEZ',
    nombreVictima: 'ALEJANDRA MARIEL ARAMAYO CHAMO',
    fechaDenuncia: '20/05/2024',
    motivoQueja: 'Agresión sexual dentro del establecimiento educativo',
    solucioAcciones: 'Se realizará seguimiento con orientación psicológica y legal',

    // 🔹 Estado del formulario
    validado: true
  });
    toast.info('Usando datos de ejemplo para visualización', {
    autoClose: 3000,
    position: toast.POSITION.TOP_RIGHT
  });
};

// ===== MÉTODOS DE REINICIO =====
const reset = () => {
  Object.assign(form, {
    codigoRude: '',
    estudiante: '',
    embarazoConsensuado: false,
    embarazoAgresion: false,
    reporteCasoDna: false,
    embarazoViolacion: false,
    fechaReporteCasoDna: null,
    consultaVictimaViolencia: false,
    consultaVictimaViolenciaReporteDna: false,
    numeroCaso: '',
    nombreDenunciante: '',
    nombreVictima: '',
    fechaDenuncia: null,
    motivoQueja: '',
    solucioAcciones: '',
    id_seguimiento_situacion: null,
    validado: false
  });

  // Cerrar el diálogo de guardado
  dialogSave.value = false;

  // Reiniciar datos del estudiante asociado
  resetEstudiante();
};
const xxxresetInstitucionEducativa = () => {
  institucionEducativa.value = null;
  construccion.value = null;
  find.value = false;
  form.unidadEducativa = '';
};

const xxxresetEstudiante = () => {
  estudiante.value = null;
  seguimientoExistente.value = null;
  findEstudiante.value = false;
  form.estudiante = '';
  form.validado = false;
  form.id_seguimiento_situacion = null;
  // No resetear el código RUDE para que el usuario pueda intentar nuevamente
};

// ===== MÉTODOS PARA NAVEGACIÓN =====

const recargarPagina = () => {
  console.log('Recargando página para nuevo registro');
  isFormDisabled.value = false;
    window.location.href = '/embarazo/adolecente/seguimiento/situacion';
 // registroExiste.value = false;
 // localStorage.removeItem('existeEnBD');  
 // resetEstudiante();  
};

// ===== COMPUTED PROPERTIES =====
const isEditMode = computed(() => !!form.id_seguimiento_situacion);

const canSave = computed(() => {
  return (
    !isFormDisabled.value &&
    form.validado && 
    !!construccion.value && 
    !!estudiante.value &&
    (form.embarazoConsensuado || form.embarazoAgresion || form.embarazoViolacion) &&
    form.numeroCaso &&
    form.nombreDenunciante &&
    form.nombreVictima &&
    form.fechaDenuncia &&
    form.motivoQueja &&
    form.solucioAcciones
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

watch(() => form.id_seguimiento_situacion, (newId) => {
  isFormDisabled.value = !!newId;
});

// Lógica para manejar dependencias entre checkboxes
watch(() => form.embarazoAgresion, (newValue) => {
  if (newValue) {
    form.embarazoConsensuado = false;
    form.embarazoViolacion = false;
  }
});

watch(() => form.embarazoViolacion, (newValue) => {
  if (newValue) {
    form.embarazoConsensuado = false;
    form.embarazoAgresion = false;
  }
});

watch(() => form.embarazoConsensuado, (newValue) => {
  if (newValue) {
    form.embarazoAgresion = false;
    form.embarazoViolacion = false;
  }
});



</script>


<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Seguimiento y actuación de riesgo---</v-card-title>
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
                                <v-text-field v-model="form.codSie"  label="SIE" :readonly="true"  hide-details  ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.unidadEducativa"  label="Unidad Educativa" :readonly="true" hide-details  ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.codigoRude" label="Código Rude" required density="comfortable" hide-details append-inner-icon="mdi-magnify" @click:append-inner="findEstudianteEmbarazada" :loading="isLoadingEstudiante" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.estudiante" label="Nombres y Apellidos" hide-details  :readonly="true"></v-text-field>
                            </v-col>

                            <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100"></span>
                            </div>

                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.embarazoAgresion" label="¿ El embarazo es resultado de una agresión sexual ?" :disabled="isFormDisabled"  ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" v-if="form.embarazoAgresion">
                                <v-checkbox v-model="form.reporteCasoDna" label="¿ El Director(a) reportó el caso de violencia sexual a la Defensoría u otra instancia ?"  :disabled="isFormDisabled" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" v-if="form.embarazoAgresion">
                                <v-checkbox v-model="form.embarazoViolacion" label="¿ El Director(a) informó a la adolescente y su familia sobre la sentencia constitucional plurinacional 206/2014 sobre el derecho a la interrupción Legal del embarazo ?"  :disabled="isFormDisabled" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" v-if="form.embarazoAgresion">
                                <v-text-field v-model="form.fechaReporteCasoDna" label="Referencia de caso de violencia sexual a la DNA (fecha)"  @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details  :disabled="isFormDisabled" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.consultaVictimaViolencia" label="¿ El/La Director(a) identifica que la adolescente embarazada sufre violencia ?"  :disabled="isFormDisabled" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="6" v-if="form.consultaVictimaViolencia">
                                <v-checkbox v-model="form.consultaVictimaViolenciaReporteDna" label="¿ Se ha reportado el caso de violencia a la DNA u otra instancia ?"  :disabled="isFormDisabled" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Denuncias</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.numeroCaso" type="number" :counter="10" label="Número de código del caso" hide-details  :disabled="isFormDisabled"  ></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.nombreDenunciante" :counter="10" label="Nombre de la persona que presenta la denuncia" hide-details  :disabled="isFormDisabled"  ></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.nombreVictima" :counter="10" label="Nombre de la adolescente" hide-details  :disabled="isFormDisabled"  ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.fechaDenuncia" label="Fecha de denuncia"  @input="onDateInput2" placeholder="DD/MM/AAAA" hide-details  :disabled="isFormDisabled" ></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="12" >
                                <v-text-field v-model="form.motivoQueja" label="Motivo de la denuncia" hide-details  :disabled="isFormDisabled"  ></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="12" >
                                <v-text-field v-model="form.solucioAcciones" label="Acciones a seguir" hide-details  :disabled="isFormDisabled"  ></v-text-field>
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
