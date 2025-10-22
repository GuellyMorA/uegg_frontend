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
            console.log(res.data[0], form.value.sie, res);
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
    solucioAcciones: ''
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
    form.value.fechaReporteCasoDna = onDateInput(cleanedInput);
};

const onDateInput2 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaDenuncia = onDateInput(cleanedInput);
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

    var dateParts = (form.value.fechaDenuncia).split("/");
    const payload = {
        id_pcpa_unidad_educativa: construccion.value.id,
        id_emb_informe_embarazo: estudiante.value.id,    
        cod_rude: form.value.codigoRude,
        nombres_apellidos: estudiante.value.nombres_estudiante+' '+estudiante.value.apellido_pat_estudiante+' '+estudiante.value.apellido_mat_estudiante,
        
        check_emb_relacion_concensuada: estudiante.value.embarazoConsensuado,
        check_emb_agresion_sexual:  estudiante.value.embarazoAgresion,
        check_director_victima_violencia: form.value.consultaVictimaViolencia,
        cod_caso_denuncia: form.value.numeroCaso,
        nombre_adolescente: form.value.nombreVictima,
        fec_denuncia: new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]), 
        motivo_queja: form.value.motivoQueja,
        acciones_a_seguir: form.value.solucioAcciones,

        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()
    }
    
    const save = await EstudianteEmbarazo.createSeguimientoSituacion(payload).then((res) => {
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
    form.value.embarazoConsensuado = false;
    form.value.embarazoAgresion = false;
    form.value.reporteCasoDna = false;
    form.value.embarazoViolacion = false;
    form.value.fechaReporteCasoDna = null;
    form.value.consultaVictimaViolencia = false;
    form.value.consultaVictimaViolenciaReporteDna = false;
    form.value.numeroCaso = null;
    form.value.nombreDenunciante = '';
    form.value.nombreVictima = '';
    form.value.fechaDenuncia = null;
    form.value.motivoQueja = '';
    form.value.solucioAcciones = '';
    dialogSave.value = false;
};

const validateForm = () => {
    validationErrors.value = {};

    if (!form.value.sie || !form.value.unidadEducativa) validationErrors.value['sie'] = true;
    else delete validationErrors.value['sie'];

    if (!form.value.codigoRude || !form.value.estudiante) validationErrors.value['codigoRude'] = true;
    else delete validationErrors.value['codigoRude'];

    if (form.value.embarazoAgresion && !form.value.fechaReporteCasoDna) validationErrors.value['fechaReporteCasoDna'] = true;
    else delete validationErrors.value['fechaReporteCasoDna'];

    if (!form.value.numeroCaso) validationErrors.value['numeroCaso'] = true;
    else delete validationErrors.value['numeroCaso'];

    if (!form.value.nombreDenunciante) validationErrors.value['nombreDenunciante'] = true;
    else delete validationErrors.value['nombreDenunciante'];

    if (!form.value.nombreVictima) validationErrors.value['nombreVictima'] = true;
    else delete validationErrors.value['nombreVictima'];

    if (!form.value.fechaDenuncia) validationErrors.value['fechaDenuncia'] = true;
    else delete validationErrors.value['fechaDenuncia'];

    if (!form.value.motivoQueja) validationErrors.value['motivoQueja'] = true;
    else delete validationErrors.value['motivoQueja'];

    if (!form.value.solucioAcciones) validationErrors.value['solucioAcciones'] = true;
    else delete validationErrors.value['solucioAcciones'];
   
    return !Object.keys(validationErrors.value).length;
};


</script>


<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg" :disabled="isFormDisabled">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Seguimiento y actuación para cumplimiento de derechos...</v-card-title>
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
                                <v-text-field v-model="form.sie" :rules="sieRules" :counter="8" label="SIE" required hide-details :readonly="true" :disabled="isFormDisabled" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.unidadEducativa" :counter="10" label="Unidad Educativa" hide-details required :readonly="true" :disabled="isFormDisabled" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.codigoRude" label="Código Rude" required hide-details v-on:keyup="findEstudianteEmbarazada" :disabled="isFormDisabled" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.estudiante" label="Nombres y Apellidos" hide-details required :readonly="findEstudiante" :disabled="isFormDisabled" ></v-text-field>
                            </v-col>

                            <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100"></span>
                            </div>
                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.embarazoAgresion" label="¿ El embarazo es resultado de una agresión sexual ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" v-if="form.embarazoAgresion">
                                <v-checkbox v-model="form.reporteCasoDna" label="¿ El Director(a) reportó el caso de violencia sexual a la Defensoría u otra instancia ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" v-if="form.embarazoAgresion">
                                <v-checkbox v-model="form.embarazoViolacion" label="¿ El Director(a) informó a la adolescente y su familia sobre la sentencia constitucional plurinacional 206/2014 sobre el derecho a la interrupción Legal del embarazo ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="4" v-if="form.embarazoAgresion">
                                <v-text-field v-model="form.fechaReporteCasoDna" label="Referencia de caso de violencia sexual a la DNA (fecha)"  @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.consultaVictimaViolencia" label="¿ El/La Director(a) identifica que la adolescente embarazada sufre violencia ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="6" v-if="form.consultaVictimaViolencia">
                                <v-checkbox v-model="form.consultaVictimaViolenciaReporteDna" label="¿ Se ha reportado el caso de violencia a la DNA u otra instancia ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Denuncias</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.numeroCaso" type="number" :counter="10" label="Número de código del caso" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.nombreDenunciante" :counter="10" label="Nombre de la persona que presenta la denuncia" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.nombreVictima" :counter="10" label="Nombre de la adolescente" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" >
                                <v-text-field v-model="form.fechaDenuncia" label="Fecha de denuncia"  @input="onDateInput2" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="12" >
                                <v-text-field v-model="form.motivoQueja" label="Motivo de la denuncia" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="12" >
                                <v-text-field v-model="form.solucioAcciones" label="Acciones a seguir" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12" >                                
                                <v-dialog v-model="dialog" persistent width="auto" :disabled="isFormDisabled">
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
                                            <v-btn color="green-darken-1" variant="text" @click="dialog = false" :disabled="isFormDisabled"> Cancelar </v-btn>
                                            <v-btn color="green-darken-1" variant="text" @click="save" :disabled="isFormDisabled"> Aceptar </v-btn>
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
                                    
    <v-dialog v-model="dialogSave" persistent width="auto" :disabled="isFormDisabled" >
        <v-card>
            <v-card-title class="text-h5">
            Mensaje
            </v-card-title>
            <v-card-text>¿ Nuevo registro ? (Si ya añadió el registro y quiere modificarlo escoja NO)</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green-darken-1" variant="text" @click="router.push('/convivencia/pacifica')" :disabled="isFormDisabled"> NO </v-btn>
                <v-btn color="green-darken-1" variant="text" @click="reset" :disabled="isFormDisabled"> SI </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
