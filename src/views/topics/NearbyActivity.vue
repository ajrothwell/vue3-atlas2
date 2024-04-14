<script setup>
  console.log('Nearby.vue setup');
  import { computed } from 'vue';

  import { useNearbyActivityStore } from '@/stores/NearbyActivityStore';
  const NearbyActivityStore = useNearbyActivityStore();

  import useTransforms from '@/composables/useTransforms';
  const { currency, date } = useTransforms();

  // 311
  const nearby311CompareFn = (a, b) => new Date(b.requested_datetime) - new Date(a.requested_datetime);
  const nearby311 = computed(() => NearbyActivityStore.nearby311.data.rows.sort(nearby311CompareFn));//.slice(0, 5));

</script>

<template>
  <section>
    <div class="box">
      See recent activity near your search address including 311 service requests, crimes, zoning appeals, and more. Hover over a record below to highlight it on the map.
    </div>


    <h5 class="subtitle is-5">Service Requests</h5>
    <table class="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>Date</th>
          <th>Location</th>
          <th>Type</th>
          <th>Distance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in nearby311">
          <td>{{ date(item.requested_datetime) }}</td>
          <td>{{ item.address }}</td>
          <td>{{ item.service_name }}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>