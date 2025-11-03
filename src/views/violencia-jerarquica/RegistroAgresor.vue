<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import { VDataTable } from 'vuetify/labs/VDataTable';
import ViolenciaJerarquica from '@/services/ViolenciaJerarquica';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import EstudianteEmbarazo from '@/services/EstudianteEmbarazo';
// import { useNavbarStore } from '@/stores/navbar';
// const store = useNavbarStore();  
// store.setPath('/convivencia/pacifica');
const router = useRouter();

const valid = ref(false);
const dialog = ref(false);
const list = ref();
const dialogSave = ref(false);
const validationErrors = ref();
const victima = ref();
const caso = ref();
const institucionEducativa = ref();
let username: string | null ;

const formSearch = ref({
    codigoRude: '',
    codigoRda: '',
    usuario: ''
});

const form: any = ref({
    numeroCaso: '',
    fechaAgresion: null,
    cantidadAgresor: '',
    numeroAgresor: '',
    codigoRda: null,
    carnetIdentidad: null,
    fechaNacimiento: null,
    complemento: '',
    paterno: '',
    materno: '',
    nombre: '',
    edad: null,
    sexo: '',
    genero: '',
    cargo: '',
    nivel: '',
    direccionActual: '',
    celular: '',
    correo: ''
});

onMounted(async() => {
    let user = JSON.parse(localStorage.getItem('user') || '');
    if(user && user.codigo_sie){
        // findInstitucionEducativa(user.codigo_sie);
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

    // const validaCaso = await ViolenciaJerarquica.findCaso(form.value.numeroCaso).then((res) => {
    //     console.log('res', res);
    //     if(res.status === 200){
    //         if(res.data.length > 0) {
    //             toast.info('caso validado', {
    //                 autoClose: 3000,
    //                 position: toast.POSITION.TOP_RIGHT,
    //             });
    //             caso.value = res.data[0];
    //             return true;
    //         } else {
    //             toast.error('caso no validado', {
    //                 autoClose: 3000,
    //                 position: toast.POSITION.TOP_RIGHT,
    //             });
    //             return false;
    //         }
    //     } else {
    //         toast.error('caso no validado', {
    //             autoClose: 3000,
    //             position: toast.POSITION.TOP_RIGHT,
    //         });
    //         return false;
    //     }
    // });

    // console.log('validaCaso', validaCaso);

    // if(!validaCaso){
    //     return false;
    // }

    // const validaPersona = await ViolenciaJerarquica.findPersonal(form.value).then((res) => {
    //     console.log('res', res);
    //     if(res.status === 200){
    //         if(res.data.length > 0) {
    //             toast.info('Estudiante validado', {
    //                 autoClose: 3000,
    //                 position: toast.POSITION.TOP_RIGHT,
    //             });

    //             form.value.sexo = res.data[0].genero || ' ';
    //             form.value.genero = res.data[0].genero || ' ';
    //             form.value.nivel = res.data[0].nivel;
    //             form.value.cargo = res.data[0].cargo;
    //             return true;
    //         }
    //     } else {
    //         toast.error('Estudiante no validado', {
    //             autoClose: 3000,
    //             position: toast.POSITION.TOP_RIGHT,
    //         });
    //         return false;
    //     }
    // });

    // if(!validaPersona){
    //     return false;
    // }

    // // if (!validateConfirmForm()) {
    // //     dialog.value = false;  
    // //     toast.info('Debe validar los datos del estudiante', {
    // //         autoClose: 3000,
    // //         position: toast.POSITION.TOP_RIGHT,
    // //     });
    // //     return false;
    // // }
    var dateParts = (form.value.fechaNacimiento).split("/");

    const payload = {    
        id_violencia_caso_agresor: null, //caso.value.id,
        cod_rda: form.value.codigoRda,
        num_ci: form.value.carnetIdentidad,
        num_comp: form.value.numeroAgresor,
        apellido_pat_agresor: form.value.paterno,
        apellido_mat_agresor: form.value.materno,
        nombres_agresor: form.value.nombre,
        fec_nac: new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]), 
        sexo: form.value.sexo,
        genero: form.value.genero,
        cargo_ocupa: form.value.cargo,
        nivel: form.value.nivel,
        dir_actual: form.value.direccionActual,
        celular_contacto: form.value.celular,
        correo_electronico: form.value.correo,

        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()
    }
    console.log(payload);

    const save = await ViolenciaJerarquica.createAgresor(payload).then((res) => {
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
        cantidadAgresor: '',
        numeroAgresor: '',
        codigoRda: null,
        carnetIdentidad: null,
        fechaNacimiento: null,
        complemento: '',
        paterno: '',
        materno: '', 
        nombre: '',
        edad: null,
        sexo: '',
        genero: '',
        cargo: '',
        nivel: '',
        direccionActual: '',
        celular: '',
        correo: ''
    };
    dialogSave.value = false;
};

const onDateInput1 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaAgresion = onDateInput(cleanedInput);
};

const onDateInput2 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaNacimiento = onDateInput(cleanedInput);
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

const searchVictimaCodigoRude = async () => {
    console.log(formSearch.value.codigoRude);
    if (!formSearch.value.codigoRude){
        toast.error('Debe ingresar el Código RUDE', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    const res = await ViolenciaJerarquica.findAgresorRude(formSearch.value.codigoRude);
    console.log("res", res);
    if(res.status === 200 && res.data && res.data.length > 0){
        list.value = res.data;
        console.log(res.data);
    } else {
        list.value = null;
    }
};

const searchVictimaCodigoRda = async () => {
    console.log(formSearch.value.codigoRda);
    if (!formSearch.value.codigoRda){
        toast.error('Debe ingresar el Código RDA', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    const res = await ViolenciaJerarquica.findAgresorRude(formSearch.value.codigoRda);
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
    victima.value = item;
    form.value.codigoRda = item.cod_rda;
    form.value.carnetIdentidad = item.num_ci || '';
    form.value.complemento = item.num_comp || '';
    form.value.paterno = item.apellido_pat_agresor;
    form.value.materno = item.apellido_mat_agresor;
    form.value.nombre = item.nombres_agresor;
    form.value.cargo = item.cargo_ocupa;
    form.value.nivel = item.cargo_ocupa;
    form.value.celular = item.celular_contacto;
    form.value.correo = item.correo_electronico;
    form.value.direccionActual = item.dir_actual;

    const dateParts = (item.fec_nac || '').split("/");
    form.value.fechaNacimiento = dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0];
  
    form.value.sexo = item.sexo;
    form.value.genero = item.genero;
};

const headers = [
    { title: 'Cargo', align: 'end', key: 'cargo_ocupa' },
    { title: 'RDA', align: 'end', key: 'cod_rda' },
    { title: 'Nombre', align: 'end', key: 'nombres_agresor' },
    { title: 'Paterno', align: 'end', key: 'apellido_pat_agresor' },
    { title: 'Materno', align: 'end', key: 'apellido_mat_agresor' },
    { title: 'Fecha de Nacimiento', align: 'end', key: 'fec_nac' },
    { title: 'Actions', key: 'actions', sortable: false, align:'center' },
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

    // if (!form.value.numeroCaso) validationErrors.value['numeroCaso'] = true;
    // else delete validationErrors.value['numeroCaso'];

    // if (!form.value.fechaAgresion) validationErrors.value['fechaAgresion'] = true;
    // else delete validationErrors.value['fechaAgresion'];

    // if (!form.value.cantidadAgresor) validationErrors.value['cantidadVictima'] = true;
    // else delete validationErrors.value['cantidadVictima'];

    // if (!form.value.numeroAgresor) validationErrors.value['numeroVictima'] = true;
    // else delete validationErrors.value['numeroVictima'];

    // if (!form.value.codigoRda) validationErrors.value['codigoRude'] = true;
    // else delete validationErrors.value['codigoRude'];

    if (!form.value.carnetIdentidad) validationErrors.value['carnetIdentidad'] = true;
    else delete validationErrors.value['carnetIdentidad'];

    // if (!form.value.complemento) validationErrors.value['complemento'] = true;
    // else delete validationErrors.value['complemento'];

    // if (!form.value.paterno) validationErrors.value['paterno'] = true;
    // else delete validationErrors.value['paterno'];

    if (!form.value.materno) validationErrors.value['materno'] = true;
    else delete validationErrors.value['materno'];

    if (!form.value.nombre) validationErrors.value['nombre'] = true;
    else delete validationErrors.value['nombre'];

    if (!form.value.fechaNacimiento) validationErrors.value['fechaNacimiento'] = true;
    else delete validationErrors.value['fechaNacimiento'];

    if (!form.value.sexo) validationErrors.value['sexo'] = true;
    else delete validationErrors.value['sexo'];

    // if (!form.value.genero) validationErrors.value['genero'] = true;
    // else delete validationErrors.value['genero'];

    if (!form.value.nivel) validationErrors.value['nivel'] = true;
    else delete validationErrors.value['nivel'];

    if (!form.value.direccionActual) validationErrors.value['direccionActual'] = true;
    else delete validationErrors.value['direccionActual'];

    if (!form.value.celular) validationErrors.value['celular'] = true;
    else delete validationErrors.value['celular'];
   
    return !Object.keys(validationErrors.value).length;
};

const searchCaso = async () => {
    if (!form.value.numeroCaso){
        toast.error('Debe ingresar el Código del Caso1', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    const res = await ViolenciaJerarquica.findCaso(form.value.numeroCaso);
    console.log("res", res);
    if(res.status === 200 && res.data && res.data.length > 0){
        caso.value = res.data[0];
        var dateParts = (res.data[0].fec_agresion || '').split("-");
        form.value.fechaAgresion = dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0];
        console.log(res.data);
    } else {
        form.value.fechaAgresion = null;
    }
};

</script>
<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Búsqueda de agresor</v-card-title>
                    </div>
                    <v-form v-model="valid" class="">
                        <v-container>
                        <v-row>
                            <!-- <v-col cols="12" md="4">
                                <v-text-field v-model="formSearch.codigoRude" density="compact" variant="solo" label="Código RUDE" append-inner-icon="mdi-magnify" single-line hide-details  @click:append-inner="searchVictimaCodigoRude" ></v-text-field>
                            </v-col> -->
                            <v-col cols="12" md="12">
                                <v-text-field v-model="formSearch.codigoRda" density="compact" variant="solo" label="Código RDA" append-inner-icon="mdi-magnify" single-line hide-details  @click:append-inner="searchVictimaCodigoRda" ></v-text-field>
                            </v-col>
                            <!-- <v-col cols="12" md="4">
                                <v-text-field v-model="formSearch.usuario" density="compact" variant="solo" label="Usuario" append-inner-icon="mdi-magnify" single-line hide-details  @click:append-inner="searchVictimaUsuario" ></v-text-field>
                            </v-col> -->
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
                        <v-card-title class="text-h5">Agresores</v-card-title>
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
                        <v-card-title class="text-h5">Registro de agresor(es) </v-card-title>
                    </div>
                    <v-form v-model="valid" class="">
                        <v-container>
                        <v-row>
                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos del agresor</span>
                                </div>
                            </v-col>
                            <!-- <v-col cols="12" md="4">
                                <v-text-field v-model="form.numeroCaso" label="Número de caso" append-inner-icon="mdi-magnify" hide-details @click:append-inner="searchCaso" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaAgresion" label="Fecha de la agresión" @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details required :readonly="true"></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.cantidadAgresor" type="number" label="Número de agresores" hide-details required></v-text-field>
                            </v-col> -->
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.numeroAgresor" type="number" label="Agresor Nro." hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.codigoRda" label="Código RDA" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.carnetIdentidad" type="number" label="Número de C.I." hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.complemento"  label="Complemento" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.paterno" label="Apellido Paterno" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.materno" label="Apellido Materno" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.nombre" label="Nombre(s)" hide-details required></v-text-field>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaNacimiento" label="Fecha de nacimiento" @input="onDateInput2" placeholder="DD/MM/AAAA" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.edad" type="number" label="Edad" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.sexo" label="Sexo F/M" hide-details required></v-text-field>
                            </v-col>

                            <!-- <v-col cols="12" md="4" >
                                <v-text-field v-model="form.genero" label="Género" hide-details required></v-text-field>
                            </v-col> -->

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.cargo" label="Cargo que ocupa" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.nivel" label="Nivel" hide-details required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.celular" type="number" label="Celular de contacto" hide-details required></v-text-field>
                            </v-col>   

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.correo" label="Correo electrónico" hide-details required></v-text-field>
                            </v-col>    

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.direccionActual" label="Dirección actual" hide-details required></v-text-field>
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