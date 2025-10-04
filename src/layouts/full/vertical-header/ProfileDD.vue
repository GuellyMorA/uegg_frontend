<script setup lang="ts">
import { UserIcon, MailIcon, ListCheckIcon } from 'vue-tabler-icons';
import { useRouter } from "vue-router";

const router = useRouter();

const logout = async (event: any) => {
    localStorage.removeItem("user");    
    router.push('/auth/login');
};


</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- notifications DD -->
    <!-- ---------------------------------------------- -->
<!-- 
    <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
            <v-btn class="" variant="text" v-bind="props" icon>
                <v-avatar size="35">
                    <img src="@/assets/images/pdf.png" height="35" alt="user" />
                </v-avatar>
                
            </v-btn>
       
          
        </v-row> -->

<!--        </template> 
         <v-sheet rounded="xl" width="200" elevation="10" class="mt-2">
           
             <div class="pt-4 pb-4 px-5 text-center">
                <v-btn to="" color="primary" variant="outlined" class="rounded-pill" block @click="logout">Descargar</v-btn>
            </div>
            
        </v-sheet>-->
<!--    </v-menu>--> 

    <!-- ---------------------------------------------- -->
    <!-- notifications DD -->
    <!-- ---------------------------------------------- -->
   
    <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
            <v-btn class="" variant="text" v-bind="props" icon>
                <v-avatar size="35">
                    <img src="@/assets/images/cerrar.png" height="35" alt="user" />
                </v-avatar>
            </v-btn>
        </template>
        <v-sheet rounded="xl" width="200" elevation="10" class="mt-2">
           
            <div class="pt-4 pb-4 px-5 text-center">
                <v-btn to="" color="primary" variant="outlined" class="rounded-pill" block @click="logout">Salir</v-btn>
            </div>
            
        </v-sheet>
    </v-menu>
</template>
