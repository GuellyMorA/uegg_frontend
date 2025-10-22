<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import { VDataTable } from 'vuetify/labs/VDataTable';
import ViolenciaJerarquica from '@/services/ViolenciaJerarquica';
// import { useNavbarStore } from '@/stores/navbar';
// const store = useNavbarStore();  
// store.setPath('/convivencia/pacifica');
const router = useRouter();

const valid = ref(false);
const dialog = ref(false);
const list = ref();
const dialogSave = ref(false);
const validationErrors = ref();
const caso = ref();
let username: string | null ;
const form: any = ref({
    numeroCaso: '',
    inicialVictima: null,
    inicialAgresor: null,
    codigoRude: null,
    codigoRda: null,
    codigoUsuario: null,    
    autoInicial: null,
    fechaAgresion: null,
    autoFinal: null,
    recursoRevocatoria: null,
    recursoJuridico: null,
    fechaSeguimiento: null
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
onMounted(async() => {
       isLoading.value = false;  
    let user = JSON.parse(localStorage.getItem('user') || '');
    if(user && user.codigo_sie){
    }
    username = localStorage.getItem('username') ;

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

    var dateParts = (form.value.fechaSeguimiento || '').split("/");
    const payload = {
        id_num_caso: caso.value.caso_id,
        id_violencia_seg_sanciones: 0,
        id_auto_inicial: form.value.autoInicial.id,
        id_auto_inicial_tipo: form.value.autoInicial.id,
        id_auto_final_tipo: form.value.autoFinal.id,
        id_rec_rev: form.value.recursoRevocatoria.id,
        id_rec_jur: form.value.recursoJuridico.id,
            
        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()
    }
    console.log(payload);

    const save = await ViolenciaJerarquica.createSeguimientoProcesoAdministrativo(payload).then((res) => {
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
    console.log("save", save);
    
    dialog.value = false;  
    dialogSave.value = true;   
};

const reset = () => {
    form.value = {
        numeroCaso: '',
        inicialVictima: null,
        inicialAgresor: null,
        codigoRude: null,
        codigoRda: null,
        codigoUsuario: null,    
        autoInicial: null,
        fechaAgresion: null,
        autoFinal: null,
        recursoRevocatoria: null,
        recursoJuridico: null,
        fechaSeguimiento: null
    };
    caso.value = null;
    dialogSave.value = false;
};

const onDateInput1 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaAgresion = onDateInput(cleanedInput);
};

const onDateInput2 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaSeguimiento = onDateInput(cleanedInput);
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

const validateForm = () => {
    validationErrors.value = {};

    if (!form.value.numeroCaso) validationErrors.value['numeroCaso'] = true;
    else delete validationErrors.value['numeroCaso'];

    if (!form.value.inicialVictima) validationErrors.value['inicialVictima'] = true;
    else delete validationErrors.value['inicialVictima'];

    if (!form.value.inicialAgresor) validationErrors.value['inicialAgresor'] = true;
    else delete validationErrors.value['inicialAgresor'];

    if (!form.value.autoInicial) validationErrors.value['autoInicial'] = true;
    else delete validationErrors.value['autoInicial'];

    if (!form.value.fechaAgresion) validationErrors.value['fechaAgresion'] = true;
    else delete validationErrors.value['fechaAgresion'];

    if (!form.value.autoFinal) validationErrors.value['autoFinal'] = true;
    else delete validationErrors.value['autoFinal'];

    if (!form.value.recursoRevocatoria) validationErrors.value['recursoRevocatoria'] = true;
    else delete validationErrors.value['recursoRevocatoria'];

    if (!form.value.recursoJuridico) validationErrors.value['recursoJuridico'] = true;
    else delete validationErrors.value['recursoJuridico'];

    if (!form.value.fechaSeguimiento) validationErrors.value['fechaSeguimiento'] = true;
    else delete validationErrors.value['fechaSeguimiento'];

    return !Object.keys(validationErrors.value).length;
};

const searchCaso = async () => {
    if (!form.value.numeroCaso){
        toast.error('Debe ingresar el Código del Caso1', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    const res = await ViolenciaJerarquica.findCasoDetalle(form.value.numeroCaso);
    console.log("res", res);
    if(res.status === 200 && res.data && res.data.length > 0){
        caso.value = res.data[0];
        const nombreVictima: any = res.data[0].nombres_victima +' '+ res.data[0].apellido_pat_victima +' '+ res.data[0].apellido_mat_victima;
        const nombreAgresor: any = res.data[0].nombres_agresor +' '+ res.data[0].apellido_pat_agresor +' '+ res.data[0].apellido_mat_agresor;
        const inicialesVictima = (nombreVictima.replace(/[^a-zA-Z- ]/g, "").match(/\b\w/g)).join('');
        const inicialesAgresor = (nombreAgresor.replace(/[^a-zA-Z- ]/g, "").match(/\b\w/g)).join('');
        // var dateParts = (res.data[0].fec_agresion || '').split("-");
        // form.value.fechaAgresion = dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0];
        form.value.inicialVictima = inicialesVictima.toUpperCase();
        form.value.inicialAgresor = inicialesAgresor.toUpperCase();
    } else {
        form.value.fechaAgresion = null;
    }
};

const autoInicialTipo = [
    { id: 1, name: 'AUTO DE INICIO' },  
    { id: 2, name: 'NOTIFICACIÓN CON EL AUTO DE INICIO' },  
    { id: 3, name: 'CLAUSURA DE ETAPA PROBATORIA' }
];

const autoFinalTipo = [
    { id: 1, name: 'RESOLUCIÓN FINAL' },  
    { id: 2, name: 'NOTIFICACIÓN DE RESOLUCIÓN' },  
    { id: 3, name: 'EJECUTORIA' }
];

const recursoRevocatoriaTipo = [
    { id: 1, name: 'RECURSO DE RECOCATORIA' },  
    { id: 2, name: 'RESOLUCIÓN DE RECURSO DE REVOCATORIA' },  
    { id: 3, name: 'NOTIFICVACIÓN CON LA RESOLUCIÓN DE LA REVOCATORIA' }
];

const recursoJuridicoTipo = [
    { id: 1, name: 'PRESENTACIÓN DE RECURSO JERÁRQUICO' },  
    { id: 2, name: 'RESOLUCIÓN DE RECURSO JERÁRQUICON' },  
    { id: 3, name: 'NOTIFICACIÓN CON RESOLUCIÓN DE RECURSOS JERÁRQUICO' },  
    { id: 4, name: 'AUTO EJECUTORIA' },  
    { id: 5, name: 'NOTIFICACIÓN CON EL AUTO DE EJECUTORIA' }
];

</script>


<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Seguimiento al proceso administrativo DS. 1302 y 1320 </v-card-title>
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
                                <v-text-field v-model="form.numeroCaso" label="Número de caso" append-inner-icon="mdi-magnify" hide-details @click:append-inner="searchCaso" ></v-text-field>
                            </v-col>                                                                                                                   
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.inicialVictima" label="Inicial víctima" required :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.inicialAgresor" label="Inicial agresor" required :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                                                        
                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Proceso administrativo 1302 1320</span>
                                </div>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-select v-model="form.autoInicial" :items="autoInicialTipo" item-title="name" item-value="id" label="Auto inicial" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaAgresion" label="Fecha de la agresión" @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-select v-model="form.autoFinal" :items="autoFinalTipo" item-title="name" item-value="id" label="Auto final del proceso" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-select v-model="form.recursoRevocatoria" :items="recursoRevocatoriaTipo" item-title="name" item-value="id" label="Recurso de revocatoria" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-select v-model="form.recursoJuridico" :items="recursoJuridicoTipo" item-title="name" item-value="id" label="Recurso jurídico" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaSeguimiento" label="Fecha de seguimiento" @input="onDateInput2" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
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
                                    
    <v-dialog v-model="dialogSave" persistent width="auto" >
        <v-card>
            <v-card-title class="text-h5">
            Mensaje
            </v-card-title>
            <v-card-text>¿ Nuevo registro ? (Si ya añadió el registro y quiere modificarlo escoja NO)</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green-darken-1" variant="text" @click="router.push('/violencia/jerarquica')" :disabled="isFormDisabled"> NO </v-btn>
                <v-btn color="green-darken-1" variant="text" @click="reset" :disabled="isFormDisabled"> SI </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>