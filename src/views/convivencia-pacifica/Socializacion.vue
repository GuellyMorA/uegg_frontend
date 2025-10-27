<script setup lang="ts">
import { ref, onMounted } from 'vue';
//import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import Auth from '@/services/Auth'; 

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

const institucionEducativa = ref();
const miembrosComision = ref();
const comisionSocializacion = ref();
const comisionImplementacion = ref();
const actividadesEjecucion = ref();

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
const form: any = ref({
    sie: null,
    unidadEducativa: '',
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

    comisionImplementacionEstudiante: false,
    comisionImplementacionDirector: false,
    comisionImplementacionMaestro: false,
    comisionImplementacionPadre: false,
    comisionImplementacionOtro: false,
    comisionImplementacionEstudianteNombre: '',
    comisionImplementacionDirectorNombre: '',
    comisionImplementacionMaestroNombre: '',
    comisionImplementacionPadreNombre: '',
    comisionImplementacionOtroNombre: '',
    comisionImplementacionIdConstruccion: '',
    comisionImplementacionIdMiembro: '',

    actividad1: null,
    actividad2: null,
    actividad3: null,
    actividad4: null,
    actividad5: null,
    actividad1Fecha: '',
    actividad2Fecha: '',
    actividad3Fecha: '',
    actividad4Fecha: '',
    actividad5Fecha: '',    
    validado: false
});

// --- Variables de Estado Nuevas ---
const readOnlyVar = ref( localStorage.getItem('existeEnBD')==='true' ? true : false  );
console.log('existeEnBD-readOnlyVar : ', localStorage.getItem('existeEnBD'));   
const registroExiste = ref(readOnlyVar);
const isLoading = ref(true);
const dataUE = JSON.parse(localStorage.getItem('dataUE'));
const idUE = dataUE[0].id; //   ref({ci:userData.codigo_sie , codigo_sie:userData.codigo_sie } );// Usar el SIE del usuario logueado


// Controla si los campos del formulario están deshabilitados o no
const isFormDisabled = ref(true); 
const isFormDisabledFromNew = ref(true); 

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

// registrar el formulario para editar o crear un nuevo registro
const registro = () => {
    console.log('modificar registro .');
    isFormDisabled.value = true;

    if (registroExiste.value ){
       update();
    }
    else{
     save();
    }

};

onMounted(async() => {

    let user = JSON.parse(localStorage.getItem('user') || '');
    if(user && user.codigo_sie){
        form.value.sie = user.codigo_sie;
        //const resInst = await findInstitucionEducativa();
           findUnidadesEducativasPorDirector();
        const resMiem = await findMiembroComision();
        const resAct = await findActividadesEjecutadas();
        username = localStorage.getItem('username') ;
        isLoading.value = false;
    }


}); 

/*
const findInstitucionEducativa = async () => {
    console.log(form.value.sie);
    if(String(form.value.sie).length === 8){
        const res = await ConvivenciaPacifica.findInstitucionEducativa(form.value.sie);
        console.log("res", res);
        if(res.data && res.data.length > 0){
            form.value.unidadEducativa = res.data[0].institucioneducativa;
            find.value = true;
            institucionEducativa.value = res.data[0];
        }
    } else {
        institucionEducativa.value = null;
        find.value = false;
        form.value.unidadEducativa = '';
    }
}; */
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
const findMiembroComision = async () => {
    console.log(form.value.sie);
    if(String(form.value.sie).length === 8){
        const res = await ConvivenciaPacifica.findMiembrosComisionConstruccion(form.value.sie);//listMiembroComision
        console.log("res", res);

        if(res.data && res.data.length > 0){
            const idComisionSocializacionEstudiante = (obj: any) => obj.id_comision_tipo === 3 && obj.id_miembro_tipo === 1;
            const idComisionSocializacionDirector = (obj: any) => obj.id_comision_tipo === 3 && obj.id_miembro_tipo === 2;
            const idComisionSocializacionMaestro = (obj: any) => obj.id_comision_tipo === 3 && obj.id_miembro_tipo === 3;
            const idComisionSocializacionPadre = (obj: any) => obj.id_comision_tipo === 3 && obj.id_miembro_tipo === 4;
            const idComisionSocializacionOtro = (obj: any) => obj.id_comision_tipo === 3 && obj.id_miembro_tipo === 5;

            form.value.comisionSocializacionEstudiante = res.data.some(idComisionSocializacionEstudiante);
            form.value.comisionSocializacionDirector = res.data.some(idComisionSocializacionDirector);
            form.value.comisionSocializacionMaestro = res.data.some(idComisionSocializacionMaestro);
            form.value.comisionSocializacionPadre = res.data.some(idComisionSocializacionPadre);
            form.value.comisionSocializacionOtro = res.data.some(idComisionSocializacionOtro);

            form.value.comisionSocializacionEstudianteNombre = res.data.find(idComisionSocializacionEstudiante)?.nombres_miembro;
            form.value.comisionSocializacionDirectorNombre = res.data.find(idComisionSocializacionDirector)?.nombres_miembro;
            form.value.comisionSocializacionMaestroNombre = res.data.find(idComisionSocializacionMaestro)?.nombres_miembro;
            form.value.comisionSocializacionPadreNombre = res.data.find(idComisionSocializacionPadre)?.nombres_miembro;
            form.value.comisionSocializacionOtroNombre = res.data.find(idComisionSocializacionOtro)?.nombres_miembro;

            //form.value.comisionSocializacionIdMiembro=res.data.find(idComisionSocializacionOtro)?.id_miembro  ; 
            form.value.comisionSocializacionEstudianteId = res.data.find(idComisionSocializacionEstudiante)?.id_miembro;
            form.value.comisionSocializacionDirectorId = res.data.find(idComisionSocializacionDirector)?.id_miembro;
            form.value.comisionSocializacionMaestroId = res.data.find(idComisionSocializacionMaestro)?.id_miembro;
            form.value.comisionSocializacionPadreId = res.data.find(idComisionSocializacionPadre)?.id_miembro;
            form.value.comisionSocializacionOtroId = res.data.find(idComisionSocializacionOtro)?.id_miembro;

            const idComisionImplementacionEstudiante = (obj: any) => obj.id_comision_tipo === 4 && obj.id_miembro_tipo === 1;
            const idComisionImplementacionDirector = (obj: any) => obj.id_comision_tipo === 4 && obj.id_miembro_tipo === 2;
            const idComisionImplementacionMaestro = (obj: any) => obj.id_comision_tipo === 4 && obj.id_miembro_tipo === 3;
            const idComisionImplementacionPadre = (obj: any) => obj.id_comision_tipo === 4 && obj.id_miembro_tipo === 4;
            const idComisionImplementacionOtro = (obj: any) => obj.id_comision_tipo === 4 && obj.id_miembro_tipo === 5;

            form.value.comisionImplementacionEstudiante = res.data.some(idComisionImplementacionEstudiante);
            form.value.comisionImplementacionDirector = res.data.some(idComisionImplementacionDirector);
            form.value.comisionImplementacionMaestro = res.data.some(idComisionImplementacionMaestro);
            form.value.comisionImplementacionPadre = res.data.some(idComisionImplementacionPadre);
            form.value.comisionImplementacionOtro = res.data.some(idComisionImplementacionOtro);

            form.value.comisionImplementacionEstudianteNombre = res.data.find(idComisionImplementacionEstudiante)?.nombres_miembro;
            form.value.comisionImplementacionDirectorNombre = res.data.find(idComisionImplementacionDirector)?.nombres_miembro;
            form.value.comisionImplementacionMaestroNombre = res.data.find(idComisionImplementacionMaestro)?.nombres_miembro;
            form.value.comisionImplementacionPadreNombre = res.data.find(idComisionImplementacionPadre)?.nombres_miembro;
            form.value.comisionImplementacionOtroNombre = res.data.find(idComisionImplementacionOtro)?.nombres_miembro;

            form.value.comisionImplementacionEstudianteId = res.data.find(idComisionImplementacionEstudiante)?.id_miembro;
            form.value.comisionImplementacionDirectorId = res.data.find(idComisionImplementacionDirector)?.id_miembro;
            form.value.comisionImplementacionMaestroId = res.data.find(idComisionImplementacionMaestro)?.id_miembro;
            form.value.comisionImplementacionPadreId = res.data.find(idComisionImplementacionPadre)?.id_miembro;
            form.value.comisionImplementacionOtroId = res.data.find(idComisionImplementacionOtro)?.id_miembro;

            miembrosComision.value = res.data;
            console.log(res.data);
            console.log(res.data.some(idComisionSocializacionEstudiante))
            console.log(res.data.find(idComisionSocializacionEstudiante)?.nombres_miembro)
        }
    } else {
        miembrosComision.value = null;
    }
}; 

  
const findActividadesEjecutadas = async () => {
    console.log('form.value.sie :', form.value.sie);

    const res = await ConvivenciaPacifica.findActividadesEjecutadas(form.value.sie);
    console.log("res", res);
    let dateParts ;
  
       
    res.data.map((data: {   id_pcpa_actividades_tipo: number;    }, index:  number) => {
              console.log("id_actividades_ejecutadas: ", res.data[index].id_actividades_ejecutadas  )     
      
         dateParts = (res.data[index].fec_actividad || '').split("-");
        if(res.data && res.data.length > 0 && data.id_pcpa_actividades_tipo===11  ){// 
            form.value.actividad1Id= res.data[index].id_actividades_ejecutadas ;     
           form.value.actividad1= res.data[index].desc_actividades_ejecutadas ;   
            form.value.actividad1Fecha= dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0]; //  res.data[index].fec_actividad ;  
           }
        if(res.data && res.data.length > 0 && data.id_pcpa_actividades_tipo===12  ){// 
        form.value.actividad2Id= res.data[index].id_actividades_ejecutadas ;     
        form.value.actividad2= res.data[index].desc_actividades_ejecutadas ;   
        form.value.actividad2Fecha= dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0]; // res.data[index].fec_actividad ;  
        }
        if(res.data && res.data.length > 0 && data.id_pcpa_actividades_tipo===13  ){// 
        form.value.actividad3Id= res.data[index].id_actividades_ejecutadas ;     
        form.value.actividad3= res.data[index].desc_actividades_ejecutadas ;   
        form.value.actividad3Fecha=dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0]; //  res.data[index].fec_actividad ;  
        }
        if(res.data && res.data.length > 0 && data.id_pcpa_actividades_tipo===14  ){// 
        form.value.actividad4Id= res.data[index].id_actividades_ejecutadas ;     
        form.value.actividad4= res.data[index].desc_actividades_ejecutadas ;   
        form.value.actividad4Fecha= dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0]; // res.data[index].fec_actividad ;  
        }
        if(res.data && res.data.length > 0 && data.id_pcpa_actividades_tipo===15  ){// 
        form.value.actividad5Id= res.data[index].id_actividades_ejecutadas ;     
        form.value.actividad5= res.data[index].desc_actividades_ejecutadas ;   
        form.value.actividad5Fecha=dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0]; //  res.data[index].fec_actividad ;  
        }
                                                                                                      
      
       console.log(res.data[index]);

    
    });

    //actividadesEjecucion.value = res.data[0];           
        

}; 



const onDateInput1 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.actividad1Fecha = onDateInput(cleanedInput);
};

const onDateInput2 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.actividad2Fecha = onDateInput(cleanedInput);
};


const onDateInput3 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.actividad3Fecha = onDateInput(cleanedInput);
};


const onDateInput4 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.actividad4Fecha = onDateInput(cleanedInput);
};


const onDateInput5 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.actividad5Fecha = onDateInput(cleanedInput);
};


const onDateInput = (cleanedInput: any) => {
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

    comisionSocializacion.value = {
        1: {status: form.value.comisionSocializacionEstudiante, value: form.value.comisionSocializacionEstudianteNombre, id: form.value.comisionSocializacionEstudianteId },
        2: {status: form.value.comisionSocializacionDirector, value: form.value.comisionSocializacionDirectorNombre, id: form.value.comisionSocializacionDirectorId},
        3: {status: form.value.comisionSocializacionMaestro, value: form.value.comisionSocializacionMaestroNombre, id: form.value.comisionSocializacionMaestroId},
        4: {status: form.value.comisionSocializacionPadre, value: form.value.comisionSocializacionPadreNombre, id: form.value.comisionSocializacionPadreId},
        5: {status: form.value.comisionSocializacionOtro, value: form.value.comisionSocializacionOtroNombre, id: form.value.comisionSocializacionOtroId}
    };

    comisionImplementacion.value = {
        1: {status: form.value.comisionImplementacionEstudiante, value: form.value.comisionImplementacionEstudianteNombre, id: form.value.comisionImplementacionEstudianteId},
        2: {status: form.value.comisionImplementacionDirector, value: form.value.comisionImplementacionDirectorNombre, id: form.value.comisionImplementacionDirectorId},
        3: {status: form.value.comisionImplementacionMaestro, value: form.value.comisionImplementacionMaestroNombre, id: form.value.comisionImplementacionMaestroId},
        4: {status: form.value.comisionImplementacionPadre, value: form.value.comisionImplementacionPadreNombre, id: form.value.comisionImplementacionPadreId},
        5: {status: form.value.comisionImplementacionOtro, value: form.value.comisionImplementacionOtroNombre, id: form.value.comisionImplementacionOtroId}
    };



    actividadesEjecucion.value = {
        1: {fecha: form.value.actividad1Fecha, value: form.value.actividad1, id: form.value.actividad1Id },
        2: {fecha: form.value.actividad2Fecha, value: form.value.actividad2, id: form.value.actividad2Id},
        3: {fecha: form.value.actividad3Fecha, value: form.value.actividad3, id: form.value.actividad3Id},
        4: {fecha: form.value.actividad4Fecha, value: form.value.actividad4, id: form.value.actividad4Id},
        5: {fecha: form.value.actividad5Fecha, value: form.value.actividad5, id: form.value.actividad5Id}
		
    };


    let payload3 ;
    let save3;
  
    await Object.keys(comisionSocializacion.value).map((item, key) => {
        if(comisionSocializacion.value[item].status && comisionSocializacion.value[item].value ){ //  ||  comisionConstruccion.value[item].length >0
            console.log(item, key);

            payload3 = {
                id_pcpa_construccion: miembrosComision.value[0].id,
                id_pcpa_comision_tipo: 3,
                id_pcpa_miembro_tipo: item,     
                orden: key + 1,
                nombres_miembro: comisionSocializacion.value[item].value,
                apellidos_miembro: '', 
                check_miembro_comision: comisionSocializacion.value[item].status,                    
                estado: 'ACTIVO' ,
                usu_cre: username,
                fec_cre: new Date()
            }

           // ueggPcpaMiembroComision
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

          

        }    
        if(!(comisionSocializacion.value[item].id  === undefined ) ){  // comisionSocializacion.value[item].status===false ||  && 
            const delete2 =  ConvivenciaPacifica.deleteMiembroComision(comisionSocializacion.value[item].id).then((res) => {
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

    let payload6;
    let save6;
    await Object.keys(comisionImplementacion.value).map((item, key) => {
        if( comisionImplementacion.value[item].status && comisionImplementacion.value[item].value){ 
            console.log('comisionImplementacion item, key: ', item, key);
            payload6 = {
                id_pcpa_construccion: miembrosComision.value[0].id,
                id_pcpa_comision_tipo: 4,  // implmentacion
                id_pcpa_miembro_tipo: item,
                orden: key + 1,
                nombres_miembro: comisionImplementacion.value[item].value,
                apellidos_miembro: '',  
                check_miembro_comision: comisionImplementacion.value[item].status,                    
                estado: 'ACTIVO' ,
                usu_cre: username,
                fec_cre: new Date()
            }
                  //  ueggPcpaMiembroComision comisionImplementacion
            save6 = ConvivenciaPacifica.createMiembroComision(payload6).then((res) => {
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


        }        

        if(!(comisionImplementacion.value[item].id  === undefined ) ){  // comisionImplementacion.value[item].status===false ||  && 
              const delete3 =  ConvivenciaPacifica.deleteMiembroComision(comisionImplementacion.value[item].id ? comisionImplementacion.value[item].id : 0).then((res) => {
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
    
    console.log("save6", save6);               
      
     const constId = await findConstByCiAndUe();
    if( typeof(form.value.actividad1) === 'object' ? form.value.actividad1 && form.value.actividad1.name.length : !(form.value.actividad1=== 'undefined')  ){
        var dateParts = (form.value.actividad1Fecha).split("/");
           
        const payload = {
            id_pcpa_actividades_tipo:  11,// form.value.actividad1Id,
            id_pcpa_construccion: constId, // miembrosComision.value[0].id,
            //cod_actividad: form.value.actividad1.id,  
            desc_actividad: typeof(form.value.actividad1) === 'object' ? form.value.actividad1.name : form.value.actividad1, 
            fec_actividad:  new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]).toISOString(),      
            estado: 'ACTIVO',
           usu_cre: username,
            fec_cre: new Date()
        }
        console.log('payload', payload);

        const save = await ConvivenciaPacifica.createSocializacion(payload).then((res) => {
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
        console.log("save1", save);
    }

     if( typeof(form.value.actividad2) === 'object' ? form.value.actividad2 && form.value.actividad2.name.length : !(form.value.actividad2=== 'undefined') ){
        var dateParts = (form.value.actividad2Fecha).split("/");
           
        const payload = {
            id_pcpa_actividades_tipo: 12,//  form.value.actividad2Id,
            id_pcpa_construccion: miembrosComision.value[0].id,
           // cod_actividad: form.value.actividad2Id,  
            desc_actividad: typeof(form.value.actividad2) === 'object' ? form.value.actividad2.name : form.value.actividad2, 
            fec_actividad:  new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]).toISOString(),             
            estado: 'ACTIVO',
           usu_cre: username,
            fec_cre: new Date()
        }
        console.log('payload', payload);

        const save = await ConvivenciaPacifica.createSocializacion(payload).then((res) => {
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
        console.log("save2", save);
    }

    if(    typeof(form.value.actividad3) === 'object' ? form.value.actividad3 && form.value.actividad3.name.length : !(form.value.actividad3=== 'undefined')   ){
        var dateParts = (form.value.actividad3Fecha).split("/");
           
        const payload = {
            id_pcpa_actividades_tipo: 13,//  form.value.actividad3Id,
            id_pcpa_construccion: miembrosComision.value[0].id,
           // cod_actividad: form.value.actividad3.id,  
            desc_actividad: typeof(form.value.actividad3) === 'object' ? form.value.actividad3.name : form.value.actividad3, 
            fec_actividad:  new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]).toISOString(),         
            estado: 'ACTIVO',
           usu_cre: username,
            fec_cre: new Date()
        }
        console.log('payload3', payload);

        const save = await ConvivenciaPacifica.createSocializacion(payload).then((res) => {
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
        console.log("save3", save);
    }

    if(form.value.actividad4 && form.value.actividad4.name.length > 0   ){
        var dateParts = (form.value.actividad4Fecha).split("/");
           
        const payload = {
            id_pcpa_actividades_tipo: 14,//  form.value.actividad4Id,
            id_pcpa_construccion: miembrosComision.value[0].id,
           // cod_actividad: form.value.actividad4.id,  
            desc_actividad:typeof(form.value.actividad4) === 'object' ? form.value.actividad4.name : form.value.actividad4, 
            fec_actividad:  new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]).toISOString(),      
            estado: 'ACTIVO',
           usu_cre: username,
            fec_cre: new Date()
        }
        console.log('payload4', payload);

        const save = await ConvivenciaPacifica.createSocializacion(payload).then((res) => {
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
        console.log("save4", save);
    }

    if(form.value.actividad5 && form.value.actividad5.name.length > 0   ){
        var dateParts = (form.value.actividad5Fecha).split("/");
           
        const payload = {
            id_pcpa_actividades_tipo: 15,// form.value.actividad5Id,
            id_pcpa_construccion: miembrosComision.value[0].id,
           // cod_actividad: form.value.actividad5.id,  
            desc_actividad: typeof(form.value.actividad5) === 'object' ? form.value.actividad5.name : form.value.actividad5, 
            fec_actividad:  new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]).toISOString(),          
            estado: 'ACTIVO',
           usu_cre: username,
            fec_cre: new Date()
        }
        console.log('payload5', payload);

        const save = await ConvivenciaPacifica.createSocializacion(payload).then((res) => {
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
        console.log("save5", save);
    }
    
  //  delete 
    await Object.keys(actividadesEjecucion.value).map((item, key) => {
        if( actividadesEjecucion.value[item].value){ 
            console.log('actividadesEjecucion item, key: ', item, key);
            if(!(actividadesEjecucion.value[item].id  === undefined ) ){ 
              const delete3 =  ConvivenciaPacifica.deleteActividadesEjecutadas(actividadesEjecucion.value[item].id ).then((res) => {
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




    dialog.value = false;  
    dialogSave.value = true;   
};

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
    dialogSave.value = false;
};

const actividadTipo = [
    { id: 1, name: '' },  
    { id: 2, name: 'MEDIOS DE COMUNICACIÓN INTERNA' },  
    { id: 3, name: 'REDES SOCIALES' },  
    { id: 4, name: 'TALLERES' },  
    { id: 5, name: 'FERIAS' },  
    { id: 6, name: 'OTROS' }
]
    
  
const validateForm = () => {
    validationErrors.value = {};

    if (!form.value.actividad1 && !form.value.actividad2 && !form.value.actividad3 && !form.value.actividad4 && !form.value.actividad5) validationErrors.value['actividad'] = true;
    else delete validationErrors.value['actividad'];

    if (form.value.actividad1 && !form.value.actividad1Fecha) validationErrors.value['actividad1'] = true;
    else delete validationErrors.value['actividad1'];

    if (form.value.actividad2 && !form.value.actividad2Fecha) validationErrors.value['actividad2'] = true;
    else delete validationErrors.value['actividad2'];

    if (form.value.actividad3 && !form.value.actividad3Fecha) validationErrors.value['actividad3'] = true;
    else delete validationErrors.value['actividad3'];

    if (form.value.actividad4 && !form.value.actividad4Fecha) validationErrors.value['actividad4'] = true;
    else delete validationErrors.value['actividad4'];

    if (form.value.actividad5 && !form.value.actividad5Fecha) validationErrors.value['actividad5'] = true;
    else delete validationErrors.value['actividad5'];
   
    return !Object.keys(validationErrors.value).length;
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
                                <v-text-field v-model="form.comisionSocializacionEstudianteNombre" :counter="10" label="Nombre" hide-details :disabled="isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionDirector" label="Director(a)" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionDirectorNombre" :counter="10" label="Nombre" hide-details :disabled="isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionMaestro" label="Maestro(a)" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionMaestroNombre" :counter="10" label="Nombre" hide-details :disabled="isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionPadre" label="Padres/Madres" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionPadreNombre" :counter="10" label="Nombre" hide-details :disabled="isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionSocializacionOtro" label="Otros" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionSocializacionOtroNombre" :counter="10" label="Nombre" hide-details :disabled="isFormDisabledFromNew" ></v-text-field>
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
                                <v-text-field v-model="form.comisionImplementacionEstudianteNombre" :counter="10" label="Nombre" hide-details :disabled="isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionImplementacionDirector" label="Director(a)" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionImplementacionDirectorNombre" :counter="10" label="Nombre" hide-details :disabled="isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionImplementacionMaestro" label="Maestro(a)" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionImplementacionMaestroNombre" :counter="10" label="Nombre" hide-details :disabled="isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionImplementacionPadre" label="Padres/Madres" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionImplementacionPadreNombre" :counter="10" label="Nombre" hide-details :disabled="isFormDisabledFromNew" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-checkbox v-model="form.comisionImplementacionOtro" label="Otros" :disabled="isFormDisabledFromNew" ></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.comisionImplementacionOtroNombre" :counter="10" label="Nombre" hide-details :disabled="isFormDisabledFromNew" ></v-text-field>
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



