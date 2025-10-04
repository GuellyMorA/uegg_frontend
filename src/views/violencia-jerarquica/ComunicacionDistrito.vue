<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import { VDataTable } from 'vuetify/labs/VDataTable';
import ViolenciaJerarquica from '@/services/ViolenciaJerarquica';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import { values } from 'lodash';
// import { useNavbarStore } from '@/stores/navbar';
// const store = useNavbarStore();  
// store.setPath('/convivencia/pacifica');
const router = useRouter();
let username: string | null ;

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

const form: any = ref({
    numeroCaso: '',
    fechaAgresion: null,
    fechaComunicacion: null,
    codigoSie: null,
    departamento: null,
    municipio: null,
    nivel: null,
    unidadEducativa: null,
    director: null,
    victimaPaterno: null,
    victimaMaterno: null,
    victimaNombre: null,
    victimaEdad: null,
    victimaSexo: null,
    victimaCodigoRude: null,
    victimaCarnetIdentidad: null,
    victimaComplemento: null,
    agresorPaterno: null,
    agresorMaterno: null,
    agresorNombre: null,
    agresorEdad: null,
    agresorSexo: null,
    agresorCodigoRude: null,
    agresorCarnetIdentidad: null,
    agresorComplemento: null,
    tipoViolencia: null,
    descripcionHechoDano: null,
    accionRealizada: null,
    instanciaReferida: null,
    fechaComunicacionDistrito: null
});

onMounted(async() => {
    username = localStorage.getItem('username') ;
    let user = JSON.parse(localStorage.getItem('user') || '');
    if(user && user.codigo_sie){
        findInstitucionEducativa(user.codigo_sie);
    }
}); 

const findInstitucionEducativa = async (sie: any) => {
    if(String(sie).length === 8){
        const res = await ConvivenciaPacifica.findInstitucionEducativa(sie);
        console.log("res", res);
        if(res.data && res.data.length > 0){
            institucionEducativa.value = res.data[0];
        }
    } else {
        institucionEducativa.value = null;
    }
}; 

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

    var dateParts = (form.value.fechaComunicacion || '').split("/");
    var datePartsDist = (form.value.fechaComunicacionDistrito || '').split("/");

    const payload = {
        id_num_caso: caso.value.id,
        fec_comunicacion: dateParts[2] || '' +'-'+ dateParts[1] || '' +'-'+ dateParts[0] || '',
        id_violencia_caso: caso.value.caso_id,
        id_violencia_victima_nombre: caso.value.id_victima,
        id_violencia_agresor_nombre: caso.value.id_agresor,
        id_acciones_realizadas_tipo: form.value.accionRealizada.id,
        id_violencia_instancia_tipo: form.value.instanciaReferida.id,
        fec_comunicacion_distrital: datePartsDist[2] || '' +'-'+ datePartsDist[1] || '' +'-'+ datePartsDist[0] || '',
    
        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()
    }
    console.log(payload);

    const save = await ViolenciaJerarquica.createComunicacionDistrito(payload).then((res) => {
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
        fechaAgresion: null,
        fechaComunicacion: null,
        codigoSie: null,
        departamento: null,
        municipio: null,
        nivel: null,
        unidadEducativa: null,
        director: null,
        victimaPaterno: null,
        victimaMaterno: null,
        victimaNombre: null,
        victimaEdad: null,
        victimaSexo: null,
        victimaCodigoRude: null,
        victimaCarnetIdentidad: null,
        victimaComplemento: null,
        agresorPaterno: null,
        agresorMaterno: null,
        agresorNombre: null,
        agresorEdad: null,
        agresorSexo: null,
        agresorCodigoRude: null,
        agresorCarnetIdentidad: null,
        agresorComplemento: null,
        tipoViolencia: null,
        descripcionHechoDano: null,
        accionRealizada: null,
        instanciaReferida: null,
        fechaComunicacionDistrito: null
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
    form.value.fechaComunicacion = onDateInput(cleanedInput);
};

const onDateInput3 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaComunicacionDistrito = onDateInput(cleanedInput);
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
    caso.value = item;
    form.value.numeroCaso = item.num_caso;
    var dateParts = (item.fec_agresion || '').split("-");
    form.value.fechaAgresion = dateParts[2] || '' +'/'+ dateParts[1] || '' +'/'+ dateParts[0] || '';
    form.value.victimaPaterno = item.apellido_pat_victima;
    form.value.victimaMaterno = item.apellido_mat_victima;
    form.value.victimaNombre = item.nombres_victima;
    form.value.victimaEdad = item.edad_victima;
    form.value.victimaSexo = item.sexo_victima;
    form.value.victimaCodigoRude = item.cod_rude;
    form.value.victimaCarnetIdentidad = item.num_ci;
    form.value.victimaComplemento = item.comp_victima;
    form.value.agresorPaterno = item.apellido_pat_agresor;
    form.value.agresorMaterno = item.apellido_mat_agresor;
    form.value.agresorNombre = item.nombres_agresor;
    form.value.agresorEdad = item.edad_agresor;
    form.value.agresorSexo = item.sexo_agresor;
    form.value.agresorCodigoRude = item.cod_rda;
    form.value.agresorCarnetIdentidad = item.ci_agresor;
    form.value.agresorComplemento = item.comp_agresor;

    form.value.codigoSie = institucionEducativa.value.institucioneducativa_id;
    form.value.unidadEducativa = institucionEducativa.value.institucioneducativa;
    form.value.departamento = institucionEducativa.value.departamento;
    form.value.municipio = institucionEducativa.value.municipio;
    form.value.director = institucionEducativa.value.director;
    form.value.nivel = institucionEducativa.value.niveles;
    
    form.value.tipoViolencia = item.id_violencia_tipo;
    form.value.descripcionHechoDano = item.desc_hecho;
};

const violenciaTipo = [
    { id: 1, name: 'Física' },  
    { id: 2, name: 'Psicológica' },  
    { id: 3, name: 'Sexual' }
]

const accionTipo = [
    { id: 1, name: 'REFERENCIA DEL CASO' },  
    { id: 2, name: 'DENUNCUA DEL CASO' },  
    { id: 3, name: 'COMUNICACIÓN A LA DD' }
]

const headers = [
    { title: 'Caso', align: 'start', sortable: false, key: 'num_caso' },
    { title: 'Fecha Agresión', align: 'end', key: 'fec_agresion' },
    { title: 'Código RUDE', align: 'end', key: 'cod_rude' },
    { title: 'Nombres', align: 'end', key: 'nombres_victima' },
    { title: 'Paterno', align: 'end', key: 'apellido_pat_victima' },
    { title: 'Materno', align: 'end', key: 'apellido_mat_victima' },
    { title: 'Acciones', key: 'actions', sortable: false, align:'center' },
];

const instanciaTipo = [
    { id: 1, name: 'DNA' },  
    { id: 2, name: 'SLIM' },  
    { id: 3, name: 'FELCV' },  
    { id: 4, name: 'FISCALIA' },  
    { id: 5, name: 'JPNA' },  
    { id: 6, name: 'CENTRO DE SALUD' },  
    { id: 7, name: 'OTRO' }
]

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

    if (!form.value.numeroCaso) validationErrors.value['numeroCaso'] = true;
    else delete validationErrors.value['numeroCaso'];

    if (!form.value.fechaAgresion) validationErrors.value['fechaAgresion'] = true;
    else delete validationErrors.value['fechaAgresion'];

    if (!form.value.fechaComunicacion) validationErrors.value['fechaComunicacion'] = true;
    else delete validationErrors.value['fechaComunicacion'];

    if (!form.value.codigoSie) validationErrors.value['codigoSie'] = true;
    else delete validationErrors.value['codigoSie'];

    if (!form.value.departamento) validationErrors.value['departamento'] = true;
    else delete validationErrors.value['departamento'];

    if (!form.value.municipio) validationErrors.value['municipio'] = true;
    else delete validationErrors.value['municipio'];

    if (!form.value.nivel) validationErrors.value['nivel'] = true;
    else delete validationErrors.value['nivel'];

    if (!form.value.unidadEducativa) validationErrors.value['unidadEducativa'] = true;
    else delete validationErrors.value['unidadEducativa'];

    if (!form.value.director) validationErrors.value['director'] = true;
    else delete validationErrors.value['director'];

    // if (!form.value.victimaPaterno) validationErrors.value['victimaPaterno'] = true;
    // else delete validationErrors.value['victimaPaterno'];

    if (!form.value.victimaMaterno) validationErrors.value['victimaMaterno'] = true;
    else delete validationErrors.value['victimaMaterno'];

    if (!form.value.victimaNombre) validationErrors.value['victimaNombre'] = true;
    else delete validationErrors.value['victimaNombre'];

    if (!form.value.victimaEdad) validationErrors.value['victimaEdad'] = true;
    else delete validationErrors.value['victimaEdad'];

    if (!form.value.victimaSexo) validationErrors.value['victimaSexo'] = true;
    else delete validationErrors.value['victimaSexo'];

    if (!form.value.victimaCodigoRude) validationErrors.value['victimaCodigoRude'] = true;
    else delete validationErrors.value['victimaCodigoRude'];

    if (!form.value.victimaCarnetIdentidad) validationErrors.value['victimaCarnetIdentidad'] = true;
    else delete validationErrors.value['victimaCarnetIdentidad'];

    // if (!form.value.victimaComplemento) validationErrors.value['victimaComplemento'] = true;
    // else delete validationErrors.value['victimaComplemento'];

    // if (!form.value.agresorPaterno) validationErrors.value['agresorPaterno'] = true;
    // else delete validationErrors.value['agresorPaterno'];

    if (!form.value.agresorMaterno) validationErrors.value['agresorMaterno'] = true;
    else delete validationErrors.value['agresorMaterno'];

    if (!form.value.agresorNombre) validationErrors.value['agresorNombre'] = true;
    else delete validationErrors.value['agresorNombre'];

    if (!form.value.agresorEdad) validationErrors.value['agresorEdad'] = true;
    else delete validationErrors.value['agresorEdad'];

    if (!form.value.agresorSexo) validationErrors.value['agresorSexo'] = true;
    else delete validationErrors.value['agresorSexo'];

    if (!form.value.agresorCodigoRude) validationErrors.value['agresorCodigoRude'] = true;
    else delete validationErrors.value['agresorCodigoRude'];

    if (!form.value.agresorCarnetIdentidad) validationErrors.value['agresorCarnetIdentidad'] = true;
    else delete validationErrors.value['agresorCarnetIdentidad'];

    // if (!form.value.agresorComplemento) validationErrors.value['agresorComplemento'] = true;
    // else delete validationErrors.value['agresorComplemento'];

    if (!form.value.tipoViolencia) validationErrors.value['tipoViolencia'] = true;
    else delete validationErrors.value['tipoViolencia'];

    if (!form.value.descripcionHechoDano) validationErrors.value['descripcionHechoDano'] = true;
    else delete validationErrors.value['descripcionHechoDano'];

    if (!form.value.accionRealizada) validationErrors.value['accionRealizada'] = true;
    else delete validationErrors.value['accionRealizada'];

    if (!form.value.instanciaReferida) validationErrors.value['instanciaReferida'] = true;
    else delete validationErrors.value['instanciaReferida'];

    if (!form.value.fechaComunicacionDistrito) validationErrors.value['fechaComunicacionDistrito'] = true;
    else delete validationErrors.value['fechaComunicacionDistrito'];
   
    return !Object.keys(validationErrors.value).length;
};


</script>
<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Búsqueda de comunicación</v-card-title>
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
                        <v-card-title class="text-h5">Registro de la comunicación </v-card-title>
                    </div>
                    <v-form v-model="valid" class="">
                        <v-container>
                        <v-row>
                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos de la Unidad Educativa</span>
                                </div>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.numeroCaso" :rules="sieRules" :counter="8" label="Número de caso" required hide-details :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaAgresion" label="Fecha de la agresión" @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaComunicacion" label="Fecha de comunicación" @input="onDateInput2" placeholder="DD/MM/AAAA" hide-details required></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.codigoSie" label="Código SIE" required :readonly="true"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.departamento" label="Departamento" required :readonly="true"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.municipio" label="Distrito" required :readonly="true"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.nivel" label="Nivel" required :readonly="true"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.unidadEducativa" label="Nombre de la Unidad Educativa" required :readonly="true"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.director" label="Nombre del director(a)" required :readonly="true"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos de la víctima</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.victimaPaterno"  label="Apellido paterno" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.victimaMaterno" label="Apellido materno" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3">
                                <v-text-field v-model="form.victimaNombre" label="Nombre(s)" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.victimaEdad"  label="Edad" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.victimaSexo" label="Sexo" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3">
                                <v-text-field v-model="form.victimaCodigoRude" label="Código RUDE" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.victimaCarnetIdentidad"  label="Carnet de Identidad" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.victimaComplemento" label="Complemento" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos del(a) agresor(a)</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.agresorPaterno"  label="Apellido paterno" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.agresorMaterno" label="Apellido materno" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3">
                                <v-text-field v-model="form.agresorNombre" label="Nombre(s)" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.agresorEdad"  label="Edad" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.agresorSexo" label="Sexo" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3">
                                <v-text-field v-model="form.agresorCodigoRude" label="Código RUDE" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.agresorCarnetIdentidad"  label="Carnet de Identidad" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3" >
                                <v-text-field v-model="form.agresorComplemento" label="Complemento" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos del caso</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-select v-model="form.tipoViolencia" :items="violenciaTipo" item-title="name" item-value="id" label="Tipo de violencia" return-object :readonly="true"></v-select>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.descripcionHechoDano" label="Descripción del hecho y daño" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <!-- <v-text-field v-model="form.accionRealizada" label="Acciones que se realizaron" hide-details required></v-text-field> -->
                                <v-select v-model="form.accionRealizada" :items="accionTipo" item-title="name" item-value="id" label="Acción realizada" return-object></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <!-- <v-text-field v-model="form.instanciaReferida" label="Instancias a las que se refirió" hide-details required></v-text-field> -->
                                <v-select v-model="form.instanciaReferida" :items="instanciaTipo" item-title="name" item-value="id" label="Instancias a las que se refirió" return-object></v-select>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaComunicacionDistrito" label="Fecha de comunicación a la Dirección Distrital" @input="onDateInput3" placeholder="DD/MM/AAAA" hide-details required></v-text-field>
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
