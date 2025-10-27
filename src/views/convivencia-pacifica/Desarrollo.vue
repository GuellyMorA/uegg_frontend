<script setup lang="ts">
import { ref, onMounted } from 'vue';
//import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';

import Auth from '@/services/Auth'; 
import _ from 'lodash';

// import { useNavbarStore } from '@/stores/navbar';
// const store = useNavbarStore();  
// store.setPath('/convivencia/pacifica');
const router = useRouter();

const valid = ref(false);
const dialog = ref(false);
const dialogSave = ref(false);
const validationErrors = ref();
const find = ref(false);
const variusSie = ref(false);

const comisionConstruccion = ref();
const tema = ref();
const temaPromover = ref();
const comisionAprobacion = ref();
const institucionEducativa = ref();
const temaDisciplinario = ref();

const miembrosComisionConstruccion = ref();
const actividadesPromocion = ref();
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

// Para los v-file-input
const selectedFilePlan = ref(null);
const uploadMessagePlan = ref('');
const selectedFileDiagnostico = ref(null);
const uploadMessageDiagnostico = ref('');
const existeCiAndCodSie= ref<any | null>(null); 

/*   VARIABLES 
 

const sieRules = [
    (value: any) => {
        if (value) return true
        return 'El SIE es requerido'
    },
    (value: any) => {
        if (value?.length === 8) return true
        return 'El código SIE requiere 8 dígitos.'
    },
];*/



// Objeto reactivo con todos los campos del formulario y datos de prueba
const form = ref({    // Datos de Unidad Educativa
      sie: null,
     departamentoId: null,
     departamentoNombre: '',
     municipioId: null,
     municipioNombre: '',
     unidadEducativa: '',
     nivel: '',
     modalidad: '',
     director: '',
  
    // Construcción del PCPA
    fecha: '01/07/2025',
    registroAnterior: true,

    // Miembros de la comisión de construcción del PCPA
    comisionSocializacionEstudiante: true,
    comisionSocializacionEstudianteNombre: 'Estudiante Alfa, Estudiante Beta',
    comisionSocializacionDirector: true,
    comisionSocializacionDirectorNombre: 'Director Titular',
    comisionSocializacionMaestro: true,
    comisionSocializacionMaestroNombre: 'Maestro A, Maestro B',
    comisionSocializacionPadre: true,
    comisionSocializacionPadreNombre: 'Padre Familia 1, Madre Familia 2',
    comisionSocializacionOtro: false,
    comisionSocializacionOtroNombre: '',

    // Temas que aborda el Plan
    temaDerecho: false,
    temaNorma: false,
    temaPromover: true,
    temaPromover1: true,
    temaPromover2: false,
    temaPromover3: false,
    temaPromover4: false,
    temaPromover5: false,
    temaPromover6: false,
    temaPromover7: false,
    temaPromover8: false,
    temaPromover9: false,
    temaDisciplinario: true,
    temaDisciplinarioCorrectivo: true,
    temaDisciplinarioProcedimientoMarco: false,
    temaDisciplinarioProcedimientoAlternativo: false,
    temaDisciplinarioLineamiento: false,

    // Miembros de la comisión que aprueba el PCPA
    comisionAprobacionEstudiante: true,
    comisionAprobacionEstudianteNombre: 'Representante Estudiantil A',
    comisionAprobacionDirector: true,
    comisionAprobacionDirectorNombre: 'Director Aprobador',
    comisionAprobacionMaestro: false,
    comisionAprobacionMaestroNombre: '',
    comisionAprobacionPadre: true,
    comisionAprobacionPadreNombre: 'Presidente de Junta Escolar',
    comisionAprobacionOtro: false,
    comisionAprobacionOtroNombre: '',
    fechaAprobacion: '01/09/2036',
    vigenciaAprobacion: 222,
  
    validado: false  // Declaración jurada
    

});

let username= localStorage.getItem('username')
// --- Variables de Estado Nuevas ---
const readOnlyVar = ref( localStorage.getItem('existeEnBD')==='true' ? true : false  );
console.log('existeEnBD-readOnlyVar : ', localStorage.getItem('existeEnBD'));   
const registroExiste = ref(readOnlyVar);
const isLoading = ref(true);
const storedData = localStorage.getItem('dataUE');
const dataUE = storedData ? JSON.parse(storedData) : null;
const idUE = dataUE[0].id; //   ref({ci:userData.codigo_sie , codigo_sie:userData.codigo_sie } );// Usar el SIE del usuario logueado

// Controla si los campos del formulario están deshabilitados o no
const isFormDisabled = ref(true); 
const isFormDisabledFromNew = ref(true); 

// -----------------------------------------------------------
// FUNCIÓN PARA OBTENER Y FORMATEAR LA FECHA DE HOY (DD/MM/AAAA)
// -----------------------------------------------------------

const getTodayDateFormatted = () => {
  const today = new Date();
  
  // Obtenemos día, mes y año
  const day = today.getDate();
  const month = today.getMonth() + 1; // getMonth() es base 0 (Enero=0)
  const year = today.getFullYear();
  
  // Aseguramos que tengan 2 dígitos (ej. 05 en lugar de 5)
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');
  
  // Construimos la cadena "DD/MM/AAAA"
  return `${formattedDay}/${formattedMonth}/${year}`;
};

// Habilita el formulario para un nuevo registro. Ejemplo: limpiar campos
const iniciarNuevoRegistro = () => {
   console.log('Ingresar nuevo registro clickeado.');
   isFormDisabled.value = false;
   isFormDisabledFromNew.value = false;
};

// Habilita el formulario para editar un registro existente y deshabilita el botón
const modificarRegistro = () => {
    console.log('modificar registro .');
    isFormDisabled.value = false;
};


// registro el formulario para editar o crear un nuevo registro
const registro = () => {
   // console.log('modificar registro .');
    isFormDisabled.value = true;
console.log('Fecha form.value.fecha:', form.value.fecha);
    if (registroExiste.value ){
       update();
    }
    else{
     createRec();
    }

};

// --- Función  para obtener id construcion
const findConstByCiAndUe = async () => {  
    form.value.idUE= idUE;
     form.value.username= username;
     const tecnico = await ConvivenciaPacifica.findConstByCiAndUe(form.value).then((res) => {
        if (res.status === 200) {
           // console.log('     res : ', res.data);    
            existeCiAndCodSie.value = res.data|| [];  //  tecnico.data.data|| [];
            if (existeCiAndCodSie.value.length === 1) {

              localStorage.setItem('idConst',res.data[0].id);
                return res.data[0].id;  
            }else{
              localStorage.setItem('idConst','0');
                  return 0;
            }           
            
           
        } else {
            toast.error('No se encontro una UE para el Director', {
                autoClose: 3500,
                position: toast.POSITION.TOP_RIGHT
            });
           
            return 0;
        }
    }).catch(() => {
        toast.error('Error de conexión con el servidor.', {
            autoClose: 3500,
            position: toast.POSITION.TOP_RIGHT
        });
    });    
    
    return tecnico; 
};

 // Lógica para modificar un formulario

// HELPER: Función segura para parsear fechas DD/MM/YYYY
const parseDateSafe = (dateString) => {
    if (!dateString) return null; // No procesar si está vacío
    const parts = dateString.split('/');
    if (parts.length !== 3) {
        console.warn(`Formato de fecha no válido: ${dateString}`);
        return null; // Formato inválido
    }
    // Formato YYYY-MM-DD (ISO 8601)
    const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const dateObj = new Date(isoDate);
    
    // Verificar si la fecha resultante es válida (ej. 31/02/2024 sería inválido)
    if (isNaN(dateObj.getTime())) {
         console.warn(`Fecha inválida (ej. 31/02): ${dateString}`);
        return null;
    }
    return dateObj.toISOString();
};
function capitalizarPrimeraLetra(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}
/**
 * Busca una cadena dentro de un Map e imprime cada comparación realizada.
 *
 * @param {string} cadenaBuscada La clave (string) que se intenta encontrar en el mapa.
 * @param {Map<string, any>} mapa El Map donde se realiza la búsqueda.
 * @returns {string} Mensaje indicando el resultado final de la búsqueda.
 */
function buscarCadenaEnMapaConSeguimiento(cadenaBuscada, mapa) {
    console.log(`\n🔎 Iniciando búsqueda para la cadena: "${cadenaBuscada}"`);
    let encontrado = false;

    // Iterar sobre las claves del mapa para mostrar la comparación
    for (const clave of mapa.keys()) {
        if (cadenaBuscada === clave) {
            console.log(`✅ ¡ÉXITO! Coincidencia encontrada con la clave: "${clave}"`);
            encontrado = true;
            // Opcional: Puedes usar 'break;' aquí para detener la búsqueda inmediatamente
            // break;
        } else {
            console.log(`➡️ Comparando: "${cadenaBuscada}" vs "${clave}" -> NO COINCIDE`);
        }
    }

    // Reporte final
    if (encontrado) {
        return `\n🎉 Búsqueda finalizada. La cadena **"${cadenaBuscada}"** FUE encontrada.`;
    } else {
        return `\n❌ Búsqueda finalizada. La cadena **"${cadenaBuscada}"** NO fue encontrada en el mapa.`;
    }
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

 function compararActividades(arrayDatos, jsonDatos) {
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
   console.error( 'nuevoRegistro :', nuevoRegistro);
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

function obtenerKeyOriginal(jsonDatos, labelBuscado) {
  for (const item of Object.values(jsonDatos)) {
    if (item.label === labelBuscado) {
      return { id: item.id, status: item.status,  nivel: item.nivel,   tieneHijos : item.tieneHijos  };
    }
  }
  return null; // si no se encuentra
}

//  busca todos los elementos que check_actividad_tipo =true, entonces ,esos elementos busca en el objeto, mediante la propiedad label, pero conviertela antes a mayuscula, a los elementos encontrados cambiale la propiedad estado a MODIFICADO

function actualizarEstadoModificado(dataArray) {

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
       // console.log(`\n📦 Procesando elemento #${index + 1}: Label Original: ${item.label ? item.label : 'SIN ETIQUETA'} | Estado Actual: ${item.estado}`);
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
        console.error(`❌ DataArray SIN COINCIDENCIA : "${labelUpperDataArray}" NO se encontró. Se mantiene el estado: ${item.estado}, ${item.id_pcpa_actividades_tipo} `);
        return item;
    });

    console.log("\n--- INICIO DE FASE DE FILTRADO ---");
    
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
    
    console.log("\n--- FIN DEL PROCESO ---", arrayModificado);


  return arrayModificado;
}

  

    // 2. Parseo de fechas seguro
   /* const fechaRegistroISO = parseDateSafe(form.value.fecha);
    const fechaAprobacionISO = parseDateSafe(form.value.fechaAprobacion);

    if (!fechaRegistroISO || !fechaAprobacionISO) {
         toast.error('Las fechas de registro o aprobación son inválidas.', {
            autoClose: 3500,
            position: toast.POSITION.TOP_RIGHT,
        });
        return; // Detener la ejecución si las fechas fallan
    }*/


// --- DATOS DE ENTRADA ---

/**
 * Función principal que recibe el array y procesa las peticiones.
 * Es 'async' para poder usar 'await'.
 *
 * @param {Array} resultadoFinal El array generado en el paso anterior.
 */
const procesarResultadosAPI = async (resultadoFinal)=>{
         //: { id_actividades_promocion: any; check_actividad_tipo: any; id_pcpa_actividades_tipo: any; id: any; status: any;  estado: string; }[]) => {
        console.log('Iniciando procesamiento de API...');
        const constId = await findConstByCiAndUe();
        // modifica el array original
     resultadoFinal = actualizarEstadoModificado(resultadoFinal);
     console.table(resultadoFinal);

        // 1. Creamos un array para guardar todas las promesas (peticiones)
        const promesas = [];
         const dateParts = (form.value.fecha || '').split("/");
        const dateParts2 = (form.value.fechaAprobacion || '').split("/"); 
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
                            id_pcpa_construccion: constId,                       
                            id_pcpa_actividades_tipo: item.id_pcpa_actividades_tipo,                             
                            nivel: item.nivel,
                            fec_aprobacion: new Date(dateParts2[2] +'-'+ dateParts2[1] +'-'+ dateParts2[0]).toISOString(),
                            tiempo_vigencia: 0,
                            declaracion_jurada: true,
                            estado: item.status ? 'MODIFICADO' : 'INACTIVO',
                            usu_cre: username,
                            fec_cre: new Date()
                        };
                        
                        console.log(`save4 (PUT ID: ${idParaActualizar}), payload4:`, { ...payload4 });

                        // 4. Ahora sí puedes usar 'await' dentro de esta función 'async'
                        const res = await ConvivenciaPacifica.updateTarea(idParaActualizar, payload4);
                        
                        if (res.status === 200) {
                            /*toast.info(`Registro ${idParaActualizar} guardado correctamente`, { 
                                autoClose: 3500,
                                position: toast.POSITION.TOP_RIGHT, 
                            });*/
                        } else {
                            toast.error(`Registro ${idParaActualizar} no modificado (Status: ${res.status})`, { 
                                autoClose: 3500,
                                position: toast.POSITION.TOP_RIGHT, 
                            });
                        }
                        
                        console.log(`fin bucle save4 (ID: ${idParaActualizar}), respuesta:`, res);
                        
                        // 5. Devolvemos la respuesta para que 'allSettled' la capture como 'fulfilled'
                        return res; 

                    } catch (error) {
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
            const esNivel2 = item.nivel === 2;
            const esNivel1SinHijos = item.nivel === 1 && item.tieneHijos === false;
             // Si es NUEVO, llamamos al endpoint POST (Crear).     
            if (esNuevo && estaActivo && (esNivel2 || esNivel1SinHijos)) {        
                console.log('Preparando POST (NUEVO)', item);             
                // Creamos la promesa POST y la añadimos al array    
                promesas.push(   // 3. Usamos una función asíncrona autoejecutable (IIAFE). Esto crea y devuelve una promesa que 'Promise.allSettled' puede manejar.
                (async () => {                       
                    try {
                        const payload4 = {
                            id_pcpa_construccion: constId,                       
                            id_pcpa_actividades_tipo: item.id_pcpa_actividades_tipo,                             
                            nivel: item.nivel,
                            fec_aprobacion: new Date(dateParts2[2] +'-'+ dateParts2[1] +'-'+ dateParts2[0]).toISOString(),
                            tiempo_vigencia: 0,
                            declaracion_jurada: true,
                            estado: 'ACTIVO',
                            usu_cre: username,
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

                    } catch (error) {
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


/*    // --- EJEMPLO DE CÓMO LLAMAR A LA FUNCIÓN ---
// (Esto es solo para demostrar, 'resultadoFinal' vendría de tu otra función)
const resultadoDePrueba = [
  { id_actividades_promocion: 7879, check_actividad_tipo: true , id:7879, status:true, estado: 'ACTIVO' },
  { id_actividades_promocion: 'null', check_actividad_tipo: 'null', id:7882, status:true, estado: 'NUEVO' },
  { id_actividades_promocion: 7881, check_actividad_tipo: false, id:'null', status:true, estado: 'INACTIVAR' }
];

*/

function mapearTemasPromover(formData) {
    // Mapeo de los checkboxes de temas promover

    const temasPromover = {
  1:  { label: "Derechos y deberes", status: formData.temaDerecho || false, id: 1, cod_actividad: "DB", nivel: 1, tieneHijos: false },
  2:  { label: "Normas de conducta", status: formData.temaNorma || false, id: 2, cod_actividad: "NC", nivel: 1, tieneHijos: false },
 
  3:  { label: "Procedimientos disciplinarios", status: formData.temaDisciplinario || false, id: 3, cod_actividad: "PD", nivel: 1, tieneHijos: true },  
  4:  { label: "Correctivos pedagógicos", codigo: "S", status: formData.temaDisciplinarioCorrectivo || false, id: 10, nivel: 2, tieneHijos: false },
  5:  { label: "Procedimiento marco para la adopción de decisiones disciplinarias", codigo: "PADD", status: formData.temaDisciplinarioProcedimientoMarco || false, id: 11, nivel: 2, tieneHijos: false },
  6:  { label: "Procedimientos alternativos para la solución de conflictos", codigo: "PAS", status: formData.temaDisciplinarioProcedimientoAlternativo || false, id: 12, nivel: 2, tieneHijos: false },
  7:  { label: "Lineamientos para la remisión de informes sobre casos de violencia", codigo: "LRI", status: formData.temaDisciplinarioLineamiento || false, id: 13, nivel: 2, tieneHijos: false },
 
 
  8:  { label: "Sanción", status: formData.temaXX || false, id: 8, cod_actividad: "S", nivel: 1, tieneHijos: false },
  9:  { label: "Adopción", status: formData.temaXX || false, id: 9, cod_actividad: "PADD", nivel: 1, tieneHijos: false },
  10: { label: "Alternativo", status: formData.temaXX || false, id: 10, cod_actividad: "PAS", nivel: 1, tieneHijos: false },
  11: { label: "Remisión", status: formData.temaXX || false, id: 11, cod_actividad: "LRI", nivel: 1, tieneHijos: false },
  12: { label: "Taller", status: formData.temaXX || false, id: 12, cod_actividad: "PTC", nivel: 1, tieneHijos: false },
 
  13: { label: "Actividades para promover la convivencia pacífica", status: formData.temaPromover || false, id: 9, cod_actividad: "APC", nivel: 1, tieneHijos: true },  
  14: { label: "Movilización social", codigo: "MS", status: formData.temaPromover1 || false, id: 1, nivel: 2, tieneHijos: false },
  15: { label: "Fomento al desarrollo de habilidades y práctica de valores", codigo: "FDHP", status: formData.temaPromover2 || false, id: 2, nivel: 2, tieneHijos: false },
  16: { label: "Capacitación", codigo: "C", status: formData.temaPromover3 || false, id: 3, nivel: 2, tieneHijos: false },
  17: { label: "Medidas de seguridad en la infraestructura", codigo: "MSI", status: formData.temaPromover4 || false, id: 4, nivel: 2, tieneHijos: false },
  18: { label: "Normas de convivencia en la unidad educativa", codigo: "NCUE", status: formData.temaPromover5 || false, id: 5, nivel: 2, tieneHijos: false },
  19: { label: "Promoción de la participación de las y los estudiantes", codigo: "PPE", status: formData.temaPromover6 || false, id: 6, nivel: 2, tieneHijos: false },
  20: { label: "Gestión y articulación con la comunidad educativa", codigo: "GACU", status: formData.temaPromover7 || false, id: 7, nivel: 2, tieneHijos: false },
  21: { label: "Acción comunal", codigo: "AC", status: formData.temaPromover8 || false, id: 8, nivel: 2, tieneHijos: false },
  22: { label: "Acciones para la reducción de riesgos en el contexto y en la unidad educativa", codigo: "ARRUE", status: formData.temaPromover9 || false, id: 9, nivel: 2, tieneHijos: false },
 
  23: { label: "Seguimiento", status: formData.temaPromover23 || false, id: 16, cod_actividad: "PSE", nivel: 1, tieneHijos: false },
  24: { label: "Mediación", status: formData.temaPromover24 || false, id: 17, cod_actividad: "MCI", nivel: 1, tieneHijos: false },
  25: { label: "Reinserción", status: formData.temaPromover25 || false, id: 18, cod_actividad: "RS", nivel: 1, tieneHijos: false },
  26: { label: "Taller libre", status: formData.temaPromover26 || false, id: 19, cod_actividad: "TAL", nivel: 1, tieneHijos: false },
  27: { label: "Feria", status: formData.temaPromover27 || false, id: 14, cod_actividad: "FER", nivel: 1, tieneHijos: false },
  28: { label: "Otros", status: formData.temaPromover28 || false, id: 15, cod_actividad: "OTR", nivel: 1, tieneHijos: false }
};

    return temasPromover;
}


const update = async () => {

    // 1. Snapshot correcto con console.log
    console.log('Editando datos (snapshot):', { ...form.value });
    dialog.value = false;
  //RBC  dialogSave.value = true;
    isFormDisabled.value = true; // Deshabilita el formulario después de guardar
    registroExiste.value = true; // Muestra el botón 'Modificar' la próxima vez
    console.log('Fecha a enviar al servidor:', form.value.fecha);
    if (!validateForm()) {
        dialog.value = false;
        toast.info('Debe ingresar los datos requeridos', {
            autoClose: 3500,
            position: toast.POSITION.TOP_RIGHT,
        });
        return false;
    }

    // ... (Tu lógica para construir comisionConstruccion, tema, etc. está bien) ...
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


  
    const dateParts = (form.value.fecha || '').split("/");
    const dateParts2 = (form.value.fecha || '').split("/"); 

    const payload2 = {
        id_pcpa_unidad_educativa: idUE,
        fecha_registro: new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]).toISOString(), 
        check_diagnostico_pcpa: form.value.registroAnterior,
        fecha_aprobacion: new Date(dateParts2[2] +'-'+ dateParts2[1] +'-'+ dateParts2[0]).toISOString(),
        vigencia_aprobacion: form.value.vigenciaAprobacion,
        estado: 'MODIFICADO',
        usu_cre: username,
        fec_cre: new Date()
    }

    // 3. Corrección de `await` + `.then()` usando `try/catch`
    let save2;
    try {
        console.log("ini save2 updateContruccion, payload2:", { ...payload2 });
        const res = await ConvivenciaPacifica.updateContruccion(localStorage.getItem('idConst'), payload2);
        
        if (res.status === 200) { // 201 = Creado (o 200 = OK para update)
              toast.info(`Registro ${localStorage.getItem('idConst')} guardado correctamente`, {           
                autoClose: 3500,
                position: toast.POSITION.TOP_RIGHT,
            });
            dialog.value = false;
            dialogSave.value = true;
            save2 = res; // Guardamos la respuesta
        } else {
             toast.error('Registro no guardado', {
                autoClose: 3500,
                position: toast.POSITION.TOP_RIGHT,
            });
            save2 = res; // Guardamos la respuesta de error
        }
        console.log("fin save2, respuesta:", res);

    } catch (error) {
        console.error("Error crítico en save2:", error);
        toast.error(`Error al guardar: ${error.message}`, { /* ... */ });
        return; // Detener la función si el guardado principal falla
    }



    console.log("--- Iniciando  save4 (tema.value) ---", tema.value  );   
   // console.table(form.value); //una forma más compacta
   // Usar las funciones
    const temasPromoverMapeados = mapearTemasPromover(form.value);
   //  const datosParaBD = prepararDatosParaBD(form.value);
   // const valoresCheckboxes = obtenerValoresCheckboxes(form.value);

    console.log("Temas Promover Mapeados:", temasPromoverMapeados);
   // console.log("Datos para BD:", datosParaBD);
   //   console.log("Valores Checkboxes:", valoresCheckboxes);

        // --- EJECUCIÓN NUEVA LOGICA DE CREAR Y UPDATE---
    const resultadoFinal = compararActividades(  actividadesPromocion.value , temasPromoverMapeados);  //arrayDatos, jsonDatos
    console.log('resultadoFinal :',resultadoFinal);
    console.table(resultadoFinal);
    procesarResultadosAPI(resultadoFinal);

    console.log("--- fin bucle save 4 ---");
 
    console.log("--- fin de todos los saves ---");

};

 // Lógica para guardar un nuevo formulario
const createRec = async () => {

  //  console.log('Guardando datos:', form.value);
    dialog.value = false;
    dialogSave.value = true;
    isFormDisabled.value = true; // Deshabilita el formulario después de guardar

    registroExiste.value = true; // Muestra el botón 'Modificar' la próxima vez


    if (!validateForm()) {
        dialog.value = false;  
        toast.info('Debe ingresar los datos requeridos', {
            autoClose: 3500,
            position: toast.POSITION.TOP_RIGHT,
        });
        return false;
    }

    comisionConstruccion.value = {
        1: {status: form.value.comisionSocializacionEstudiante, value: form.value.comisionSocializacionEstudianteNombre, id: form.value.comisionSocializacionEstudianteId },
        2: {status: form.value.comisionSocializacionDirector, value: form.value.comisionSocializacionDirectorNombre, id: form.value.comisionSocializacionDirectorId},
        3: {status: form.value.comisionSocializacionMaestro, value: form.value.comisionSocializacionMaestroNombre, id: form.value.comisionSocializacionMaestroId},
        4: {status: form.value.comisionSocializacionPadre, value: form.value.comisionSocializacionPadreNombre, id: form.value.comisionSocializacionPadreId},
        5: {status: form.value.comisionSocializacionOtro, value: form.value.comisionSocializacionOtroNombre, id: form.value.comisionSocializacionOtroId}
    };

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

    comisionAprobacion.value = {
        1: {status: form.value.comisionAprobacionEstudiante, value: form.value.comisionAprobacionEstudianteNombre, id: form.value.comisionAprobacionEstudianteId},
        2: {status: form.value.comisionAprobacionDirector, value: form.value.comisionAprobacionDirectorNombre, id: form.value.comisionAprobacionDirectorId},
        3: {status: form.value.comisionAprobacionMaestro, value: form.value.comisionAprobacionMaestroNombre, id: form.value.comisionAprobacionMaestroId},
        4: {status: form.value.comisionAprobacionPadre, value: form.value.comisionAprobacionPadreNombre, id: form.value.comisionAprobacionPadreId},
        5: {status: form.value.comisionAprobacionOtro, value: form.value.comisionAprobacionOtroNombre, id: form.value.comisionAprobacionOtroId}
    };

    const payload1 = {
        cod_ue: form.value.sie,
        desc_ue: form.value.unidadEducativa, 
        cod_sie: form.value.sie,
        cod_rda_director: null,
        cod_director: null,
        nombres_director: form.value.director,
        apellidos_director: form.value.director,
    
        cod_departamento: form.value.departamento_codigo  ,
        desc_departamento: form.value.departamentoNombre ,
        cod_municipio:  form.value.municipioId,
        desc_municipio:  form.value.municipioNombre,
        cod_nivel: 0 ,
        desc_nivel: form.value.nivel ,
        modalidad: form.value.modalidad,
    
        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()
    }
          
    console.log(payload1);
//  ueggPcpaUnidadEducativa
    const save1 = await ConvivenciaPacifica.create(payload1).then((res) => {
        if(res.status === 201){
        
            toast.info(`Registro ${form.value.sie} guardado correctamente`, { 
                autoClose: 3500,
                position: toast.POSITION.TOP_RIGHT,
            });
            dialog.value = false;  
            dialogSave.value = true; 
            return res;
        } else {
            toast.error('Registro no guardado', {
                autoClose: 3500,
                position: toast.POSITION.TOP_RIGHT,
            });
            return res;
        }
    });
        console.log("save1", save1);
   
    const dateParts = (form.value.fecha || '').split("/");
    const dateParts2 = (form.value.fechaAprobacion || '').split("/"); 
    
    const payload2 = {
        id_pcpa_unidad_educativa: save1.data.id,
        fecha_registro:  new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]).toISOString(), //new Date( form.value.fecha).toISOString(),
        check_diagnostico_pcpa: form.value.registroAnterior,   
        fecha_aprobacion: new Date(dateParts[2] +'-'+ dateParts2[1] +'-'+ dateParts2[0]).toISOString(),
        vigencia_aprobacion : form.value.vigenciaAprobacion,

        estado: 'ACTIVO',
        usu_cre: username,
        fec_cre: new Date()
    }
       //  ueggPcpaConstruccion
    const save2 = await ConvivenciaPacifica.createContruccion(payload2).then((res) => {
        if(res.status === 201){

              toast.info(`Registro id UE ${save1.data.id} guardado correctamente`, {   
                autoClose: 3500,
                position: toast.POSITION.TOP_RIGHT,
            });
            dialog.value = false;  
            dialogSave.value = true; 
            return res;
        } else {
            toast.error('Registro no guardado', {
                autoClose: 3500,
                position: toast.POSITION.TOP_RIGHT,
            });
            return res;
        }
    });

    console.log("save2", save2);
    console.log( comisionConstruccion.value);


    console.log("ini bucle ");

    let payload3 ;
    let save3;
  
    await Object.keys(comisionConstruccion.value).map((item, key) => {
        if(comisionConstruccion.value[item].value ){ //  ||  comisionConstruccion.value[item].length >0
            console.log('comisionConstruccion item, key: ', item, key);

            payload3 = {
                id_pcpa_construccion: save2.data.id,
                id_pcpa_comision_tipo: 1,
                id_pcpa_miembro_tipo: item,      //  id_miembro:  save2.data.id,
                orden: key + 1,
                nombres_miembro: comisionConstruccion.value[item].value,
                apellidos_miembro: '', //comisionConstruccion.value[item].value, 
                check_miembro_comision: comisionConstruccion.value[item].status,                    
                estado: 'ACTIVO' ,
                usu_cre: username,
                fec_cre: new Date()
            }

           // ueggPcpaMiembroComision
            save3 = ConvivenciaPacifica.createMiembroComision(payload3).then((res) => {
                if(res.status === 201){
                 
                    toast.info(`Registro save2.data.id ${save2.data.id} guardado correctamente`, {     
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no guardado', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
            });

      // cambiar a estado INACTIVO registros previos
        /*    const delete1 =  ConvivenciaPacifica.deleteConstruccion(form.value.comisionSocializacionIdConstruccion).then((res) => {
                if(res.status === 204){
                    toast.info('Registro eliminado correctamente', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no eliminado', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
            });*/

            console.log('comisionConstruccion.value[item].id: ',  comisionConstruccion.value[item].id);
            if(!(comisionConstruccion.value[item].id  === undefined ) ){ 
             /*   const delete2 =  ConvivenciaPacifica.deleteMiembroComision(comisionConstruccion.value[item].id).then((res) => {
                    console.log('comisionConstruccion.value[item].id: ',  comisionConstruccion.value[item].id);

                    if(res.status === 204){
                        toast.info('Registro eliminado correctamente', {
                            autoClose: 3500,
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        dialog.value = false;  
                        dialogSave.value = true; 
                        return res;
                    } else {
                        toast.error('Registro no eliminado', {
                            autoClose: 3500,
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        return res;
                    }
                });*/
            }
        }        
    });

    console.log("fin bucle ");
    console.log("save3", save3);

    console.log("ini bucle ");
    let payload4;
    let save4;
    await Object.keys(tema.value).map((item, key) => {
        if(tema.value[item].status){
            console.log(item, key);
            payload4 = {
                id_pcpa_construccion: save2.data.id,
                id_pcpa_actividades_tipo: item,                   
                nivel: 1,
                fec_aprobacion:  new Date(dateParts2[2] +'-'+ dateParts2[1] +'-'+ dateParts2[0]).toISOString(),
                tiempo_vigencia: 0,
                declaracion_jurada: true,                    
                estado: 'ACTIVO' ,
                usu_cre: username,
                fec_cre: new Date()
            }
            //  ueggPcpaActividadesPromocion
            save4 = ConvivenciaPacifica.createTarea(payload4).then((res) => {
                if(res.status === 201){
  
                  toast.info(`Registro id_pcpa_actividades_tipo ${item} guardado correctamente`, {       
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no guardado', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
            });


          /*  let delete2 =  ConvivenciaPacifica.deleteActividadesPromocion( tema.value[item].id  === undefined ? 0 : tema.value[item].id ).then((res) => {
                if(res.status === 204){
                    toast.info('Registro eliminado correctamente', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no eliminado', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
            });*/

            
        }        
    });
    console.log("fin bucle ");
    console.log("save4", save4);

    if(form.value.temaDisciplinario){
        console.log("ini bucle 50");
        let payload50;
        let save50;
        await Object.keys(temaDisciplinario.value).map((item, key) => {
            if(temaDisciplinario.value[item].status){
                console.log(item, key);
                payload50 = {
                    id_pcpa_construccion: save2.data.id,
                    id_pcpa_actividades_tipo: item,                   
                    nivel: 2,
                    fec_aprobacion:  new Date(dateParts2[2] +'-'+ dateParts2[1] +'-'+ dateParts2[0]).toISOString(),
                    tiempo_vigencia: 0,
                    declaracion_jurada: true,                    
                    estado: 'ACTIVO' ,
                    usu_cre: username,
                    fec_cre: new Date()
                }
                           // ueggPcpaActividadesPromocion
                save50 = ConvivenciaPacifica.createTareaPromover(payload50).then((res) => {
                    if(res.status === 201){
   
                           toast.info(`Registro id_pcpa_construccion ${save2.data.id} guardado correctamente`, {  
                            autoClose: 3500,
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        dialog.value = false;  
                        dialogSave.value = true; 
                        return res;
                    } else {
                        toast.error('Registro no guardado', {
                            autoClose: 3500,
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        return res;
                    }
                });


             /*   const delete2 =  ConvivenciaPacifica.deleteActividadesPromocion( temaDisciplinario.value[item].id  === undefined ? 0 : temaDisciplinario.value[item].id).then((res) => {
                if(res.status === 204){
                    toast.info('Registro eliminado correctamente', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no eliminado', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
                });*/


            }        
        });
        console.log("fin bucle ");
        console.log("save50", save50);
    }

    if(form.value.temaPromover){
        console.log("ini bucle ");
        let payload5;
        let save5;
        await Object.keys(temaPromover.value).map((item, key) => {
            if(temaPromover.value[item].status){
                console.log(item, key);
                payload5 = {
                    id_pcpa_construccion: save2.data.id,
                    id_pcpa_actividades_tipo: item,                   
                    nivel: 2,
                    fec_aprobacion:  new Date(dateParts2[2] +'-'+ dateParts2[1] +'-'+ dateParts2[0]).toISOString(),
                    tiempo_vigencia: 0,
                    declaracion_jurada: true,                    
                    estado: 'ACTIVO' ,
                    usu_cre:username,
                    fec_cre: new Date()
                }
                        // ueggPcpaActividadesPromocion
                save5 = ConvivenciaPacifica.createTareaPromover(payload5).then((res) => {
                    if(res.status === 201){
                         toast.info(`Registro id_pcpa_construccion ${save2.data.id} guardado correctamente`, {  
                            autoClose: 3500,
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        dialog.value = false;  
                        dialogSave.value = true; 
                        return res;
                    } else {
                        toast.error('Registro no guardado', {
                            autoClose: 3500,
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        return res;
                    }
                });

            /*    const delete2 =  ConvivenciaPacifica.deleteActividadesPromocion( temaPromover.value[item].id === undefined ? 0 :  temaPromover.value[item].id ).then((res) => {
                if(res.status === 204){
                    toast.info('Registro eliminado correctamente', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no eliminado', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
                });*/


            }        
        });
        console.log("fin bucle ");
        console.log("save5", save5);
    }

    console.log("ini bucle ");
    let payload6;
    let save6;
    await Object.keys(comisionAprobacion.value).map((item, key) => {
        if(comisionAprobacion.value[item].value){ //  comisionConstruccion.value[item].status)
            console.log('comisionAprobacion item, key: ', item, key);

            payload6 = {
                id_pcpa_construccion: save2.data.id,
                id_pcpa_comision_tipo: 2,  // aprobacion
                id_pcpa_miembro_tipo: item,
                orden: key + 1,
                nombres_miembro: comisionAprobacion.value[item].value,
                apellidos_miembro: '',  // comisionAprobacion.value[item].value, 
                check_miembro_comision: comisionAprobacion.value[item].status,                    
                estado: 'ACTIVO' ,
                usu_cre: username,
                fec_cre: new Date()
            }
                  //  ueggPcpaMiembroComision comisionAprobacion
            save6 = ConvivenciaPacifica.createMiembroComisionAprobacion(payload6).then((res) => {
                if(res.status === 201){
             
                        toast.info(`Registro save2.data.id ${save2.data.id} guardado correctamente`, { 
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no guardado', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
            });
            console.log('comisionAprobacion.value[item].id: ',  comisionAprobacion.value[item].id);
        if(!(comisionAprobacion.value[item].id  === undefined ) ){ 

            const delete2 =  ConvivenciaPacifica.deleteMiembroComision(comisionAprobacion.value[item].id).then((res) => {
              console.log('comisionAprobacion.value[item].id: ',  comisionAprobacion.value[item].id);
                if(res.status === 204){
                    toast.info('Registro eliminado correctamente', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no eliminado', {
                        autoClose: 3500,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
            });
        }

        }        
    });
    console.log("fin bucle ");
    console.log("save6", save6);

    console.log("fin");
      
};



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

// Usamos el hook onMounted para asegurar que la asignación ocurra 
// después de que el componente ha sido montado.
onMounted(async() => {

    let user = JSON.parse(localStorage.getItem('user') || '');
    if(user && user.codigo_sie){
        form.value.sie = user.codigo_sie;
        findUnidadesEducativasPorDirector();
        findMiembrosComisionConstruccion();
        findActividadesPromocion();
        username = localStorage.getItem('username') ;

    isLoading.value = false;
    }


// Simulación: Al cargar el componente, verificamos si existe un registro.
    // En un caso real, esto sería una llamada a una API.
    
    // Asignamos un valor inicial para simular que existe un registro para modificar.
    registroExiste.value = localStorage.getItem('existeEnBD')==='true' ? true : false ; 
    
    if (registroExiste.value) {
        // Si el registro existe, precargamos un valor y mantenemos bloqueado
      
    } else {
        // Si es un registro nuevo, asignamos la fecha de hoy, pero se mantiene bloqueado
        // hasta que el usuario haga clic en "Ingresar nuevo registro"
      //  form.value.fecha = getTodayDateFormatted(); 
        isFormDisabled.value = true;
    }



}); 

const findUnidadesEducativasPorDirector = async () => {
    console.log("form.value.sie:" , form.value.sie);
    const  dataAuth =  {username: localStorage.getItem('username'), password: localStorage.getItem('password')};

    if(String(form.value.sie).length === 8){
        const res = await  Auth.listUnidadesEducativasPorDirector(dataAuth); // ConvivenciaPacifica.findInstitucionEducativa(form.value.sie); 
         //  console.log("Respuesta del servidor:", res);  //              console.log("Tipo de res.data:", typeof res.data.data);
        //    console.log("¿Es array res.data?:", Array.isArray(res.data.data));
      const data = res?.data.data.find( ue => ue.codigo_sie === Number(localStorage.getItem('codigo_sie'))
                    // O también: ue => ue.codigo_sie.toString() === codigo_sie
                    );
        console.log("listUnidadesEducativasPorDirector  encontrada: ", data);
      if(data){
        form.value.departamentoId = data.departamento_codigo;
        form.value.departamentoNombre = data.departamento;
       // form.value.municipioId = data.municipio_codigo;
        form.value.municipioNombre = data.distrito ;   // municipio;
        form.value.unidadEducativa = data.nombre_unidad_educativa ;  // institucioneducativa;
        form.value.nivel = data.nivel;
        form.value.modalidad = data.dependencia;
        form.value.director = data.nombre_director + ' ' + data.ap_paterno_director + ' ' + data.ap_materno_director  // director;
        find.value = true;
        institucionEducativa.value = data;
        console.log("form.value.sie.length: ", form.value.sie.length);
           
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
        console.warn("No se encontró ninguna institución educativa para el SIE:", sie); 
    }
}; 

const findMiembrosComisionConstruccion = async () => {
    console.log(form.value.sie);
 if(String(form.value.sie).length === 8){
    const res = await ConvivenciaPacifica.findMiembrosComisionConstruccion(form.value.sie);
    console.log("findMiembrosComisionConstruccion res: ", res);

    res.data.map((data: {  id_comision_tipo: number; id_miembro_tipo: number; 
                        }, index:  number) => {
             form.value.comisionSocializacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion    
          
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===1 && data.id_comision_tipo===1  ){// estudiante
            //       console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionSocializacionEstudianteNombre= res.data[index].nombres_miembro ; 
         
            form.value.comisionSocializacionEstudianteId= res.data[index].id_miembro  ; 
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===2 && data.id_comision_tipo===1  ){// director
               //    console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionSocializacionDirectorNombre= res.data[index].nombres_miembro  ;   
           // form.value.comisionSocializacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionSocializacionDirectorId= res.data[index].id_miembro  ; 
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===3 && data.id_comision_tipo===1  ){// maestro
                 //  console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionSocializacionMaestroNombre= res.data[index].nombres_miembro  ;  
          //  form.value.comisionSocializacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionSocializacionMaestroId= res.data[index].id_miembro  ;   
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===4 && data.id_comision_tipo===1  ){// padres
                 //  console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionSocializacionPadreNombre= res.data[index].nombres_miembro  ;      
          //  form.value.comisionSocializacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionSocializacionPadreId= res.data[index].id_miembro  ; 
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===5 && data.id_comision_tipo===1  ){// otro
               //    console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionSocializacionOtroNombre= res.data[index].nombres_miembro  ;    
         //   form.value.comisionSocializacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionSocializacionOtroId= res.data[index].id_miembro  ; 
        }
     //  console.log(res.data[index]);

       if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===1 && data.id_comision_tipo===2  ){// estudiante
               //    console.log("res.data[index].id_miembro : ", res.data[index].id_miembro  )
            form.value.comisionAprobacionEstudianteNombre= res.data[index].nombres_miembro ; 
            //form.value.comisionAprobacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionAprobacionEstudianteId= res.data[index].id_miembro  ; 
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===2 && data.id_comision_tipo===2  ){// director
            //       console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionAprobacionDirectorNombre= res.data[index].nombres_miembro  ;   
           // form.value.comisionAprobacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionAprobacionDirectorId= res.data[index].id_miembro  ; 
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===3 && data.id_comision_tipo===2  ){// maestro
               //    console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionAprobacionMaestroNombre= res.data[index].nombres_miembro  ;  
          //  form.value.comisionAprobacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionAprobacionMaestroId= res.data[index].id_miembro  ;   
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===4 && data.id_comision_tipo===2  ){// padres
               //    console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionAprobacionPadreNombre= res.data[index].nombres_miembro  ;      
           // form.value.comisionAprobacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionAprobacionPadreId= res.data[index].id_miembro  ; 
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===5 && data.id_comision_tipo===2  ){// otro
             //      console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionAprobacionOtroNombre= res.data[index].nombres_miembro  ;    
         //   form.value.comisionAprobacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionAprobacionOtroId= res.data[index].id_miembro  ; 
        }
      // console.log(res.data[index]);

    
    });

    if(res.data && res.data.length > 0){
        let dateParts = ( res.data[0].fecha_registro || '').split("T");    //const dateParts2 = new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]).toISOString()
        dateParts = ( dateParts[0] ).split("-"); 
        form.value.fecha =  dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0];

        dateParts = ( res.data[0].fecha_aprobacion || '').split("T"); 
        dateParts = ( dateParts[0]).split("-"); 
        form.value.fechaAprobacion=    dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0];
        form.value.vigenciaAprobacion=  res.data[0].vigencia_aprobacion;
        form.value.registroAnterior=   res.data[0].check_diagnostico_pcpa;
    }
       miembrosComisionConstruccion.value = res.data[0];           
        
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
    console.log('form.value.sie : ', form.value.sie);

    const res = await ConvivenciaPacifica.findActividadesPromocion(form.value.sie);
    console.log("findActividadesPromocion res: ", res);
       actividadesPromocion.value = res.data;        
    console.table(actividadesPromocion.value); // O si prefieres una forma más compacta:

    res.data.map((data: {  nivel: number; id_pcpa_actividades_tipo: number; 
                        }, index:  number) => {
       //  console.log("id_pcpa_actividades_tipo: ", data.id_pcpa_actividades_tipo  )        
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===1  ){// temaDerecho
            form.value.id_temaDerecho= res.data[index].id_actividades_promocion  ;     
            form.value.temaDerecho= res.data[index].check_actividad_tipo ;      }
         
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===2  ){   
			form.value.id_temaNorma       = res.data[index].id_actividades_promocion        ; 		  
			form.value.temaNorma          = res.data[index].check_actividad_tipo        ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===3  ){   // PROCEDIMIENTOS DISCIPLINARIOS
			form.value.id_temaDisciplinario= res.data[index].id_actividades_promocion; 		 
			form.value.temaDisciplinario   = res.data[index].check_actividad_tipo;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===4  ){ 
			form.value.id_temaSancion     = res.data[index].id_actividades_promocion      ; 		      
			form.value.temaSancion        = res.data[index].check_actividad_tipo      ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===5  ){  
			form.value.id_temaAdopcion    = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaAdopcion       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===6  ){   
			form.value.id_temaAlternativo = res.data[index].id_actividades_promocion  ; 		      
			form.value.temaAlternativo    = res.data[index].check_actividad_tipo  ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===7  ){  
			form.value.id_temaRemision    = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaRemision       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===8  ){ 
			form.value.id_temaTaller      = res.data[index].id_actividades_promocion       ; 		        
			form.value.temaTaller         = res.data[index].check_actividad_tipo       ;   } 

        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===9  ){    // ACTIVIDADES PARA PROMOVER LA CONVIVENCIA PACÍFICA
			form.value.id_temaPromover    = res.data[index].id_actividades_promocion     ; 		          
			form.value.temaPromover       = res.data[index].check_actividad_tipo     ; }
          //  form.value.nivel_temaPromover      = res.data[index].nivel     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===10  ){  
			form.value.id_temaSeguimiento  = res.data[index].id_actividades_promocion  ;        
			form.value.temaSeguimiento    = res.data[index].check_actividad_tipo  ;   }                                                               
                                                 		         
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===1  ){ 
			form.value.id_temaPromover1    = res.data[index].id_actividades_promocion     ; 		       
			form.value.temaPromover1       = res.data[index].check_actividad_tipo     ;  
            form.value.nivel_temaPromover1       = res.data[index].nivel     ;  } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===2  ){  
			form.value.id_temaPromover2    = res.data[index].id_actividades_promocion     ; 		        
			form.value.temaPromover2       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===3  ){   
			form.value.id_temaPromover3      = res.data[index].id_actividades_promocion     ; 		        
			form.value.temaPromover3       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===4  ){ 
			form.value.id_temaPromover4    = res.data[index].id_actividades_promocion     ; 		          
			form.value.temaPromover4       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===5  ){  
			form.value.id_temaPromover5    = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaPromover5       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===6  ){  
			form.value.id_temaPromover6    = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaPromover6       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===7  ){   
			form.value.id_temaPromover7    = res.data[index].id_actividades_promocion     ; 		        
			form.value.temaPromover7       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===8  ){   
			form.value.id_temaPromover8      = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaPromover8       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===9  ){ 
			form.value.id_temaPromover9      = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaPromover9       = res.data[index].check_actividad_tipo     ;   } 
		
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===10  ){   //  PROCEDIMIENTOS DISCIPLINARIOS
			form.value.id_temaDisciplinarioCorrectivo            = res.data[index].id_actividades_promocion                ; 	
			form.value.temaDisciplinarioCorrectivo               = res.data[index].check_actividad_tipo                ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===11  ){ 
			form.value.id_temaDisciplinarioProcedimientoMarco    = res.data[index].id_actividades_promocion        ; 		      
			form.value.temaDisciplinarioProcedimientoMarco       = res.data[index].check_actividad_tipo        ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===12  ){ 
			form.value.id_temaDisciplinarioProcedimientoAlternativo = res.data[index].id_actividades_promocion  ; 		  
			form.value.temaDisciplinarioProcedimientoAlternativo = res.data[index].check_actividad_tipo  ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===13  ){  
			form.value.id_temaDisciplinarioLineamiento           = res.data[index].id_actividades_promocion               ; 		  
			form.value.temaDisciplinarioLineamiento              = res.data[index].check_actividad_tipo               ;   } 


           form.value.temaPromover = [
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

            // Sync temaDisciplinario parent based on any true sub-value
            form.value.temaDisciplinario = [
            form.value.temaDisciplinarioCorrectivo,
            form.value.temaDisciplinarioProcedimientoMarco,
            form.value.temaDisciplinarioProcedimientoAlternativo,
            form.value.temaDisciplinarioLineamiento
            ].some(value => value === true);
 
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



    // Lógica para reiniciar el formulario 
const reset = () => {   

   if (registroExiste.value ){
      //  isFormDisabled.value = true; // Deshabilita el formulario después de guardar
      // registroExiste.value = true; // Muestra el botón 'Modificar' la próxima vez
          console.log('reset: registroExiste.value = true;');
    dialogSave.value = false;
    }
   else{
    console.log('Limpiar formulario.');
    dialogSave.value = false;
    registroExiste.value = false; // Permite ingresar un nuevo registro

    form.value.fecha = '';
    form.value.registroAnterior = false;
    form.value.comisionCargo = '';
    form.value.comisionNombre = '';
    form.value.comisionSocializacionEstudiante = false;
    form.value.comisionSocializacionDirector = false;
    form.value.comisionSocializacionMaestro = false;
    form.value.comisionSocializacionPadre = false;
    form.value.comisionSocializacionOtro = false;
    form.value.comisionSocializacionEstudianteNombre = '';
    form.value.comisionSocializacionDirectorNombre = '';
    form.value.comisionSocializacionMaestroNombre = '';
    form.value.comisionSocializacionPadreNombre = '';
    form.value.comisionSocializacionOtroNombre = '';
    form.value.temaDerecho = '';
    form.value.temaNorma = '';
    form.value.temaDisciplinario = '';
    form.value.temaDisciplinarioCorrectivo = '';
    form.value.temaDisciplinarioProcedimientoMarco = '';
    form.value.temaDisciplinarioProcedimientoAlternativo = '';
    form.value.temaDisciplinarioLineamiento = '';        
    form.value.temaSancion = '';
    form.value.temaAdopcion = '';
    form.value.temaAlternativo = '';
    form.value.temaRemision = '';
    form.value.temaTaller = '';
    form.value.temaPromover = '';
    form.value.temaPromover1 = '';
    form.value.temaPromover2 = '';
    form.value.temaPromover3 = '';
    form.value.temaPromover4 = '';
    form.value.temaPromover5 = '';
    form.value.temaPromover6 = '';
    form.value.temaPromover7 = '';
    form.value.temaPromover8 = '';
    form.value.temaPromover9 = '';
    form.value.temaSeguimiento = '';
    form.value.comisionAprobacionCargo = '';
    form.value.comisionAprobacionNombre = '';
    form.value.comisionAprobacionEstudiante = false;
    form.value.comisionAprobacionDirector = false;
    form.value.comisionAprobacionMaestro = false;
    form.value.comisionAprobacionPadre = false;
    form.value.comisionAprobacionOtro = false;
    form.value.comisionAprobacionEstudianteNombre = '';
    form.value.comisionAprobacionDirectorNombre = '';
    form.value.comisionAprobacionMaestroNombre = '';
    form.value.comisionAprobacionPadreNombre = '';
    form.value.comisionAprobacionOtroNombre = '';
    form.value.fechaAprobacion = '';
    form.value.vigenciaAprobacion = '';
    form.value.validado = false;
  }
};

const validateForm = () => {
    validationErrors.value = {};

    if (!form.value.sie || !form.value.unidadEducativa) validationErrors.value['sie'] = true;
    else delete validationErrors.value['sie'];

    if (!form.value.fecha) validationErrors.value['fecha'] = true;
    else delete validationErrors.value['fecha'];

if (!form.value.fechaAprobacion) validationErrors.value['fechaAprobacion'] = true;
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
   
    return !Object.keys(validationErrors.value).length;
};


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
                            
                            <v-btn v-if="!registroExiste && !isLoading" color="primary" class="ml-2" @click="iniciarNuevoRegistro" :disabled="!isFormDisabled" flat>
                                Ingresar nuevo registro
                            </v-btn>

                            <v-btn v-if="registroExiste && !isLoading" color="info" class="ml-2" @click="modificarRegistro" :disabled="!isFormDisabled" flat>
                                Modificar registro
                            </v-btn>
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
                                    <v-text-field v-model="form.sie" :counter="8" label="SIE" required hide-details  :readonly="true"></v-text-field>
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
                                                <v-btn color="green-darken-1" variant="text" @click="registro">Aceptar</v-btn>
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




