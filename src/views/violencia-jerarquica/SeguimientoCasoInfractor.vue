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
    remisionCasoDnaJuez: false,
    fechaAgresion: null,
    remisionDnaContrareferencia: false,
    cambioInfraccionDelito: false,
    inicioProcesoAdministrativo: false,
    remisionCasoDnaOtraInstancia: false,
    nombreOtraInstancia: null,
    sancion: null,
    sancionCumplimiento: false,
    sancionAvisoProgenitor: false,
    dnaJuezEstablecioMedidas: false,
    presentoDenunciaMinisterioPublica: false,
    nombreDenuncianteMinisterioPublica: null
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

    var dateParts = (form.value.fechaAgresion || '').split("/");

    const payload = {
        id_num_caso: caso.value.caso_id,
        caso_remitido_juez: form.value.remisionCasoDnaJuez,
        caso_remitido_otra_instancia: form.value.remisionCasoDnaOtraInstancia,
        dna_remision_referencia: form.value.remisionDnaContrareferencia,
        cambio_sancion_delito: form.value.cambioInfraccionDelito,
        inicio_proceso_admi: form.value.inicioProcesoAdministrativo,
        id_violencia_sancion_tipo: form.value.sancion.id,
        sancion_cumplida: form.value.sancionCumplimiento,
        com_tutor: form.value.sancionAvisoProgenitor,
        medidas_protec: form.value.dnaJuezEstablecioMedidas,
        denuncia_minpub: form.value.presentoDenunciaMinisterioPublica,
        id_quien_denuncia_tipo: form.value.nombreDenuncianteMinisterioPublica.id,

        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()
    }
    console.log(payload);

    const save = await ViolenciaJerarquica.createSeguimientoInfraccion(payload).then((res) => {
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
        remisionCasoDnaJuez: false,
        fechaAgresion: null,
        remisionDnaContrareferencia: false,
        cambioInfraccionDelito: false,
        inicioProcesoAdministrativo: false,
        remisionCasoDnaOtraInstancia: false,
        nombreOtraInstancia: null,
        sancion: null,
        sancionCumplimiento: false,
        sancionAvisoProgenitor: false,
        dnaJuezEstablecioMedidas: false,
        presentoDenunciaMinisterioPublica: false,
        nombreDenuncianteMinisterioPublica: null
    };
    caso.value = null;
    dialogSave.value = false;
};

const onDateInput1 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaAgresion = onDateInput(cleanedInput);
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

    if (!form.value.fechaAgresion) validationErrors.value['fechaAgresion'] = true;
    else delete validationErrors.value['fechaAgresion'];

    if (!form.value.sancion) validationErrors.value['sancion'] = true;
    else delete validationErrors.value['sancion'];

    if (form.value.remisionCasoDnaOtraInstancia && !form.value.nombreOtraInstancia) validationErrors.value['nombreOtraInstancia'] = true;
    else delete validationErrors.value['nombreOtraInstancia'];

    if (form.value.presentoDenunciaMinisterioPublica && !form.value.nombreDenuncianteMinisterioPublica) validationErrors.value['nombreDenuncianteMinisterioPublica'] = true;
    else delete validationErrors.value['nombreDenuncianteMinisterioPublica'];

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
        var dateParts = (res.data[0].fec_agresion || '').split("-");
        form.value.fechaAgresion = dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0];
        form.value.inicialVictima = inicialesVictima.toUpperCase();
        form.value.inicialAgresor = inicialesAgresor.toUpperCase();
    } else {
        form.value.fechaAgresion = null;
    }
};

const sansionTipo = [
    { id: 1, name: 'AMONESTACIÓN EN PRIVADO' },  
    { id: 2, name: 'AMONESTACIÓN ESCRITA' },  
    { id: 3, name: 'DESCUENTO DE 1 A 5 DÍAS DE HABER' },  
    { id: 4, name: 'TRASLADO DEL LUGAR DE TRABAJO' },  
    { id: 5, name: 'OTRO' }
];


const denunciaTipo = [
    { id: 1, name: 'DNA' },  
    { id: 2, name: 'LA FAMILIA DE LA VÍCTIMA' },  
    { id: 3, name: 'LA DIRECCIÓN DEPARTAMENTAL DE EDUCACIÓN' },  
    { id: 4, name: 'EL MINISTERIO DE EDUCACIÓN' },  
    { id: 5, name: 'OTRO' }
];
</script>

<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Seguimiento a casos de infracción </v-card-title>
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
                                <v-text-field v-model="form.inicialVictima" label="Inicial víctima" required :readonly="true" :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.inicialAgresor" label="Inicial agresor" required :readonly="true" :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                                                        
                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Casos de infracción</span>
                                </div>
                            </v-col>
                            
                            <v-col cols="12" md="3" >
                                <v-checkbox v-model="form.remisionCasoDnaJuez" label="¿ El caso fue remitido por la DNA al juez de la niñez y adolescencia ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.fechaAgresion" label="Fecha de la agresión" @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details required :readonly="true" :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="3" >
                                <v-checkbox v-model="form.remisionCasoDnaOtraInstancia" label="¿ El caso fue remitido por la DNA a otra instancia ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.nombreOtraInstancia" label="A que instancia" hide-details required v-if="form.remisionCasoDnaOtraInstancia" :disabled="isFormDisabled"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="3" >
                                <v-checkbox v-model="form.remisionDnaContrareferencia" label="¿ la DNA remitió contra referencia ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>
                            
                            <v-col cols="12" md="3" >
                                <v-checkbox v-model="form.cambioInfraccionDelito" label="¿ Cambió la infracción a delito ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>
                            
                            <v-col cols="12" md="3" >
                                <v-checkbox v-model="form.inicioProcesoAdministrativo" label="¿ Se inició un proceso administrativo ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                                                        <v-col cols="12" md="3" >
                                <v-select v-model="form.sancion" :items="sansionTipo" item-title="name" item-value="id" label="Sanción" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>
                            
                            <v-col cols="12" md="3" >
                                <v-checkbox v-model="form.sancionCumplimiento" label="¿ Se  cumplió la sanción ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>
                            
                            <v-col cols="12" md="3" >
                                <v-checkbox v-model="form.sancionAvisoProgenitor" label="¿ Se informó a los progenitores de la sanción ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>
                            
                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.dnaJuezEstablecioMedidas" label="¿ La DNA o el/la juez estableció medidas de proteción ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>
                            
                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Casos de delito</span>
                                </div>
                            </v-col>
                            
                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.presentoDenunciaMinisterioPublica" label="¿ Se presentó la denuncia al ministerio público ?" required :disabled="isFormDisabled"></v-checkbox>
                            </v-col>

                                                        <v-col cols="12" md="4" >
                                <v-select v-model="form.nombreDenuncianteMinisterioPublica" :items="denunciaTipo" item-title="name" item-value="id" label="Quién presento la denuncia" return-object v-if="form.presentoDenunciaMinisterioPublica" :disabled="isFormDisabled"></v-select>
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
