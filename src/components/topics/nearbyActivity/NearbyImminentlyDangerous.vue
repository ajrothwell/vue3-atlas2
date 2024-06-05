<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { point, featureCollection } from '@turf/helpers';

import { useNearbyActivityStore } from '@/stores/NearbyActivityStore';
const NearbyActivityStore = useNearbyActivityStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();
const map = MapStore.map;

import IntervalDropdown from '@/components/topics/nearbyActivity/IntervalDropdown.vue';
import useTransforms from '@/composables/useTransforms';
const { date, timeReverseFn } = useTransforms();
import useScrolling from '@/composables/useScrolling';
const { handleRowMouseover, handleRowMouseleave } = useScrolling();

const loadingData = computed(() => NearbyActivityStore.loadingData );

const timeIntervalSelected = ref(30);

const timeIntervals = reactive(
  {
    30: 'the last 30 days',
    90: 'the last 90 days',
    365: '1 year',
  }
)

const setTimeInterval = (e) => timeIntervalSelected.value = e;

const nearbyImminentlyDangerous = computed(() => {
  if (NearbyActivityStore.nearbyImminentlyDangerous) {
    let data = [ ...NearbyActivityStore.nearbyImminentlyDangerous.rows]
      .filter(item => {
      let itemDate = new Date(item.casecreateddate);
      let now = new Date();
      let timeDiff = now - itemDate;
      let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return daysDiff <= timeIntervalSelected.value;
    })
    data.sort((a, b) => timeReverseFn(a, b, 'casecreateddate'))
    return data;
  }
});
const nearbyImminentlyDangerousGeojson = computed(() => {
  if (!nearbyImminentlyDangerous.value) return [point([0,0])];
  return nearbyImminentlyDangerous.value.map(item => point([item.lng, item.lat], { id: item.casenumber, type: 'nearbyImminentlyDangerous' }));
})
watch (() => nearbyImminentlyDangerousGeojson.value, (newGeojson) => { map.getSource('nearby').setData(featureCollection(newGeojson)) });

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

onMounted(() => { if (!NearbyActivityStore.loadingData && nearbyImminentlyDangerousGeojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearbyImminentlyDangerousGeojson.value)) }});
onBeforeUnmount(() => { if (map.getSource('nearby')) { map.getSource('nearby').setData(featureCollection([point([0,0])])) }});

const nearbyImminentlyDangerousTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Date',
        field: 'casecreateddate',
        type: 'date',
        dateInputFormat: "yyyy-MM-dd'T'HH:mm:ssX",
        dateOutputFormat: 'MM/dd/yyyy',
      },
      {
        label: 'Location',
        field: 'address',
      },
      {
        label: 'Type',
        field: 'link',
        html: true,
      },
      {
        label: 'Distance',
        field: 'distance_ft',
      }
    ],
    rows: nearbyImminentlyDangerous.value || [],
  }
});

{/* <table class="table is-fullwidth is-striped">
v-for="item in nearbyImminentlyDangerous"
:key="item.casenumber"
:id="item.casenumber"
@mouseover="handleRowMouseover"
@mouseleave="handleRowMouseleave"
:class="hoveredStateId == item.casenumber ? 'active-hover' : 'inactive'"
>
<td>{{ date(item.casecreateddate) }}</td>
<td>{{ item.address }}</td>
<td v-html="`<a target='_blank' href='https://li.phila.gov/property-history/search/violation-detail?address=${item.address}&Id=${item.casenumber}'>${item.casestatus}</a>`"></td>
<td>{{ (item.distance * 3.28084).toFixed(0) }} ft</td>
</tr>
</tbody>
</table> */}

</script>

<template>
  
  <IntervalDropdown
    :timeIntervals="timeIntervals"
    @setTimeInterval="setTimeInterval"
  ></IntervalDropdown>
  <div class="mt-5">
    <h5 class="subtitle is-5">Imminently Dangerous ({{ nearbyImminentlyDangerousTableData.rows.length }})</h5>
    <div class="horizontal-table">
      <vue-good-table
        id="nearbyImminentlyDangerous"
        :columns="nearbyImminentlyDangerousTableData.columns"
        :rows="nearbyImminentlyDangerousTableData.rows"
        :row-style-class="row => hoveredStateId === row.casenumber ? 'active-hover ' + row.casenumber : 'inactive ' + row.casenumber"
        style-class="table"
        @row-mouseenter="handleRowMouseover($event, 'casenumber')"
        @row-mouseleave="handleRowMouseleave"
      >
        <template #emptystate>
          <div v-if="NearbyActivityStore.loadingData">
            Loading nearby imminently dangerous properties... <font-awesome-icon icon='fa-solid fa-spinner fa-spin'></font-awesome-icon>
          </div>
          <div v-else>
            No nearby imminently dangerous properties found
          </div>
        </template>
      </vue-good-table>
    </div>
  </div>
</template>

<style scoped>

@media 
only screen and (max-width: 760px),
(min-device-width: 768px) and (max-device-width: 1024px)  {
	/*Label the data*/

	td:nth-of-type(1):before { content: "Date"; }
	td:nth-of-type(2):before { content: "Location"; }
	td:nth-of-type(3):before { content: "Status"; }
	td:nth-of-type(4):before { content: "Distance"; }
}

</style>