<script setup lang="ts">
import { ref, onMounted } from "vue";
import ProfitExpanse from "@/components/dashboards/ProfitExpense.vue";
import TrafficDistribution from "@/components/dashboards/TrafficDistribution.vue";
import ProductSales from "@/components/dashboards/ProductSales.vue";
import UpcommingSchedule from "@/components/dashboards/UpcommingSchedule.vue";
import TopPayingClients from "@/components/dashboards/TopPayingClients.vue";
import ProductCards from "@/components/dashboards/ProductCards.vue";
import axios from "axios";

onMounted(async() => {
    console.log("data..........+++++++++");
    // const items = await axios.get('item').then(data => {
    //     console.log(data.data);
    // })
});
</script>

<template>
    <v-row>
        <v-col cols="12" sm="12" lg="8">
            <ProfitExpanse />
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <div class="mb-6">
                <TrafficDistribution/>
            </div>
            <div>
                <ProductSales/>
            </div>
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <UpcommingSchedule/>
        </v-col>
        <v-col cols="12" sm="12" lg="8">
            <TopPayingClients/>
        </v-col>
        <!-- <v-col cols="12" sm="12" lg="12">
            <ProductCards/>
        </v-col> -->
        <v-col class="text-center mt-2">
            <p class="text-muted">Diseñado y desarrollado por <a flat variant="text" href="https://www.minedu.gob.bo/" target="_blank" class="pl-1 text-primary">minedu.gob.bo</a></p>
        </v-col>
    </v-row>
</template>