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
const institucionEducativa = ref();

const formSearch = ref({
    codigoRude: '',
    codigoRda: '',
    usuario: ''
});
let username: string | null ;
const form: any = ref({
    numeroCaso: '',
    fechaAgresion: null,
    periodo: null,
    numeroAgresor: null,
    comunicacionTutor: false,
    comunicacionTutorNombre: '',
    comunicacionTutorFecha: null,
    descripcionBreve: '',
    violenciaFisica: false,
    violenciaFisicaDescripcion: '',
    violenciaFisicaGravedad: null,
    violenciaFisicaValoracion: null,
    violenciaPsicologica: false,
    violenciaPsicologicaDescripcion: '',
    violenciaPsicologicaGravedad: null,
    violenciaPsicologicaValoracion: null,
    violenciaSexual: false,
    violenciaSexualDescripcion: '',
    violenciaSexualGravedad: null,
    violenciaSexualValoracion: null,
    victimaId:null,
    victimaCodigoRude:null,
    victimaNombre:null,
    agresorId:null,
    agresorCodigoRda:null,
    agresorNombre:null
});

onMounted(async() => {
    let user = JSON.parse(localStorage.getItem('user') || '');
    if(user && user.codigo_sie){
        form.value.numeroCaso = crearCodigoUnico(10);
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
        num_caso: form.value.numeroCaso,
        fec_agresion: new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]),
        num_agresores: form.value.numeroAgresor,
    
        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()
    }
    console.log(payload);

    const save = await ViolenciaJerarquica.createCaso(payload).then((res) => {
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

    // res.data.id
    var dateParts1 = (form.value.comunicacionTutorFecha || '').split("/");

    const payload1 = {    
        id_violencia_caso_agresor: save.data.id,
        id_violencia_victima: form.value.victimaId,
        id_violencia_agresor: form.value.agresorId,
        comunicacion_tutores: form.value.comunicacionTutor,
        desc_hecho: form.value.descripcionBreve,    
        nombre_tutores: form.value.comunicacionTutorNombre,
        fec_com: new Date(dateParts1[2] +'-'+ dateParts1[1] +'-'+ dateParts1[0]),
        violencia_fis: form.value.violenciaFisica,
        violencia_val_fis: form.value.violenciaFisicaValoracion,
        desc_hecho_fis: form.value.violenciaFisicaDescripcion,
        violencia_psico: form.value.violenciaPsicologica,
        violencia_val_psico: form.value.violenciaPsicologicaValoracion,
        desc_hecho_psico: form.value.violenciaPsicologicaDescripcion,
        violencia_sexual: form.value.violenciaSexual,
        violencia_val_sexual: form.value.violenciaSexualValoracion,
        desc_hecho_sexual: form.value.violenciaSexualDescripcion,

        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()            
    }
    console.log(payload1);

    const save1 = await ViolenciaJerarquica.createCasoDetalle(payload1).then((res) => {
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


    dialog.value = false;  
    dialogSave.value = true;   
};

const reset = () => {
    form.value = {
        numeroCaso: '',
        fechaAgresion: null,
        periodo: null,
        numeroAgresor: null,
        comunicacionTutor: false,
        comunicacionTutorNombre: '',
        comunicacionTutorFecha: null,
        descripcionBreve: '',
        violenciaFisica: false,
        violenciaFisicaDescripcion: '',
        violenciaFisicaGravedad: null,
        violenciaFisicaValoracion: null,
        violenciaPsicologica: false,
        violenciaPsicologicaDescripcion: '',
        violenciaPsicologicaGravedad: null,
        violenciaPsicologicaValoracion: null,
        violenciaSexual: false,
        violenciaSexualDescripcion: '',
        violenciaSexualGravedad: null,
        violenciaSexualValoracion: null,
        victimaId:null,
        victimaCodigoRude:null,
        victimaNombre:null,
        agresorId:null,
        agresorCodigoRda:null,
        agresorNombre:null
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
    form.value.comunicacionTutorFecha = onDateInput(cleanedInput);
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

const searchCasoCodigoRude = async () => {
    console.log(formSearch);
    if (!formSearch.value.codigoRude){
        toast.error('Debe ingresar el Código RUDE', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }

    const res = await ViolenciaJerarquica.findCasoRude(formSearch.value.codigoRude);
    console.log("res", res);
    if(res.status === 200 && res.data && res.data.length > 0){
        list.value = res.data;
        console.log(res.data);
    } else {
        list.value = null;
    }
};

const searchCasoCodigoRda = async () => {
    console.log(formSearch);
    if (!formSearch.value.codigoRda){
        toast.error('Debe ingresar el Código RDA', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }

    const res = await ViolenciaJerarquica.findCasoRda(formSearch.value.codigoRda);
    console.log("res", res);
    if(res.status === 200 && res.data && res.data.length > 0){
        list.value = res.data;
        console.log(res.data);
    } else {
        list.value = null;
    }
};

const searchVictimaUsuario = () => {
    list.value = plants;
    console.log(formSearch);
};

const viewItem = (item: any) => {
    console.log(item);
};

const headers = [
    { title: 'Caso', align: 'start', sortable: false, key: 'num_caso' },
    { title: 'Fecha Agresión', align: 'end', key: 'fec_agresion' },
    { title: 'Código RUDE', align: 'end', key: 'cod_rude' },
    { title: 'Nombres', align: 'end', key: 'nombres_victima' },
    { title: 'Paterno', align: 'end', key: 'apellido_pat_victima' },
    { title: 'Materno', align: 'end', key: 'apellido_mat_victima' },
    { title: 'Acciones', key: 'actions', sortable: false, align:'center' },
];

const plants = [
      {
        id: 1,
        name: 'Fern',
        light: 'Low',
        height: '20cm',
        petFriendly: 'Yes',
        price: 20,
      },
      {
        id: 1,
        name: 'Snake Plant',
        light: 'Low',
        height: '50cm',
        petFriendly: 'No',
        price: 35,
      },
      {
        id: 1,
        name: 'Monstera',
        light: 'Medium',
        height: '60cm',
        petFriendly: 'No',
        price: 50,
      },
      {
        id: 1,
        name: 'Pothos',
        light: 'Low to medium',
        height: '40cm',
        petFriendly: 'Yes',
        price: 25,
      },
      {
        id: 1,
        name: 'ZZ Plant',
        light: 'Low to medium',
        height: '90cm',
        petFriendly: 'Yes',
        price: 30,
      },
      {
        id: 1,
        name: 'Pothos',
        light: 'Low to medium',
        height: '40cm',
        petFriendly: 'Yes',
        price: 25,
      },
      {
        id: 1,
        name: 'ZZ Plant',
        light: 'Low to medium',
        height: '90cm',
        petFriendly: 'Yes',
        price: 30,
      }
];

const validateForm = () => {
    validationErrors.value = {};

    

    if (!form.value.victimaId || !form.value.victimaCodigoRude || !form.value.victimaNombre) validationErrors.value['victima'] = true;
    else delete validationErrors.value['victima'];

    if (!form.value.agresorId || !form.value.agresorCodigoRda || !form.value.agresorNombre) validationErrors.value['agresor'] = true;
    else delete validationErrors.value['agresor'];

    if (!form.value.numeroCaso) validationErrors.value['numeroCaso'] = true;
    else delete validationErrors.value['numeroCaso'];

    if (!form.value.fechaAgresion) validationErrors.value['fechaAgresion'] = true;
    else delete validationErrors.value['fechaAgresion'];

    if (!form.value.numeroAgresor) validationErrors.value['numeroAgresor'] = true;
    else delete validationErrors.value['numeroAgresor'];

    if (!form.value.descripcionBreve) validationErrors.value['descripcionBreve'] = true;
    else delete validationErrors.value['descripcionBreve'];

    if (form.value.comunicacionTutor && !form.value.comunicacionTutorNombre) validationErrors.value['comunicacionTutorNombre'] = true;
    else delete validationErrors.value['comunicacionTutorNombre'];

    if (form.value.comunicacionTutor && !form.value.comunicacionTutorFecha) validationErrors.value['comunicacionTutorFecha'] = true;
    else delete validationErrors.value['comunicacionTutorFecha'];

    if (form.value.violenciaPsicologica && !form.value.violenciaPsicologicaDescripcion) validationErrors.value['violenciaPsicologicaDescripcion'] = true;
    else delete validationErrors.value['violenciaPsicologicaDescripcion'];

    // if (form.value.violenciaPsicologica && !form.value.violenciaPsicologicaGravedad) validationErrors.value['violenciaPsicologicaGravedad'] = true;
    // else delete validationErrors.value['violenciaPsicologicaGravedad'];

    if (form.value.violenciaPsicologica && !form.value.violenciaPsicologicaValoracion) validationErrors.value['violenciaPsicologicaValoracion'] = true;
    else delete validationErrors.value['violenciaPsicologicaValoracion'];
   
    if (form.value.violenciaSexual && !form.value.violenciaSexualDescripcion) validationErrors.value['violenciaSexualDescripcion'] = true;
    else delete validationErrors.value['violenciaSexualDescripcion'];

    // if (form.value.violenciaSexual && !form.value.violenciaSexualGravedad) validationErrors.value['violenciaSexualGravedad'] = true;
    // else delete validationErrors.value['violenciaSexualGravedad'];

    if (form.value.violenciaSexual && !form.value.violenciaSexualValoracion) validationErrors.value['violenciaSexualValoracion'] = true;
    else delete validationErrors.value['violenciaSexualValoracion'];

    return !Object.keys(validationErrors.value).length;
};

const searchAgresor = async () => {
    console.log(form.value);
    if (!form.value.agresorCodigoRda){
        toast.error('Debe ingresar el Código RDA', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    const res = await ViolenciaJerarquica.findAgresorRude(form.value.agresorCodigoRda);
    console.log("res", res);
    if(res.status === 200 && res.data && res.data.length > 0){
        form.value.agresorId = res.data[0].id;
        form.value.agresorNombre = res.data[0].nombres_agresor +' '+ res.data[0].apellido_pat_agresor +' '+ res.data[0].apellido_mat_agresor; 
        console.log(res.data);
    } else {
        form.value.agresorId = null;
        form.value.agresorNombre = null;
        toast.error('Debe se encontro al agresor', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }
};

const searchVictima = async () => {
    console.log(form.value);
    if (!form.value.victimaCodigoRude){
        toast.error('Debe ingresar el Código RUDE', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    const res = await ViolenciaJerarquica.findVictimaRude(form.value.victimaCodigoRude);
    console.log("res", res);
    if(res.status === 200 && res.data && res.data.length > 0){
        form.value.victimaId = res.data[0].id;
        form.value.victimaNombre = res.data[0].nombres_victima +' '+ res.data[0].apellido_pat_victima +' '+ res.data[0].apellido_mat_victima; 
        console.log(res.data);
    } else {
        form.value.victimaId = null;
        form.value.victimaNombre = null;
        toast.error('No se encontro a la victima', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }
};

const crearCodigoUnico = (longitud: number) => {
    // const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const caracteres = '0123456789';
    let resultado = '';
    for (let i = 0; i < longitud; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        resultado += caracteres.charAt(indice);
    }
    console.log(resultado);
    return resultado;
};

</script>
<template>
    <v-row v-if="false">    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Búsqueda de caso</v-card-title>
                    </div>
                    <v-form v-model="valid" class="">
                        <v-container>
                        <v-row>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="formSearch.codigoRude" density="compact" variant="solo" label="Código RUDE" append-inner-icon="mdi-magnify" single-line hide-details  @click:append-inner="searchCasoCodigoRude" ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="formSearch.codigoRda" density="compact" variant="solo" label="Código RDA" append-inner-icon="mdi-magnify" single-line hide-details  @click:append-inner="searchCasoCodigoRda" ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="formSearch.usuario" density="compact" variant="solo" label="Usuario" append-inner-icon="mdi-magnify" single-line hide-details  @click:append-inner="searchVictimaUsuario" ></v-text-field>
                            </v-col>
                        </v-row>
                        </v-container>
                    </v-form>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
    <v-row v-if="list">    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2 mb-3">
                        <v-card-title class="text-h5">Casos</v-card-title>
                    </div>
                    <v-data-table :headers="headers" :items-per-page="5" :items="list" density="comfortable" item-key="name">
                        <template v-slot:item.actions="{ item }">
                            <v-icon size="small" class="me-2" @click="viewItem(item)">mdi-eye</v-icon>
                        </template>
                    </v-data-table>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Registro del caso de violencia </v-card-title>
                    </div>
                    <v-form v-model="valid" class="">
                        <v-container>
                        <v-row>
                            
                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos de la víctima</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.victimaCodigoRude" label="Código RUDE" append-inner-icon="mdi-magnify" hide-details @click:append-inner="searchVictima" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.victimaNombre" label="Nombre y Apellido" @input="onDateInput1" placeholder="Nombre y apellidos" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos del agresor</span>
                                </div>
                            </v-col>                            

                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.agresorCodigoRda" label="Código RDA" append-inner-icon="mdi-magnify" hide-details @click:append-inner="searchAgresor" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.agresorNombre" label="Nombre y Apellido" @input="onDateInput1" placeholder="Nombre y apellidos" hide-details required :readonly="true"></v-text-field>
                            </v-col>


                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos del caso</span>
                                </div>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.numeroCaso" :rules="sieRules" :counter="10" label="Número de caso" required hide-details></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaAgresion" label="Fecha de la agresión" @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details required></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.numeroAgresor" type="number" label="Número de agresores" hide-details required></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="6" >
                                <v-checkbox v-model="form.comunicacionTutor" label="¿ Se comunicó el hecho a los progenitores o tutores ?" required></v-checkbox>
                            </v-col>
                            
                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.comunicacionTutorNombre" label="Nombre del progenitor/a o tutor/a" hide-details required v-if="form.comunicacionTutor"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.comunicacionTutorFecha" label="Fecha de la comunicación" @input="onDateInput2" placeholder="DD/MM/AAAA" hide-details required v-if="form.comunicacionTutor"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12" >
                                <v-text-field v-model="form.descripcionBreve" label="Breve descripción del hecho" hide-details required></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Tipo de violencia</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="12" >
                                <v-checkbox v-model="form.violenciaFisica"  label="Violencia física" hide-details required></v-checkbox>
                            </v-col>
                            <!--
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.violenciaFisicaGravedad"  label="Gravedad" hide-details required v-if="form.violenciaFisica"></v-text-field>
                            </v-col>
                            -->
                            <!-- MODIFICADO 20241001 -->
                            <!-- <v-col cols="12" md="4" >
                                <v-text-field v-model="form.violenciaFisicaValoracion" label="Valoración del hecho" hide-details required v-if="form.violenciaFisica"></v-text-field>
                            </v-col> -->

                            <v-col cols="12" md="12" v-if="form.violenciaFisica">
                                <v-text-field v-model="form.violenciaFisicaDescripcion" label="Descripción del hecho y daño" hide-details required ></v-text-field>
                            </v-col>

                            <!-- MODIFICADO 20241001 -->
                            <v-col cols="12" md="12" >
                                <v-checkbox v-model="form.violenciaPsicologica"  label="Violencia psicológica" hide-details required></v-checkbox>
                            </v-col>

                            <!-- <v-col cols="12" md="4" >
                                <v-text-field v-model="form.violenciaPsicologicaGravedad"  label="Gravedad" hide-details required v-if="form.violenciaPsicologica"></v-text-field>
                            </v-col> -->

                            <!-- MODIFICADO 20241001 -->
                            <!-- <v-col cols="12" md="6" >
                                <v-text-field v-model="form.violenciaPsicologicaValoracion" label="Valoración del hecho" hide-details required v-if="form.violenciaPsicologica"></v-text-field>
                            </v-col> -->

                            <v-col cols="12" md="12" v-if="form.violenciaPsicologica">
                                <v-text-field v-model="form.violenciaPsicologicaDescripcion" label="Descripción del hecho y daño" hide-details required ></v-text-field>
                            </v-col>      

                            <!-- MODIFICADO 20241001 -->
                            <v-col cols="12" md="12" >
                                <v-checkbox v-model="form.violenciaSexual" label="Violencia sexual" hide-details required></v-checkbox>
                            </v-col>

                            <!-- <v-col cols="12" md="4" >
                                <v-text-field v-model="form.violenciaSexualGravedad"  label="Gravedad" hide-details required v-if="form.violenciaSexual"></v-text-field>
                            </v-col> -->

                            <!-- MODIFICADO 20241001 -->
                            <!-- <v-col cols="12" md="6" >
                                <v-text-field v-model="form.violenciaSexualValoracion" label="Valoración del hecho" hide-details required v-if="form.violenciaSexual"></v-text-field>
                            </v-col> -->

                            <!-- MODIFICADO 20241001 -->
                            <v-col cols="12" md="12" v-if="form.violenciaSexual">
                                <v-text-field v-model="form.violenciaSexualDescripcion" label="Descripción del hecho y daño" hide-details required ></v-text-field>
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