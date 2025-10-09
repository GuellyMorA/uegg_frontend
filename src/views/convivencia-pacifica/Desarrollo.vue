<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import axios from 'axios';
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
const form: any = ref({
    sie: null,
    departamentoId: null,
    departamentoNombre: '',
    municipioId: null,
    municipioNombre: '',
    unidadEducativa: '',
    nivel: '',
    modalidad: '',
    director: '',
    fecha: '',
    registroAnterior: false,
    comisionCargo: '',
    comisionNombre: '',
    comisionSocializacionEstudiante: false,
    comisionSocializacionDirector: false,
    comisionSocializacionMaestro: false,
    comisionSocializacionPadre: false,
    comisionSocializacionOtro: false,
    comisionSocializacionEstudianteNombre: '',
    comisionSocializacionDirectorNombre: '',
    comisionSocializacionMaestroNombre: '',
    comisionSocializacionPadreNombre: '',
    comisionSocializacionOtroNombre: '',
    comisionSocializacionIdConstruccion: '',
    comisionSocializacionIdMiembro: '',
    temaDerecho: '',
    temaNorma: '',
    temaDisciplinario: '',
    temaDisciplinarioCorrectivo: '',
    temaDisciplinarioProcedimientoMarco: '',
    temaDisciplinarioProcedimientoAlternativo: '',
    temaDisciplinarioLineamiento: '',
    temaSancion: '',
    temaAdopcion: '',
    temaAlternativo: '',
    temaRemision: '',
    temaTaller: '',
    temaPromover: '',
    temaPromover1: '',
    temaPromover2: '',
    temaPromover3: '',
    temaPromover4: '',
    temaPromover5: '',
    temaPromover6: '',
    temaPromover7: '',
    temaPromover8: '',
    temaPromover9: '',
    temaSeguimiento: '',
    comisionAprobacionCargo: '',
    comisionAprobacionNombre: '',
    comisionAprobacionEstudiante: false,
    comisionAprobacionDirector: false,
    comisionAprobacionMaestro: false,
    comisionAprobacionPadre: false,
    comisionAprobacionOtro: false,
    comisionAprobacionEstudianteNombre: '',
    comisionAprobacionDirectorNombre: '',
    comisionAprobacionMaestroNombre: '',
    comisionAprobacionPadreNombre: '',
    comisionAprobacionOtroNombre: '',
    comisionAprobacionIdConstruccion: '',
    comisionAprobacionIdMiembro: '',
    fechaAprobacion:'',
    vigenciaAprobacion: '',
    validado: false
});

const sieRules = [
    (value: any) => {
        if (value) return true
        return 'El SIE es requerido'
    },
    (value: any) => {
        if (value?.length === 8) return true
        return 'El código SIE requiere 8 dígitos.'
    },
];

let username: string | null ;


onMounted(async() => {
    let user = JSON.parse(localStorage.getItem('user') || '');
    if(user && user.codigo_sie){
        form.value.sie = user.codigo_sie;
        findInstitucionEducativa();
        findMiembrosComisionConstruccion();
        findActividadesPromocion();
        username = localStorage.getItem('username') ;
        console.log("============");
      //  form.value.vigenciaAprobacion=99;
      //  form.value.fecha='01/01/2027';
      //  form.value.fechaAprobacion='01/01/2028';
  
    }
});

// Función para validar el formulario de unida educativa llenando sus campos automaticamente 
/* const findInstitucionEducativa = async () => {
    console.log(form.value.sie);
    if(String(form.value.sie).length === 8){
        const res = await ConvivenciaPacifica.findInstitucionEducativa(form.value.sie);
        console.log("res", res);
        if(res.data && res.data.length > 0){
            form.value.departamentoId = res.data[0].departamento_codigo;
            form.value.departamentoNombre = res.data[0].departamento;
            form.value.municipioId = res.data[0].municipio_codigo;  
            form.value.municipioNombre = res.data[0].municipio;
            form.value.unidadEducativa = res.data[0].institucioneducativa;
            form.value.nivel = res.data[0].niveles_abrv;
            form.value.modalidad = res.data[0].dependencia;
            form.value.director = res.data[0].director;
            find.value = true;
            institucionEducativa.value = res.data[0];
            console.log(res.data[0], form.value.sie.length, res);
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
    }
};  */
// Función mejorada sin arrary para validar el formulario de unida educativa llenando sus campos automaticamente 
const findInstitucionEducativa = async () => {
    //console.log(form.value.sie);
    if (String(form.value.sie).length === 8) {
        const res = await ConvivenciaPacifica.findInstitucionEducativa(form.value.sie);
        console.log("res", res);

        const data = res.data; // ← es un objeto, no array
        if (data && data.id) {
        form.value.departamentoId = data.departamento_codigo;
        form.value.departamentoNombre = data.departamento;
        form.value.municipioId = data.municipio_codigo;  
        form.value.municipioNombre = data.municipio;
        form.value.unidadEducativa = data.institucioneducativa;
        form.value.nivel = data.niveles_abrv;
        form.value.modalidad = data.dependencia;
        form.value.director = data.director;
        find.value = true;
        institucionEducativa.value = data;
        //console.log(data, form.value.sie.length, res);
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
    }
};


const findMiembrosComisionConstruccion = async () => {
    console.log(form.value.sie);
 if(String(form.value.sie).length === 8){
    const res = await ConvivenciaPacifica.findMiembrosComisionConstruccion(form.value.sie);
    console.log("res", res);

    res.data.map((data: {  id_comision_tipo: number; id_miembro_tipo: number; 
                        }, index:  number) => {
             form.value.comisionSocializacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion    
          
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===1 && data.id_comision_tipo===1  ){// estudiante
                   console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionSocializacionEstudianteNombre= res.data[index].nombres_miembro ; 
         
            form.value.comisionSocializacionEstudianteId= res.data[index].id_miembro  ; 
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===2 && data.id_comision_tipo===1  ){// director
                   console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionSocializacionDirectorNombre= res.data[index].nombres_miembro  ;   
           // form.value.comisionSocializacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionSocializacionDirectorId= res.data[index].id_miembro  ; 
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===3 && data.id_comision_tipo===1  ){// maestro
                   console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionSocializacionMaestroNombre= res.data[index].nombres_miembro  ;  
          //  form.value.comisionSocializacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionSocializacionMaestroId= res.data[index].id_miembro  ;   
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===4 && data.id_comision_tipo===1  ){// padres
                   console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionSocializacionPadreNombre= res.data[index].nombres_miembro  ;      
          //  form.value.comisionSocializacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionSocializacionPadreId= res.data[index].id_miembro  ; 
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===5 && data.id_comision_tipo===1  ){// otro
                   console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionSocializacionOtroNombre= res.data[index].nombres_miembro  ;    
         //   form.value.comisionSocializacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionSocializacionOtroId= res.data[index].id_miembro  ; 
        }
       console.log(res.data[index]);

       if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===1 && data.id_comision_tipo===2  ){// estudiante
                   console.log("res.data[index].id_miembro : ", res.data[index].id_miembro  )
            form.value.comisionAprobacionEstudianteNombre= res.data[index].nombres_miembro ; 
            //form.value.comisionAprobacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionAprobacionEstudianteId= res.data[index].id_miembro  ; 
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===2 && data.id_comision_tipo===2  ){// director
                   console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionAprobacionDirectorNombre= res.data[index].nombres_miembro  ;   
           // form.value.comisionAprobacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionAprobacionDirectorId= res.data[index].id_miembro  ; 
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===3 && data.id_comision_tipo===2  ){// maestro
                   console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionAprobacionMaestroNombre= res.data[index].nombres_miembro  ;  
          //  form.value.comisionAprobacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionAprobacionMaestroId= res.data[index].id_miembro  ;   
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===4 && data.id_comision_tipo===2  ){// padres
                   console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionAprobacionPadreNombre= res.data[index].nombres_miembro  ;      
           // form.value.comisionAprobacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionAprobacionPadreId= res.data[index].id_miembro  ; 
        }
        if(res.data && res.data.length > 0 &&  data.id_miembro_tipo ===5 && data.id_comision_tipo===2  ){// otro
                   console.log("id_miembro_tipo: ", data.id_miembro_tipo  )
            form.value.comisionAprobacionOtroNombre= res.data[index].nombres_miembro  ;    
         //   form.value.comisionAprobacionIdConstruccion= res.data[index].id  ;  //id_pcpa_construccion
            form.value.comisionAprobacionOtroId= res.data[index].id_miembro  ; 
        }
       console.log(res.data[index]);

    
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
    console.log(form.value.sie);

    const res = await ConvivenciaPacifica.findActividadesPromocion(form.value.sie);
    console.log("res", res);
    res.data.map((data: {  nivel: number; id_pcpa_actividades_tipo: number; 
                        }, index:  number) => {
              console.log("id_pcpa_actividades_tipo: ", data.id_pcpa_actividades_tipo  )        
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===1  ){// temaDerecho
            form.value.id_temaDerecho= res.data[index].id_actividades_promocion  ;     
            form.value.temaDerecho= res.data[index].check_actividad_tipo ;      }
         
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===2  ){   
			form.value.id_temaNorma          = res.data[index].id_actividades_promocion        ; 		  
			form.value.temaNorma          = res.data[index].check_actividad_tipo        ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===3  ){   // PROCEDIMIENTOS DISCIPLINARIOS
			form.value.id_temaDisciplinario  = res.data[index].id_actividades_promocion; 		 
			form.value.temaDisciplinario  = res.data[index].check_actividad_tipo;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===4  ){ 
			form.value.id_temaSancion        = res.data[index].id_actividades_promocion      ; 		      
			form.value.temaSancion        = res.data[index].check_actividad_tipo      ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===5  ){  
			form.value.id_temaAdopcion       = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaAdopcion       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===6  ){   
			form.value.id_temaAlternativo    = res.data[index].id_actividades_promocion  ; 		      
			form.value.temaAlternativo    = res.data[index].check_actividad_tipo  ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===7  ){  
			form.value.id_temaRemision       = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaRemision       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===8  ){ 
			form.value.id_temaTaller         = res.data[index].id_actividades_promocion       ; 		        
			form.value.temaTaller         = res.data[index].check_actividad_tipo       ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===9  ){    // ACTIVIDADES PARA PROMOVER LA CONVIVENCIA PACÍFICA
			form.value.id_temaPromover       = res.data[index].id_actividades_promocion     ; 		          
			form.value.temaPromover       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===1 && data.id_pcpa_actividades_tipo===10  ){  
			form.value.id_temaSeguimiento    = res.data[index].id_actividades_promocion  ;        
			form.value.temaSeguimiento    = res.data[index].check_actividad_tipo  ;   }                                                               
                                                 		         
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===1  ){ 
			form.value.id_temaPromover1      = res.data[index].id_actividades_promocion     ; 		       
			form.value.temaPromover1       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===2  ){  
			form.value.id_temaPromover2      = res.data[index].id_actividades_promocion     ; 		        
			form.value.temaPromover2       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===3  ){   
			form.value.id_temaPromover3      = res.data[index].id_actividades_promocion     ; 		        
			form.value.temaPromover3       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===4  ){ 
			form.value.id_temaPromover4      = res.data[index].id_actividades_promocion     ; 		          
			form.value.temaPromover4       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===5  ){  
			form.value.id_temaPromover5      = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaPromover5       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===6  ){  
			form.value.id_temaPromover6      = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaPromover6       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===7  ){   
			form.value.id_temaPromover7      = res.data[index].id_actividades_promocion     ; 		        
			form.value.temaPromover7       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===8  ){   
			form.value.id_temaPromover8      = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaPromover8       = res.data[index].check_actividad_tipo     ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===9  ){ 
			form.value.id_temaPromover9      = res.data[index].id_actividades_promocion     ; 		         
			form.value.temaPromover9       = res.data[index].check_actividad_tipo     ;   } 
		
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===10  ){   //  PROCEDIMIENTOS DISCIPLINARIOS
			form.value.id_temaDisciplinarioCorrectivo               = res.data[index].id_actividades_promocion                ; 	
			form.value.temaDisciplinarioCorrectivo               = res.data[index].check_actividad_tipo                ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===11  ){ 
			form.value.id_temaDisciplinarioProcedimientoMarco       = res.data[index].id_actividades_promocion        ; 		      
			form.value.temaDisciplinarioProcedimientoMarco       = res.data[index].check_actividad_tipo        ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===12  ){ 
			form.value.id_temaDisciplinarioProcedimientoAlternativo = res.data[index].id_actividades_promocion  ; 		  
			form.value.temaDisciplinarioProcedimientoAlternativo = res.data[index].check_actividad_tipo  ;   } 
        if(res.data && res.data.length > 0 &&  data.nivel ===2 && data.id_pcpa_actividades_tipo===13  ){  
			form.value.id_temaDisciplinarioLineamiento              = res.data[index].id_actividades_promocion               ; 		  
			form.value.temaDisciplinarioLineamiento              = res.data[index].check_actividad_tipo               ;   } 

       console.log(res.data[index]);

    
    });

    actividadesPromocion.value = res.data[0];           
        

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

const save = async () => {
    console.log(form.value);

    if (!validateForm()) {
        dialog.value = false;  
        toast.info('Debe ingresar los datos requeridos', {
            autoClose: 3000,
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
            toast.info('Registro guardado correctamente', {
                autoClose: 3000,
                position: toast.POSITION.TOP_RIGHT,
            });
            dialog.value = false;  
            dialogSave.value = true; 
            return res;
        } else {
            toast.error('Registro no guardado', {
                autoClose: 3000,
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
        fecha_aprobacion: new Date(dateParts2[2] +'-'+ dateParts2[1] +'-'+ dateParts2[0]).toISOString(),
        vigencia_aprobacion : form.value.vigenciaAprobacion,

        estado: 'ACTIVO',
        usu_cre: username,
        fec_cre: new Date()
    }
    //  ueggPcpaConstruccion
    const save2 = await ConvivenciaPacifica.createContruccion(payload2).then((res) => {
        if(res.status === 201){
            toast.info('Registro guardado correctamente', {
                autoClose: 3000,
                position: toast.POSITION.TOP_RIGHT,
            });
            dialog.value = false;  
            dialogSave.value = true; 
            return res;
        } else {
            toast.error('Registro no guardado', {
                autoClose: 3000,
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
           //console.log("payload3_alkey", payload3);
            save3 = ConvivenciaPacifica.createMiembroComision(payload3).then((res) => {
                if(res.status === 201){
                    toast.info('Registro guardado correctamente', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no guardado', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
            });

      // cambiar a estado INACTIVO registros previos
            const delete1 =  ConvivenciaPacifica.deleteConstruccion(form.value.comisionSocializacionIdConstruccion).then((res) => {
                if(res.status === 204){
                    toast.info('Registro eliminado correctamente', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no eliminado', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
            });
            console.log('comisionConstruccion.value[item].id: ',  comisionConstruccion.value[item].id);
            if(!(comisionConstruccion.value[item].id  === undefined ) ){ 
                const delete2 =  ConvivenciaPacifica.deleteMiembroComision(comisionConstruccion.value[item].id).then((res) => {
                    console.log('comisionConstruccion.value[item].id: ',  comisionConstruccion.value[item].id);

                    if(res.status === 204){
                        toast.info('Registro eliminado correctamente', {
                            autoClose: 3000,
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        dialog.value = false;  
                        dialogSave.value = true; 
                        return res;
                    } else {
                        toast.error('Registro no eliminado', {
                            autoClose: 3000,
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        return res;
                    }
                });
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
                    toast.info('Registro guardado correctamente', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no guardado', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
            });


            let delete2 =  ConvivenciaPacifica.deleteActividadesPromocion( tema.value[item].id  === undefined ? 0 : tema.value[item].id ).then((res) => {
                if(res.status === 204){
                    toast.info('Registro eliminado correctamente', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no eliminado', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
            });

            
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
                        toast.info('Registro guardado correctamente', {
                            autoClose: 3000,
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        dialog.value = false;  
                        dialogSave.value = true; 
                        return res;
                    } else {
                        toast.error('Registro no guardado', {
                            autoClose: 3000,
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        return res;
                    }
                });


                const delete2 =  ConvivenciaPacifica.deleteActividadesPromocion( temaDisciplinario.value[item].id  === undefined ? 0 : temaDisciplinario.value[item].id).then((res) => {
                if(res.status === 204){
                    toast.info('Registro eliminado correctamente', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no eliminado', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
            });


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
                        toast.info('Registro guardado correctamente', {
                            autoClose: 3000,
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        dialog.value = false;  
                        dialogSave.value = true; 
                        return res;
                    } else {
                        toast.error('Registro no guardado', {
                            autoClose: 3000,
                            position: toast.POSITION.TOP_RIGHT,
                        });
                        return res;
                    }
                });

                const delete2 =  ConvivenciaPacifica.deleteActividadesPromocion( temaPromover.value[item].id === undefined ? 0 :  temaPromover.value[item].id ).then((res) => {
                if(res.status === 204){
                    toast.info('Registro eliminado correctamente', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no eliminado', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    return res;
                }
            });


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
                    toast.info('Registro guardado correctamente', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no guardado', {
                        autoClose: 3000,
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
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    dialog.value = false;  
                    dialogSave.value = true; 
                    return res;
                } else {
                    toast.error('Registro no eliminado', {
                        autoClose: 3000,
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



const reset = () => {    
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
    dialogSave.value = false;
};

const validateForm = () => {
    validationErrors.value = {};

    if (!form.value.sie || !form.value.unidadEducativa) validationErrors.value['sie'] = true;
    else delete validationErrors.value['sie'];

    if (!form.value.fechaAprobacion) validationErrors.value['fecha'] = true;
    else delete validationErrors.value['fecha'];

    if ( (!form.value.comisionSocializacionEstudiante && !form.value.comisionSocializacionEstudianteNombre) && (!form.value.comisionSocializacionDirector && !form.value.comisionSocializacionDirectorNombre)  && (!form.value.comisionSocializacionMaestro &&  !form.value.comisionSocializacionMaestroNombre) && (!form.value.comisionSocializacionPadre && !form.value.comisionSocializacionPadreNombre)  && (!form.value.comisionSocializacionOtro && !form.value.comisionSocializacionOtroNombre) ) validationErrors.value['comision'] = true;
    else delete validationErrors.value['comision'];

    if (!form.value.temaDerecho && !form.value.temaNorma && !form.value.temaDisciplinario && !form.value.temaSancion && !form.value.temaAdopcion && !form.value.temaAlternativo && !form.value.temaRemision && !form.value.temaTaller && !form.value.temaPromover && !form.value.temaSeguimiento) validationErrors.value['tema'] = true;
    else delete validationErrors.value['tema'];

    if(form.value.temaPromover){
        if (!form.value.temaPromover1 && !form.value.temaPromover2 && !form.value.temaPromover3 && !form.value.temaPromover4 && !form.value.temaPromover5 && !form.value.temaPromover6 && !form.value.temaPromover7 && !form.value.temaPromover8 && !form.value.temaPromover9) validationErrors.value['temaPromover'] = true;
        else delete validationErrors.value['temaPromover'];
    }

   // if (!form.value.comisionAprobacionEstudiante && !form.value.comisionAprobacionDirector && !form.value.comisionAprobacionMaestro && !form.value.comisionAprobacionPadre && !form.value.comisionAprobacionOtro) validationErrors.value['comisionAprobacion'] = true;
   if ( (!form.value.comisionAprobacionEstudiante && !form.value.comisionAprobacionEstudianteNombre) && (!form.value.comisionAprobacionDirector && !form.value.comisionAprobacionDirectorNombre)  && (!form.value.comisionAprobacionMaestro &&  !form.value.comisionAprobacionMaestroNombre) && (!form.value.comisionAprobacionPadre && !form.value.comisionAprobacionPadreNombre)  && (!form.value.comisionAprobacionOtro && !form.value.comisionAprobacionOtroNombre) ) validationErrors.value['comision'] = true;
   else delete validationErrors.value['comisionAprobacion'];

    if (!form.value.fechaAprobacion) validationErrors.value['fechaAprobacion'] = true;
    else delete validationErrors.value['fechaAprobacion'];

    if (!form.value.fechaAprobacion) validationErrors.value['vigenciaAprobacion'] = true;
    else delete validationErrors.value['vigenciaAprobacion'];

    if (!form.value.validado) validationErrors.value['validado'] = true;
    else delete validationErrors.value['validado'];
   
    return !Object.keys(validationErrors.value).length;
};


</script>
<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Registro de datos</v-card-title>
                    </div>
                    <v-form v-model="valid" class="">
                        <v-container>
                        <v-row>
                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos de Unidad Educativa</span>
                                </div>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.sie" :rules="sieRules" :counter="8" label="SIE" required hide-details v-on:keyup="findInstitucionEducativa" :readonly="find && !variusSie"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.unidadEducativa" :counter="10" label="Unidad Educativa" hide-details required :readonly="find"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.departamentoNombre" label="Departamento" hide-details required :readonly="find"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.municipioNombre" label="Distrito" hide-details required :readonly="find"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.nivel" label="Nivel" hide-details required :readonly="find"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.modalidad" label="Modalidad" hide-details required :readonly="find"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.director" label="Director" hide-details required :readonly="find"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Construcción del PCPA</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fecha" label="Fecha de registro" @input="onDateInput" placeholder="DD/MM/AAAA" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <!-- <v-checkbox v-model="form.registroAnterior" :error-messages="''" label="¿Se realizó un diagnóstico antes de iniciar la construcción del PCPA?" required></v-checkbox> -->
                                <v-checkbox v-model="form.registroAnterior" label="¿Se realizó un diagnóstico antes de iniciar la construcción del PCPA?" required></v-checkbox>
                            </v-col>

                            <!-- <v-col cols="12" md="4" >
                                Miembros de la comisión de construcción del PCPA
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionCargo" label="Cargo" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionNombre" label="Nombre" hide-details required></v-text-field>
                            </v-col> -->

                            <v-col cols="12" md="12" >
                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Miembros de la comisión de construcción del PCPA</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionEstudiante" label="Estudiantes" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionEstudianteNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionEstudiante" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionDirector" label="Director(a)" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionDirectorNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionDirector" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionMaestro" label="Maestro(a)" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionMaestroNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionMaestro" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionPadre" label="Padres/Madres" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionPadreNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionPadre" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionOtro" label="Otros" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionOtroNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionSocializacionOtro" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12" >
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Temas que aborda el Plan de Convivencia Pacífica y Armónica</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.temaDerecho" label="Derechos y deberes" required></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.temaNorma" label="Normas de conducta" required></v-checkbox>
                            </v-col>

                            <!-- <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.temaDisciplinario" label="Procedimientos disciplinarios" required></v-checkbox>
                            </v-col> -->
<!--Modificación implementación-->
                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.temaPromover" label="Componentes para promover la convivencia pacífica" required></v-checkbox>
                                <v-row class="pl-10 secondarybg" v-if="form.temaPromover">
                                    <v-col cols="12" md="6" >
                                        <v-checkbox v-model="form.temaPromover1" label="Movilización social" required></v-checkbox>
                                        <v-checkbox v-model="form.temaPromover2" label="Fomento al desarrollo de habilidades y práctica de valores" required></v-checkbox>  
                                        <v-checkbox v-model="form.temaPromover3" label="Capacitación" required></v-checkbox>  
                                        <v-checkbox v-model="form.temaPromover4" label="Medidas de seguridad en la infraestructura" required></v-checkbox>  
                                        <v-checkbox v-model="form.temaPromover5" label="Normas de convivencia en la unidad unidadEducativa" required></v-checkbox>  
                                        <v-checkbox v-model="form.temaPromover6" label="Promoción de la participación de las y los estudiantes" required></v-checkbox>  
                                        <v-checkbox v-model="form.temaPromover7" label="Gestión y articulación con la comunidad educativa" required></v-checkbox>  
                                        <v-checkbox v-model="form.temaPromover8" label="Acción comunal" required></v-checkbox>   
                                        <v-checkbox v-model="form.temaPromover9" label="Acciones para reducción de riesgos en el contexto y en la unidad educativa" required></v-checkbox>
                                    </v-col>
                                </v-row>
                            </v-col>


                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.temaDisciplinario" label="Procedimientos regulatorios" required></v-checkbox> <!-- modificación-->
                                <v-row class="pl-10 secondarybg" v-if="form.temaDisciplinario">
                                    <v-col cols="12" md="6" >
                                        <v-checkbox v-model="form.temaDisciplinarioCorrectivo" label="CORRECTIVOS PEDAGÓGICOS" required></v-checkbox>
                                        <v-checkbox v-model="form.temaDisciplinarioProcedimientoMarco" label="PROCEDIMIENTO MARCO PARA LA ADOPCIÓN DE DECISIONES DISCIPLINARIAS" required></v-checkbox>  
                                        <v-checkbox v-model="form.temaDisciplinarioProcedimientoAlternativo" label="PROCEDIMIENTOS ALTERNATIVOS PARA LA SOLUCIÓN DE CONFLICTOS" required></v-checkbox>  
                                        <v-checkbox v-model="form.temaDisciplinarioLineamiento" label="LINEAMIENTOS PARA LA REMISIÓN DE INFORMES SOBRE CASOS DE VIOLENCIA" required></v-checkbox>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <!-- <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.temaSancion" label="Sanciones" required></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.temaAdopcion" label="Procedimiento marco para la adopción de decisiones disciplinarias" required></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.temaAlternativo" label="Procedimientos alternativos pra la solución de conflictos" required></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.temaRemision" label="Lineamientos para la remisión de informes sobre casos de violencia" required></v-checkbox>
                            </v-col> -->

<!--                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.temaTaller" label="Programación de talleres de capacitación" required></v-checkbox>
                            </v-col>
 //mod modificacion                      -->

<!--Modificación implementación-->
<!--                           <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.temaSeguimiento" label="Plan de seguimiento y evaluación" required></v-checkbox>
                            </v-col>
modificacion                     -->
                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Miembros de la comisión que aprueba el PCPA</span> <!-- Modificación -->
                                </div>
                            </v-col>

                            <!-- <v-col cols="12" md="6" >
                                <v-text-field v-model="form.comisionAprobacionCargo" label="Cargo" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.comisionAprobacionNombre" label="Nombre" hide-details required></v-text-field>
                            </v-col> -->

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionAprobacionEstudiante" label="Estudiantes" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionAprobacionEstudianteNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionAprobacionEstudiante" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionAprobacionDirector" label="Director(a)" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionAprobacionDirectorNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionAprobacionDirector" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionAprobacionMaestro" label="Maestro(a)" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionAprobacionMaestroNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionAprobacionMaestro" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionAprobacionPadre" label="Padres/Madres" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionAprobacionPadreNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionAprobacionPadre" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionAprobacionOtro" label="Otros" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionAprobacionOtroNombre" :counter="10" label="Nombre" hide-details :disabled="!form.comisionAprobacionOtro" ></v-text-field>
                            </v-col>


                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.fechaAprobacion" label="Fecha de aprobación"  @input="onDateInputAprobacion" placeholder="DD/MM/AAAA" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.vigenciaAprobacion" label="Tiempo de vigencia (1 a 3 años)" type="number"  hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Adjuntar archivos</span>
                                </div>
                            </v-col>

                            <!--adjuntar archivos-->
                            <v-container>
                                <v-form @submit.prevent="uploadFile">
                                    <v-file-input
                                        label="Adjuntar su Plan de convivencia pacifica en pofmato pdf"
                                        v-model="selectedFile"
                                        accept="*/*"
                                        prepend-icon="mdi-paperclip"
                                        outlined
                                        dense
                                    ></v-file-input>

                                    <v-btn
                                        :disabled="!selectedFile"
                                        color="primary"
                                        class="mt-4"
                                        type="submit"
                                    >
                                        Subir archivo
                                    </v-btn>

                                    <v-alert
                                        v-if="uploadMessage"
                                        type="success"
                                        class="mt-3"
                                    >
                                        {{ uploadMessage }}
                                    </v-alert>
                                </v-form>
                            </v-container>

                            <v-container>
                                <v-form @submit.prevent="uploadFile">
                                    <v-file-input
                                        label="Adjuntar su diagnóstico de convivencia pacifica en pofmato pdf"
                                        v-model="selectedFile"
                                        accept="*/*"
                                        prepend-icon="mdi-paperclip"
                                        outlined
                                        dense
                                    ></v-file-input>

                                    <v-btn
                                        :disabled="!selectedFile"
                                        color="primary"
                                        class="mt-4"
                                        type="submit"
                                    >
                                        Subir archivo
                                    </v-btn>

                                    <v-alert
                                        v-if="uploadMessage"
                                        type="success"
                                        class="mt-3"
                                    >
                                        {{ uploadMessage }}
                                    </v-alert>
                                </v-form>
                            </v-container>

                            <!--fin-->
                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Declaración jurada</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="12" >
                                <v-checkbox v-model="form.validado" label="Declaro que todos los datos que he registrado son verídicos y que pueden ser validados por las autoridades del Ministerio de Educación" required></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="12" v-if="form.validado" >                                
                                <v-dialog v-model="dialog" persistent width="auto" >
                                    <template v-slot:activator="{ props }">                                    
                                        <v-btn size="large" rounded="pill" color="primary" class="rounded-pill" block type="button" flat v-bind="props">Registrar</v-btn>
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
