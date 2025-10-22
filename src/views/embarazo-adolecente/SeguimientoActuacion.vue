<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import EstudianteEmbarazo from '@/services/EstudianteEmbarazo';
// import { useNavbarStore } from '@/stores/navbar';
// const store = useNavbarStore();  
// store.setPath('/convivencia/pacifica');
const router = useRouter();

const valid = ref(false);
const dialog = ref(false);
const dialogSave = ref(false);
const validationErrors = ref();
const find = ref(false);
const findEstudiante = ref(false);
const variusSie = ref(false);
const construccion = ref();
const institucionEducativa = ref();
const estudiante = ref();
let username: string | null ;
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

onMounted(async() => {
    username = localStorage.getItem('username') ;
         isLoading.value = false;
    let user = JSON.parse(localStorage.getItem('user') || '');
    if(user && user.codigo_sie){
        form.value.sie = user.codigo_sie;
        findInstitucionEducativa();

        const res1 = await ConvivenciaPacifica.getContruccionUnidadEducativa(user.codigo_sie).then((data) => {
            console.log("data1", data.data, data.status);
            if(data.status === 200){
                construccion.value = data.data;  
            } else {
                toast.error('Construcción PCPA no encontrados', {
                    autoClose: 3000,
                    position: toast.POSITION.TOP_RIGHT,
                });
            }
        });
    }
}); 

const findInstitucionEducativa = async () => {
    console.log(form.value.sie);
    if(String(form.value.sie).length === 8){
        const res = await ConvivenciaPacifica.findInstitucionEducativa(form.value.sie);
        console.log("res", res);
        if(res.data && res.data.length > 0){
            form.value.unidadEducativa = res.data[0].institucioneducativa;
            find.value = true;
            institucionEducativa.value = res.data[0];
            console.log(res.data[0], form.value.sie.length, res);
        }
    } else {
        institucionEducativa.value = null;
        find.value = false;
        form.value.unidadEducativa = '';
    }
}; 

const findEstudianteEmbarazada = async () => {
    console.log(form.value.codigoRude);
    if(String(form.value.codigoRude).length > 10){
        const res = await EstudianteEmbarazo.findEstudianteEmbarazo(form.value.codigoRude);
        console.log("res", res);
        if(res.data){
            form.value.estudiante = res.data.nombres_estudiante+' '+res.data.apellido_pat_estudiante+' '+res.data.apellido_mat_estudiante;
            findEstudiante.value = true;
            estudiante.value = res.data;
            console.log(res.data[0], form.value.sie, res);
        }
    } else {
        estudiante.value = null;
        findEstudiante.value = false;
        form.value.estudiante = '';
    }
}; 

const form: any = ref({    
    sie: null,
    unidadEducativa: '',
    codigoRude: '',
    estudiante: '',
    semanaGestacion: null,
    numeroEmbarazo: null,
    fechaEstimadaParto: null,
    recibeControlPrenatal: false,
    requiereBajaMedica: false,
    requierePermisoControl: false,
    requiereCuidadoPostparto: false,
    consideracionActividades: false,
    fechaBajaPrenatal: null,
    fechaConclusionPostnatal: null,
    fechaRetorno: null,
    edadProgenitor: null,
    progenitorMismaUnidadEducativa: false,
    nacidoVivo: false,
    progenitorConoceEmbarazo: false,
    bajaMedica: false,
    permisoControlPrenatal: false,
    fechaInicioBajaPrenatal: null,
    fechaFinBajaPostnatal: null,
    director: '',
    accionesSeguimiento: false
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

const onDateInput1 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaEstimadaParto = onDateInput(cleanedInput);
};

const onDateInput2 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaBajaPrenatal = onDateInput(cleanedInput);
};

const onDateInput3 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaConclusionPostnatal = onDateInput(cleanedInput);
};

const onDateInput4 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaRetorno = onDateInput(cleanedInput);
};

const onDateInput5 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaInicioBajaPrenatal = onDateInput(cleanedInput);
};

const onDateInput6 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaFinBajaPostnatal = onDateInput(cleanedInput);
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

    var dateParts = estudiante.value.fec_nacimiento ? (estudiante.value.fec_nacimiento).split("/") : new Date();
    var dateParts1 = estudiante.value.fechaEstimadaParto ? (estudiante.value.fechaEstimadaParto).split("/") : new Date();
    var dateParts2 = estudiante.value.fechaRetorno ? (estudiante.value.fechaRetorno).split("/") : new Date();
    var dateParts3 = estudiante.value.fechaInicioBajaPrenatal ? (estudiante.value.fechaInicioBajaPrenatal).split("/") : new Date();
    var dateParts4 = estudiante.value.fechaFinBajaPostnatal ? (estudiante.value.fechaFinBajaPostnatal).split("/") : new Date();
    var dateParts5 = estudiante.value.fechaConclusionPostnatal ? (estudiante.value.fechaConclusionPostnatal).split("/") : new Date();
    const payload = {
        id_pcpa_unidad_educativa: construccion.value.id,
        id_emb_informe_embarazo: estudiante.value.id,    
        cod_rude: form.value.codigoRude,
        nombres_apellidos: estudiante.value.nombres_estudiante+' '+estudiante.value.apellido_pat_estudiante+' '+estudiante.value.apellido_mat_estudiante,
        complemento: estudiante.value.complemento,
        fec_nacimiento:  estudiante.value.fec_nacimiento ? new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]) : null,
        tiempo_gestacion: form.value.semanaGestacion,
        numero_embarazos: form.value.numeroEmbarazo,
        fec_estimada_parto: form.value.fechaEstimadaParto ? new Date(dateParts1[2] +'-'+ dateParts1[1] +'-'+ dateParts1[0]) : null,
        check_recibe_control_prenatal: form.value.recibeControlPrenatal, 
        check_requiere_baja_medica: form.value.requiereBajaMedica,
        check_requiere_permiso_para_control: form.value.requierePermisoControl,
        check_requiere_cuidado_especial: form.value.requiereCuidadoPostparto,
        fec_retorno_a_ue: form.value.fechaRetorno ? new Date(dateParts5[2] +'-'+ dateParts5[1] +'-'+ dateParts5[0]) : null,
        fec_conc_post_nat: form.value.fechaRetorno ? new Date(dateParts2[2] +'-'+ dateParts2[1] +'-'+ dateParts2[0]) : null,
        check_cuenta_con_medidas_ue: form.value.consideracionActividades,
        check_tutores_al_tanto_emb: form.value.progenitorConoceEmbarazo,
        check_recibe_baja_medica: form.value.bajaMedica,
        check_recibe_permiso_controles_prenatales: form.value.recibeControlPrenatal,
        fec_ini_baja_prenatal: form.value.fechaInicioBajaPrenatal ? new Date(dateParts3[2] +'-'+ dateParts3[1] +'-'+ dateParts3[0]) : null,
        fec_fin_baja_postnatal: form.value.fechaFinBajaPostnatal ? new Date(dateParts4[2] +'-'+ dateParts4[1] +'-'+ dateParts4[0]) : null,

        persona_asignada_seguimiento: form.value.director,
        check_cuenta_con_seguimiento: form.value.accionesSeguimiento,

        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()
    }
    
    const save = await EstudianteEmbarazo.createSeguimientoActuacion(payload).then((res) => {
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

    dialog.value = false;  
    dialogSave.value = true;   
};

const reset = () => {
    form.value.codigoRude = '';
    form.value.estudiante = '';
    form.value.semanaGestacion = null;
    form.value.numeroEmbarazo = null;
    form.value.fechaEstimadaParto = null;
    form.value.recibeControlPrenatal = false;
    form.value.requiereBajaMedica = false;
    form.value.requierePermisoControl = false;
    form.value.requiereCuidadoPostparto = false;
    form.value.consideracionActividades = false;
    form.value.fechaBajaPrenatal = null;
    form.value.fechaConclusionPostnatal = null;
    form.value.fechaRetorno = null;
    form.value.edadProgenitor = null;
    form.value.progenitorMismaUnidadEducativa = false;
    form.value.nacidoVivo = false;
    form.value.progenitorConoceEmbarazo = false;
    form.value.bajaMedica = false;
    form.value.permisoControlPrenatal = false;
    form.value.fechaInicioBajaPrenatal = null;
    form.value.fechaFinBajaPostnatal = null;
    form.value.director = '';
    form.value.accionesSeguimiento = false;
    dialogSave.value = false;
};

const validateForm = () => {
    validationErrors.value = {};

    if (!form.value.sie || !form.value.unidadEducativa) validationErrors.value['sie'] = true;
    else delete validationErrors.value['sie'];

    if (!form.value.semanaGestacion) validationErrors.value['semanaGestacion'] = true;
    else delete validationErrors.value['semanaGestacion'];

    if (!form.value.numeroEmbarazo) validationErrors.value['numeroEmbarazo'] = true;
    else delete validationErrors.value['numeroEmbarazo'];

    if (!form.value.fechaEstimadaParto) validationErrors.value['fechaEstimadaParto'] = true;
    else delete validationErrors.value['fechaEstimadaParto'];

    if (!form.value.fechaBajaPrenatal) validationErrors.value['fechaBajaPrenatal'] = true;
    else delete validationErrors.value['fechaBajaPrenatal'];

    if (!form.value.fechaConclusionPostnatal) validationErrors.value['fechaConclusionPostnatal'] = true;
    else delete validationErrors.value['fechaConclusionPostnatal'];

    if (!form.value.fechaRetorno) validationErrors.value['fechaRetorno'] = true;
    else delete validationErrors.value['fechaRetorno'];

    if (!form.value.edadProgenitor) validationErrors.value['edadProgenitor'] = true;
    else delete validationErrors.value['edadProgenitor'];

    if (!form.value.fechaInicioBajaPrenatal) validationErrors.value['fechaInicioBajaPrenatal'] = true;
    else delete validationErrors.value['fechaInicioBajaPrenatal'];

    if (!form.value.fechaFinBajaPostnatal) validationErrors.value['fechaFinBajaPostnatal'] = true;
    else delete validationErrors.value['fechaFinBajaPostnatal'];

    if (!form.value.director) validationErrors.value['director'] = true;
    else delete validationErrors.value['director'];
   
    return !Object.keys(validationErrors.value).length;
};

</script>


<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Seguimiento y actuación para cumplimiento de derechos</v-card-title>
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
                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100"></span>
                                </div>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.sie" :rules="sieRules" :counter="8" label="SIE" required hide-details  :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.unidadEducativa" :counter="10" label="Unidad Educativa" hide-details required :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.codigoRude" label="Código Rude" required hide-details v-on:keyup="findEstudianteEmbarazada" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.estudiante" label="Nombres y Apellidos" hide-details required :readonly="findEstudiante" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100"></span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.semanaGestacion" type="number" label="Tiempo de gestación al momento de registrar el caso (semanas)" hide-details :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.numeroEmbarazo" type="number" label="Número de embarazos (cuántas veces estuvo embarazada incluyendo este embarazo)" hide-details :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.recibeControlPrenatal" label="¿ Recibe control prenatal ?" required :disabled="isFormDisabled"></v-checkbox> </v-col>

                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.requierePermisoControl" label="¿ Requiere permiso para asistir a los controles de salud ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.requiereCuidadoPostparto" label="¿ Requiere cuidado especial en el embarazo o el postparto ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.consideracionActividades" label="¿ La U.E. aplica adecuaciones curriculares ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaEstimadaParto" label="Fecha estimada de parto"  @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                        
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaBajaPrenatal" label="Fecha de baja prenatal"  @input="onDateInput2" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaConclusionPostnatal" label="Fecha de conclusión de baja postnatal"  @input="onDateInput3" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaRetorno" label="Fecha efectiva de retorno a la U.E. de la baja postnatal"  @input="onDateInput4" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.requiereBajaMedica" label="¿ Número de días con baja médica ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.nacidoVivo" label="¿ El embarazo concluyó con nacido vivo/a ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>


                        

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.edadProgenitor" type="number" label="Edad del progenitor (años)" hide-details :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.progenitorMismaUnidadEducativa" label="El progenitor del bebe ¿ Es estudiante de la U.E. ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>



                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.progenitorConoceEmbarazo" label="Los progenitores/tutores ¿ Están al tanto del embarazo ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                   <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.permisoControlPrenatal" label="¿ Número de días con permiso para controles pre y postnatal  ?" required :disabled="isFormDisabled"></v-checkbox> </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Baja prenatal y postnatal</span>
                                </div>
                            </v-col>
                        
                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.fechaInicioBajaPrenatal" label="Inicio de baja prenatal"  @input="onDateInput5" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.fechaFinBajaPostnatal" label="Fin de baja postnatal"  @input="onDateInput6" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Seguimiento y apoyo a niñas y adolescentes embarazadas</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="12" >
                                <v-text-field v-model="form.director" :counter="10" label="Persona asignada al seguimiento (Nombre del Director de U.E.)" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12" >
                                <v-checkbox v-model="form.accionesSeguimiento" label="¿ Cuenta con acciones de seguimiento al desarrollo de adecuaciones curriculares y metodologías ?" required :disabled="isFormDisabled"></v-checkbox>
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
                <v-btn color="green-darken-1" variant="text" @click="router.push('/embarazo/adolecente')"> NO </v-btn>
                <v-btn color="green-darken-1" variant="text" @click="reset"> SI </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
