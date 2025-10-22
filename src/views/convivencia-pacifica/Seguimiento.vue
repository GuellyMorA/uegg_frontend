<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
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
const indicadores = ref();
const construccion = ref();
const institucionEducativa = ref();
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




const form: any = ref({
    sie: null,
    unidadEducativa: '',
    accionInicial: null,
    accionEjecutada: null,
    Indicador1: null,
    Indicador2: null,
    Indicador3: null,
    Indicador4: null,
    Indicador5: null,
    fecha: '',
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

onMounted(async() => {
    username = localStorage.getItem('username') ;
     isLoading.value = false;
     
    let user = JSON.parse(localStorage.getItem('user') || '');
    if(user && user.codigo_sie){
        form.value.sie = user.codigo_sie;
        findInstitucionEducativa();
    }

    const res = await ConvivenciaPacifica.getIndicadorTipo().then((data) => {
        console.log("data", data.data, data.status);
        if(data.status === 200){
            indicadores.value = data.data;  
        } else {
            toast.error('Indicadores no encontrados', {
                autoClose: 3000,
                position: toast.POSITION.TOP_RIGHT,
            });
        }
    });

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
    
}); 

const findInstitucionEducativa = async () => {
    if(String(form.value.sie).length === 8){
        const res = await ConvivenciaPacifica.findInstitucionEducativa(form.value.sie);
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
}; 

const onDateInput1 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fecha = onDateInput(cleanedInput);
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
        toast.info('Debe ingresar los datos requeridos', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
        dialog.value = false;
        dialogSave.value = false;
        return false;
    }
    const dateParts = (form.value.fecha || '').split("/");
       
    if( form.value.Indicador1 && form.value.Indicador1.id ){
        const payload1 = {
            id_pcpa_indicadores_tipo: form.value.Indicador1.id,
            id_pcpa_construccion: construccion.value.id, 
            cod_indicadores: form.value.Indicador1.cod_indicadores,
            desc_indicadores: form.value.Indicador1.desc_indicadores,
            fec_ejecucion:   new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]).toISOString(), // form.value.fecha,        
            estado: 'ACTIVO',
           usu_cre: username,
            fec_cre: new Date()
        }
        console.log("payload1", payload1);

        const save1 = await ConvivenciaPacifica.createSeguimiento(payload1).then((res) => {
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
    }

    if( form.value.Indicador2 && form.value.Indicador2.id ){
        const payload2 = {
            id_pcpa_indicadores_tipo: form.value.Indicador2.id,
            id_pcpa_construccion: construccion.value.id, 
            cod_indicadores: form.value.Indicador2.cod_indicadores,
            desc_indicadores: form.value.Indicador2.desc_indicadores,
            fec_ejecucion:    new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]).toISOString(), //    form.value.fecha,        
            estado: 'ACTIVO',
           usu_cre: username,
            fec_cre: new Date()
        }
        console.log("payload2", payload2);

        const save2 = await ConvivenciaPacifica.createSeguimiento(payload2).then((res) => {
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
    }

    if( form.value.Indicador3 && form.value.Indicador3.id ){
        const payload3 = {
            id_pcpa_indicadores_tipo: form.value.Indicador3.id,
            id_pcpa_construccion: construccion.value.id, 
            cod_indicadores: form.value.Indicador3.cod_indicadores,
            desc_indicadores: form.value.Indicador3.desc_indicadores,
            fec_ejecucion:   new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]).toISOString(), //    form.value.fecha,        
            estado: 'ACTIVO',
           usu_cre: username,
            fec_cre: new Date()
        }
        console.log("payload3", payload3);

        const save3 = await ConvivenciaPacifica.createSeguimiento(payload3).then((res) => {
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
        console.log("save3", save3);
        
    }
   
};

const validateForm = () => {
    validationErrors.value = {};

    if (!form.value.sie || !form.value.unidadEducativa) validationErrors.value['sie'] = true;
    else delete validationErrors.value['sie'];

    if (!form.value.accionInicial) validationErrors.value['accionInicial'] = true;
    else delete validationErrors.value['accionInicial'];

    if (!form.value.accionEjecutada) validationErrors.value['accionEjecutada'] = true;
    else delete validationErrors.value['accionEjecutada'];

    if (!form.value.Indicador1 && !form.value.Indicador2 && !form.value.Indicador3) validationErrors.value['Indicador'] = true;
    else delete validationErrors.value['Indicador'];

    // if (!form.value.Indicador2) validationErrors.value['Indicador2'] = true;
    // else delete validationErrors.value['Indicador2'];

    // if (!form.value.Indicador3) validationErrors.value['Indicador3'] = true;
    // else delete validationErrors.value['Indicador3'];

    // if (!form.value.Indicador4) validationErrors.value['Indicador4'] = true;
    // else delete validationErrors.value['Indicador4'];

    // if (!form.value.Indicador5) validationErrors.value['Indicador5'] = true;
    // else delete validationErrors.value['Indicador5'];

    if (!form.value.fecha) validationErrors.value['fecha'] = true;
    else delete validationErrors.value['fecha'];
   
    return !Object.keys(validationErrors.value).length;
};

const reset = () => {
    form.value.Indicador1 = null;
    form.value.Indicador2 = null;
    form.value.Indicador3 = null;
    form.value.Indicador4 = null;
    form.value.Indicador5 = null;
    form.value.fecha = '';
    form.value.validado = false;
    dialogSave.value = false;
};



</script>

<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Seguimiento y evaluación del PCPA</v-card-title>
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
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100"></span> </div>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.sie" :rules="sieRules" :counter="8" label="SIE" required hide-details :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.unidadEducativa" :counter="10" label="Unidad Educativa" hide-details required :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Seguimiento</span>
                                </div>
                            </v-col>


                            <v-col cols="12" md="8" >
                                Indique cuantas acciones estaban inicialmente planificadas para el año en curso
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.accionInicial" :counter="10" label="Cantidad" hide-details type="number" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                Indique cuantas acciones ejecutó hasta fin de año en curso
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.accionEjecutada" :counter="10" label="Cantidad" hide-details type="number" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Cumplimiento de indicadores</span>
                                </div>
                            </v-col>
<v-col cols="12" md="3" >
                                1. Infraestructura amigable y segura
                            </v-col>

                            <v-col cols="12" md="9" >
                                <v-select v-model="form.Indicador1" :items="indicadores" item-title="desc_indicadores" item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="3" >
                                2. Convivencia pacífica y aplicación de protocolos
                            </v-col>

                            <v-col cols="12" md="9" >
                                <v-select v-model="form.Indicador2" :items="indicadores" item-title="desc_indicadores" item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>

                            <v-col cols="12" md="3" >
                                3. Formación de la comunidad educativa en convivencia pacífica
                            </v-col>

                            <v-col cols="12" md="9" >
                                <v-select v-model="form.Indicador3" :items="indicadores" item-title="desc_indicadores" item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>
<v-col cols="12" md="3" >
                                4. Participación de niñas, niños y adolescentes
                            </v-col>

                            <v-col cols="12" md="9" >
                                <v-select v-model="form.Indicador3" :items="indicadores" item-title="desc_indicadores" item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>
                             <v-col cols="12" md="3" >
                                5. Articulación de la unidad educativa con servicios y la comunidad
                            </v-col>

                            <v-col cols="12" md="9" >
                                <v-select v-model="form.Indicador3" :items="indicadores" item-title="desc_indicadores" item-value="id" label="Indicador" return-object :disabled="isFormDisabled"></v-select>
                            </v-col>
<v-col cols="12" md="3" >
                                Fecha
                            </v-col>

                            <v-col cols="12" md="9" >
                                <v-text-field v-model="form.fecha" label="DD/MM/AAAA" @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
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

