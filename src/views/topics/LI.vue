<script setup>
  console.log('LI.vue setup');
  import { computed } from 'vue';

  import { useLiStore } from '@/stores/LiStore';
  const LiStore = useLiStore();

  const permits = computed(() => {
    return LiStore.liPermits.rows.slice(0, 5);
  });

</script>

<template>
  <section>
    <div class="box">
      Licenses, inspections, permits, property maintenance violations, and zoning permit documents at your search address. Source: Department of Licenses & Inspections
    </div>

    <!-- Li Permits Table -->
    <h5 class="subtitle is-5">Permits</h5>
    <table class="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>ID</th>
          <th>Description</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in permits">
          <td>{{ item.permitissuedate }}</td>
          <td>{{ item.permitnumber }}</td>
          <td>{{ item.permitdescription }}</td>
          <td>{{ item.status }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>