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
    etapaPreliminar: null,
    fechaAgresion: null,
    preparatoriaImputacionFormal: null,
    jucioAcusacionFormal: null,
    apelacion: null,
    casacion: null,
    otraFormaConclusionProceso: null,
    fechaSeguimiento: null
});

onMounted(async() => {
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
        id_etapa_preliminar_tipo: form.value.etapaPreliminar.id,
        id_etapa_preparatoria_tipo: form.value.preparatoriaImputacionFormal.id,
        id_juicio_ac_formal_tipo: form.value.jucioAcusacionFormal.id,
        apelacion: form.value.apelacion,
        cazacion: form.value.casacion,
        id_otras_formas_conclusion_tipo: form.value.otraFormaConclusionProceso.id,
        fec_seg: dateParts[2] || '' +'-'+ dateParts[1] || '' +'-'+ dateParts[0] || '',
    
        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()
    }
    console.log(payload);

    const save = await ViolenciaJerarquica.createSeguimientoProcesoPenal(payload).then((res) => {
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
        etapaPreliminar: null,
        fechaAgresion: null,
        preparatoriaImputacionFormal: null,
        jucioAcusacionFormal: null,
        apelacion: null,
        casacion: null,
        otraFormaConclusionProceso: null,
        fechaSeguimiento: null
    };
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

    if (!form.value.etapaPreliminar) validationErrors.value['etapaPreliminar'] = true;
    else delete validationErrors.value['etapaPreliminar'];

    if (!form.value.fechaAgresion) validationErrors.value['fechaAgresion'] = true;
    else delete validationErrors.value['fechaAgresion'];

    if (!form.value.preparatoriaImputacionFormal) validationErrors.value['preparatoriaImputacionFormal'] = true;
    else delete validationErrors.value['preparatoriaImputacionFormal'];

    if (!form.value.jucioAcusacionFormal) validationErrors.value['jucioAcusacionFormal'] = true;
    else delete validationErrors.value['jucioAcusacionFormal'];

    if (!form.value.otraFormaConclusionProceso) validationErrors.value['otraFormaConclusionProceso'] = true;
    else delete validationErrors.value['otraFormaConclusionProceso'];

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

const etapaPreliminarTipo = [
    { id: 1, name: 'RECHAZO' },  
    { id: 2, name: 'OBJECIÓN DE RECHAZO' },  
    { id: 3, name: 'NOTIFICACIÓN CON EL RECHAZO' },  
    { id: 4, name: 'RESOLUCIÓN JERÁRQUICA DE LA OBJECIÓN' },  
    { id: 5, name: 'NOTIFICACIÓN CON LA RESOLUCIÓN JERÁRQUICA' }
];

const preparatoriaImputacionFormalTipo = [
    { id: 1, name: 'IMPUTACIÓN' },  
    { id: 2, name: 'SOBRESEIMIENTO' },  
    { id: 3, name: 'NOTIFICACIÓN CON EL SOBRE SEIMIENTO' },  
    { id: 4, name: 'IMPUGNACIÓN AL SOBRESEIMIENTO' },  
    { id: 5, name: 'RESOLUCIÓN JERÁRQUICA' },  
    { id: 6, name: 'NOTIFICACIÓN CON LA RESOLUCIÓN JERÁRQUICA' },  
    { id: 7, name: 'DETENCIÓN PREVENTIVA' },  
    { id: 8, name: 'ACUSACIÓN FORMAL' }
];

const jucioAcusacionFormalTipo = [
    { id: 1, name: 'SENTENCIA' },  
    { id: 2, name: 'PROCESO ABREVIADO' }
];

const otraFormaConclusionProcesoTipo = [
    { id: 0, name: 'NINGUNO' },  
];

</script>
<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Seguimiento al proceso penal DS. 1302 y 1320 </v-card-title>
                    </div>
                    <v-form v-model="valid" class="">
                        <v-container>
                        <v-row>     
                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.numeroCaso" label="Número de caso" append-inner-icon="mdi-magnify" hide-details @click:append-inner="searchCaso" ></v-text-field>
                            </v-col>                                                                                                             
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.inicialVictima" label="Inicial víctima" required></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.inicialAgresor" label="Inicial agresor" required></v-text-field>
                            </v-col>
                            
                            <!-- <v-col cols="12" md="4" >
                                <v-text-field v-model="form.codigoRude" label="Código RUDE" required></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.codigoRda" label="Código RDA" required></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.codigoUsuario" label="Código usuario" required></v-text-field>
                            </v-col> -->
                            
                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Proceso penal 1302 1320</span>
                                </div>
                            </v-col>
                            
                            <v-col cols="12" md="3" >
                                <v-select v-model="form.etapaPreliminar" :items="etapaPreliminarTipo" item-title="name" item-value="id" label="Etapa preliminar" return-object></v-select>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.fechaAgresion" label="Fecha de la agresión" @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details required></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="3" >
                                <v-select v-model="form.preparatoriaImputacionFormal" :items="preparatoriaImputacionFormalTipo" item-title="name" item-value="id" label="Preparatoria imputación formal" return-object></v-select>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-select v-model="form.jucioAcusacionFormal" :items="jucioAcusacionFormalTipo" item-title="name" item-value="id" label="Juicio acusación formal" return-object></v-select>
                            </v-col>                           

                            <v-col cols="12" md="3" >
                                <v-checkbox v-model="form.apelacion" label="¿ Apelación ?" required></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-checkbox v-model="form.casacion" label="¿ Casación ?" required></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-select v-model="form.otraFormaConclusionProceso" :items="otraFormaConclusionProcesoTipo" item-title="name" item-value="id" label="Otras formas de conclusión del proceso" return-object></v-select>
                            </v-col> 

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.fechaSeguimiento" label="Fecha de seguimiento" @input="onDateInput2" placeholder="DD/MM/AAAA" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12" >                                
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
                <v-btn color="green-darken-1" variant="text" @click="router.push('/violencia/jerarquica')"> NO </v-btn>
                <v-btn color="green-darken-1" variant="text" @click="reset"> SI </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
