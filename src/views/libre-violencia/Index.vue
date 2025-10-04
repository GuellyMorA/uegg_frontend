<script setup lang="ts">
import { ref } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
</script>
<template>
    <v-row>    
        <v-col cols="12" lg="3" sm="6">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Registro</v-card-title>
                    </div>
                    <v-row>
                        <v-col cols="12" sm="12">
                            <div class="text-subtitle-1 text-grey100 pb-1" data-v-81e7cbfb="">Adolescentes embarazadas / Uniones a temprana edad</div>
                            <button type="button" class="v-btn v-btn--elevated v-theme--BLUE_THEME bg-primary v-btn--density-default rounded-pill v-btn--size-large v-btn--variant-elevated mt-4 mb-2 px-7" data-v-81e7cbfb="">
                                <span class="v-btn__overlay"></span>
                                <span class="v-btn__underlay"></span>
                                <span class="v-btn__content" data-no-activator=""> Ingresar </span>
                            </button>
                        </v-col>
                    </v-row>
                </v-card-item>
                <img src="@/assets/school-d037249b.png" class="bg-img-1 mt-sm-0 mt-sm-n10" data-v-81e7cbfb="">
            </v-card>
        </v-col>
        <v-col cols="12" lg="3" sm="6">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Seguimiento</v-card-title>
                    </div>
                    <v-row>
                        <v-col cols="12" sm="12">
                            <div class="text-subtitle-1 text-grey100 pb-1" data-v-81e7cbfb="">Actuación para el cumplimiento de derechos</div>
                            <button type="button" class="v-btn v-btn--elevated v-theme--BLUE_THEME bg-primary v-btn--density-default rounded-pill v-btn--size-large v-btn--variant-elevated mt-4 mb-2 px-7" data-v-81e7cbfb="">
                                <span class="v-btn__overlay"></span>
                                <span class="v-btn__underlay"></span>
                                <span class="v-btn__content" data-no-activator=""> Ingresar </span>
                            </button>
                        </v-col>
                    </v-row>
                </v-card-item>
                <img src="@/assets/school-d037249b.png" class="bg-img-1 mt-sm-0 mt-sm-n10" data-v-81e7cbfb="">
            </v-card>
        </v-col>
        <v-col cols="12" lg="3" sm="6">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Seguimiento</v-card-title>
                    </div>
                    <v-row>
                        <v-col cols="12" sm="12">
                            <div class="text-subtitle-1 text-grey100 pb-1" data-v-81e7cbfb="">Situación de riesgo<br><br></div>
                            <button type="button" class="v-btn v-btn--elevated v-theme--BLUE_THEME bg-primary v-btn--density-default rounded-pill v-btn--size-large v-btn--variant-elevated mt-4 mb-2 px-7" data-v-81e7cbfb="">
                                <span class="v-btn__overlay"></span>
                                <span class="v-btn__underlay"></span>
                                <span class="v-btn__content" data-no-activator=""> Ingresar </span>
                            </button>
                        </v-col>
                    </v-row>
                </v-card-item>
                <img src="@/assets/school-d037249b.png" class="bg-img-1 mt-sm-0 mt-sm-n10" data-v-81e7cbfb="">
            </v-card>
        </v-col>
        <v-col cols="12" lg="3" sm="6">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Reportes</v-card-title>
                    </div>
                    <v-row>
                        <v-col cols="12" sm="12">
                            <div class="text-subtitle-1 text-grey100 pb-1" data-v-81e7cbfb=""><br><br></div>
                            <button type="button" class="v-btn v-btn--elevated v-theme--BLUE_THEME bg-primary v-btn--density-default rounded-pill v-btn--size-large v-btn--variant-elevated mt-4 mb-2 px-7" data-v-81e7cbfb="">
                                <span class="v-btn__overlay"></span>
                                <span class="v-btn__underlay"></span>
                                <span class="v-btn__content" data-no-activator=""> Ingresar </span>
                            </button>
                        </v-col>
                    </v-row>
                </v-card-item>
                <img src="@/assets/school-d037249b.png" class="bg-img-1 mt-sm-0 mt-sm-n10" data-v-81e7cbfb="">
            </v-card>
        </v-col>
        <v-col cols="12" md="12"> 
            <UiParentCard title="Herramientas "> 
                <div class=""><p class="text-body-1">Normativa</p></div>
                <div class=""><p class="text-body-1">Formulario de referencia</p></div>
                <div class=""><p class="text-body-1">Constancia de registro</p></div>
                <div class=""><p class="text-body-1">Formulario de denuncia</p></div>
                <div class=""><p class="text-body-1">Constancia de permiso</p></div>
                <div class=""><p class="text-body-1">Constancia de cumplimiento de adecuaciones curriculares</p></div>
                <!--
                <div class="v-col-sm-6 v-col-lg-3 v-col-6">
                    <div class="v-card v-theme--BLUE_THEME v-card--density-default elevation-10 rounded-xl v-card--variant-elevated overflow-visible" data-v-81e7cbfb="">                       
                        <div class="v-card-text position-relative pb-5" data-v-81e7cbfb="">
                            <h5 class="text-h5 mb-1 font-weight-semibold" data-v-81e7cbfb=""> Registro </h5>
                            <div class="text-subtitle-1 text-grey100 pb-1" data-v-81e7cbfb="">Adolescentes embarazadas / Uniones a temprana edad</div>
                            <button type="button" class="v-btn v-btn--elevated v-theme--BLUE_THEME bg-primary v-btn--density-default rounded-pill v-btn--size-large v-btn--variant-elevated mt-4 mb-2 px-7" data-v-81e7cbfb="">
                                <span class="v-btn__overlay"></span>
                                <span class="v-btn__underlay"></span>
                                <span class="v-btn__content" data-no-activator=""> Ingresar </span>
                            </button>
                        </div>
                        <img src="@/assets/school-d037249b.png" class="bg-img-1 mt-sm-0 mt-sm-n10" data-v-81e7cbfb=""><span class="v-card__underlay"></span>
                    </div>
                </div>
                -->
            </UiParentCard>
        </v-col>
    </v-row>
</template>
